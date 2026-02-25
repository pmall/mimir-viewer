import { config } from "dotenv";
import path from "path";

// Force load env FIRST so that the initialization of Pool receives credentials
config({ path: path.resolve(process.cwd(), ".env.local") });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
