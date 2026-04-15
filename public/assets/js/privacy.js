(function () {
  var key = document.body.getAttribute('data-cookie-storage-key');
  if (!key) return;

  var banner = document.getElementById('cookie-banner');
  if (!banner) return;

  function hideBanner() {
    banner.classList.add('cookie-banner--dismissed');
    banner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-cookie-banner');
  }

  function showBanner() {
    banner.classList.remove('cookie-banner--dismissed');
    banner.removeAttribute('aria-hidden');
    document.body.classList.add('has-cookie-banner');
    var first = document.getElementById('cookie-accept-all');
    if (first) window.setTimeout(function () { first.focus(); }, 50);
  }

  function updateMapHint() {
    var hint = document.getElementById('map-consent-hint');
    if (!hint) return;
    var stack = hint.closest('.map-consent-stack');
    var target = stack || hint;
    var loaded = false;
    document.querySelectorAll('iframe[data-map-src]').forEach(function (el) {
      if (el.getAttribute('src')) loaded = true;
    });
    target.style.display = loaded ? 'none' : '';
  }

  function loadMaps() {
    document.querySelectorAll('iframe[data-map-src]').forEach(function (el) {
      var s = el.getAttribute('data-map-src');
      if (s && !el.getAttribute('src')) el.setAttribute('src', s);
    });
    updateMapHint();
  }

  function unloadMaps() {
    document.querySelectorAll('iframe[data-map-src]').forEach(function (el) {
      if (el.getAttribute('src')) el.removeAttribute('src');
    });
    updateMapHint();
  }

  function applyStoredChoice() {
    var v = localStorage.getItem(key);
    if (v === 'all') loadMaps();
    else if (v === 'necessary') unloadMaps();
  }

  function save(choice) {
    try {
      localStorage.setItem(key, choice);
    } catch (e) {}
    hideBanner();
    if (choice === 'all') loadMaps();
    else unloadMaps();
  }

  var btnAll = document.getElementById('cookie-accept-all');
  var btnMin = document.getElementById('cookie-necessary');
  if (btnAll) btnAll.addEventListener('click', function () { save('all'); });
  if (btnMin) btnMin.addEventListener('click', function () { save('necessary'); });

  document.querySelectorAll('[data-open-cookie-settings]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
    });
  });

  if (localStorage.getItem(key)) {
    hideBanner();
    applyStoredChoice();
  } else {
    document.body.classList.add('has-cookie-banner');
    banner.removeAttribute('aria-hidden');
    updateMapHint();
  }
})();

(function () {
  function openDatenschutzFromHash() {
    if (window.location.hash !== '#datenschutz') return;
    var el = document.getElementById('datenschutz');
    if (!el || el.tagName !== 'DETAILS') return;
    el.open = true;
    window.requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  window.addEventListener('hashchange', openDatenschutzFromHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openDatenschutzFromHash);
  } else {
    openDatenschutzFromHash();
  }
})();

(function () {
  function openReservationFromHash() {
    if (window.location.hash !== '#reservation') return;
    var el = document.getElementById('reservation');
    if (!el || el.tagName !== 'DETAILS') return;
    el.open = true;
    window.requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  window.addEventListener('hashchange', openReservationFromHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openReservationFromHash);
  } else {
    openReservationFromHash();
  }
})();
