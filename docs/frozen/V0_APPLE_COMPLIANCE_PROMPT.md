# Apple Design Compliance Audit Prompt for v0

Use this prompt in your existing v0 chat after completing all design screens. It will audit and fix any violations of Apple's Human Interface Guidelines to ensure your PWA is ready for implementation — and future-proofed for native iOS conversion.

---

## The Prompt

```
I've completed the MealFrame design across all screens. Before implementation, I need to audit everything against Apple's Human Interface Guidelines to ensure compliance. This app will launch as a PWA first, then potentially move to native iOS (App Store) later, so I want to future-proof the design now.

Please review ALL components and screens we've created and check/fix the following:

---

## 1. SAFE AREAS (Critical)

Check every screen for proper safe area handling:

**Top Safe Area (notch/Dynamic Island):**
- Headers must not place content in the top 47pt on notched iPhones
- Status bar area (time, battery, signal) must remain unobstructed
- Apply `env(safe-area-inset-top)` padding to top-level containers

**Bottom Safe Area (home indicator):**
- Bottom navigation tab bar needs 34pt extra padding on notched devices
- Bottom sheets must not place interactive elements in home indicator zone
- Apply `env(safe-area-inset-bottom)` padding
- The "Mark Complete" button and tab bar items are especially critical

**Implementation pattern needed:**
```css
.screen-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Show me the Today View and Completion Modal with safe areas properly implemented, with visual guides showing the safe zones.

---

## 2. TOUCH TARGETS (Critical - 44pt minimum)

Audit every interactive element for minimum 44×44pt touch target:

**High-risk elements to check:**
- [ ] Completion status buttons in the bottom sheet (all 5 options)
- [ ] Tab bar icons
- [ ] Streak badge (if tappable)
- [ ] Edit/settings icons on cards
- [ ] Close/dismiss buttons on modals
- [ ] Template picker options
- [ ] Meal type filter chips
- [ ] Any icon-only buttons

**Fix pattern:** If visual size is smaller than 44pt, expand the tappable area:
```jsx
<button className="p-3 -m-3"> {/* Visual 24px icon, 44px touch area */}
  <Icon className="w-6 h-6" />
</button>
```

List any elements currently under 44pt and show the fixed versions.

---

## 3. ACCESSIBILITY LABELS (Required for VoiceOver)

Every interactive element needs a descriptive `aria-label`:

**Check and add labels for:**
- [ ] Tab bar items: "Today, current tab" / "Week" / "Meals" / "Setup" / "Stats"
- [ ] Mark Complete button: "Mark [meal name] as complete"
- [ ] Status buttons: "Mark as followed" / "Mark as adjusted" / etc.
- [ ] Progress ring: "3 of 5 meals completed today"
- [ ] Streak badge: "Current streak: 4 days"
- [ ] Edit buttons: "Edit [item name]"
- [ ] Close buttons: "Close" or "Dismiss"
- [ ] Meal cards: Full context when focused

**Pattern:**
```jsx
<button aria-label="Mark Scrambled Eggs as complete">
  <CheckIcon />
  <span>Mark Complete</span>
</button>

<div role="status" aria-label="3 of 5 meals completed today">
  <ProgressRing value={60} />
</div>
```

Show me the Today View and Completion Modal with full accessibility labels added.

---

## 4. DYNAMIC TYPE SUPPORT (Expected)

Text must scale with user's system font size preference.

