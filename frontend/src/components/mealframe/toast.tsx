'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ToastProps {
  open: boolean
  message: string
  actionLabel?: string
  onAction?: () => void
  onClose: () => void
  duration?: number
}

export function Toast({
  open,
  message,
  actionLabel = 'Undo',
  onAction,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [open, duration, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-[480px]"
        >
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{message}</p>
            {onAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onAction()
                  onClose()
                }}
                className="h-8 font-semibold text-primary hover:text-primary"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
