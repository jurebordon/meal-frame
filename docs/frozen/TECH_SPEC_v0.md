# Technical Specification
# Meal Planning App — "MealFrame"

**Version:** 1.1 (Revised)  
**Last Updated:** January 2025  
**Status:** MVP Specification

---

## 1. Architecture Overview

### 1.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+ (React) | PWA support, SSR for fast initial load, TypeScript |
| **Backend** | FastAPI (Python) | Async support, automatic OpenAPI docs, Pydantic validation |
| **Database** | PostgreSQL 15+ | JSONB for flexibility, UUID support, robust |
| **Deployment** | Docker Compose | Simple single-host deployment for MVP |
| **PWA** | next-pwa | Service worker, offline support, installable |

### 1.2 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js PWA (Mobile-First)                  │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Today   │  │ Week    │  │ Meals   │  │ Setup   │    │   │
│  │  │ View    │  │ View    │  │ Library │  │ Screens │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  │                      │                                   │   │
│  │              Service Worker (Offline Cache)              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    FastAPI Backend                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ API Routes  │  │ Services    │  │ Round-Robin │     │   │
│  │  │ (Pydantic)  │  │ (Business)  │  │ Algorithm   │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ SQLAlchemy / asyncpg             │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Design Principles

1. **Single-user MVP, multi-user ready:** No auth in MVP, but all tables include `user_id` as nullable FK for future extension.
2. **Offline-first for consumption:** Today View must work without network.
3. **API-first:** All business logic exposed via REST API; frontend is a consumer.
4. **Deterministic generation:** Same inputs produce identical weekly plans.

---

## 2. Data Model

### 2.1 Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────┐
│  meal_type   │◄──────│ meal_to_meal_type │──────►│    meal      │
└──────────────┘       └───────────────────┘       └──────────────┘
       │                                                   │
       │                                                   │
       ▼                                                   │
┌──────────────────┐                                       │
│ day_template_slot│                                       │
└──────────────────┘                                       │
       │                                                   │
       │                                                   │
       ▼                                                   │
┌──────────────────┐       ┌───────────────┐              │
│  day_template    │◄──────│ week_plan_day │              │
└──────────────────┘       └───────────────┘              │
                                  │                        │
                                  ▼                        │
                           ┌───────────────┐              │
                           │   week_plan   │              │
                           └───────────────┘              │
                                  │                        │
                                  │ generates              │
                                  ▼                        │
                    ┌─────────────────────────┐           │
                    │ weekly_plan_instance    │           │
                    └─────────────────────────┘           │
                                  │                        │
                                  ▼                        │
                    ┌─────────────────────────┐           │
                    │ weekly_plan_instance_day│           │
                    └─────────────────────────┘           │
                                  │                        │
                                  ▼                        │
                    ┌─────────────────────────┐           │
                    │   weekly_plan_slot      │───────────┘
                    └─────────────────────────┘
                    
┌──────────────────┐
│ round_robin_state│ (tracks rotation per meal_type)
└──────────────────┘

