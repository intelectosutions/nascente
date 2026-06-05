import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { HerdBalance } from "@/db/schema";

export async function getBalanceByPropertyId(propertyId: number): Promise<HerdBalance | null> {
  const db = getDb();
  const rows = await db.select().from(schema.herdBalances).where(eq(schema.herdBalances.propertyId, propertyId)).limit(1);
  return rows[0] ?? null;
}

export function balanceTotals(b: HerdBalance) {
  const a0_12 = b.age0_2 + b.age3_8 + b.age9_12;
  const a13_24 = b.age13_24;
  const a25_36 = b.age25_36;
  const a37 = b.age37plus;
  const total = a0_12 + a13_24 + a25_36 + a37;
  return { total, a0_12, a13_24, a25_36, a37 };
}

export async function saveBalance(
  propertyId: number,
  values: { age0_2: number; age3_8: number; age9_12: number; age13_24: number; age25_36: number; age37plus: number }
) {
  const db = getDb();
  const now = new Date();
  const existing = await getBalanceByPropertyId(propertyId);
  if (existing) {
    await db
      .update(schema.herdBalances)
      .set({ ...values, updatedAt: now })
      .where(eq(schema.herdBalances.propertyId, propertyId));
  } else {
    await db.insert(schema.herdBalances).values({ propertyId, ...values });
  }
}
