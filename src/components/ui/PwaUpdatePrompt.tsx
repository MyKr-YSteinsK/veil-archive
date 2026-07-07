import { RefreshCw } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSyncExternalStore } from 'react'
import { applyPwaUpdate, getPwaUpdateSnapshot, subscribePwaUpdate } from '../../pwaUpdate'

export default function PwaUpdatePrompt() {
  const state = useSyncExternalStore(subscribePwaUpdate, getPwaUpdateSnapshot, getPwaUpdateSnapshot)
  const reduceMotion = useReducedMotion()
  if (state === 'idle') return null

  return <motion.aside
    className="pwa-update-prompt"
    role="status"
    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <span className="update-sigil"><RefreshCw size={17} /></span>
    <span><strong>密典已有新刻本</strong><small>重启后生效</small></span>
    <button type="button" disabled={state === 'updating'} onClick={applyPwaUpdate}>{state === 'updating' ? '重启中…' : '立即重启'}</button>
  </motion.aside>
}
