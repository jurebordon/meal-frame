'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getYesterday, completeSlot } from '@/lib/api'
import type { TodayResponse, CompletionStatus } from '@/lib/types'

const YESTERDAY_REVIEW_DISMISSED_KEY = 'mealframe_yesterday_review_dismissed'

/**
 * Get today's date string in YYYY-MM-DD format (local timezone).
 */
function getTodayDateString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

/**
 * Check if the yesterday review modal has already been shown/dismissed today.
 */
function wasReviewDismissedToday(): boolean {
  if (typeof window === 'undefined') return true // SSR: don't show

  const dismissed = localStorage.getItem(YESTERDAY_REVIEW_DISMISSED_KEY)
  if (!dismissed) return false

  return dismissed === getTodayDateString()
}

/**
 * Mark the yesterday review as dismissed for today.
 */
function markReviewDismissed(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(YESTERDAY_REVIEW_DISMISSED_KEY, getTodayDateString())
}

/**
 * Hook to fetch yesterday's data and manage review modal state.
 *
 * Returns:
 * - yesterdayData: The yesterday response (if has unmarked slots and not dismissed)
 * - isLoading: Loading state
 * - shouldShowReview: Whether to show the review modal
 * - dismissReview: Function to dismiss the review for today
 * - unmarkedSlots: Array of slots without completion status
 */
export function useYesterdayReview() {
  const [shouldShowReview, setShouldShowReview] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  const { data: yesterdayData, isLoading, isSuccess } = useQuery<TodayResponse>({
    queryKey: ['yesterday'],
    queryFn: getYesterday,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Only fetch if we haven't dismissed today
    enabled: !wasReviewDismissedToday(),
  })

  // Compute unmarked slots
  const unmarkedSlots = yesterdayData?.slots.filter(
    slot => slot.completion_status === null
  ) ?? []

  // Determine if we should show the review modal
  useEffect(() => {
    if (isLoading || hasChecked) return

    if (isSuccess && !wasReviewDismissedToday()) {
      // Show modal only if there are unmarked slots
      const hasUnmarked = unmarkedSlots.length > 0
      setShouldShowReview(hasUnmarked)
    }

    setHasChecked(true)
  }, [isLoading, isSuccess, unmarkedSlots.length, hasChecked])

  const dismissReview = useCallback(() => {
    markReviewDismissed()
    setShouldShowReview(false)
  }, [])

  return {
    yesterdayData,
    isLoading,
    shouldShowReview,
    dismissReview,
    unmarkedSlots,
  }
}

/**
 * Hook for completing a yesterday slot.
 * Similar to useCompleteSlot but updates the 'yesterday' query cache.
 */
export function useCompleteYesterdaySlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slotId, status }: { slotId: string; status: CompletionStatus }) =>
      completeSlot(slotId, { status }),
    onMutate: async ({ slotId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['yesterday'] })

      const previous = queryClient.getQueryData<TodayResponse>(['yesterday'])

      if (previous) {
        const updatedSlots = previous.slots.map((slot) => {
          if (slot.id === slotId) {
            return {
              ...slot,
              completion_status: status,
              completed_at: new Date().toISOString(),
            }
          }
          return slot
        })

        const completed = updatedSlots.filter((s) => s.completion_status !== null).length

        queryClient.setQueryData<TodayResponse>(['yesterday'], {
          ...previous,
          slots: updatedSlots,
          stats: {
            ...previous.stats,
            completed,
          },
        })
      }

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['yesterday'], context.previous)
      }
    },
    onSettled: () => {
      // Invalidate both yesterday and today queries for consistency
      queryClient.invalidateQueries({ queryKey: ['yesterday'] })
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}
