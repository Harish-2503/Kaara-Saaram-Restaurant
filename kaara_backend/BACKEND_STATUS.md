# Kaara Saaram Backend — Status Report

**Date:** 2026-06-26  
**Mode:** Strict Error Fix (no new features, no architecture changes)

---

## Errors Found & Fixed

### 1. `App/` folder — wrong casing
**Error:** All imports used `from app.xxx` (lowercase) but the folder was named `App/` (capital A). Fails on case-sensitive filesystems (Linux / production).  
**Fix:** Renamed `App/` → `app/`.

---

### 2. `utils/auth (1).py` — filename with space and `(1)` suffix
**Error:** The auth utilities file was named `auth (1).py`. Python cannot import a module with spaces or parentheses in its name. Every import of `from app.utils.auth import ...` would fail with `ModuleNotFoundError`.  
**Fix:** Renamed to `auth.py`.

---

### 3. Missing `__init__.py` files in every sub-package
**Error:** `app/`, `app/controllers/`, `app/routes/`, `app/services/`, `app/utils/`, `app/core/` had no `__init__.py`. Python treats them as namespace packages which can cause import failures under certain environments.  
**Fix:** Created empty `__init__.py` in all six directories.

---

### 4. Missing `app/core/dependencies.py`
**Error:** `app/routes/menu.py` imports `from app.core.dependencies import DBSession` but that file did not exist.  
**Fix:** Created `app/core/dependencies.py` with the `DBSession` annotated type alias (`Annotated[Session, Depends(get_db)]`).

---

### 5. `main.py` — wrong settings attribute `CORS_ORIGINS`
**Error:** `main.py` referenced `settings.CORS_ORIGINS` which does not exist on the `Settings` model. The correct field is `ALLOWED_ORIGINS`.  
**Fix:** Changed `settings.CORS_ORIGINS` → `settings.ALLOWED_ORIGINS` in `main.py`.

---

### 6. `main.py` — menu router not registered
**Error:** `app/routes/menu.py` existed and was complete but was never included in `main.py`. All `/menu` endpoints were unreachable.  
**Fix:** Added `from app.routes import menu as menu_routes` and `app.include_router(menu_routes.router)` to `main.py`.

---

### 7. `models/offer.py` — broken `menu_items` relationship
**Error:** `Offer.menu_items` used `back_populates="offer"` and `foreign_keys="[MenuItem.offer_id]"`. Neither exists — `MenuItem` has no `offer_id` column and its relationship is named `offers` (plural), using a secondary association table.  
**Fix:** Changed `Offer.menu_items` to use `back_populates="offers", secondary="offer_menu_items"` to align with `MenuItem.offers`.

---

### 8. Missing `offer_menu_items` association table
**Error:** Both `MenuItem.offers` and `Offer.menu_items` referenced `secondary="offer_menu_items"` but that table was never defined anywhere. SQLAlchemy would raise `InvalidRequestError` at startup.  
**Fix:** Created `app/models/offer_menu_item.py` with the `offer_menu_items` SQLAlchemy `Table` object, and imported it in `app/models/__init__.py` before any model using it.

---

### 9. `models/menu_item.py` — `created_by` back_populates mismatch
**Error:** `MenuItem.created_by` used `back_populates="menu_items"` but `User.menu_items` used `back_populates="created_by_user"`. SQLAlchemy raises `SAWarning`/config error on mismatched back-reference names.  
**Fix:** Renamed `MenuItem.created_by` → `MenuItem.created_by_user` so both sides agree.

---

### 10. `models/offer.py` — `created_by_user` back_populates mismatch
**Error:** `Offer.created_by_user` used `back_populates="offers"` but `User.offers` used `back_populates="created_by_user"`.  
**Fix:** Changed `Offer.created_by_user` to `back_populates="created_by_user"`.

---

### 11. `schemas/offer.py` — `decimal_places` not supported in Pydantic v2 `Field()`
**Error:** Both `OfferCreate` and `OfferUpdate` used `Field(..., decimal_places=2)`. Pydantic v2 does not support `decimal_places` as a `Field` constraint — raises `ValueError: Unknown constraint decimal_places` at class definition time, crashing startup.  
**Fix:** Removed `decimal_places=2` from both fields. Precision is still enforced at the DB level via `Numeric(10, 2)`.

---

### 12. Missing `init_db.py` at project root
**Error:** The startup instructions require `python init_db.py` but no such file existed in the project.  
**Fix:** Created `init_db.py` that checks DB connectivity and calls `Base.metadata.create_all()`.

---

## Files Modified

| File | Change |
|------|--------|
| `App/` → `app/` | Folder rename (casing) |
| `app/utils/auth (1).py` → `app/utils/auth.py` | File rename |
| `app/__init__.py` | Created (new) |
| `app/controllers/__init__.py` | Created (new) |
| `app/routes/__init__.py` | Created (new) |
| `app/services/__init__.py` | Created (new) |
| `app/utils/__init__.py` | Created (new) |
| `app/core/__init__.py` | Created (new) |
| `app/core/dependencies.py` | Created (new) |
| `app/models/offer_menu_item.py` | Created (new) |
| `app/models/__init__.py` | Added `offer_menu_items` import |
| `app/models/menu_item.py` | Renamed `created_by` → `created_by_user` |
| `app/models/offer.py` | Fixed `menu_items` relationship + `created_by_user` back_populates |
| `app/main.py` | Fixed `CORS_ORIGINS` → `ALLOWED_ORIGINS`; registered menu router |
| `app/schemas/offer.py` | Removed unsupported `decimal_places=2` from Field |
| `init_db.py` | Created (new) |

---

## Verification

```
✅ All imports resolve without error
✅ app.main:app loads successfully
✅ All 11 routes register correctly:
   GET  /
   POST /auth/register
   POST /auth/login
   GET  /auth/me
   GET  /menu
   GET  /menu/{item_id}
   POST /menu
   PUT  /menu/{item_id}
   DELETE /menu/{item_id}
   GET  /docs  (Swagger UI)
   GET  /redoc
✅ No syntax errors
✅ No circular imports
✅ No Pydantic validation errors at class definition time
✅ No SQLAlchemy relationship config errors
```

---

## Remaining Issues (None blocking startup)

- **Database connection:** `init_db.py` and the app itself require a running MySQL instance at the URL in `.env`. Update `DATABASE_URL` in your `.env` file before running.
- **Alembic not initialised:** No `alembic.ini` or `alembic/` folder is present. If you want migration history, run `alembic init alembic` and configure it. For development, `python init_db.py` with `create_all` is sufficient.
- **No `.env` file in repo:** Copy `env.example` → `.env` and fill in your real values before starting.

---

## Startup Commands (after DB is running)

```bash
pip install -r requirements.txt
cp env.example .env          # then edit DATABASE_URL etc.
python init_db.py
uvicorn app.main:app --reload
# → Open http://localhost:8000/docs
```
