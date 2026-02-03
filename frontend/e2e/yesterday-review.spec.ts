import { test, expect } from '@playwright/test'
import {
  ensureWeeklyPlan,
  resetYesterdayCompletions,
  completeAllYesterdaySlots,
  getYesterday,
  type TodayData,
} from './helpers'

const YESTERDAY_REVIEW_DISMISSED_KEY = 'mealframe_yesterday_review_dismissed'

/**
 * Get today's date string in YYYY-MM-DD format.
 */
function getTodayDateString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

let yesterday: TodayData

test.beforeAll(async () => {
  await ensureWeeklyPlan()
})

test.describe('Yesterday Review Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Clear the localStorage dismissal flag before each test
    await page.goto('/')
    await page.evaluate((key) => localStorage.removeItem(key), YESTERDAY_REVIEW_DISMISSED_KEY)
  })

  test('Modal appears when yesterday has unmarked slots', async ({ page }) => {
    // Reset yesterday to have unmarked slots
    yesterday = await resetYesterdayCompletions()

    // Skip if yesterday has no slots (no plan for yesterday)
    if (yesterday.slots.length === 0) {
      test.skip()
      return
    }

    // Navigate to Today View
    await page.goto('/')

    // Wait for page to load
    await expect(page.locator('header h1')).toBeVisible({ timeout: 10000 })

    // Yesterday Review modal should appear
    await expect(page.getByText("Yesterday's Meals")).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/\d+ unmarked meal/)).toBeVisible()
  })

  test('Modal does NOT appear when yesterday is fully completed', async ({ page }) => {
    // Complete all of yesterday's slots
    yesterday = await completeAllYesterdaySlots()

    // Skip if yesterday has no slots
    if (yesterday.slots.length === 0) {
      test.skip()
      return
    }

    // Navigate to Today View
    await page.goto('/')

    // Wait for page to load
    await expect(page.locator('header h1')).toBeVisible({ timeout: 10000 })

    // Yesterday Review modal should NOT appear
    await expect(page.getByText("Yesterday's Meals")).not.toBeVisible()
  })

  test('Dismissing modal saves preference for today', async ({ page }) => {
    // Reset yesterday to have unmarked slots
    yesterday = await resetYesterdayCompletions()

    if (yesterday.slots.length === 0) {
      test.skip()
      return
    }

    // Navigate to Today View
    await page.goto('/')
    await expect(page.getByText("Yesterday's Meals")).toBeVisible({ timeout: 10000 })

    // Click "Skip for now" to dismiss
    await page.getByRole('button', { name: /skip for now/i }).click()

    // Modal should close
    await expect(page.getByText("Yesterday's Meals")).not.toBeVisible()

    // Verify localStorage was set
    const dismissedDate = await page.evaluate(
      (key) => localStorage.getItem(key),
      YESTERDAY_REVIEW_DISMISSED_KEY
    )
    expect(dismissedDate).toBe(getTodayDateString())

    // Reload and verify modal doesn't appear
    await page.reload()
    await expect(page.locator('header h1')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Yesterday's Meals")).not.toBeVisible()
  })

  test('Can mark a meal from yesterday review modal', async ({ page }) => {
    // Reset yesterday to have unmarked slots
    yesterday = await resetYesterdayCompletions()

    if (yesterday.slots.length === 0) {
      test.skip()
      return
    }

    // Navigate to Today View
    await page.goto('/')
    await expect(page.getByText("Yesterday's Meals")).toBeVisible({ timeout: 10000 })

    // Get the first meal's name
    const firstMealName = yesterday.slots[0]?.meal?.name
    if (!firstMealName) {
      test.skip()
      return
    }

    // Click on the first meal to expand options
    await page.getByText(firstMealName).click()

    // Select "Followed" status
    await page.getByRole('button', { name: 'Followed' }).click()

    // The meal should disappear from the unmarked list (or show fewer meals)
    await page.waitForTimeout(500)

    // If there was only one slot, modal should auto-close
    if (yesterday.slots.length === 1) {
      await expect(page.getByText("Yesterday's Meals")).not.toBeVisible()
    } else {
      // Count should decrease
      const remainingText = page.getByText(/\d+ unmarked meal/)
      const text = await remainingText.textContent()
      const remaining = parseInt(text?.match(/(\d+)/)?.[1] ?? '0', 10)
      expect(remaining).toBe(yesterday.slots.length - 1)
    }
  })

  test('Closing modal via X button also dismisses for today', async ({ page }) => {
    // Reset yesterday to have unmarked slots
    yesterday = await resetYesterdayCompletions()

    if (yesterday.slots.length === 0) {
      test.skip()
      return
    }

    // Navigate to Today View
    await page.goto('/')
    await expect(page.getByText("Yesterday's Meals")).toBeVisible({ timeout: 10000 })

    // Click the close button (X)
    await page.getByLabel(/close yesterday review/i).click()

    // Modal should close
    await expect(page.getByText("Yesterday's Meals")).not.toBeVisible()

    // Verify localStorage was set
    const dismissedDate = await page.evaluate(
      (key) => localStorage.getItem(key),
      YESTERDAY_REVIEW_DISMISSED_KEY
    )
    expect(dismissedDate).toBe(getTodayDateString())
  })

  test('Modal shows correct date for yesterday', async ({ page }) => {
    // Reset yesterday to have unmarked slots
    yesterday = await resetYesterdayCompletions()

    if (yesterday.slots.length === 0) {
      test.skip()
      return
    }

    // Navigate to Today View
    await page.goto('/')
    await expect(page.getByText("Yesterday's Meals")).toBeVisible({ timeout: 10000 })

    // The modal should show yesterday's formatted date
    // e.g., "Monday, Jan 1"
    const yesterdayDateObj = new Date()
    yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1)
    const expectedWeekday = yesterdayDateObj.toLocaleDateString('en-US', { weekday: 'long' })

    await expect(page.getByText(expectedWeekday)).toBeVisible()
  })
})
