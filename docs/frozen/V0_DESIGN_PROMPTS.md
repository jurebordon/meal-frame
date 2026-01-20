# MealFrame Design Prompts for Vercel v0

A series of prompts to generate the UI for MealFrame, a mobile-first meal planning PWA. Use these in sequence, uploading the PRD, Tech Spec, and Vision documents with each prompt.

---

## How to Use These Prompts

1. Start with **Prompt 1 (Design System)** to establish the visual foundation
2. Use **Prompt 2 (Today View)** for the primary screen — this is the most important
3. Continue with remaining prompts as needed
4. Upload your PRD, Tech Spec, and Vision documents with each prompt for context
5. After each generation, iterate with follow-up requests before moving to the next prompt

---

## Prompt 1: Design System & Component Foundation

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Before designing screens, I need a design system foundation. Create a comprehensive design system with:

**Brand & Color**
- Warm neutral palette (creams, soft browns, warm grays) as the foundation
- Dark mode as default, with light mode variant
- Colors should feel: food-friendly, calm, trustworthy — not clinical or cold
- Accent color for interactive elements and success states (consider warm amber/gold or soft terracotta)
- Semantic colors: success (completion), warning, error, muted/disabled states

**Typography**
- Clean, readable sans-serif font stack (system fonts fine for PWA performance)
- Clear hierarchy: page titles, section headers, meal names, body text, metadata
- Generous line height for readability during quick glances

**Spacing & Layout**
- Spacious design with generous padding and margins
- Touch-friendly targets (minimum 44px)
- Mobile-first container widths with desktop breakpoints
- Consistent spacing scale (4px base)

**Core Components (dark mode default, show both modes)**

1. **MealCard** — The primary content unit
   - Meal name (prominent)
   - Portion description (the key info — exact quantities)
   - Macros row (calories, protein, carbs, fat) — subtle, secondary
   - Meal type badge/label
   - Completion status indicator
   - States: default, next (highlighted), completed, skipped

2. **StatusBadge** — Completion status indicators
   - Followed (success)
   - Adjusted (warning/neutral)
   - Skipped (muted)
   - Replaced (muted)
   - Social (distinct, not negative)
   - Unmarked/pending

3. **ProgressRing** — Circular progress for "3/5 meals"
   - Animated fill
   - Center text for count
   - Warm accent color for filled portion

4. **StreakBadge** — "🔥 4 days" streak counter
   - Compact, celebratory but not obnoxious
   - Warm/flame accent

5. **Button variants**
   - Primary action (warm accent)
   - Secondary/ghost
   - Destructive (for overrides)
   - Icon buttons

6. **DayCard** — For week view
   - Date and weekday
   - Template name
   - Slot count summary
   - Completion progress mini-bar
   - Override state (grayed out with reason)

7. **Modal/Sheet** — Bottom sheet pattern for mobile
   - Completion status selector
   - Template picker
   - Confirmation dialogs

The aesthetic should feel like a premium utility app — think Linear, Things 3, or the Claude mobile app: functional, calm, confident, with warmth. Not gamified or playful, but satisfying to use.

Generate a React component library with Tailwind CSS showing all components in both dark and light modes.
```

---

## Prompt 2: Today View (Primary Screen)

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context. This is the PRIMARY screen — users will see this 5+ times daily.

Design the Today View screen with these requirements:

**Purpose**
This screen answers one question: "What should I eat next?" Users glance at it quickly throughout the day. It must be instantly scannable with zero cognitive load.

**Layout (Mobile-First, 375px base)**

Header Section:
- Current date (e.g., "Tuesday, January 7")
- Template name (e.g., "Morning Workout Workday") — subtle, secondary
- Stats row: ProgressRing showing "3/5" + StreakBadge showing "🔥 4 days"

Next Meal Section (HERO — most prominent):
- Larger card treatment, visually distinct from other meals
- "NEXT" label or visual indicator
- Meal name (large, bold)
- Portion description (clear, readable — this is the instruction)
- Macros summary (subtle)
- Large "Mark Complete" button

Remaining Meals Section:
- Scrollable list of upcoming meals for today
- Compact MealCard variant for each
- Clear sequence indication (position in day)
- Completed meals shown with strikethrough/muted + status badge
- Quick-tap to mark complete on any card

**States to Show**
1. Morning state: First meal is "next", all others pending
2. Mid-day state: 2 meals completed, third is "next"
3. End of day state: All meals completed (celebratory but subtle)
4. Empty state: "No plan for today" (if override)

**Interactions**
- Tapping "Mark Complete" on next meal opens completion modal (design separately)
- Tapping any meal card expands to show full details
- Pull-to-refresh gesture area
- Smooth transitions between states

**Design Direction**
- Dark mode default with warm neutral palette
- Spacious layout with clear visual hierarchy
- The "Next Meal" section should feel like a clear instruction/command
- Completed meals should feel satisfying (done) but not distracting
- Overall vibe: calm authority — the app knows what you should eat

**Desktop Adaptation (optional, lower priority)**
- Centered content container (max-width ~480px)
- Same layout, just more breathing room

Generate a responsive React component using Tailwind CSS. Include realistic meal data matching the domain (e.g., "Scrambled Eggs", "2 eggs + 1 slice toast + 10g butter", etc.).
```

