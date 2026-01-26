'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCurrentWeek,
  generateWeek,
  switchDayTemplate,
  setDayOverride,
  clearDayOverride,
} from '@/lib/api'
import type {
  WeeklyPlanInstanceResponse,
  WeeklyPlanGenerateRequest,
} from '@/lib/types'

export function useCurrentWeek() {
  return useQuery<WeeklyPlanInstanceResponse>({
    queryKey: ['currentWeek'],
    queryFn: getCurrentWeek,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // Don't retry on 404 (no plan exists)
      if (error && 'status' in error && (error as { status: number }).status === 404) {
        return false
      }
      return failureCount < 3
    },
  })
}

export function useGenerateWeek() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request?: WeeklyPlanGenerateRequest) => generateWeek(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentWeek'] })
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

export function useSwitchTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ date, templateId }: { date: string; templateId: string }) =>
      switchDayTemplate(date, { day_template_id: templateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentWeek'] })
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

export function useSetOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ date, reason }: { date: string; reason?: string }) =>
      setDayOverride(date, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentWeek'] })
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

export function useClearOverride() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (date: string) => clearDayOverride(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentWeek'] })
      queryClient.invalidateQueries({ queryKey: ['today'] })
    },
  })
}
