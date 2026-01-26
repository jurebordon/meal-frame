'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Template {
  id: string
  name: string
  mealCount: number
  description: string
}

interface TemplatePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTemplateId: string
  templates: Template[]
  onSelectTemplate: (templateId: string) => void
  onSelectNoPlan: (reason: string) => void
  hasCompletedMeals?: boolean
}

export function TemplatePicker({
  open,
  onOpenChange,
  currentTemplateId,
  templates,
  onSelectTemplate,
  onSelectNoPlan,
  hasCompletedMeals = false,
}: TemplatePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNoPlanInput, setShowNoPlanInput] = useState(false)
  const [noPlanReason, setNoPlanReason] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleTemplateClick = (templateId: string) => {
    if (templateId === currentTemplateId) {
      onOpenChange(false)
      return
    }

    setSelectedId(templateId)

    if (hasCompletedMeals) {
      setShowConfirmation(true)
    } else {
      onSelectTemplate(templateId)
      onOpenChange(false)
    }
  }

  const handleConfirm = () => {
    if (selectedId) {
      onSelectTemplate(selectedId)
      setShowConfirmation(false)
      onOpenChange(false)
    }
  }

  const handleNoPlanClick = () => {
    setShowNoPlanInput(true)
  }

  const handleNoPlanSubmit = () => {
    onSelectNoPlan(noPlanReason.trim())
    setShowNoPlanInput(false)
    setNoPlanReason('')
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-card sm:rounded-2xl"
      >
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-semibold text-foreground">
                {showNoPlanInput ? 'No Plan' : 'Change Template'}
              </h2>
              <button
                onClick={() => {
                  setShowNoPlanInput(false)
                  onOpenChange(false)
                }}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {!showNoPlanInput ? (
                <div className="space-y-3">
                  {templates.map((template) => {
                    const isCurrent = template.id === currentTemplateId
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          isCurrent
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{template.name}</h3>
                              {isCurrent && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              {template.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {template.mealCount} {template.mealCount === 1 ? 'meal' : 'meals'}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {/* No Plan Option */}
                  <button
                    onClick={handleNoPlanClick}
                    className="w-full rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-muted-foreground/50 hover:bg-muted"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-foreground">No Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          Skip meal planning for this day
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Why are you skipping this day? (optional)
                  </p>
                  <input
                    type="text"
                    value={noPlanReason}
                    onChange={(e) => setNoPlanReason(e.target.value)}
                    placeholder="e.g., Traveling, Eating out, Special event"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNoPlanInput(false)
                        setNoPlanReason('')
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleNoPlanSubmit} className="flex-1">
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Confirmation Screen */}
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-warning/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
              <h2 className="mb-2 text-center text-lg font-semibold text-foreground">
                Regenerate Day?
              </h2>
              <p className="mb-6 text-center text-sm text-muted-foreground leading-relaxed">
                Changing the template will regenerate all meals for this day. Any completion data
                will be lost.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false)
                    setSelectedId(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Regenerate
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
