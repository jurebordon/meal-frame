"""API routers for MealFrame application."""

from .today import router as today_router
from .weekly import router as weekly_router
from .day_templates import router as day_templates_router
from .meals import router as meals_router

__all__ = ["today_router", "weekly_router", "day_templates_router", "meals_router"]