┌──────────────────┐
│   app_config     │ (single-row configuration)
└──────────────────┘
```

### 2.2 Table Definitions

#### 2.2.1 meal_type

Defines functional eating slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | TEXT | NOT NULL, UNIQUE | Display name |
| description | TEXT | | Purpose and intent |
| tags | TEXT[] | DEFAULT '{}' | Categorization tags |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Indexes:**
- `meal_type_name_idx` on `name`

---

#### 2.2.2 meal

Defines specific foods with portions and macros.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | TEXT | NOT NULL | Display name |
| portion_description | TEXT | NOT NULL | Exact portion (e.g., "2 eggs + 1 slice toast") |
| calories_kcal | INTEGER | | Calories for defined portion |
| protein_g | NUMERIC(6,1) | | Protein grams |
| carbs_g | NUMERIC(6,1) | | Carbohydrate grams |
| fat_g | NUMERIC(6,1) | | Fat grams |
| notes | TEXT | | Preparation notes |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Indexes:**
- `meal_name_idx` on `name`
- `meal_created_at_idx` on `created_at` (for round-robin ordering)

---

#### 2.2.3 meal_to_meal_type

Junction table for many-to-many relationship.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| meal_id | UUID | FK → meal(id) ON DELETE CASCADE | Meal reference |
| meal_type_id | UUID | FK → meal_type(id) ON DELETE CASCADE | Meal type reference |
| | | PRIMARY KEY (meal_id, meal_type_id) | Composite key |

---

#### 2.2.4 day_template

Defines reusable day patterns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | TEXT | NOT NULL, UNIQUE | Display name |
| notes | TEXT | | Usage context |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

---

#### 2.2.5 day_template_slot

Ordered meal type slots within a day template.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| day_template_id | UUID | FK → day_template(id) ON DELETE CASCADE | Parent template |
| position | INTEGER | NOT NULL | Sequence order (1, 2, 3...) |
| meal_type_id | UUID | FK → meal_type(id) ON DELETE RESTRICT | Meal type for slot |
| | | UNIQUE (day_template_id, position) | No duplicate positions |

**Indexes:**
- `day_template_slot_template_idx` on `day_template_id`

---

#### 2.2.6 week_plan

Defines default week structure.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | TEXT | NOT NULL | Display name |
| is_default | BOOLEAN | DEFAULT false | Only one can be default |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Constraint:** Application-level enforcement of single default.

---

#### 2.2.7 week_plan_day

Maps day templates to weekdays within a week plan.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| week_plan_id | UUID | FK → week_plan(id) ON DELETE CASCADE | Parent week plan |
| weekday | INTEGER | NOT NULL, CHECK (0-6) | 0=Monday, 6=Sunday |
| day_template_id | UUID | FK → day_template(id) ON DELETE RESTRICT | Template for this day |
| | | UNIQUE (week_plan_id, weekday) | One template per weekday |

---

#### 2.2.8 weekly_plan_instance

Generated instance of a week.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| week_plan_id | UUID | FK → week_plan(id) ON DELETE SET NULL | Source template |
| week_start_date | DATE | NOT NULL, UNIQUE | Monday of the week |
| created_at | TIMESTAMPTZ | DEFAULT now() | Generation timestamp |

**Indexes:**
- `weekly_plan_instance_date_idx` on `week_start_date`

---

#### 2.2.9 weekly_plan_instance_day

Tracks template used for each day (supports switching).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| weekly_plan_instance_id | UUID | FK → weekly_plan_instance(id) ON DELETE CASCADE | Parent instance |
| date | DATE | NOT NULL | Specific date |
| day_template_id | UUID | FK → day_template(id) ON DELETE SET NULL | Template used |
| is_override | BOOLEAN | DEFAULT false | "No plan" day |
| override_reason | TEXT | | Reason for override |
| created_at | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| | | UNIQUE (weekly_plan_instance_id, date) | One record per day |

**Indexes:**
- `weekly_plan_instance_day_date_idx` on `date`

---

#### 2.2.10 weekly_plan_slot

Individual meal slots with assignments and completion tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| weekly_plan_instance_id | UUID | FK → weekly_plan_instance(id) ON DELETE CASCADE | Parent instance |
| date | DATE | NOT NULL | Specific date |
| position | INTEGER | NOT NULL | Sequence within day |
| meal_type_id | UUID | FK → meal_type(id) ON DELETE SET NULL | Meal type for slot |
| meal_id | UUID | FK → meal(id) ON DELETE SET NULL | Assigned meal |
| completion_status | TEXT | CHECK (enum values) | Tracking status |
| completed_at | TIMESTAMPTZ | | When marked complete |
| | | UNIQUE (weekly_plan_instance_id, date, position) | No duplicate slots |

**completion_status enum values:** `'followed'`, `'adjusted'`, `'skipped'`, `'replaced'`, `'social'`, `NULL`

**Indexes:**
- `weekly_plan_slot_date_idx` on `date`
- `weekly_plan_slot_instance_date_idx` on `(weekly_plan_instance_id, date)`

---

#### 2.2.11 round_robin_state

Tracks rotation state per meal type.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| meal_type_id | UUID | PK, FK → meal_type(id) ON DELETE CASCADE | Meal type |
| last_meal_id | UUID | FK → meal(id) ON DELETE SET NULL | Last used meal |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last rotation |

---

#### 2.2.12 app_config

Single-row application configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, CHECK (id = 1) | Forces single row |
| timezone | TEXT | DEFAULT 'UTC' | User timezone |
| week_start_day | INTEGER | DEFAULT 0 | 0=Monday |
| default_week_plan_id | UUID | FK → week_plan(id) | Default plan |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Last update |

---

## 3. Round-Robin Algorithm

### 3.1 Specification

```python
from typing import Optional
from uuid import UUID
from datetime import datetime

