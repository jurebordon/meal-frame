'use client'

import { useState, useMemo } from 'react'
import { DayCardExpandable } from '@/components/mealframe/day-card-expandable'
import { TemplatePicker } from '@/components/mealframe/template-picker'
import type { Template } from '@/components/mealframe/template-picker'
import type { Meal } from '@/components/mealframe/day-card-expandable'
import { Button } from '@/components/ui/button'
import { useCurrentWeek, useGenerateWeek, useSwitchTemplate, useSetOverride } from '@/hooks/use-week'
import { useDayTemplates } from '@/hooks/use-day-templates'
import type { WeeklyPlanInstanceDayResponse } from '@/lib/types'
import { CalendarPlus, Loader2 } from 'lucide-react'

function formatWeekRange(weekStartDate: string): string {
  const start = new Date(weekStartDate + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function isToday(dateStr: string): boolean {
  const today = new Date()
  const date = new Date(dateStr + 'T00:00:00')
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr + 'T00:00:00')
  return date < today
}

function mapSlotsToMeals(day: WeeklyPlanInstanceDayResponse): Meal[] {
  return day.slots.map((slot) => ({
    id: slot.id,
    name: slot.meal?.name || slot.meal_type?.name || 'Unknown Meal',
    time: slot.meal_type?.name || '',
    portion: slot.meal?.portion_description || '',
    status: slot.completion_status ? 'completed' as const : 'pending' as const,
    completionType: slot.completion_status || undefined,
    macros: {
      calories: slot.meal?.calories_kcal || 0,
      protein: slot.meal?.protein_g || 0,
      carbs: slot.meal?.carbs_g || 0,
      fat: slot.meal?.fat_g || 0,
    },
  }))
}

export default function WeekPage() {
  const { data: weekPlan, isLoading, error } = useCurrentWeek()
  const { data: dayTemplates } = useDayTemplates()
  const generateWeek = useGenerateWeek()
  const switchTemplate = useSwitchTemplate()
  const setOverride = useSetOverride()

  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  // Map API templates to TemplatePicker format
  const pickerTemplates: Template[] = useMemo(() => {
    if (!dayTemplates) return []
    return dayTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      mealCount: t.slot_count,
      description: t.slot_preview || t.notes || `${t.slot_count} meal slots`,
    }))
  }, [dayTemplates])

  const selectedDay = weekPlan?.days.find((d) => d.date === selectedDayDate)
  const hasCompletedMeals = selectedDay
    ? selectedDay.slots.some((s) => s.completion_status !== null)
    : false

  const handleEditDay = (date: string) => {
    setSelectedDayDate(date)
    setShowTemplatePicker(true)
  }

  const handleSelectTemplate = (templateId: string) => {
    if (!selectedDayDate) return
    switchTemplate.mutate({ date: selectedDayDate, templateId })
  }

  const handleSelectNoPlan = (reason: string) => {
    if (!selectedDayDate) return
    setOverride.mutate({ date: selectedDayDate, reason: reason || undefined })
  }

  const handleGenerate = () => {
    generateWeek.mutate(undefined)
  }

  // No plan exists (404)
  const noPlan = error && 'status' in error && (error as { status: number }).status === 404

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  if (noPlan) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-safe">
          <header className="mb-8 pt-6">
            <h1 className="text-2xl font-semibold text-foreground">Week View</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No meal plan for this week yet
            </p>
          </header>

          <section className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CalendarPlus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">Generate Your Week</h2>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              Create a meal plan for this week using your templates and meal rotation.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generateWeek.isPending}
              size="lg"
            >
              {generateWeek.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Week'
              )}
            </Button>
            {generateWeek.isError && (
              <p className="mt-4 text-sm text-destructive">
                {generateWeek.error instanceof Error
                  ? generateWeek.error.message
                  : 'Failed to generate week'}
              </p>
            )}
          </section>
        </div>
      </main>
    )
  }

  if (error || !weekPlan) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-safe">
          <header className="mb-8 pt-6">
            <h1 className="text-2xl font-semibold text-foreground">Week View</h1>
          </header>
          <section className="rounded-xl border border-destructive/50 bg-destructive/5 p-6">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load week plan'}
            </p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex min-h-16 max-w-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-pretty text-sm font-semibold text-foreground sm:text-base">
              {formatWeekRange(weekPlan.week_start_date)}
            </h1>
            <p className="text-xs text-muted-foreground">
              {weekPlan.week_plan?.name || 'Week Plan'}
            </p>
          </div>
          <Button
            size="sm"
            variant="default"
            className="shrink-0"
            onClick={handleGenerate}
            disabled={generateWeek.isPending}
          >
            {generateWeek.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Next Week'
            )}
          </Button>
        </div>
      </header>

      {/* Day Cards List */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-4">
          {weekPlan.days.map((day) => (
            <DayCardExpandable
              key={day.date}
              date={new Date(day.date + 'T00:00:00').getDate().toString()}
              weekday={day.weekday.slice(0, 3)}
              fullDate={formatFullDate(day.date)}
              templateName={day.template?.name || 'No Template'}
              meals={mapSlotsToMeals(day)}
              isOverride={day.is_override}
              overrideReason={day.override_reason || undefined}
              isToday={isToday(day.date)}
              isPast={isPast(day.date)}
              onEdit={() => handleEditDay(day.date)}
            />
          ))}
        </div>

        {/* Helper Text */}
        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap any day to view all meals. Use the edit button to change templates or mark a day as
            &quot;No Plan&quot; when you&apos;re traveling or eating out.
          </p>
        </div>
      </main>

      {/* Template Picker Modal */}
      <TemplatePicker
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        currentTemplateId={selectedDay?.template?.id || ''}
        templates={pickerTemplates}
        onSelectTemplate={handleSelectTemplate}
        onSelectNoPlan={handleSelectNoPlan}
        hasCompletedMeals={hasCompletedMeals}
      />
    </div>
  )
}
