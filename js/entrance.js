(() => {
  const door = document.querySelector('[data-enter]');
  if (!door) return;

  document.body.classList.remove('is-entering');
  let entering = false;
  door.addEventListener('click', event => {
    if (entering || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    entering = true;
    try {
      localStorage.setItem('onwijze-ingang-gezien', '1');
    } catch (error) {
      // De ingang blijft werken wanneer lokale opslag niet beschikbaar is.
    }
    document.body.classList.add('is-entering');
    window.setTimeout(() => window.location.assign(door.href), 500);
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    door.addEventListener('click', () => {
      try {
        localStorage.setItem('onwijze-ingang-gezien', '1');
      } catch (error) {
        // De ingang blijft werken wanneer lokale opslag niet beschikbaar is.
      }
    });
  }

  window.addEventListener('pageshow', () => {
    entering = false;
    document.body.classList.remove('is-entering');
  });
})();