def get_next_meal_for_type(
    db: Session, 
    meal_type_id: UUID
) -> Optional[Meal]:
    """
    Select the next meal for a meal type using round-robin rotation.
    
    Ordering: Meals are ordered by (created_at ASC, id ASC) for determinism.
    State: Last-used meal ID is tracked; next meal is the one after it.
    Edge cases:
        - No meals: returns None
        - One meal: always returns that meal
        - Deleted meal in state: resets to first meal
        - New meal added: appended to rotation (highest created_at)
    """
    
    # Get all meals for this type, deterministically ordered
    meals = (
        db.query(Meal)
        .join(MealToMealType)
        .filter(MealToMealType.meal_type_id == meal_type_id)
        .order_by(Meal.created_at.asc(), Meal.id.asc())
        .all()
    )
    
    if not meals:
        return None
    
    if len(meals) == 1:
        # Single meal - always return it, update state
        _update_state(db, meal_type_id, meals[0].id)
        return meals[0]
    
    # Get current state
    state = (
        db.query(RoundRobinState)
        .filter(RoundRobinState.meal_type_id == meal_type_id)
        .first()
    )
    
    if state is None or state.last_meal_id is None:
        # No state - start with first meal
        next_meal = meals[0]
    else:
        # Find index of last used meal
        last_index = -1
        for i, meal in enumerate(meals):
            if meal.id == state.last_meal_id:
                last_index = i
                break
        
        # If last meal was deleted (not found), reset to start
        # Otherwise, advance to next
        next_index = (last_index + 1) % len(meals)
        next_meal = meals[next_index]
    
    # Update state
    _update_state(db, meal_type_id, next_meal.id)
    
    return next_meal


def _update_state(db: Session, meal_type_id: UUID, meal_id: UUID):
    """Upsert round-robin state."""
    state = (
        db.query(RoundRobinState)
        .filter(RoundRobinState.meal_type_id == meal_type_id)
        .first()
    )
    
    if state:
        state.last_meal_id = meal_id
        state.updated_at = datetime.utcnow()
    else:
        state = RoundRobinState(
            meal_type_id=meal_type_id,
            last_meal_id=meal_id,
            updated_at=datetime.utcnow()
        )
        db.add(state)
    
    db.flush()
```

### 3.2 Week Generation Algorithm

```python
from datetime import date, timedelta

def generate_weekly_plan(
    db: Session,
    week_start_date: date,
    week_plan_id: Optional[UUID] = None
) -> WeeklyPlanInstance:
    """
    Generate a new weekly plan instance.
    
    Args:
        week_start_date: Monday of the target week
        week_plan_id: Optional specific plan; uses default if not provided
    
    Process:
        1. Create weekly_plan_instance record
        2. For each day (Mon-Sun):
           a. Get day template from week plan
           b. Create weekly_plan_instance_day record
           c. For each slot in template:
              - Get next meal via round-robin
              - Create weekly_plan_slot record
    
    Returns:
        Complete WeeklyPlanInstance with all relations loaded
    """
    
    # Get week plan
    if week_plan_id:
        week_plan = db.query(WeekPlan).get(week_plan_id)
    else:
        week_plan = (
            db.query(WeekPlan)
            .filter(WeekPlan.is_default == True)
            .first()
        )
    
    if not week_plan:
        raise ValueError("No week plan available")
    
    # Check for existing instance
    existing = (
        db.query(WeeklyPlanInstance)
        .filter(WeeklyPlanInstance.week_start_date == week_start_date)
        .first()
    )
    if existing:
        raise ValueError(f"Week starting {week_start_date} already exists")
    
    # Create instance
    instance = WeeklyPlanInstance(
        week_plan_id=week_plan.id,
        week_start_date=week_start_date
    )
    db.add(instance)
    db.flush()
    
    # Build day map from week plan
    day_map = {
        wpd.weekday: wpd.day_template_id 
        for wpd in week_plan.days
    }
    
    # Generate each day
    for day_offset in range(7):
        current_date = week_start_date + timedelta(days=day_offset)
        weekday = day_offset  # 0=Monday
        
        template_id = day_map.get(weekday)
        if not template_id:
            continue
        
        # Create day record
        instance_day = WeeklyPlanInstanceDay(
            weekly_plan_instance_id=instance.id,
            date=current_date,
            day_template_id=template_id,
            is_override=False
        )
        db.add(instance_day)
        
        # Get template slots
        template = db.query(DayTemplate).get(template_id)
        slots = sorted(template.slots, key=lambda s: s.position)
        
        # Generate meal for each slot
        for slot in slots:
            meal = get_next_meal_for_type(db, slot.meal_type_id)
            
            plan_slot = WeeklyPlanSlot(
                weekly_plan_instance_id=instance.id,
                date=current_date,
                position=slot.position,
                meal_type_id=slot.meal_type_id,
                meal_id=meal.id if meal else None,
                completion_status=None,
                completed_at=None
            )
            db.add(plan_slot)
    
    db.commit()
    db.refresh(instance)
    
    return instance
