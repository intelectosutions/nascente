import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { HerdBalance } from "@/db/schema";

export async function getBalanceByPropertyId(propertyId: number): Promise<HerdBalance | null> {
  const db = getDb();
  const rows = await db.select().from(schema.herdBalances).where(eq(schema.herdBalances.propertyId, propertyId)).limit(1);
  return rows[0] ?? null;
}

type Band = { m: number; f: number; t: number };
const band = (m: number, f: number): Band => ({ m, f, t: m + f });

export function balanceTotals(b: HerdBalance) {
  const b0_12 = band(b.m0_2 + b.m3_8 + b.m9_12, b.f0_2 + b.f3_8 + b.f9_12);
  const b13_24 = band(b.m13_24, b.f13_24);
  const b25_36 = band(b.m25_36, b.f25_36);
  const b37 = band(b.m37plus, b.f37plus);
  const totalM = b0_12.m + b13_24.m + b25_36.m + b37.m;
  const totalF = b0_12.f + b13_24.f + b25_36.f + b37.f;
  return {
    total: totalM + totalF,
    totalM,
    totalF,
    hasFemales: totalF > 0,
    b0_12,
    b13_24,
    b25_36,
    b37,
  };
}

export type BalanceValues = {
  m0_2: number; f0_2: number;
  m3_8: number; f3_8: number;
  m9_12: number; f9_12: number;
  m13_24: number; f13_24: number;
  m25_36: number; f25_36: number;
  m37plus: number; f37plus: number;
};

export async function saveBalance(propertyId: number, values: BalanceValues) {
  const db = getDb();
  const now = new Date();
  const existing = await getBalanceByPropertyId(propertyId);
  if (existing) {
    await db.update(schema.herdBalances).set({ ...values, updatedAt: now }).where(eq(schema.herdBalances.propertyId, propertyId));
  } else {
    await db.insert(schema.herdBalances).values({ propertyId, ...values });
  }
}
