import { and, eq, or, ilike } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getPropertyBySlug } from "@/lib/property";
import { getFarm } from "@/lib/farms";
import {
  ageInMonths,
  daysSinceBrincagem,
  daysSinceEnvioSisbov,
  isOver90DaysOnFarm,
  isReleasedForSale,
} from "@/lib/cattle";
import { formatDateBR } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Row = typeof schema.animals.$inferSelect;

export default async function BuscarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { slug } = await params;
  const farm = getFarm(slug);
  if (!farm) notFound();
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const property = await getPropertyBySlug(slug);
  const db = getDb();

  let result: Row | null = null;
  let multiple: Row[] = [];

  if (q && property) {
    const exact = await db
      .select()
      .from(schema.animals)
      .where(
        and(
          eq(schema.animals.propertyId, property.id),
          eq(schema.animals.status, "ATIVO"),
          or(eq(schema.animals.nSisbov, q), eq(schema.animals.nManejo, q))
        )
      )
      .limit(20);

    let found = exact;
    if (found.length === 0) {
      found = await db
        .select()
        .from(schema.animals)
        .where(
          and(
            eq(schema.animals.propertyId, property.id),
            eq(schema.animals.status, "ATIVO"),
            or(ilike(schema.animals.nSisbov, `%${q}%`), ilike(schema.animals.nManejo, `%${q}%`))
          )
        )
        .limit(20);
    }
    if (found.length === 1) result = found[0];
    else if (found.length > 1) multiple = found;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Link href={`/f/${slug}`} className="text-xl text-muted">← {farm.nome}</Link>
      <h1 className="text-3xl sm:text-4xl font-bold">Pesquisar animal</h1>

      <form className="flex flex-col gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Número do SISBOV ou do manejo"
          className="w-full px-6 py-6 rounded-2xl bg-surface ring-1 ring-white/20 text-2xl placeholder:text-muted/60 focus:ring-accent outline-none"
        />
        <button className="px-6 py-6 rounded-2xl bg-accent text-black font-bold text-2xl">Pesquisar</button>
      </form>

      {q && result && <AnimalDetail a={result} />}
      {q && !result && multiple.length > 1 && <MultiList items={multiple} slug={slug} />}
      {q && !result && multiple.length === 0 && <MortoCard q={q} />}
    </div>
  );
}

function AnimalDetail({ a }: { a: Row }) {
  const dn = a.dataNasc ? new Date(a.dataNasc) : null;
  const dbr = a.dataBrincagem ? new Date(a.dataBrincagem) : null;
  const de = a.dataEnvioSisbov ? new Date(a.dataEnvioSisbov) : null;
  const dl = a.dataLibAbate ? new Date(a.dataLibAbate) : null;
  const sale = dbr ? isReleasedForSale(dbr) : false;
  const over90 = de ? isOver90DaysOnFarm(de) : false;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl ring-2 ring-accent/60 bg-accent/10 p-7 text-center flex flex-col gap-2">
        <div className="text-2xl text-muted">Está na fazenda</div>
        <div className="text-accent font-black" style={{ fontSize: "clamp(2.5rem, 12vw, 4.5rem)" }}>VIVO</div>
      </div>

      <Field label="SISBOV" value={a.nSisbov} mono big />
      <Field label="Manejo" value={a.nManejo || "—"} mono />
      <Field label="Idade" value={dn ? `${ageInMonths(dn)} meses` : "—"} sub={dn ? `Nasceu em ${formatDateBR(dn)}` : undefined} />

      {sale ? <Tag tone="accent">Liberado para venda</Tag> : <Tag tone="muted">Ainda não liberado para venda</Tag>}
      {dbr && <p className="text-lg text-muted px-2 -mt-2">{daysSinceBrincagem(dbr)} dias desde a brincagem (precisa de 52)</p>}

      {over90 ? <Tag tone="info">Mais de 90 dias na fazenda</Tag> : <Tag tone="muted">Menos de 90 dias na fazenda</Tag>}
      {de && <p className="text-lg text-muted px-2 -mt-2">{daysSinceEnvioSisbov(de)} dias desde o envio do SISBOV</p>}

      <Field label="Data brincagem" value={formatDateBR(dbr)} />
      <Field label="Data envio SISBOV" value={formatDateBR(de)} />
      <Field label="Data liberação abate" value={formatDateBR(dl)} />
    </div>
  );
}

function MortoCard({ q }: { q: string }) {
  return (
    <div className="rounded-3xl ring-2 ring-danger/60 bg-danger/10 p-8 text-center flex flex-col gap-3">
      <div className="text-2xl text-muted">Animal {q}</div>
      <div className="text-danger font-black" style={{ fontSize: "clamp(3.5rem, 20vw, 7rem)" }}>MORTO</div>
      <div className="text-xl text-muted">Não está na fazenda</div>
    </div>
  );
}

function MultiList({ items, slug }: { items: Row[]; slug: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xl text-muted">{items.length} animais encontrados. Escolha um:</p>
      {items.map((a) => (
        <Link key={a.id} href={`/f/${slug}/buscar?q=${encodeURIComponent(a.nSisbov)}`} className="block rounded-2xl bg-surface ring-1 ring-white/15 p-5">
          <div className="text-2xl font-mono font-bold">{a.nSisbov}</div>
          <div className="text-lg text-muted">Manejo {a.nManejo || "—"}</div>
        </Link>
      ))}
    </div>
  );
}

function Field({ label, value, sub, mono, big }: { label: string; value: string; sub?: string; mono?: boolean; big?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface ring-1 ring-white/15 p-5 sm:p-6">
      <div className="text-lg sm:text-xl text-muted">{label}</div>
      <div className={`mt-1 font-bold ${mono ? "font-mono" : ""} break-all`} style={{ fontSize: big ? "clamp(2rem, 9vw, 3.5rem)" : "clamp(1.5rem, 5vw, 2.25rem)" }}>
        {value}
      </div>
      {sub && <div className="text-base sm:text-lg text-muted mt-1">{sub}</div>}
    </div>
  );
}

function Tag({ tone, children }: { tone: "accent" | "info" | "muted"; children: React.ReactNode }) {
  const cls = {
    accent: "bg-accent/15 text-accent ring-accent/40",
    info: "bg-info/15 text-info ring-info/40",
    muted: "bg-white/5 text-muted ring-white/20",
  }[tone];
  return <div className={`rounded-2xl ring-1 px-5 py-4 text-xl sm:text-2xl font-bold text-center ${cls}`}>{children}</div>;
}
