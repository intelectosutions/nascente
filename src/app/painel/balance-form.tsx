"use client";

import { useState, useTransition } from "react";
import { saveBalanceAction, type SaveBalanceResult } from "./actions";
import { AGE_BANDS } from "@/lib/farms";

type Values = Record<string, number>;

export function BalanceForm({ slug, initial }: { slug: string; initial: Values }) {
  const [vals, setVals] = useState<Values>(initial);
  const [result, setResult] = useState<SaveBalanceResult | null>(null);
  const [pending, startTransition] = useTransition();

  const totalM = AGE_BANDS.reduce((a, b) => a + (vals[`m${b.key}`] || 0), 0);
  const totalF = AGE_BANDS.reduce((a, b) => a + (vals[`f${b.key}`] || 0), 0);
  const total = totalM + totalF;

  function set(key: string, raw: string) {
    const n = Number(raw.replace(/\D/g, ""));
    setVals((v) => ({ ...v, [key]: Number.isFinite(n) ? n : 0 }));
  }

  function save() {
    const fd = new FormData();
    fd.set("slug", slug);
    AGE_BANDS.forEach((b) => {
      fd.set(`m${b.key}`, String(vals[`m${b.key}`] || 0));
      fd.set(`f${b.key}`, String(vals[`f${b.key}`] || 0));
    });
    startTransition(async () => {
      const r = await saveBalanceAction(fd);
      setResult(r);
    });
  }

  return (
    <section className="rounded-2xl bg-surface ring-1 ring-ink/10 p-6 flex flex-col gap-5 shadow-sm">
      <h2 className="text-2xl font-bold">Saldo do rebanho</h2>
      <p className="text-lg text-muted -mt-3">Quantos animais em cada faixa (copie do seu sistema). M = machos, F = fêmeas.</p>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="flex-1" />
          <span className="w-24 sm:w-28 text-center text-xl font-bold text-muted">M</span>
          <span className="w-24 sm:w-28 text-center text-xl font-bold text-muted">F</span>
        </div>
        {AGE_BANDS.map((b) => (
          <div key={b.key} className="flex items-center gap-3">
            <span className="flex-1 text-lg sm:text-xl">{b.label}</span>
            <input
              inputMode="numeric"
              value={vals[`m${b.key}`] ? String(vals[`m${b.key}`]) : ""}
              onChange={(e) => set(`m${b.key}`, e.target.value)}
              placeholder="0"
              className="w-24 sm:w-28 px-3 py-4 rounded-xl bg-bg ring-1 ring-ink/15 text-2xl font-mono font-bold text-center outline-none focus:ring-info"
            />
            <input
              inputMode="numeric"
              value={vals[`f${b.key}`] ? String(vals[`f${b.key}`]) : ""}
              onChange={(e) => set(`f${b.key}`, e.target.value)}
              placeholder="0"
              className="w-24 sm:w-28 px-3 py-4 rounded-xl bg-bg ring-1 ring-ink/15 text-2xl font-mono font-bold text-center outline-none focus:ring-pink-400"
            />
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10 pt-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xl text-muted">Machos</span>
          <span className="text-2xl font-mono font-bold text-info">{totalM}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl text-muted">Fêmeas</span>
          <span className="text-2xl font-mono font-bold text-pink-600">{totalF}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-2xl font-bold">Total</span>
          <span className="text-4xl font-mono font-black text-accent">{total}</span>
        </div>
      </div>

      <button
        onClick={save}
        disabled={pending}
        className="px-6 py-5 rounded-[22px] bg-gradient-to-br from-accent to-green-600 text-black font-bold text-2xl shadow-[0_16px_45px_-18px_rgba(34,197,94,0.6)] active:scale-[0.98] transition disabled:opacity-50"
      >
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
