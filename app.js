// SANSTEEL SACCO PWA — shared utilities
// jsonpCall(): cross-origin GET to the Apps Script backend via injected <script> tag.
// Retries with backoff on timeout/network failure — helps on unstable connections.
function jsonpCall(page, params, options) {
  params = params || {};
  options = options || {};
  var maxRetries = options.maxRetries != null ? options.maxRetries : 3;
  var timeoutMs   = options.timeoutMs  != null ? options.timeoutMs  : 15000;
  var onRetry     = options.onRetry; // optional: function(attempt, maxRetries)

  function attemptOnce() {
    return new Promise(function (resolve, reject) {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        reject(new Error("No internet connection. Please check your network and try again."));
        return;
      }

      var cbName = "jc_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
      var scriptId = "_jsonpScript_" + cbName;
      var settled = false;
      var timer = null;

      function cleanup() {
        if (timer) clearTimeout(timer);
        delete window[cbName];
        var s = document.getElementById(scriptId);
        if (s) s.remove();
      }

      timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Request timed out"));
      }, timeoutMs);

      window[cbName] = function (data) {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(data);
      };

      var query = { page: page, callback: cbName };
      Object.keys(params).forEach(function (k) { query[k] = params[k]; });
      var qs = Object.keys(query).map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(query[k]);
      }).join("&");

      var s = document.createElement("script");
      s.id = scriptId;
      s.src = window.APPS_SCRIPT_URL + "?" + qs;
      s.onerror = function () {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Connection failed"));
      };
      document.head.appendChild(s);
    });
  }

  function run(tryNum) {
    return attemptOnce().catch(function (err) {
      if (tryNum >= maxRetries) throw err;
      if (typeof onRetry === "function") onRetry(tryNum + 1, maxRetries);
      var delay = Math.min(2000 * Math.pow(2, tryNum), 10000); // 2s, 4s, 8s (capped)
      return new Promise(function (resolve) { setTimeout(resolve, delay); }).then(function () {
        return run(tryNum + 1);
      });
    });
  }

  return run(0);
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
