import { BigCard } from "@/components/kpi-card";
import { getNascenteProperty } from "@/lib/property";
import { getActiveAnimals } from "@/lib/sync";
import { getDb, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { computeStats, type Animal } from "@/lib/cattle";
import { formatDateBR } from "@/lib/utils";
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

export default async function Page() {
  const property = await getNascenteProperty();
  const rows = await getActiveAnimals(property.id);
  const animals = rows.map(toAnimal).filter((a): a is Animal => a !== null);
  const stats = computeStats(animals);

  const db = getDb();
  const lastBatch = (
    await db
      .select()
      .from(schema.uploadBatches)
      .where(eq(schema.uploadBatches.propertyId, property.id))
      .orderBy(desc(schema.uploadBatches.uploadedAt))
      .limit(1)
  )[0];

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <h1 className="text-4xl font-bold">Sem dados ainda</h1>
        <p className="text-2xl text-muted">Envie a planilha para ver os números.</p>
        <Link href="/painel" className="px-8 py-5 rounded-2xl bg-accent text-black font-bold text-2xl">
          Enviar planilha
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-12">
      {lastBatch && (
        <p className="text-center text-xl text-muted pt-1">
          Atualizado em {formatDateBR(new Date(lastBatch.uploadedAt))}
        </p>
      )}

      <BigCard label="Total na fazenda" value={stats.total} hint="Animais na fazenda hoje" />
      <BigCard label="Liberados para venda" value={stats.releasedForSale} tone="accent" hint="Mais de 52 dias desde a brincagem" />
      <BigCard label="Mais de 90 dias na fazenda" value={stats.over90Days} tone="info" hint="Contados do envio do SISBOV" />

      <h2 className="text-2xl font-bold text-muted mt-4 px-2">Por idade</h2>
      <BigCard label="0 a 12 meses" value={stats.byAge["0-12"]} />
      <BigCard label="13 a 24 meses" value={stats.byAge["13-24"]} />
      <BigCard label="25 a 36 meses" value={stats.byAge["25-36"]} />
      <BigCard label="Mais de 36 meses" value={stats.byAge["37+"]} />

      <div className="flex flex-col gap-3 mt-6">
        <Link
          href="/animais"
          className="block text-center px-6 py-5 rounded-2xl bg-surface ring-1 ring-white/20 text-2xl font-bold"
        >
          Ver todos os animais
        </Link>
        <Link
          href="/painel"
          className="block text-center px-6 py-5 rounded-2xl bg-surface ring-1 ring-white/20 text-2xl font-bold"
        >
          Enviar planilha
        </Link>
      </div>
    </div>
  );
}
