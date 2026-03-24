import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Category, LeaderboardEntry, LeaderboardResponse } from "@/lib/types";

const VALID_CATEGORIES = new Set<Category>(["road", "oval", "dirt_road", "dirt_oval"]);

const columnMap: Record<Category, string> = {
  road: "iRatingRoad",
  oval: "iRatingOval",
  dirt_road: "iRatingDirtRoad",
  dirt_oval: "iRatingDirtOval",
};

const srColumnMap: Record<Category, string> = {
  road: "srRoad",
  oval: "srOval",
  dirt_road: "srDirtRoad",
  dirt_oval: "srDirtOval",
};

const licenseColumnMap: Record<Category, string> = {
  road: "licenseRoad",
  oval: "licenseOval",
  dirt_road: "licenseDirtRoad",
  dirt_oval: "licenseDirtOval",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = (searchParams.get("category") ?? "road") as Category;
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 100, 1), 500);
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "Invalid category. Must be one of: road, oval, dirt_road, dirt_oval" },
      { status: 400 },
    );
  }

  try {
    const orderByColumn = columnMap[category];
    const srColumn = srColumnMap[category];
    const licenseColumn = licenseColumnMap[category];

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where: { [orderByColumn]: { gt: 0 } },
        orderBy: { [orderByColumn]: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.driver.count({
        where: { [orderByColumn]: { gt: 0 } },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: LeaderboardEntry[] = drivers.map((d: any) => ({
      custId: d.custId,
      displayName: d.displayName,
      iRating: (d as Record<string, unknown>)[orderByColumn] as number,
      safetyRating: (d as Record<string, unknown>)[srColumn] as number,
      license: ((d as Record<string, unknown>)[licenseColumn] as string) ?? "R 0.00",
      countryCode: d.countryCode ?? "",
    }));

    const response: LeaderboardResponse = { drivers: entries, total };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
