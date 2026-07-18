(function () {
  const resultsRoot = document.querySelector('[data-knowledge-results]');
  if (!resultsRoot || !window.OnwijzeSearch) return;

  const dossiers = window.OnwijzeSearch.content.filter(item => item.type === 'dossier');
  const queryInput = document.querySelector('[data-knowledge-query]');
  const categoryRoot = document.querySelector('[data-category-routes]');
  const topicRoot = document.querySelector('[data-topic-filters]');
  const countRoot = document.querySelector('[data-knowledge-count]');
  const sortSelect = document.querySelector('[data-knowledge-sort]');
  const activePanel = document.querySelector('[data-active-filters]');
  const activeList = document.querySelector('[data-active-filter-list]');
  const resetButton = document.querySelector('[data-reset-filters]');
  const empty = document.querySelector('[data-knowledge-empty]');
  const visibleCountRoot = document.querySelector('[data-visible-count]');
  const resultNounRoot = document.querySelector('[data-result-noun]');
  const heroCountRoot = document.querySelector('[data-hero-result-count]');
  const morePanel = document.querySelector('[data-results-more]');
  const progressRoot = document.querySelector('[data-results-progress]');
  const loadMoreButton = document.querySelector('[data-load-more]');
  const searchSuggestions = document.querySelectorAll('[data-search-suggestion]');
  const randomButtons = document.querySelectorAll('[data-random-dossier]');
  const focusSearchButtons = document.querySelectorAll('[data-focus-atlas-search]');
  const atlasModeButtons = document.querySelectorAll('[data-atlas-mode]');
  const atlasModePanels = document.querySelectorAll('[data-atlas-panel]');
  const atlasViewTargets = document.querySelectorAll('[data-atlas-view-target]');
  const params = new URLSearchParams(location.search);
  let activeCategory = params.get('gebied') || '';
  const activeTags = new Set(params.getAll('thema'));

  const customAreaIcons = {
    brain: '<svg class="atlas-area-svg atlas-brain-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.2 4.1A3 3 0 0 0 6.9 7v.3a3.4 3.4 0 0 0-1.3 5.9v1.2a3.2 3.2 0 0 0 4.6 2.9M13.8 4.1A3 3 0 0 1 17.1 7v.3a3.4 3.4 0 0 1 1.3 5.9v1.2a3.2 3.2 0 0 1-4.6 2.9M10.2 4.1c1.1.2 1.8 1.1 1.8 2.2v11.6M13.8 4.1C12.7 4.3 12 5.2 12 6.3M6.9 7.3c1.4-.1 2.5.6 2.9 1.8M17.1 7.3c-1.4-.1-2.5.6-2.9 1.8M5.6 13.2c1.1-.7 2.5-.6 3.5.2M18.4 13.2c-1.1-.7-2.5-.6-3.5.2M10.2 17.3c-.4-1.4-1.3-2.1-2.6-2.2M13.8 17.3c.4-1.4 1.3-2.1 2.6-2.2"/></svg>',
    mendedHeart: '<svg class="atlas-area-svg atlas-heart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.2S4.6 15.9 4.6 9.8A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.4 2.8c0 6.1-7.4 10.4-7.4 10.4Z"/><path d="m12.7 6.2-2 3.1 2.1 1.8-2.2 2.2 2.3 1.8-1.5 2.8"/><path d="m8.7 11.5 1.7.2M12.8 13.2l1.7.2"/></svg>',
    fingerprint: '<svg class="atlas-area-svg atlas-fingerprint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 10a2 2 0 0 0-2 2c0 1-.1 2.5-.3 4M14 13.1c0 2.4 0 6.4-1 8.9M17.3 21c.1-.6.4-2.3.5-3M2.2 12A9.8 9.8 0 0 1 20 6M2.3 16h.1M21.8 16c.2-2 .1-5.4 0-6M5 19.5c.5-1.5 1-4.5 1-7.5a6 6 0 0 1 .3-2M8.7 22c.2-.7.4-1.3.6-2M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>',
    waves: '<svg class="atlas-area-svg atlas-waves-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7.5c2.7-2 5.3 2 8 0s5.3-2 8 0M4 12c2.7-2 5.3 2 8 0s5.3-2 8 0M4 16.5c2.7-2 5.3 2 8 0s5.3-2 8 0"/></svg>'
  };

  const categoryInfo = {
    'Brein & zenuwstelsel': { icon: 'brain', description: 'Hersenen, lichaam en signalen' },
    'Emoties & regulatie': { icon: 'waves', description: 'Voelen, stress en tot rust komen' },
    'Trauma & herstel': { icon: 'mendedHeart', description: 'Wat sporen nalaat en wat helpt' },
    'Leren & veranderen': { icon: '↗', description: 'Plasticiteit, gewoontes en groei' },
    'Persoonlijkheid & identiteit': { icon: 'fingerprint', description: 'Wie we zijn en kunnen worden' },
    'Relaties & hechting': { icon: '∞', description: 'Nabijheid, grenzen en verbinding' },
    'Groepsgedrag & beïnvloeding': { icon: '△', description: 'Waarom mensen samen anders kiezen' },
    'Bewustzijn & metafysica': { icon: '☾', description: 'Geest, werkelijkheid en het onbekende' }
  };

  function setAreaIcon(element, category) {
    const icon = categoryInfo[category]?.icon || '○';
    if (customAreaIcons[icon]) element.innerHTML = customAreaIcons[icon];
    else element.textContent = icon;
  }

  const categories = Object.keys(categoryInfo);
  const tagCounts = new Map();
  dossiers.forEach(item => (item.tags || []).forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const preferredTags = ['hersenen', 'zenuwstelsel', 'herstel', 'leren', 'gedrag', 'lichaam', 'stress', 'veiligheid', 'hechting', 'geheugen', 'gewoonten', 'bewustzijn'];
  const featuredTags = preferredTags.filter(tag => tagCounts.has(tag));
  queryInput.value = params.get('q') || '';
  sortSelect.value = params.get('sort') || 'relevant';
  const pageSize = matchMedia('(max-width: 620px)').matches ? 6 : 8;
  let visibleLimit = pageSize;

  function showResults() {
    document.querySelector('.knowledge-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setAtlasMode(mode, moveFocus) {
    atlasModeButtons.forEach(button => {
      const selected = button.dataset.atlasMode === mode;
      button.setAttribute('aria-selected', String(selected));
      if (selected && moveFocus) button.focus();
    });
    atlasModePanels.forEach(panel => { panel.hidden = panel.dataset.atlasPanel !== mode; });
  }

  function makeButton(className, text, pressed, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.setAttribute('aria-pressed', String(pressed));
    button.addEventListener('click', onClick);
    return button;
  }

  function discoveryOrder(items) {
    const buckets = categories.map(category => items
      .filter(item => item.category === category)
      .sort((a, b) => a.title.localeCompare(b.title, 'nl')));
    const mixed = [];
    let depth = 0;
    while (mixed.length < items.length) {
      buckets.forEach(bucket => { if (bucket[depth]) mixed.push(bucket[depth]); });
      depth += 1;
    }
    return mixed;
  }

  function renderCategories() {
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'category-route';
    all.setAttribute('aria-pressed', String(!activeCategory));
    all.innerHTML = '<span class="category-route__top"><span class="category-route__icon" aria-hidden="true">✦</span><span class="category-route__count"></span></span><span><strong>De hele atlas</strong><small>Bekijk alle beschikbare gebieden</small></span>';
    all.querySelector('.category-route__count').textContent = `${dossiers.length} dossiers`;
    all.addEventListener('click', () => { activeCategory = ''; render(true); showResults(); });

    const buttons = categories.map(category => {
      const info = categoryInfo[category] || { icon: '○', description: 'Verdiepende dossiers' };
      const button = document.createElement('button');
      const amount = dossiers.filter(item => item.category === category).length;
      button.type = 'button';
      button.className = 'category-route';
      button.setAttribute('aria-pressed', String(activeCategory === category));
      button.innerHTML = '<span class="category-route__top"><span class="category-route__icon" aria-hidden="true"></span><span class="category-route__count"></span></span><span><strong></strong><small></small></span>';
      setAreaIcon(button.querySelector('.category-route__icon'), category);
      button.querySelector('.category-route__count').textContent = amount ? `${amount} ${amount === 1 ? 'dossier' : 'dossiers'}` : 'in opbouw';
      button.querySelector('strong').textContent = category;
      button.querySelector('small').textContent = info.description;
      button.addEventListener('click', () => { activeCategory = activeCategory === category ? '' : category; render(true); showResults(); });
      return button;
    });
    categoryRoot.replaceChildren(all, ...buttons);
  }

  function renderTopics() {
    topicRoot.replaceChildren(...featuredTags.map(tag => makeButton('topic-chip', tag, activeTags.has(tag), () => {
      activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
      render(true);
      showResults();
    })));
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = 'knowledge-card';
    const meta = document.createElement('div');
    meta.className = 'knowledge-card__meta';
    meta.innerHTML = '<span class="knowledge-card__area-icon" aria-hidden="true"></span><span></span><span class="knowledge-card__level"></span>';
    setAreaIcon(meta.firstElementChild, item.category);
    meta.children[1].textContent = item.category;
    meta.lastElementChild.textContent = item.level || 'Onderzocht';
    const heading = document.createElement('h3');
    const link = document.createElement('a');
    link.href = item.url;
    link.textContent = item.title;
    heading.append(link);
    const summary = document.createElement('p');
    summary.textContent = item.summary;
    const tags = document.createElement('div');
    tags.className = 'knowledge-card__tags';
    (item.tags || []).slice(0, 2).forEach(tag => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'card-tag';
      button.textContent = tag;
      button.title = `Filter op ${tag}`;
      button.addEventListener('click', () => { activeTags.add(tag); render(true); showResults(); });
      tags.append(button);
    });
    const more = document.createElement('a');
    more.className = 'text-link';
    more.href = item.url;
    more.innerHTML = 'Open dossier <span aria-hidden="true">→</span>';
    article.append(meta, heading, summary, tags, more);
    return article;
  }

  function matchesQuery(item, query) {
    const normalized = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = normalized(query).split(/\s+/).filter(Boolean);
    const haystack = normalized([item.title, item.category, item.summary, ...(item.tags || [])].join(' '));
    return words.every(word => haystack.includes(word));
  }

  function updateUrl(query) {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (activeCategory) next.set('gebied', activeCategory);
    [...activeTags].sort().forEach(tag => next.append('thema', tag));
    if (sortSelect.value !== 'relevant') next.set('sort', sortSelect.value);
    history.replaceState({}, '', `${location.pathname}${next.toString() ? `?${next}` : ''}`);
  }

  function renderActive(query) {
    const entries = [];
    if (query) entries.push({ label: `Zoekwoord: ${query}`, clear: () => { queryInput.value = ''; } });
    if (activeCategory) entries.push({ label: activeCategory, clear: () => { activeCategory = ''; } });
    activeTags.forEach(tag => entries.push({ label: tag, clear: () => activeTags.delete(tag) }));
    activeList.replaceChildren(...entries.map(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'active-chip';
      button.textContent = entry.label;
      button.setAttribute('aria-label', `Verwijder filter ${entry.label}`);
      button.addEventListener('click', () => { entry.clear(); render(true); });
      return button;
    }));
    activePanel.hidden = entries.length === 0;
    resetButton.hidden = entries.length === 0;
  }

  function reset() {
    queryInput.value = '';
    activeCategory = '';
    activeTags.clear();
    sortSelect.value = 'relevant';
    render(true);
    queryInput.focus();
  }

  function render(resetLimit) {
    if (resetLimit) visibleLimit = pageSize;
    const query = queryInput.value.trim();
    let results = dossiers.filter(item =>
      (!activeCategory || item.category === activeCategory) &&
      (!activeTags.size || (item.tags || []).some(tag => activeTags.has(tag))) &&
      matchesQuery(item, query)
    );
    const isOpenAtlas = !query && !activeCategory && !activeTags.size && sortSelect.value === 'relevant';
    if (sortSelect.value === 'az' || (!query && !isOpenAtlas && sortSelect.value === 'relevant')) results.sort((a, b) => a.title.localeCompare(b.title, 'nl'));
    if (sortSelect.value === 'category') results.sort((a, b) => a.category.localeCompare(b.category, 'nl') || a.title.localeCompare(b.title, 'nl'));
    if (isOpenAtlas) results = discoveryOrder(results);
    if (query && sortSelect.value === 'relevant') {
      const order = window.OnwijzeSearch.search(query, 'dossier');
      results.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    const visibleResults = results.slice(0, visibleLimit);
    resultsRoot.replaceChildren(...visibleResults.map(card));
    resultsRoot.hidden = results.length === 0;
    empty.hidden = results.length !== 0;
    countRoot.textContent = results.length;
    resultNounRoot.textContent = results.length === 1 ? 'vondst' : 'vondsten';
    visibleCountRoot.textContent = visibleResults.length;
    heroCountRoot.textContent = results.length;
    progressRoot.textContent = `${visibleResults.length} van ${results.length} blootgelegd`;
    morePanel.hidden = !results.length || visibleResults.length >= results.length;
    renderCategories();
    renderTopics();
    renderActive(query);
    updateUrl(query);
  }

  queryInput.addEventListener('input', () => render(true));
  queryInput.addEventListener('keydown', event => { if (event.key === 'Enter') showResults(); });
  sortSelect.addEventListener('change', () => render(true));
  resetButton.addEventListener('click', reset);
  document.querySelector('[data-empty-reset]').addEventListener('click', reset);
  loadMoreButton.addEventListener('click', () => { visibleLimit += pageSize; render(false); });
  searchSuggestions.forEach(button => button.addEventListener('click', () => {
    queryInput.value = button.dataset.searchSuggestion;
    activeCategory = '';
    activeTags.clear();
    sortSelect.value = 'relevant';
    render(true);
    showResults();
  }));
  atlasModeButtons.forEach(button => button.addEventListener('click', () => setAtlasMode(button.dataset.atlasMode, false)));
  atlasViewTargets.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    setAtlasMode(link.dataset.atlasViewTarget, false);
    document.querySelector('.knowledge-explorer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  focusSearchButtons.forEach(button => button.addEventListener('click', () => {
    queryInput.focus({ preventScroll: true });
    document.querySelector('.knowledge-search').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  randomButtons.forEach(button => button.addEventListener('click', () => {
    if (!dossiers.length) return;
    const previousUrl = sessionStorage.getItem('atlas-last-random');
    const choices = dossiers.length > 1 ? dossiers.filter(item => item.url !== previousUrl) : dossiers;
    const item = choices[Math.floor(Math.random() * choices.length)];
    sessionStorage.setItem('atlas-last-random', item.url);
    location.href = item.url;
  }));
  setAtlasMode(activeCategory ? 'gebieden' : activeTags.size ? 'sporen' : 'vragen', false);
  render();
  if (params.has('gebied') || params.has('thema') || params.has('q')) {
    requestAnimationFrame(showResults);
    setTimeout(showResults, 180);
  }
})();
