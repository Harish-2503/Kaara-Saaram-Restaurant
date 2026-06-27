"""
FastAPI dependency types and helpers shared across routes.
"""
from typing import Annotated, Callable
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.auth import get_current_user

# Annotated type alias — lets route functions declare `db: DBSession`
# instead of the more verbose `db: Session = Depends(get_db)` every time.
DBSession = Annotated[Session, Depends(get_db)]


def require_role(*roles: str) -> Callable:
    """
    Dependency factory: ensures the current user has one of the given roles.
    Usage: current_user: User = Depends(require_role("admin", "superadmin"))
    """
    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: {', '.join(roles)}",
            )
        return current_user
    return _checker
