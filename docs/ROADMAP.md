# Roadmap

**Last Updated**: 2026-01-19
**Current Phase**: MVP - Foundation

## Now (Current Work)

<!-- ONE task in progress at a time -->
- [ ] Set up project structure and development environment

## Next (Queued)

<!-- Priority ordered - top item is next -->
1. Set up backend foundation (FastAPI + PostgreSQL + Docker)
2. Implement database schema and migrations (Alembic)
3. Build core data models (Meal, MealType, DayTemplate, WeekPlan)
4. Implement round-robin meal selection algorithm
5. Build API endpoints for daily use (GET /today, POST /slots/{id}/complete)
6. Build API endpoints for weekly planning (generate, template switching)
7. Set up frontend foundation (Next.js + PWA)
8. Build Today View (mobile-first, primary screen)
9. Build completion tracking UI with status selection
10. Implement CSV meal import functionality
11. Build Week View (overview and template switching)
12. Build Meals Library (CRUD for meals)
13. Build Setup screens (Meal Types, Day Templates, Week Plans)
14. Implement offline support (service worker, cache strategy)
15. Build Stats view (adherence, streaks)
16. Seed initial data (Meal Types, Day Templates, Week Plan)
17. End-to-end testing (daily flows, weekly generation)
18. Deployment setup (Docker Compose production config)

## Later (Backlog)

<!-- Ideas and future work, not prioritized -->
- "Yesterday Review" modal on morning open
- Push notification reminders (requires native app consideration)
- Grocery list generation from weekly plan
- Ingredient-based meal builder with macro calculation
- Adherence-weighted round-robin (deprioritize skipped meals)
- Watch complications for "next meal"
- Template export/import for sharing
- Multi-user support with authentication
- Public template library

## Done (Recent)

<!-- Recently completed, for context -->
- [x] Created PRD and Tech Spec (2026-01-19)
- [x] Initialized SpecFlow documentation structure (2026-01-19)

## Blockers

<!-- Anything preventing progress -->
- None

---

## Notes

- Tasks should be small enough to complete in 1-2 sessions
- Move items between sections as priorities change
- Add blockers immediately when encountered
- Reference tasks by ID in SESSION_LOG entries
- MVP scope defined in docs/frozen/PRD_v0.md
- Out-of-scope features deferred to "Later" section
