import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getNascenteProperty } from "@/lib/property";
import { ageInMonths, daysSinceBrincagem, daysSinceEnvioSisbov, isOver90DaysOnFarm, isReleasedForSale } from "@/lib/cattle";
import { formatDateBR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnimalDetail({ params }: { params: Promise<{ sisbov: string }> }) {
  const { sisbov } = await params;
  const decoded = decodeURIComponent(sisbov);
  const property = await getNascenteProperty();
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.animals)
    .where(and(eq(schema.animals.propertyId, property.id), eq(schema.animals.nSisbov, decoded)))
    .limit(1);
  if (rows.length === 0) notFound();
  const a = rows[0];

  const dn = a.dataNasc ? new Date(a.dataNasc) : null;
  const dbr = a.dataBrincagem ? new Date(a.dataBrincagem) : null;
  const de = a.dataEnvioSisbov ? new Date(a.dataEnvioSisbov) : null;
  const dl = a.dataLibAbate ? new Date(a.dataLibAbate) : null;
  const sale = dbr ? isReleasedForSale(dbr) : false;
  const over90 = de ? isOver90DaysOnFarm(de) : false;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/animais" className="text-lg sm:text-xl text-muted hover:text-ink">← Voltar</Link>

      <header className="flex flex-col gap-3">
        <div className="text-base sm:text-lg text-muted uppercase tracking-wide">SISBOV</div>
        <h1 className="font-mono text-4xl sm:text-6xl font-black tracking-tight break-all">{a.nSisbov}</h1>
        <div className="text-xl sm:text-2xl text-muted">Manejo: <strong className="text-ink">{a.nManejo || "—"}</strong></div>
      </header>

      <div className="flex gap-2 flex-wrap">
        {a.status === "SAIDO" && <span className="px-4 py-2 rounded-full bg-danger/15 text-danger text-lg font-bold">Saiu da fazenda</span>}
        {sale && a.status === "ATIVO" && <span className="px-4 py-2 rounded-full bg-accent/15 text-accent text-lg font-bold">Liberado para venda</span>}
        {over90 && a.status === "ATIVO" && <span className="px-4 py-2 rounded-full bg-info/15 text-info text-lg font-bold">+90 dias na fazenda</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card label="Sexo" value={a.sexo || "—"} />
        <Card label="Raça" value={a.raca || "—"} />
        <Card label="Data nascimento" value={formatDateBR(dn)} sub={dn ? `${ageInMonths(dn)} meses` : undefined} />
        <Card label="Data brincagem" value={formatDateBR(dbr)} sub={dbr ? `${daysSinceBrincagem(dbr)} dias atrás` : undefined} />
        <Card label="Data envio SISBOV" value={formatDateBR(de)} sub={de ? `${daysSinceEnvioSisbov(de)} dias atrás` : undefined} />
        <Card label="Data liberação abate" value={formatDateBR(dl)} />
      </div>
    </div>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface ring-1 ring-white/15 p-5 sm:p-6">
      <div className="text-base sm:text-lg text-muted">{label}</div>
      <div className="text-2xl sm:text-4xl font-bold mt-2">{value}</div>
      {sub && <div className="text-base sm:text-lg text-muted mt-1">{sub}</div>}
    </div>
  );
}
