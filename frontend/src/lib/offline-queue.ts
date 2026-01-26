/**
 * Offline queue for completion actions.
 *
 * Persists pending completion mutations to localStorage so they survive
 * app restarts. When the app comes back online, pending actions are
 * replayed against the API.
 */

import { completeSlot, uncompleteSlot } from './api'
import type { CompletionStatus } from './types'

const QUEUE_KEY = 'mealframe:offline-queue'

interface QueuedComplete {
  type: 'complete'
  slotId: string
  status: CompletionStatus
  timestamp: number
}

interface QueuedUncomplete {
  type: 'uncomplete'
  slotId: string
  timestamp: number
}

type QueuedAction = QueuedComplete | QueuedUncomplete

function getQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveQueue(queue: QueuedAction[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch {
    // Storage full or unavailable — drop silently
  }
}

/**
 * Enqueue a completion action for later sync.
 */
export function enqueueComplete(slotId: string, status: CompletionStatus) {
  const queue = getQueue()
  // Remove any existing action for the same slot (last action wins)
  const filtered = queue.filter((a) => a.slotId !== slotId)
  filtered.push({ type: 'complete', slotId, status, timestamp: Date.now() })
  saveQueue(filtered)
}

/**
 * Enqueue an uncomplete action for later sync.
 */
export function enqueueUncomplete(slotId: string) {
  const queue = getQueue()
  const filtered = queue.filter((a) => a.slotId !== slotId)
  filtered.push({ type: 'uncomplete', slotId, timestamp: Date.now() })
  saveQueue(filtered)
}

/**
 * Replay all pending actions in order.
 * Returns the number of successfully synced actions.
 */
export async function flushQueue(): Promise<number> {
  const queue = getQueue()
  if (queue.length === 0) return 0

  // Sort by timestamp to replay in order
  queue.sort((a, b) => a.timestamp - b.timestamp)

  let synced = 0
  const failed: QueuedAction[] = []

  for (const action of queue) {
    try {
      if (action.type === 'complete') {
        await completeSlot(action.slotId, { status: action.status })
      } else {
        await uncompleteSlot(action.slotId)
      }
      synced++
    } catch {
      // Keep failed actions for next attempt
      failed.push(action)
    }
  }

  saveQueue(failed)
  return synced
}

/**
 * Get the number of pending actions in the queue.
 */
export function getPendingCount(): number {
  return getQueue().length
}
