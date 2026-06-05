import { BigCard } from "@/components/kpi-card";
import { getPropertyBySlug } from "@/lib/property";
import { getFarm } from "@/lib/farms";
import { getActiveAnimals } from "@/lib/sync";
import { getBalanceByPropertyId, balanceTotals } from "@/lib/balance";
import { getDb, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { computeStats, type Animal } from "@/lib/cattle";
import { formatDateBR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toAnimal(row: {
  nSisbov: string;
  nManejo: string | null;
  dataNasc: string | null;
  dataBrincagem: string | null;
  dataEnvioSisbov: string | null;
  dataLibAbate: string | null;
  sexo: string | null;
  raca: string | null;
}): Animal | null {
  if (!row.dataNasc || !row.dataBrincagem || !row.dataEnvioSisbov || !row.dataLibAbate) return null;
  return {
    nSisbov: row.nSisbov,
    nManejo: row.nManejo ?? "",
    dataNasc: new Date(row.dataNasc),
    dataBrincagem: new Date(row.dataBrincagem),
    dataEnvioSisbov: new Date(row.dataEnvioSisbov),
    dataLibAbate: new Date(row.dataLibAbate),
    sexo: row.sexo ?? "",
    raca: row.raca ?? "",
  };
}

export default async function FarmDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const farm = getFarm(slug);
  if (!farm) notFound();

  const property = await getPropertyBySlug(slug);
  const rows = property ? await getActiveAnimals(property.id) : [];
  const balance = property ? await getBalanceByPropertyId(property.id) : null;
  const restricao = !!farm.restricao;
  const tone = restricao ? "restricao" : "default";

  const header = (
    <div className="flex flex-col items-center text-center gap-3">
      <Link href="/" className="self-start text-xl text-muted hover:text-ink transition">← Fazendas</Link>
      <h1 className={`text-4xl sm:text-5xl font-black tracking-tight mt-1 ${restricao ? "text-red-300" : ""}`}>{farm.nome}</h1>
      {restricao && (
        <div className="rounded-full bg-red-500/15 ring-1 ring-red-400/50 px-6 py-3 shadow-[0_10px_30px_-12px_rgba(239,68,68,0.5)]">
          <span className="text-xl sm:text-2xl font-bold text-red-300">⚠ Fazenda com restrição</span>
        </div>
      )}
    </div>
  );

  const primaryBtn =
    "block text-center px-6 py-6 rounded-[22px] bg-gradient-to-br from-accent to-green-600 text-black text-2xl font-bold shadow-[0_16px_45px_-18px_rgba(34,197,94,0.6)] active:scale-[0.98] transition";
  const secondaryBtn =
    "block text-center px-6 py-5 rounded-[22px] bg-white/5 ring-1 ring-white/15 text-2xl font-bold backdrop-blur-sm hover:bg-white/10 active:scale-[0.98] transition";

  // MODO LISTA: animais individuais (SISBOV + datas)
  if (rows.length > 0) {
    const animals = rows.map(toAnimal).filter((a): a is Animal => a !== null);
    const stats = computeStats(animals);
    const db = getDb();
    const lastBatch = property
      ? (
          await db
            .select()
            .from(schema.uploadBatches)
            .where(eq(schema.uploadBatches.propertyId, property.id))
            .orderBy(desc(schema.uploadBatches.uploadedAt))
            .limit(1)
        )[0]
      : undefined;

    return (
      <div className="flex flex-col gap-5 pb-12">
        {header}
        {lastBatch && <p className="text-center text-xl text-muted">Atualizado em {formatDateBR(new Date(lastBatch.uploadedAt))}</p>}
        <BigCard label="Total na fazenda" value={stats.total} tone={tone} hint="Animais na fazenda hoje" />
        <BigCard label="Liberados para venda" value={stats.releasedForSale} tone={restricao ? "restricao" : "accent"} hint="Mais de 52 dias desde a brincagem" />
        <BigCard label="Mais de 90 dias na fazenda" value={stats.over90Days} tone={restricao ? "restricao" : "info"} hint="Contados do envio do SISBOV" />
        <h2 className="text-2xl font-bold text-muted mt-4 text-center">Por idade</h2>
        <BigCard label="0 a 12 meses" value={stats.byAge["0-12"]} tone={tone} />
        <BigCard label="13 a 24 meses" value={stats.byAge["13-24"]} tone={tone} />
        <BigCard label="25 a 36 meses" value={stats.byAge["25-36"]} tone={tone} />
        <BigCard label="Mais de 36 meses" value={stats.byAge["37+"]} tone={tone} />
        <div className="flex flex-col gap-3 mt-6">
          <Link href={`/f/${slug}/buscar`} className={primaryBtn}>Pesquisar animal</Link>
          <Link href={`/painel/${slug}`} className={secondaryBtn}>Enviar planilha</Link>
        </div>
      </div>
    );
  }

  // MODO SALDO: totais por faixa (com M/F quando houver fêmeas)
  if (balance) {
    const t = balanceTotals(balance);
    const f = t.hasFemales;
    const ageHint = (b: { m: number; f: number }) => (f ? `M ${b.m} · F ${b.f}` : undefined);

    return (
      <div className="flex flex-col gap-5 pb-12">
        {header}
        <p className="text-center text-xl text-muted">Atualizado em {formatDateBR(new Date(balance.updatedAt))}</p>
        <BigCard label="Total na fazenda" value={t.total} tone={tone} hint="Saldo do rebanho" />
        {f && (
          <div className="grid grid-cols-2 gap-4">
            <BigCard label="Machos" value={t.totalM} tone="info" />
            <BigCard label="Fêmeas" value={t.totalF} tone="fem" />
          </div>
        )}
        <h2 className="text-2xl font-bold text-muted mt-4 text-center">Por idade</h2>
        <BigCard label="0 a 12 meses" value={t.b0_12.t} tone={tone} hint={ageHint(t.b0_12)} />
        <BigCard label="13 a 24 meses" value={t.b13_24.t} tone={tone} hint={ageHint(t.b13_24)} />
        <BigCard label="25 a 36 meses" value={t.b25_36.t} tone={tone} hint={ageHint(t.b25_36)} />
        <BigCard label="Mais de 36 meses" value={t.b37.t} tone={tone} hint={ageHint(t.b37)} />
        <div className="flex flex-col gap-3 mt-6">
          <Link href={`/painel/${slug}`} className={secondaryBtn}>Atualizar saldo</Link>
        </div>
      </div>
    );
  }

  // VAZIO
  return (
    <div className="flex flex-col gap-6 pb-12">
      {header}
      <div className="rounded-3xl ring-1 ring-white/15 bg-surface p-8 text-center flex flex-col gap-4 mt-4">
        <div className="text-3xl font-bold">Sem dados ainda</div>
        <p className="text-xl text-muted">Esta fazenda ainda não tem saldo informado.</p>
        <Link href={`/painel/${slug}`} className="px-8 py-5 rounded-2xl bg-accent text-black font-bold text-2xl">
          Informar saldo
        </Link>
      </div>
    </div>
  );
}
