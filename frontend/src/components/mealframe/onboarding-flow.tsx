'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Check, Upload, FileText, Settings, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to MealFrame',
      description: 'Structured meal planning that removes daily decisions',
      content: (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <p className="max-w-md text-center text-base leading-relaxed text-muted-foreground">
            Take control of your nutrition with pre-planned meal templates. No more decision fatigue.
          </p>
        </div>
      ),
    },
    {
      id: 'quick-start',
      title: 'Quick Start Options',
      description: 'How would you like to begin?',
      content: (
        <div className="flex flex-col gap-3 py-4">
          <button
            onClick={() => setSelectedOption('import')}
            className={`flex items-start gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 ${
              selectedOption === 'import'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
            type="button"
          >
            <Upload className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h4 className="mb-1 font-semibold text-foreground">Import existing meals</h4>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with your meal data
              </p>
            </div>
          </button>

          <button
            onClick={() => setSelectedOption('sample')}
            className={`flex items-start gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 ${
              selectedOption === 'sample'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
            type="button"
          >
            <FileText className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h4 className="mb-1 font-semibold text-foreground">Start with sample meals</h4>
              <p className="text-sm text-muted-foreground">
                Pre-populated examples to get you started quickly
              </p>
            </div>
          </button>

          <button
            onClick={() => setSelectedOption('manual')}
            className={`flex items-start gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 ${
              selectedOption === 'manual'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
            type="button"
          >
            <Settings className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h4 className="mb-1 font-semibold text-foreground">Add meals manually</h4>
              <p className="text-sm text-muted-foreground">Build your meal library from scratch</p>
            </div>
          </button>
        </div>
      ),
    },
    {
      id: 'templates',
      title: 'Review Your Day Templates',
      description: 'Default templates are ready to use',
      content: (
        <div className="space-y-4 py-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Standard Day</h4>
              <span className="text-sm text-muted-foreground">5 meals</span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Breakfast</span>
              <span>•</span>
              <span>Snack</span>
              <span>•</span>
              <span>Lunch</span>
              <span>•</span>
              <span>Snack</span>
              <span>•</span>
              <span>Dinner</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Rest Day</h4>
              <span className="text-sm text-muted-foreground">4 meals</span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>Breakfast</span>
              <span>•</span>
              <span>Lunch</span>
              <span>•</span>
              <span>Snack</span>
              <span>•</span>
              <span>Dinner</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            You can customize these anytime in Settings
          </p>
        </div>
      ),
    },
    {
      id: 'generate',
      title: 'Ready to Generate Your First Week?',
      description: 'We will create a personalized meal plan for you',
      content: (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-2 text-sm text-muted-foreground">Week starting</p>
            <p className="text-2xl font-semibold text-foreground">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">
            Your week will be filled with meals from your library, assigned to the appropriate day
            templates.
          </p>
        </div>
      ),
    },
    {
      id: 'done',
      title: "You're All Set!",
      description: 'Your first meal plan is ready',
      content: (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
            <Check className="h-12 w-12 text-success" />
          </div>
          <p className="max-w-md text-center text-base leading-relaxed text-muted-foreground">
            Time to see what's on the menu. Your Today view is loaded and ready.
          </p>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
      setSelectedOption(null)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setSelectedOption(null)
    }
  }

  const canProceed =
    currentStep !== 1 || (currentStep === 1 && selectedOption !== null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-1.5 w-12 rounded-full transition-all ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-xl"
          >
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                {currentStepData.title}
              </h2>
              <p className="text-base text-muted-foreground">{currentStepData.description}</p>
            </div>

            {currentStepData.content}

            <div className="mt-8 flex items-center justify-between">
              <div>
                {currentStep > 0 && !isLastStep && (
                  <Button onClick={handleBack} variant="outline">
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {onSkip && currentStep === 0 && (
                  <Button onClick={onSkip} variant="outline">
                    Skip Setup
                  </Button>
                )}
                <Button onClick={handleNext} disabled={!canProceed} size="lg">
                  {isLastStep ? 'Go to Today View' : 'Continue'}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
