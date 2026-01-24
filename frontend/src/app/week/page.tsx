/**
 * Week View - placeholder page.
 *
 * Will show the 7-day week overview with template switching.
 */
export default function WeekPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[480px] px-4 pb-24 pt-safe">
        <header className="mb-8 pt-6">
          <h1 className="text-2xl font-semibold text-foreground">Week View</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coming soon - 7-day overview with template switching
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            This page will display the weekly meal plan, allow template
            switching for each day, and support &quot;no plan&quot; overrides.
          </p>
        </section>
      </div>
    </main>
  )
}
