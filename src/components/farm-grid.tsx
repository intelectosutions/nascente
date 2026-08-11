import Link from "next/link";
import { FARMS, restricaoInfo } from "@/lib/farms";

export function FarmGrid({ basePath, title, subtitle }: { basePath: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-4 pb-12">
      <div className="pt-3 pb-1 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xl text-muted mt-2">{subtitle}</p>}
      </div>
      {FARMS.map((f) => {
        const restricao = restricaoInfo(f);
        return (
          <Link
            key={f.slug}
            href={`${basePath}/${f.slug}`}
            className={`relative block rounded-[28px] px-7 py-9 text-center font-black tracking-tight transition active:scale-[0.98] ring-1 ${
              restricao
                ? "bg-gradient-to-br from-red-200 to-red-300 text-red-900 ring-red-400/40 shadow-[0_18px_50px_-20px_rgba(239,68,68,0.55)]"
                : "bg-gradient-to-br from-white to-zinc-200 text-zinc-900 ring-black/5 shadow-[0_16px_45px_-20px_rgba(0,0,0,0.85)]"
            }`}
            style={{ fontSize: "clamp(2.25rem, 10vw, 3.5rem)" }}
          >
            {f.nome}
            {restricao && (
              <>
                <span className="block text-xl sm:text-2xl font-bold mt-1">⚠ com restrição</span>
                <span className="block text-lg sm:text-xl font-semibold text-red-900/80">noventena até {restricao.ateBR}</span>
              </>
            )}
            <span
              className={`absolute right-6 top-1/2 -translate-y-1/2 text-4xl font-normal ${
                restricao ? "text-red-900/30" : "text-black/20"
              }`}
            >
              ›
            </span>
          </Link>
        );
      })}
    </div>
  );
}
