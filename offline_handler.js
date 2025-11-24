const cacheName = "offline-cache-v1";
const cacheUrls = ["index.html", "Offline.html","Results.html","style.css","assets/Offline_page/Mac_Hotspot.png","assets/Offline_page/Mac_interlinked.png","assets/Offline_page/Mac_networkissue.png","assets/Offline_page/Mac_noWiFi.png","assets/Offline_page/Mac_offline.png","assets/Offline_page/Mac_WiFi.png","assets/Offline_page/Windows_Ethernet.png","assets/Offline_page/Windows_Offline1.png","assets/Offline_page/Windows_Offline2.png","assets/Offline_page/Windows_WiFi.png"];
self.addEventListener("install", async (event) => {
  try {
    const cache = await caches.open(cacheName);
    await cache.addAll(cacheUrls);
  } catch (error) {
    console.error("Service Worker installation failed:", error);
  }
});

// Fetching resources
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);

      try {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          console.log("cachedResponse: ", event.request.url);
          return cachedResponse;
        }

        const fetchResponse = await fetch(event.request);
        if (fetchResponse) {
          console.log("fetchResponse: ", event.request.url);
          await cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        }
      } catch (error) {
        console.log("Fetch failed: ", error);
        const cachedResponse = await cache.match("index.html");
        return cachedResponse;
      }
    })()
  );
});
/// Code from https://dev.to/naimur/building-offline-ready-webpage-with-service-worker-and-cache-storage-3dbk
