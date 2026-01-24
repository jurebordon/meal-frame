/**
 * Meals Library - placeholder page.
 *
 * Will show the meal library with CRUD operations and CSV import.
 */
export default function MealsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-safe">
        <header className="mb-8 pt-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Meals Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coming soon - browse, add, edit, and import meals
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            This page will display all meals with search/filter, allow
            creating/editing meals, and support CSV import.
          </p>
        </section>
      </div>
    </main>
  )
}
