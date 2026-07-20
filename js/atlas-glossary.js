(function atlasGlossary() {
  const glossary = window.ATLAS_GLOSSARY || {};

  function safeReturnPath(value) {
    if (!value) return 'onderwerpen.html';
    const candidate = value.trim().replace(/^\.\//, '');
    const allowed = /^(?:onderwerpen\/)?[a-z0-9-]+\.html(?:\?[^#]*)?(?:#[a-z0-9-]+)?$/i;
    return allowed.test(candidate) ? candidate : 'onderwerpen.html';
  }

  function renderTermPage() {
    const page = document.querySelector('[data-atlas-term-page]');
    if (!page) return;

    const params = new URLSearchParams(location.search);
    const slug = (params.get('term') || '').toLowerCase().trim();
    const entry = glossary[slug];
    const back = document.querySelector('[data-atlas-term-back]');
    if (back) back.href = safeReturnPath(params.get('from'));

    if (!entry) {
      page.hidden = true;
      const missing = document.querySelector('[data-atlas-term-missing]');
      if (missing) missing.hidden = false;
      document.title = 'Begrip nog niet gevonden — Atlaswoordenboek';
      return;
    }

    document.title = `${entry.term} in gewone taal — Atlaswoordenboek`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = entry.quick;

    document.querySelectorAll('[data-term-number]').forEach(node => { node.textContent = entry.number; });
    document.querySelectorAll('[data-term-name]').forEach(node => { node.textContent = entry.term; });
    document.querySelector('[data-term-kind]').textContent = entry.kind;
    document.querySelector('[data-term-quick]').textContent = entry.quick;
    document.querySelector('[data-term-not]').textContent = entry.not;
    document.querySelector('[data-term-scene]').textContent = entry.example.scene;
    document.querySelector('[data-term-lens]').textContent = entry.example.lens;
    document.querySelector('[data-term-remember]').textContent = entry.remember;
    document.querySelector('[data-term-checked]').textContent = `Gecontroleerd ${entry.checked}`;

    const explanation = document.querySelector('[data-term-explanation]');
    explanation.replaceChildren(...entry.explanation.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));

    const dossier = document.querySelector('[data-term-dossier]');
    dossier.href = entry.dossier;
    dossier.textContent = `${entry.dossierLabel} →`;

    const sources = document.querySelector('[data-term-sources]');
    sources.replaceChildren(...entry.sources.map(source => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.label;
      item.append(link);
      return item;
    }));
  }

  function findTextNode(root, term) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}-])(${escaped})(?=$|[^\\p{L}\\p{N}-])`, 'iu');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest('a, h1, h2, h3, nav, button, code, pre, script, style, .section-label, .source-list, .related-dossiers')) return NodeFilter.FILTER_REJECT;
        return pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const node = walker.nextNode();
    return node ? { node, pattern } : null;
  }

  function linkDossierTerms() {
    const content = document.querySelector('.dossier-page .dossier-content, .onderwerpen-container .denktext');
    if (!content) return;
    const pageName = location.pathname.split('/').pop() || '';

    Object.entries(glossary).forEach(([slug, entry]) => {
      const matchData = findTextNode(content, entry.term);
      if (!matchData) return;
      const { node, pattern } = matchData;
      const match = pattern.exec(node.nodeValue);
      if (!match) return;

      const start = match.index + match[1].length;
      const end = start + match[2].length;
      const anchorId = `atlas-word-${slug}`;
      const link = document.createElement('a');
      link.className = 'atlas-term';
      link.id = anchorId;
      link.href = `../begrip.html?term=${encodeURIComponent(slug)}&from=${encodeURIComponent(`onderwerpen/${pageName}#${anchorId}`)}`;
      link.textContent = node.nodeValue.slice(start, end);
      link.title = `${entry.term} kort uitgelegd`;
      link.setAttribute('aria-label', `${entry.term}: open een korte uitleg in het Atlaswoordenboek`);

      const fragment = document.createDocumentFragment();
      fragment.append(node.nodeValue.slice(0, start), link, node.nodeValue.slice(end));
      node.replaceWith(fragment);
    });

    if (location.hash.startsWith('#atlas-word-')) {
      const restoreReadingPosition = () => document.querySelector(location.hash)?.scrollIntoView({ block: 'center' });
      requestAnimationFrame(() => requestAnimationFrame(restoreReadingPosition));
      addEventListener('load', () => setTimeout(restoreReadingPosition, 80), { once:true });
    }
  }

  renderTermPage();
  linkDossierTerms();
}());
