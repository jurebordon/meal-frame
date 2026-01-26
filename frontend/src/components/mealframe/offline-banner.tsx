'use client'

import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'

/**
 * Banner displayed at the top of the app when offline.
 * Shows a subtle indicator so users know cached data is being used.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-warning/20 px-4 py-2 text-sm text-warning-foreground">
      <WifiOff className="h-4 w-4" />
      <span>You're offline — showing cached data</span>
    </div>
  )
}
