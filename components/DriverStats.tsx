import type { CategoryStats, Category } from "@/lib/types";

interface DriverStatsProps {
  stats: CategoryStats[];
}

const CATEGORY_META: Record<
  Category,
  { label: string; borderColor: string; textColor: string }
> = {
  road: {
    label: "Road",
    borderColor: "border-road",
    textColor: "text-road",
  },
  oval: {
    label: "Oval",
    borderColor: "border-oval",
    textColor: "text-oval",
  },
  dirt_road: {
    label: "Dirt Road",
    borderColor: "border-dirt-road",
    textColor: "text-dirt-road",
  },
  dirt_oval: {
    label: "Dirt Oval",
    borderColor: "border-dirt-oval",
    textColor: "text-dirt-oval",
  },
};

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

export default function DriverStats({ stats }: DriverStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const meta = CATEGORY_META[stat.category];
        return (
          <div
            key={stat.category}
            className={`bg-gray-900 rounded-lg p-4 border-l-4 ${meta.borderColor}`}
          >
            <h3 className={`text-sm font-semibold ${meta.textColor} mb-3`}>
              {meta.label}
            </h3>

            <div className="mb-3">
              <div className="text-2xl font-bold text-gray-100">
                {stat.iRating.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">iRating</div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-300">
                SR {stat.safetyRating.toFixed(2)}
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${getLicenseStyle(stat.license)}`}
              >
                {stat.license}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
              <div>
                Starts: <span className="text-gray-300">{stat.starts}</span>
              </div>
              <div>
                Wins: <span className="text-gray-300">{stat.wins}</span>
              </div>
              <div>
                Top 5: <span className="text-gray-300">{stat.top5}</span>
              </div>
              <div>
                Avg Finish:{" "}
                <span className="text-gray-300">
                  {stat.avgFinish.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
