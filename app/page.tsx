import SearchBar from "@/components/SearchBar";
import LeaderboardTable from "@/components/LeaderboardTable";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-100 mb-4">
          iRacing Leaderboard
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Search drivers, view ratings, and explore leaderboards across all
          iRacing categories.
        </p>
      </section>

      <section className="max-w-xl mx-auto mb-12">
        <SearchBar />
      </section>

      <section>
        <LeaderboardTable />
      </section>
    </div>
  );
}
