export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="text-center py-12">
        <div className="h-12 w-80 bg-gray-800 rounded-lg mx-auto mb-4" />
        <div className="h-6 w-96 bg-gray-800 rounded-lg mx-auto" />
      </div>

      <div className="max-w-xl mx-auto mb-12">
        <div className="h-11 bg-gray-800 rounded-lg" />
      </div>

      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-800 rounded-lg" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
