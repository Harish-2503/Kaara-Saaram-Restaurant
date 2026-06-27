"""
Pydantic schemas for the User resource (admin/staff accounts).

Three separate schemas, matching the three different shapes the API
will need:
    - UserCreate  -> what's required to register a new admin/staff user
    - UserUpdate  -> what's allowed to change later (all optional)
    - UserResponse -> what's safe to send back to the client (never the password)
"""

import re
from typing import Optional
from pydantic import EmailStr, Field, field_validator

from app.schemas.base import ORMBase, TimestampMixin
from app.models.user import UserRole


class UserCreate(ORMBase):
    """Used when registering a new user. Plain password in, hashed before saving."""

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=100)
    role: UserRole = UserRole.STAFF

    @field_validator("username")
    @classmethod
    def username_must_be_alphanumeric(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_.-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, underscores, dots, and hyphens"
            )
        return v

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class UserUpdate(ORMBase):
    """Used for partial updates. Every field optional — only send what changes."""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

    @field_validator("username")
    @classmethod
    def username_must_be_alphanumeric(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.match(r"^[a-zA-Z0-9_.-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, underscores, dots, and hyphens"
            )
        return v

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v)):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class UserResponse(ORMBase, TimestampMixin):
    """What gets sent back to the client. No password field, ever."""

    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
