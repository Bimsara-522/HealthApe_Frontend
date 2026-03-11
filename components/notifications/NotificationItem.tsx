'use client'
// This component renders one single notification row/card
import type { Notification } from './types'

type NotificationItemProps = {
  notification: Notification
  onClick: (notification: Notification) => void // Function passed from parent to handle click behavior
}

// Formats the notification timestamp into a human-readable date/time
function formatDateTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      // When the notification row is clicked, send the notification object back to the parent
      // Parent component decides what to do (mark as read, navigate, etc.)
      onClick={() => onClick(notification)}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-100 transition-colors ${
        // Unread notifications get a highlighted background
        !notification.isRead ? 'bg-blue-50/40' : 'bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-1">
          {/* Small status indicator: red dot for unread, gray for read */}
          {!notification.isRead ? (
            <span className="block w-2.5 h-2.5 rounded-full bg-red-500" />
          ) : (
            <span className="block w-2.5 h-2.5 rounded-full bg-gray-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </p>
            <span className="text-[11px] text-gray-400 whitespace-nowrap">
              {notification.type}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {notification.message}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            {formatDateTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </button>
  )
}