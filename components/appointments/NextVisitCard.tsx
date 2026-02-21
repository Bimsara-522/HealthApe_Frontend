// Prominent card showing the immediate upcoming appointment
import type { Appointment } from 'app/(main)/appointments/types/appointment'

interface Props { appointment: Appointment }

export function NextVisitCard({ appointment }: Props) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {appointment.doctor.avatarUrl
            ? <img src={appointment.doctor.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <span className="text-2xl">👤</span>}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate">{appointment.doctor.name}</p>
          <p className="text-sm text-gray-500 truncate">{appointment.doctor.specialty} · {appointment.clinic}</p>
          <p className="mt-2 text-sm text-gray-600">📅 {new Date(appointment.date).toLocaleDateString()} · 🕐 {appointment.time}</p>
          {appointment.reason && <p className="mt-2 text-sm text-gray-700 truncate">Reason: {appointment.reason}</p>}
        </div>
      </div>
    </div>
  )
}