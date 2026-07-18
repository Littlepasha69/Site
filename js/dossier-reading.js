(function () {
  const page = document.querySelector('.dossier-page');
  const content = page?.querySelector('.dossier-content');
  const toc = page?.querySelector('.dossier-toc');
  if (!page || !content || !toc) return;

  const tocLinks = [...toc.querySelectorAll('a[href^="#"]')];
  const chapters = tocLinks
    .map(link => {
      const id = decodeURIComponent(link.getAttribute('href').slice(1));
      return { link, section: document.getElementById(id) };
    })
    .filter(chapter => chapter.section);
  if (!chapters.length) return;

  const progress = document.createElement('div');
  progress.className = 'dossier-reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.append(progress);

  const tocStatus = document.createElement('div');
  tocStatus.className = 'dossier-toc__status';
  tocStatus.innerHTML = `<span>Je leesroute</span><strong><b data-dossier-current>1</b> / ${chapters.length}</strong>`;
  toc.querySelector('p')?.insertAdjacentElement('afterend', tocStatus);

  chapters.forEach((chapter, index) => {
    const next = chapters[index + 1];
    if (!next || chapter.section.matches('#bronnen')) return;
    const jump = document.createElement('a');
    jump.className = 'dossier-next';
    jump.href = `#${next.section.id}`;
    jump.innerHTML = `<span>Volgende vondst</span><strong>${next.link.textContent.trim()} <b aria-hidden="true">↘</b></strong>`;
    chapter.section.append(jump);
  });

  [...content.querySelectorAll('.source-list, .legacy-source-list')].forEach(list => {
    const items = [...list.children].filter(item => item.matches('li'));
    if (items.length <= 5) return;
    items.slice(4).forEach(item => item.classList.add('dossier-source-extra'));
    list.classList.add('dossier-sources--compact');

    const toggle = document.createElement('button');
    toggle.className = 'dossier-source-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `<span>Alle bronnen</span><strong>Toon alle ${items.length} <b aria-hidden="true">＋</b></strong>`;
    list.insertAdjacentElement('afterend', toggle);

    toggle.addEventListener('click', () => {
      const expanded = list.classList.toggle('is-expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.querySelector('strong').innerHTML = expanded
        ? 'Toon minder <b aria-hidden="true">−</b>'
        : `Toon alle ${items.length} <b aria-hidden="true">＋</b>`;
    });
  });

  const dossierRecords = (window.ONWIJZE_CONTENT || []).filter(item => item.type === 'dossier');
  const currentFilename = decodeURIComponent(location.pathname.split('/').pop() || '');
  const currentRecord = dossierRecords.find(item => item.url === `onderwerpen/${currentFilename}`);
  const footprintStorageKey = 'onwijze-atlas-footprints-v1';
  let lastSavedProgress = 0;
  let lastSavedChapter = '';

  function saveFootprint(progressValue, chapterId, chapterLabel) {
    if (!currentRecord) return null;
    try {
      const stored = JSON.parse(localStorage.getItem(footprintStorageKey) || '[]');
      const history = Array.isArray(stored) ? stored : [];
      const previous = history.find(entry => entry.url === currentRecord.url);
      const previousProgress = Number(previous?.progress) || 0;
      const requestedProgress = Math.max(0, Math.min(100, Math.round(Number(progressValue) || 0)));
      const movesForward = requestedProgress >= previousProgress;
      const footprint = {
        url: currentRecord.url,
        title: currentRecord.title,
        category: currentRecord.category,
        saved: Boolean(previous?.saved),
        progress: Math.max(previousProgress, requestedProgress),
        chapterId: movesForward ? chapterId : previous?.chapterId || chapterId,
        chapterLabel: movesForward ? chapterLabel : previous?.chapterLabel || chapterLabel,
        visitedAt: Date.now()
      };
      const nextHistory = [footprint, ...history.filter(entry => entry.url !== currentRecord.url)]
        .sort((a, b) => Number(Boolean(b.saved)) - Number(Boolean(a.saved)) || b.visitedAt - a.visitedAt)
        .slice(0, 12);
      localStorage.setItem(footprintStorageKey, JSON.stringify(nextHistory));
      return footprint;
    } catch (error) {
      return null;
    }
  }

  const initialFootprint = saveFootprint(0, chapters[0].section.id, chapters[0].link.textContent.trim());
  if (initialFootprint) {
    lastSavedProgress = initialFootprint.progress;
    lastSavedChapter = initialFootprint.chapterId;
  }

  const saveButton = page.querySelector('[data-save-dossier]');

  if (saveButton && currentRecord) {
    const readFootprints = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(footprintStorageKey) || '[]');
        return Array.isArray(stored) ? stored : [];
      } catch (error) {
        return [];
      }
    };

    const showBookmarkState = saved => {
      saveButton.setAttribute('aria-pressed', String(saved));
      saveButton.innerHTML = saved
        ? '<span aria-hidden="true">✓</span> Dossier bewaard'
        : '<span aria-hidden="true">＋</span> Bewaar dit dossier';
    };

    showBookmarkState(readFootprints().some(entry => entry.url === currentRecord.url && entry.saved));

    saveButton.addEventListener('click', () => {
      const footprints = readFootprints();
      const previous = footprints.find(entry => entry.url === currentRecord.url) || {};
      const isSaved = Boolean(previous.saved);
      const updated = {
        ...previous,
        url: currentRecord.url,
        title: currentRecord.title,
        category: currentRecord.category,
        saved: !isSaved,
        progress: Number(previous.progress) || 0,
        chapterId: previous.chapterId || chapters[0].section.id,
        chapterLabel: previous.chapterLabel || chapters[0].link.textContent.trim(),
        visitedAt: Date.now()
      };
      const next = [updated, ...footprints.filter(entry => entry.url !== currentRecord.url)]
        .sort((a, b) => Number(Boolean(b.saved)) - Number(Boolean(a.saved)) || b.visitedAt - a.visitedAt)
        .slice(0, 12);

      try {
        localStorage.setItem(footprintStorageKey, JSON.stringify(next));
        showBookmarkState(!isSaved);
      } catch (error) {
        saveButton.textContent = 'Bewaren is hier niet beschikbaar';
      }
    });
  }

  const areaAdjacency = {
    'Brein & zenuwstelsel': ['Leren & veranderen', 'Emoties & regulatie', 'Bewustzijn & metafysica'],
    'Emoties & regulatie': ['Trauma & herstel', 'Relaties & hechting', 'Persoonlijkheid & identiteit'],
    'Trauma & herstel': ['Emoties & regulatie', 'Relaties & hechting', 'Leren & veranderen'],
    'Leren & veranderen': ['Brein & zenuwstelsel', 'Emoties & regulatie', 'Persoonlijkheid & identiteit'],
    'Persoonlijkheid & identiteit': ['Relaties & hechting', 'Groepsgedrag & beïnvloeding', 'Emoties & regulatie'],
    'Relaties & hechting': ['Persoonlijkheid & identiteit', 'Emoties & regulatie', 'Groepsgedrag & beïnvloeding'],
    'Groepsgedrag & beïnvloeding': ['Persoonlijkheid & identiteit', 'Relaties & hechting', 'Emoties & regulatie'],
    'Bewustzijn & metafysica': ['Brein & zenuwstelsel', 'Persoonlijkheid & identiteit', 'Leren & veranderen']
  };

  function normalizedTags(item) {
    return new Set((item.tags || []).map(tag => String(tag).toLocaleLowerCase('nl')));
  }

  function connectionBetween(source, candidate) {
    const sourceTags = normalizedTags(source);
    const shared = (candidate.tags || []).filter(tag => sourceTags.has(String(tag).toLocaleLowerCase('nl')));
    const sameArea = candidate.category === source.category;
    const adjacentIndex = (areaAdjacency[source.category] || []).indexOf(candidate.category);
    const adjacentWeight = adjacentIndex < 0 ? 0 : 3 - adjacentIndex;
    return {
      item: candidate,
      shared,
      sameArea,
      score: shared.length * 3 + (sameArea ? 4 : 0) + adjacentWeight
    };
  }

  function chooseConnections(source) {
    const ranked = dossierRecords
      .filter(item => item.url !== source.url)
      .map(item => connectionBetween(source, item))
      .filter(connection => connection.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'nl'));
    const chosen = [];
    const add = connection => {
      if (connection && !chosen.some(entry => entry.item.url === connection.item.url)) chosen.push(connection);
    };

    add(ranked[0]);
    add(ranked.find(connection => !connection.sameArea));
    ranked.forEach(connection => {
      if (chosen.length < 3) add(connection);
    });
    return chosen.slice(0, 3);
  }

  if (currentRecord && !content.querySelector('.related-dossiers')) {
    const connections = chooseConnections(currentRecord);
    if (connections.length) {
      const related = document.createElement('section');
      related.className = 'related-dossiers related-dossiers--automatic';
      related.setAttribute('aria-labelledby', 'automatic-related-title');
      related.innerHTML = '<p class="eyebrow">De Atlas loopt door</p><h2 id="automatic-related-title">Dit dossier raakt aan meer.</h2><p class="related-dossiers__intro">Drie inhoudelijke verbindingen, gekozen uit gedeelde begrippen en aangrenzende gebieden.</p><div></div>';
      const cards = related.querySelector('div');

      connections.forEach(connection => {
        const link = document.createElement('a');
        const sharedLabel = connection.shared.slice(0, 2).join(' · ');
        link.href = connection.item.url.replace(/^onderwerpen\//, '');
        link.innerHTML = '<span></span><strong></strong><small></small>';
        link.querySelector('span').textContent = connection.item.category;
        link.querySelector('strong').textContent = connection.item.title;
        link.querySelector('small').textContent = sharedLabel
          ? `Gedeeld spoor: ${sharedLabel} →`
          : connection.sameArea
            ? `Verder binnen ${connection.item.category} →`
            : `Zijgang naar ${connection.item.category} →`;
        cards.append(link);
      });

      const contribution = content.querySelector('.legacy-dossier-contribution');
      if (contribution) contribution.insertAdjacentElement('beforebegin', related);
      else content.append(related);
    }
  }

  [...content.querySelectorAll('.related-dossiers a')].forEach((link, index) => {
    link.style.setProperty('--route-index', `'0${index + 1}'`);
  });

  let ticking = false;
  let activeIndex = 0;

  function updateReadingState() {
    ticking = false;
    const marker = Math.min(window.innerHeight * .34, 280);
    let nextActive = 0;
    chapters.forEach((chapter, index) => {
      if (chapter.section.getBoundingClientRect().top <= marker) nextActive = index;
    });

    if (nextActive !== activeIndex || !tocLinks.some(link => link.classList.contains('is-active'))) {
      activeIndex = nextActive;
      chapters.forEach((chapter, index) => {
        const current = index === activeIndex;
        chapter.link.classList.toggle('is-active', current);
        chapter.link.classList.toggle('is-read', index < activeIndex);
        if (current) chapter.link.setAttribute('aria-current', 'location');
        else chapter.link.removeAttribute('aria-current');
      });
      const currentCounter = tocStatus.querySelector('[data-dossier-current]');
      if (currentCounter) currentCounter.textContent = String(activeIndex + 1);
    }

    const start = content.getBoundingClientRect().top + window.scrollY;
    const end = start + content.offsetHeight - window.innerHeight * .62;
    const percentage = Math.max(0, Math.min(1, (window.scrollY - start + marker) / Math.max(1, end - start)));
    progress.style.setProperty('--dossier-progress', `${percentage * 100}%`);
    const progressPercentage = Math.round(percentage * 100);
    const activeChapter = chapters[activeIndex];
    if (activeChapter && ((progressPercentage >= 99 && lastSavedProgress < 99) || progressPercentage >= lastSavedProgress + 5 || (activeChapter.section.id !== lastSavedChapter && progressPercentage >= lastSavedProgress))) {
      const saved = saveFootprint(progressPercentage, activeChapter.section.id, activeChapter.link.textContent.trim());
      if (saved) {
        lastSavedProgress = saved.progress;
        lastSavedChapter = saved.chapterId;
      }
    }
  }

  function requestReadingUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateReadingState);
  }

  window.addEventListener('scroll', requestReadingUpdate, { passive: true });
  window.addEventListener('resize', requestReadingUpdate, { passive: true });
  updateReadingState();
})();
