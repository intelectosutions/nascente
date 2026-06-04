import { getNascenteProperty } from "@/lib/property";
import { getActiveAnimals } from "@/lib/sync";
import { AGE_BUCKETS, ageBucket, ageInMonths, daysSinceBrincagem, daysSinceEnvioSisbov, isOver90DaysOnFarm, isReleasedForSale, type AgeBucketKey } from "@/lib/cattle";
import { formatDateBR } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; bucket?: string; page?: string };

const PAGE_SIZE = 50;

export default async function AnimaisPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const property = await getNascenteProperty();
  const rows = await getActiveAnimals(property.id);

  const q = (sp.q || "").trim().toLowerCase();
  const bucket = sp.bucket as AgeBucketKey | undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const filtered = rows.filter((a) => {
    if (q && !a.nSisbov.toLowerCase().includes(q) && !(a.nManejo || "").toLowerCase().includes(q)) return false;
    if (bucket && a.dataNasc) {
      const b = ageBucket(new Date(a.dataNasc));
      if (b !== bucket) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href="/" className="text-xl text-muted">← Início</Link>
      <h1 className="text-3xl sm:text-4xl font-bold">Animais</h1>

      <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por SISBOV ou manejo…"
          className="flex-1 px-5 py-4 rounded-xl bg-surface ring-1 ring-white/20 text-xl placeholder:text-muted/60 focus:ring-accent outline-none"
        />
        <select
          name="bucket"
          defaultValue={bucket || ""}
          className="px-5 py-4 rounded-xl bg-surface ring-1 ring-white/20 text-xl outline-none focus:ring-accent"
        >
          <option value="">Todas as idades</option>
          {AGE_BUCKETS.map((b) => (
            <option key={b.key} value={b.key}>{b.label}</option>
          ))}
        </select>
        <button className="px-6 py-4 rounded-xl bg-accent text-black font-bold text-xl">Filtrar</button>
      </form>

      <div className="text-lg sm:text-xl text-muted">
        Mostrando {slice.length} de {filtered.length} {filtered.length === 1 ? "animal" : "animais"}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {slice.map((a) => {
          const dn = a.dataNasc ? new Date(a.dataNasc) : null;
          const db = a.dataBrincagem ? new Date(a.dataBrincagem) : null;
          const de = a.dataEnvioSisbov ? new Date(a.dataEnvioSisbov) : null;
          const sale = db ? isReleasedForSale(db) : false;
          const over90 = de ? isOver90DaysOnFarm(de) : false;
          return (
            <Link
              key={a.id}
              href={`/animais/${encodeURIComponent(a.nSisbov)}`}
              className="block rounded-xl bg-surface ring-1 ring-white/15 hover:ring-accent/60 p-5 sm:p-6 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight">{a.nSisbov}</div>
                  <div className="text-base sm:text-lg text-muted mt-1">
                    Manejo {a.nManejo || "—"} · {dn ? `${ageInMonths(dn)} meses` : "idade ?"}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sale && <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-base font-bold">Liberado venda</span>}
                  {over90 && <span className="px-3 py-1 rounded-full bg-info/15 text-info text-base font-bold">+90 dias</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={{ pathname: "/animais", query: { ...(q ? { q } : {}), ...(bucket ? { bucket } : {}), page: p } }}
              className={`px-5 py-3 rounded-lg text-xl font-bold ${p === safePage ? "bg-accent text-black" : "bg-surface ring-1 ring-white/20 hover:bg-white/5"}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
