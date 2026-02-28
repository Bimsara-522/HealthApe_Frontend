// Calendar view + upcoming appointment
// Server Component — data fetched on the server
import { Suspense } from 'react'
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar'
import { NextVisitCard } from '@/components/appointments/NextVisitCard'
import { PastVisitsSidebar } from '@/components/appointments/PastVisitsSidebar'
import { NewBookingButton } from '@/components/appointments/NewBookingButton'
import { getAppointments } from 'app/(main)/appointments/lib/api/appointments'
import { CalendarSkeleton } from './loading'
import { AppointmentList } from '@/components/appointments/AppointmentList'

export default async function AppointmentsPage() {
  // Fetch on the server — no loading spinner for initial render
  const appointments = await getAppointments({ month: undefined })

  const nextVisit = appointments
    .filter(a => new Date(a.date) > new Date()) // convert the appointment's date string into a Date and compare it with new Date() which is today
    // If: a.date is earlier → result is negative → a goes first
    // a.date is later → result is positive → b goes first
    // That means the array becomes sorted from earliest date → latest date
    // After sorting, we immediately take: [0] first one 
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] 

  const pastVisits = appointments
    .filter(a => new Date(a.date) <= new Date()) // convert the appointment's date string into a Date and keep appointments that are today or earlier
    .slice(0, 5) // take first 5 appointments

  return (
    <div className="flex gap-6 p-6">
      {/* Main Column */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <NewBookingButton />
        </div>

        <Suspense fallback={<CalendarSkeleton />}>
          <AppointmentCalendar appointments = {appointments} />
        </Suspense>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Next Visit</h2>
          <NewBookingButton />
          </div>
          {nextVisit && <NextVisitCard appointment = {nextVisit} />}
      </div>

      {/* Right Sidebar */}
      <aside className="w-[360px]">
        <PastVisitsSidebar visits = {pastVisits} />
      </aside>
    </div>
  )
}