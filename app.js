// SANSTEEL SACCO PWA — shared utilities
// jsonpCall(): cross-origin GET to the Apps Script backend via injected <script> tag.
function jsonpCall(page, params) {
  params = params || {};
  return new Promise(function (resolve, reject) {
    var cbName = "jc_" + Math.random().toString(36).slice(2);
    var timer = setTimeout(function () { delete window[cbName]; reject(new Error("Request timed out")); }, 15000);
    window[cbName] = function (data) {
      clearTimeout(timer);
      delete window[cbName];
      var s = document.getElementById("_jsonpScript");
      if (s) s.remove();
      resolve(data);
    };
    var query = { page: page, callback: cbName };
    Object.keys(params).forEach(function (k) { query[k] = params[k]; });
    var qs = Object.keys(query).map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(query[k]);
    }).join("&");
    var s = document.createElement("script");
    s.id = "_jsonpScript";
    s.src = window.APPS_SCRIPT_URL + "?" + qs;
    s.onerror = function () { clearTimeout(timer); delete window[cbName]; reject(new Error("Connection failed")); };
    document.head.appendChild(s);
  });
}

// getUrlParam(): read a value from the page URL (e.g. ?id=LA-123).
function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

// Register the service worker for PWA installability + offline shell.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function (e) {
      console.warn("Service worker registration failed:", e);
    });
  });
}
