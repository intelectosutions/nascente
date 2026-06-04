import { cn, formatNumber } from "@/lib/utils";
import { ReactNode } from "react";

type Tone = "default" | "accent" | "warn" | "info";

export function KpiCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: Tone;
  icon?: ReactNode;
}) {
  const toneRing = {
    default: "ring-white/15",
    accent: "ring-accent/40 bg-accent/5",
    warn: "ring-warn/40 bg-warn/5",
    info: "ring-info/40 bg-info/5",
  }[tone];

  const toneText = {
    default: "text-ink",
    accent: "text-accent",
    warn: "text-warn",
    info: "text-info",
  }[tone];

  return (
    <div className={cn("rounded-2xl p-6 sm:p-8 ring-1 bg-surface flex flex-col gap-3", toneRing)}>
      <div className="flex items-center gap-3 text-xl sm:text-2xl font-semibold text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className={cn("font-mono font-black leading-none tracking-tighter", toneText)} style={{ fontSize: "clamp(4rem, 14vw, 8rem)" }}>
        {formatNumber(value)}
      </div>
      {hint && <div className="text-base sm:text-lg text-muted">{hint}</div>}
    </div>
  );
}

export function MiniKpi({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-xl ring-1 ring-white/15 bg-surface p-5 sm:p-6 flex flex-col gap-2">
      <div className="text-lg sm:text-xl text-muted font-semibold">{label}</div>
      <div className="font-mono font-black leading-none tracking-tighter" style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}>
        {formatNumber(value)}
      </div>
      {sub && <div className="text-sm sm:text-base text-muted">{sub}</div>}
    </div>
  );
}
