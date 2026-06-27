"""
Gallery model — represents an image shown in the restaurant's photo
gallery on the customer-facing site (interior, dishes, events, etc).
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    title = Column(String(150), nullable=True)
    caption = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=False)

    category = Column(String(80), nullable=True, index=True)  # e.g. Interior, Food, Events
    display_order = Column(Integer, default=0, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)

    # Auditing — which admin user uploaded this image
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # --- Relationships ---
    created_by_user = relationship("User", back_populates="gallery_images", foreign_keys=[created_by_id])

    __table_args__ = (
        Index("ix_gallery_category_published", "category", "is_published"),
    )

    def __repr__(self):
        return f"<Gallery id={self.id} title={self.title!r} category={self.category!r}>"
