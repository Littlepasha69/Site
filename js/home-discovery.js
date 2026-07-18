(function () {
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
