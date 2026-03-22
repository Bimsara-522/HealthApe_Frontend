// /appointments/[id]/edit
// Edit / reschedule existing appointment
import { use } from 'react'
import AppointmentEditClient from './ui/AppointmentEditClient'

export default function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <AppointmentEditClient id={id} />
}
