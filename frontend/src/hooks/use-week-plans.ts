'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWeekPlans,
  getWeekPlan,
  createWeekPlan,
  updateWeekPlan,
  deleteWeekPlan,
  setDefaultWeekPlan,
} from '@/lib/api'
import type {
  WeekPlanListItem,
  WeekPlanResponse,
  WeekPlanCreate,
  WeekPlanUpdate,
} from '@/lib/types'

export function useWeekPlans() {
  return useQuery<WeekPlanListItem[]>({
    queryKey: ['weekPlans'],
    queryFn: getWeekPlans,
    staleTime: 1000 * 60 * 30,
  })
}

export function useWeekPlan(id: string | null) {
  return useQuery<WeekPlanResponse>({
    queryKey: ['weekPlan', id],
    queryFn: () => getWeekPlan(id!),
    enabled: !!id,
  })
}

export function useCreateWeekPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WeekPlanCreate) => createWeekPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekPlans'] })
    },
  })
}

export function useUpdateWeekPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WeekPlanUpdate }) =>
      updateWeekPlan(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weekPlans'] })
      queryClient.invalidateQueries({ queryKey: ['weekPlan', variables.id] })
    },
  })
}

export function useDeleteWeekPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWeekPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekPlans'] })
    },
  })
}

export function useSetDefaultWeekPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => setDefaultWeekPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekPlans'] })
    },
  })
}
