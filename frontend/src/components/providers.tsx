'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { getQueryClient } from '@/lib/queryClient'

interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Global providers wrapper for the application.
 *
 * Includes:
 * - TanStack Query for server state management
 * - Theme provider for dark/light mode
 */
export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
