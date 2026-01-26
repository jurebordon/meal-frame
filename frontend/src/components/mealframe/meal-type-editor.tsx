'use client'

import React, { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import type { MealTypeWithCount, MealTypeCreate } from '@/lib/types'

interface MealTypeEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType?: MealTypeWithCount | null
  onSave: (data: MealTypeCreate) => void
  onDelete?: (id: string) => void
  isSaving?: boolean
}

export function MealTypeEditor({
  open,
  onOpenChange,
  mealType,
  onSave,
  onDelete,
  isSaving,
}: MealTypeEditorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isEditing = !!mealType

  // Reset form state when the dialog opens or mealType changes
  useEffect(() => {
    if (open) {
      setName(mealType?.name ?? '')
      setDescription(mealType?.description ?? '')
      setTags(mealType?.tags ?? [])
      setTagInput('')
      setShowDeleteConfirm(false)
    }
  }, [open, mealType])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const data: MealTypeCreate = {
      name: trimmedName,
      description: description.trim() || null,
      tags,
    }

    onSave(data)
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleDelete = () => {
    if (mealType && onDelete) {
      onDelete(mealType.id)
    }
  }

  const canDelete = isEditing && onDelete && mealType.meal_count === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Meal Type' : 'Add Meal Type'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="meal-type-name">Name</Label>
            <Input
              id="meal-type-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Breakfast, Lunch, Snack"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="meal-type-description">Description</Label>
            <Textarea
              id="meal-type-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this meal type..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="meal-type-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="meal-type-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags (press Enter)"
              />
              <Button onClick={handleAddTag} variant="secondary" size="sm">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-foreground"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          {isEditing && onDelete && showDeleteConfirm && (
            <div className="flex w-full flex-col gap-2 sm:flex-1">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this meal type?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  size="sm"
                  className="flex-1"
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {(!isEditing || !onDelete || !showDeleteConfirm) && (
            <>
              {isEditing && onDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!canDelete}
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  title={
                    !canDelete
                      ? `Cannot delete: ${mealType.meal_count} meal${mealType.meal_count === 1 ? '' : 's'} assigned`
                      : 'Delete'
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="flex flex-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!name.trim() || isSaving}
                  size="sm"
                  className="flex-1"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
