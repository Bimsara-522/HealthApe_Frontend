// Server page (fetch mock data + pass it down)
import { getAppointments } from 'app/(main)/appointments/lib/api/appointments'
import AppointmentsAllClient from 'app/(main)/appointments/all/ui/AppointmentsAllClient'

export default async function AppointmentsAllPage() {
  // Fetch mock data 
  const appointments = await getAppointments({ month: undefined })

  // Only upcoming appointments
  const upcoming = appointments
    .filter(a => new Date(a.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return <AppointmentsAllClient initialAppointments={upcoming} />
}