import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createPool } from "mysql2";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("Environment variable `DATABASE_URL` is required");
}

async function main() {
  const pool = createPool({
    uri: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  console.log("Running migrations");

  await migrate(db, { migrationsFolder: "./migrations" });

  console.log("Migrated successfully");

  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed");
  console.error(e);
  process.exit(1);
});
