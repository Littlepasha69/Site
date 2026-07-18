(function () {
  const root = document.querySelector('[data-collection]');
  if (!root || !window.OnwijzeSearch) return;
  const kind = root.dataset.collection;
  const types = kind === 'denkstukken' ? ['denkstuk', 'ervaring'] : ['dossier'];
  const items = window.OnwijzeSearch.content.filter(item => types.includes(item.type));
  root.replaceChildren(...items.map(window.OnwijzeSearch.card));
  const count = document.querySelector('[data-collection-count]');
  if (count) count.textContent = `${items.length} ${items.length === 1 ? 'publicatie' : 'publicaties'}`;
})();
