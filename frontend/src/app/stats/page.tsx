/**
 * Stats view - placeholder page.
 *
 * Will show adherence statistics, streaks, and meal type breakdown.
 */
export default function StatsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[480px] px-4 pb-24 pt-safe">
        <header className="mb-8 pt-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Your Progress
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coming soon - adherence statistics and insights
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            This page will show overall adherence rate, streak history,
            completion status breakdown, and per-meal-type statistics.
          </p>
        </section>
      </div>
    </main>
  )
}
