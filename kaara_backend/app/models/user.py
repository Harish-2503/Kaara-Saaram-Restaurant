"""
User model — represents admin/staff accounts that can log in to the
Kaara Saaram admin dashboard.

Relationships:
    - One User can create many Reservations (as the staff member who
      handled a booking, if ever needed)
    - One User can be the "created_by" for MenuItems / Offers / Gallery
      images (optional, useful for auditing who added what)
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    STAFF = "staff"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Login credentials
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Profile / display info
    full_name = Column(String(100), nullable=True)

    # Access control
    role = Column(Enum(UserRole), default=UserRole.STAFF, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # --- Relationships ---
    # Menu items / gallery images / offers created by this user (optional auditing)
    menu_items = relationship(
        "MenuItem", back_populates="created_by_user", foreign_keys="[MenuItem.created_by_id]"
    )
    gallery_images = relationship(
        "Gallery", back_populates="created_by_user", foreign_keys="[Gallery.created_by_id]"
    )
    offers = relationship(
        "Offer", back_populates="created_by_user", foreign_keys="[Offer.created_by_id]"
    )

    def __repr__(self):
        return f"<User id={self.id} username={self.username!r} role={self.role}>"
