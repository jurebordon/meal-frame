# MealFrame

> This file provides context for AI assistants working on this project.

## Project Overview

Meal planning app that eliminates decision fatigue with authoritative, pre-planned meals. Provides exact portions and clear instructions on what to eat, removing in-the-moment decisions that lead to overconsumption.

## Quick Context

- **Type**: greenfield
- **Stack**: FastAPI (Python) + Next.js 14+ (React/TypeScript) + PostgreSQL 15+
- **Git Workflow**: solo (direct merge to main)

## Documentation

Read these before making changes:

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | [ROADMAP.md](docs/ROADMAP.md) | Current tasks and priorities |
| 2 | [SESSION_LOG.md](docs/SESSION_LOG.md) | Recent session history |
| 3 | [OVERVIEW.md](docs/OVERVIEW.md) | System architecture |
| 4 | [ADR.md](docs/ADR.md) | Architecture decisions |
| 5 | [VISION.md](docs/VISION.md) | Product direction |

## Frozen Specs (Reference Only)

These are historical baselines - do not modify:

- [PRD_v0.md](docs/frozen/PRD_v0.md) - Original product requirements
- [TECH_SPEC_v0.md](docs/frozen/TECH_SPEC_v0.md) - Original technical specification
- [SEED_DATA.md](docs/frozen/SEED_DATA.md) - Seed data specification
- [MEAL_IMPORT_GUIDE.md](docs/frozen/MEAL_IMPORT_GUIDE.md) - Meal import guide

## Session Commands

Use these commands to structure your work:

- `/plan-session` - Prepare for implementation
- `/start-session` - Begin coding
- `/end-session` - Wrap up and merge
- `/pivot-session` - Reassess direction

Commands are in `.claude/commands/`.

## Key Patterns

### Backend (FastAPI/Python)

- See `.ai/agents/backend.md` for patterns
- Structure: FastAPI routes → Services → Models
- ORM: SQLAlchemy with async support
- Validation: Pydantic schemas
- Migrations: Alembic

### Frontend (Next.js/React)

- See `.ai/agents/frontend.md` for patterns
- Structure: App Router (Next.js 14+)
- State: Zustand + TanStack Query
- Styling: Tailwind CSS
- PWA: next-pwa for offline support

## Invariants

These rules must always hold:

- **Portion descriptions are mandatory** - Every meal must have exact portions (e.g., "2 eggs + 1 slice toast")
- **Round-robin is deterministic** - Same inputs always produce same meal assignments
- **No in-meal editing** - Users can only switch day templates, not individual meals
- **Completion tracking is optional** - Unmarked meals are valid, not errors
- **Single-user for MVP** - No auth, but data model is multi-user ready (nullable user_id)
- **Mobile-first consumption** - Today View must work offline and load instantly
- **Desktop for setup** - Meal library and templates are desktop workflows

## Git Workflow

### Solo Developer Flow

- Work on feature branches: `type/description`
- Branch types: `feat/`, `fix/`, `refactor/`, `docs/`
- Merge directly to main when tests pass
- No PR required (solo developer)

### Typical Flow

```bash
git checkout main && git pull
git checkout -b feat/my-feature
# ... work ...
# ... test ...
git add . && git commit -m "feat: description"
git checkout main
git merge feat/my-feature
git branch -d feat/my-feature
```

## Working Agreements

1. **One task per session** - Don't mix unrelated changes
2. **Update docs** - SESSION_LOG.md after every session, ROADMAP.md when tasks change
3. **Ask when unclear** - Don't invent requirements (reference frozen specs)
4. **No manual metrics** - Automated or nothing
5. **Respect frozen specs** - PRD and Tech Spec are baseline truth

## Getting Started

1. Run `/plan-session` to see current priorities
2. Pick ONE task from ROADMAP.md
3. Run `/start-session` to begin
4. When done, run `/end-session`

---

*This project uses [SpecFlow](https://github.com/jurebordon/specflow) for AI-assisted development.*
