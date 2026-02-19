// /appointments/[id] (detail view)
// Appointment details (doctor, time, notes)
// import AppointmentDetailClient from '@/app/dashboard/appointments/id/ui/AppointmentDetailClient'
import AppointmentDetailClient from './ui/AppointmentDetailClient'

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <AppointmentDetailClient id={id} />
}
