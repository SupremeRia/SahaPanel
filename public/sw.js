/* SahaPanel service worker — sade, guvenli, importsuz.
   Auth / Supabase / API cagrilarina asla dokunmaz; POST vb. istekleri onbellege almaz. */

const CACHE = "sahapanel-v1";
const PRECACHE = ["/offline.html", "/icon.svg"];
const OFFLINE_URL = "/offline.html";

// Kurulum: temel varliklari onbellege al ve hemen aktiflesmeye hazirlan.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Aktiflesme: eski surum onbelleklerini temizle ve tum sekmeleri devral.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Bu istek onbellege alinabilir mi? (Sadece ayni kaynak, GET, auth/supabase disi.)
function isCacheableRequest(request) {
  if (request.method !== "GET") return false;

  let url;
  try {
    url = new URL(request.url);
  } catch (_) {
    return false;
  }

  // Yalnizca ayni kaynak; capraz kaynaklara (Supabase, CDN vb.) dokunma.
  if (url.origin !== self.location.origin) return false;

  // Kimlik dogrulama ve veri katmani asla onbellege alinmaz.
  const target = (url.pathname + url.search).toLowerCase();
  if (target.includes("/auth") || target.includes("supabase") || target.includes("/api/")) {
    return false;
  }

  return true;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!isCacheableRequest(request)) return;

  // Gezinme istekleri: once ag, sonra onbellek, en son cevrimdisi sayfasi.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const network = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, network.clone());
          return network;
        } catch (_) {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        }
      })()
    );
    return;
  }

  // Diger ayni kaynak GET istekleri: stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);

      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })()
  );
});
