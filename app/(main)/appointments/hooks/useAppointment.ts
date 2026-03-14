// Single appointment by ID
'use client'

import { useQuery } from '@tanstack/react-query'
import { getAppointmentById } from 'app/(main)/appointments/lib/api/appointments'
import { appointmentKeys } from './useAppointments'

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
