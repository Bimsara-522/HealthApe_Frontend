// This is the interactive UI controller for the bell icon and dropdown behavior
'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NotificationsPanel from '@/components/notifications/NotificationsPanel'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '@/components/notifications/types'

export default function NotificationsBell() {
  const router = useRouter()   // Router instance used for client-side page navigation
  const [open, setOpen] = useState(false)
  // Data + actions returned from the notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications()

  // Runs when the user clicks a notification item
  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id)   // Update read status in database
    setOpen(false)  // Close the dropdown panel
    // If the notification has a navigation target, redirect user to Appointment Details Page of that specific appointment
    if (notification.href) {
      router.push(notification.href)
    }
  }

  return (
    <div className="relative">
      {/* Bell button that toggles the notifications dropdown */}
      <button
        type="button"
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open notifications"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev
            if (!prev) refetch()
            return next
          }) 
        }}
      >       

        {/* Bell icon */}
        <Bell className="w-6 h-6 text-gray-500" />
        {/* Show red notification indicator when there are unread notifications */}
        {unreadCount > 0 && (
            // small red dot positioned on top-right of bell
          <span className="absolute top-1.5 right-1.5 min-w-[10px] h-[10px] rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {/* Dropdown notifications panel */}
      <NotificationsPanel
        isOpen={open}  // controls panel visibility
        notifications={notifications}  // pass notifications list to panel
        onClose={() => setOpen(false)}  // panel can close itself
        onNotificationClick={handleNotificationClick} // click handler for each notification
        onMarkAllAsRead={markAllAsRead}  // action to mark all notifications as read
      />
    </div>
  )
}