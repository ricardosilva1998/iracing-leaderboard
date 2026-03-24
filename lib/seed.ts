import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import { _getAllDriversForSeed } from "./mock-data";

function getDbPath() {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  return path.resolve(process.cwd(), "dev.db");
}

const adapter = new PrismaBetterSqlite3({ url: `file:${getDbPath()}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database with mock driver data...\n");

  const deleted = await prisma.driver.deleteMany();
  console.log(`Cleared ${deleted.count} existing drivers.`);

  const drivers = _getAllDriversForSeed();
  console.log(`Inserting ${drivers.length} mock drivers...\n`);

  let inserted = 0;
  for (const d of drivers) {
    await prisma.driver.create({
      data: {
        custId: d.custId,
        displayName: d.displayName,
        memberSince: d.memberSince,
        clubName: d.clubName,
        countryCode: d.countryCode,
        iRatingRoad: d.iRatingRoad,
        iRatingOval: d.iRatingOval,
        iRatingDirtRoad: d.iRatingDirtRoad,
        iRatingDirtOval: d.iRatingDirtOval,
        srRoad: d.srRoad,
        srOval: d.srOval,
        srDirtRoad: d.srDirtRoad,
        srDirtOval: d.srDirtOval,
        licenseRoad: d.licenseRoad,
        licenseOval: d.licenseOval,
        licenseDirtRoad: d.licenseDirtRoad,
        licenseDirtOval: d.licenseDirtOval,
      },
    });

    inserted++;
    if (inserted % 25 === 0) {
      console.log(`  ...inserted ${inserted}/${drivers.length}`);
    }
  }

  console.log(`\nDone! Inserted ${inserted} drivers.`);

  const count = await prisma.driver.count();
  const topRoad = await prisma.driver.findMany({
    orderBy: { iRatingRoad: "desc" },
    take: 5,
    select: { displayName: true, iRatingRoad: true },
  });

  console.log(`\nVerification: ${count} drivers in database.`);
  console.log("Top 5 road iRating:");
  for (const d of topRoad) {
    console.log(`  ${d.displayName}: ${d.iRatingRoad}`);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
