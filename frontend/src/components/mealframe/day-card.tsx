'use client';

import { cn } from '@/lib/utils'

interface DayCardProps {
  date: string
  weekday: string
  templateName: string
  slotCount: number
  completedCount: number
  isOverride?: boolean
  overrideReason?: string
  isToday?: boolean
  className?: string
  onClick?: () => void
}

export function DayCard({
  date,
  weekday,
  templateName,
  slotCount,
  completedCount,
  isOverride = false,
  overrideReason,
  isToday = false,
  className,
  onClick,
}: DayCardProps) {
  const completionPercentage = slotCount > 0 ? (completedCount / slotCount) * 100 : 0

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-all duration-200',
        isToday && 'ring-2 ring-primary/30',
        isOverride && 'opacity-50',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Date and Weekday */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{weekday}</div>
            <div className={cn('text-lg font-semibold', isToday && 'text-primary')}>{date}</div>
          </div>
          {isToday && (
            <div className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Today
            </div>
          )}
        </div>

        {isOverride ? (
          // Override State
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">No Plan</div>
            {overrideReason && <div className="text-sm text-muted-foreground/80">{overrideReason}</div>}
          </div>
        ) : (
          <>
            {/* Template Name */}
            <div className="text-sm font-medium text-card-foreground">{templateName}</div>

            {/* Slot Count */}
            <div className="text-sm text-muted-foreground">
              {slotCount} {slotCount === 1 ? 'meal' : 'meals'}
            </div>

            {/* Completion Progress Mini-Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {completedCount}/{slotCount}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
