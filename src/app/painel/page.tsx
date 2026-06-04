import { getNascenteProperty } from "@/lib/property";
import { getDb, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { UploadCard } from "./upload-card";
import { formatDateBR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const property = await getNascenteProperty();
  const db = getDb();
  const activeCount = (
    await db
      .select({ id: schema.animals.id })
      .from(schema.animals)
      .where(and(eq(schema.animals.propertyId, property.id), eq(schema.animals.status, "ATIVO")))
  ).length;
  const lastBatches = await db
    .select()
    .from(schema.uploadBatches)
    .where(eq(schema.uploadBatches.propertyId, property.id))
    .orderBy(desc(schema.uploadBatches.uploadedAt))
    .limit(5);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href="/" className="text-xl text-muted">← Início</Link>

      <div className="rounded-2xl bg-surface ring-1 ring-white/15 p-6">
        <div className="text-xl text-muted">Animais na fazenda hoje</div>
        <div className="font-mono font-black text-6xl mt-2">{activeCount}</div>
        {lastBatches[0] && (
          <div className="text-lg text-muted mt-2">
            Atualizado em {formatDateBR(new Date(lastBatches[0].uploadedAt))}
          </div>
        )}
      </div>

      <UploadCard />

      <section className="rounded-2xl bg-surface ring-1 ring-white/15 p-6">
        <h2 className="text-2xl font-bold mb-4">Últimos envios</h2>
        {lastBatches.length === 0 ? (
          <p className="text-muted text-lg">Nenhuma planilha enviada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lastBatches.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 flex-wrap text-lg">
                <span className="text-muted">{formatDateBR(new Date(b.uploadedAt))}</span>
                <span className="text-base">
                  <span className="text-accent">+{b.newCount}</span> ·{" "}
                  <span className="text-info">~{b.updatedCount}</span> ·{" "}
                  <span className="text-danger">-{b.exitedCount}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
