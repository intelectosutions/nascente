const CACHE = "nascente-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Assets estáticos: cache-first (imutáveis, com hash no nome)
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    /\.(png|svg|ico|webmanifest|woff2?|css|js)$/.test(url.pathname);

  if (isStatic) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then((hit) => hit || fetch(req).then((r) => {
          if (r.ok) c.put(req, r.clone());
          return r;
        }))
      )
    );
    return;
  }

  // Páginas e dados: SEMPRE rede (conteúdo sempre fresco); cache só como fallback offline
  e.respondWith(
    fetch(req)
      .then((r) => {
        if (r.ok && req.mode === "navigate") {
          const clone = r.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return r;
      })
      .catch(() => caches.match(req).then((hit) => hit || new Response("Offline", { status: 503 })))
  );
});
