import DriverHeader from "@/components/DriverHeader";
import DriverStats from "@/components/DriverStats";
import IRatingChart from "@/components/IRatingChart";
import RecentRaces from "@/components/RecentRaces";
import { getDriverData } from "@/lib/iracing-api";

export default async function DriverPage({
  params,
}: {
  params: Promise<{ custId: string }>;
}) {
  const { custId } = await params;
  const data = await getDriverData(Number(custId));

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">
          Driver Not Found
        </h1>
        <p className="text-gray-400 mb-8">
          Could not find a driver with ID {custId}.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-colors duration-150"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <DriverHeader profile={data.profile} />
      <DriverStats stats={data.stats} />
      <IRatingChart chartData={data.chartData} />
      <RecentRaces races={data.recentRaces} />
    </div>
  );
}
