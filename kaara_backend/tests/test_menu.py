"""
Menu module smoke tests.
Run with: python tests/test_menu.py
Uses SQLite in-memory so no MySQL required.
"""
import sys, os, types
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ── SQLAlchemy Base (shared) ───────────────────────────────────────────────────
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLITE_URL = "sqlite://"

class Base(DeclarativeBase):
    pass

# ── config stub ───────────────────────────────────────────────────────────────
config_mod = types.ModuleType("app.config")
class _Settings:
    DATABASE_URL = SQLITE_URL
    SECRET_KEY = "test-secret"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    CORS_ORIGINS = ["http://localhost:5173"]
config_mod.settings = _Settings()
sys.modules["app.config"] = config_mod

# ── database stub (uses the shared Base above) ────────────────────────────────
db_mod = types.ModuleType("app.database")
db_mod.Base = Base
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
db_mod.engine = engine
db_mod.SessionLocal = SessionLocal
sys.modules["app.database"] = db_mod

# ── stub the User model so the FK resolves without pulling in all models ──────
import sqlalchemy as sa
class User(Base):
    __tablename__ = "users"
    id = sa.Column(sa.Integer, primary_key=True)
    menu_items = sa.orm.relationship("MenuItem", back_populates="created_by", foreign_keys="MenuItem.created_by_id")

# stub Offer + association table so MenuItem.offers relationship loads
offer_menu_items = sa.Table(
    "offer_menu_items", Base.metadata,
    sa.Column("offer_id", sa.Integer, sa.ForeignKey("offers.id")),
    sa.Column("menu_item_id", sa.Integer, sa.ForeignKey("menu_items.id")),
)
class Offer(Base):
    __tablename__ = "offers"
    id = sa.Column(sa.Integer, primary_key=True)
    menu_items = sa.orm.relationship("MenuItem", back_populates="offers", secondary=offer_menu_items)

# ── real imports ───────────────────────────────────────────────────────────────
from app.models.menu_item import MenuItem            # noqa
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate  # noqa
from app.services import menu_service               # noqa
from app.core.exceptions import NotFoundError, ConflictError  # noqa
from pydantic import ValidationError                # noqa

Base.metadata.create_all(engine)
db = SessionLocal()

PASS, FAIL = [], []

def check(label, cond):
    if cond:
        PASS.append(label); print(f"  ✓ {label}")
    else:
        FAIL.append(label); print(f"  ✗ {label}")


print("\n── Schema validators ─────────────────────────────────────────────────────")

try:
    valid = MenuItemCreate(name="Chettinad Chicken Biryani",
        tamil_name="செட்டிநாடு சிக்கன் பிரியாணி",
        slug="chettinad-chicken-biryani", category="rice",
        price=320.0, offer_price=280.0, spice_level=4, prep_time_minutes=35)
    check("valid MenuItemCreate passes", True)
except Exception as e:
    check(f"valid MenuItemCreate passes ({e})", False)

for label, kwargs, exc in [
    ("bad slug rejected",           dict(name="X", slug="BAD SLUG", category="rice", price=100), ValidationError),
    ("price=0 rejected",            dict(name="X", slug="x", category="rice", price=0), ValidationError),
    ("offer_price>=price rejected", dict(name="X", slug="x", category="rice", price=100, offer_price=100), ValidationError),
    ("spice_level=6 rejected",      dict(name="X", slug="x", category="rice", price=100, spice_level=6), ValidationError),
    ("invalid category rejected",   dict(name="X", slug="x", category="fusion", price=100), ValidationError),
]:
    try:
        MenuItemCreate(**kwargs)
        check(label, False)
    except exc:
        check(label, True)
    except Exception as e:
        check(f"{label} (wrong exc: {e})", False)

try:
    upd = MenuItemUpdate(price=350.0)
    check("partial update passes", upd.price == 350.0)
except Exception as e:
    check(f"partial update passes ({e})", False)

try:
    MenuItemUpdate(slug="Bad Slug!")
    check("update: bad slug rejected", False)
except ValidationError:
    check("update: bad slug rejected", True)


print("\n── Service layer ─────────────────────────────────────────────────────────")

payload = MenuItemCreate(name="Mutton Kola Urundai", slug="mutton-kola-urundai",
    category="starters", price=220.0, spice_level=5)
item = menu_service.create_menu_item(db, payload)
check("create returns MenuItem", isinstance(item, MenuItem))
check("create sets id", item.id is not None)
check("create sets slug", item.slug == "mutton-kola-urundai")

try:
    menu_service.create_menu_item(db, payload)
    check("duplicate slug raises ConflictError", False)
except ConflictError:
    check("duplicate slug raises ConflictError", True)

fetched = menu_service.get_menu_item(db, item.id)
check("get by id correct", fetched.id == item.id)

try:
    menu_service.get_menu_item(db, 99999)
    check("missing id raises NotFoundError", False)
except NotFoundError:
    check("missing id raises NotFoundError", True)

updated = menu_service.update_menu_item(db, item.id, MenuItemUpdate(price=240.0, is_available=False))
check("update price", updated.price == 240.0)
check("update is_available", updated.is_available is False)
check("update preserves slug", updated.slug == "mutton-kola-urundai")

payload2 = MenuItemCreate(name="Filter Coffee", slug="filter-coffee",
    category="beverages", price=60.0, is_available=True, is_chef_recommended=True)
menu_service.create_menu_item(db, payload2)

result = menu_service.list_menu_items(db)
check("list total=2", result["total"] == 2)
check("list has total_pages key", "total_pages" in result)

r = menu_service.list_menu_items(db, category="beverages")
check("category filter total=1", r["total"] == 1)
check("category filter correct slug", r["items"][0].slug == "filter-coffee")

r = menu_service.list_menu_items(db, is_available=False)
check("is_available=False total=1", r["total"] == 1)

r = menu_service.list_menu_items(db, search="coffee")
check("search 'coffee' total=1", r["total"] == 1)

r = menu_service.list_menu_items(db, search="zzznomatch")
check("search no-match total=0", r["total"] == 0)

r = menu_service.list_menu_items(db, is_chef_recommended=True)
check("is_chef_recommended filter total=1", r["total"] == 1)

r = menu_service.list_menu_items(db, page=1, page_size=1)
check("page_size=1 returns 1", len(r["items"]) == 1)
check("total_pages=2 for 2 items page_size=1", r["total_pages"] == 2)

menu_service.delete_menu_item(db, item.id)
r = menu_service.list_menu_items(db)
check("delete reduces to 1", r["total"] == 1)

try:
    menu_service.delete_menu_item(db, item.id)
    check("delete nonexistent raises NotFoundError", False)
except NotFoundError:
    check("delete nonexistent raises NotFoundError", True)


print(f"\n── Results: {len(PASS)} passed, {len(FAIL)} failed ─────────────────")
if FAIL:
    print("FAILED:", FAIL)
    sys.exit(1)
else:
    print("All checks passed.")
