"""Junction table for Meal-MealType many-to-many relationship."""
from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID

from ..database import Base


# Junction table for many-to-many relationship between Meal and MealType
meal_to_meal_type = Table(
    "meal_to_meal_type",
    Base.metadata,
    Column("meal_id", UUID(as_uuid=True), ForeignKey("meal.id", ondelete="CASCADE"), primary_key=True),
    Column("meal_type_id", UUID(as_uuid=True), ForeignKey("meal_type.id", ondelete="CASCADE"), primary_key=True),
)