```

### 3.3 Day Template Switch Algorithm

```python
def switch_day_template(
    db: Session,
    instance_id: UUID,
    target_date: date,
    new_template_id: UUID
) -> WeeklyPlanInstanceDay:
    """
    Switch a day's template and regenerate its slots.
    
    Process:
        1. Delete existing slots for the day
        2. Update instance_day record with new template
        3. Generate new slots with round-robin meals
    
    Note: Completion statuses are lost when switching.
    """
    
    # Get instance day
    instance_day = (
        db.query(WeeklyPlanInstanceDay)
        .filter(
            WeeklyPlanInstanceDay.weekly_plan_instance_id == instance_id,
            WeeklyPlanInstanceDay.date == target_date
        )
        .first()
    )
    
    if not instance_day:
        raise ValueError(f"No day record for {target_date}")
    
    # Delete existing slots
    db.query(WeeklyPlanSlot).filter(
        WeeklyPlanSlot.weekly_plan_instance_id == instance_id,
        WeeklyPlanSlot.date == target_date
    ).delete()
    
    # Update template
    instance_day.day_template_id = new_template_id
    instance_day.is_override = False
    instance_day.override_reason = None
    instance_day.updated_at = datetime.utcnow()
    
    # Get new template slots
    template = db.query(DayTemplate).get(new_template_id)
    slots = sorted(template.slots, key=lambda s: s.position)
    
    # Generate new meals
    for slot in slots:
        meal = get_next_meal_for_type(db, slot.meal_type_id)
        
        plan_slot = WeeklyPlanSlot(
            weekly_plan_instance_id=instance_id,
            date=target_date,
            position=slot.position,
            meal_type_id=slot.meal_type_id,
            meal_id=meal.id if meal else None,
            completion_status=None,
            completed_at=None
        )
        db.add(plan_slot)
    
    db.commit()
    db.refresh(instance_day)
    
    return instance_day
