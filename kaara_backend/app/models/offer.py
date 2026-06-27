"""
Offer model — represents a promotional discount/offer that can be
attached to one or more menu items.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    discount_type = Column(String(20), nullable=False, default="percentage")  # "percentage" | "flat"
    discount_value = Column(Numeric(10, 2), nullable=False)

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    banner_image_url = Column(String(255), nullable=True)

    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships — back_populates must match the attribute name on the other model
    created_by_user = relationship("User", back_populates="offers", foreign_keys=[created_by_id])
    menu_items = relationship("MenuItem", back_populates="offers", secondary="offer_menu_items")

    __table_args__ = (
        Index("ix_offers_active_dates", "is_active", "start_date", "end_date"),
    )

    def __repr__(self):
        return f"<Offer id={self.id} title={self.title!r} active={self.is_active}>"
