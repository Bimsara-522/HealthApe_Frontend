// Renders a list of AppointmentCard items; handles empty state
'use client'
import type { Appointment } from 'app/(main)/appointments/types/appointment'
import { AppointmentCard } from './AppointmentCard'

interface Props {
  title?: string
  appointments: Appointment[]
  emptyText?: string
}

export function AppointmentList({
  title = 'Upcoming Appointments',
  appointments,
  emptyText = 'No appointments found',
}: Props) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </section>
  )
}
