/* Registers the offline service worker (web/PWA only; the desktop app serves files itself). */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol) || /Electron/i.test(navigator.userAgent)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () { /* offline cache is optional */ });
  });
})();
