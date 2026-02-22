// Prominent card showing the immediate upcoming appointment
import type { Appointment } from 'app/(main)/appointments/types/appointment'
import { AppointmentStatusBadge } from './AppointmentStatusBadge'
import Link from 'next/link'
import { AppointmentCard } from './AppointmentCard'

interface Props { appointment: Appointment }

export function NextVisitCard({ appointment }: Props) {
  return (
    <AppointmentCard
      appointment={appointment}
      accentLeft
      href={`/appointments/${appointment.id}/edit`} // click opens AppointmentEditClient
    />
  )
}