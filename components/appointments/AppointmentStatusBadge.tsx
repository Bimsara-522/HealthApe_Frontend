// Pill badge: Confirmed / Pending / Cancelled with color-coding
import type { AppointmentStatus } from 'app/(main)/appointments/types/appointment'

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
  confirmed:  { label: 'Confirmed',  className: 'bg-blue-50 text-blue-600 border-blue-100'  },
  pending:    { label: 'Pending',    className: 'bg-amber-50 text-amber-600 border-amber-100'  },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-50 text-red-500 border-red-100'     },
  completed:  { label: 'Completed',  className: 'bg-green-50 text-green-600 border-green-100' },
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  )
}