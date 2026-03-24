"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Category, LeaderboardEntry } from "@/lib/types";
import CategoryTabs from "./CategoryTabs";

const LICENSE_COLORS: Record<string, string> = {
  R: "bg-gray-700 text-gray-200",
  D: "bg-orange-600 text-white",
  C: "bg-yellow-500 text-gray-900",
  B: "bg-green-600 text-white",
  A: "bg-blue-600 text-white",
  Pro: "bg-gray-900 text-white border border-gray-500",
};

function getLicenseStyle(license: string): string {
  const letter = license.charAt(0).toUpperCase();
  if (license.toLowerCase().includes("pro")) return LICENSE_COLORS.Pro;
  return LICENSE_COLORS[letter] ?? "bg-gray-700 text-gray-200";
}

function formatIRating(value: number): string {
  return value.toLocaleString();
}

function getRankStyle(rank: number): string {
  if (rank === 1) return "text-yellow-400 font-bold";
  if (rank === 2) return "text-gray-300 font-bold";
  if (rank === 3) return "text-amber-600 font-bold";
  return "text-gray-400";
}

export default function LeaderboardTable() {
  const [category, setCategory] = useState<Category>("road");
  const [drivers, setDrivers] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/leaderboard?category=${category}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setDrivers(data.drivers ?? []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDrivers([]);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div>
      <CategoryTabs selected={category} onSelect={setCategory} />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-3 px-3 w-12 font-medium">#</th>
              <th className="py-3 px-3 font-medium">Driver</th>
              <th className="py-3 px-3 font-medium text-right">iRating</th>
              <th className="py-3 px-3 font-medium text-right">
                Safety Rating
              </th>
              <th className="py-3 px-3 font-medium">License</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-3 px-3">
                      <div className="h-4 w-6 bg-gray-800 rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-16 bg-gray-800 rounded animate-pulse ml-auto" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-12 bg-gray-800 rounded animate-pulse ml-auto" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-6 w-10 bg-gray-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : drivers.map((driver, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={driver.custId}
                      className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors duration-150"
                    >
                      <td className={`py-3 px-3 ${getRankStyle(rank)}`}>
                        {rank}
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/driver/${driver.custId}`}
                          className="text-gray-100 hover:text-blue-400 transition-colors duration-150 font-medium"
                        >
                          {driver.displayName}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-100 font-mono">
                        {formatIRating(driver.iRating)}
                      </td>
                      <td className="py-3 px-3 text-right text-gray-300 font-mono">
                        {driver.safetyRating.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${getLicenseStyle(driver.license)}`}
                        >
                          {driver.license}
                        </span>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {!isLoading && drivers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No leaderboard data available.
          </div>
        )}
      </div>
    </div>
  );
}
