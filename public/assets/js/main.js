(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setNavOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      setNavOpen(!open);
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setNavOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNavOpen(false);
    });
  }

  var header = document.querySelector('.site-header');
  if (header) {
    var compactThreshold = 36;
    var syncHeaderCompact = function () {
      header.classList.toggle('is-compact', window.scrollY > compactThreshold);
    };
    syncHeaderCompact();
    window.addEventListener('scroll', syncHeaderCompact, { passive: true });
    window.addEventListener('resize', syncHeaderCompact);
    window.addEventListener('load', syncHeaderCompact);
  }

  var scrollToCurrentHash = function () {
    if (!window.location.hash) return;
    var id = window.location.hash.slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    var offset = header ? header.offsetHeight + 8 : 0;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  };

  window.addEventListener('hashchange', function () {
    // Wait one frame so browser hash navigation settles first.
    window.requestAnimationFrame(scrollToCurrentHash);
  });

  var navEntry = (window.performance && window.performance.getEntriesByType)
    ? window.performance.getEntriesByType('navigation')[0]
    : null;
  var isReload = !!(navEntry && navEntry.type === 'reload');

  if (isReload && window.location.hash) {
    // On hard reload, start at top and remove stale hash.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'auto' });
  } else {
    window.requestAnimationFrame(scrollToCurrentHash);
  }

  window.addEventListener('load', function () {
    if (isReload) return;
    // Re-apply hash scroll after images/fonts changed layout.
    scrollToCurrentHash();
    window.setTimeout(scrollToCurrentHash, 140);
    window.setTimeout(scrollToCurrentHash, 420);
  });

  /** E-Mail für Reservierungs-Mailto (bitte anpassen) */
  var RESERVATION_EMAIL = 'badiwollishofen@bluewin.ch';

  var form = document.getElementById('res-form');
  var feedback = document.getElementById('form-feedback');
  if (form && feedback) {
    var datumFlexibel = form.querySelector('input[name="datum_flexibel"]');
    var datumPrimary = form.querySelector('input[name="datum"]');
    var datumAlt = form.querySelector('input[name="datum_alternativ"]');

    var syncDateReadonlyState = function () {
      var locked = !!(datumFlexibel && datumFlexibel.checked);
      [datumPrimary, datumAlt].forEach(function (input) {
        if (!input) return;
        input.readOnly = locked;
        input.setAttribute('aria-readonly', locked ? 'true' : 'false');
        if (locked) input.classList.add('is-readonly');
        else input.classList.remove('is-readonly');
      });
    };

    if (datumFlexibel) {
      datumFlexibel.addEventListener('change', syncDateReadonlyState);
      syncDateReadonlyState();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      feedback.textContent = '';
      feedback.className = 'form-feedback';

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var fd = new FormData(form);
      var lines = [];
      fd.forEach(function (v, k) {
        lines.push(k + ': ' + v);
      });
      var body = lines.join('\n');
      var subject = encodeURIComponent('Anfrage Anlass / Event Seebadi Wollishofen');
      var mail = 'mailto:' + RESERVATION_EMAIL + '?subject=' + subject + '&body=' + encodeURIComponent(body);

      feedback.textContent = 'Dein E-Mail-Programm öffnet sich. Bitte sende die Nachricht ab.';
      feedback.classList.add('ok');
      window.location.href = mail;
    });
  }

  var galleryImages = Array.prototype.slice.call(
    document.querySelectorAll('.gallery-customer img')
  );
  var lightbox = document.getElementById('gallery-lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var btnPrev = document.querySelector('[data-lightbox-prev]');
  var btnNext = document.querySelector('[data-lightbox-next]');
  var btnClose = document.querySelector('[data-lightbox-close]');
  var backdrop = lightbox ? lightbox.querySelector('.lightbox__backdrop') : null;
  var currentIndex = 0;

  if (galleryImages.length && lightbox && lightboxImage && btnPrev && btnNext && btnClose && backdrop) {
    var renderImage = function (idx) {
      currentIndex = (idx + galleryImages.length) % galleryImages.length;
      var source = galleryImages[currentIndex];
      lightboxImage.src = source.currentSrc || source.src;
      lightboxImage.alt = source.alt || '';
    };

    var openLightbox = function (idx) {
      renderImage(idx);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    var closeLightbox = function () {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      lightboxImage.src = '';
    };

    galleryImages.forEach(function (img, idx) {
      img.dataset.galleryIndex = String(idx);
      img.addEventListener('click', function () {
        openLightbox(idx);
      });
    });

    var galleryRoot = document.querySelector('.gallery-customer');
    if (galleryRoot) {
      galleryRoot.addEventListener('click', function (e) {
        var img = e.target.closest('img');
        if (!img || !galleryRoot.contains(img)) return;
        var idx = Number(img.dataset.galleryIndex);
        if (Number.isNaN(idx)) return;
        openLightbox(idx);
      });
    }

    btnPrev.addEventListener('click', function () {
      renderImage(currentIndex - 1);
    });

    btnNext.addEventListener('click', function () {
      renderImage(currentIndex + 1);
    });

    btnClose.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') renderImage(currentIndex - 1);
      if (e.key === 'ArrowRight') renderImage(currentIndex + 1);
    });
  }
})();
