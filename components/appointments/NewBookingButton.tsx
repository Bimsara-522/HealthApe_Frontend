// New booking button — router.push('/appointments/new') on click
'use client'

import { useRouter } from 'next/navigation'

export function NewBookingButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/dashboard/appointments/new')}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"> + New Booking
    </button>
  )
}