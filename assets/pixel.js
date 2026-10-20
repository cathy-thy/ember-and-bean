// TikTok Pixel loader + tracking helpers.
//
// URL switches (remembered in localStorage, so set once):
//   ?pixel=CODE   use a different pixel
//   ?track=off    stop code-fired events (only ttq.page() runs) — for testing Event Builder rules
//   ?track=on     turn them back on
//   ?debug=1      show the event log panel (?debug=0 hides it)
(function () {
  var DEFAULT_PIXEL = 'DBBIL6BC77U1A7OSMPSG';
  var params = new URLSearchParams(location.search);

  function setting(key, storageKey, fallback) {
    var v = params.get(key);
    try {
      if (v !== null) localStorage.setItem(storageKey, v);
      var s = localStorage.getItem(storageKey);
      return s !== null ? s : fallback;
    } catch (e) {
      return v !== null ? v : fallback;
    }
  }
  var PIXEL_CODE = setting('pixel', 'eb_pixel', DEFAULT_PIXEL);
  var TRACKING_ON = setting('track', 'eb_track', 'on') !== 'off';
  var DEBUG = setting('debug', 'eb_debug', '0') === '1';

  // ---- debug log ----
  var pending = [];
  function write(line, cls) {
    var el = document.getElementById('eb-debug-log');
    if (!el) { pending.push([line, cls]); return; }
    var div = document.createElement('div');
    div.textContent = line;
    if (cls) div.className = cls;
    el.prepend(div);
  }
  function log(msg, cls) { write(new Date().toLocaleTimeString() + '  ' + msg, cls); }

  // ---- official TikTok Pixel base code ----
  !function (w, d, t) {
    w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
    ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
    ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e };
    ttq.load = function (e, n) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = r, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {};
      n = document.createElement("script"); n.type = "text/javascript", n.async = !0, n.src = r + "?sdkid=" + e + "&lib=" + t;
      n.onload = function () { log('pixel script loaded'); };
      n.onerror = function () { log('pixel script failed to load (ad blocker?)', 'err'); };
      e = document.getElementsByTagName("script")[0]; e.parentNode.insertBefore(n, e)
    };
    ttq.load(PIXEL_CODE);
    ttq.page();
  }(window, document, 'ttq');
  log('page  ' + location.pathname);

  // ---- public helpers ----
  window.track = function (event, props) {
    props = props || {};
    if (!TRACKING_ON) { log('skipped ' + event + ' (track=off)', 'muted'); return; }
    var eventId = event.toLowerCase() + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    ttq.track(event, props, { event_id: eventId });
    log('track ' + event + '  ' + JSON.stringify(props) + '  event_id=' + eventId);
  };

  async function sha256(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s.trim().toLowerCase()));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  // Advanced Matching: values are hashed in the browser before they leave the page.
  window.identifyUser = async function (fields) {
    var data = {};
    if (fields.email) data.email = await sha256(fields.email);
    if (fields.phone) data.phone_number = await sha256(fields.phone);
    if (fields.externalId) data.external_id = await sha256(fields.externalId);
    if (!Object.keys(data).length) return;
    if (!TRACKING_ON) { log('skipped identify (track=off)', 'muted'); return; }
    ttq.identify(data);
    log('identify  ' + Object.keys(data).join(', ') + ' (sha256)');
  };

  // ---- debug panel ----
  if (DEBUG) {
    document.addEventListener('DOMContentLoaded', function () {
      var panel = document.createElement('aside');
      panel.className = 'eb-debug';
      panel.innerHTML =
        '<div class="eb-debug-head"><strong>Pixel</strong> <code></code> <span></span>' +
        '<button type="button" aria-label="Collapse">–</button></div><div id="eb-debug-log"></div>';
      panel.querySelector('code').textContent = PIXEL_CODE;
      panel.querySelector('span').textContent = TRACKING_ON ? 'track on' : 'track off';
      panel.querySelector('button').onclick = function () { panel.classList.toggle('collapsed'); };
      document.body.appendChild(panel);
      var queued = pending; pending = [];
      queued.forEach(function (p) { write(p[0], p[1]); });
    });
  }
})();
