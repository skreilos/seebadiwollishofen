(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !open);
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  /** E-Mail für Reservierungs-Mailto (bitte anpassen) */
  var RESERVATION_EMAIL = 'badiwollishofen@bluewin.ch';

  var form = document.getElementById('res-form');
  var feedback = document.getElementById('form-feedback');
  if (form && feedback) {
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

      feedback.textContent = 'Ihr E-Mail-Programm öffnet sich. Bitte senden Sie die Nachricht ab.';
      feedback.classList.add('ok');
      window.location.href = mail;
    });
  }
})();