```

---

## 4. API Design

### 4.1 Overview

- **Protocol:** REST over HTTPS
- **Format:** JSON
- **Validation:** Pydantic models with automatic OpenAPI generation
- **Errors:** Standard HTTP status codes with JSON error bodies

### 4.2 Base URL

```
Production: https://mealframe.local/api/v1
Development: http://localhost:8000/api/v1
```

### 4.3 Primary Endpoints (Daily Use)

#### GET /today

Returns today's meal plan with completion status.

**Response:**
```json
{
  "date": "2025-01-07",
  "weekday": "Tuesday",
  "template": {
    "id": "uuid",
    "name": "Morning Workout Workday"
  },
  "is_override": false,
  "override_reason": null,
  "slots": [
    {
      "id": "uuid",
      "position": 1,
      "meal_type": {
        "id": "uuid",
        "name": "Pre-Workout Breakfast"
      },
      "meal": {
        "id": "uuid",
        "name": "Oatmeal with Protein",
        "portion_description": "60g oats + 1 scoop whey + 1 banana",
        "calories_kcal": 450,
        "protein_g": 35,
        "carbs_g": 55,
        "fat_g": 8
      },
      "completion_status": "followed",
      "completed_at": "2025-01-07T07:30:00Z",
      "is_next": false
    },
    {
      "id": "uuid",
      "position": 2,
      "meal_type": {
        "id": "uuid",
        "name": "Post-Workout Snack"
      },
      "meal": {
        "id": "uuid",
        "name": "Greek Yogurt Bowl",
        "portion_description": "200g Greek yogurt + 30g granola + berries",
        "calories_kcal": 320,
        "protein_g": 25,
        "carbs_g": 35,
        "fat_g": 10
      },
      "completion_status": null,
      "completed_at": null,
      "is_next": true
    }
    // ... more slots
  ],
  "stats": {
    "completed": 1,
    "total": 5,
    "streak_days": 4
  }
}
```

**`is_next` logic:** First slot where `completion_status` is `null`.

---

#### GET /yesterday

Returns yesterday's plan for review/catch-up.

**Response:** Same structure as `/today`.

---

#### POST /slots/{slot_id}/complete

Mark a slot as complete with status.

**Request:**
```json
{
  "status": "followed"
}
```

**Valid statuses:** `followed`, `adjusted`, `skipped`, `replaced`, `social`

**Response:**
```json
{
  "id": "uuid",
  "completion_status": "followed",
  "completed_at": "2025-01-07T12:30:00Z"
}
```

---

#### DELETE /slots/{slot_id}/complete

Undo completion (reset to null).

**Response:**
```json
{
  "id": "uuid",
  "completion_status": null,
  "completed_at": null
}
```

---

#### GET /stats

Get adherence statistics.

**Query parameters:**
- `days` (optional, default 30): Number of days to analyze

**Response:**
```json
{
  "period_days": 30,
  "total_slots": 145,
  "completed_slots": 130,
  "by_status": {
    "followed": 110,
    "adjusted": 15,
    "skipped": 3,
    "replaced": 2,
    "social": 5,
    "unmarked": 10
  },
  "adherence_rate": 0.86,
  "current_streak": 4,
  "best_streak": 12,
  "override_days": 2,
  "by_meal_type": [
    {
      "meal_type_id": "uuid",
      "name": "Dinner",
      "total": 30,
      "followed": 22,
      "adherence_rate": 0.73
    }
    // ... more types
  ]
}
```

**Adherence calculation:** `(followed + adjusted) / (total - social - unmarked)`

---

### 4.4 Weekly Planning Endpoints

#### GET /weekly-plans/current

Get the current week's plan.

**Response:**
```json
{
  "id": "uuid",
  "week_start_date": "2025-01-06",
  "week_plan": {
    "id": "uuid",
    "name": "Default Week"
  },
  "days": [
    {
      "date": "2025-01-06",
      "weekday": "Monday",
      "template": {
        "id": "uuid",
        "name": "Normal Workday"
      },
      "is_override": false,
      "slots": [ /* slot objects */ ],
      "completion_summary": {
        "completed": 3,
        "total": 5
      }
    }
    // ... 7 days
  ]
}
```

---

#### POST /weekly-plans/generate

Generate a new week.

**Request:**
```json
{
  "week_start_date": "2025-01-13"  // optional, defaults to next Monday
}
```

**Response:** Full `WeeklyPlanInstance` object.

**Errors:**
- `409 Conflict`: Week already exists

---

#### PUT /weekly-plans/current/days/{date}/template

Switch a day's template.

**Request:**
```json
{
  "day_template_id": "uuid"
}
```

**Response:** Updated day object with regenerated slots.

---

#### PUT /weekly-plans/current/days/{date}/override

Mark day as "no plan".

**Request:**
```json
{
  "reason": "LAN party"  // optional
}
```

**Response:**
```json
{
  "date": "2025-01-11",
  "is_override": true,
  "override_reason": "LAN party"
}
```

---

#### DELETE /weekly-plans/current/days/{date}/override

Remove override, restore plan.

**Response:** Day object with `is_override: false` and slots restored.

---

### 4.5 Setup/Admin Endpoints

#### Meals

```
GET    /meals                 List all meals (paginated)
POST   /meals                 Create meal
GET    /meals/{id}            Get meal detail
PUT    /meals/{id}            Update meal
DELETE /meals/{id}            Delete meal
POST   /meals/import          CSV import (multipart/form-data)
```

**Create/Update meal request:**
```json
{
  "name": "Scrambled Eggs",
  "portion_description": "2 eggs + 1 slice toast + 10g butter",
  "calories_kcal": 320,
  "protein_g": 18,
  "carbs_g": 15,
  "fat_g": 22,
  "notes": "Use whole wheat toast",
  "meal_type_ids": ["uuid", "uuid"]
}
```

---

#### Meal Types

```
GET    /meal-types            List all meal types
POST   /meal-types            Create meal type
PUT    /meal-types/{id}       Update meal type
DELETE /meal-types/{id}       Delete meal type
```

---

#### Day Templates

```
GET    /day-templates         List all templates with slots
POST   /day-templates         Create template
PUT    /day-templates/{id}    Update template (including slots)
DELETE /day-templates/{id}    Delete template
```

**Create/Update template request:**
```json
{
  "name": "Morning Workout Workday",
  "notes": "Use on days with morning gym sessions",
  "slots": [
    { "position": 1, "meal_type_id": "uuid" },
    { "position": 2, "meal_type_id": "uuid" },
    { "position": 3, "meal_type_id": "uuid" }
  ]
}
```

---

#### Week Plans

```
GET    /week-plans            List all week plans
POST   /week-plans            Create week plan
PUT    /week-plans/{id}       Update week plan
DELETE /week-plans/{id}       Delete week plan
POST   /week-plans/{id}/set-default   Set as default
```

**Create/Update week plan request:**
```json
{
  "name": "Standard Training Week",
  "days": [
    { "weekday": 0, "day_template_id": "uuid" },
    { "weekday": 1, "day_template_id": "uuid" },
    // ... all 7 days
  ]
}
```

---

### 4.6 Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "portion_description",
        "message": "This field is required"
      }
    ]
  }
}
```

