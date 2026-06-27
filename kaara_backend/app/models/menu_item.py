"""
MenuItem model — matches the expanded schema from Phase 3.
"""
from __future__ import annotations

from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.offer import Offer


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)

    # core identity
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    tamil_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # categorisation
    category: Mapped[str] = mapped_column(String(80), nullable=False)

    # pricing
    price: Mapped[float] = mapped_column(Float, nullable=False)
    offer_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # detail
    ingredients: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    spice_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    prep_time_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # flags
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_chef_recommended: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # media
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # audit
    created_by_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # relationships
    created_by_user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="menu_items", foreign_keys=[created_by_id]
    )
    offers: Mapped[list["Offer"]] = relationship(
        "Offer", back_populates="menu_items", secondary="offer_menu_items"
    )

    # composite indexes
    __table_args__ = (
        Index("ix_menu_items_category_available", "category", "is_available"),
    )
