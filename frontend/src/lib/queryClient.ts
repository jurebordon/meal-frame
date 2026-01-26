/**
 * TanStack Query client configuration.
 *
 * Provides the QueryClient instance and QueryClientProvider setup
 * for managing server state across the application.
 */

import { QueryClient, onlineManager } from '@tanstack/react-query'

/**
 * Initialize TanStack Query's online manager.
 * By default it listens to navigator.onLine + online/offline events
 * and pauses queries/mutations when offline.
 */
export function initOnlineManager() {
  // onlineManager is initialized automatically by TanStack Query,
  // but we call this to ensure it's set up early in the app lifecycle.
  // It will pause refetches when offline and resume when back online.
  onlineManager.setEventListener((setOnline) => {
    const onlineHandler = () => setOnline(true)
    const offlineHandler = () => setOnline(false)
    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)
    return () => {
      window.removeEventListener('online', onlineHandler)
      window.removeEventListener('offline', offlineHandler)
    }
  })
}

/**
 * Create a new QueryClient with default options.
 *
 * These defaults are optimized for a meal planning app where:
 * - Data doesn't change frequently (5 minute stale time)
 * - We want to show cached data immediately, then revalidate
 * - Failed requests should retry a few times
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Consider data fresh for 5 minutes
        staleTime: 1000 * 60 * 5,

        // Keep unused data in cache for 30 minutes
        gcTime: 1000 * 60 * 30,

        // Retry failed requests up to 3 times
        retry: 3,

        // Don't refetch on window focus by default
        // (meal data doesn't change that often)
        refetchOnWindowFocus: false,

        // Refetch on mount if data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Don't retry mutations by default
        retry: false,
      },
    },
  })
}

// Singleton instance for client-side
let browserQueryClient: QueryClient | undefined = undefined

/**
 * Get the QueryClient instance.
 *
 * On the server, always create a new client to avoid sharing state.
 * On the client, reuse the same client instance.
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  }

  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}
