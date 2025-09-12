const CACHE_NAME = "storylab-cache-v1";
const OFFLINE_URL = "/offline.html";

// Install → cache file penting
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/manifest.json",
                "/offline.html",
            ]);
        })
    );
    self.skipWaiting();
});

// Activate → hapus cache lama
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

// Fetch → hanya cache request GET
self.addEventListener("fetch", (event) => {
    // Abaikan request selain GET (POST, PUT, DELETE, dll)
    if (event.request.method !== "GET") return;

    // Abaikan request ke chrome-extension://
    if (event.request.url.startsWith("chrome-extension://")) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) {
                // kalau ada di cache → return cache dulu
                return cached;
            }

            // kalau ga ada di cache → ambil dari network
            return fetch(event.request)
                .then((res) => {
                    // clone response supaya bisa dipakai browser + cache
                    const resClone = res.clone();

                    // simpan hanya untuk request aman (http/https)
                    if (
                        event.request.url.startsWith("http://") ||
                        event.request.url.startsWith("https://")
                    ) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, resClone);
                        });
                    }

                    return res;
                })
                .catch(() => {
                    // fallback offline
                    if (event.request.mode === "navigate") {
                        return caches.match(OFFLINE_URL);
                    }
                });
        })
    );
});
