"""
Menu routes.

Public:
  GET  /menu          — paginated list with filters + search
  GET  /menu/{id}     — single item by PK

Admin-only (requires valid JWT):
  POST   /menu        — create
  PUT    /menu/{id}   — update
  DELETE /menu/{id}   — delete
"""
from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.controllers import menu_controller
from app.core.dependencies import DBSession
from app.models.user import User
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemListResponse,
    MenuItemResponse,
    MenuItemUpdate,
    VALID_CATEGORIES,
)
from app.utils.auth import get_current_user

router = APIRouter(prefix="/menu", tags=["menu"])


# ─── public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=MenuItemListResponse, summary="List menu items")
def list_menu_items(
    db: DBSession,
    page: Annotated[int, Query(ge=1, description="Page number (1-indexed)")] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
    category: Annotated[
        Optional[str],
        Query(description=f"Filter by category. One of: {', '.join(sorted(VALID_CATEGORIES))}"),
    ] = None,
    is_available: Annotated[
        Optional[bool],
        Query(description="Filter by availability"),
    ] = None,
    search: Annotated[
        Optional[str],
        Query(min_length=1, max_length=100, description="Search name, description, ingredients"),
    ] = None,
    is_chef_recommended: Annotated[
        Optional[bool],
        Query(description="Filter to chef-recommended items only"),
    ] = None,
):
    result = menu_controller.list_items(
        db,
        page=page,
        page_size=page_size,
        category=category,
        is_available=is_available,
        search=search,
        is_chef_recommended=is_chef_recommended,
    )
    return MenuItemListResponse(
        items=result["items"],
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        total_pages=result["total_pages"],
    )


@router.get("/{item_id}", response_model=MenuItemResponse, summary="Get menu item by ID")
def get_menu_item(item_id: int, db: DBSession):
    return menu_controller.get_item(db, item_id)


# ─── admin ─────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create menu item (admin)",
)
def create_menu_item(
    payload: MenuItemCreate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    return menu_controller.create_item(db, payload, current_user.id)


@router.put("/{item_id}", response_model=MenuItemResponse, summary="Update menu item (admin)")
def update_menu_item(
    item_id: int,
    payload: MenuItemUpdate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    return menu_controller.update_item(db, item_id, payload)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete menu item (admin)",
)
def delete_menu_item(
    item_id: int,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    menu_controller.delete_item(db, item_id)
