'use client'

import { useState, useEffect } from 'react'
import { formatCountdown, getMidnightCountdown, getTimeTheme } from '@/lib/utils'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'

export function useTimer() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [countdown, setCountdown] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(now.toLocaleTimeString('uz', { hour12: false }))
      setDate(format(now, 'dd MMM, EEEE', { locale: uz }))
      setCountdown(formatCountdown(getMidnightCountdown()))
      setTheme(getTimeTheme())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return { time, date, countdown, theme }
}
