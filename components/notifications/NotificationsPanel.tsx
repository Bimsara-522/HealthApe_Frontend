'use client'
// This component renders the dropdown/panel that shows the list of notifications
// It is controlled by the parent component (NotificationsBell) using the `isOpen` prop
import { useEffect, useRef } from 'react'
import NotificationItem from './NotificationItem'
import type { Notification } from './types'

type NotificationsPanelProps = {
  isOpen: boolean
  notifications: Notification[]
  onClose: () => void
  onNotificationClick: (notification: Notification) => void 
  onMarkAllAsRead?: () => void
}

export default function NotificationsPanel({
  isOpen,
  notifications,
  onClose,
  onNotificationClick,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null) // Used to detect clicks outside the panel

  useEffect(() => {
    if (!isOpen) return   // If the panel is closed, we don't need to attach event listeners
    // Detect clicks outside the panel
    function handleClickOutside(event: MouseEvent) {
      if (!panelRef.current) return
      // If the clicked element is NOT inside the panel, close the notifications panel
      if (!panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    // Detect Esc key press to close the panel
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    // Add event listeners when panel opens
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    // Cleanup: remove listeners when component unmounts or panel closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null   // If panel is closed, render nothing

  const unreadCount = notifications.filter((n) => !n.isRead).length   // Count unread notifications to display the badge

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-50 w-[400px] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"> 
      {/* Header section */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        {/* Title + unread counter */}
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {/* Show unread count badge only if there are unread notifications */}
          {unreadCount > 0 && (
            <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-medium flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>

        {/* "Mark all as read" button */}
        {!!onMarkAllAsRead && notifications.length > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications list container */}
      <div className="max-h-[420px] overflow-y-auto">
        {/* If there are no notifications */}
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No notifications yet.
          </div>
        ) : (
          // Render each notification using NotificationItem component
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id} // React key for efficient rendering
              notification={notification}
              onClick={onNotificationClick} // pass click handler from parent
            />
          ))
        )}
      </div>
    </div>
  )
}