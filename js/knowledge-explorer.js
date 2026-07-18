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
  const params = new URLSearchParams(location.search);
  let activeCategory = params.get('gebied') || '';
  const activeTags = new Set(params.getAll('thema'));

  const categoryInfo = {
    'Brein & zenuwstelsel': { icon: '◉', description: 'Hersenen, lichaam en signalen' },
    'Emoties & regulatie': { icon: '≈', description: 'Voelen, stress en tot rust komen' },
    'Trauma & herstel': { icon: '◇', description: 'Wat sporen nalaat en wat helpt' },
    'Leren & veranderen': { icon: '↗', description: 'Plasticiteit, gewoontes en groei' },
    'Persoonlijkheid & identiteit': { icon: '✦', description: 'Wie we zijn en kunnen worden' },
    'Relaties & hechting': { icon: '∞', description: 'Nabijheid, grenzen en verbinding' },
    'Groepsgedrag & beïnvloeding': { icon: '△', description: 'Waarom mensen samen anders kiezen' },
    'Bewustzijn & metafysica': { icon: '☾', description: 'Geest, werkelijkheid en het onbekende' }
  };

  const categories = Object.keys(categoryInfo);
  const tagCounts = new Map();
  dossiers.forEach(item => (item.tags || []).forEach(tag => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)));
  const preferredTags = ['hersenen', 'zenuwstelsel', 'herstel', 'leren', 'gedrag', 'lichaam', 'stress', 'veiligheid', 'hechting', 'geheugen', 'gewoonten', 'bewustzijn'];
  const featuredTags = preferredTags.filter(tag => tagCounts.has(tag));
  queryInput.value = params.get('q') || '';
  sortSelect.value = params.get('sort') || 'relevant';

  function makeButton(className, text, pressed, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.setAttribute('aria-pressed', String(pressed));
    button.addEventListener('click', onClick);
    return button;
  }

  function renderCategories() {
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'category-route';
    all.setAttribute('aria-pressed', String(!activeCategory));
    all.innerHTML = '<span class="category-route__top"><span class="category-route__icon" aria-hidden="true">✦</span><span class="category-route__count"></span></span><span><strong>De hele atlas</strong><small>Bekijk alle beschikbare gebieden</small></span>';
    all.querySelector('.category-route__count').textContent = `${dossiers.length} dossiers`;
    all.addEventListener('click', () => { activeCategory = ''; render(); });

    const buttons = categories.map(category => {
      const info = categoryInfo[category] || { icon: '○', description: 'Verdiepende dossiers' };
      const button = document.createElement('button');
      const amount = dossiers.filter(item => item.category === category).length;
      button.type = 'button';
      button.className = 'category-route';
      button.setAttribute('aria-pressed', String(activeCategory === category));
      button.innerHTML = '<span class="category-route__top"><span class="category-route__icon" aria-hidden="true"></span><span class="category-route__count"></span></span><span><strong></strong><small></small></span>';
      button.querySelector('.category-route__icon').textContent = info.icon;
      button.querySelector('.category-route__count').textContent = amount ? `${amount} ${amount === 1 ? 'dossier' : 'dossiers'}` : 'in opbouw';
      button.querySelector('strong').textContent = category;
      button.querySelector('small').textContent = info.description;
      button.addEventListener('click', () => { activeCategory = activeCategory === category ? '' : category; render(); });
      return button;
    });
    categoryRoot.replaceChildren(all, ...buttons);
  }

  function renderTopics() {
    topicRoot.replaceChildren(...featuredTags.map(tag => makeButton('topic-chip', tag, activeTags.has(tag), () => {
      activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
      render();
    })));
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = 'knowledge-card';
    const meta = document.createElement('div');
    meta.className = 'knowledge-card__meta';
    meta.innerHTML = '<span class="knowledge-card__dot" aria-hidden="true"></span><span></span><span class="knowledge-card__level"></span>';
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
    (item.tags || []).slice(0, 4).forEach(tag => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'card-tag';
      button.textContent = tag;
      button.title = `Filter op ${tag}`;
      button.addEventListener('click', () => { activeTags.add(tag); render(); document.querySelector('.knowledge-explorer').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
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
      button.addEventListener('click', () => { entry.clear(); render(); });
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
    render();
    queryInput.focus();
  }

  function render() {
    const query = queryInput.value.trim();
    let results = dossiers.filter(item =>
      (!activeCategory || item.category === activeCategory) &&
      (!activeTags.size || (item.tags || []).some(tag => activeTags.has(tag))) &&
      matchesQuery(item, query)
    );
    if (sortSelect.value === 'az' || (!query && sortSelect.value === 'relevant')) results.sort((a, b) => a.title.localeCompare(b.title, 'nl'));
    if (sortSelect.value === 'category') results.sort((a, b) => a.category.localeCompare(b.category, 'nl') || a.title.localeCompare(b.title, 'nl'));
    if (query && sortSelect.value === 'relevant') {
      const order = window.OnwijzeSearch.search(query, 'dossier');
      results.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    resultsRoot.replaceChildren(...results.map(card));
    resultsRoot.hidden = results.length === 0;
    empty.hidden = results.length !== 0;
    countRoot.textContent = `${results.length} ${results.length === 1 ? 'dossier' : 'dossiers'}`;
    renderCategories();
    renderTopics();
    renderActive(query);
    updateUrl(query);
  }

  queryInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);
  resetButton.addEventListener('click', reset);
  document.querySelector('[data-empty-reset]').addEventListener('click', reset);
  render();
})();