---

## Prompt 3: Completion Flow & Feedback

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the meal completion flow — this is the primary interaction loop and the "dopamine hit" moment that reinforces habit formation.

**Flow**
1. User taps "Mark Complete" on a meal
2. Bottom sheet slides up with status options
3. User selects status
4. Confirmation animation plays
5. Sheet closes, UI updates

**Completion Modal (Bottom Sheet)**
- Clean header: meal name being completed
- 5 status options as large, tappable buttons:
  - ✓ Followed — "Ate as planned" (primary/default, warm accent)
  - ⚠ Adjusted — "Similar but different portion"
  - ✗ Skipped — "Didn't eat this meal"
  - ↻ Replaced — "Ate something else"
  - ★ Social — "Eating out / social event"
- Each option: icon + label + brief description
- "Followed" should be visually prominent as the happy path
- Cancel/close option

**Confirmation Animation (Medium feedback level)**
- When "Followed" is selected:
  - Checkmark animation (draws in)
  - Card briefly pulses or glows with success color
  - Progress ring animates to new count
  - Subtle celebration (maybe small particle burst, no confetti)
  - Streak badge updates if applicable
  
- When other statuses selected:
  - Appropriate icon animation (less celebratory)
  - Card updates to show status
  - No negative feedback — neutral acknowledgment

**Quick Complete Shortcut**
- Long-press or swipe on meal card → instant "Followed" with animation
- For users who want to mark complete without opening modal

**Undo State**
- After completion, brief toast/snackbar: "Marked as followed" with "Undo" action
- Disappears after 3 seconds

**Design Direction**
- The "Followed" completion should feel genuinely satisfying
- Not over-the-top gamified (no points, no sounds)
- Smooth, premium animations (think iOS native feel)
- Dark mode with warm accents
- The flow should take <2 seconds for quick completions

Generate React components with Tailwind CSS and Framer Motion for animations. Include the bottom sheet, all status buttons, and completion animation states.
```

---

## Prompt 4: Yesterday Review Flow

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the Yesterday Review flow — a gentle prompt to catch up on unmarked meals from the previous day.

**Trigger**
- Shown on first app open of the day IF yesterday has unmarked meals
- Non-blocking modal/sheet that can be dismissed

**Layout**
Modal/sheet with:
- Friendly header: "Quick check-in" or "Yesterday's meals"
- Subtext: "You have 2 unmarked meals from yesterday"
- List of unmarked meals (compact cards)
- Each meal shows: name, portion, quick-action buttons
- Quick actions per meal: ✓ (Followed), ✗ (Skipped), ••• (Other options)
- "Mark all as Followed" batch action (if multiple)
- "Dismiss" or "Skip for now" secondary action
- Progress indicator: "2 of 3 remaining"

**Interaction**
- Tapping quick action immediately marks that meal
- Satisfying micro-animation on each completion
- When all done: brief celebration, modal auto-closes
- Dismissing saves state — won't ask again for these meals

**States**
1. Multiple unmarked meals (batch view)
2. Single unmarked meal (simpler view)
3. All caught up (shouldn't show, but handle gracefully)

**Design Direction**
- Feels helpful, not nagging
- Quick to complete (should take 10-20 seconds max)
- Batch action prominent for efficiency
- Dark mode, warm neutrals
- Subtle entry animation (slide up)

Generate a React component with Tailwind CSS. Include the modal, meal list with quick actions, and completion states.
```

