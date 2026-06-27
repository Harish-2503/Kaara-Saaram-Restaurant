"""
Menu controller — thin layer between routes and service.
Converts AppErrors to FastAPI HTTPExceptions.
"""
from __future__ import annotations

from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ConflictError
from app.models.menu_item import MenuItem
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate
from app.services import menu_service


def _handle_app_error(exc: Exception) -> None:
    """Re-raise AppErrors as HTTPExceptions."""
    if isinstance(exc, (NotFoundError, ConflictError)):
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)
    raise exc


# ─── read ──────────────────────────────────────────────────────────────────────

def list_items(
    db: Session,
    page: int,
    page_size: int,
    category: Optional[str],
    is_available: Optional[bool],
    search: Optional[str],
    is_chef_recommended: Optional[bool],
) -> dict:
    return menu_service.list_menu_items(
        db,
        page=page,
        page_size=page_size,
        category=category,
        is_available=is_available,
        search=search,
        is_chef_recommended=is_chef_recommended,
    )


def get_item(db: Session, item_id: int) -> MenuItem:
    try:
        return menu_service.get_menu_item(db, item_id)
    except Exception as e:
        _handle_app_error(e)


# ─── write ─────────────────────────────────────────────────────────────────────

def create_item(
    db: Session,
    payload: MenuItemCreate,
    current_user_id: int,
) -> MenuItem:
    try:
        return menu_service.create_menu_item(db, payload, created_by_id=current_user_id)
    except Exception as e:
        _handle_app_error(e)


def update_item(
    db: Session,
    item_id: int,
    payload: MenuItemUpdate,
) -> MenuItem:
    try:
        return menu_service.update_menu_item(db, item_id, payload)
    except Exception as e:
        _handle_app_error(e)


def delete_item(db: Session, item_id: int) -> None:
    try:
        menu_service.delete_menu_item(db, item_id)
    except Exception as e:
        _handle_app_error(e)
