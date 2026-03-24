export default function DriverLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-gray-800 rounded-lg" />
        <div className="h-5 w-48 bg-gray-800 rounded-lg" />
        <div className="flex gap-3 mt-2">
          <div className="h-9 w-32 bg-gray-800 rounded-lg" />
          <div className="h-9 w-36 bg-gray-800 rounded-lg" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-900 border border-gray-800 rounded-lg" />
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="h-80 bg-gray-900 border border-gray-800 rounded-lg" />

      {/* Table skeleton */}
      <div className="space-y-3">
        <div className="h-10 bg-gray-800 rounded-lg" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-800/50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
