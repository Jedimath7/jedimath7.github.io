---
permalink: /trainers/sw.js
layout: null
---
// Replace the previous offline worker while the trainer collection is paused.
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method === "GET" && url.origin === self.location.origin &&
      url.pathname.startsWith("/trainers/")) {
    event.respondWith(fetch(event.request, {cache: "no-store"}));
  }
});
