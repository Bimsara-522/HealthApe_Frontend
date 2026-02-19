// Error boundary
"use client"

import React from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  React.useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="mt-2 text-sm text-gray-600">{error?.message}</p>
      <div className="mt-4">
        <button
          onClick={() => reset()}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}