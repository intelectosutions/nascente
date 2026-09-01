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
      .catch(() => setState(isIOS && !isStandalone ? "ios-install" : "unsupported"));
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

  // Já ativado ou não aplicável: não ocupa espaço no topo
  if (state === "loading" || state === "unsupported" || state === "granted") return null;

  if (state === "ios-install") {
    return (
      <div className="rounded-2xl bg-warn/10 ring-1 ring-warn/40 px-5 py-5 flex flex-col gap-2">
        <div className="text-xl sm:text-2xl font-bold text-warn">🔔 Receber avisos no iPhone</div>
        <ol className="text-base sm:text-lg text-ink/90 leading-relaxed list-decimal list-inside">
          <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta ↑) embaixo</li>
          <li>Escolha <strong>Adicionar à Tela de Início</strong></li>
          <li>Abra o app pelo <strong>ícone novo</strong> na tela do celular</li>
          <li>Toque em <strong>Receber avisos</strong> que vai aparecer aqui</li>
        </ol>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="rounded-2xl bg-surface ring-1 ring-ink/10 px-5 py-4 text-base sm:text-lg text-muted shadow-sm">
        Avisos bloqueados. Ative as notificações deste app nos Ajustes do celular.
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={state === "working"}
      className="w-full rounded-2xl bg-gradient-to-br from-accent to-green-600 text-black px-6 py-5 text-center text-xl sm:text-2xl font-bold shadow-[0_14px_40px_-16px_rgba(34,197,94,0.6)] active:scale-[0.98] transition disabled:opacity-50"
    >
      {state === "working" ? "Ativando…" : "🔔 Receber avisos no celular"}
    </button>
  );
}
