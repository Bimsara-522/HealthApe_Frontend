// This is the route page file for the notifications section
// If the user visits a URL like: /notifications, this file is what Next.js loads for that route
'use client'

import NotificationsBell from './ui/NotificationsBell'

export default function NotificationsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            View and manage reminders for appointments.
          </p>
        </div>

        {/* Notification Preview Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Notification Panel Preview
              </h2>
              <p className="text-sm text-gray-500">
                Click the bell icon to open the notifications dropdown.
              </p>
            </div>

            {/* Bell Trigger */}
            <NotificationsBell />
          </div>

          <div className="border-t border-gray-100 pt-4 text-sm text-gray-500">
            This page demonstrates the reusable notification system used across
            the dashboard. Notifications include appointment reminders.
          </div>

        </div>

        {/* Info Section */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            About Notifications
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            Notifications help keep you informed about important events in your
            health records. The system automatically generates reminders for
            upcoming appointments.
          </p>

          <p className="text-sm text-gray-600 mt-2">
            Clicking a notification will take you directly to the related
            appointment details page.
          </p>
        </div>

      </div>
    </div>
  )
}