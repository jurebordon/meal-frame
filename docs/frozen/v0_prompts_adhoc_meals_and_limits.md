# v0 Design Prompts: Ad-Hoc Meals & Day Template Soft Limits

> Two follow-up prompts for the existing MealFrame v0 design thread. Post these in the same conversation where the original design system, Today View, completion flow, stats page, etc. were generated.

---

## Prompt A: Ad-Hoc Meal Addition (Today View)

```
We're adding a new feature to MealFrame: the ability to add ad-hoc meals to today's plan that aren't part of the day template. For example, adding a small snack from the meal library when you eat something unplanned.

This builds on the existing Today View and Meal Library designs you've already created. Here's the full context:

**Current behavior:**
- Today View shows meals generated from the day template via round-robin
- Users can only mark existing meals as complete (followed/adjusted/skipped/replaced/social)
- There's no way to add a meal that wasn't pre-planned
- Daily macro totals are calculated by summing all slot macros

**New behavior:**
- Users can tap an "Add Meal" button to add any meal from the meal library to today
- The added meal appears in the "Remaining Today" list alongside template meals
- It counts toward daily macro totals
- It has full completion tracking (same statuses as template meals)
- It can be removed (since it was manually added, not part of the template)

**Design the following:**

1. **"Add Meal" Button on Today View**
   - Placed below the "Remaining Today" meal list, before the pull-to-refresh hint
   - Secondary/ghost style — not prominent, but discoverable
   - Icon: Plus icon with label "Add meal"
   - Touch-friendly (44pt minimum tap target)
   - Should feel like an escape valve, not a primary action — the app is about following the plan

2. **Meal Picker Bottom Sheet**
   - Triggered by tapping "Add meal"
   - Bottom sheet (consistent with completion sheet pattern)
   - Search input at the top (filters as you type)
   - Scrollable list of meals from the library
   - Each meal row shows: name, portion description (truncated), calories, protein
   - Tapping a meal immediately adds it and closes the sheet
   - No meal type filter needed — keep it simple
   - Empty state if search finds nothing: "No meals match your search"
   - Max height ~70vh (same as completion sheet)
   - Drag handle at top for dismissal

3. **Ad-Hoc Meal Card in Today View**
   - Appears in the "Remaining Today" list
   - Same MealCardGesture component as template meals
   - Visual distinction: subtle "Added" badge or dashed left border to indicate it's not part of the template
   - Same completion flow (tap → completion sheet, swipe → followed)
   - Additional action: "Remove" option accessible via the completion sheet (since it was manually added)
   - Should NOT feel like a second-class citizen — once added, it's part of today's plan

4. **States to show:**
   - Today View with the "Add meal" button visible below meal list
   - Meal picker sheet open with a few meals and search input
   - Today View after adding an ad-hoc meal (showing the "Added" badge)
   - Completion sheet for an ad-hoc meal (with "Remove" option in addition to statuses and "Clear status")

**Design direction:**
- The "Add meal" flow should be quick — 2 taps to add (open picker, tap meal)
- Keep the calm, authoritative aesthetic — this is an exception, not the norm
- The picker should feel like a lightweight version of the Meals Library page
- Dark mode, warm neutrals, consistent with existing components
- Mobile-first (375px base), same max-width container (480px)

Generate React components with Tailwind CSS. Reuse existing component patterns (bottom sheet, meal card) wherever possible.
```

---

## Prompt B: Day Template Soft Limits & Stats Integration

