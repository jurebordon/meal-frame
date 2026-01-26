'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getToday, completeSlot, uncompleteSlot } from '@/lib/api'
import type { TodayResponse, CompletionStatus } from '@/lib/types'

export function useToday() {
  return useQuery<TodayResponse>({
    queryKey: ['today'],
    queryFn: getToday,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCompleteSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ slotId, status }: { slotId: string; status: CompletionStatus }) =>
      completeSlot(slotId, { status }),
    onMutate: async ({ slotId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['today'] })

      const previous = queryClient.getQueryData<TodayResponse>(['today'])

      if (previous) {
        const updatedSlots = previous.slots.map((slot) => {
          if (slot.id === slotId) {
            return {
              ...slot,
              completion_status: status,
              completed_at: new Date().toISOString(),
              is_next: false,
            }
          }
          return slot
        })

        // Recompute is_next: first slot with null completion_status
        const nextSlotIndex = updatedSlots.findIndex((s) => s.completion_status === null)
        const finalSlots = updatedSlots.map((slot, i) => ({
          ...slot,
          is_next: i === nextSlotIndex,
        }))

        const completed = finalSlots.filter((s) => s.completion_status !== null).length

        queryClient.setQueryData<TodayResponse>(['today'], {
          ...previous,
          slots: finalSlots,
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
        queryClient.setQueryData(['today'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

export function useUncompleteSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slotId: string) => uncompleteSlot(slotId),
    onMutate: async (slotId) => {
      await queryClient.cancelQueries({ queryKey: ['today'] })

      const previous = queryClient.getQueryData<TodayResponse>(['today'])

      if (previous) {
        const updatedSlots = previous.slots.map((slot) => {
          if (slot.id === slotId) {
            return {
              ...slot,
              completion_status: null,
              completed_at: null,
              is_next: false,
            }
          }
          return slot
        })

        // Recompute is_next
        const nextSlotIndex = updatedSlots.findIndex((s) => s.completion_status === null)
        const finalSlots = updatedSlots.map((slot, i) => ({
          ...slot,
          is_next: i === nextSlotIndex,
        }))

        const completed = finalSlots.filter((s) => s.completion_status !== null).length

        queryClient.setQueryData<TodayResponse>(['today'], {
          ...previous,
          slots: finalSlots,
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
        queryClient.setQueryData(['today'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}
