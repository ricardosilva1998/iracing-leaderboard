import type { RecentRace } from "@/lib/types";

interface RecentRacesProps {
  races: RecentRace[];
}

export default function RecentRaces({ races }: RecentRacesProps) {
  const displayRaces = races.slice(0, 20);

  if (displayRaces.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center text-gray-500">
        No recent races found.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-100 p-4 border-b border-gray-800">
        Recent Races
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Series</th>
              <th className="py-3 px-4 font-medium hidden md:table-cell">
                Track
              </th>
              <th className="py-3 px-4 font-medium text-center">Start</th>
              <th className="py-3 px-4 font-medium text-center">Finish</th>
              <th className="py-3 px-4 font-medium text-center">Inc</th>
              <th className="py-3 px-4 font-medium text-right">iRating +/-</th>
            </tr>
          </thead>
          <tbody>
            {displayRaces.map((race, index) => {
              const dateFormatted = new Date(race.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" }
              );
              const iRatingChangeFormatted =
                race.iRatingChange > 0
                  ? `+${race.iRatingChange}`
                  : `${race.iRatingChange}`;
              const iRatingChangeColor =
                race.iRatingChange > 0
                  ? "text-positive"
                  : race.iRatingChange < 0
                    ? "text-negative"
                    : "text-gray-400";

              return (
                <tr
                  key={race.sessionId}
                  className={`border-b border-gray-800/50 transition-colors duration-150 hover:bg-gray-800/30 ${
                    index % 2 === 1 ? "bg-gray-800/10" : ""
                  }`}
                >
                  <td className="py-2.5 px-4 text-gray-300">{dateFormatted}</td>
                  <td className="py-2.5 px-4 text-gray-100 font-medium">
                    {race.seriesName}
                  </td>
                  <td className="py-2.5 px-4 text-gray-400 hidden md:table-cell">
                    {race.trackName}
                  </td>
                  <td className="py-2.5 px-4 text-center text-gray-300">
                    {race.startPosition}
                  </td>
                  <td className="py-2.5 px-4 text-center text-gray-300">
                    {race.finishPosition}
                  </td>
                  <td className="py-2.5 px-4 text-center text-gray-400">
                    {race.incidents}x
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right font-mono font-medium ${iRatingChangeColor}`}
                  >
                    {iRatingChangeFormatted}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
