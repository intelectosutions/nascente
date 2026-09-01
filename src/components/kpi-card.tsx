import { cn, formatNumber } from "@/lib/utils";

type Tone = "default" | "accent" | "warn" | "info" | "restricao" | "fem";

const STYLES: Record<Tone, { ring: string; glow: string; num: string; numGlow: string }> = {
  default: { ring: "ring-ink/10", glow: "shadow-[0_16px_50px_-24px_rgba(24,48,32,0.24)]", num: "text-ink", numGlow: "0 0 38px rgba(22,128,61,0.10)" },
  accent: { ring: "ring-accent/30", glow: "shadow-[0_18px_55px_-22px_rgba(34,197,94,0.45)]", num: "text-accent", numGlow: "0 0 46px rgba(34,197,94,0.40)" },
  warn: { ring: "ring-warn/30", glow: "shadow-[0_18px_55px_-22px_rgba(234,179,8,0.42)]", num: "text-warn", numGlow: "0 0 46px rgba(234,179,8,0.38)" },
  info: { ring: "ring-info/30", glow: "shadow-[0_18px_55px_-22px_rgba(59,130,246,0.45)]", num: "text-info", numGlow: "0 0 46px rgba(59,130,246,0.40)" },
  restricao: { ring: "ring-danger/35", glow: "shadow-[0_18px_55px_-22px_rgba(194,65,59,0.34)]", num: "text-danger", numGlow: "0 0 46px rgba(194,65,59,0.32)" },
  fem: { ring: "ring-pink-500/35", glow: "shadow-[0_18px_55px_-22px_rgba(219,39,119,0.28)]", num: "text-pink-600", numGlow: "0 0 46px rgba(219,39,119,0.26)" },
};

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
  const s = STYLES[tone];
  return (
    <div
      className={cn(
        "relative rounded-[28px] px-6 py-8 sm:px-8 sm:py-9 ring-1 flex flex-col items-center text-center gap-2.5 overflow-hidden",
        "bg-gradient-to-b from-white to-surface/80 backdrop-blur-sm",
        s.ring,
        s.glow
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
      <div className="text-2xl sm:text-3xl font-semibold text-muted tracking-tight">{label}</div>
      <div
        className={cn("tnum font-black leading-none tracking-tighter", s.num)}
        style={{ fontSize: "clamp(5rem, 26vw, 9rem)", textShadow: s.numGlow }}
      >
        {formatNumber(value)}
      </div>
      {hint && <div className="text-lg sm:text-xl text-muted">{hint}</div>}
    </div>
  );
}
