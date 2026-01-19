# Frontend Development Agent

> Guidelines for frontend development on MealFrame

## Mission

Implement and maintain user interfaces that are accessible, performant, and consistent with the mobile-first, offline-capable design for MealFrame.

## Tech Context

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (client state) + TanStack Query (server cache)
- **PWA**: next-pwa (service worker, offline support)
- **Testing**: Jest + React Testing Library + Playwright (E2E)

## Structure

```
frontend/
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # App icons
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Today View (/)
│   │   ├── week/page.tsx       # Week View
│   │   ├── meals/page.tsx      # Meals Library
│   │   ├── setup/page.tsx      # Setup screens
│   │   └── stats/page.tsx      # Stats view
│   ├── components/             # React components
│   │   ├── MealCard.tsx
│   │   ├── CompletionModal.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── NextMealCard.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts              # API client (fetch wrappers)
│   │   └── types.ts            # TypeScript types
│   └── hooks/                  # Custom React hooks
│       ├── useToday.ts         # TanStack Query hook for /today
│       ├── useCompleteMeal.ts  # Mutation for completion
│       └── ...
└── tests/
    ├── components/             # Component tests
    └── e2e/                    # Playwright E2E tests
```

## Responsibilities

### Component Development
- Build reusable, composable components
- Keep components focused (single responsibility)
- Handle loading and error states (API calls are async)
- Ensure accessibility (ARIA, keyboard navigation, semantic HTML)
- Mobile-first design (Today View is primary screen)

### State Management
- **Server state**: Use TanStack Query for API data (caching, refetching)
- **Client state**: Use Zustand for UI state (modals, filters)
- Keep state normalized where practical
- Handle async operations consistently

### API Integration
- Use consistent patterns for API calls (see `lib/api.ts`)
- Handle loading, success, and error states
- Implement offline support (service worker cache for /today)
- Show "offline" indicator when network unavailable

### PWA Features
- Installable (manifest.json configured)
- Offline Today View (cached by service worker)
- Fast load times (< 2s initial load per UX principles)
- Home screen icon and splash screen

### Testing
- Write unit tests for utility functions
- Write component tests for UI behavior (React Testing Library)
- Test user interactions, not implementation details
- E2E tests for critical flows (Playwright):
  - Complete a meal flow
  - Generate new week flow
  - Offline behavior

## Patterns

### Do
- Component composition over complex props
- Consistent naming conventions (PascalCase components, camelCase functions)
- Accessible markup (semantic HTML, ARIA labels)
- Responsive design (mobile-first, then tablet/desktop)
- Loading and error states for all async operations
- Tailwind utility classes (avoid inline styles)

### Don't
- Business logic in components (extract to hooks or lib/)
- Inline styles for reusable patterns (use Tailwind)
- Ignore accessibility (screen readers, keyboard nav)
- Direct API calls in render logic (use TanStack Query hooks)
- Prop drilling through many layers (use Zustand or context)

## Key UX Principles (from docs/VISION.md)

1. **Mobile-First for Consumption** - Today View must load instantly and work offline
2. **Desktop for Setup** - Meal library and templates are desktop workflows
3. **Progressive Disclosure** - Show minimal info by default, expand on tap
4. **Satisfying Completion** - Visual/haptic feedback on marking meals complete
5. **Forgiving, Not Judgmental** - Unmarked meals are "unknown," not failures

## Session Ritual

### Before
- Read docs/ROADMAP.md for current task
- Review UI/UX related decisions in ADR
- Check docs/OVERVIEW.md for component architecture (section "Frontend Architecture")
- Review docs/frozen/PRD_v0.md for user flows (section 9)

### During
- Test in multiple viewports if relevant (mobile, tablet, desktop)
- Check accessibility with keyboard navigation (Tab, Enter, Esc)
- Verify loading and error states work
- Test offline behavior for Today View (disable network in DevTools)

### After
- Ensure all frontend tests pass (`npm test`)
- Update docs/OVERVIEW.md if component structure changed
- Note any design pattern decisions for ADR
- Update docs/ROADMAP.md and docs/SESSION_LOG.md

## Common Tasks

### Adding a Component
1. Create component file in `src/components/` (PascalCase.tsx)
2. Implement with TypeScript props interface
3. Handle loading/error states if component fetches data
4. Add accessibility attributes (ARIA labels, semantic HTML)
5. Write tests (React Testing Library)
6. Use Tailwind for styling

### Adding a Page/Route
1. Create page in `src/app/[route]/page.tsx`
2. Implement data fetching with TanStack Query hooks
3. Handle loading state (skeleton or spinner)
4. Handle error state (error message, retry button)
5. Add tests
6. Update navigation if needed (add link in nav component)

### Implementing Completion Flow
- Reference PRD section 9.2 "Meal Time Check" (10 seconds flow)
- Tap "Done" → select status (default: Followed)
- Satisfying confirmation animation (framer-motion)
- Update local state optimistically (TanStack Query mutation)
- Visual and haptic feedback (`navigator.vibrate()` if available)

### Fixing a UI Bug
1. Identify the component with the issue
2. Write a test that fails (if possible)
3. Fix the issue
4. Verify across relevant viewports/states
5. Test keyboard navigation
6. Document in session log

### Styling Changes
1. Use Tailwind utility classes (e.g., `bg-green-500`, `p-4`, `rounded-lg`)
2. Check if design tokens exist in `tailwind.config.js`
3. Prefer existing patterns over new ones
4. Ensure responsive behavior (`sm:`, `md:`, `lg:` breakpoints)
5. Test in light mode (dark mode deferred to Phase 2)

### Offline Support
- Today View MUST work offline (ADR-004)
- Service worker caches `/api/v1/today` response
- Completion actions queued for sync when online (background sync)
- Show "offline" indicator in UI when `navigator.onLine === false`

## API Client Pattern

```typescript
// lib/api.ts
export const api = {
  today: () => fetch('/api/v1/today').then(r => r.json()),
  completeMeal: (slotId: string, status: string) =>
    fetch(`/api/v1/slots/${slotId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }).then(r => r.json()),
  // ...
};

// hooks/useToday.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useToday() {
  return useQuery({
    queryKey: ['today'],
    queryFn: api.today,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

## Screen Priority (from Tech Spec 5.1)

1. **Today View (/)** - PRIMARY, mobile-first
2. **Week View (/week)** - Secondary
3. **Meals Library (/meals)** - Setup, desktop
4. **Setup (/setup)** - Setup, desktop
5. **Stats (/stats)** - Secondary

---

*For general development workflow, see docs/WORKFLOW.md*
