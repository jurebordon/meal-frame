'use client'

import React from "react"
import { Trash2 } from 'lucide-react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { X } from 'lucide-react'

export interface MealType {
  id: string
  name: string
  description: string
  tags: string[]
  assignedMealCount: number
}

interface MealTypeEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealType?: MealType
  onSave: (mealType: Omit<MealType, 'id' | 'assignedMealCount'>) => void
  onDelete?: (id: string) => void
}

export function MealTypeEditor({ open, onOpenChange, mealType, onSave, onDelete }: MealTypeEditorProps) {
  const [name, setName] = useState(mealType?.name || '')
  const [description, setDescription] = useState(mealType?.description || '')
  const [tags, setTags] = useState<string[]>(mealType?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name, description, tags })
    onOpenChange(false)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleDelete = () => {
    if (mealType && onDelete) {
      onDelete(mealType.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mealType ? 'Edit Meal Type' : 'Add Meal Type'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Breakfast, Lunch, Snack"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this meal type..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyPress}
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
          {mealType && onDelete && showDeleteConfirm && (
            <div className="flex w-full flex-col gap-2 sm:flex-1">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this meal type?
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete} size="sm" className="flex-1">
                  Confirm Delete
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} size="sm" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {(!mealType || !onDelete || !showDeleteConfirm) && (
            <>
              {mealType && onDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={mealType.assignedMealCount > 0}
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  title={mealType.assignedMealCount > 0 ? `Cannot delete: ${mealType.assignedMealCount} meals assigned` : 'Delete'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="flex flex-1 gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} size="sm" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!name.trim()} size="sm" className="flex-1">
                  Save
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
