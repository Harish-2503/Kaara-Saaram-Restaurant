"""
Offers routes.

Public:
  GET  /offers          — list active offers
  GET  /offers/{id}     — single offer by PK

Admin-only (requires valid JWT):
  POST   /offers        — create
  PUT    /offers/{id}   — update
  DELETE /offers/{id}   — delete
"""
from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import DBSession
from app.models.offer import Offer
from app.models.user import User
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/offers", tags=["offers"])


# ─── public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[OfferResponse], summary="List offers")
def list_offers(
    db: DBSession,
    active_only: bool = Query(True, description="Only return active offers"),
):
    q = db.query(Offer)
    if active_only:
        q = q.filter(Offer.is_active == True)
    return q.order_by(Offer.created_at.desc()).all()


@router.get("/{offer_id}", response_model=OfferResponse, summary="Get offer by ID")
def get_offer(offer_id: int, db: DBSession):
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    return offer


# ─── admin ─────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=OfferResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create offer (admin)",
)
def create_offer(
    payload: OfferCreate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    offer = Offer(**payload.model_dump(), created_by_id=current_user.id)
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.put("/{offer_id}", response_model=OfferResponse, summary="Update offer (admin)")
def update_offer(
    offer_id: int,
    payload: OfferUpdate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(offer, field, value)
    db.commit()
    db.refresh(offer)
    return offer


@router.delete(
    "/{offer_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete offer (admin)",
)
def delete_offer(
    offer_id: int,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    db.delete(offer)
    db.commit()
