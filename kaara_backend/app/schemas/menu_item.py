"""
Menu item schemas.

Mirrors the full MenuItem model including South-Indian-specific fields
(tamil_name, spice_level, prep_time_minutes, is_chef_recommended).
"""
from __future__ import annotations

import re
from typing import Optional, List

from pydantic import BaseModel, field_validator, model_validator

from app.schemas.base import ORMBase, TimestampMixin


# ─── shared field constraints (reused in Create + Update validators) ───────────

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

VALID_CATEGORIES = {
    "starters",
    "rice",
    "breads",
    "curries",
    "seafood",
    "desserts",
    "beverages",
    "sides",
}


# ─── create ────────────────────────────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str
    tamil_name: Optional[str] = None
    slug: str
    description: Optional[str] = None
    category: str
    price: float
    offer_price: Optional[float] = None
    ingredients: Optional[str] = None
    spice_level: Optional[int] = None          # 1–5
    prep_time_minutes: Optional[int] = None
    is_available: bool = True
    is_chef_recommended: bool = False
    image_url: Optional[str] = None

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: str) -> str:
        if not SLUG_RE.match(v):
            raise ValueError(
                "slug must be lowercase hyphenated (e.g. chettinad-chicken-biryani)"
            )
        return v

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(
                f"category must be one of: {', '.join(sorted(VALID_CATEGORIES))}"
            )
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("price must be greater than 0")
        return v

    @field_validator("spice_level")
    @classmethod
    def spice_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("spice_level must be between 1 and 5")
        return v

    @field_validator("prep_time_minutes")
    @classmethod
    def prep_time_positive(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 1:
            raise ValueError("prep_time_minutes must be at least 1")
        return v

    @model_validator(mode="after")
    def offer_price_lower_than_price(self) -> "MenuItemCreate":
        if self.offer_price is not None and self.offer_price >= self.price:
            raise ValueError("offer_price must be less than price")
        return self


# ─── update (all fields optional, re-validated if present) ────────────────────

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    tamil_name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    offer_price: Optional[float] = None
    ingredients: Optional[str] = None
    spice_level: Optional[int] = None
    prep_time_minutes: Optional[int] = None
    is_available: Optional[bool] = None
    is_chef_recommended: Optional[bool] = None
    image_url: Optional[str] = None

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not SLUG_RE.match(v):
            raise ValueError(
                "slug must be lowercase hyphenated (e.g. chettinad-chicken-biryani)"
            )
        return v

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(
                f"category must be one of: {', '.join(sorted(VALID_CATEGORIES))}"
            )
        return v

    @field_validator("price")
    @classmethod
    def price_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("price must be greater than 0")
        return v

    @field_validator("spice_level")
    @classmethod
    def spice_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 5):
            raise ValueError("spice_level must be between 1 and 5")
        return v

    @model_validator(mode="after")
    def offer_price_lower_than_price(self) -> "MenuItemUpdate":
        # Only validate cross-field if both are provided in this update
        if self.offer_price is not None and self.price is not None:
            if self.offer_price >= self.price:
                raise ValueError("offer_price must be less than price")
        return self


# ─── response ──────────────────────────────────────────────────────────────────

class MenuItemResponse(ORMBase, TimestampMixin):
    id: int
    name: str
    tamil_name: Optional[str]
    slug: str
    description: Optional[str]
    category: str
    price: float
    offer_price: Optional[float]
    ingredients: Optional[str]
    spice_level: Optional[int]
    prep_time_minutes: Optional[int]
    is_available: bool
    is_chef_recommended: bool
    image_url: Optional[str]
    created_by_id: Optional[int]


# ─── paginated list wrapper ────────────────────────────────────────────────────

class MenuItemListResponse(BaseModel):
    items: List[MenuItemResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
