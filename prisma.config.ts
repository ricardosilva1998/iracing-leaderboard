import "dotenv/config";
import { defineConfig } from "prisma/config";

const dbUrl = process.env.RAILWAY_ENVIRONMENT
  ? "file:/app/data/iracing.db"
  : (process.env.DATABASE_URL || "file:./dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});
