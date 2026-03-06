import React from 'react'

export default function Badge({
  children,
  tone = 'gray',
}: {
  children: React.ReactNode
  tone?: 'gray' | 'red' | 'green' | 'yellow' | 'blue'
}) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border'
  const tones: Record<string, string> = {
    gray: 'bg-white border-gray-200 text-gray-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  return <span className={`${base} ${tones[tone]}`}>{children}</span>
}