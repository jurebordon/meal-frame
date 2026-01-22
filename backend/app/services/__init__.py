"""Business logic services for MealFrame application."""

from .round_robin import (
    get_meals_for_type,
    get_next_meal_for_type,
    get_round_robin_state,
    peek_next_meal_for_type,
    reset_round_robin_state,
    update_round_robin_state,
)

__all__ = [
    "get_meals_for_type",
    "get_next_meal_for_type",
    "get_round_robin_state",
    "peek_next_meal_for_type",
    "reset_round_robin_state",
    "update_round_robin_state",
]
