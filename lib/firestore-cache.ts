import { getDocs, Query } from "firebase/firestore"

// Simple in-memory cache for Firestore query results (per browser tab / process)
// NOTE: This is best-effort and resets on reload; it's only to avoid repeated calls
// while navigating around the app.

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache: Record<string, CacheEntry<unknown>> = {}

// Default time-to-live for cached entries (in ms)
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedQuery<T>(key: string, query: Query, ttl: number = DEFAULT_TTL): Promise<T> {
  const now = Date.now()
  const existing = cache[key] as CacheEntry<T> | undefined

  if (existing && now - existing.timestamp < ttl) {
    return existing.data
  }

  const snap = await getDocs(query)
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as T

  cache[key] = { data: items, timestamp: now }
  return items
}

export function invalidateCacheKey(key: string) {
  delete cache[key]
}
