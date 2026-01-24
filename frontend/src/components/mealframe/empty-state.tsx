'use client';

import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'celebratory' | 'subtle'
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center ${className}`}
    >
      {icon && (
        <div
          className={`mb-4 ${
            variant === 'celebratory' ? 'text-success' : 'text-muted-foreground'
          }`}
        >
          {icon}
        </div>
      )}

      <h3
        className={`mb-2 text-lg font-semibold ${
          variant === 'celebratory' ? 'text-success' : 'text-foreground'
        }`}
      >
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {primaryAction && (
            <Button onClick={primaryAction.onClick} size="lg">
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="lg">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
