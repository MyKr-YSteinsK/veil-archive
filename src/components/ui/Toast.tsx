import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export default function Toast({ message }: { message: string }) {
  const reduceMotion = useReducedMotion()
  return <AnimatePresence>{message && <motion.div
    className="toast"
    role="status"
    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
    transition={{ duration: reduceMotion ? 0.01 : 0.18 }}
  >{message}</motion.div>}</AnimatePresence>
}
