const CACHE_NAME = "leap-cache-v1";
const CORE_ASSETS = [
  "index.html",
  "results.html",
  "results.json",
  "scripts/style.css",
  "scripts/results.css",
  "scripts/settings.js",
  "scripts/search.js",
  "scripts/widgets.js",
  "Assets/logo.png",
  "Assets/Logo.svg",
  "Assets/logo.webp",
  "Assets/roboto.ttf"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match("index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(networkResponse => {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResponse));
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("index.html");
          }
          return new Response("", { status: 503, statusText: "Offline" });
        });
    })
  );
});