**Error codes:**
- `VALIDATION_ERROR` (400)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)

---

## 5. Frontend Architecture

### 5.1 Screen Hierarchy

```
App
├── Today View (/)                    [PRIMARY - Mobile First]
│   ├── Header (date, streak, progress)
│   ├── Next Meal Card (prominent)
│   ├── Meal List (remaining slots)
│   └── Yesterday Review Modal (conditional)
│
├── Week View (/week)                 [Secondary]
│   ├── Week Header (date range, generate button)
│   ├── Day Cards (7 days)
│   │   ├── Day Header (date, template name, edit)
│   │   ├── Slot List (collapsed by default)
│   │   └── Completion Summary
│   └── Template Picker Modal
│
├── Meals Library (/meals)            [Setup - Desktop]
│   ├── Search/Filter Bar
│   ├── Meal List
│   ├── Meal Editor Modal
│   └── CSV Import Modal
│
├── Setup (/setup)                    [Setup - Desktop]
│   ├── Meal Types Tab
│   ├── Day Templates Tab
│   └── Week Plan Tab
│
└── Stats (/stats)                    [Secondary]
    ├── Overall Adherence
    ├── Streak History
    └── By Meal Type Breakdown
```

### 5.2 Component Design (Today View)

```tsx
// Primary screen components

<TodayView>
  <Header>
    <DateDisplay date={today} />
    <StreakBadge days={4} />
    <ProgressRing completed={3} total={5} />
  </Header>
  
  <NextMealCard slot={nextSlot} onComplete={handleComplete} />
  
  <MealList>
    {slots.map(slot => (
      <MealSlotRow 
        key={slot.id}
        slot={slot}
        isNext={slot.is_next}
        onComplete={handleComplete}
      />
    ))}
  </MealList>
  
  {showYesterdayReview && (
    <YesterdayReviewModal 
      slots={yesterdaySlots}
      onComplete={handleBatchComplete}
      onDismiss={dismissReview}
    />
  )}
</TodayView>

<CompletionModal 
  slot={selectedSlot}
  onSelect={handleStatusSelect}
  onClose={closeModal}
>
  <StatusButton status="followed" icon="✅" label="Followed" />
  <StatusButton status="adjusted" icon="⚠️" label="Adjusted" />
  <StatusButton status="skipped" icon="❌" label="Skipped" />
  <StatusButton status="replaced" icon="🔄" label="Replaced" />
  <StatusButton status="social" icon="🎉" label="Social" />
</CompletionModal>
```

### 5.3 PWA Configuration

