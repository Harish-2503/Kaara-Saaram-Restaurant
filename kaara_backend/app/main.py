"""
FastAPI application entry point — single-server mode.

In production, FastAPI serves EVERYTHING from port 8000:
  /api/*      → All backend API endpoints
  /uploads/*  → Uploaded image files (static)
  /assets/*   → React build assets (JS, CSS, images)
  /*          → React's index.html (catch-all for React Router)

In development, run the Vite dev server separately on port 5173
and use the proxy config in vite.config.js to forward /api to 8000.
"""
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.routes import auth as auth_routes
from app.routes import menu as menu_routes
from app.routes import reservation as reservation_routes
from app.routes import gallery as gallery_routes
from app.routes import offers as offers_routes
from app.routes import settings as settings_routes
from app.routes import upload as upload_routes

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    # Swagger still works at /docs even in single-server mode
)

# ── CORS ────────────────────────────────────────────────────────────────────
# In production (single server) the browser origin IS the backend, so CORS
# is not technically needed. We keep it active for development flexibility
# (Vite dev server on 5173 calling backend on 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers — all under /api/* ──────────────────────────────────────────
app.include_router(auth_routes.router,        prefix="/api")
app.include_router(menu_routes.router,        prefix="/api")
app.include_router(reservation_routes.router, prefix="/api")
app.include_router(gallery_routes.router,     prefix="/api")
app.include_router(offers_routes.router,      prefix="/api")
app.include_router(settings_routes.router,    prefix="/api")
app.include_router(upload_routes.router,      prefix="/api")

# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
def health_check():
    """Basic liveness check. GET /api/health"""
    return {"message": f"{settings.APP_NAME} running", "version": settings.APP_VERSION}

# ── Uploaded user files ───────────────────────────────────────────────────────
_upload_dir = Path(settings.UPLOAD_DIR)
_upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_upload_dir)), name="uploads")

# ── React build (dist/) ───────────────────────────────────────────────────────
# The dist folder is built by `npm run build` from the project root.
# vite.config.js sets outDir to kaara_backend/dist so it lands right here.
_dist_dir = Path(__file__).parent.parent / "dist"

if _dist_dir.exists():
    # Serve React's static assets (JS, CSS, images under /assets/)
    app.mount("/assets", StaticFiles(directory=str(_dist_dir / "assets")), name="react_assets")

    # Catch-all: any route not matched above returns index.html so that
    # React Router handles it client-side (e.g. refreshing /admin/login).
    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_react(full_path: str):
        index = _dist_dir / "index.html"
        return FileResponse(str(index))
else:
    # dist/ doesn't exist yet (first run before `npm run build`).
    # Warn clearly instead of crashing.
    @app.get("/", tags=["Health"])
    def root_no_build():
        return {
            "message": "API is running. Run `npm run build` to enable the React frontend.",
            "api_docs": "/docs",
        }
