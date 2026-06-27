"""
Upload route — handles image uploads from the admin dashboard.

POST /upload            — upload a file; returns { url, filename }
GET  /uploads/{filename} — served as StaticFiles (mounted in main.py)

Files are stored in the UPLOAD_DIR from .env (default: "uploads/").
Max size is enforced by the MAX_UPLOAD_SIZE_MB setting.
Allowed extensions: jpg, jpeg, png, webp, gif.
"""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from app.config import settings
from app.models.user import User
from app.core.dependencies import require_role

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def _ensure_upload_dir() -> Path:
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


@router.post(
    "",
    summary="Upload an image file (admin only)",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("admin", "superadmin")),
):
    """
    Upload an image file. Returns { url, filename }.
    - `url` is the path to store as image_url (e.g. `/uploads/abc.jpg`).
    - Max size: MAX_UPLOAD_SIZE_MB (default 5 MB).
    - Allowed types: jpg, jpeg, png, webp, gif.
    """
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type '{ext}' not allowed. Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    safe_name = f"{uuid.uuid4().hex}{ext}"
    upload_dir = _ensure_upload_dir()
    (upload_dir / safe_name).write_bytes(contents)

    return {"url": f"/uploads/{safe_name}", "filename": safe_name}
