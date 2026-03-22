// UpcomingAppointment component
// Shows the next confirmed appointment from the backend

import React from 'react';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import { Button } from '@/components/UI/button';
import type { NextAppointment } from 'app/(main)/appointments/hooks/useAppointment';

// Formats "09:00" (24hr) → "9:00 AM"
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

interface UpcomingAppointmentProps {
  appointment: NextAppointment | null;
  loading?: boolean;
}

export function UpcomingAppointment({ appointment, loading = false }: UpcomingAppointmentProps) {

  // Skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
        <div className="h-5 w-24 bg-gray-100 rounded mb-4" />
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state — no upcoming appointment
  if (!appointment) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h3>
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <CalendarPlus className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No upcoming appointments</p>
          <p className="text-xs text-gray-400 mb-4">Book a visit with your doctor to stay on top of your health.</p>
          <Link
            href="/appointments/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Book appointment
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const dateObj = new Date(appointment.date);
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getUTCDate();

  const doctorName = appointment.doctor?.name ?? appointment.doctorNameSnapshot;
  const specialty = appointment.doctor?.specialty ?? null;

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
          <h4 className="font-semibold text-gray-900 truncate">{doctorName}</h4>
          <p className="text-sm text-gray-500">
            {specialty ? `${specialty} • ` : ''}{formatTime(appointment.time)}
          </p>
          {appointment.hospital && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{appointment.hospital}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4">
        <Link href={`/appointments/${appointment.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Reschedule
          </Button>
        </Link>
        <Link href={`/appointments/${appointment.id}`} className="flex-1">
          <Button variant="primary" size="sm" className="w-full">
            Details
          </Button>
        </Link>
      </div>
    </div>
  );
}