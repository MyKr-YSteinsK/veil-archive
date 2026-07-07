import { registerSW } from 'virtual:pwa-register'

export type PwaUpdateState = 'idle' | 'ready' | 'updating'

let state: PwaUpdateState = 'idle'
let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined
const listeners = new Set<() => void>()

function setState(next: PwaUpdateState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function initPwaUpdate() {
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh: () => setState('ready'),
  })
}

export function subscribePwaUpdate(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPwaUpdateSnapshot() { return state }

export async function applyPwaUpdate() {
  if (!updateServiceWorker || state !== 'ready') return
  setState('updating')
  try {
    await updateServiceWorker(true)
  } catch {
    setState('ready')
  }
}
