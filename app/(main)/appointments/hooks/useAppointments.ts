// Fetch + cache appointments list
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAppointments, createAppointment, cancelAppointment, getNextAppointment } from 'app/(main)/appointments/lib/api/appointments'
import type { Appointment, CreateAppointmentDto } from 'app/(main)/appointments/types/appointment'

// Query Keys (centralised, type-safe) 
export const appointmentKeys = {
  all: () => ['appointments'] as const,
  list: (filters?: object) => ['appointments', 'list', filters] as const,
  detail: (id: string) => ['appointments', 'detail', id] as const,
}

// List hook 
export function useAppointments(month?: string) {
  return useQuery({
    queryKey: appointmentKeys.list({ month }), // ← month is undefined
    queryFn: () => getAppointments({ month }),  // ← Passes { month: undefined }
    staleTime: 5 * 60 * 1000,  // 5 minutes
  })
}

// Next appointment hook
export function useNextAppointment() {
  return useQuery({
    queryKey: ['appointments', 'next'],
    queryFn: () => getNextAppointment(),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  })
}

// Create mutation (with optimistic update) 
export function useCreateAppointment() {
  const queryClient = useQueryClient() // queryClient is used to refresh appointment lists after creating a new appointment
  return useMutation({
    mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto), // internally does api.post('/appointments', dto). dto is the appointment form data object which is sent to the backend
    onSuccess: () => {
      // When creating a new appointment, the cached list becomes outdated
      // So we invalidate the cache. Refetch appointment lists from the server. UI updates
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all() })
      queryClient.invalidateQueries({ queryKey: ['appointments', 'next'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Cancel mutation (optimistic: remove from UI immediately) 
export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.all() })

      // snapshot all list queries so we can rollback
      const previousLists = queryClient.getQueriesData({
        queryKey: appointmentKeys.all(),
      })
      // optimistically update every cached appointments list
      queryClient.setQueriesData(
        { queryKey: appointmentKeys.all() },
        (old: unknown) => {
          if (!Array.isArray(old)) return old
          return old.map((a: Appointment) =>
            a.id === id ? { ...a, status: 'cancelled' } : a
          )
        }
      )
      // also update detail cache if it exists
      queryClient.setQueryData(appointmentKeys.detail(id), (old: Appointment | undefined) => {
        if (!old) return old
        return { ...old, status: 'cancelled' }
      })

      return { previousLists } // rollback context
    },

    onError: (_err, _id, ctx) => {
      // rollback all cached lists
      ctx?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}