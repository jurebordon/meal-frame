# Roadmap

**Last Updated**: 2026-01-24
**Current Phase**: MVP - Foundation

## Now (Current Work)

<!-- ONE task in progress at a time -->
- [ ] Set up frontend foundation (Next.js + PWA)

## Next (Queued)

<!-- Priority ordered - top item is next -->
1. Build Today View (mobile-first, primary screen)
2. Build completion tracking UI with status selection
6. Implement CSV meal import functionality
7. Build Week View (overview and template switching)
8. Build Meals Library (CRUD for meals)
9. Build Setup screens (Meal Types, Day Templates, Week Plans)
10. Implement offline support (service worker, cache strategy)
11. Build Stats view (adherence, streaks)
12. Seed initial data (Meal Types, Day Templates, Week Plan)
13. End-to-end testing (daily flows, weekly generation)
14. Deployment setup (Docker Compose production config)

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
- [x] Build API endpoints for weekly planning (generate, template switching) (2026-01-24)
- [x] Build API endpoints for daily use (GET /today, POST /slots/{id}/complete) (2026-01-24)
- [x] Build Pydantic schemas for API requests/responses (2026-01-24)
- [x] Implement round-robin meal selection algorithm (2026-01-22)
- [x] Implement database schema and migrations (Alembic) (2026-01-20)
- [x] Set up backend foundation (FastAPI + PostgreSQL + Docker) (2026-01-20)
- [x] Set up project structure and development environment (2026-01-19)
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

---

## Design Assets

Pre-built v0 design system in `v0_design/` folder:

| Resource | Path | Description |
|----------|------|-------------|
| Design prompts | `docs/frozen/V0_DESIGN_PROMPTS.md` | Prompts used to generate v0 designs |
| Apple HIG audit | `docs/frozen/V0_APPLE_COMPLIANCE_PROMPT.md` | Apple Human Interface Guidelines compliance |
| Components (79) | `v0_design/components/` | Radix UI primitives + MealFrame components |
| MealFrame components | `v0_design/components/mealframe/` | Domain-specific: MealCard, CompletionSheet, etc. |
| UI primitives | `v0_design/components/ui/` | Button, Card, Sheet, Dialog, etc. |
| Navigation | `v0_design/components/navigation/` | AppShell, BottomNav, Sidebar |
| Pages | `v0_design/app/` | Today, Week, Library, Stats, Settings |
| Global styles | `v0_design/app/globals.css` | Tailwind config with design tokens |

**Usage**: Copy components and styles from `v0_design/` into `frontend/` when implementing UI features. Adapt imports and connect to real API data.
