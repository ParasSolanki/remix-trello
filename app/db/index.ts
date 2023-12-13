import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "~/env";

const globalForDB = globalThis as unknown as {
  db: ReturnType<typeof drizzle>;
};

export const pool = mysql.createPool({
  uri: env.DATABASE_URL,
});

export const db = globalForDB.db ?? drizzle(pool);

if (env.NODE_ENV !== "production") globalForDB.db = db;
