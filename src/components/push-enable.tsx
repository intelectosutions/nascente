"use client";

import { useEffect, useState } from "react";
import { subscribeToPush } from "@/app/push-actions";

type State = "loading" | "unsupported" | "ios-install" | "prompt" | "working" | "granted" | "denied";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushEnable() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      // iPhone fora do app instalado não tem PushManager — orienta instalar
      setState(isIOS && !isStandalone ? "ios-install" : "unsupported");
      return;
    }

    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setState("granted");
          return;
        }
        setState(Notification.permission === "denied" ? "denied" : "prompt");
      })
      .catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setState("working");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "prompt");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const { publicKey } = await fetch("/api/push/key").then((r) => r.json());
      if (!publicKey) {
        setState("prompt");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      await subscribeToPush(JSON.parse(JSON.stringify(sub)));
      setState("granted");
    } catch {
      setState("prompt");
    }
  }

  if (state === "loading" || state === "unsupported") return null;

  if (state === "granted") {
    return (
      <div className="rounded-2xl bg-accent/10 ring-1 ring-accent/30 px-5 py-4 text-center text-lg sm:text-xl font-semibold text-accent">
        🔔 Avisos ativados neste celular
      </div>
    );
  }

  if (state === "ios-install") {
    return (
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/15 px-5 py-4 text-center text-base sm:text-lg text-muted">
        Para receber avisos no iPhone: toque em <strong className="text-ink">Compartilhar</strong> e depois{" "}
        <strong className="text-ink">Adicionar à Tela de Início</strong>. Abra pelo ícone e ative os avisos.
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/15 px-5 py-4 text-center text-base sm:text-lg text-muted">
        Avisos bloqueados. Permita notificações nas configurações do navegador para este site.
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={state === "working"}
      className="w-full rounded-2xl bg-white/5 ring-1 ring-white/20 px-6 py-5 text-center text-xl sm:text-2xl font-bold backdrop-blur-sm active:scale-[0.98] transition disabled:opacity-50"
    >
      {state === "working" ? "Ativando…" : "🔔 Receber avisos no celular"}
    </button>
  );
}
