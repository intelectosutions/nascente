import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL não definido");
    process.exit(1);
  }
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);
  console.log("Aplicando migrations…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("OK.");
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