---

## Prompt 5: Week View

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the Week View — a planning and review screen showing the full week at a glance.

**Purpose**
- Review upcoming meals for the week
- Switch day templates when schedule changes
- Mark days as "No Plan" overrides
- Generate next week's plan

**Layout (Mobile-First)**

Header:
- Week date range: "Jan 6 - 12, 2025"
- "Generate Next Week" button (when applicable)

Day List (scrollable, 7 days):
Each day as a DayCard showing:
- Day name and date: "Monday, Jan 6"
- Template badge: "Normal Workday"
- Completion summary: progress bar or "3/5 completed"
- Edit button to change template
- Visual distinction for:
  - Today (highlighted border/background)
  - Past days (slightly muted, show completion status)
  - Future days (full color, pending)
  - Override days (grayed out with reason shown)

Day Expansion (tap to expand):
- Shows all meal slots for that day
- Compact meal cards with completion status
- Cannot swap individual meals (read-only)
- Can tap to see meal details

**Template Picker Modal**
- Triggered from day's edit button
- List of available templates:
  - Normal Workday (5 meals)
  - Morning Workout Workday (5 meals)
  - Evening Workout Workday (5 meals)
  - Weekend (3 meals)
  - Hiking Weekend Day (4 meals)
- Each shows: name, slot count, brief description
- "No Plan" option at bottom (with reason input)
- Confirmation before regenerating (warns about losing completion data)

**Desktop Adaptation**
- Could show 7-day grid/calendar view
- Or keep vertical list with wider cards

**States**
1. Current week with mixed completion states
2. Week with one override day
3. Empty state (no week generated yet)
4. Next week not yet generated (show prompt)

**Design Direction**
- Information-dense but still scannable
- Today should be obviously highlighted
- Template switching should feel low-friction
- Override days should look intentionally "off" (not broken)
- Dark mode, warm neutrals, spacious

Generate a React component with Tailwind CSS. Include the week list, day cards, expansion state, and template picker modal.
```

---

## Prompt 6: Meal Library Screen

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the Meal Library — where users manage their collection of meals. This is a setup/admin screen, primarily used on desktop but should work on mobile.

**Purpose**
- Browse all meals in the system
- Add new meals
- Edit existing meals
- Filter/search meals
- Import meals via CSV

**Layout**

Header:
- Title: "Meal Library"
- Search input (filters as you type)
- "Add Meal" primary button
- "Import CSV" secondary button

Filter Bar:
- Filter by Meal Type (multi-select dropdown)
- Sort by: Name, Recently Added, Calories
- View toggle: List / Compact grid (optional)

Meal List:
- Cards or rows showing:
  - Meal name
  - Portion description (truncated)
  - Macro summary: "320 kcal • 18g protein"
  - Meal type badges (multiple if applicable)
  - Edit button
- Pagination or infinite scroll

Empty States:
- No meals yet: "Add your first meal" CTA
- No search results: "No meals match your search"

**Add/Edit Meal Modal**
Full-screen modal or slide-over panel:
- Name input
- Portion description textarea (with helper text about specificity)
- Macros section:
  - Calories (kcal)
  - Protein (g)
  - Carbs (g)
  - Fat (g)
- Meal Types multi-select (checkboxes or chips)
- Notes textarea (optional)
- Save / Cancel buttons
- Delete button (edit mode only, with confirmation)

**CSV Import Flow**
1. Click "Import CSV" → file picker
2. Upload preview: shows parsed rows with validation
3. Confirm import → progress indicator
4. Result summary: "Created 15 meals, 2 warnings"

**Design Direction**
- More utilitarian than Today View (admin tool)
- Still warm and usable
- Dense but organized
- Good keyboard navigation for desktop
- Dark mode, warm neutrals

Generate a React component with Tailwind CSS. Include the list view, add/edit modal, and search/filter functionality.
```

---

## Prompt 7: Setup & Configuration Screens

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the Setup screens — configuration for Meal Types, Day Templates, and Week Plan. These are admin screens used during initial setup and occasional adjustments.

**Navigation**
Tab-based or segmented control:
- Meal Types
- Day Templates  
- Week Plan

---

**Meal Types Tab**

