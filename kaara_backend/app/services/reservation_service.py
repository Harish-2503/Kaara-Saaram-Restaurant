"""
Reservation service — the data-access layer for Reservation.

Owns every SQLAlchemy query for reservations. No HTTP knowledge here —
no status codes, no HTTPException. That's the controller's job.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.reservation import Reservation, ReservationStatus


def list_reservations_newest_first(db: Session) -> List[Reservation]:
    """
    Return every reservation, newest first. Used by the admin dashboard's
    GET /reservations — there is no public "list" endpoint, only the
    public create endpoint.

    Sorts by created_at, then by id as a tiebreaker — two reservations
    created within the same second (timestamp resolution varies by DB
    backend) would otherwise sort in an unpredictable order.
    """
    return (
        db.query(Reservation)
        .order_by(Reservation.created_at.desc(), Reservation.id.desc())
        .all()
    )


def get_reservation_by_id(db: Session, reservation_id: int) -> Optional[Reservation]:
    return db.query(Reservation).filter(Reservation.id == reservation_id).first()


def create_reservation(db: Session, data: dict) -> Reservation:
    reservation = Reservation(**data)
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def update_reservation_status(
    db: Session, reservation: Reservation, status: ReservationStatus
) -> Reservation:
    reservation.status = status
    db.commit()
    db.refresh(reservation)
    return reservation


def delete_reservation(db: Session, reservation: Reservation) -> None:
    db.delete(reservation)
    db.commit()
