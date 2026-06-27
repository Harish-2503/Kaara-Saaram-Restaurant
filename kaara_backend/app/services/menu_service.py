"""
Menu service — all business logic for menu items.
Routes and controllers stay thin; everything queryable lives here.
"""
from __future__ import annotations

import math
from typing import Optional

from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import Session

from app.models.menu_item import MenuItem
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate
from app.core.exceptions import NotFoundError, ConflictError


# ─── helpers ──────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, item_id: int) -> MenuItem:
    item = db.get(MenuItem, item_id)
    if item is None:
        raise NotFoundError(f"Menu item {item_id} not found")
    return item


def _slug_taken(db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
    stmt = select(MenuItem).where(MenuItem.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(MenuItem.id != exclude_id)
    return db.scalar(stmt) is not None


# ─── read ──────────────────────────────────────────────────────────────────────

def list_menu_items(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    is_available: Optional[bool] = None,
    search: Optional[str] = None,
    is_chef_recommended: Optional[bool] = None,
) -> dict:
    """
    Return a paginated, filtered list of menu items.

    Filters are AND-combined.
    Search matches against name, tamil_name, description, and ingredients (case-insensitive).
    """
    stmt = select(MenuItem)

    filters = []

    if category is not None:
        filters.append(MenuItem.category == category)

    if is_available is not None:
        filters.append(MenuItem.is_available == is_available)

    if is_chef_recommended is not None:
        filters.append(MenuItem.is_chef_recommended == is_chef_recommended)

    if search:
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                MenuItem.name.ilike(term),
                MenuItem.tamil_name.ilike(term),
                MenuItem.description.ilike(term),
                MenuItem.ingredients.ilike(term),
            )
        )

    if filters:
        stmt = stmt.where(and_(*filters))

    # total count (same filters, no pagination)
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.scalar(count_stmt) or 0

    # ordered, paginated results
    offset = (page - 1) * page_size
    stmt = stmt.order_by(MenuItem.category, MenuItem.name).offset(offset).limit(page_size)
    items = list(db.scalars(stmt))

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if total else 1,
    }


def get_menu_item(db: Session, item_id: int) -> MenuItem:
    return _get_or_404(db, item_id)


def get_menu_item_by_slug(db: Session, slug: str) -> MenuItem:
    item = db.scalar(select(MenuItem).where(MenuItem.slug == slug))
    if item is None:
        raise NotFoundError(f"Menu item with slug '{slug}' not found")
    return item


# ─── write ─────────────────────────────────────────────────────────────────────

def create_menu_item(
    db: Session,
    payload: MenuItemCreate,
    *,
    created_by_id: Optional[int] = None,
) -> MenuItem:
    if _slug_taken(db, payload.slug):
        raise ConflictError(f"Slug '{payload.slug}' is already in use")

    data = payload.model_dump()
    item = MenuItem(**data, created_by_id=created_by_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_menu_item(
    db: Session,
    item_id: int,
    payload: MenuItemUpdate,
) -> MenuItem:
    item = _get_or_404(db, item_id)

    updates = payload.model_dump(exclude_unset=True)

    if "slug" in updates and updates["slug"] != item.slug:
        if _slug_taken(db, updates["slug"], exclude_id=item_id):
            raise ConflictError(f"Slug '{updates['slug']}' is already in use")

    for field, value in updates.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


def delete_menu_item(db: Session, item_id: int) -> None:
    item = _get_or_404(db, item_id)
    db.delete(item)
    db.commit()
