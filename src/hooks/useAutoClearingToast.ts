import { useCallback, useEffect, useRef, useState } from 'react'

export default function useAutoClearingToast(timeout = 2400) {
  const [toast, setToast] = useState('')
  const timer = useRef<number | undefined>(undefined)

  const clearToast = useCallback(() => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    timer.current = undefined
    setToast('')
  }, [])

  const showToast = useCallback((message: string) => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    setToast(message)
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      setToast('')
    }, timeout)
  }, [timeout])

  useEffect(() => () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
  }, [])

  return { toast, showToast, clearToast }
}
