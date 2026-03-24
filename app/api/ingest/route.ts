import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.INGEST_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock mode guard
  if (process.env.USE_MOCK_DATA !== "false") {
    return NextResponse.json({
      message: "Ingestion only available in live mode. Set USE_MOCK_DATA=false to enable.",
    });
  }

  try {
    // TODO: Implement full ingestion pipeline once OAuth credentials are available.
    // The flow would be:
    //   1. Fetch active seasons from /data/series/seasons
    //   2. For each season / category, fetch standings from /data/series/standings
    //   3. Upsert each driver into the Driver table
    //   4. Log results to IngestLog

    await prisma.ingestLog.create({
      data: {
        categoryId: 0,
        driversFound: 0,
        status: "placeholder",
        error: "Full ingestion not yet implemented – awaiting OAuth credentials",
      },
    });

    return NextResponse.json({
      message: "Ingestion endpoint reached. Full pipeline not yet implemented.",
      status: "placeholder",
    });
  } catch (error) {
    console.error("Ingest error:", error);

    try {
      await prisma.ingestLog.create({
        data: {
          categoryId: 0,
          driversFound: 0,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } catch (logError) {
      console.error("Failed to log ingest error:", logError);
    }

    return NextResponse.json(
      { error: "Ingestion failed" },
      { status: 500 },
    );
  }
}
