"""
Auth routes — HTTP layer only. Each route validates the request shape
via its Pydantic schema, delegates to `auth_controller` for the actual
logic, and shapes the response via the appropriate Response schema.
"""

from fastapi import APIRouter, Depends, status
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.auth import LoginRequest, TokenResponse
from app.controllers import auth_controller
from app.utils.auth import get_current_user, get_optional_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new admin/staff user (superadmin only, except the first-ever user)",
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    requesting_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Create a new user account.

    Normally requires a valid superadmin Bearer token. The one
    exception: if the `users` table is completely empty (a brand-new
    database with no bootstrap script), registration is open so the
    very first superadmin account can be created at all. That
    exception closes permanently the moment one user exists — see
    auth_controller.register_user() for the actual check.
    """
    return auth_controller.register_user(db, user_in, requesting_user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in with username/email + password",
)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """
    Verify credentials and issue a JWT access token. `identifier` can be
    either the username or the email address.
    """
    user = auth_controller.authenticate_user(db, login_in)
    access_token, expires_in = auth_controller.create_token_for_user(user)
    return TokenResponse(access_token=access_token, expires_in=expires_in)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently logged-in user (protected route)",
)
def read_current_user(current_user: User = Depends(get_current_user)):
    """
    Example protected route. Requires a valid Bearer token — this is
    what proves `get_current_user` is wired up correctly. In Swagger,
    click "Authorize", paste in the access token from /auth/login, then
    call this route to see it resolve back to your own user record.
    """
    return current_user


@router.get(
    "/users",
    response_model=list[UserResponse],
    summary="List all user accounts (superadmin only)",
    dependencies=[Depends(require_role("superadmin"))],
)
def list_users(db: Session = Depends(get_db)):
    return auth_controller.list_users(db)


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update a user account (superadmin only)",
    dependencies=[Depends(require_role("superadmin"))],
)
def update_user(
    user_id: int,
    user_in: "UserUpdate",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return auth_controller.update_user(db, user_id, user_in, current_user)


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user account (superadmin only)",
    dependencies=[Depends(require_role("superadmin"))],
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auth_controller.delete_user(db, user_id, current_user)
