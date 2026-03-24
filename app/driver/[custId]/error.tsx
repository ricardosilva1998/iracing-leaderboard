"use client";

export default function DriverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">
        Something went wrong
      </h1>
      <p className="text-gray-400 mb-8">
        {error.message || "An unexpected error occurred while loading this driver."}
      </p>
      <div className="flex gap-4 justify-center">
        <a
          href="/"
          className="px-4 py-2 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-colors duration-150"
        >
          Go Back
        </a>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-150"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
