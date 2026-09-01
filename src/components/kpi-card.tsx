import { cn, formatNumber } from "@/lib/utils";

type Tone = "default" | "accent" | "warn" | "info" | "restricao" | "fem";

const STYLES: Record<Tone, { ring: string; glow: string; num: string; numGlow: string }> = {
  default: { ring: "ring-white/10", glow: "shadow-[0_16px_50px_-24px_rgba(0,0,0,0.9)]", num: "text-white", numGlow: "0 0 38px rgba(255,255,255,0.10)" },
  accent: { ring: "ring-accent/30", glow: "shadow-[0_18px_55px_-22px_rgba(34,197,94,0.45)]", num: "text-accent", numGlow: "0 0 46px rgba(34,197,94,0.40)" },
  warn: { ring: "ring-warn/30", glow: "shadow-[0_18px_55px_-22px_rgba(234,179,8,0.42)]", num: "text-warn", numGlow: "0 0 46px rgba(234,179,8,0.38)" },
  info: { ring: "ring-info/30", glow: "shadow-[0_18px_55px_-22px_rgba(59,130,246,0.45)]", num: "text-info", numGlow: "0 0 46px rgba(59,130,246,0.40)" },
  restricao: { ring: "ring-red-400/35", glow: "shadow-[0_18px_55px_-22px_rgba(239,68,68,0.48)]", num: "text-red-300", numGlow: "0 0 46px rgba(239,68,68,0.42)" },
  fem: { ring: "ring-pink-400/35", glow: "shadow-[0_18px_55px_-22px_rgba(244,114,182,0.45)]", num: "text-pink-300", numGlow: "0 0 46px rgba(244,114,182,0.40)" },
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
        "bg-gradient-to-b from-white/[0.07] to-white/[0.015] backdrop-blur-sm",
        s.ring,
        s.glow
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
