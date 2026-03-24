import { NextRequest, NextResponse } from "next/server";
import { getDriverData } from "@/lib/iracing-api";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ custId: string }> },
) {
  const { custId: custIdParam } = await params;
  const custId = Number(custIdParam);

  if (Number.isNaN(custId) || custId <= 0) {
    return NextResponse.json(
      { error: "Invalid custId" },
      { status: 400 },
    );
  }

  try {
    const driver = await getDriverData(custId);

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 },
      );
    }

    // Upsert into the database (best-effort – don't break the response)
    try {
      const roadStats = driver.stats.find((s) => s.category === "road");
      const ovalStats = driver.stats.find((s) => s.category === "oval");
      const dirtRoadStats = driver.stats.find((s) => s.category === "dirt_road");
      const dirtOvalStats = driver.stats.find((s) => s.category === "dirt_oval");

      await prisma.driver.upsert({
        where: { custId },
        create: {
          custId,
          displayName: driver.profile.displayName,
          memberSince: driver.profile.memberSince || null,
          clubName: driver.profile.clubName || null,
          countryCode: driver.profile.countryCode || null,
          iRatingRoad: roadStats?.iRating ?? 0,
          iRatingOval: ovalStats?.iRating ?? 0,
          iRatingDirtRoad: dirtRoadStats?.iRating ?? 0,
          iRatingDirtOval: dirtOvalStats?.iRating ?? 0,
          srRoad: roadStats?.safetyRating ?? 0,
          srOval: ovalStats?.safetyRating ?? 0,
          srDirtRoad: dirtRoadStats?.safetyRating ?? 0,
          srDirtOval: dirtOvalStats?.safetyRating ?? 0,
          licenseRoad: roadStats?.license ?? null,
          licenseOval: ovalStats?.license ?? null,
          licenseDirtRoad: dirtRoadStats?.license ?? null,
          licenseDirtOval: dirtOvalStats?.license ?? null,
        },
        update: {
          displayName: driver.profile.displayName,
          memberSince: driver.profile.memberSince || null,
          clubName: driver.profile.clubName || null,
          countryCode: driver.profile.countryCode || null,
          iRatingRoad: roadStats?.iRating ?? 0,
          iRatingOval: ovalStats?.iRating ?? 0,
          iRatingDirtRoad: dirtRoadStats?.iRating ?? 0,
          iRatingDirtOval: dirtOvalStats?.iRating ?? 0,
          srRoad: roadStats?.safetyRating ?? 0,
          srOval: ovalStats?.safetyRating ?? 0,
          srDirtRoad: dirtRoadStats?.safetyRating ?? 0,
          srDirtOval: dirtOvalStats?.safetyRating ?? 0,
          licenseRoad: roadStats?.license ?? null,
          licenseOval: ovalStats?.license ?? null,
          licenseDirtRoad: dirtRoadStats?.license ?? null,
          licenseDirtOval: dirtOvalStats?.license ?? null,
          updatedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error("DB upsert error (non-fatal):", dbError);
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error("Get driver error:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver data" },
      { status: 500 },
    );
  }
}
