"""
Reservation controller — orchestrates between the route layer and the
service layer for Reservation. Owns the HTTP-facing decisions (status
codes, error messages) that don't belong in the service (pure data
access) or the route (pure request/response shape).
"""

from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import ReservationCreate
from app.services import reservation_service

# The exact set of allowed status values for PUT /reservations/{id}/status,
# matching ReservationStatus exactly: pending, confirmed, completed, cancelled.
ALLOWED_STATUSES = {s.value for s in ReservationStatus}


def list_reservations(db: Session):
    """Admin: fetch every reservation, newest first."""
    return reservation_service.list_reservations_newest_first(db)


def get_reservation_or_404(db: Session, reservation_id: int) -> Reservation:
    reservation = reservation_service.get_reservation_by_id(db, reservation_id)
    if reservation is None:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"Reservation with id {reservation_id} not found",
        )
    return reservation


def create_reservation(db: Session, payload: ReservationCreate) -> Reservation:
    """Public: a customer books a table. No auth required."""
    data = payload.model_dump()
    return reservation_service.create_reservation(db, data)


def change_reservation_status(db: Session, reservation_id: int, new_status: str) -> Reservation:
    """
    Admin: change a reservation's status. Validates the incoming value
    against the allowed set (pending/confirmed/completed/cancelled)
    before touching the database, returning a clear 400 instead of a
    raw enum/DB error for an invalid value.
    """
    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status '{new_status}'. "
                f"Allowed values: {', '.join(sorted(ALLOWED_STATUSES))}"
            ),
        )

    reservation = get_reservation_or_404(db, reservation_id)
    return reservation_service.update_reservation_status(
        db, reservation, ReservationStatus(new_status)
    )


def delete_reservation(db: Session, reservation_id: int) -> None:
    """Admin only — enforced at the route layer via get_current_user."""
    reservation = get_reservation_or_404(db, reservation_id)
    reservation_service.delete_reservation(db, reservation)
