"""
Association table linking Offers to MenuItems (many-to-many).
"""
from sqlalchemy import Table, Column, Integer, ForeignKey
from app.database import Base

offer_menu_items = Table(
    "offer_menu_items",
    Base.metadata,
    Column("offer_id", Integer, ForeignKey("offers.id", ondelete="CASCADE"), primary_key=True),
    Column("menu_item_id", Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), primary_key=True),
)
