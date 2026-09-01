"use client";

import { useEffect, useState } from "react";

const SCALES = [1, 1.25, 1.5];
const LABELS = ["A", "A+", "A++"];
const KEY = "nascente_font_scale";

export function FontSizeToggle() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const n = saved ? Number(saved) : 0;
    const safe = Number.isInteger(n) && n >= 0 && n < SCALES.length ? n : 0;
    setIdx(safe);
    document.documentElement.style.setProperty("--font-scale", String(SCALES[safe]));
  }, []);

  function bump() {
    const next = (idx + 1) % SCALES.length;
    setIdx(next);
    localStorage.setItem(KEY, String(next));
    document.documentElement.style.setProperty("--font-scale", String(SCALES[next]));
  }

  return (
    <button
      onClick={bump}
      aria-label="Aumentar fonte"
      className="px-4 py-2 rounded-lg border border-white/20 bg-surface text-ink text-lg font-bold hover:bg-white/10 transition"
    >
      {LABELS[idx]}
    </button>
  );
}
