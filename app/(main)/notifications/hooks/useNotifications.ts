// This hook acts as the data layer for the notifications feature.
// It fetches notifications from the backend and provides functions to update their read status.
'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@/components/notifications/types'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from 'app/(main)/appointments/lib/api/notifications'

export function useNotifications() {
  const queryClient = useQueryClient()   // React Query client allows us to manually update cached query data
  // Fetch notifications from backend and cache them under the key ['notifications']
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 60 * 1000,  // keep data fresh for 1 minute before refetching
  })

  // Compute number of unread notifications.
  // useMemo prevents recalculating unless notifications change.
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  )

  // Mutation for marking a single notification as read
  const markOneMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    // After the backend update succeeds, update the cached notifications
    // so the UI updates instantly without refetching.
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      )
    },
  })

  // Mutation for marking ALL notifications as read
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    // Optimistically update the cache so the UI reflects all as read
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.map((n) => ({ ...n, isRead: true })),
      )
    },
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    
    // Wrapper functions used by UI components
    // These trigger the corresponding mutations
    markAsRead: (id: string) => markOneMutation.mutate(id),
    markAllAsRead: () => markAllMutation.mutate(),
  }
}