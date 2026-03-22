// /appointments/new (booking form)
// Simple booking page using the BookingForm
import { BookingForm } from '@/components/appointments/BookingForm'
import Link from 'next/link'

export default function NewAppointmentPage() {
  return (
    
    <div className="p-6">
      {/* This inner container is centered */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a doctor and confirm a date/time for your next visit.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[350px]">
          <BookingForm />
        </div>

        <Link className="text-blue-600 hover:underline text-sm" href="/appointments">
          ← Back to appointments
        </Link>
      </div>
    </div>
  )
}
