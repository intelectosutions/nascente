import { cn, formatNumber } from "@/lib/utils";

type Tone = "default" | "accent" | "warn" | "info" | "restricao" | "fem";

export function BigCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: Tone;
}) {
  const ring = {
    default: "ring-white/15",
    accent: "ring-accent/40 bg-accent/5",
    warn: "ring-warn/40 bg-warn/5",
    info: "ring-info/40 bg-info/5",
    restricao: "ring-red-400/40 bg-red-500/5",
    fem: "ring-pink-400/40 bg-pink-500/5",
  }[tone];

  const numColor = {
    default: "text-ink",
    accent: "text-accent",
    warn: "text-warn",
    info: "text-info",
    restricao: "text-red-300",
    fem: "text-pink-300",
  }[tone];

  return (
    <div className={cn("rounded-3xl px-6 py-7 sm:px-8 sm:py-8 ring-1 bg-surface flex flex-col items-center text-center gap-2", ring)}>
      <div className="text-2xl sm:text-3xl font-bold text-muted">{label}</div>
      <div
        className={cn("font-mono font-black leading-none tracking-tighter", numColor)}
        style={{ fontSize: "clamp(5rem, 26vw, 9rem)" }}
      >
        {formatNumber(value)}
      </div>
      {hint && <div className="text-lg sm:text-xl text-muted">{hint}</div>}
    </div>
  );
}
