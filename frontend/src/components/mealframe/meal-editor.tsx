'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealFormData {
  id?: string
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  types: MealType[]
  notes?: string
}

interface MealEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (meal: MealFormData) => void
  onDelete?: () => void
  initialData?: MealFormData
  mode: 'add' | 'edit'
}

export function MealEditor({
  open,
  onOpenChange,
  onSave,
  onDelete,
  initialData,
  mode,
}: MealEditorProps) {
  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    portion: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    types: [],
    notes: '',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        name: '',
        portion: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        types: [],
        notes: '',
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  const toggleMealType = (type: MealType) => {
    setFormData((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }))
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete()
      onOpenChange(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-4 bottom-4 z-50 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-y-8"
          >
            {/* Header - Fixed */}
            <div className="shrink-0 border-b border-border p-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-balance text-xl font-bold text-foreground sm:text-2xl">
                    {mode === 'add' ? 'Add Meal' : 'Edit Meal'}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mode === 'add'
                      ? 'Create a new meal for your library'
                      : 'Update meal details'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 shrink-0 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form - Scrollable */}
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Meal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 w-full rounded-lg border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., Greek Yogurt Bowl"
                    required
                  />
                </div>

                {/* Portion */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Portion Description *
                  </label>
                  <textarea
                    value={formData.portion}
                    onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                    className="min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., 200g Greek yogurt + 30g granola + 100g mixed berries"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Be specific with weights and measurements for accuracy
                  </p>
                </div>

                {/* Macros Grid */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-foreground">
                    Macros *
                  </label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) =>
                          setFormData({ ...formData, calories: Number(e.target.value) })
                        }
                        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        value={formData.protein}
                        onChange={(e) =>
                          setFormData({ ...formData, protein: Number(e.target.value) })
                        }
                        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        value={formData.carbs}
                        onChange={(e) =>
                          setFormData({ ...formData, carbs: Number(e.target.value) })
                        }
                        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Fat (g)</label>
                      <input
                        type="number"
                        value={formData.fat}
                        onChange={(e) =>
                          setFormData({ ...formData, fat: Number(e.target.value) })
                        }
                        className="h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Meal Types */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-foreground">
                    Meal Types * (select at least one)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleMealType(type)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          formData.types.includes(type)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-foreground hover:border-primary/50'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[60px] w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Additional notes, preferences, or substitutions"
                  />
                </div>

                {/* Actions */}
                {showDeleteConfirm ? (
                  <div className="flex flex-col gap-3 border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete this meal?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="flex-1"
                      >
                        Yes, Delete
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 border-t border-border pt-4">
                    {mode === 'edit' && onDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        aria-label="Delete meal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex flex-1 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={formData.types.length === 0} size="sm" className="flex-1">
                        {mode === 'add' ? 'Add Meal' : 'Save'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
