"use client";

import { useState, useTransition } from "react";
import { uploadPlanilha, type UploadResult } from "./actions";

export function UploadCard({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);

  function pickFile(f: File | null) {
    if (!f) return;
    const ok = /\.(xlsx|xlsm)$/i.test(f.name);
    if (!ok) {
      setResult({ ok: false, message: "Aceito apenas .xlsx ou .xlsm." });
      return;
    }
    setFile(f);
    setResult(null);
  }

  function doPreview() {
    if (!file) return;
    const fd = new FormData();
    fd.set("planilha", file);
    fd.set("slug", slug);
    startTransition(async () => {
      const r = await uploadPlanilha(fd);
      setResult(r);
    });
  }

  function doApply() {
    if (!file) return;
    const fd = new FormData();
    fd.set("planilha", file);
    fd.set("slug", slug);
    fd.set("apply", "1");
    startTransition(async () => {
      const r = await uploadPlanilha(fd);
      setResult(r);
      if (r.ok) setFile(null);
    });
  }

  return (
    <section className="rounded-xl bg-surface ring-1 ring-ink/10 p-6 flex flex-col gap-5 shadow-sm">
      <h2 className="text-2xl font-bold">Atualizar planilha</h2>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          pickFile(f || null);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition ${dragOver ? "border-accent bg-accent/5" : "border-ink/25 hover:border-ink/45"}`}
      >
        <input
          type="file"
          accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
        <div className="text-xl sm:text-2xl font-semibold text-center">
          {file ? file.name : "Arraste a planilha aqui ou clique para escolher"}
        </div>
        <div className="text-base text-muted">.xlsx ou .xlsm</div>
      </label>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={doPreview}
          disabled={!file || pending}
          className="px-5 py-3 rounded-xl bg-info/20 text-info ring-1 ring-info/40 text-lg font-bold disabled:opacity-50"
        >
          {pending ? "Lendo…" : "Pré-visualizar"}
        </button>
        <button
          onClick={doApply}
          disabled={!file || pending}
          className="px-5 py-3 rounded-xl bg-accent text-black text-lg font-bold disabled:opacity-50"
        >
          {pending ? "Aplicando…" : "Aplicar atualização"}
        </button>
        {file && !pending && (
          <button onClick={() => { setFile(null); setResult(null); }} className="px-5 py-3 rounded-xl ring-1 ring-ink/15 text-lg">
            Cancelar
          </button>
        )}
      </div>

      {result && (
        <div className={`rounded-xl p-5 ring-1 ${result.ok ? "ring-accent/40 bg-accent/5" : "ring-danger/40 bg-danger/5"}`}>
          <div className="text-xl font-bold">{result.message}</div>
          {result.preview && (
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <Stat label="Novos" value={result.preview.toInsert} color="text-accent" />
              <Stat label="Atualizados" value={result.preview.toUpdate} color="text-info" />
              <Stat label="Saídos" value={result.preview.toExit} color="text-danger" />
              <Stat label="Iguais" value={result.preview.unchanged} color="text-muted" />
            </ul>
          )}
          {result.warnings && result.warnings.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-base text-muted">Avisos ({result.warnings.length})</summary>
              <ul className="mt-2 text-base list-disc list-inside text-muted">
                {result.warnings.slice(0, 20).map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <li className="flex flex-col items-center">
      <div className={`font-mono font-black text-4xl ${color}`}>{value}</div>
      <div className="text-base text-muted">{label}</div>
    </li>
  );
}