List of meal types:
- Name
- Description (truncated)
- Tags as subtle chips
- Count: "12 meals assigned"
- Edit button

Add/Edit Modal:
- Name input
- Description textarea
- Tags input (comma-separated or chip input)
- Save/Cancel

Note: Deletion should warn if meals are assigned

---

**Day Templates Tab**

List of templates:
- Name
- Slot count: "5 meal slots"
- Slot preview: "Breakfast → Lunch → Dinner..."
- Edit button

Add/Edit Modal:
- Name input
- Notes textarea
- Slots section:
  - Ordered list of slots
  - Each slot: position number + Meal Type dropdown
  - Add slot button
  - Drag to reorder (or up/down arrows)
  - Remove slot button
- Preview of template structure
- Save/Cancel

---

**Week Plan Tab**

Single week plan view (MVP has one default):
- Name: "Default Week"
- 7-day grid or list:
  - Each day: weekday name + template dropdown
  - Monday: [Normal Workday ▼]
  - Tuesday: [Morning Workout Workday ▼]
  - etc.
- Save button (if changes made)

Visual preview showing the week at a glance

---

**Design Direction**
- Clean, form-heavy admin interface
- Logical grouping and clear labels
- Inline validation where helpful
- Confirmation before destructive actions
- Works well on desktop (primary use case)
- Acceptable mobile experience
- Dark mode, warm neutrals

Generate React components with Tailwind CSS. Include all three tabs with their respective list views and modals.
```

---

## Prompt 8: Stats & Adherence Dashboard

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the Stats screen — showing adherence data and patterns over time. Secondary screen for reflection and motivation.

**Purpose**
- See overall adherence rate
- Identify problem areas (which meal types have low adherence)
- Track streaks and progress
- Understand patterns

**Layout**

Header:
- Title: "Your Progress"
- Time period selector: 7 days / 30 days / 90 days

Overview Cards Row:
- Adherence Rate: "86%" with trend indicator
- Current Streak: "4 days 🔥"
- Best Streak: "12 days"
- Override Days: "2 this month"

Adherence Chart:
- Simple bar chart or heat map showing daily adherence
- Last 7/30 days
- Color coding: green (good), yellow (partial), red (low), gray (override)

By Meal Type Breakdown:
- List or horizontal bars:
  - Dinner: 73% (lowest — highlight as area to focus)
  - Breakfast: 92%
  - Lunch: 88%
  - etc.
- Sort by adherence (lowest first) to surface problems

Completion Status Breakdown:
- Pie chart or segmented bar:
  - Followed: 110
  - Adjusted: 15
  - Skipped: 3
  - Replaced: 2
  - Social: 5

Recent Activity (optional):
- Last 5-10 completion events
- "Today 12:30pm — Lunch marked as Followed"

**Design Direction**
- Data visualization should be clear, not cluttered
- Celebrate wins (high adherence, streaks)
- Surface problems gently (low adherence meal types)
- Not judgmental — informational
- Dark mode with warm accent colors for charts
- Spacious, easy to scan

Generate a React component with Tailwind CSS. Include the overview cards, chart placeholders (using Recharts or similar), and meal type breakdown. Use realistic data.
```

---

## Prompt 9: Empty States & Onboarding

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design empty states and first-time user experience to guide setup.

**Empty States Needed**

1. No meals in library:
   - Illustration or icon
   - "No meals yet"
   - "Add your meals to get started"
   - Primary CTA: "Add First Meal"
   - Secondary: "Import from CSV"

2. No week generated:
   - "No meal plan for this week"
   - "Generate your weekly plan to see what's on the menu"
   - Primary CTA: "Generate Week"

3. Today is an override day:
   - "No plan today"
   - Shows override reason if set: "LAN party 🎮"
   - Subtle, not an error state
   - "Remove override" link

4. All meals completed today:
   - Celebratory but subtle
   - "All done for today! ✓"
   - Today's stats summary
   - Streak update if applicable

5. No meals for a meal type (edge case):
   - Shown in a slot: "No meals available"
   - "Add meals to [Meal Type Name]"
   - Link to meal library

**First-Time Setup Flow**

For a brand new user (no data):

Step 1: Welcome
- "Welcome to MealFrame"
- Brief value prop: "Structured meal planning that removes daily decisions"
- "Let's set up your meals" CTA

