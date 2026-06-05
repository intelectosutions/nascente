"use client";

import { useState, useTransition } from "react";
import { saveBalanceAction, type SaveBalanceResult } from "./actions";
import { AGE_BANDS } from "@/lib/farms";

type Values = Record<string, number>;

export function BalanceForm({ slug, initial }: { slug: string; initial: Values }) {
  const [vals, setVals] = useState<Values>(initial);
  const [result, setResult] = useState<SaveBalanceResult | null>(null);
  const [pending, startTransition] = useTransition();

  const total = AGE_BANDS.reduce((a, b) => a + (vals[b.key] || 0), 0);

  function set(key: string, raw: string) {
    const n = Number(raw.replace(/\D/g, ""));
    setVals((v) => ({ ...v, [key]: Number.isFinite(n) ? n : 0 }));
  }

  function save() {
    const fd = new FormData();
    fd.set("slug", slug);
    AGE_BANDS.forEach((b) => fd.set(b.key, String(vals[b.key] || 0)));
    startTransition(async () => {
      const r = await saveBalanceAction(fd);
      setResult(r);
    });
  }

  return (
    <section className="rounded-2xl bg-surface ring-1 ring-white/15 p-6 flex flex-col gap-5">
      <h2 className="text-2xl font-bold">Saldo do rebanho</h2>
      <p className="text-lg text-muted -mt-3">Quantos animais em cada faixa de idade (copie do seu sistema).</p>

      <div className="flex flex-col gap-4">
        {AGE_BANDS.map((b) => (
          <label key={b.key} className="flex items-center justify-between gap-4">
            <span className="text-xl sm:text-2xl">{b.label}</span>
            <input
              inputMode="numeric"
              value={vals[b.key] ? String(vals[b.key]) : ""}
              onChange={(e) => set(b.key, e.target.value)}
              placeholder="0"
              className="w-28 sm:w-36 px-4 py-4 rounded-xl bg-bg ring-1 ring-white/20 text-3xl font-mono font-bold text-center outline-none focus:ring-accent"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-2xl font-bold">Total</span>
        <span className="text-4xl font-mono font-black text-accent">{total}</span>
      </div>

      <button onClick={save} disabled={pending} className="px-6 py-5 rounded-2xl bg-accent text-black font-bold text-2xl disabled:opacity-50">
        {pending ? "Salvando…" : "Salvar saldo"}
      </button>

      {result && (
        <div className={`rounded-xl p-5 ring-1 text-xl font-bold ${result.ok ? "ring-accent/40 bg-accent/5 text-accent" : "ring-danger/40 bg-danger/5 text-danger"}`}>
          {result.message}
        </div>
      )}
    </section>
  );
}
