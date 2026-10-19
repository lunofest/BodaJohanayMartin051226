/* ============================================================
   service-worker.js — ÚNICO archivo.
   ------------------------------------------------------------
   - En local (Live Server) NO se registra: editas y se recarga solo.
   - Al SUBIR: cambia SOLO este número (v1 -> v2 -> v3...). Nada más.
   ============================================================ */

const VERSION = "v10";
const CACHE = `invitacion-${VERSION}`;
const FUENTES = "invitacion-fuentes";

const BASE = ["./", "./index.html"];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches
            .open(CACHE)
            .then((c) => Promise.all(BASE.map((u) => c.add(u).catch(() => null))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches
            .keys()
            .then((nombres) =>
                Promise.all(
                    nombres
                        .filter((n) => n !== CACHE && n !== FUENTES)
                        .map((n) => caches.delete(n))
                )
            )
            .then(() => self.clients.claim())
    );
});

/* Caché primero; si no está, va a la red y guarda una copia. */
self.addEventListener("fetch", (e) => {
    if (e.request.method !== "GET") return;
    e.respondWith(
        caches.match(e.request).then(
            (cacheada) =>
                cacheada ||
                fetch(e.request)
                    .then((red) => {
                        const url = new URL(e.request.url);
                        const mismoOrigen = url.origin === self.location.origin;
                        const esFuente = url.href.includes("fonts.g");
                        if (mismoOrigen || esFuente) {
                            const destino = esFuente ? FUENTES : CACHE;
                            const copia = red.clone();
                            caches.open(destino).then((c) => c.put(e.request, copia));
                        }
                        return red;
                    })
                    .catch(() => {
                        if (e.request.mode === "navigate") {
                            return caches.match("./index.html");
                        }
                    })
        )
    );
});
