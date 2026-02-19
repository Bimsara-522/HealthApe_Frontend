// Single appointment row — doctor name, specialty, clinic, date, status badge
import Link from 'next/link'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import type { Appointment } from '@/types/appointment'
import { formatAppointmentDate } from '@/lib/utils/date'

interface Props { appointment: Appointment }

export function AppointmentCard({ appointment }: Props) {
  
  return (
    <Link
      href={`/dashboard/appointments/${appointment.id}`}
      className="w-full flex items-center justify-between gap-4 p-4 bg-white rounded-xl
                 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {appointment.doctor.avatarUrl ? (
            <img src={appointment.doctor.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xl">👤</span>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{appointment.doctor.name}</p>
          <p className="text-sm text-gray-500 truncate">
            {appointment.doctor.specialty} · {appointment.clinic}
          </p>
          <p className="text-sm text-gray-400 mt-1 truncate">
            📅 {formatAppointmentDate(appointment.date)} · 🕐 {appointment.time}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-shrink-0 px-3 py-1 border rounded-full">
        <AppointmentStatusBadge status={appointment.status} />
      </div>
    </Link>
  )
}
