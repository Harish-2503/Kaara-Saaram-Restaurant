"""
Shared schema base classes / mixins used across every resource.

Keeping these in one place avoids repeating the same ORM-mode config
and timestamp fields in every single schema file.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    """
    Base class for any *Response* schema that is built directly from a
    SQLAlchemy model instance. `from_attributes=True` (the Pydantic v2
    replacement for the old `orm_mode`) lets Pydantic read attributes
    off the ORM object instead of requiring a dict.
    """

    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(BaseModel):
    """Adds the two timestamp fields every model has, for Response schemas."""

    created_at: datetime
    updated_at: datetime
