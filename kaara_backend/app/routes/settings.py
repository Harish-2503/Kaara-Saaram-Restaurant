"""
Restaurant Settings routes.

Public:
  GET  /settings        — read the current restaurant settings

Admin-only (requires valid JWT):
  PUT  /settings        — update restaurant settings (partial update)

The settings table holds a single "default" row (singleton pattern).
The first GET automatically seeds the row if it doesn't exist yet.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import DBSession
from app.models.restaurant_settings import RestaurantSettings
from app.models.user import User
from app.schemas.restaurant_settings import RestaurantSettingsUpdate, RestaurantSettingsResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

_SITE_KEY = "default"


def _get_or_create_settings(db) -> RestaurantSettings:
    """
    Return the singleton settings row, creating it with defaults if it
    doesn't exist yet (first run after init_db).
    """
    row = db.query(RestaurantSettings).filter(RestaurantSettings.site_key == _SITE_KEY).first()
    if row is None:
        row = RestaurantSettings(site_key=_SITE_KEY, restaurant_name="Kaara Saaram")
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


# ─── public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=RestaurantSettingsResponse, summary="Get restaurant settings")
def get_settings(db: DBSession):
    return _get_or_create_settings(db)


# ─── admin ─────────────────────────────────────────────────────────────────────

@router.put("", response_model=RestaurantSettingsResponse, summary="Update restaurant settings (admin)")
def update_settings(
    payload: RestaurantSettingsUpdate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    row = _get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row
