import React from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'

export default function ConnectionsCard({
  text,
  onSeeDocs,
}: {
  text: string
  onSeeDocs?: () => void
}) {
  return (
    <Card title="Connections" right={<Badge tone="gray">Optional</Badge>}>
      <div className="space-y-3 text-sm text-gray-700">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="font-semibold text-gray-900">Possible relationship</p>
          <p className="mt-1">{text}</p>
          <p className="mt-2 text-xs text-gray-500">
            This is a pattern summary from your documents, not medical advice.
          </p>
        </div>

        <button
          onClick={onSeeDocs}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          See supporting documents
        </button>
      </div>
    </Card>
  )
}