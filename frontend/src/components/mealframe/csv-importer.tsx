'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MealFormData } from './meal-editor'

interface CSVImporterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (meals: MealFormData[]) => void
}

interface ParsedRow {
  row: number
  data: MealFormData | null
  error?: string
}

export function CSVImporter({ open, onOpenChange, onImport }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = async (file: File) => {
    setIsProcessing(true)
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())
    const parsed: ParsedRow[] = []

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(',').map((v) => v.trim())

      // Expected format: name,portion,calories,protein,carbs,fat,types,notes
      if (values.length < 7) {
        parsed.push({
          row: i + 1,
          data: null,
          error: 'Missing required columns',
        })
        continue
      }

      const [name, portion, calories, protein, carbs, fat, types, notes] = values

      // Validate
      if (!name || !portion) {
        parsed.push({
          row: i + 1,
          data: null,
          error: 'Name and portion are required',
        })
        continue
      }

      const parsedTypes = types
        .split('|')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => ['breakfast', 'lunch', 'dinner', 'snack'].includes(t)) as Array<
        'breakfast' | 'lunch' | 'dinner' | 'snack'
      >

      if (parsedTypes.length === 0) {
        parsed.push({
          row: i + 1,
          data: null,
          error: 'At least one valid meal type required',
        })
        continue
      }

      parsed.push({
        row: i + 1,
        data: {
          name,
          portion,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: Number(carbs) || 0,
          fat: Number(fat) || 0,
          types: parsedTypes,
          notes: notes || '',
        },
      })
    }

    setParsedData(parsed)
    setStep('preview')
    setIsProcessing(false)
  }

  const handleImport = () => {
    const validMeals = parsedData.filter((p) => p.data !== null).map((p) => p.data!)
    onImport(validMeals)
    setStep('complete')
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setStep('upload')
    onOpenChange(false)
  }

  const validCount = parsedData.filter((p) => p.data !== null).length
  const errorCount = parsedData.filter((p) => p.error).length

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
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Import CSV</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a CSV file to bulk import meals
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload Step */}
            {step === 'upload' && (
              <div className="space-y-6">
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-sm font-semibold text-foreground">
                    Choose a CSV file
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Expected format: name, portion, calories, protein, carbs, fat, types (pipe-separated), notes
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button asChild>
                      <span>Select File</span>
                    </Button>
                  </label>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="mb-2 text-xs font-semibold text-foreground">CSV Format Example:</p>
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
                    {`name,portion,calories,protein,carbs,fat,types,notes
Greek Yogurt Bowl,200g yogurt + 30g granola,320,18,42,8,breakfast|snack,High protein
Chicken & Rice,150g chicken + 200g rice,520,45,65,8,lunch|dinner,Post-workout`}
                  </pre>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {step === 'preview' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {validCount} valid meals, {errorCount} errors
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Review the parsed data below before importing
                    </p>
                  </div>
                  {isProcessing && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </div>

                {/* Preview List */}
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {parsedData.map((row) => (
                    <div
                      key={row.row}
                      className={`rounded-lg border p-3 ${
                        row.error
                          ? 'border-destructive/50 bg-destructive/5'
                          : 'border-border bg-card'
                      }`}
                    >
                      {row.error ? (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Row {row.row}</p>
                            <p className="text-xs text-destructive">{row.error}</p>
                          </div>
                        </div>
                      ) : row.data ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{row.data.name}</p>
                            <p className="text-xs text-muted-foreground">{row.data.portion}</p>
                            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                              <span>{row.data.calories} cal</span>
                              <span>•</span>
                              <span>{row.data.protein}g P</span>
                              <span>•</span>
                              <span>{row.data.types.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t border-border pt-6">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={validCount === 0}>
                    Import {validCount} Meals
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {step === 'complete' && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">Import Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    Successfully imported {validCount} meals
                    {errorCount > 0 && ` with ${errorCount} skipped rows`}
                  </p>
                </div>
                <Button onClick={handleClose} className="w-full">
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
