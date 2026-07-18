(function () {
  const content = window.ONWIJZE_CONTENT || [];

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const stopWords = new Set([
    'aan', 'als', 'ben', 'bij', 'dat', 'de', 'dit', 'doe', 'een', 'en', 'er', 'het',
    'hoe', 'ik', 'in', 'is', 'kan', 'me', 'met', 'mij', 'mijn', 'niet', 'of', 'om',
    'op', 'te', 'veel', 'van', 'wat', 'waarom', 'wanneer', 'wie', 'wil', 'zo', 'zoveel'
  ]);

  const concepts = [
    ['pieker', 'piekeren', 'overdenken', 'gedachten', 'onrust', 'angst', 'stress'],
    ['rust', 'rustig', 'onrust', 'overprikkeling', 'stress', 'zenuwstelsel'],
    ['verander', 'veranderen', 'verandering', 'neuroplasticiteit', 'gewoonte', 'patroon'],
    ['terugval', 'terugvallen', 'herhalen', 'gewoonte', 'patroon', 'verslaving'],
    ['eenzaam', 'eenzaamheid', 'verbondenheid', 'hechting', 'relatie'],
    ['boos', 'boosheid', 'woede', 'emotie', 'emotieregulatie'],
    ['bang', 'angst', 'veiligheid', 'stress', 'trauma'],
    ['afwijzing', 'afwijzingspijn', 'schaamte', 'hechting'],
    ['aandacht', 'adhd', 'focus', 'overprikkeling', 'zenuwstelsel'],
    ['identiteit', 'persoonlijkheid', 'zelfbeeld', 'wie ben'],
    ['liefde', 'relatie', 'hechting', 'verbondenheid'],
    ['brein', 'hersenen', 'zenuwstelsel', 'neuronen']
  ];

  function meaningfulWords(query) {
    const words = normalize(query).replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
    const useful = words.filter(word => !stopWords.has(word));
    return useful.length ? useful : words;
  }

  function alternatives(word) {
    const concept = concepts.find(group => group.some(term => term.includes(word) || word.includes(term)));
    return concept || [word];
  }

  function fieldScore(field, word, terms, weight) {
    if (field.includes(word)) return weight * 2;
    return terms.some(term => term !== word && field.includes(term)) ? weight : 0;
  }

  function score(item, query) {
    const words = meaningfulWords(query);
    if (!words.length) return 1;
    const title = normalize(item.title);
    const tags = normalize((item.tags || []).join(' '));
    const category = normalize(item.category);
    const summary = normalize(item.summary);
    let total = 0;
    for (const word of words) {
      const terms = alternatives(word);
      const wordScore = fieldScore(title, word, terms, 8)
        + fieldScore(tags, word, terms, 5)
        + fieldScore(category, word, terms, 3)
        + fieldScore(summary, word, terms, 2);
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
