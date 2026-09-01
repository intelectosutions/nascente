"use client";

import { useEffect, useRef, useState } from "react";

const LIMIAR = 55; // distância do indicador (≈110px de dedo) para disparar o refresh

// Pull-to-refresh próprio: PWA instalado (standalone) não tem o gesto nativo do navegador.
export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (window.scrollY <= 0 && e.touches.length === 1) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = null;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null || window.scrollY > 5) return;
      const delta = e.touches[0].clientY - startY.current;
      setPull(delta > 0 ? Math.min(delta / 2, 110) : 0);
    };
    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      setPull((p) => {
        if (p >= LIMIAR) {
          setRefreshing(true);
          window.location.reload();
          return p;
        }
        return 0;
      });
    };
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  const armado = pull >= LIMIAR;
  const visivel = refreshing || pull > 8;

  return (
    <div
      aria-hidden
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-opacity duration-150 ${
        visivel ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: `calc(env(safe-area-inset-top, 0px) + ${Math.min(pull, 90) - 52}px)` }}
    >
      <div className="flex items-center gap-3 rounded-full bg-surface/95 ring-1 ring-ink/15 px-6 py-3 shadow-[0_10px_30px_-10px_rgba(24,48,32,0.28)] backdrop-blur-sm">
        {refreshing ? (
          <span className="inline-block h-6 w-6 rounded-full border-[3px] border-ink/20 border-t-ink animate-spin" />
        ) : (
          <span
            className="text-2xl leading-none transition-transform duration-150"
            style={{ transform: armado ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ↓
          </span>
        )}
        <span className="text-lg font-bold whitespace-nowrap">
          {refreshing ? "Atualizando…" : armado ? "Solte para atualizar" : "Puxe para atualizar"}
        </span>
      </div>
    </div>
  );
}
