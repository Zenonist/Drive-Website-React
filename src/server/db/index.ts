import { drizzle } from "drizzle-orm/singlestore";
import { createPool } from "mysql2/promise";
import type { Pool } from "mysql2/promise";
import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Pool | undefined;
};
console.log("TEST")
console.log(env.SINGLESTORE_HOST)

const client = globalForDb.client ?? createPool({
  host: env.SINGLESTORE_HOST,
  user: env.SINGLESTORE_USER,
  password: env.SINGLESTORE_PASS,
  port: parseInt(env.SINGLESTORE_PORT),
  database: env.SINGLESTORE_DB_NAME,
  ssl: {},
  maxIdle: 0
});

if (env.NODE_ENV !== "production") globalForDb.client = client;


