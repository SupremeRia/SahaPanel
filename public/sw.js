/* Aytemiz Petrol Yakutiye Şubesi paneli — service worker (sade, guvenli, importsuz).
   Auth / Supabase / API cagrilarina ve Next.js RSC (dinamik veri) isteklerine asla
   dokunmaz; boylece sunucu tarafinda guncellenen liste/veriler bayat onbellekten
   servis edilmez. Yalnizca statik varliklar onbellege alinir. */

const CACHE = "aytemiz-panel-v2";
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

// Aktiflesme: eski surum onbelleklerini (ornegin bayat RSC iceren) temizle.
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

// Next.js RSC / dinamik veri istegi mi? Bunlar ASLA onbellege alinmaz;
// aksi halde server action sonrasi liste guncellenmez (bayat veri gorunur).
function isDynamicRequest(request, url) {
  if (request.headers.get("RSC") || request.headers.get("Next-Router-Prefetch")) return true;
  const target = (url.pathname + url.search).toLowerCase();
  if (target.includes("_rsc=")) return true;
  if (url.pathname.startsWith("/_next/data")) return true;
  return false;
}

// Bu istek onbellege alinabilir mi? (Sadece ayni kaynak, GET, statik varlik.)
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

  // Kimlik dogrulama, veri katmani ve dinamik RSC istekleri asla onbellege alinmaz.
  const target = (url.pathname + url.search).toLowerCase();
  if (target.includes("/auth") || target.includes("supabase") || target.includes("/api/")) {
    return false;
  }
  if (isDynamicRequest(request, url)) return false;

  return true;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!isCacheableRequest(request)) return;

  // Gezinme istekleri: once ag, sonra onbellek, en son cevrimdisi sayfasi.
  // (Ag basarili oldugunda daima taze icerik gosterilir.)
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

  // Diger ayni kaynak GET istekleri (statik varliklar): stale-while-revalidate.
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
