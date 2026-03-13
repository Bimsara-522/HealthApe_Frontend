'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/client'

type Milestone = {
  id: string
  date: string
  title: string
  detail: string
  tag: string
}

export default function HistoryPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/insights/milestones')
      setMilestones(res.data)
      setLoading(false)
    }

    load()
  }, [])

  if (loading)
    return (
      <div className="mx-auto max-w-4xl py-10 text-sm text-gray-600">
        Loading history...
      </div>
    )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">

      {/* Back button */}
      <button
        onClick={() => router.push('/insights')}
        className="mb-6 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        ← Back to insights
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Full medical history
      </h1>

      <div className="space-y-5">

        {milestones.map((m) => (
          <div key={m.id} className="flex gap-4">

            {/* timeline dot */}
            <div className="mt-2 h-3 w-3 rounded-full bg-gray-900" />

            <div className="flex-1 rounded-xl border border-gray-100 bg-white p-4">

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {m.title}
                </p>

                <span className="text-xs text-gray-500">
                  {m.date}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-700">
                {m.detail}
              </p>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}