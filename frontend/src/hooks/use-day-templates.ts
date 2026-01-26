'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDayTemplates,
  getDayTemplate,
  createDayTemplate,
  updateDayTemplate,
  deleteDayTemplate,
} from '@/lib/api'
import type {
  DayTemplateListItem,
  DayTemplateResponse,
  DayTemplateCreate,
  DayTemplateUpdate,
} from '@/lib/types'

export function useDayTemplates() {
  return useQuery<DayTemplateListItem[]>({
    queryKey: ['dayTemplates'],
    queryFn: getDayTemplates,
    staleTime: 1000 * 60 * 30, // Templates change infrequently
  })
}

export function useDayTemplate(id: string | null) {
  return useQuery<DayTemplateResponse>({
    queryKey: ['dayTemplate', id],
    queryFn: () => getDayTemplate(id!),
    enabled: !!id,
  })
}

export function useCreateDayTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DayTemplateCreate) => createDayTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dayTemplates'] })
    },
  })
}

export function useUpdateDayTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DayTemplateUpdate }) =>
      updateDayTemplate(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dayTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['dayTemplate', variables.id] })
    },
  })
}

export function useDeleteDayTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDayTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dayTemplates'] })
    },
  })
}
