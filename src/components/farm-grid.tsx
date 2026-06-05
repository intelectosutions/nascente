import Link from "next/link";
import { FARMS } from "@/lib/farms";

export function FarmGrid({ basePath, title, subtitle }: { basePath: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-5 pb-12">
      <div className="pt-2 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
        {subtitle && <p className="text-xl text-muted mt-2">{subtitle}</p>}
      </div>
      {FARMS.map((f) => (
        <Link
          key={f.slug}
          href={`${basePath}/${f.slug}`}
          className={`block rounded-3xl px-6 py-9 text-center font-black active:scale-[0.98] transition ${
            f.restricao ? "bg-red-200 text-red-900" : "bg-white text-black"
          }`}
          style={{ fontSize: "clamp(2.25rem, 10vw, 3.5rem)" }}
        >
          {f.nome}
          {f.restricao && <span className="block text-xl sm:text-2xl font-bold mt-1">⚠ com restrição</span>}
        </Link>
      ))}
    </div>
  );
}
