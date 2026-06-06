import { defineConfig } from "drizzle-kit";

const isGenerateCommand = process.argv.some((argument) => argument.includes("generate"));
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && !isGenerateCommand) {
  throw new Error("DATABASE_URL is required for Drizzle migrate and studio commands.");
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit generate does not connect to the database; this placeholder only keeps
    // local migration generation ergonomic when a Neon URL is not present yet.
    url: databaseUrl ?? "postgres://earthlight:earthlight@localhost:5432/earthlight",
  },
  verbose: true,
  strict: true,
});
