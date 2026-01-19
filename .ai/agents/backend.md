# Backend Development Agent

> Guidelines for backend development on MealFrame

## Mission

Implement and maintain backend logic consistent with domain rules, architecture decisions, and API contracts for the MealFrame meal planning application.

## Tech Context

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **ORM/DB**: SQLAlchemy (async) + PostgreSQL 15+
- **Validation**: Pydantic schemas
- **Migrations**: Alembic
- **Testing**: pytest + httpx for async testing

## Structure

```
backend/
├── alembic/                    # DB migrations
│   └── versions/
├── app/
│   ├── main.py                 # FastAPI app entry
│   ├── config.py               # Settings (pydantic-settings)
│   ├── database.py             # DB connection & session
│   ├── models/                 # SQLAlchemy models
│   │   ├── meal.py
│   │   ├── meal_type.py
│   │   ├── day_template.py
│   │   ├── week_plan.py
│   │   └── weekly_plan.py
│   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── meal.py
│   │   ├── today.py
│   │   └── ...
│   ├── api/                    # Route handlers
│   │   ├── today.py            # GET /today, /yesterday
│   │   ├── weekly_plans.py     # Weekly planning endpoints
│   │   ├── meals.py            # Meal CRUD + import
│   │   └── setup.py            # Meal types, templates, plans
│   └── services/               # Business logic
│       ├── round_robin.py      # Round-robin algorithm
│       ├── week_generator.py   # Week generation logic
│       └── stats.py            # Adherence calculations
└── tests/
    ├── unit/                   # Service/algorithm tests
    └── integration/            # API endpoint tests
```

## Responsibilities

### API Development
- Implement endpoints according to Tech Spec (docs/frozen/TECH_SPEC_v0.md)
- Validate inputs at the boundary using Pydantic
- Return consistent JSON response formats
- Handle errors gracefully with appropriate HTTP status codes
- Use async/await consistently (FastAPI + asyncpg)

### Business Logic
- Keep business logic in services, not route handlers
- Services should be testable in isolation
- Round-robin algorithm MUST be deterministic (ADR-002)
- Use dependency injection (`Depends()`) for database sessions

### Data Access
- Use SQLAlchemy models for database operations
- Keep queries in model methods or dedicated repositories
- Handle transactions appropriately (commit/rollback)
- All tables have UUIDs as primary keys (per Tech Spec)

### Testing
- Write unit tests for services (especially round-robin)
- Write integration tests for API endpoints
- Test error cases, not just happy paths
- Test round-robin determinism (same inputs → same outputs)

## Patterns

### Do
- Service/repository pattern for separation
- Input validation at API boundary (Pydantic schemas)
- Consistent error response format (see Tech Spec section 4.6)
- Async database operations (`async with AsyncSession`)
- Database migrations for all schema changes (Alembic)
- Log at appropriate levels (use `logging` module)

### Don't
- Business logic in route handlers (FastAPI routes are thin)
- Raw SQL in service code (use SQLAlchemy ORM)
- Catch and swallow errors silently (log and re-raise or return error response)
- Hardcode configuration values (use pydantic-settings)
- Direct database access from routes (use dependency injection)
- Modify round-robin algorithm without updating ADR-002

## Key Invariants (from CLAUDE.md)

- **Round-robin is deterministic** - Ordering by `(created_at ASC, id ASC)` is mandatory
- **Portion descriptions are mandatory** - Enforce in Pydantic schema with validation
- **No auth in MVP** - But `user_id` columns exist (nullable) for future multi-user
- **Single-user assumption** - All queries assume single user, no WHERE user_id needed yet

## Session Ritual

### Before
- Read docs/ROADMAP.md for current task
- Review backend-related ADR entries (especially ADR-001, ADR-002, ADR-005)
- Check docs/OVERVIEW.md for current architecture
- Review docs/frozen/TECH_SPEC_v0.md for API contracts

### During
- Keep API behavior aligned with Tech Spec contracts
- If changing contracts, note for ADR update
- Run tests frequently during development (`pytest`)
- Test round-robin determinism if modifying meal generation

### After
- Ensure all backend tests pass
- Update docs/OVERVIEW.md if architecture changed
- Log any API contract changes for ADR entry
- Update docs/ROADMAP.md and docs/SESSION_LOG.md

## Common Tasks

### Adding an Endpoint
1. Define route in appropriate router (`app/api/*.py`)
2. Create Pydantic request/response schemas (`app/schemas/`)
3. Create/update service method for business logic (`app/services/`)
4. Create/update model method if data access needed (`app/models/`)
5. Add input validation in schema
6. Write tests (unit for service + integration for endpoint)
7. Verify against Tech Spec API design (section 4)

### Implementing Round-Robin
- See Tech Spec section 3.1 for algorithm specification
- Algorithm MUST be deterministic (ADR-002)
- Order meals by `(created_at ASC, id ASC)`
- Track state in `round_robin_state` table
- Handle edge cases: no meals, one meal, deleted meals

### Database Migration
1. Modify model in `app/models/`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration (never blindly trust autogenerate)
4. Test migration: `alembic upgrade head`
5. Test rollback: `alembic downgrade -1`, then `upgrade head` again
6. Commit migration file to git

### Fixing a Bug
1. Write a failing test that reproduces the bug
2. Fix the bug in service or model
3. Verify test passes
4. Check for similar issues elsewhere (grep for pattern)
5. Document in session log

### Refactoring
1. Ensure tests exist for current behavior
2. Make incremental changes
3. Run tests after each change (`pytest -v`)
4. Don't change behavior while refactoring

## API Error Format (Tech Spec 4.6)

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

Error codes: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_ERROR` (500)

---

*For general development workflow, see docs/WORKFLOW.md*
