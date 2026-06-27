from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationResponse
from app.controllers import reservation_controller
from app.utils.auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["Reservations"])


class ReservationStatusUpdate(BaseModel):
    status: str = Field(..., description="One of: pending, confirmed, completed, cancelled")


@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(payload: ReservationCreate, db: Session = Depends(get_db)):
    return reservation_controller.create_reservation(db, payload)


@router.get("", response_model=list[ReservationResponse])
def list_reservations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return reservation_controller.list_reservations(db)


@router.put("/{reservation_id}/status", response_model=ReservationResponse)
def update_reservation_status(reservation_id: int, payload: ReservationStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return reservation_controller.change_reservation_status(db, reservation_id, payload.status)


@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reservation(reservation_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reservation_controller.delete_reservation(db, reservation_id)
