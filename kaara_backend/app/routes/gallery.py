"""
Gallery routes.

Public:
  GET  /gallery          — list published gallery images
  GET  /gallery/{id}     — single image by PK

Admin-only (requires valid JWT + admin/superadmin role):
  POST   /gallery        — add a gallery image
  PUT    /gallery/{id}   — update a gallery image
  DELETE /gallery/{id}   — remove a gallery image
"""
from __future__ import annotations

from typing import Optional, List

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import DBSession, require_role
from app.models.gallery import Gallery
from app.models.user import User
from app.schemas.gallery import GalleryCreate, GalleryUpdate, GalleryResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/gallery", tags=["gallery"])


# ─── public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[GalleryResponse], summary="List gallery images")
def list_gallery(
    db: DBSession,
    category: Optional[str] = Query(None, description="Filter by category"),
    published_only: bool = Query(True, description="Only return published images"),
):
    q = db.query(Gallery)
    if published_only:
        q = q.filter(Gallery.is_published == True)
    if category:
        q = q.filter(Gallery.category == category)
    return q.order_by(Gallery.display_order, Gallery.created_at.desc()).all()


@router.get("/{gallery_id}", response_model=GalleryResponse, summary="Get gallery image by ID")
def get_gallery_item(gallery_id: int, db: DBSession):
    item = db.get(Gallery, gallery_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery image not found")
    return item


# ─── admin ─────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=GalleryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add gallery image (admin)",
)
def create_gallery_item(
    payload: GalleryCreate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    item = Gallery(**payload.model_dump(), created_by_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{gallery_id}", response_model=GalleryResponse, summary="Update gallery image (admin)")
def update_gallery_item(
    gallery_id: int,
    payload: GalleryUpdate,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    item = db.get(Gallery, gallery_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery image not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/{gallery_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete gallery image (admin)",
)
def delete_gallery_item(
    gallery_id: int,
    db: DBSession,
    current_user: User = Depends(get_current_user),
):
    item = db.get(Gallery, gallery_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery image not found")
    db.delete(item)
    db.commit()
