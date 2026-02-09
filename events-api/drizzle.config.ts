import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const dbUrl = `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/database/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
});
