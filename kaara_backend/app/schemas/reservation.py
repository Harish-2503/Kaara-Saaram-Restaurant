"""
Pydantic schemas for the Reservation resource (customer table bookings).
"""

import re
from datetime import date, time, datetime, timezone
from typing import Optional
from pydantic import EmailStr, Field, field_validator

from app.schemas.base import ORMBase, TimestampMixin
from app.models.reservation import ReservationStatus

# Simple, permissive phone validator: digits, spaces, +, -, parentheses, 7-15 digits total
_PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


class ReservationCreate(ORMBase):
    """Used when a customer submits a booking request from the public site."""

    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: Optional[EmailStr] = None
    customer_phone: str = Field(..., max_length=20)

    reservation_date: date
    reservation_time: time
    party_size: int = Field(..., ge=1, le=50)
    special_requests: Optional[str] = Field(None, max_length=1000)

    @field_validator("customer_phone")
    @classmethod
    def phone_must_be_valid(cls, v: str) -> str:
        if not _PHONE_RE.match(v):
            raise ValueError("Enter a valid phone number (digits, spaces, +, -, parentheses only)")
        digits_only = re.sub(r"\D", "", v)
        if not (7 <= len(digits_only) <= 15):
            raise ValueError("Phone number must contain between 7 and 15 digits")
        return v

    @field_validator("reservation_date")
    @classmethod
    def date_must_not_be_in_the_past(cls, v: date) -> date:
        if v < datetime.now(timezone.utc).date():
            raise ValueError("reservation_date cannot be in the past")
        return v


class ReservationUpdate(ORMBase):
    """
    Used for partial updates — mainly by admin staff to confirm, reschedule,
    or cancel a booking. Every field optional — only send what changes.
    """

    customer_name: Optional[str] = Field(None, min_length=2, max_length=100)
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = Field(None, max_length=20)

    reservation_date: Optional[date] = None
    reservation_time: Optional[time] = None
    party_size: Optional[int] = Field(None, ge=1, le=50)
    special_requests: Optional[str] = Field(None, max_length=1000)

    status: Optional[ReservationStatus] = None
    handled_by_id: Optional[int] = None

    @field_validator("customer_phone")
    @classmethod
    def phone_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not _PHONE_RE.match(v):
            raise ValueError("Enter a valid phone number (digits, spaces, +, -, parentheses only)")
        digits_only = re.sub(r"\D", "", v)
        if not (7 <= len(digits_only) <= 15):
            raise ValueError("Phone number must contain between 7 and 15 digits")
        return v


class ReservationResponse(ORMBase, TimestampMixin):
    """What gets sent back to the client."""

    id: int
    customer_name: str
    customer_email: Optional[EmailStr] = None
    customer_phone: str

    reservation_date: date
    reservation_time: time
    party_size: int
    special_requests: Optional[str] = None

    status: ReservationStatus
    handled_by_id: Optional[int] = None
