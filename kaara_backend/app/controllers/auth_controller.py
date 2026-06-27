"""
Auth controller — the business logic behind registration and login.

Kept separate from `routes/auth.py` on purpose: routes only handle the
HTTP shape of a request (status codes, response models) and delegate
the actual work here. This makes the logic unit-testable without
spinning up FastAPI at all, and keeps routes thin.
"""

from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest
from app.utils.auth import hash_password, verify_password, create_access_token


def register_user(db: Session, user_in: UserCreate, requesting_user: Optional[User] = None) -> User:
    """
    Create a new admin/staff user.

    Access rule: registration is superadmin-only — EXCEPT for the very
    first user ever created. If the `users` table is empty, anyone may
    register (this is how the first superadmin account gets created on
    a brand-new database with no bootstrap script). The moment one user
    exists, this exception closes permanently and a superadmin token is
    required for every subsequent registration (enforced by
    require_role("superadmin") at the route level in routes/auth.py).

    Raises 403 if the table is non-empty and the caller isn't a
    superadmin. Raises 409 Conflict if the username or email is already
    taken — checked here (not just relying on the DB's unique
    constraint) so we can return a clear, specific error message
    instead of a raw IntegrityError.
    """
    user_count = db.query(User).count()
    is_bootstrap = user_count == 0

    if not is_bootstrap:
        if requesting_user is None or requesting_user.role != UserRole.SUPERADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only a superadmin can register new users",
            )

    existing = (
        db.query(User)
        .filter(or_(User.username == user_in.username, User.email == user_in.email))
        .first()
    )
    if existing is not None:
        if existing.username == user_in.username:
            detail = "Username is already taken"
        else:
            detail = "Email is already registered"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db: Session, login_in: LoginRequest) -> User:
    """
    Verify a login attempt's credentials and return the matching User.

    `identifier` may be either a username or an email — we check both
    columns. Raises 401 Unauthorized on any failure (wrong identifier,
    wrong password, or a deactivated account) using the *same* generic
    message in the wrong-identifier / wrong-password cases, so a client
    can't use the error message to figure out whether a given username
    exists in the system.
    """
    user = (
        db.query(User)
        .filter(or_(User.username == login_in.identifier, User.email == login_in.identifier))
        .first()
    )

    invalid_credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username/email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if user is None:
        raise invalid_credentials_exception

    if not verify_password(login_in.password, user.hashed_password):
        raise invalid_credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated",
        )

    return user


def create_token_for_user(user: User) -> tuple[str, int]:
    """
    Issue a JWT access token for an already-authenticated user.
    Returns (token, expires_in_seconds), matching what TokenResponse needs.
    """
    return create_access_token(subject=str(user.id), role=user.role.value)


def list_users(db: Session) -> list[User]:
    """
    Return every user account, newest first. Read-only — used by the
    admin "Users" panel's list view. Route-level access control
    (superadmin only) is enforced via require_role() in routes/auth.py,
    not here.
    """
    return db.query(User).order_by(User.created_at.desc()).all()


def update_user(db: Session, user_id: int, user_in, current_user) -> User:
    """
    Update an existing user's details (role, name, email, active status).
    Superadmin cannot deactivate or change the role of their own account.
    """
    from app.utils.auth import hash_password

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Prevent superadmin from locking themselves out
    if user.id == current_user.id:
        if user_in.is_active is False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
        if user_in.role is not None and user_in.role.value != "superadmin":
            raise HTTPException(status_code=400, detail="You cannot change your own role")

    data = user_in.model_dump(exclude_unset=True)

    # Hash the new password if one was provided
    if "password" in data:
        data["hashed_password"] = hash_password(data.pop("password"))

    for key, value in data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int, current_user) -> None:
    """
    Permanently delete a user account.
    Superadmin cannot delete their own account.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    db.delete(user)
    db.commit()
