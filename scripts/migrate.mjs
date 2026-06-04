import postgres from "postgres";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definido");
  process.exit(1);
}

const dir = "./drizzle";
if (!existsSync(dir)) {
  console.error(`Pasta ${dir} não encontrada`);
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

await sql`CREATE TABLE IF NOT EXISTS __nascente_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const applied = new Set(
  (await sql`SELECT name FROM __nascente_migrations`).map((r) => r.name)
);

const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

let ran = 0;
for (const f of files) {
  if (applied.has(f)) {
    console.log(`→ ${f} já aplicada, pulando.`);
    continue;
  }
  const content = readFileSync(join(dir, f), "utf-8");
  const statements = content.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  console.log(`→ ${f} (${statements.length} statements)`);
  try {
    await sql.begin(async (tx) => {
      for (const s of statements) {
        await tx.unsafe(s);
      }
      await tx`INSERT INTO __nascente_migrations (name) VALUES (${f})`;
    });
    ran++;
  } catch (e) {
    console.error(`  ERRO em ${f}: ${e.message}`);
    await sql.end();
    process.exit(1);
  }
}

console.log(`✓ ${ran} migration(s) nova(s) aplicada(s).`);
await sql.end();
