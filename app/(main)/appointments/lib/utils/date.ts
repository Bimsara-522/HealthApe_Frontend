// Date helpers (format, compare)
export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

export function formatTime(timeString: string): string {
  return timeString
}

export function isFutureDate(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

export function isPastDate(dateString: string): boolean {
  return new Date(dateString) <= new Date()
}

// Convert a date string to local midnight for date-only comparison
export function toLocalDateOnly(dateString: string): Date {
  const d = new Date(dateString)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Today's date at local midnight
export function todayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// True only if appointment date is before today
export function isBeforeToday(dateString: string): boolean {
  return toLocalDateOnly(dateString) < todayLocal()
}

// True if appointment date is today or after today
export function isTodayOrFuture(dateString: string): boolean {
  return toLocalDateOnly(dateString) >= todayLocal()
}