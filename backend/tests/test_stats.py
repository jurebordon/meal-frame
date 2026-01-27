"""
Integration tests for the Stats API endpoint.

Tests cover:
- GET /api/v1/stats - Adherence statistics
  - Empty state (no data)
  - Status breakdown counting
  - Adherence rate calculation
  - Streak calculation (current and best)
  - Override day counting
  - Per-meal-type breakdown
  - Daily adherence data points
  - Query parameter validation
"""
from datetime import date, timedelta
from decimal import Decimal
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import MealType, Meal, WeeklyPlanInstance, WeeklyPlanInstanceDay, WeeklyPlanSlot
from app.database import get_db


@pytest_asyncio.fixture
async def client(db: AsyncSession):
    """Create an async HTTP client with database override."""

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()


async def _create_week_with_slots(
    db: AsyncSession,
    meal_type: MealType,
    meal: Meal,
    days_data: list[dict],
) -> WeeklyPlanInstance:
    """
    Helper to create a weekly plan instance with slots.

    days_data: list of dicts with keys:
        - date: date object
        - slots: list of completion_status values (str or None)
        - is_override: bool (optional, default False)
    """
    today = date.today()
    # Use the Monday of the week containing the first date
    first_date = days_data[0]["date"]
    week_start = first_date - timedelta(days=first_date.weekday())

    instance = WeeklyPlanInstance(
        id=uuid4(),
        week_start_date=week_start,
    )
    db.add(instance)
    await db.flush()

    for day_data in days_data:
        d = day_data["date"]
        is_override = day_data.get("is_override", False)

        instance_day = WeeklyPlanInstanceDay(
            id=uuid4(),
            weekly_plan_instance_id=instance.id,
            date=d,
            is_override=is_override,
        )
        db.add(instance_day)

        for position, status in enumerate(day_data.get("slots", [])):
            slot = WeeklyPlanSlot(
                id=uuid4(),
                weekly_plan_instance_id=instance.id,
                date=d,
                position=position,
                meal_type_id=meal_type.id,
                meal_id=meal.id,
                completion_status=status,
            )
            db.add(slot)

    await db.flush()
    return instance


@pytest_asyncio.fixture
async def meal_type(db: AsyncSession) -> MealType:
    """Create a test meal type."""
    mt = MealType(
        id=uuid4(),
        name=f"Test Breakfast {uuid4().hex[:8]}",
        description="Morning meal",
    )
    db.add(mt)
    await db.flush()
    return mt


@pytest_asyncio.fixture
async def meal(db: AsyncSession) -> Meal:
    """Create a test meal."""
    m = Meal(
        id=uuid4(),
        name=f"Test Oatmeal {uuid4().hex[:8]}",
        portion_description="1 bowl",
    )
    db.add(m)
    await db.flush()
    return m


# =============================================================================
# GET /api/v1/stats - Empty state
# =============================================================================


@pytest.mark.asyncio
async def test_stats_empty(client: AsyncClient):
    """GET /stats with no data returns zeroed stats."""
    response = await client.get("/api/v1/stats")
    assert response.status_code == 200
    data = response.json()

    assert data["period_days"] == 30
    assert data["total_slots"] == 0
    assert data["completed_slots"] == 0
    assert data["adherence_rate"] == "0"
    assert data["current_streak"] == 0
    assert data["best_streak"] == 0
    assert data["override_days"] == 0
    assert data["by_meal_type"] == []
    assert data["daily_adherence"] == []

    # Status breakdown should be all zeros
    by_status = data["by_status"]
    assert by_status["followed"] == 0
    assert by_status["adjusted"] == 0
    assert by_status["skipped"] == 0
    assert by_status["replaced"] == 0
    assert by_status["social"] == 0
    assert by_status["unmarked"] == 0


# =============================================================================
# GET /api/v1/stats - Status breakdown and adherence rate
# =============================================================================


