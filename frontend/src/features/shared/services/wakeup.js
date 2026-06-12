/**
 * wakeup.js — Pre-warms the Render backend on app load.
 *
 * Render free-tier services sleep after 15 min of inactivity.
 * Cold starts take 30-60 seconds. This module fires a /health ping
 * as early as possible so the backend is awake by the time the user
 * hits "Sign In" or "Create Account".
 */

let wakeupPromise = null

export function wakeupBackend() {
  if (wakeupPromise) return wakeupPromise // singleton — only ping once

  wakeupPromise = fetch('/api/health', {
    method: 'GET',
    signal: AbortSignal.timeout(65_000), // 65s — longer than Render cold start
  })
    .then(r => r.ok)
    .catch(() => false) // ignore errors — this is best-effort

  return wakeupPromise
}

export function isBackendWarm() {
  return wakeupPromise
}
