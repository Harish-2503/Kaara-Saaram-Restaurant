"""
Re-exports every schema so other modules can do, e.g.:

    from app.schemas import MenuItemCreate, MenuItemResponse

instead of reaching into each individual file.
"""

from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.menu_item import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from app.schemas.gallery import GalleryCreate, GalleryUpdate, GalleryResponse
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse
from app.schemas.restaurant_settings import RestaurantSettingsUpdate, RestaurantSettingsResponse
from app.schemas.auth import LoginRequest, TokenResponse, TokenPayload, PasswordChange

__all__ = [
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    # MenuItem
    "MenuItemCreate",
    "MenuItemUpdate",
    "MenuItemResponse",
    # Reservation
    "ReservationCreate",
    "ReservationUpdate",
    "ReservationResponse",
    # Gallery
    "GalleryCreate",
    "GalleryUpdate",
    "GalleryResponse",
    # Offer
    "OfferCreate",
    "OfferUpdate",
    "OfferResponse",
    # RestaurantSettings
    "RestaurantSettingsUpdate",
    "RestaurantSettingsResponse",
    # Authentication
    "LoginRequest",
    "TokenResponse",
    "TokenPayload",
    "PasswordChange",
]
