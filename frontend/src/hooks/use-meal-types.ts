'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMealTypes, createMealType, updateMealType, deleteMealType } from '@/lib/api'
import type { MealTypeWithCount, MealTypeCreate, MealTypeUpdate, MealTypeResponse } from '@/lib/types'

export function useMealTypes() {
  return useQuery<MealTypeWithCount[]>({
    queryKey: ['mealTypes'],
    queryFn: getMealTypes,
    staleTime: 1000 * 60 * 30, // Meal types change infrequently
  })
}

export function useCreateMealType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MealTypeCreate) => createMealType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealTypes'] })
    },
  })
}

export function useUpdateMealType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MealTypeUpdate }) => updateMealType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealTypes'] })
    },
  })
}

export function useDeleteMealType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMealType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealTypes'] })
    },
  })
}
