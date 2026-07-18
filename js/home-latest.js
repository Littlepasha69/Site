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
  const label = card.querySelector('[data-latest-dossier-label]');
  if (latest.areaIcon === 'fingerprint') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'content-label__icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M12 10a2 2 0 0 0-2 2c0 1-.1 2.5-.3 4M14 13.1c0 2.4 0 6.4-1 8.9M17.3 21c.1-.6.4-2.3.5-3M2.2 12A9.8 9.8 0 0 1 20 6M2.3 16h.1M21.8 16c.2-2 .1-5.4 0-6M5 19.5c.5-1.5 1-4.5 1-7.5a6 6 0 0 1 .3-2M8.7 22c.2-.7.4-1.3.6-2M9 6.8a6 6 0 0 1 9 5.2v2');
    svg.append(path);
    label.replaceChildren(svg, document.createTextNode(` Nieuw in de Atlas · ${date}`));
  } else {
    label.textContent = `${latest.areaIcon || '○'} Nieuw in de Atlas · ${date}`;
  }
  card.querySelector('[data-latest-dossier-title]').textContent = latest.title;
  card.querySelector('[data-latest-dossier-summary]').textContent = latest.summary;
})();
