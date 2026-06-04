import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export const NASCENTE_SLUG = "fazenda-nascente";

export async function getNascenteProperty() {
  const db = getDb();
  const rows = await db.select().from(schema.properties).where(eq(schema.properties.slug, NASCENTE_SLUG)).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(schema.properties)
      .values({ slug: NASCENTE_SLUG, nome: "Fazenda Nascente", codigo: "50985" })
      .returning();
    return created;
  }
  return rows[0];
}
