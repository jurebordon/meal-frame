'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronUp, ChevronDown, X, Plus, Trash2 } from 'lucide-react'

export interface TemplateSlot {
  id: string
  position: number
  mealTypeId: string
  mealTypeName: string
}

export interface DayTemplate {
  id: string
  name: string
  notes: string
  slots: TemplateSlot[]
}

interface DayTemplateEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: DayTemplate
  mealTypes: Array<{ id: string; name: string }>
  onSave: (template: Omit<DayTemplate, 'id'>) => void
  onDelete?: (id: string) => void
}

export function DayTemplateEditor({ 
  open, 
  onOpenChange, 
  template, 
  mealTypes,
  onSave,
  onDelete 
}: DayTemplateEditorProps) {
  const [name, setName] = useState(template?.name || '')
  const [notes, setNotes] = useState(template?.notes || '')
  const [slots, setSlots] = useState<TemplateSlot[]>(
    template?.slots || []
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleAddSlot = () => {
    if (mealTypes.length === 0) return
    const newSlot: TemplateSlot = {
      id: `slot-${Date.now()}`,
      position: slots.length,
      mealTypeId: mealTypes[0].id,
      mealTypeName: mealTypes[0].name,
    }
    setSlots([...slots, newSlot])
  }

  const handleRemoveSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId).map((s, idx) => ({ ...s, position: idx })))
  }

  const handleMoveSlot = (slotId: string, direction: 'up' | 'down') => {
    const index = slots.findIndex(s => s.id === slotId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slots.length - 1)
    ) {
      return
    }

    const newSlots = [...slots]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSlots[index], newSlots[swapIndex]] = [newSlots[swapIndex], newSlots[index]]
    
    // Update positions
    setSlots(newSlots.map((s, idx) => ({ ...s, position: idx })))
  }

  const handleUpdateSlotMealType = (slotId: string, mealTypeId: string) => {
    const mealType = mealTypes.find(mt => mt.id === mealTypeId)
    if (!mealType) return

    setSlots(slots.map(s => 
      s.id === slotId 
        ? { ...s, mealTypeId, mealTypeName: mealType.name }
        : s
    ))
  }

  const handleSave = () => {
    if (!name.trim() || slots.length === 0) return
    onSave({ name, notes, slots })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (template && onDelete) {
      onDelete(template.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Day Template' : 'Add Day Template'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Normal Workday, Morning Workout Day"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="template-notes">Notes</Label>
            <Textarea
              id="template-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this template..."
              rows={2}
            />
          </div>

          {/* Slots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Meal Slots ({slots.length})</Label>
              <Button onClick={handleAddSlot} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            </div>

            {slots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No slots yet. Add a slot to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    {/* Position */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveSlot(slot.id, 'up')}
                        disabled={index === 0}
                        className="rounded p-1 hover:bg-secondary disabled:opacity-30"
                        type="button"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSlot(slot.id, 'down')}
                        disabled={index === slots.length - 1}
                        className="rounded p-1 hover:bg-secondary disabled:opacity-30"
                        type="button"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Position Number */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>

                    {/* Meal Type Selector */}
                    <div className="flex-1">
                      <Select
                        value={slot.mealTypeId}
                        onValueChange={(value) => handleUpdateSlotMealType(slot.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((mealType) => (
                            <SelectItem key={mealType.id} value={mealType.id}>
                              {mealType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Remove Button */}
                    <Button
                      onClick={() => handleRemoveSlot(slot.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {slots.length > 0 && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">
                  {slots.map((s, i) => s.mealTypeName).join(' → ')}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          {template && onDelete && showDeleteConfirm && (
            <div className="flex w-full flex-col gap-2 sm:flex-1">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this template?
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
          {(!template || !onDelete || !showDeleteConfirm) && (
            <>
              {template && onDelete && (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="flex flex-1 gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} size="sm" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!name.trim() || slots.length === 0} size="sm" className="flex-1">
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
