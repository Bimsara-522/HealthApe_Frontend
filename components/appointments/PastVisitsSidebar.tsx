// Past visits sidebar — shows last 5 appointments
import { AppointmentCard } from './AppointmentCard'
import type { Appointment } from '@/types/appointment'

interface Props {
  visits: Appointment[]
}

export function PastVisitsSidebar({ visits }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Past Visits</h3>
      
      {visits.length === 0 ? (
        <p className="text-sm text-gray-500">No past visits yet</p>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <AppointmentCard key={visit.id} appointment={visit} />
          ))}
        </div>
      )}
    </div>
  )
}