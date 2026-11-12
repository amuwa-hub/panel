/* AI WebTara · live website details set by the owner in the panel (offer strip, closed notice,
   timings, call/WhatsApp numbers and address). Loaded on every website by the Builder.
   Reads only public data (site_live) with the site's public key. Never blocks the page; does nothing on previews. */
(function () {
  'use strict';
  var c = window.__AMUWA_CFG || window.AGENT_CONFIG || {};
  if (!c.ANALYTICS_URL || !c.ANALYTICS_KEY || !c.SITE_ID || c.DEMO_MODE) return;
  var base = String(c.ANALYTICS_URL).replace(/\/rest\/v1\/.*$/, '');
  var RM = false; try { RM = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function fmt(iso) { if (!iso) return ''; var d = new Date(iso + 'T12:00:00Z'); return d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]; }

  function css() {
    if (document.getElementById('wt-live-css')) return;
    var s = document.createElement('style'); s.id = 'wt-live-css';
    s.textContent =
      '.wt-bars{position:fixed;z-index:2147483000;left:max(10px,env(safe-area-inset-left,0px));right:max(10px,env(safe-area-inset-right,0px));top:calc(10px + env(safe-area-inset-top,0px));display:flex;flex-direction:column;gap:6px;pointer-events:none;transition:transform .32s cubic-bezier(.23,1,.32,1),opacity .32s cubic-bezier(.23,1,.32,1)}' +
      '.wt-bars.hide{transform:translateY(-140%);opacity:0}' +
      '.wt-bar{pointer-events:auto;display:flex;align-items:center;gap:10px;max-width:640px;margin:0 auto;width:100%;box-sizing:border-box;padding:9px 8px 9px 14px;border-radius:14px;font:600 14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 10px 28px -12px rgba(0,0,0,.45);animation:wtIn .45s cubic-bezier(.23,1,.32,1) both}' +
      '.wt-bar.offer{background:#1d1a18;color:#fff}.wt-bar.offer .wt-tag{background:#F7C9D3;color:#1d1a18}' +
      '.wt-bar.notice{background:#FBE1D3;color:#7a2a12}.wt-bar.notice .wt-tag{background:#A23A1C;color:#fff}' +
      '.wt-tag{flex:0 0 auto;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:999px}' +
      '.wt-txt{flex:1;min-width:0}.wt-txt small{opacity:.75;font-weight:600;margin-left:6px;white-space:nowrap}' +
      '.wt-x{flex:0 0 auto;width:30px;height:30px;border:0;border-radius:999px;background:rgba(255,255,255,.16);color:inherit;font:700 16px/1 system-ui;cursor:pointer;display:grid;place-items:center}' +
      '.wt-bar.notice .wt-x{background:rgba(162,58,28,.12)}' +
      '@keyframes wtIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.wt-bar{animation:none}.wt-bars{transition:opacity .2s}}';
    document.head.appendChild(s);
  }

  function bars(d) {
    var items = [];
    if (d.notice) items.push('<div class="wt-bar notice" role="status"><span class="wt-tag">Notice</span><span class="wt-txt">' + esc(d.notice.text) + '</span><button class="wt-x" type="button" aria-label="Close notice">&times;</button></div>');
    if (d.offer) items.push('<div class="wt-bar offer" role="status"><span class="wt-tag">Offer</span><span class="wt-txt">' + esc(d.offer.text) + (d.offer.until ? '<small>till ' + fmt(d.offer.until) + '</small>' : '') + '</span><button class="wt-x" type="button" aria-label="Close offer">&times;</button></div>');
    if (!items.length) return;
    css();
    var wrap = document.createElement('div'); wrap.className = 'wt-bars'; wrap.innerHTML = items.join('');
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) { var x = e.target.closest('.wt-x'); if (!x) return; var b = x.closest('.wt-bar'); b.remove(); if (!wrap.children.length) wrap.remove(); });
    // out of the way while reading, back when the visitor returns to the top
    var last = 0, ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { var y = scrollY; wrap.classList.toggle('hide', y > 120 && y > last); last = y; ticking = false; });
    }, { passive: true });
  }

  function details(d) {
    var set = function (key, val) { if (!val) return; document.querySelectorAll('[data-wt="' + key + '"]').forEach(function (el) { el.textContent = val; }); };
    set('hours', d.hours); set('address', d.address);
    if (d.phone) {
      var pretty = d.phone.slice(0, 5) + ' ' + d.phone.slice(5);
      set('phone', '+91 ' + pretty);
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.setAttribute('href', 'tel:+91' + d.phone);
        // swap a printed number inside the link, keep labels like "Call"
        a.childNodes.forEach(function (n) { if (n.nodeType === 3 && /\d[\d\s-]{8,}\d/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/(\+?91[\s-]?)?\d[\d\s-]{8,}\d/, '+91 ' + pretty); });
      });
    }
    if (d.whatsapp) {
      set('whatsapp', '+91 ' + d.whatsapp.slice(0, 5) + ' ' + d.whatsapp.slice(5));
      document.querySelectorAll('a[href*="wa.me/"],a[href*="api.whatsapp.com"]').forEach(function (a) {
        var h = a.getAttribute('href') || '';
        // the owner's ticket number is not replaced: those links are built by Tara at the moment of hand-off
        a.setAttribute('href', h.replace(/wa\.me\/\+?\d+/, 'wa.me/91' + d.whatsapp).replace(/phone=\+?\d+/, 'phone=91' + d.whatsapp));
      });
    }
  }

  function run(d) {
    if (!d || typeof d !== 'object') return;
    try { bars(d); } catch (e) {}
    try { details(d); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('site:live', { detail: d })); } catch (e) {}
  }

  function load() {
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    fetch(base + '/rest/v1/rpc/site_live', {
      method: 'POST', signal: ctl ? ctl.signal : undefined,
      headers: { 'Content-Type': 'application/json', 'apikey': c.ANALYTICS_KEY, 'Authorization': 'Bearer ' + c.ANALYTICS_KEY },
      body: JSON.stringify({ p_site_id: c.SITE_ID })
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { clearTimeout(timer); run(d); }).catch(function () { clearTimeout(timer); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
