import { KpiCard, MiniKpi } from "@/components/kpi-card";
import { getNascenteProperty } from "@/lib/property";
import { getActiveAnimals } from "@/lib/sync";
import { AGE_BUCKETS, computeStats, type Animal } from "@/lib/cattle";
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

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">Sem dados ainda</h1>
        <p className="text-xl sm:text-2xl text-muted max-w-2xl">
          Nenhuma planilha foi importada. Quando o Gonzaga enviar a próxima planilha, os números aparecem aqui.
        </p>
        <Link
          href="/painel"
          className="inline-flex items-center px-8 py-4 rounded-xl bg-accent text-black font-bold text-xl hover:bg-accent/90 transition"
        >
          Abrir painel
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KpiCard label="Total na fazenda" value={stats.total} hint="Animais ativos hoje" />
        <KpiCard
          label="Liberados para venda"
          value={stats.releasedForSale}
          tone="accent"
          hint="Mais de 52 dias desde a brincagem"
        />
        <KpiCard
          label="Mais de 90 dias na fazenda"
          value={stats.over90Days}
          tone="info"
          hint="Contados a partir do envio do SISBOV"
        />
        <KpiCard
          label="Atualizado em"
          value={stats.total > 0 ? new Date().getDate() : 0}
          tone="default"
          hint={formatDateBR(stats.generatedAt) + " — hoje"}
        />
      </div>

      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Faixa etária</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {AGE_BUCKETS.map((b) => (
            <MiniKpi key={b.key} label={b.label} value={stats.byAge[b.key]} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-4 mt-4">
        <Link
          href="/animais"
          className="inline-flex items-center px-6 py-4 rounded-xl bg-surface ring-1 ring-white/20 text-xl font-semibold hover:bg-white/5 transition"
        >
          Ver lista de animais
        </Link>
        <Link
          href="/painel"
          className="inline-flex items-center px-6 py-4 rounded-xl bg-surface ring-1 ring-white/20 text-xl font-semibold hover:bg-white/5 transition"
        >
          Painel do produtor
        </Link>
      </div>
    </div>
  );
}
