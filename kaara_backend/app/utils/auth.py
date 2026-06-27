"""
Low-level authentication utilities: password hashing and JWT
generation/verification.

This module has no knowledge of FastAPI, routes, or the database — it
only deals with bytes, strings, and tokens. That keeps it independently
testable and reusable from anywhere (controllers, scripts, tests).

Note on bcrypt: we call the `bcrypt` library directly rather than going
through `passlib`. `passlib`'s bcrypt backend reads a `bcrypt.__about__`
attribute that recent bcrypt versions (>=4.1) no longer ship, which
breaks hashing entirely. Calling `bcrypt` directly avoids that problem
and has fewer moving parts.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.config import settings

# bcrypt has a hard 72-byte limit on the input password. We enforce a
# slightly lower character limit in the Pydantic schemas (128 chars),
# but truncate defensively here too in case this function is ever
# called directly with something longer.
_BCRYPT_MAX_BYTES = 72


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------


def hash_password(plain_password: str) -> str:
    """
    Hash a plain-text password for storage. Returns a string safe to
    store in the `users.hashed_password` column.
    """
    password_bytes = plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check a plain-text password against a stored bcrypt hash.
    Returns False (never raises) if the comparison fails for any reason,
    including a malformed/empty hash.
    """
    try:
        password_bytes = plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# JWT generation
# ---------------------------------------------------------------------------


def create_access_token(
    subject: str,
    role: str,
    expires_minutes: Optional[int] = None,
) -> tuple[str, int]:
    """
    Create a signed JWT access token.

    `subject` is the user id (stored as the `sub` claim, per JWT spec —
    must be a string). `role` is embedded so route dependencies can do
    coarse role checks without hitting the database on every request.

    Returns a tuple of (encoded_token, expires_in_seconds) so the route
    can report `expires_in` back to the client without recomputing it.
    """
    minutes = expires_minutes if expires_minutes is not None else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire_delta = timedelta(minutes=minutes)
    expire_at = datetime.now(timezone.utc) + expire_delta

    payload = {
        "sub": subject,
        "role": role,
        "exp": expire_at,
    }

    encoded_token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_token, int(expire_delta.total_seconds())


# ---------------------------------------------------------------------------
# JWT verification
# ---------------------------------------------------------------------------


class TokenError(Exception):
    """Raised when a token is missing, malformed, expired, or otherwise invalid."""


def decode_access_token(token: str) -> dict:
    """
    Decode and verify a JWT access token.

    Raises TokenError if the token is invalid or expired. python-jose
    already checks the `exp` claim automatically during `jwt.decode`,
    raising `ExpiredSignatureError` (a subclass of `JWTError`) if it has
    passed — we normalize that into our own `TokenError` so callers
    (the `get_current_user` dependency) don't need to import jose.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise TokenError(f"Invalid or expired token: {exc}") from exc

    if "sub" not in payload or "role" not in payload:
        raise TokenError("Token payload is missing required claims")

    return payload


# ---------------------------------------------------------------------------
# Current user dependency (FastAPI)
# ---------------------------------------------------------------------------

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User

# tokenUrl points Swagger's "Authorize" button at our login route, so
# the docs UI can request a token and attach it to subsequent requests
# automatically.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that resolves the JWT bearer token on the request
    into the actual `User` row. Use this on any route that should only
    be reachable by a logged-in user:

        @router.get("/protected")
        def protected_route(current_user: User = Depends(get_current_user)):
            ...

    Raises 401 if the token is missing/invalid/expired, the user no
    longer exists, or the account has been deactivated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
    except TokenError:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id_int).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    return user


def get_optional_current_user(
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Like get_current_user, but returns None instead of raising 401 when
    no token is supplied at all. If a token IS supplied, it's still
    fully validated — an invalid/expired/garbage token still raises 401
    rather than silently being treated as "no user". This distinction
    matters for routes like POST /auth/register, which behave
    differently for an anonymous bootstrap request (no token at all)
    versus a logged-in non-superadmin trying to register someone else
    (has a token, but the wrong role) — the latter should still 403,
    not be treated as anonymous.
    """
    if token is None:
        return None
    return get_current_user(token=token, db=db)


def require_role(*allowed_roles):
    """
    Dependency factory for role-gated routes. Returns a FastAPI
    dependency that first resolves the current user (same checks as
    get_current_user — valid token, active account), then raises 403
    if their role isn't in `allowed_roles`.

    Usage:
        @router.post("/users", dependencies=[Depends(require_role("superadmin"))])
        def create_user(...):
            ...

    `allowed_roles` accepts plain strings (e.g. "superadmin", "admin")
    so call sites don't need to import the UserRole enum.
    """

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return dependency
