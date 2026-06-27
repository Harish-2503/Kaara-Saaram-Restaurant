"""
Pydantic schemas for the Offer resource (promotions/discounts).
"""

from decimal import Decimal
from datetime import date
from typing import Optional, Literal
from pydantic import Field, model_validator

from app.schemas.base import ORMBase, TimestampMixin

DiscountType = Literal["percentage", "flat"]


class OfferCreate(ORMBase):
    """Used when an admin creates a new promotional offer."""

    title: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)

    discount_type: DiscountType = "percentage"
    discount_value: Decimal = Field(..., gt=0)

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    is_active: bool = True
    banner_image_url: Optional[str] = Field(None, max_length=255)

    @model_validator(mode="after")
    def validate_discount_and_dates(self):
        if self.discount_type == "percentage" and self.discount_value > 100:
            raise ValueError("Percentage discount_value cannot exceed 100")
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class OfferUpdate(ORMBase):
    """Used for partial updates. Every field optional — only send what changes."""

    title: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)

    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = Field(None, gt=0)

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    is_active: Optional[bool] = None
    banner_image_url: Optional[str] = Field(None, max_length=255)

    @model_validator(mode="after")
    def validate_discount_and_dates(self):
        if (
            self.discount_type == "percentage"
            and self.discount_value is not None
            and self.discount_value > 100
        ):
            raise ValueError("Percentage discount_value cannot exceed 100")
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date cannot be earlier than start_date")
        return self


class OfferResponse(ORMBase, TimestampMixin):
    """What gets sent back to the client."""

    id: int
    title: str
    description: Optional[str] = None

    discount_type: DiscountType
    discount_value: Decimal

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    is_active: bool
    banner_image_url: Optional[str] = None
    created_by_id: Optional[int] = None
