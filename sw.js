// SANSTEEL SACCO PWA — service worker (offline app shell)
var CACHE = "sansteel-pwa-v1";
var ASSETS = [
  "./", "./index.html", "./config.js", "./app.js", "./manifest.json",
  "./assets/logo.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./statement.html", "./loan.html", "./viewloan.html", "./receipts.html",
  "./nomination.html", "./viewnom.html", "./sharechange.html", "./viewsharechange.html", "./guarantor.html"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  // Never intercept cross-origin Apps Script (JSONP) requests.
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        if (resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
