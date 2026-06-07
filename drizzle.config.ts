import { existsSync, readFileSync } from "node:fs";

import { defineConfig } from "drizzle-kit";
import { parse } from "dotenv";

const envFile = loadEnvFile(".env");
const envLocalFile = loadEnvFile(".env.local");

const isGenerateCommand = process.argv.some((argument) => argument.includes("generate"));
const databaseUrl =
  readDatabaseUrl("DATABASE_MIGRATION_URL") ??
  readDatabaseUrl("DATABASE_URL_UNPOOLED") ??
  readDatabaseUrl("DATABASE_URL");

function loadEnvFile(path: string) {
  return existsSync(path) ? parse(readFileSync(path)) : {};
}

function readDatabaseUrl(name: string) {
  // Drizzle Kit does not load Next.js env files for CLI commands. Resolve only the
  // database URL keys with explicit precedence so blank copied-template values do not
  // mask a valid fallback: shell/Vercel env > nonblank .env.local > nonblank .env.
  return normalizeEnvValue(process.env[name]) ?? normalizeEnvValue(envLocalFile[name]) ?? normalizeEnvValue(envFile[name]);
}

function normalizeEnvValue(value: string | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

if (!databaseUrl && !isGenerateCommand) {
  throw new Error(
    "DATABASE_MIGRATION_URL, DATABASE_URL_UNPOOLED, or DATABASE_URL is required for Drizzle migrate and studio commands.",
  );
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations should use an unpooled connection when available; generation is offline,
    // so this placeholder keeps local migration authoring ergonomic before Neon is wired.
    url: databaseUrl ?? "postgres://earthlight:earthlight@localhost:5432/earthlight",
  },
  verbose: true,
  strict: true,
});
