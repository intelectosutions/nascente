"use client";

import { useEffect, useState } from "react";

type VersionInfo = {
  version: string;
  commit: string;
  branch: string;
  buildTime: string;
  env: string;
};

type SyncState = "synced" | "ahead" | "behind" | "diverged" | "unknown";

const PROD_VERSION_URL = "https://nascente.intelecto.solutions/api/version";

export function VersionBadge() {
  const [local, setLocal] = useState<VersionInfo | null>(null);
  const [prod, setProd] = useState<VersionInfo | null>(null);
  const [sync, setSync] = useState<SyncState>("unknown");

  useEffect(() => {
    fetch("/api/version", { cache: "no-store" })
      .then((r) => r.json())
      .then((v) => {
        setLocal(v);
        if (v.env !== "production") {
          fetch(PROD_VERSION_URL, { cache: "no-store" })
            .then((r) => r.json())
            .then((p) => {
              setProd(p);
              if (v.commit === p.commit) setSync("synced");
              else if (new Date(v.buildTime) > new Date(p.buildTime)) setSync("ahead");
              else if (new Date(v.buildTime) < new Date(p.buildTime)) setSync("behind");
              else setSync("diverged");
            })
            .catch(() => setSync("unknown"));
        }
      })
      .catch(() => {});
  }, []);

  if (!local) return <span className="text-xs text-muted">…</span>;

  const isProd = local.env === "production";
  const dot = isProd
    ? "bg-accent"
    : sync === "synced"
    ? "bg-accent"
    : sync === "ahead"
    ? "bg-warn"
    : sync === "behind"
    ? "bg-danger"
    : sync === "diverged"
    ? "bg-fuchsia-500"
    : "bg-muted";

  const tooltip = isProd
    ? `Produção\nversion ${local.version}\ncommit ${local.commit}\nbranch ${local.branch}\nbuild ${local.buildTime}`
    : `LOCAL\nlocal:  ${local.version} · ${local.commit}\nprod:   ${prod ? `${prod.version} · ${prod.commit}` : "?"}\nestado: ${sync}`;

  return (
    <span title={tooltip} className="inline-flex items-center gap-2 text-xs font-mono">
      <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
      {!isProd && <span className="px-1.5 py-0.5 rounded bg-warn/20 text-warn font-bold">LOCAL</span>}
      <span className="text-muted">v{local.version}</span>
      <span className="text-muted/60">·</span>
      <span className="text-muted">{local.commit}</span>
    </span>
  );
}
