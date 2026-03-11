// // Fetch + cache appointments list
// 'use client'

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { getAppointments, createAppointment, cancelAppointment } from '@/lib/api/appointments'
// import type { CreateAppointmentDto } from '@/types/appointment'

// // Query Keys (centralised, type-safe) 
// export const appointmentKeys = {
//   all:    () => ['appointments'] as const,
//   list:   (filters?: object) => ['appointments', 'list', filters] as const,
//   detail: (id: string) => ['appointments', 'detail', id] as const,
// }

// // List hook 
// export function useAppointments(month?: string) {
//   return useQuery({
//     queryKey: appointmentKeys.list({ month }),
//     queryFn: () => getAppointments({ month }),
//     staleTime: 5 * 60 * 1000,  // 5 minutes
//   })
// }

// // Create mutation (with optimistic update) 
// export function useCreateAppointment() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: (dto: CreateAppointmentDto) => createAppointment(dto),
//     onSuccess: () => {
//       // Invalidate so all appointment lists refetch
//       queryClient.invalidateQueries({ queryKey: appointmentKeys.all() })
//     },
//   })
// }

// // Cancel mutation (optimistic: remove from UI immediately) 
// export function useCancelAppointment() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: (id: string) => cancelAppointment(id),
//     onMutate: async (id) => {
//       await queryClient.cancelQueries({ queryKey: appointmentKeys.all() })

//       // snapshot all list queries so we can rollback
//       const previousLists = queryClient.getQueriesData({
//         queryKey: appointmentKeys.all(),
//       })
//       // optimistically update every cached appointments list
//       queryClient.setQueriesData(
//         { queryKey: appointmentKeys.all() },
//         (old: unknown) => {
//           if (!Array.isArray(old)) return old
//           return old.map((a: any) =>
//             a?.id === id ? { ...a, status: 'cancelled' } : a
//           )
//         }
//       )
//       // also update detail cache if it exists
//       queryClient.setQueryData(appointmentKeys.detail(id), (old: any) => {
//         if (!old) return old
//         return { ...old, status: 'cancelled' }
//       })

//       return { previousLists } // rollback context
//     },
   
//     onError: (_err, _id, ctx) => {
//       // rollback all cached lists
//       ctx?.previousLists?.forEach(([key, data]) => {
//         queryClient.setQueryData(key, data)
//       })
//     },
//     onSettled: (_data, _err, id) => {
//       queryClient.invalidateQueries({ queryKey: appointmentKeys.all() })
//       queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
//     },
//   })
// }