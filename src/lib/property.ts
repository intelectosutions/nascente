import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getFarm } from "./farms";

// Busca a property no banco; retorna null se ainda não existe.
// NÃO cria registro — leitura não popula o banco (fazenda vazia = estado vazio na UI).
export async function getPropertyBySlug(slug: string) {
  const db = getDb();
  const rows = await db.select().from(schema.properties).where(eq(schema.properties.slug, slug)).limit(1);
  return rows[0] ?? null;
}

// Cria a property se não existir — usado SOMENTE no upload, quando entram dados reais.
export async function ensurePropertyForSlug(slug: string) {
  const farm = getFarm(slug);
  if (!farm) throw new Error("Fazenda desconhecida: " + slug);
  const existing = await getPropertyBySlug(slug);
  if (existing) return existing;
  const db = getDb();
  const [created] = await db
    .insert(schema.properties)
    .values({ slug: farm.slug, nome: farm.nome, codigo: farm.codigo ?? undefined })
    .returning();
  return created;
}
