// Calendar view + upcoming appointment
// Server Component — data fetched on the server
import { Suspense } from 'react'
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar'
import { NextVisitCard } from '@/components/appointments/NextVisitCard'
import { PastVisitsSidebar } from '@/components/appointments/PastVisitsSidebar'
import { NewBookingButton } from '@/components/appointments/NewBookingButton'
import { getAppointments } from '@/lib/api/appointments'
import { CalendarSkeleton } from './loading'

export default async function AppointmentsPage() {
  // Fetch on the server — no loading spinner for initial render
  const appointments = await getAppointments({ month: undefined })

  const nextVisit = appointments
    .filter(a => new Date(a.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const pastVisits = appointments
    .filter(a => new Date(a.date) <= new Date())
    .slice(0, 5)

  return (
    <div className="flex gap-6 p-6">
      {/* Main Column */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <NewBookingButton />
        </div>

        <Suspense fallback={<CalendarSkeleton />}>
          <AppointmentCalendar appointments={appointments} />
        </Suspense>

        {nextVisit && <NextVisitCard appointment={nextVisit} />}
      </div>

      {/* Right Sidebar */}
      <aside className="w-72">
        <PastVisitsSidebar visits={pastVisits} />
      </aside>
    </div>
  )
}