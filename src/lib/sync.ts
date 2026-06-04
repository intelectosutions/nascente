import { eq, and, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ParsedAnimal } from "./parser";

export type SyncDiff = {
  toInsert: ParsedAnimal[];
  toUpdate: { existing: typeof schema.animals.$inferSelect; incoming: ParsedAnimal }[];
  toExit: typeof schema.animals.$inferSelect[];
  unchanged: number;
};

function toIsoDate(d: Date | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoDatesEqual(a: string | null | undefined, b: Date | null): boolean {
  const bIso = toIsoDate(b);
  if (!a && !bIso) return true;
  if (!a || !bIso) return false;
  return a.startsWith(bIso);
}

export async function previewSync(propertyId: number, rows: ParsedAnimal[]): Promise<SyncDiff> {
  const db = getDb();
  const incomingSisbovs = rows.map((r) => r.nSisbov);

  const existingActive = await db
    .select()
    .from(schema.animals)
    .where(and(eq(schema.animals.propertyId, propertyId), eq(schema.animals.status, "ATIVO")));

  const existingMap = new Map(existingActive.map((a) => [a.nSisbov, a]));
  const incomingSet = new Set(incomingSisbovs);

  const toInsert: ParsedAnimal[] = [];
  const toUpdate: SyncDiff["toUpdate"] = [];
  let unchanged = 0;

  for (const row of rows) {
    const existing = existingMap.get(row.nSisbov);
    if (!existing) {
      toInsert.push(row);
    } else {
      const same =
        existing.nManejo === row.nManejo &&
        existing.sexo === row.sexo &&
        existing.raca === row.raca &&
        isoDatesEqual(existing.dataNasc, row.dataNasc) &&
        isoDatesEqual(existing.dataBrincagem, row.dataBrincagem) &&
        isoDatesEqual(existing.dataEnvioSisbov, row.dataEnvioSisbov) &&
        isoDatesEqual(existing.dataLibAbate, row.dataLibAbate);
      if (same) unchanged++;
      else toUpdate.push({ existing, incoming: row });
    }
  }

  const toExit = existingActive.filter((a) => !incomingSet.has(a.nSisbov));

  return { toInsert, toUpdate, toExit, unchanged };
}

export async function applySync(
  propertyId: number,
  rows: ParsedAnimal[],
  filename: string | null
): Promise<{ batchId: number; newCount: number; updatedCount: number; exitedCount: number }> {
  const db = getDb();
  const diff = await previewSync(propertyId, rows);
  const now = new Date();
  const todayIso = toIsoDate(now)!;

  const [batch] = await db
    .insert(schema.uploadBatches)
    .values({
      propertyId,
      filename,
      rowCount: rows.length,
      newCount: diff.toInsert.length,
      updatedCount: diff.toUpdate.length,
      exitedCount: diff.toExit.length,
    })
    .returning();

  if (diff.toInsert.length > 0) {
    await db.insert(schema.animals).values(
      diff.toInsert.map((r) => ({
        propertyId,
        nSisbov: r.nSisbov,
        nManejo: r.nManejo,
        sexo: r.sexo,
        raca: r.raca,
        dataNasc: toIsoDate(r.dataNasc),
        dataBrincagem: toIsoDate(r.dataBrincagem),
        dataEnvioSisbov: toIsoDate(r.dataEnvioSisbov),
        dataLibAbate: toIsoDate(r.dataLibAbate),
        status: "ATIVO",
      }))
    );
  }

  for (const u of diff.toUpdate) {
    await db
      .update(schema.animals)
      .set({
        nManejo: u.incoming.nManejo,
        sexo: u.incoming.sexo,
        raca: u.incoming.raca,
        dataNasc: toIsoDate(u.incoming.dataNasc),
        dataBrincagem: toIsoDate(u.incoming.dataBrincagem),
        dataEnvioSisbov: toIsoDate(u.incoming.dataEnvioSisbov),
        dataLibAbate: toIsoDate(u.incoming.dataLibAbate),
        lastSeenAt: now,
        updatedAt: now,
      })
      .where(eq(schema.animals.id, u.existing.id));
  }

  if (diff.toExit.length > 0) {
    const exitIds = diff.toExit.map((a) => a.id);
    await db
      .update(schema.animals)
      .set({ status: "SAIDO", dataSaida: todayIso, updatedAt: now })
      .where(inArray(schema.animals.id, exitIds));
  }

  if (diff.toInsert.length + diff.toUpdate.length > 0) {
    const survivors = rows.map((r) => r.nSisbov);
    if (survivors.length > 0) {
      await db
        .update(schema.animals)
        .set({ lastSeenAt: now })
        .where(and(eq(schema.animals.propertyId, propertyId), inArray(schema.animals.nSisbov, survivors)));
    }
  }

  await db.insert(schema.auditLog).values({
    batchId: batch.id,
    action: "SYNC",
    entityType: "BATCH",
    entityRef: String(batch.id),
    details: JSON.stringify({
      newCount: diff.toInsert.length,
      updatedCount: diff.toUpdate.length,
      exitedCount: diff.toExit.length,
      unchanged: diff.unchanged,
    }),
  });

  return {
    batchId: batch.id,
    newCount: diff.toInsert.length,
    updatedCount: diff.toUpdate.length,
    exitedCount: diff.toExit.length,
  };
}

export async function ensureProperty(slug: string, nome: string, codigo?: string): Promise<number> {
  const db = getDb();
  const existing = await db.select().from(schema.properties).where(eq(schema.properties.slug, slug)).limit(1);
  if (existing.length > 0) return existing[0].id;
  const [created] = await db.insert(schema.properties).values({ slug, nome, codigo }).returning();
  return created.id;
}

export async function getActiveAnimals(propertyId: number) {
  const db = getDb();
  return db
    .select()
    .from(schema.animals)
    .where(and(eq(schema.animals.propertyId, propertyId), eq(schema.animals.status, "ATIVO")))
    .orderBy(sql`${schema.animals.nSisbov} asc`);
}
