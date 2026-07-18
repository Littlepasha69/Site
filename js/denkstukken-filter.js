const filterKnoppen = Array.from(document.querySelectorAll('.filter-btn'));
const denkblokken = Array.from(document.querySelectorAll('.denkblok'));

filterKnoppen.forEach((knop) => {
  knop.addEventListener('click', () => {
    const gekozenFilter = knop.dataset.filter.toLowerCase();

    filterKnoppen.forEach((andereKnop) => {
      const actief = andereKnop === knop;
      andereKnop.classList.toggle('active', actief);
      andereKnop.setAttribute('aria-pressed', String(actief));
    });

    denkblokken.forEach((blok) => {
      const tags = (blok.dataset.tags || '').toLowerCase();
      const zichtbaar = gekozenFilter === 'alles' || tags.includes(gekozenFilter);
      blok.hidden = !zichtbaar;
    });
  });
});
