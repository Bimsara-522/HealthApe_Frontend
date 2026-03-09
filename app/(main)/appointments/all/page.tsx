// Server page 
import { useAppointments } from 'app/(main)/appointments/hooks/useAppointments'
import { getAppointments } from 'app/(main)/appointments/lib/api/appointments'
import AppointmentsAllClient from 'app/(main)/appointments/all/ui/AppointmentsAllClient'

export default async function AppointmentsAllPage() {
  return <AppointmentsAllClient />
}