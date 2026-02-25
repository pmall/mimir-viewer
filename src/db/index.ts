import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Neon provides DATABASE_URL by default.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL in environment variables.");
}

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
