import { ProgressRing } from '@/components/mealframe/progress-ring'
import { StreakBadge } from '@/components/mealframe/streak-badge'
import { Button } from '@/components/ui/button'

/**
 * Home page (Today View) - placeholder until connected to API.
 *
 * This is the primary screen users will see 5+ times daily.
 * Currently shows a styled placeholder demonstrating v0 components work.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[480px] px-4 pb-24 pt-safe">
        {/* Header */}
        <header className="mb-8 pt-6">
          <h1 className="text-2xl font-semibold text-foreground">
            MealFrame
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Structured meal planning that eliminates decision fatigue
          </p>
        </header>

        {/* Demo: v0 Components Working */}
        <section className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-medium text-card-foreground">
            Frontend Foundation Ready
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <ProgressRing value={3} max={5} size={80} />
            <StreakBadge days={4} />
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            The v0 design system has been integrated. Components, styles, and
            infrastructure are ready for building the Today View.
          </p>

          <div className="flex gap-2">
            <Button variant="default">Primary Action</Button>
            <Button variant="outline">Secondary</Button>
          </div>
        </section>

        {/* Status */}
        <section className="rounded-xl border border-success/20 bg-success/10 p-4">
          <h3 className="font-medium text-foreground mb-2">Setup Complete</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Next.js 14 with App Router</li>
            <li>✓ Tailwind CSS with custom design tokens</li>
            <li>✓ TanStack Query for server state</li>
            <li>✓ Zustand for client state (available)</li>
            <li>✓ PWA configuration (disabled in dev)</li>
            <li>✓ 79 v0 components ready</li>
            <li>✓ API client with typed endpoints</li>
          </ul>
        </section>

        {/* Next Steps */}
        <section className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Next: Build the Today View with real API data
          </p>
        </section>
      </div>
    </main>
  )
}
