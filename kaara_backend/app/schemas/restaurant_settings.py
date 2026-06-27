"""
Pydantic schemas for the RestaurantSettings resource.

Note: there is intentionally no `RestaurantSettingsCreate` schema.
This table holds a single settings row per site (`site_key="default"`),
which gets seeded once (e.g. via a migration or startup script) rather
than created through a normal "create" flow. The admin Settings panel
only ever needs to read and update it.
"""

import re
from typing import Optional
from pydantic import Field, field_validator, model_validator
from datetime import time

from app.schemas.base import ORMBase, TimestampMixin

_PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{7,20}$")
_URL_RE = re.compile(r"^https?://")


class RestaurantSettingsUpdate(ORMBase):
    """Used by the admin Settings panel. Every field optional — only send what changes."""

    restaurant_name: Optional[str] = Field(None, min_length=2, max_length=150)
    tagline: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)

    phone_primary: Optional[str] = Field(None, max_length=20)
    phone_secondary: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=120)
    address: Optional[str] = Field(None, max_length=1000)

    opening_time: Optional[time] = None
    closing_time: Optional[time] = None

    instagram_url: Optional[str] = Field(None, max_length=255)
    facebook_url: Optional[str] = Field(None, max_length=255)
    google_maps_url: Optional[str] = Field(None, max_length=255)

    accepts_reservations: Optional[bool] = None
    maintenance_mode: Optional[bool] = None

    @field_validator("phone_primary", "phone_secondary")
    @classmethod
    def phone_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _PHONE_RE.match(v):
            raise ValueError("Enter a valid phone number (digits, spaces, +, -, parentheses only)")
        return v

    @field_validator("instagram_url", "facebook_url", "google_maps_url")
    @classmethod
    def social_url_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not _URL_RE.match(v):
            raise ValueError("URL must start with http:// or https://")
        return v

    @model_validator(mode="after")
    def closing_after_opening(self):
        if self.opening_time and self.closing_time and self.closing_time <= self.opening_time:
            raise ValueError(
                "closing_time must be after opening_time "
                "(for overnight hours, this will be supported separately later)"
            )
        return self


class RestaurantSettingsResponse(ORMBase, TimestampMixin):
    """What gets sent back to the client."""

    id: int
    site_key: str
    restaurant_name: str
    tagline: Optional[str] = None
    description: Optional[str] = None

    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

    opening_time: Optional[time] = None
    closing_time: Optional[time] = None

    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    google_maps_url: Optional[str] = None

    accepts_reservations: bool
    maintenance_mode: bool
