import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDbPath() {
  // In production (Railway), use the mounted volume
  if (process.env.RAILWAY_ENVIRONMENT) {
    return "/app/data/iracing.db";
  }
  // Locally, use the project root
  return process.env.DATABASE_URL?.replace("file:", "") || "./dev.db";
}

function createPrismaClient() {
  const dbPath = getDbPath();
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
