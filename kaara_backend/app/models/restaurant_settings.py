"""
RestaurantSettings model — stores site-wide restaurant configuration
(name, contact info, hours, social links, etc) edited from the admin
Settings panel.

This table is designed to hold a single row (a "singleton" settings
record), but is modeled as a normal table with an id/unique key rather
than hardcoding id=1 in application logic, so it stays flexible if
multi-location support is ever needed later.
"""

from sqlalchemy import Column, Integer, String, Text, Time, DateTime, Boolean
from sqlalchemy.sql import func

from app.database import Base


class RestaurantSettings(Base):
    __tablename__ = "restaurant_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Identity — unique so the app can enforce a single active settings row
    site_key = Column(String(50), unique=True, nullable=False, default="default")

    # Basic info
    restaurant_name = Column(String(150), nullable=False, default="Kaara Saaram")
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    # Contact
    phone_primary = Column(String(20), nullable=True)
    phone_secondary = Column(String(20), nullable=True)
    email = Column(String(120), nullable=True)
    address = Column(Text, nullable=True)

    # Hours (simple single open/close pair; extend later if needed per-day)
    opening_time = Column(Time, nullable=True)
    closing_time = Column(Time, nullable=True)

    # Social / external links
    instagram_url = Column(String(255), nullable=True)
    facebook_url = Column(String(255), nullable=True)
    google_maps_url = Column(String(255), nullable=True)

    # Feature toggles
    accepts_reservations = Column(Boolean, default=True, nullable=False)
    maintenance_mode = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self):
        return f"<RestaurantSettings id={self.id} name={self.restaurant_name!r}>"
