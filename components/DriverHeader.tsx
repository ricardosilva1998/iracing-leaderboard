import Link from "next/link";
import type { DriverProfile } from "@/lib/types";

interface DriverHeaderProps {
  profile: DriverProfile;
}

export default function DriverHeader({ profile }: DriverHeaderProps) {
  const memberSinceFormatted = new Date(profile.memberSince).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-150 mb-4"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Leaderboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            {profile.displayName}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
            <span>Member since {memberSinceFormatted}</span>
            {profile.clubName && <span>{profile.clubName}</span>}
            {profile.countryCode && <span>{profile.countryCode}</span>}
          </div>
        </div>

        <a
          href={`https://garage61.net/profile/${profile.custId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-150 shrink-0"
        >
          View on Garage61
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
