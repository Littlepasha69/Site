(function () {
  const root = document.querySelector('[data-thought-results]');
  if (!root || !window.OnwijzeSearch) return;
  const publicationTime = value => {
    const match = String(value || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    const time = Date.parse(value);
    return Number.isNaN(time) ? 0 : time;
  };
  const items = window.OnwijzeSearch.content
    .filter(item => ['denkstuk', 'ervaring'].includes(item.type))
    .sort((a, b) => publicationTime(b.date) - publicationTime(a.date));
  const query = document.querySelector('[data-thought-query]');
  const typeButtons = [...document.querySelectorAll('[data-thought-type]')];
  const categorySelect = document.querySelector('[data-thought-category]');
  const count = document.querySelector('[data-thought-count]');
  const resetButton = document.querySelector('[data-thought-reset]');
  const empty = document.querySelector('[data-thought-empty]');
  const params = new URLSearchParams(location.search);
  let activeType = params.get('soort') || 'alles';
  const kindLabels = { ervaring:'Persoonlijke ervaring', opinie:'Opinie', filosofie:'Filosofische verkenning', maatschappij:'Maatschappijkritiek', vraag:'Open vraag', hypothese:'Persoonlijke hypothese' };
  if (!['alles', ...Object.keys(kindLabels)].includes(activeType)) activeType = 'alles';
  query.value = params.get('q') || '';

  [...new Set(items.map(item => item.category))].sort((a,b) => a.localeCompare(b,'nl')).forEach(category => {
    const option = document.createElement('option'); option.value = category; option.textContent = category; categorySelect.append(option);
  });
  categorySelect.value = params.get('thema') || '';
  document.querySelector('[data-thought-total]').textContent = items.length;

  const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function matches(item, value) {
    const words = normalize(value).split(/\s+/).filter(Boolean);
    const text = normalize([item.title,item.summary,item.category,...(item.tags||[])].join(' '));
    return words.every(word => text.includes(word));
  }

  function card(item) {
    const article = document.createElement('article'); article.className = 'thought-card';
    const image = document.createElement('img'); image.className = 'thought-card__image'; image.src = item.image; image.alt = '';
    const veil = document.createElement('div'); veil.className = 'thought-card__veil'; veil.setAttribute('aria-hidden','true');
    const content = document.createElement('div'); content.className = 'thought-card__content';
    const meta = document.createElement('div'); meta.className = 'thought-card__meta'; meta.textContent = `${kindLabels[item.kind] || 'Denkstuk'} · ${item.category}`;
    const heading = document.createElement('h3'); const link = document.createElement('a'); link.href = item.url; link.textContent = item.title; heading.append(link);
    const summary = document.createElement('p'); summary.textContent = item.summary;
    const tags = document.createElement('div'); tags.className = 'thought-card__tags'; (item.tags||[]).slice(0,4).forEach(tag => { const span=document.createElement('span'); span.textContent=`#${tag}`; tags.append(span); });
    content.append(meta,heading,summary,tags); article.append(image,veil,content); return article;
  }

  function updateUrl(value) {
    const next = new URLSearchParams(); if(value) next.set('q',value); if(activeType!=='alles') next.set('soort',activeType); if(categorySelect.value) next.set('thema',categorySelect.value);
    history.replaceState({},'',`${location.pathname}${next.toString()?`?${next}`:''}`);
  }
  function render() {
    const value=query.value.trim();
    const results=items.filter(item => (activeType==='alles'||item.kind===activeType) && (!categorySelect.value||item.category===categorySelect.value) && matches(item,value));
    root.replaceChildren(...results.map(card)); root.hidden=!results.length; empty.hidden=!!results.length;
    count.textContent=`${results.length} ${results.length===1?'publicatie':'publicaties'}`;
    typeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.thoughtType===activeType)));
    resetButton.hidden=!value&&activeType==='alles'&&!categorySelect.value; updateUrl(value);
  }
  function reset(){query.value='';activeType='alles';categorySelect.value='';render();query.focus();}
  query.addEventListener('input',render); categorySelect.addEventListener('change',render);
  typeButtons.forEach(button=>button.addEventListener('click',()=>{activeType=button.dataset.thoughtType;render();}));
  resetButton.addEventListener('click',reset); document.querySelector('[data-thought-empty-reset]').addEventListener('click',reset); render();
})();
