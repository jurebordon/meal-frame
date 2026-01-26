'use client'

import { useQuery } from '@tanstack/react-query'
import { getDayTemplates } from '@/lib/api'
import type { DayTemplateListItem } from '@/lib/types'

export function useDayTemplates() {
  return useQuery<DayTemplateListItem[]>({
    queryKey: ['dayTemplates'],
    queryFn: getDayTemplates,
    staleTime: 1000 * 60 * 30, // Templates change infrequently
  })
}
