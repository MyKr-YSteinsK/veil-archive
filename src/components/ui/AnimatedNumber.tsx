import { animate, useMotionValue, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedNumber({ value, prefix = '', className }: { value: number; prefix?: string; className?: string }) {
  const motionValue = useMotionValue(value)
  const [display, setDisplay] = useState(value)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value)
      setDisplay(value)
      return
    }
    const unsubscribe = motionValue.on('change', (latest) => setDisplay(Math.round(latest)))
    const controls = animate(motionValue, value, { duration: 0.38, ease: 'easeOut' })
    return () => { unsubscribe(); controls.stop() }
  }, [motionValue, reduceMotion, value])

  return <strong className={className} aria-label={`${prefix}${value}`}>{prefix}{display}</strong>
}
