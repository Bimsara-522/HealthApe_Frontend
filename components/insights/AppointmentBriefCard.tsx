import React from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import type { Appointment, AppointmentPrep } from './types'

export default function AppointmentBriefCard({
  nextAppointment,
  prep,
  onGenerateSummary,
  onAttachLabs,
}: {
  nextAppointment: Appointment | null
  prep: AppointmentPrep | null
  onGenerateSummary?: () => void
  onAttachLabs?: () => void
}) {
  return (
    <Card title="Next appointment brief" right={<Badge tone="blue">Prep</Badge>}>
      {!nextAppointment ? (
        <p className="text-sm text-gray-700">No upcoming appointments.</p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{nextAppointment.title}</p>
            <p className="mt-1 text-sm text-gray-700">
              {nextAppointment.dateTime.replace('T', ' ')}
            </p>
            {nextAppointment.location ? (
              <p className="mt-1 text-xs text-gray-500">{nextAppointment.location}</p>
            ) : null}
            {nextAppointment.note ? (
              <p className="mt-2 text-sm text-gray-700">{nextAppointment.note}</p>
            ) : null}
          </div>

          {prep ? (
            <>
              <div>
                <p className="text-sm font-semibold text-gray-900">Bring to doctor</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  {prep.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-900">Questions you may ask</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  {prep.questionsToAsk.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}

          <div className="flex flex-col gap-2">
            <button
              onClick={onGenerateSummary}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Generate appointment summary
            </button>
            <button
              onClick={onAttachLabs}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Attach last 3 lab reports
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}