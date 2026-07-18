(() => {
  const door = document.querySelector('[data-enter]');
  if (!door) return;

  let entering = false;
  door.addEventListener('click', event => {
    if (entering || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    event.preventDefault();
    entering = true;
    document.body.classList.add('is-entering');
    window.setTimeout(() => window.location.assign(door.href), 1050);
  });

  window.addEventListener('pageshow', () => {
    entering = false;
    document.body.classList.remove('is-entering');
  });
})();
