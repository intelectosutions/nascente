const CACHE = "nascente-v4";

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

// ---- Push notifications ----
self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch (_) {
    data = { title: "Fazenda Nascente", body: e.data ? e.data.text() : "" };
  }
  const title = data.title || "Fazenda Nascente";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [120, 60, 120],
    data: { url: data.url || "/" },
    tag: "nascente-update",
    renotify: true,
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) {
          c.navigate(target);
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
