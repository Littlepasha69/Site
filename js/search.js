(function () {
  const content = window.ONWIJZE_CONTENT || [];

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function score(item, query) {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    if (!words.length) return 1;
    const title = normalize(item.title);
    const tags = normalize((item.tags || []).join(' '));
    const category = normalize(item.category);
    const summary = normalize(item.summary);
    let total = 0;
    for (const word of words) {
      let wordScore = 0;
      if (title.includes(word)) wordScore += 8;
      if (tags.includes(word)) wordScore += 5;
      if (category.includes(word)) wordScore += 3;
      if (summary.includes(word)) wordScore += 2;
      if (!wordScore) return 0;
      total += wordScore;
    }
    return total;
  }

  function search(query, type = 'alles') {
    return content
      .map(item => ({ item, relevance: score(item, query) }))
      .filter(result => result.relevance > 0 && (type === 'alles' || result.item.type === type))
      .sort((a, b) => b.relevance - a.relevance || a.item.title.localeCompare(b.item.title, 'nl'))
      .map(result => result.item);
  }

  function card(item) {
    const article = document.createElement('article');
    article.className = 'result-card';
    article.innerHTML = `
      <div class="result-card__meta"><span>${item.type}</span><span>${item.category}</span></div>
      <h2><a href="${item.url}">${item.title}</a></h2>
      <p>${item.summary}</p>
      <a class="text-link" href="${item.url}">Lees verder <span aria-hidden="true">→</span></a>`;
    return article;
  }

  window.OnwijzeSearch = { content, search, card };

  const resultsRoot = document.querySelector('[data-search-results]');
  if (!resultsRoot) return;

  const form = document.querySelector('[data-search-form]');
  const input = form.querySelector('input[name="q"]');
  const status = document.querySelector('[data-search-status]');
  const filterButtons = Array.from(document.querySelectorAll('[data-type-filter]'));
  const params = new URLSearchParams(location.search);
  let activeType = params.get('type') || 'alles';
  input.value = params.get('q') || '';

  function render(pushState = false) {
    const query = input.value.trim();
    const results = search(query, activeType);
    resultsRoot.replaceChildren(...results.map(card));
    status.textContent = query
      ? `${results.length} ${results.length === 1 ? 'resultaat' : 'resultaten'} voor “${query}”`
      : `${results.length} publicaties in de bibliotheek`;
    filterButtons.forEach(button => {
      const active = button.dataset.typeFilter === activeType;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (pushState) {
      const next = new URLSearchParams();
      if (query) next.set('q', query);
      if (activeType !== 'alles') next.set('type', activeType);
      history.replaceState({}, '', `${location.pathname}${next.toString() ? `?${next}` : ''}`);
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); render(true); });
  input.addEventListener('input', () => render(true));
  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeType = button.dataset.typeFilter;
    render(true);
  }));
  render();
})();
