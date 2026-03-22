// Past visits sidebar — shows last 5 appointments
import type { Appointment } from 'app/(main)/appointments/types/appointment'
import { formatAppointmentDate } from 'app/(main)/appointments/lib/utils/date'

interface Props {
  visits: Appointment[]
}

export function PastVisitsSidebar({ visits }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold tracking-wide text-gray-500 mb-4 uppercase">
        Past Visits
      </h3>

      {visits.length === 0 ? (
        <p className="text-sm text-gray-500">No past visits yet</p>
      ) : (
        // Timeline wrapper
        <div className="relative">
          {/* Vertical line (stable x-position) */}
          <div className="absolute left-3 top-1 bottom-1 w-px bg-gray-200" />

          <ul className="space-y-6">
            {visits.map((visit) => (
              <li key={visit.id} className="relative pl-8">
                {/* Node (aligned exactly on the line) */}
                <span
                  className={[
                    'absolute left-3 top-2 -translate-x-1/2',
                    'h-1.5 w-1.5 rounded-full',   // Smaller size
                    'bg-gray-500',                // Inner fill color
                    'z-10', // Ensure it sits above the line
                  ].join(' ')}/>

                      {/* Content (pushed right so it never overlaps the node) */}
                      <p className="font-semibold text-gray-900 leading-tight">
                        {visit.doctor?.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {formatAppointmentDate(visit.date)}
                        {visit.reason ? ` – ${visit.reason}` : ''}
                      </p>
                   </li>
                  ))}
              </ul>
         </div>
      )}
    </div>
  )
}