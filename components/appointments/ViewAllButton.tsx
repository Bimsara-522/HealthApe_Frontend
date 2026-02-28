// View All button — router.push('/appointments/all') on click
'use client'

import { useRouter } from 'next/navigation'

export function ViewAllButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/appointments/all')}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"> + New Booking
    </button>
  )
}