**Check that:**
- [ ] Body text uses relative sizing (not fixed px that won't scale)
- [ ] Meal names remain readable at larger sizes (may need truncation)
- [ ] Portion descriptions don't break layout at 200% text size
- [ ] Buttons have sufficient padding to accommodate larger text
- [ ] Layout remains functional (not broken) at accessibility text sizes

**Recommend using these Tailwind classes:**
- `text-base` instead of `text-[16px]`
- Line heights that accommodate scaling
- Containers that grow with content

Show the MealCard component at default size and at ~150% text scale to verify it doesn't break.

---

## 5. COLOR CONTRAST (Accessibility requirement)

WCAG AA requires minimum contrast ratios:
- **Normal text:** 4.5:1 against background
- **Large text (18pt+):** 3:1 against background
- **Interactive elements:** 3:1 against adjacent colors

**Check in dark mode:**
- [ ] Muted/secondary text is still readable (common failure point)
- [ ] Disabled states have sufficient contrast
- [ ] Status badges are distinguishable (Followed vs Adjusted vs Skipped)
- [ ] Placeholder text in inputs meets contrast

**Check in light mode:**
- [ ] Same checks as above
- [ ] Warm neutrals don't wash out

List any contrast failures and show fixed color values.

---

## 6. STANDARD IOS NAVIGATION PATTERNS

Verify these patterns are followed:

**Back navigation:**
- [ ] Back button is in top-left (not right, not bottom)
- [ ] Back button uses chevron-left icon or "< Back" text
- [ ] Screens support swipe-from-left-edge to go back (note: this is behavior, not design)

**Tab bar:**
- [ ] Located at bottom of screen
- [ ] Shows labels below icons (not icon-only)
- [ ] Active state is clearly distinguishable
- [ ] 5 items maximum (you have 5 ✓)

**Modals/Sheets:**
- [ ] Bottom sheets have visible drag handle/indicator
- [ ] Close affordance is clear (X button or tap-outside-to-dismiss visual cue)
- [ ] Modal content doesn't shift unexpectedly

Confirm these patterns or show fixes needed.

---

## 7. LOADING & EMPTY STATES

Apple expects graceful handling of edge cases:

**Loading states:**
- [ ] Skeleton loaders match content layout (not generic spinners)
- [ ] Loading doesn't block entire screen if partial data available
- [ ] Pull-to-refresh has standard iOS-style indicator

**Empty states:**
- [ ] Provide clear explanation of why empty
- [ ] Include actionable CTA to resolve
- [ ] Don't show error styling for expected empty states

Show skeleton loader state for Today View and verify empty states are friendly, not broken-looking.

---

## 8. BUTTON & CONTROL STATES

Every interactive element needs visual states:

**Required states:**
- [ ] Default/Rest
- [ ] Pressed/Active (immediate feedback on touch)
- [ ] Disabled (visually distinct, meets contrast)
- [ ] Focused (for keyboard navigation)

**Check specifically:**
- [ ] "Mark Complete" primary button has a pressed state
- [ ] Status buttons in completion modal have pressed states
- [ ] Tab bar items have pressed states
- [ ] Disabled buttons are clearly non-interactive

Show the primary button and status buttons in all states.

---

## 9. HAPTIC FEEDBACK READINESS (Future native)

While PWA can't trigger haptics, design should indicate where haptics would occur for future native conversion:

**Recommended haptic moments:**
- Completing a meal (success haptic)
- Selecting a status in completion modal (light tap)
- Pulling to refresh (subtle feedback)
- Tab bar selection (light tap)
- Error states (error haptic)

Add code comments or a reference noting where haptics should be implemented in native version.

---

## 10. LAUNCH SCREEN PREVIEW

Create a simple launch screen that:
- [ ] Matches the app's visual style (dark mode, warm neutrals)
- [ ] Shows app icon or simple logo
- [ ] Has no loading indicators, version numbers, or "beta" labels
- [ ] Transitions smoothly into the Today View

Show a launch screen design that follows these guidelines.

---

## 11. ORIENTATION & RESPONSIVE BEHAVIOR

**Verify:**
- [ ] Primary screens (Today, Completion Modal) work in portrait only (acceptable)
- [ ] Or if supporting landscape: content reflows properly
- [ ] iPad layout doesn't just stretch phone layout (if supporting iPad)
- [ ] Desktop view (PWA in browser) looks intentional, not broken

Confirm orientation strategy and show any needed adjustments for larger screens.

---

## DELIVERABLES

After this audit, provide:

1. **Summary table** of all issues found and fixed
2. **Updated Today View** with all compliance fixes visible
3. **Updated Completion Modal** with all compliance fixes visible
4. **Updated Tab Bar/Navigation** with proper safe areas and touch targets
5. **Component variants** showing all required states (pressed, disabled, etc.)
6. **Accessibility annotations** showing labels and focus order
7. **Launch screen** design

Focus on the most critical screens first (Today View, Completion Flow, Navigation) since those are the primary user touchpoints.
```

---

## Follow-Up Prompts

After the main audit, use these to address specific issues:

### If touch targets need work:
```
The completion status buttons are visually 36pt. Show me these buttons with the visual size unchanged but touch target expanded to 48pt using padding. The tap area should be larger than the visible button.
```

### If contrast fails:
```
The muted text on completed meals fails contrast in dark mode. It's currently #6B7280 on #1F2937. Find a color that:
- Meets 4.5:1 contrast ratio
- Still feels "muted" and secondary
- Fits the warm neutral palette
```

### If safe areas look wrong:
```
Show me the Today View as it would appear on:
1. iPhone 15 Pro (Dynamic Island)
2. iPhone SE (no notch)
3. iPhone 8 (home button)

The layout should adapt properly to each device's safe areas without content being cut off or awkward spacing.
```

### For skeleton loaders:
```
Create a skeleton loading state for the Today View that:
- Matches the exact layout of the loaded state
- Uses subtle pulse animation
- Shows meal card shapes where meals will appear
- Maintains the header with real data (date, streak) if available
```

### For launch screen:
```
Create a minimal launch screen with:
- The app icon or logo centered
- Dark background matching the app (#1a1a1a or similar)
- No text except possibly "MealFrame" in subtle typography
- Clean enough to transition seamlessly into Today View
```

---

## Quick Reference: Apple's Non-Negotiables

| Requirement | Minimum | Where to Check |
|-------------|---------|----------------|
| Touch targets | 44×44 pt | All buttons, icons, tappable elements |
| Top safe area | 47pt (notched) | Headers, top content |
| Bottom safe area | 34pt (notched) | Tab bar, bottom buttons, sheets |
| Text contrast | 4.5:1 | All text against backgrounds |
| UI contrast | 3:1 | Buttons, icons against backgrounds |
| Back button | Top-left | All detail/sub screens |
| Tab bar | Bottom, labeled | Navigation |

---

## After the Audit

Once v0 has updated the designs:

1. **Export/copy the corrected components**
2. **Create a device testing checklist** — test on actual iPhone with notch and without
3. **Add these as code review criteria** for implementation
4. **Document the haptic feedback points** for future native development

This ensures your PWA is bulletproof and ready for native conversion when the time comes.
