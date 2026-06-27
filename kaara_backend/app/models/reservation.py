"""
Reservation model — represents a customer table booking.
"""

import enum

from sqlalchemy import (
    Column,
    DateTime,
    Date,
    Time,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(120), nullable=True)
    customer_phone = Column(String(20), nullable=False)

    reservation_date = Column(Date, nullable=False)
    reservation_time = Column(Time, nullable=False)
    party_size = Column(Integer, nullable=False)
    special_requests = Column(Text, nullable=True)

    status = Column(
        Enum(ReservationStatus),
        default=ReservationStatus.PENDING,
        nullable=False,
    )

    handled_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    handled_by = relationship("User", foreign_keys=[handled_by_id])

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_reservations_date_status", "reservation_date", "status"),
    )

    def __repr__(self):
        return f"<Reservation id={self.id} name={self.customer_name!r} status={self.status}>"
