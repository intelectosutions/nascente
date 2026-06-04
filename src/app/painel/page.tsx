import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getNascenteProperty } from "@/lib/property";
import { getDb, schema } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { UploadCard } from "./upload-card";
import { logout } from "./actions";
import { formatDateBR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  if (!(await isAuthenticated())) redirect("/painel/login");
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
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl sm:text-4xl font-bold">Painel</h1>
        <form action={logout}>
          <button className="px-5 py-3 rounded-xl bg-surface ring-1 ring-white/20 hover:bg-white/5 text-lg">Sair</button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-surface ring-1 ring-white/15 p-6">
          <div className="text-lg text-muted">Animais ativos hoje</div>
          <div className="font-mono font-black text-6xl mt-2">{activeCount}</div>
        </div>
        <div className="rounded-xl bg-surface ring-1 ring-white/15 p-6">
          <div className="text-lg text-muted">Última atualização</div>
          <div className="text-2xl font-bold mt-2">
            {lastBatches[0] ? formatDateBR(new Date(lastBatches[0].uploadedAt)) : "—"}
          </div>
        </div>
      </div>

      <UploadCard />

      <section className="rounded-xl bg-surface ring-1 ring-white/15 p-6">
        <h2 className="text-2xl font-bold mb-4">Últimas atualizações</h2>
        {lastBatches.length === 0 ? (
          <p className="text-muted text-lg">Nenhuma planilha enviada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {lastBatches.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 flex-wrap text-lg">
                <span className="text-muted">{formatDateBR(new Date(b.uploadedAt))}</span>
                <span className="font-mono truncate max-w-xs">{b.filename || "—"}</span>
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
