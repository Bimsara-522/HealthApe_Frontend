// Interactive monthly calendar; highlights days with appointments; navigates months
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Appointment } from 'app/(main)/appointments/types/appointment'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface Props { appointments: Appointment[] }
/**
 * Expect appointment.date to be an ISO date string like "2026-02-16" (date-only).
 * We use date keys like "YYYY-MM-DD" to avoid month bleed + timezone shifts.
 */
function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function ymd(year: number, monthIndex: number, day: number) {
  // monthIndex is 0-based
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`
}

/**
 * Optional: If your Appointment.time is always "HH:MM AM/PM", this helps pick earliest
 * among multiple appointments on the same day.
 */
function toMinutes12h(time: string): number {
  // "09:00 AM" -> 540
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return Number.MAX_SAFE_INTEGER
  let hh = Number(m[1])
  const mm = Number(m[2])
  const ap = m[3].toUpperCase()
  if (ap === 'AM') {
    if (hh === 12) hh = 0
  } else {
    if (hh !== 12) hh += 12
  }
  return hh * 60 + mm
}

export function AppointmentCalendar({ appointments }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(new Date())

  const year = current.getFullYear()
  const month = current.getMonth()

   // Build a map of dateKey -> appointments on that day (for fast lookup + click behavior)
  const apptsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of appointments) {
      const key = (a.date ?? '').slice(0, 10) // "YYYY-MM-DD"
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(a)
      map.set(key, list)
    }
    // Sort each day by time so clicking chooses the earliest
    for (const [key, list] of map.entries()) {
      list.sort((x, y) => toMinutes12h(x.time) - toMinutes12h(y.time))
      map.set(key, list)
    }
    return map
  }, [appointments])

  const today = new Date()
  const todayKey = ymd(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDay = new Date(year, month, 1).getDay()
  const daysCount = new Date(year, month + 1, 0).getDate()

  // Adjust so week starts Monday (0=Mon … 6=Sun)
  const startOffset = (firstDay + 6) % 7

  const navigate = (dir: 1 | -1) => {
    setCurrent(new Date(year, month + dir, 1))
  }

  const handleDayClick = (day: number) => {
    const key = ymd(year, month, day)
    const appts = apptsByDate.get(key)
    if (!appts || appts.length === 0) return

    // Navigate to the first appointment on that day (earliest time)
    router.push(`/appointments/${appts[0].id}`)
  }

  const monthLabel = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-gray-900 text-lg">{monthLabel}</h2>
        <div className="flex gap-1">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded" aria-label="Previous month"> ‹ </button>
          <button onClick={() => navigate(1)}  className="p-1 hover:bg-gray-100 rounded" aria-label="Next month"> › </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}

        {Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
          const key = ymd(year, month, day)
          const isToday = key === todayKey
          const hasAppt = apptsByDate.has(key)
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!hasAppt}
              className={[
                'relative mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors',
                isToday  ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100',
                hasAppt && !isToday ? 'font-semibold text-blue-600' : '',
              ].join(' ')} aria-label={`Day ${day}${hasAppt ? ' (has appointment)' : ''}`}>
              {day}
              {hasAppt && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}