Step 2: Quick Start Options
- "Import existing meals" (CSV upload)
- "Start with sample meals" (pre-populated examples)
- "Add meals manually" (go to meal library)

Step 3: Confirm Templates
- "Review your day templates"
- Show default templates
- "These look good" / "Customize" options

Step 4: Generate First Week
- "Ready to generate your first week?"
- Shows week start date
- "Generate" CTA

Step 5: Done
- "You're all set!"
- "Your first meal plan is ready"
- Direct to Today View

**Design Direction**
- Empty states should feel encouraging, not broken
- Clear CTAs to resolve the empty state
- Onboarding should be skippable for power users
- Progress indicator for multi-step flow
- Warm, friendly illustrations or icons
- Dark mode, warm neutrals

Generate React components with Tailwind CSS for all empty states and the onboarding flow.
```

---

## Prompt 10: Navigation & App Shell

```
I'm building MealFrame, a mobile-first PWA for structured meal planning. I've attached the PRD, Tech Spec, and Vision documents for full context.

Design the app shell — navigation structure and persistent UI elements.

**Mobile Navigation (Bottom Tab Bar)**

5 tabs:
1. Today (home icon) — Primary, default
2. Week (calendar icon)
3. Meals (utensils/list icon)
4. Setup (sliders/cog icon)
5. Stats (chart icon)

Tab bar behavior:
- Fixed at bottom
- Active state clearly indicated (warm accent)
- Labels below icons
- Safe area padding for iOS home indicator

**Desktop Navigation**

Sidebar navigation:
- App logo/name at top
- Same 5 nav items as vertical list
- Active state highlight
- Collapse to icons only (optional)
- User settings at bottom (theme toggle, etc.)

**Top Header (Mobile)**

Contextual per screen:
- Today: Date, streak badge
- Week: Week range, generate button
- Meals: Search field
- Setup: Tab switcher
- Stats: Period selector

Back button when in sub-views

**Theme Toggle**

Accessible from:
- Settings area (if exists)
- Quick toggle in header or profile
- System preference detection

Toggle UI:
- Sun/moon icons
- Smooth transition between modes

**PWA Install Prompt**

For eligible browsers:
- Subtle banner or modal
- "Install MealFrame"
- "Add to home screen for the best experience"
- Dismiss option (don't show again)

**Offline Indicator**

When offline:
- Subtle top banner: "Offline — showing cached data"
- Non-blocking
- Auto-dismisses when back online

**Design Direction**
- Navigation should be invisible/obvious — zero learning curve
- Today is the default, most important screen
- Mobile-first but desktop should feel native
- Dark mode default, smooth theme transitions
- Warm neutrals, consistent with other screens

Generate a React component with Tailwind CSS showing the full app shell with mobile bottom nav, desktop sidebar, and header variations.
```

---

## Follow-Up Prompts for Iteration

After each generation, use these follow-up patterns:

**Refining colors:**
```
The accent color feels too [bright/dull/cold]. Try a warmer [amber/terracotta/gold] that feels more food-friendly. Keep the dark neutral background but make the accent pop more.
```

**Adjusting spacing:**
```
This feels too [cramped/sparse]. [Increase/Decrease] the padding on the meal cards and add more [breathing room between sections / information density].
```

**Animation refinement:**
```
The completion animation should feel more [satisfying/subtle]. Try a [spring/bounce/ease-out] curve and [add a brief scale up/remove the particle effect/make the checkmark draw slower].
```

**Component consistency:**
```
Make the [button/card/badge] styles consistent with the design system from Prompt 1. Use the same border radius, shadow depth, and hover states.
```

**Mobile polish:**
```
On mobile, the [element] is too [small/large] for comfortable thumb reach. Adjust to meet the 44px minimum tap target and position it within the thumb zone.
```

---

## Notes for Best Results

1. **Upload all three documents** (PRD, Tech Spec, Vision) with each prompt for full context

2. **Iterate before moving on** — get each screen right before starting the next

3. **Reference previous outputs** — "Use the same MealCard component from the Today View" keeps things consistent

4. **Be specific about issues** — "The green is too saturated" is better than "I don't like the colors"

5. **Request both modes** — Always ask to see dark and light mode variants

6. **Test with real data** — Use actual meal names and portions from your system, not lorem ipsum
