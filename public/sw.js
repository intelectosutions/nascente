const CACHE = "nascente-v1";
const ASSETS = ["/", "/animais", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/painel")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request).then((r) => r || new Response("Offline", { status: 503 }))));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok) {
          const cloned = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, cloned)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || new Response("Offline", { status: 503 })))
  );
});
