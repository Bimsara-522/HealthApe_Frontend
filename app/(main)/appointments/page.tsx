// Calendar view + upcoming appointment
'use client'

import { Suspense } from 'react'
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar'
import { NextVisitCard } from '@/components/appointments/NextVisitCard'
import { PastVisitsSidebar } from '@/components/appointments/PastVisitsSidebar'
import { NewBookingButton } from '@/components/appointments/NewBookingButton'
import { CalendarSkeleton } from './loading'
import { AppointmentList } from '@/components/appointments/AppointmentList'
import { ViewAllButton } from '@/components/appointments/ViewAllButton'
import { useAppointments, useNextAppointment } from 'app/(main)/appointments/hooks/useAppointments'
import { isBeforeToday } from 'app/(main)/appointments/lib/utils/date'

export default function AppointmentsPage() {
  // Fetch all appointments for calendar
  const { data: appointments, isLoading, error } = useAppointments()
  // Fetch next appointment separately
  const { data: nextVisit } = useNextAppointment()

  if (isLoading) {
    return (
      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Appointments</h1>
            <NewBookingButton />
          </div>
          <CalendarSkeleton />
        </div>
        <aside className="w-[360px]">
          <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        </aside>
      </div>
    )
  }

  if (error || !appointments) {
    return (
      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Appointments</h1>
            <NewBookingButton />
          </div>
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load appointments</p>
            <p className="text-sm text-gray-500 mt-2">{(error as any)?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // const pastVisits = appointments
  //   .filter(a => new Date(a.date) <= new Date()) // convert the appointment's date string into a Date and keep appointments that are today or earlier
  //   .slice(0, 5) // take first 5 appointments
    const pastVisits = appointments
    .filter(a => isBeforeToday(a.date))
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
          <AppointmentCalendar appointments={appointments} />
        </Suspense>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Next Visit</h2>
          <ViewAllButton />
        </div>
        {nextVisit && <NextVisitCard appointment={nextVisit} />}
      </div>

      {/* Right Sidebar */}
      <aside className="w-[360px]">
        <PastVisitsSidebar visits={pastVisits} />
      </aside>
    </div>
  )
}