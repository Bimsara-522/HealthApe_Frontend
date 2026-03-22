'use client'

import { useMemo, useState } from 'react'
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge'
import { useAppointments } from 'app/(main)/appointments/hooks/useAppointments'
import Link from 'next/link'

export default function AppointmentsAllClient() {
  const { data: appointments, isLoading, error } = useAppointments()
  // UI state for showing/hiding the filter panel
  const [showFilter, setShowFilter] = useState(false)

  // Month format from <input type="month" /> is "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  const upcoming = useMemo(() => {
    if (!appointments) return []

    return appointments
      .filter((a) => {
        const d = new Date(a.date)
        d.setHours(0, 0, 0, 0)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return d >= today
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [appointments])

  // Filtered list (computed)
  const filteredAppointments = useMemo(() => {
    if (!selectedMonth) return upcoming
    return upcoming.filter((a) => a.date.slice(0, 7) === selectedMonth)
  }, [upcoming, selectedMonth])

  if (isLoading) {
    return <div className="p-6">Loading appointments...</div>
  }
  if (error) {
    return <div className="p-6 text-red-600">Failed to load appointments</div>
  }

  return (
    <div className="p-6">
        <Link className="text-blue-600 hover:underline text-sm" href="/appointments">
            ← Back to appointments
          </Link>
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">All Upcoming Appointments</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and filter your upcoming bookings.
            </p>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilter((v) => !v)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Filter by Month
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Select month:</label>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={() => setSelectedMonth('')}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {filteredAppointments.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              {selectedMonth
                ? 'No appointments in that month'
                : 'No upcoming appointments found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4">Reason</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredAppointments.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {a.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {a.doctor?.name ?? a.doctorNameSnapshot}
                        </div>
                        <div className="text-xs text-gray-500">
                          {a.doctor?.specialty ?? '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {a.date.slice(0, 10)}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {a.time}
                      </td>

                      <td className="px-6 py-4">
                        <AppointmentStatusBadge status={a.status} />
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {a.hospital}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {a.reason ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}