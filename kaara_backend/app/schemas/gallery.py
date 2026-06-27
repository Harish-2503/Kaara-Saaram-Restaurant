"""
Pydantic schemas for the Gallery resource (photo gallery entries).
"""

from typing import Optional
from pydantic import Field, field_validator

from app.schemas.base import ORMBase, TimestampMixin


class GalleryCreate(ORMBase):
    """Used when an admin uploads/adds a new gallery image."""

    title: Optional[str] = Field(None, max_length=150)
    caption: Optional[str] = Field(None, max_length=1000)
    image_url: str = Field(..., max_length=255)

    category: Optional[str] = Field(None, max_length=80)
    display_order: int = Field(0, ge=0)
    is_published: bool = True

    @field_validator("image_url")
    @classmethod
    def image_url_must_look_valid(cls, v: str) -> str:
        if not (v.startswith("http://") or v.startswith("https://") or v.startswith("/")):
            raise ValueError("image_url must be an absolute URL or start with '/'")
        return v


class GalleryUpdate(ORMBase):
    """Used for partial updates. Every field optional — only send what changes."""

    title: Optional[str] = Field(None, max_length=150)
    caption: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = Field(None, max_length=255)

    category: Optional[str] = Field(None, max_length=80)
    display_order: Optional[int] = Field(None, ge=0)
    is_published: Optional[bool] = None

    @field_validator("image_url")
    @classmethod
    def image_url_must_look_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not (v.startswith("http://") or v.startswith("https://") or v.startswith("/")):
            raise ValueError("image_url must be an absolute URL or start with '/'")
        return v


class GalleryResponse(ORMBase, TimestampMixin):
    """What gets sent back to the client."""

    id: int
    title: Optional[str] = None
    caption: Optional[str] = None
    image_url: str

    category: Optional[str] = None
    display_order: int
    is_published: bool
    created_by_id: Optional[int] = None
