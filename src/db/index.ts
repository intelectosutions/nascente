import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __dbClient: ReturnType<typeof drizzle> | undefined;
}

function getClient() {
  if (!connectionString) {
    throw new Error("DATABASE_URL não está definido. Configure no .env.local.");
  }
  if (!globalThis.__pgClient) {
    globalThis.__pgClient = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return globalThis.__pgClient;
}

export function getDb() {
  if (!globalThis.__dbClient) {
    globalThis.__dbClient = drizzle(getClient(), { schema });
  }
  return globalThis.__dbClient;
}

export { schema };