**next.config.js:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Next.js config
});
```

**manifest.json:**
```json
{
  "name": "MealFrame",
  "short_name": "MealFrame",
  "description": "Structured meal planning for reduced decision fatigue",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 5.4 Offline Strategy

**Cached (Service Worker):**
- App shell (HTML, CSS, JS)
- `/api/v1/today` response (refreshed on each visit)
- Static assets

**Network-first:**
- `/api/v1/weekly-plans/*`
- All write operations

**Offline behavior:**
- Today View readable from cache
- Completion actions queued for sync when online
- Clear "offline" indicator in UI

---

## 6. Data Import

### 6.1 CSV Format

```csv
name,portion_description,calories_kcal,protein_g,carbs_g,fat_g,meal_types,notes
"Scrambled Eggs","2 eggs + 1 slice toast",320,18,15,22,"Breakfast,Weekend Breakfast","Use whole wheat"
"Oatmeal Protein","60g oats + 1 scoop whey + banana",450,35,55,8,"Pre-Workout Breakfast",""
"Greek Yogurt Bowl","200g yogurt + 30g granola",320,25,35,10,"Post-Workout Snack,Afternoon Filler",""
```

**Columns:**
| Column | Required | Description |
|--------|----------|-------------|
| name | Yes | Meal name |
| portion_description | Yes | Exact portions |
| calories_kcal | No | Integer |
| protein_g | No | Decimal |
| carbs_g | No | Decimal |
| fat_g | No | Decimal |
| meal_types | No | Comma-separated Meal Type names |
| notes | No | Free text |

### 6.2 Import Behavior

- Meals are created (not updated) on import
- Meal Types in CSV must exist; non-matching types are logged as warnings
- Duplicate meal names are allowed (different portions)
- Import returns summary: created count, warnings, errors

---

## 7. Deployment

### 7.1 Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mealframe
      POSTGRES_USER: mealframe
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mealframe"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://mealframe:${DB_PASSWORD}@db:5432/mealframe
      CORS_ORIGINS: http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8000:8000"

  web:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    depends_on:
      - api
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### 7.2 Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | db, api | PostgreSQL password |
| `DATABASE_URL` | api | Full connection string |
| `CORS_ORIGINS` | api | Allowed origins (comma-separated) |
| `NEXT_PUBLIC_API_URL` | web | API base URL |

### 7.3 Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
docker exec mealframe_db_1 pg_dump -U mealframe mealframe > backup_$DATE.sql
```

---

## 8. Testing Strategy

### 8.1 Backend

- **Unit tests:** Round-robin algorithm, date calculations
- **Integration tests:** API endpoints with test database
- **Key scenarios:**
  - Week generation with various template configurations
  - Template switching mid-week
  - Round-robin with meal additions/deletions
  - Edge case: empty meal type

### 8.2 Frontend

- **Component tests:** Completion modal, meal cards
- **Integration tests:** Today View with mocked API
- **E2E tests (Playwright):**
  - Complete a meal flow
  - Generate new week flow
  - Offline behavior

---

## 9. Future Technical Considerations

### 9.1 Multi-User Extension

When adding authentication:
1. Add `user_id` column to all user-data tables
2. Add `users` table with auth fields
3. Add API authentication middleware
4. Scope all queries by `user_id`

### 9.2 Performance

Current design supports single-user well. For multi-user:
- Add indexes on `user_id` columns
- Consider read replicas for stats queries
- Cache frequently-accessed data (today's plan)

### 9.3 Mobile Native

If PWA proves insufficient:
- React Native for iOS/Android
- Shared API (no changes needed)
- Consider: widgets, watch app, notifications

---

## Appendix A: File Structure

```
mealframe/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic/                 # DB migrations
│   │   └── versions/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Settings
│   │   ├── database.py          # DB connection
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── meal.py
│   │   │   ├── meal_type.py
│   │   │   ├── day_template.py
│   │   │   ├── week_plan.py
│   │   │   └── weekly_plan.py
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # Route handlers
│   │   │   ├── today.py
│   │   │   ├── weekly_plans.py
│   │   │   ├── meals.py
│   │   │   └── setup.py
│   │   └── services/            # Business logic
│   │       ├── round_robin.py
│   │       ├── week_generator.py
│   │       └── stats.py
│   └── tests/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── page.tsx         # Today View
│   │   │   ├── week/page.tsx
│   │   │   ├── meals/page.tsx
│   │   │   ├── setup/page.tsx
│   │   │   └── stats/page.tsx
│   │   ├── components/
│   │   │   ├── MealCard.tsx
│   │   │   ├── CompletionModal.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   └── types.ts
│   │   └── hooks/
│   └── tests/
└── README.md
```

---

## Appendix B: Recommended Libraries

### Backend (Python)

| Library | Purpose |
|---------|---------|
| fastapi | Web framework |
| uvicorn | ASGI server |
| sqlalchemy[asyncio] | ORM |
| asyncpg | PostgreSQL driver |
| alembic | Migrations |
| pydantic | Validation |
| python-multipart | File uploads |

### Frontend (TypeScript)

| Library | Purpose |
|---------|---------|
| next | Framework |
| react | UI |
| tailwindcss | Styling |
| @tanstack/react-query | Data fetching |
| zustand | State management |
| next-pwa | PWA support |
| framer-motion | Animations |
