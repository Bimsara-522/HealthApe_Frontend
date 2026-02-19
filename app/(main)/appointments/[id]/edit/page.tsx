// /appointments/[id]/edit
// Edit / reschedule existing appointment
import AppointmentEditClient from '@/app/dashboard/appointments/[id]/edit/ui/AppointmentEditClient'

export default function EditAppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  return <AppointmentEditClient id={params.id} />
}
