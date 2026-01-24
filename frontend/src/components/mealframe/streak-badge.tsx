import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  days: number
  className?: string
}

export function StreakBadge({ days, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20',
        className
      )}
    >
      <span className="text-base leading-none">🔥</span>
      <span>{days} {days === 1 ? 'day' : 'days'}</span>
    </div>
  )
}
