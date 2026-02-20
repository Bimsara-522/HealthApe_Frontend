// Skeleton loader
export function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex gap-6 p-6">
      <div className="flex-1 space-y-6">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        <CalendarSkeleton />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
      <aside className="w-72">
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
      </aside>
    </div>
  )
}