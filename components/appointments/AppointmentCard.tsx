// Single appointment row — doctor name, specialty, clinic, date, status badge
import Link from 'next/link'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import type { Appointment } from 'app/(main)/appointments/types/appointment'
import { formatAppointmentDate } from 'app/(main)/appointments/lib/utils/date'

interface Props {
  appointment: Appointment
  // href prop override destination if needed (e.g., Next Visit -> edit page) 
  href?: string
  //  Adds the blue accent strip on the left (used in Next Visit design) 
  accentLeft?: boolean
}

// export function AppointmentCard({ appointment }: Props) {
export function AppointmentCard({ appointment, href, accentLeft }: Props) {
  // ?? checks if href is provided (not null and not undefined) → use it, Otherwise → use the default details route
  const targetHref = href ?? `/appointments/${appointment.id}`
  return (
    <Link
      href={targetHref}
      className={[
        'w-full flex items-center justify-between gap-4 p-8 bg-white rounded-xl',
        'border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
        'relative overflow-hidden',
        // Blue accent strip (matches design)
        accentLeft ? 'pl-10' : '',
        accentLeft ? 'before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:bg-blue-600' : '',
      ].join(' ')}>

      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {/* appointment.doctor?.avatarUrl - Uses optional chaining to safely access properties if missing */}
          {appointment.doctor?.avatarUrl ? (
            <img src={appointment.doctor.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xl">👤</span>
          )}
        </div>
        {/* Info */}
        <div className="min-w-0">
        {/* appointment.doctor?.name || 'Doctor' - Falls back to "Doctor" if name is missing */}
          <p className="font-semibold text-gray-900 truncate">{appointment.doctor?.name || 'Doctor'}</p>
          <p className="text-sm text-gray-500 truncate">
          {/* appointment.doctor?.specialty || 'Specialist' - Falls back to "Specialist" if specialty is missing */}
            {appointment.doctor?.specialty || 'Specialist'} · {appointment.hospital}
          </p>
          <p className="text-sm text-gray-400 mt-1 truncate">
            📅 {formatAppointmentDate(appointment.date)} · 🕐 {appointment.time}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex-shrink-0 px-3 rounded-full">
        <AppointmentStatusBadge status={appointment.status} />
      </div>
    </Link>
  )
}
