(function () {
  const returnPath = document.querySelector('[data-return-path]');
  if (returnPath) {
    try {
      const trail = JSON.parse(localStorage.getItem('onwijze-laatste-spoor') || 'null');
      const target = trail?.href ? new URL(trail.href, location.href) : null;
      const safeProtocol = target && ['file:', 'http:', 'https:'].includes(target.protocol);
      const samePlace = target && target.origin === location.origin;

      if (trail?.title && safeProtocol && samePlace && target.href !== location.href) {
        const link = returnPath.querySelector('[data-return-link]');
        link.href = target.href;
        returnPath.querySelector('[data-return-title]').textContent = trail.title;
        returnPath.hidden = false;
      }
    } catch (error) {
      // Een oud of onleesbaar spoor wordt eenvoudig genegeerd.
    }

    returnPath.querySelector('[data-return-dismiss]')?.addEventListener('click', () => {
      try {
        localStorage.removeItem('onwijze-laatste-spoor');
      } catch (error) {
        // Verbergen blijft ook zonder lokale opslag werken.
      }
      returnPath.hidden = true;
    });
  }

  const surprises = [
    'onderwerpen/gewoontes.html',
    'onderwerpen/de-ander-verandert-je.html',
    'onderwerpen/bewustzijn.html',
    'denk-box06.html',
    'denk-box10.html',
    'denk-box14.html',
    'veranderroute.html',
    'dierenquiz.html'
  ];

  document.querySelectorAll('[data-surprise]').forEach((button) => {
    button.addEventListener('click', () => {
      let previous = -1;
      try {
        previous = Number(sessionStorage.getItem('onwijze-surprise-index'));
      } catch (error) {
        previous = -1;
      }
      let next = Math.floor(Math.random() * surprises.length);

      if (surprises.length > 1 && next === previous) {
        next = (next + 1) % surprises.length;
      }

      try {
        sessionStorage.setItem('onwijze-surprise-index', String(next));
      } catch (error) {
        // De verrassingsknop blijft ook werken wanneer lokale opslag geblokkeerd is.
      }
      window.location.href = surprises[next];
    });
  });
}());
