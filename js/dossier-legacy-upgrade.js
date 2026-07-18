(function () {
  const oldMain = document.querySelector('main.onderwerpen-container');
  const oldArticle = oldMain?.querySelector('.onderwerp-article');
  const oldContent = oldArticle?.querySelector('.denktext');
  const title = oldArticle?.querySelector('h1')?.textContent.trim();
  if (!oldMain || !oldArticle || !oldContent || !title) return;

  const filename = location.pathname.split('/').pop();
  const entry = (window.ONWIJZE_CONTENT || []).find(item => item.type === 'dossier' && item.url === `onderwerpen/${filename}`) || {
    title,
    category: 'De Menselijke Atlas',
    level: 'Basisdossier',
    summary: `Een eerste verkenning van ${title.toLowerCase()}.`
  };

  const brainIcon = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M10.2 4.1A3 3 0 0 0 6.9 7v.3a3.4 3.4 0 0 0-1.3 5.9v1.2a3.2 3.2 0 0 0 4.6 2.9M13.8 4.1A3 3 0 0 1 17.1 7v.3a3.4 3.4 0 0 1 1.3 5.9v1.2a3.2 3.2 0 0 1-4.6 2.9M10.2 4.1c1.1.2 1.8 1.1 1.8 2.2v11.6M13.8 4.1C12.7 4.3 12 5.2 12 6.3M6.9 7.3c1.4-.1 2.5.6 2.9 1.8M17.1 7.3c-1.4-.1-2.5.6-2.9 1.8M5.6 13.2c1.1-.7 2.5-.6 3.5.2M18.4 13.2c-1.1-.7-2.5-.6-3.5.2M10.2 17.3c-.4-1.4-1.3-2.1-2.6-2.2M13.8 17.3c.4-1.4 1.3-2.1 2.6-2.2"/></svg>';
  const heartIcon = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M12 20.2S4.6 15.9 4.6 9.8A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.4 2.8c0 6.1-7.4 10.4-7.4 10.4Z"/><path d="m12.7 6.2-2 3.1 2.1 1.8-2.2 2.2 2.3 1.8-1.5 2.8"/></svg>';

  function areaIcon(category) {
    if (category === 'Brein & zenuwstelsel') return brainIcon;
    if (category === 'Trauma & herstel') return heartIcon;
    if (category === 'Leren & veranderen') return '↗';
    return '○';
  }

  function slugify(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function labelFor(heading) {
    const value = heading.toLowerCase();
    if (value.includes('bron')) return ['Onderbouwing', 'Bestaande bronnen'];
    if (value.includes('stoorn') || value.includes('wanneer')) return ['Afbakening', 'Medische context'];
    if (value.includes('onderzoek')) return ['Onderzoekslaag', 'Verdere verdieping'];
    if (value.includes('herstel') || value.includes('prevent')) return ['Praktijklaag', 'Mogelijkheden en grenzen'];
    return ['Begrip', 'Overzicht'];
  }

  const oldHeader = document.querySelector('body > header');
  const oldFooter = document.querySelector('body > footer');
  const contributionLink = oldContent.querySelector('.cta-bewerk a')?.getAttribute('href') || `../jouw-bijdrage.html?onderwerp=${filename.replace(/\.html$/, '')}`;
  const wordCount = oldContent.textContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(2, Math.ceil(wordCount / 210));

  const header = document.createElement('site-header');
  header.setAttribute('active', 'kennisbank');
  header.setAttribute('base', '../');
  oldHeader?.replaceWith(header);

  const hero = document.createElement('header');
  hero.className = 'dossier-hero';
  if (entry.category === 'Trauma & herstel') hero.classList.add('dossier-hero--trauma');
  hero.innerHTML = `
    <div class="dossier-hero__inner">
      <nav class="dossier-breadcrumb" aria-label="Kruimelpad"><a href="../onderwerpen.html">De Menselijke Atlas</a><span aria-hidden="true">/</span><a href="../onderwerpen.html?gebied=${encodeURIComponent(entry.category)}">${entry.category}</a></nav>
      <div class="dossier-hero__grid">
        <div>
          <div class="dossier-area"><span aria-hidden="true">${areaIcon(entry.category)}</span><div><small>Atlasgebied</small><strong>${entry.category}</strong></div></div>
          <p class="eyebrow">Atlasdossier</p><h1>${title}</h1><p class="dossier-question">${entry.summary}</p>
        </div>
        <div class="dossier-status" aria-label="Status van dit dossier">
          <span class="evidence-badge evidence-badge--strong">${entry.level || 'Basisdossier'}</span>
          <dl><div><dt>Leesduur</dt><dd>${readingTime} minuten</dd></div><div><dt>Inhoudsstatus</dt><dd>Basisdossier</dd></div><div><dt>Leeswijzen</dt><dd>Overzicht · bronnen</dd></div></dl>
        </div>
      </div>
    </div>`;

  const summary = document.createElement('section');
  summary.className = 'dossier-summary';
  summary.id = 'kern';
  summary.innerHTML = `<p class="eyebrow">De kern in gewone taal</p><h2>${entry.summary}</h2>`;

  const dossierContent = document.createElement('article');
  dossierContent.className = 'dossier-content legacy-dossier-content';
  dossierContent.append(summary);

  const sections = [];
  let activeSection = summary;
  let relatedSource = null;
  [...oldContent.childNodes].forEach(node => {
    if (node.nodeType === 1 && node.matches('.cta-bewerk')) return;
    if (node.nodeType === 1 && node.matches('section.gerelateerd')) {
      relatedSource = node;
      return;
    }
    if (node.nodeType === 1 && node.matches('h2')) {
      const headingText = node.textContent.trim();
      const section = document.createElement('section');
      section.className = 'dossier-section legacy-dossier-section';
      section.id = slugify(headingText) || `deel-${sections.length + 1}`;
      const [layer, qualifier] = labelFor(headingText);
      const label = document.createElement('div');
      label.className = 'section-label';
      label.innerHTML = `<span>${layer}</span><b>${qualifier}</b>`;
      section.append(label, node);
      dossierContent.append(section);
      sections.push({ section, heading: headingText });
      activeSection = section;
      return;
    }
    activeSection.append(node);
  });

  sections.forEach(({ section, heading }) => {
    if (/bron/i.test(heading)) section.querySelectorAll('ul,ol').forEach(list => list.classList.add('legacy-source-list'));
  });

  if (relatedSource) {
    const related = document.createElement('section');
    related.className = 'related-dossiers legacy-related-dossiers';
    related.setAttribute('aria-labelledby', 'related-title');
    related.innerHTML = '<p class="eyebrow">Ga verder door de Atlas</p><h2 id="related-title">Verwante routes</h2><div></div>';
    const cards = related.querySelector('div');
    [...relatedSource.querySelectorAll('li')].forEach(item => {
      const sourceLink = item.querySelector('a');
      if (!sourceLink) return;
      const card = document.createElement('a');
      card.href = sourceLink.getAttribute('href');
      const description = item.textContent.replace(sourceLink.textContent, '').replace(/^\s*[—–-]\s*/, '').trim();
      card.innerHTML = `<span>Dossier</span><strong>${sourceLink.textContent}</strong><small>${description || 'Lees verder door de Atlas'} →</small>`;
      cards.append(card);
    });
    dossierContent.append(related);
  }

  const contribution = document.createElement('section');
  contribution.className = 'legacy-dossier-contribution';
  contribution.innerHTML = `<div><span>Dit dossier groeit mee</span><h2>Zie je een ontbrekende bron of belangrijke nuance?</h2><p>Deel je aanvulling met de redactie. We nemen bijdragen niet automatisch over, maar bekijken ze zorgvuldig.</p></div><a href="${contributionLink}">Draag iets bij →</a>`;
  dossierContent.append(contribution);

  const toc = document.createElement('aside');
  toc.className = 'dossier-toc';
  toc.innerHTML = '<p>In dit dossier</p><a href="#kern">De kern</a>';
  sections.forEach(({ section, heading }) => {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.textContent = heading;
    toc.append(link);
  });

  const layout = document.createElement('div');
  layout.className = 'dossier-layout';
  layout.append(toc, dossierContent);
  const main = document.createElement('main');
  main.id = 'inhoud';
  main.className = 'dossier-page legacy-atlas-dossier';
  main.append(hero, layout);
  oldMain.replaceWith(main);
  oldFooter?.remove();

  const footer = document.createElement('site-footer');
  footer.setAttribute('base', '../');
  document.body.append(footer);
  document.body.className = 'legacy-atlas-dossier-body';
  document.title = `${title} — De Menselijke Atlas`;
})();
