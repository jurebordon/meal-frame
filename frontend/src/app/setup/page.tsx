/**
 * Setup screens - placeholder page.
 *
 * Will show configuration for Meal Types, Day Templates, and Week Plans.
 */
export default function SetupPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-safe">
        <header className="mb-8 pt-6">
          <h1 className="text-2xl font-semibold text-foreground">Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coming soon - configure meal types, templates, and week plans
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            This page will have tabs for managing Meal Types, Day Templates,
            and Week Plans. These are the building blocks for meal planning.
          </p>
        </section>
      </div>
    </main>
  )
}
