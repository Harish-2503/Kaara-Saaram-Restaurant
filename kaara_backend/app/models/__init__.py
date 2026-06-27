"""
Importing all models here ensures that when anything does
`from app.models import Base` (or imports this package), every model
class gets registered on the shared declarative Base. This is required
for SQLAlchemy to resolve the string-based relationship() references
between models (e.g. "MenuItem", "Offer") and for Alembic's
autogenerate to detect every table.
"""

from app.database import Base  # noqa: F401

from app.models.offer_menu_item import offer_menu_items  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401
from app.models.menu_item import MenuItem  # noqa: F401
from app.models.reservation import Reservation, ReservationStatus  # noqa: F401
from app.models.gallery import Gallery  # noqa: F401
from app.models.offer import Offer  # noqa: F401
from app.models.restaurant_settings import RestaurantSettings  # noqa: F401

__all__ = [
    "Base",
    "User",
    "UserRole",
    "MenuItem",
    "Reservation",
    "ReservationStatus",
    "Gallery",
    "Offer",
    "RestaurantSettings",
]
