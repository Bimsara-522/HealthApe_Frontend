// Single appointment by ID
'use client'

import { useQuery } from '@tanstack/react-query'
import { getAppointmentById } from 'app/(main)/appointments/lib/api/appointments'
import { appointmentKeys } from './useAppointments'
import { useState, useEffect } from 'react';
import api from '@/lib/api/client';

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Shape returned by GET /appointments/next
export interface NextAppointment {
  id: string;
  doctorNameSnapshot: string;   // the saved doctor name
  doctor: {
    name: string;
    specialty: string | null;
  } | null;
  hospital: string;
  date: string;    // ISO string e.g. "2026-03-20T00:00:00.000Z"
  time: string;    // "09:00" (HH:MM, 24hr)
  reason: string;
  status: string;
}

export function useNextAppointment() {
  const [appointment, setAppointment] = useState<NextAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/appointments/next');
        // backend returns null if no upcoming appointment
        setAppointment(res.data ?? null);
      } catch {
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { appointment, loading };
}

export function useUpcomingCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/appointments');
        const now = new Date();
        const upcoming = (res.data as NextAppointment[]).filter((appt) => {
          if (appt.status !== 'confirmed') return false;
          const [h, m] = appt.time.split(':').map(Number);
          const dt = new Date(appt.date);
          dt.setHours(h, m, 0, 0);
          return dt >= now;
        });
        setCount(upcoming.length);
      } catch {
        setCount(0);
      }
    };
    fetch();
  }, []);

  return { count };
}