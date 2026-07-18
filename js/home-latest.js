(function () {
  const card = document.querySelector('[data-latest-dossier]');
  if (!card || !Array.isArray(window.ONWIJZE_CONTENT)) return;

  const dossiers = window.ONWIJZE_CONTENT
    .map((item, index) => ({ item, index }))
    .filter(entry => entry.item.type === 'dossier' && entry.item.updated)
    .sort((a, b) => new Date(b.item.updated) - new Date(a.item.updated) || b.index - a.index);

  const latest = dossiers[0]?.item;
  if (!latest) return;

  const date = new Intl.DateTimeFormat('nl-BE', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(latest.updated));

  card.href = latest.url;
  card.querySelector('[data-latest-dossier-image]').src = latest.featureImage || 'images/denkstukken-beeld.png';
  card.querySelector('[data-latest-dossier-label]').textContent = `${latest.areaIcon || '○'} Nieuw in de Atlas · ${date}`;
  card.querySelector('[data-latest-dossier-title]').textContent = latest.title;
  card.querySelector('[data-latest-dossier-summary]').textContent = latest.summary;
})();