@pytest.mark.asyncio
async def test_stats_status_breakdown(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """GET /stats correctly counts each completion status."""
    today = date.today()
    await _create_week_with_slots(db, meal_type, meal, [
        {
            "date": today,
            "slots": ["followed", "adjusted", "skipped", "replaced", "social", None],
        },
    ])

    response = await client.get("/api/v1/stats?days=1")
    assert response.status_code == 200
    data = response.json()

    assert data["total_slots"] == 6
    assert data["completed_slots"] == 5  # 6 total - 1 unmarked

    by_status = data["by_status"]
    assert by_status["followed"] == 1
    assert by_status["adjusted"] == 1
    assert by_status["skipped"] == 1
    assert by_status["replaced"] == 1
    assert by_status["social"] == 1
    assert by_status["unmarked"] == 1


@pytest.mark.asyncio
async def test_stats_adherence_rate_calculation(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """Adherence = (followed + adjusted) / (total - social - unmarked)."""
    today = date.today()
    # 3 followed, 1 adjusted, 1 skipped, 1 social, 1 unmarked = 7 total
    # Adherence = (3 + 1) / (7 - 1 - 1) = 4/5 = 0.8
    await _create_week_with_slots(db, meal_type, meal, [
        {
            "date": today,
            "slots": ["followed", "followed", "followed", "adjusted", "skipped", "social", None],
        },
    ])

    response = await client.get("/api/v1/stats?days=1")
    data = response.json()

    adherence = Decimal(data["adherence_rate"])
    assert adherence == Decimal("0.800")


@pytest.mark.asyncio
async def test_stats_perfect_adherence(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """All followed = 100% adherence."""
    today = date.today()
    await _create_week_with_slots(db, meal_type, meal, [
        {"date": today, "slots": ["followed", "followed", "followed"]},
    ])

    response = await client.get("/api/v1/stats?days=1")
    data = response.json()

    assert Decimal(data["adherence_rate"]) == Decimal("1.000")


# =============================================================================
# GET /api/v1/stats - Streaks
# =============================================================================


@pytest.mark.asyncio
async def test_stats_current_streak(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """Current streak counts consecutive days with all slots marked."""
    today = date.today()
    # 3 consecutive days fully marked, starting from today backwards
    await _create_week_with_slots(db, meal_type, meal, [
        {"date": today, "slots": ["followed"]},
        {"date": today - timedelta(days=1), "slots": ["followed"]},
        {"date": today - timedelta(days=2), "slots": ["followed"]},
        # Day 3 ago has unmarked slot -> streak breaks
        {"date": today - timedelta(days=3), "slots": [None]},
    ])

    response = await client.get("/api/v1/stats?days=7")
    data = response.json()

    assert data["current_streak"] == 3


@pytest.mark.asyncio
async def test_stats_streak_breaks_on_unmarked(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """Streak breaks when today has an unmarked slot."""
    today = date.today()
    await _create_week_with_slots(db, meal_type, meal, [
        {"date": today, "slots": ["followed", None]},  # One unmarked -> no streak today
        {"date": today - timedelta(days=1), "slots": ["followed"]},
    ])

    response = await client.get("/api/v1/stats?days=7")
    data = response.json()

    assert data["current_streak"] == 0


@pytest.mark.asyncio
async def test_stats_best_streak(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """Best streak finds the longest consecutive fully-marked run."""
    today = date.today()
    # Days: today (marked), yesterday (unmarked), 2 ago (marked), 3 ago (marked), 4 ago (marked)
    # Best streak = 3 (days 2, 3, 4 ago), current streak = 1 (today only)
    await _create_week_with_slots(db, meal_type, meal, [
        {"date": today, "slots": ["followed"]},
        {"date": today - timedelta(days=1), "slots": [None]},
        {"date": today - timedelta(days=2), "slots": ["followed"]},
        {"date": today - timedelta(days=3), "slots": ["adjusted"]},
        {"date": today - timedelta(days=4), "slots": ["skipped"]},
    ])

    response = await client.get("/api/v1/stats?days=7")
    data = response.json()

    assert data["current_streak"] == 1
    assert data["best_streak"] == 3


# =============================================================================
# GET /api/v1/stats - Override days
# =============================================================================


@pytest.mark.asyncio
async def test_stats_override_days(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """Override days are counted correctly."""
    today = date.today()
    await _create_week_with_slots(db, meal_type, meal, [
        {"date": today, "slots": ["followed"], "is_override": False},
        {"date": today - timedelta(days=1), "slots": [], "is_override": True},
        {"date": today - timedelta(days=2), "slots": [], "is_override": True},
    ])

    response = await client.get("/api/v1/stats?days=7")
    data = response.json()

    assert data["override_days"] == 2


# =============================================================================
# GET /api/v1/stats - Per-meal-type breakdown
# =============================================================================


@pytest.mark.asyncio
async def test_stats_by_meal_type(
    client: AsyncClient, db: AsyncSession, meal: Meal
):
    """Per-meal-type breakdown sorted by lowest adherence."""
    today = date.today()

    # Create two meal types
    mt_breakfast = MealType(id=uuid4(), name=f"Breakfast {uuid4().hex[:8]}")
    mt_lunch = MealType(id=uuid4(), name=f"Lunch {uuid4().hex[:8]}")
    db.add(mt_breakfast)
    db.add(mt_lunch)
    await db.flush()

    instance = WeeklyPlanInstance(id=uuid4(), week_start_date=today - timedelta(days=today.weekday()))
    db.add(instance)
    await db.flush()

    instance_day = WeeklyPlanInstanceDay(
        id=uuid4(), weekly_plan_instance_id=instance.id, date=today
    )
    db.add(instance_day)

    # Breakfast: 2 followed out of 2 = 100%
    for i in range(2):
        db.add(WeeklyPlanSlot(
            id=uuid4(), weekly_plan_instance_id=instance.id,
            date=today, position=i, meal_type_id=mt_breakfast.id,
            meal_id=meal.id, completion_status="followed",
        ))

    # Lunch: 1 followed out of 2 = 50%
    db.add(WeeklyPlanSlot(
        id=uuid4(), weekly_plan_instance_id=instance.id,
        date=today, position=2, meal_type_id=mt_lunch.id,
        meal_id=meal.id, completion_status="followed",
    ))
    db.add(WeeklyPlanSlot(
        id=uuid4(), weekly_plan_instance_id=instance.id,
        date=today, position=3, meal_type_id=mt_lunch.id,
        meal_id=meal.id, completion_status="skipped",
    ))
    await db.flush()

    response = await client.get("/api/v1/stats?days=1")
    data = response.json()

    by_type = data["by_meal_type"]
    assert len(by_type) == 2
    # Sorted by lowest adherence first -> Lunch (50%) before Breakfast (100%)
    assert by_type[0]["name"] == mt_lunch.name
    assert Decimal(by_type[0]["adherence_rate"]) == Decimal("0.500")
    assert by_type[1]["name"] == mt_breakfast.name
    assert Decimal(by_type[1]["adherence_rate"]) == Decimal("1.000")


# =============================================================================
# GET /api/v1/stats - Daily adherence
# =============================================================================


@pytest.mark.asyncio
async def test_stats_daily_adherence(
    client: AsyncClient, db: AsyncSession, meal_type: MealType, meal: Meal
):
    """Daily adherence returns per-day data points."""
    today = date.today()
    yesterday = today - timedelta(days=1)

    await _create_week_with_slots(db, meal_type, meal, [
        {"date": yesterday, "slots": ["followed", "skipped"]},  # 50%
        {"date": today, "slots": ["followed", "followed"]},     # 100%
    ])

    response = await client.get("/api/v1/stats?days=2")
    data = response.json()

    daily = data["daily_adherence"]
    assert len(daily) == 2

    # Ordered by date ascending
    assert daily[0]["date"] == yesterday.isoformat()
    assert Decimal(daily[0]["adherence_rate"]) == Decimal("0.500")
    assert daily[0]["total"] == 2
    assert daily[0]["followed"] == 1

    assert daily[1]["date"] == today.isoformat()
    assert Decimal(daily[1]["adherence_rate"]) == Decimal("1.000")
    assert daily[1]["total"] == 2
    assert daily[1]["followed"] == 2


# =============================================================================
# GET /api/v1/stats - Query parameter validation
# =============================================================================


@pytest.mark.asyncio
async def test_stats_custom_days(client: AsyncClient):
    """GET /stats accepts custom days parameter."""
    response = await client.get("/api/v1/stats?days=7")
    assert response.status_code == 200
    assert response.json()["period_days"] == 7


@pytest.mark.asyncio
async def test_stats_invalid_days_zero(client: AsyncClient):
    """GET /stats rejects days=0."""
    response = await client.get("/api/v1/stats?days=0")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_stats_invalid_days_too_large(client: AsyncClient):
    """GET /stats rejects days > 365."""
    response = await client.get("/api/v1/stats?days=400")
    assert response.status_code == 422
