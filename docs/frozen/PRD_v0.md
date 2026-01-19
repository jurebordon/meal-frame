# Product Requirements Document (PRD)
# Meal Planning App — "MealFrame"

**Version:** 1.1 (Revised)  
**Last Updated:** January 2025  
**Status:** MVP Specification

---

## 1. Overview

### 1.1 Purpose

MealFrame eliminates decision fatigue and stress-driven overeating by providing **authoritative, pre-planned meals with exact portions**. The app delivers clear instructions on *what* to eat and *how much*, removing in-the-moment decisions that lead to overconsumption—especially during high-stress evening periods.

The core philosophy is **psychological offloading**: plan meals when calm and cognitive resources are abundant, then follow predefined instructions during high-stress periods when willpower is depleted.

### 1.2 Target User

- Knowledgeable about nutrition and macronutrients
- Struggles with stress-induced overeating, particularly in evenings
- Has recurring weekly routines (workdays, workouts, weekends)
- Values planning, structure, and repeatable systems
- Can follow instructions but struggles with in-the-moment decisions
- Primary failure mode: eating correct foods but in excessive quantities

### 1.3 Product Intent

**Phase 1 (MVP):** Personal tool (single-user) that replaces a high-friction Google Sheets workflow with a mobile-first experience optimized for quick glances and completion tracking.

**Phase 2 (Future):** Productized version with exportable templates, onboarding defaults, multi-user support, and potential monetization.

### 1.4 Core Value Proposition

| Current State (Google Sheets) | Target State (MealFrame) |
|-------------------------------|--------------------------|
| High friction to enter meals | Quick meal library with CSV import |
| Slow mobile loading, poor UX | Mobile-first PWA, instant access |
| Manual planning required daily | Auto-generated weekly plans |
| Vague plans ("2 eggs and bread") | Precise portions ("2 eggs + 1 slice toast") |
| No tracking or accountability | Completion tracking with streaks |
| Easy to ignore | Gamified dopamine loop on completion |

### 1.5 Non-Goals

- Not a calorie tracker replacement (use alongside existing tracker)
- Not a recipe discovery app (user knows their meals)
- Not focused on social features or food logging accuracy
- Not a grocery list generator (deferred to future)
- Not enforcing macro targets (reflection only)

---

## 2. Core Concepts & Mental Model

### 2.1 Key Abstractions