```
We're adding nutritional soft limits to MealFrame's day templates, plus tracking how often those limits are exceeded in the Stats page. This is about awareness and template balancing, not enforcement.

This builds on the existing Day Template setup screens and Stats page designs you've already created. Here's the full context:

**Current behavior:**
- Day templates define meal structure only (which meal types at which positions)
- No nutritional targets or limits exist at the template level
- Stats page shows: adherence rate, streaks, override days, avg daily calories/protein, daily adherence chart, by-meal-type breakdown, completion status pie chart
- Today View header shows daily macro totals (kcal, P, C, sugar, F, sat.F, fiber)

**New behavior — Soft Limits:**
- Each day template can optionally define `max_calories_kcal` (integer) and `max_protein_g` (decimal)
- These are soft limits — informational, not enforced
- They help during template setup: "Does this template's meal slots typically add up to a reasonable day?"
- They enable tracking: "How often did my actual intake exceed the template's limit?"
- The limits are NOT shown in Today View or Week View — no daily nagging
- The limits ARE shown in the Stats page as a new "Over Limit" metric

**Design the following:**

1. **Day Template Editor — Soft Limits Fields**
   - In the existing Day Template Add/Edit modal (Setup > Day Templates tab)
   - New section below the slots list, above the Save/Cancel buttons
   - Section header: "Daily Limits (optional)"
   - Two input fields side by side:
     - "Max Calories" — integer input, placeholder "e.g. 2200", suffix "kcal"
     - "Max Protein" — decimal input, placeholder "e.g. 180", suffix "g"
   - Helper text below: "Soft limits for tracking. Days exceeding these will appear in your stats."
   - Both fields optional — empty means no limit
   - Subtle styling — these are secondary to the slot configuration

2. **Day Template List Item — Limit Preview**
   - In the existing Day Templates list (Setup > Day Templates tab)
   - Below the existing slot preview line, add a subtle line showing limits if set:
     - "Max: 2,200 kcal / 180g protein" — muted text, compact
   - Only shown if at least one limit is set
   - If no limits: don't show anything (no "No limits" text)

3. **Stats Page — "Over Limit" Card**
   - New overview card in the existing top row (currently: Adherence Rate, Current Streak, Best Streak, Override Days)
   - Makes the row 5 cards on desktop (3+2 grid on tablet, stack on mobile)
   - Card content:
     - Label: "Over Limit Days"
     - Value: count of days where actual totals exceeded the template's soft limit (either calories OR protein)
     - Subtext: "of X days with limits" (denominator is days that HAD a template with limits set)
     - Icon: a subtle warning/alert icon (not alarming — informational)
   - Only shown if any templates have limits configured (hide card entirely otherwise)

4. **Stats Page — "Over Limit" Breakdown (optional, lower priority)**
   - Below the overview cards, a compact section showing which templates are most frequently exceeded
   - Simple list:
     - "Morning Workout Workday: 3 of 12 days over (calories)"
     - "Normal Workday: 1 of 8 days over (protein)"
   - Sorted by frequency (most exceeded first)
   - Only shown if there are over-limit days

**States to show:**
1. Day Template editor with both limit fields filled in
2. Day Template editor with limits empty (showing placeholders)
3. Day Template list showing templates with and without limits
4. Stats page with the new "Over Limit Days" card (showing a non-zero count)
5. Stats page when no templates have limits (card hidden, same layout as current)

**Design direction:**
- Soft limits should feel like a helpful tool, not a restriction
- The template editor fields should be clearly optional — don't make them feel required
- The stats integration should blend with existing cards (same card component, same style)
- Warning/over-limit indicators should use warm amber (existing warning color), not red
- Keep it informational — "3 days over limit" is a fact, not a judgment
- Dark mode, warm neutrals, consistent with existing design system
- Desktop-first for template editor (Setup screens), mobile-first for Stats

Generate React components with Tailwind CSS. Reuse existing component patterns (Card, CardContent, form inputs) wherever possible.
```

---

## Notes for Posting

1. **Post Prompt A first** — it's more self-contained and affects the primary screen
2. **Post Prompt B second** — it touches setup screens and stats, which are secondary
3. Both prompts reference existing designs, so they should be posted in the same v0 thread where the original MealFrame design system was built
4. After generation, iterate on each before moving to implementation
5. Reference the Apple HIG compliance audit if touch targets or safe areas need checking on the new components
