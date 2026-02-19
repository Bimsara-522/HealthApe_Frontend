// components/dashboard/UpcomingAppointment.tsx
// ============================================
// UPCOMING APPOINTMENT COMPONENT
// ============================================
// Shows next appointment with:
// - Date box (DEC 16)
// - Doctor name and specialty
// - Reschedule / Details buttons

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/UI/button';

// ============================================
// TYPE DEFINITION
// ============================================
export interface Appointment {
  id: string;
  doctorName: string;    // "Dr. Sarah Conner"
  specialty: string;     // "Cardiologist"
  date: Date;            // JavaScript Date object
  time: string;          // "9:00 AM"
}

// Props interface
interface UpcomingAppointmentProps {
  appointment: Appointment | null;
}

export function UpcomingAppointment({ appointment }: UpcomingAppointmentProps) {
  // If no appointment, show empty state
  if (!appointment) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">No upcoming appointments</p>
          <Link 
            href="/dashboard/appointments"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
          >
            Schedule one
          </Link>
        </div>
      </div>
    );
  }

  // Format the date
  const month = appointment.date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = appointment.date.getDate();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>

      {/* Appointment Card */}
      <div className="flex items-start gap-4">
        {/* Date Box */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-50 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-blue-600">{month}</span>
          <span className="text-xl font-bold text-blue-700">{day}</span>
        </div>

        {/* Doctor Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{appointment.doctorName}</h4>
          <p className="text-sm text-gray-500">
            {appointment.specialty} • {appointment.time}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        <Button variant="outline" size="sm" className="flex-1">
          Reschedule
        </Button>
        <Link href={`/dashboard/appointments/${appointment.id}`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