```
┌─────────────────────────────────────────────────────────────────┐
│                        PLANNING LAYER                           │
│  (Configured once, reused weekly)                               │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐             │
│  │ Meal     │───▶│ Day          │───▶│ Week      │             │
│  │ Type     │    │ Template     │    │ Plan      │             │
│  └──────────┘    └──────────────┘    └───────────┘             │
│       │                                                         │
│       │ assigned to                                             │
│       ▼                                                         │
│  ┌──────────┐                                                   │
│  │ Meal     │ (with portions + macros)                         │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ generates
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXECUTION LAYER                           │
│  (Generated weekly, consumed daily)                             │
│                                                                 │
│  ┌────────────────────┐    ┌─────────────────┐                 │
│  │ Weekly Plan        │───▶│ Daily Slots     │                 │
│  │ Instance           │    │ (with meals)    │                 │
│  └────────────────────┘    └─────────────────┘                 │
│                                   │                             │
│                                   │ tracked via                 │
│                                   ▼                             │
│                            ┌─────────────────┐                 │
│                            │ Completion      │                 │
│                            │ Status          │                 │
│                            └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

1. **Meal Type** — A functional eating slot representing the *purpose* of eating at that time (e.g., "Pre-Workout Snack"). Not a recipe, but a context.

2. **Meal** — A specific food option with exact portion description and macronutrient data. Can be assigned to multiple Meal Types.

3. **Day Template** — An ordered sequence of Meal Types representing a recurring daily pattern (e.g., "Morning Workout Workday").

4. **Week Plan** — A mapping of Day Templates to weekdays, defining the default weekly structure.

5. **Weekly Plan Instance** — A generated week where each slot is assigned a specific Meal via round-robin rotation.

6. **Completion Status** — Tracking whether each planned meal was followed, adjusted, skipped, etc.

The system prioritizes **structure and authority over flexibility and optimization**. The app tells you what to eat; your job is to follow it.

---

## 3. Meal Types

### 3.1 Definition

A Meal Type defines the *purpose* and *context* of eating at a specific point in the day. It is not a recipe or specific food—it's a functional slot.

Each Meal Type contains:
- **Name** — Clear, descriptive identifier
- **Description** — Purpose and intent of this eating slot
- **Tags** — Optional categorization (e.g., "workout", "protein-heavy")

### 3.2 MVP Meal Types

**Core (used across most day templates):**

| Meal Type | Purpose | Notes |
|-----------|---------|-------|
| Breakfast | Standard weekday breakfast | Protein + slow carbs, routine anchor |
| Pre-Workout Breakfast | Morning workout fuel | Higher carbs, easy to digest |
| Mid-Morning Protein | Appetite control | Coffee + protein drink |
| Lunch | Main daytime meal | Balanced macros, satiety-focused |
| Afternoon Filler | Prevent evening hunger | Protein + fiber, non-workout days |
| Pre-Workout Snack | Evening workout fuel | Carb-forward |
| Post-Workout Snack | Post-workout recovery | Protein-dominant, hunger dampening |
| Dinner | Family meal | Protein-heavy, controlled carbs |
| After-Exercise Dinner | Post-workout dinner variant | Recovery framing, same risks |
| Weekend Breakfast | Weekend morning meal | More caloric, protein-first |
| Light Dinner | Calorie control dinner | Protein + vegetables |
| Hiking Fuel | Endurance activity fuel | Carbs + protein |

**Design Decision:** Dinner and After-Exercise Dinner are kept as separate types despite potential meal overlap. The psychological framing differs, and the app should reinforce intent.

### 3.3 Meal Type Extensibility

Users can create additional Meal Types as needed. A Meal can be assigned to multiple Meal Types (e.g., "Greek Yogurt Bowl" might work for both Breakfast and Post-Workout Snack).

---

## 4. Meals

### 4.1 Definition

A Meal is a specific food option that can fill a Meal Type slot. The critical differentiator from other meal planning apps: **exact portion descriptions are mandatory**.

Each Meal contains:
- **Name** — Descriptive identifier
- **Portion Description** — Exact quantities (e.g., "2 eggs + 1 slice whole wheat toast + 10g butter")
- **Macronutrients** — Calories, protein, carbs, fat (imported or manually entered)
- **Notes** — Optional preparation notes or variations
- **Assigned Meal Types** — Which slots this meal can fill

### 4.2 Portion Description Philosophy

The portion description is the **instruction the user follows**. It must be:
- Specific enough to eliminate decisions ("2 eggs" not "some eggs")
- Practical to measure (household measures acceptable)
- Complete (includes all components of the meal)

**Good examples:**
- "2 eggs scrambled + 1 slice toast + 10g butter"
- "150g chicken breast + 200g rice + mixed salad with 1 tbsp olive oil"
- "1 scoop whey protein + 300ml milk + 1 banana"

**Bad examples:**
- "Eggs and toast" (vague quantities)
- "Chicken with rice" (no portions)
- "Protein shake" (ingredients unclear)

### 4.3 Macronutrient Data

Macros are stored per Meal based on the defined portion. For MVP:
- Values are imported via CSV or entered manually
- No in-app calculation from ingredients
- Used for reflection and awareness, not enforcement

Future enhancement: Build meals from ingredients with automatic macro calculation.

---

## 5. Day Templates

### 5.1 Definition

Day Templates are fully user-defined sequences of Meal Types representing recurring daily patterns based on routine and activity level.

Each Day Template contains:
- **Name** — Descriptive identifier
- **Ordered Slots** — Sequence of Meal Types (position matters)
- **Notes** — Optional context or usage guidance

### 5.2 MVP Day Templates

| Template | Slots (in sequence order) | Slot Count |
|----------|---------------------------|------------|
| Normal Workday | Breakfast → Mid-Morning Protein → Lunch → Afternoon Filler → Dinner | 5 |
| Morning Workout Workday | Pre-Workout Breakfast → Post-Workout Snack → Lunch → Afternoon Filler → Dinner | 5 |
| Evening Workout Workday | Breakfast → Mid-Morning Protein → Lunch → Pre-Workout Snack → After-Exercise Dinner | 5 |
| Weekend | Weekend Breakfast → Lunch → Light Dinner | 3 |
| Hiking Weekend Day | Weekend Breakfast → Hiking Fuel → Lunch → Light Dinner | 4 |

### 5.3 Template Switching

Users can change a day's template after the week is generated. This is the only form of "editing" allowed—individual meal swaps are not supported in MVP.

**Use case:** "Thursday's workout got cancelled, switch to Normal Workday."

When a template is switched:
- All slots for that day are regenerated with new meals (via round-robin)
- Any existing completion statuses for that day are cleared
- The change is logged for historical reference

---

## 6. Weekly Planning

### 6.1 Week Plan (Template)

A Week Plan maps Day Templates to days of the week. One Week Plan is marked as default.

**Default Week Plan:**

| Day | Template |
|-----|----------|
| Monday | Normal Workday |
| Tuesday | Morning Workout Workday |
| Wednesday | Normal Workday |
| Thursday | Evening Workout Workday |
| Friday | Morning Workout Workday |
| Saturday | Weekend |
| Sunday | Weekend |

### 6.2 Weekly Plan Instance (Generated)

Each week, a new instance is generated from the Week Plan template:
- **Trigger:** Manual (user clicks "Generate Next Week", typically Sunday evening)
- **Process:** Expand each day's template into concrete slots with assigned meals
- **Meal Assignment:** Round-robin rotation per Meal Type (see Section 8)

### 6.3 Day-Level Override ("No Plan" Days)

Some days are acknowledged write-offs (vacations, social events, LAN parties). Rather than pretending to track these, the system supports explicit overrides:

- User marks a day as "No Plan" with optional reason
- All slots for that day are hidden/ignored
- Stats track override days separately (they don't affect adherence rate)
- Streaks are paused, not broken, by overrides

---

## 7. Completion Tracking

### 7.1 Philosophy

Completion tracking serves two purposes:
1. **Accountability:** Creates a feedback loop and gamified reward
2. **Reflection:** Identifies patterns (which meal types have low adherence?)

Tracking is encouraged but not enforced. Unmarked meals are treated as "unknown."

### 7.2 Completion Statuses

| Status | Meaning | Affects Adherence? |
|--------|---------|-------------------|
| ✅ **Followed** | Ate as planned (portion and food) | Yes (positive) |
| ⚠️ **Adjusted** | Ate similar but different portion or minor substitution | Yes (positive, weighted lower) |
| ❌ **Skipped** | Did not eat this meal | Yes (negative) |
| 🔄 **Replaced** | Ate something completely different | Yes (negative) |
| 🎉 **Social** | External context prevented following (dinner out, etc.) | No (excluded) |
| *(unmarked)* | Not yet tracked | No (excluded) |

### 7.3 Gamification Elements

- **Completion animation:** Satisfying visual/haptic feedback on marking "Followed"
- **Today's progress:** "3/5 meals completed" on main screen
- **Streak counter:** Consecutive days with all meals marked "Followed" or "Adjusted"
- **Adherence rate:** Percentage over last 7/30 days (excluding Social and unmarked)

### 7.4 Retroactive Completion

Users often forget to mark meals in the moment. The app supports:
- "Yesterday Review" prompt on morning open
- Ability to mark past meals (within current week)
- Batch completion for catching up

---

## 8. Meal Selection Algorithm (Round-Robin)

### 8.1 Design Goal

Provide variety without requiring decisions. Each Meal Type rotates through its assigned meals in a deterministic, fair order.

### 8.2 Algorithm

1. Meals for a Meal Type are ordered by creation date (oldest first), with ID as tie-breaker
2. System tracks the last-used meal for each Meal Type
3. On generation, next meal = `meals[(last_index + 1) % total_meals]`
4. State is updated after each assignment

### 8.3 Properties

- **Deterministic:** Same input always produces same output
- **Fair:** Every meal gets equal rotation
- **Extensible:** New meals are appended to rotation (will be picked up eventually)
- **Resilient:** Deleted meals don't break state (pointer resets gracefully)

### 8.4 Edge Cases

| Case | Behavior |
|------|----------|
| No meals for Meal Type | Slot shows "No meal assigned" |
| One meal for Meal Type | That meal is always selected |
| Meal deleted after assignment | Slot shows "Meal removed" (ON DELETE SET NULL) |
| New meal added | Appended to rotation, picked up in due course |

---

## 9. User Flows

### 9.1 Flow 1: Morning Glance (30 seconds)

**Context:** User opens app in the morning to see today's plan.

1. Open app → lands on **Today View**
2. See all meals for today in sequence
3. First incomplete meal highlighted as "Next"
4. Review what's coming (mental preparation)
5. Optional: mark yesterday's incomplete meals if prompted
6. Close app

**Success criteria:** User knows what they're eating today without any decisions.

### 9.2 Flow 2: Meal Time Check (10 seconds)

**Context:** User is about to eat and needs instructions.

1. Open app → "Next Meal" prominently displayed
2. See: Meal name, exact portion, optional macros
3. Prepare/eat the meal as specified
4. Tap "Done" → select status (default: Followed)
5. Satisfying confirmation animation
6. Close app

**Success criteria:** Zero decisions. Clear instruction. Dopamine reward.

### 9.3 Flow 3: Weekly Generation (2 minutes, weekly)

**Context:** Sunday evening, user generates next week's plan.

1. Open app (desktop or mobile)
2. Navigate to Week View
3. Tap "Generate Next Week"
4. Review auto-generated plan (read-only in MVP)
5. Optionally adjust day templates if schedule differs
6. Done

**Success criteria:** Week is planned with no per-meal decisions.

### 9.4 Flow 4: Template Switch (30 seconds)

**Context:** User's Thursday workout is cancelled.

1. Open app → Week View
2. Tap on Thursday
3. Tap "Change Template"
4. Select "Normal Workday"
5. Confirm → meals regenerate
6. Done

**Success criteria:** Adapted to schedule change without per-meal decisions.

### 9.5 Flow 5: Meal Library Management (as needed)

**Context:** User wants to add new meals to rotation.

1. Open app on desktop
2. Navigate to Meal Library
3. Add new meal with:
   - Name
   - Portion description
   - Macros (manual or CSV import)
   - Assigned Meal Types
4. Save → meal enters round-robin rotation automatically

**Success criteria:** Expanding options is low-friction; new meals appear in future plans.

---

## 10. UX Principles

### 10.1 Authoritative, Not Suggestive

The app tells you what to eat. It does not ask, suggest, or offer alternatives. This is a feature—removing choice removes cognitive load.

### 10.2 Mobile-First for Consumption

- Primary interaction is quick glances on mobile
- Today View must load instantly
- Completion requires one tap
- Desktop is for setup and planning only

### 10.3 Forgiving, Not Judgmental

- Missed completions are "unknown," not failures
- "Social" status acknowledges life happens
- Override days are tracked, not penalized
- Streaks pause rather than break on overrides

### 10.4 Progressive Disclosure

- Today View shows minimal info (name, portion)
- Tap to expand for macros and notes
- Week View shows structure; tap for detail
- Stats available but not prominent

### 10.5 Satisfying Completion

- Marking meals complete should feel rewarding
- Visual and haptic feedback (animation, vibration)
- Progress visible ("3/5 meals")
- Streaks create positive anticipation

---

## 11. Success Metrics

### 11.1 Primary (User-Measured)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Evening overeating incidents | Decrease 50%+ | User self-report / reflection |
| Decision fatigue | Significant reduction | User self-report |
| Plan adherence | >80% "Followed" rate | In-app tracking |

### 11.2 Secondary (App-Measured)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily engagement | Open app 3+ times/day | App analytics |
| Completion rate | >70% of slots marked | Database query |
| Week generation | 100% of weeks generated | Database query |
| Streak length | Average >5 days | Database query |

### 11.3 Anti-Metrics (Things to Avoid)

- Time spent in app (should be minimal—quick glances)
- Template changes per week (should be rare—stability is good)
- Override days (should be genuinely exceptional)

---

## 12. MVP Scope

### 12.1 In Scope

| Category | Features |
|----------|----------|
| **Core Data** | Meals with portions and macros, Meal Types, Day Templates, Week Plan |
| **Generation** | Round-robin meal assignment, manual weekly trigger |
| **Daily Use** | Today View with "Next Meal", completion tracking, Yesterday Review |
| **Flexibility** | Day-level template switching, "No Plan" overrides |
| **Stats** | Today's progress, streak counter, basic adherence rate |
| **Import** | CSV meal import |
| **Platform** | Mobile-first PWA (installable, offline Today View) |

### 12.2 Out of Scope (Deferred)

| Feature | Reason |
|---------|--------|
| Manual meal swapping | Defeats the "no decisions" philosophy |
| Grocery lists | Deferred to Phase 2 |
| Recipe links/instructions | User knows their meals |
| Macro range enforcement | Reflection only, no nudging |
| Multiple week templates | One default is sufficient for MVP |
| Multi-user / auth | Single-user MVP |
| Push notifications | User checks app habitually |
| Detailed deviation logging | Simple status enum is sufficient |

### 12.3 Technical Constraints

- Single-user (no auth, no multi-tenancy)
- Data model prepared for multi-user extension
- PWA, not native app (acceptable trade-off for MVP)
- Desktop-acceptable for setup; mobile-first for consumption

---

## 13. Future Enhancements (Post-MVP)

### 13.1 Phase 2: Productization

- User accounts and authentication
- Template export/import (share with others)
- Onboarding flow with default templates
- Public template library

### 13.2 Phase 2: Features

- Grocery list generation from weekly plan
- Ingredient-based meal builder with macro calculation
- Push notification reminders
- iOS/Android native apps (if PWA insufficient)
- Watch complications for "next meal"

### 13.3 Phase 3: Intelligence

- Adherence-weighted round-robin (deprioritize often-skipped meals)
- Contextual suggestions (weather, calendar integration)
- Macro balancing across day/week

---

## 14. Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Time windows on Meal Types? | Not needed; sequence is sufficient |
| Manual meal swaps? | No; template switching only |
| Week generation trigger? | Manual (Sunday evening) |
| Portion format? | Free text (not structured ingredients) |
| Desktop vs mobile priority? | Mobile-first for consumption, desktop for setup |
| Streaks on override days? | Paused, not broken |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Meal Type** | A functional eating slot (e.g., "Pre-Workout Snack") |
| **Meal** | A specific food with portion and macros |
| **Day Template** | An ordered sequence of Meal Types for a day pattern |
| **Week Plan** | Mapping of Day Templates to weekdays |
| **Weekly Plan Instance** | Generated week with concrete meal assignments |
| **Slot** | A single planned meal within a day |
| **Round-Robin** | Rotation algorithm ensuring meal variety |
| **Override** | Day marked as "No Plan" (excluded from tracking) |
| **Adherence** | Percentage of meals marked "Followed" or "Adjusted" |
