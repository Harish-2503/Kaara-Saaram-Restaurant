"""
Pydantic schemas for Authentication.

These aren't tied to a single model the way the other schema files are —
they shape the login request/response and the JWT payload instead.

    - LoginRequest    -> what the client sends to POST /auth/login
    - TokenResponse   -> what the server sends back after a successful login
    - TokenPayload    -> the shape of the data encoded inside the JWT itself
    - PasswordChange  -> what's needed for a logged-in user to change their own password
"""

import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.base import ORMBase


class LoginRequest(ORMBase):
    """Sent by the client to log in. Accepts either username or email in `identifier`."""

    identifier: str = Field(
        ..., min_length=3, max_length=120, description="Username or email address"
    )
    password: str = Field(..., min_length=8, max_length=128)


class TokenResponse(ORMBase):
    """Sent back to the client after a successful login."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Seconds until the access token expires")


class TokenPayload(BaseModel):
    """
    The decoded shape of the JWT payload (the `sub`, `exp`, etc claims).
    Used internally when verifying a token — not exposed to API clients.
    """

    sub: str  # subject — the user's id, stored as a string per JWT spec
    role: str
    exp: int  # expiry, as a unix timestamp


class PasswordChange(ORMBase):
    """Used by a logged-in user to change their own password."""

    current_password: str = Field(..., min_length=8, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def new_password_must_be_strong(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v
