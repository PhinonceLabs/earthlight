import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required before using the Earthlight database client.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
