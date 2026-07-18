(function () {
  const grid = document.querySelector('[data-guide-grid]');
  if (!grid) return;

  const tools = document.querySelector('[data-guide-tools]');
  const filters = document.querySelector('[data-guide-filters]');
  const status = document.querySelector('[data-guide-status]');
  const search = document.querySelector('#guide-search');
  const items = (window.WEGWIJZER_ITEMS || []).filter((item) => item.published);
  let activeCategory = 'Alles';
  let query = '';

  const relationshipLabels = {
    independent: 'Zelf gevonden',
    affiliate: 'Affiliate',
    partner: 'Partner'
  };

  function normalized(value) {
    return String(value || '').toLocaleLowerCase('nl');
  }

  function searchableText(item) {
    return [
      item.title,
      item.category,
      item.kind,
      item.lens,
      item.description,
      item.why,
      item.location,
      ...(item.tags || [])
    ].map(normalized).join(' ');
  }

  function createTextElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function createCard(item) {
    const card = document.createElement('article');
    card.className = `guide-card${item.featured ? ' guide-card--featured' : ''}`;

    if (item.image) {
      const media = document.createElement('div');
      media.className = 'guide-card__media';
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.imageAlt || '';
      image.loading = 'lazy';
      media.append(image);
      card.append(media);
    }

    const top = document.createElement('div');
    top.className = 'guide-card__top';
    top.append(createTextElement('span', `relation-badge relation-badge--${item.relationship || 'independent'}`, relationshipLabels[item.relationship] || relationshipLabels.independent));
    top.append(createTextElement('span', 'guide-card__kind', [item.kind, item.location].filter(Boolean).join(' · ')));

    const mark = createTextElement('div', 'guide-card__mark', (item.title || '?').trim().slice(0, 1).toLocaleUpperCase('nl'));
    mark.setAttribute('aria-hidden', 'true');

    const meta = createTextElement('p', 'guide-card__meta', [item.category, item.lens].filter(Boolean).join(' · '));
    const title = createTextElement('h3', '', item.title);
    const description = createTextElement('p', 'guide-card__description', item.description);

    const reason = document.createElement('div');
    reason.className = 'guide-card__reason';
    reason.append(createTextElement('strong', '', 'Waarom hier?'));
    reason.append(createTextElement('p', '', item.why));

    const tags = document.createElement('div');
    tags.className = 'guide-card__tags';
    (item.tags || []).forEach((tag) => tags.append(createTextElement('span', '', tag)));

    const link = createTextElement('a', 'guide-card__link', `${item.linkLabel || 'Bekijk deze vondst'} ↗`);
    link.href = item.url;
    link.target = '_blank';
    link.rel = item.relationship === 'affiliate' || item.relationship === 'partner' ? 'noopener sponsored' : 'noopener';
    link.setAttribute('aria-label', `${item.title} bekijken (opent in een nieuw venster)`);

    card.append(top, mark, meta, title, description, reason, tags, link);
    return card;
  }

  function render() {
    const visible = items
      .filter((item) => activeCategory === 'Alles' || item.category === activeCategory)
      .filter((item) => !query || searchableText(item).includes(query))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title, 'nl'));

    grid.replaceChildren();

    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'guide-empty';
      if (!items.length) {
        empty.append(
          createTextElement('span', 'guide-empty__mark', '✦'),
          createTextElement('h3', '', 'De eerste vondsten worden verzameld.'),
          createTextElement('p', '', 'Deze nieuwe ruimte wordt gevuld met boeken, mensen, plekken en hulpmiddelen die het verder onderzoeken waard zijn. Kom binnenkort nog eens kijken.')
        );
        status.textContent = 'De Wegwijzer is in opbouw.';
      } else {
        empty.append(
          createTextElement('h3', '', 'Nog niets gevonden.'),
          createTextElement('p', '', 'Probeer een ander zoekwoord of kies een andere categorie.')
        );
        status.textContent = 'Geen vondsten bij deze keuze.';
      }
      grid.append(empty);
      return;
    }

    visible.forEach((item) => grid.append(createCard(item)));
    status.textContent = `${visible.length} ${visible.length === 1 ? 'vondst' : 'vondsten'} om te verkennen.`;
  }

  if (items.length) {
    tools.hidden = false;
    const categories = ['Alles', ...new Set(items.map((item) => item.category).filter(Boolean))];
    categories.forEach((category) => {
      const button = createTextElement('button', category === activeCategory ? 'is-active' : '', category);
      button.type = 'button';
      button.addEventListener('click', () => {
        activeCategory = category;
        filters.querySelectorAll('button').forEach((candidate) => {
          const isActive = candidate === button;
          candidate.classList.toggle('is-active', isActive);
          candidate.setAttribute('aria-pressed', String(isActive));
        });
        render();
      });
      button.setAttribute('aria-pressed', String(category === activeCategory));
      filters.append(button);
    });

    search.addEventListener('input', () => {
      query = normalized(search.value.trim());
      render();
    });
  }

  render();
})();
