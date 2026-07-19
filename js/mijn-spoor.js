(function () {
  const storageKeys = [
    'menslab-progress-v3', 'menslab-progress-v2', 'menslab-week-progress-v1',
    'onwijze-atlas-footprints-v1', 'onwijze-reading-history-v1',
    'beestenquiz-progress-v2', 'quizkast-progress-v1', 'dieptequiz-ja-progress-v1',
    'onwijze-veranderroute-v2', 'onwijze-veranderroute-v1', 'menslab-exercise-drafts-v1',
    'onwijze-profile-v1', 'onwijze-next-door-v1', 'onwijze-laatste-spoor', 'onwijze-ingang-gezien'
  ];

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed ?? fallback;
    } catch (_) { return fallback; }
  }

  function localHref(value, fallback = 'home.html') {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin || !/\/Site\//.test(url.pathname)) return fallback;
      return `${url.pathname.replace(/^.*\/Site\//, '')}${url.search}${url.hash}`;
    } catch (_) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|\\|\.\.)/i.test(value)) return fallback;
      return value.replace(/^\.\//, '');
    }
  }

  function dateValue(value) {
    const parsed = typeof value === 'number' ? value : Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const track = readJson('menslab-progress-v3', readJson('menslab-progress-v2', {}));
  const footprints = readJson('onwijze-atlas-footprints-v1', []);
  const readingHistory = readJson('onwijze-reading-history-v1', []);
  const profile = readJson('onwijze-profile-v1', null);
  const quizProgress = readJson('quizkast-progress-v1', null);
  const beastProgress = readJson('beestenquiz-progress-v2', null);
  const depthProgress = readJson('dieptequiz-ja-progress-v1', null);
  const routeProgress = readJson('onwijze-veranderroute-v2', readJson('onwijze-veranderroute-v1', null));
  const exerciseDrafts = readJson('menslab-exercise-drafts-v1', {});
  const quizSnapshots = Array.isArray(track?.quizSnapshots) ? track.quizSnapshots : [];
  const labSnapshots = Array.isArray(track?.labSnapshots) ? track.labSnapshots : [];
  const completedWeeks = Array.isArray(track?.completedWeeks) ? track.completedWeeks : [];
  const profileBeast = window.BEAST_QUIZ?.beasts?.find(item => item.id === profile?.beastId || item.legacyIds?.includes(profile?.beastId));
  const validProfile = Boolean(profile && (
    (profile.version === 1 && profileBeast) ||
    (profile.version === 2 && typeof profile.name === 'string' && profile.name.trim().length >= 2)
  ));

  const guardTitle = document.querySelector('[data-guard-title]');
  const guardCopy = document.querySelector('[data-guard-copy]');
  const guardLink = document.querySelector('[data-guard-link]');
  if (validProfile && guardTitle && guardCopy && guardLink) {
    guardTitle.textContent = 'Je volledige spoor blijft hier.';
    guardCopy.textContent = 'Je profiel is aangemaakt. Wat je leest, speelt, bewaart of nog niet afmaakt blijft op dit apparaat beschikbaar tot jij het wist.';
    guardLink.href = 'mijn-profiel.html';
    guardLink.setAttribute('aria-label', 'Open mijn profiel');
    guardLink.querySelector('[data-guard-button]').textContent = 'OPEN';
    guardLink.querySelector('[data-guard-label]').textContent = 'Open mijn profiel';
    const guardNote = guardLink.querySelector('[data-guard-note]');
    if (guardNote) guardNote.textContent = 'Jouw volledige spoor is actief →';
    const trackControl = document.querySelector('[data-track-control]');
    if (trackControl) trackControl.hidden = false;
  }

  function renderProfile() {
    const empty = document.querySelector('[data-profile-empty]');
    const ready = document.querySelector('[data-profile-ready]');
    const beast = profileBeast;
    if (!validProfile) {
      empty.hidden = false;
      ready.hidden = true;
      return;
    }
    empty.hidden = true;
    ready.hidden = false;
    const image = ready.querySelector('[data-profile-image]');
    if (profile.avatarMode === 'upload' && profile.avatarDataUrl) {
      image.src = profile.avatarDataUrl;
      image.alt = `Profielfoto van ${profile.name}`;
    } else if (beast && (profile.version === 1 || profile.avatarMode === 'beast')) {
      image.src = beast.image || `images/beasts/${beast.id}.jpg`;
      image.alt = `Illustratie van ${beast.name}`;
    } else {
      image.src = 'images/mijn-spoor-profielrenaissance.png';
      image.alt = 'Renaissancistische profielillustratie met geometrie, wetenschap en natuur.';
    }
    ready.querySelector('[data-profile-owner]').textContent = profile.name || 'Jij';
    const readyTitle = ready.querySelector('[data-profile-ready-title]');
    readyTitle.textContent = beast
      ? `${profile.name || 'Jij'}, jouw ${beast.name.toLowerCase()} loopt al mee.`
      : `${profile.name || 'Jij'}, je profiel groeit al met je spoor mee.`;
    ready.querySelector('[data-profile-intro]').textContent = profile.intro || (beast
      ? `${beast.essence || beast.archetype} Dit profiel blijft een tijdelijke spiegel die met je mag meebewegen.`
      : 'Je naam, interesses en signatuur staan klaar. Het dier mag erbij komen wanneer je daar zin in hebt.');
    const quizLink = ready.querySelector('[data-profile-quiz-link]');
    if (quizLink) {
      quizLink.href = beast ? 'dierenquiz.html?profiel=wijzigen' : 'dierenquiz.html';
      quizLink.textContent = beast ? 'Doe de spiegel opnieuw' : 'Voeg mijn beest toe';
    }
    const welcome = document.querySelector('[data-track-welcome]');
    if (welcome) welcome.textContent = `Welkom terug, ${profile.name || beast?.name || 'jij'}`;
  }

  const readingMap = new Map();
  (Array.isArray(readingHistory) ? readingHistory : []).forEach(item => {
    const href = localHref(item.url, 'home.html');
    readingMap.set(href.split('#')[0], {
      title: item.title || 'Onbekende vondst', href,
      progress: Math.max(0, Math.min(100, Number(item.progress) || 0)),
      time: dateValue(item.visitedAt), kind:'Leesroute', saved:false
    });
  });
  (Array.isArray(footprints) ? footprints : []).forEach(item => {
    const href = localHref(item.url, 'onderwerpen.html');
    const key = href.split('#')[0];
    const previous = readingMap.get(key) || {};
    readingMap.set(key, {
      title:item.title || previous.title || 'Atlasdossier',
      href:item.chapterId ? `${href.split('#')[0]}#${encodeURIComponent(item.chapterId)}` : href,
      progress:Math.max(Number(previous.progress) || 0, Number(item.progress) || 0),
      time:Math.max(Number(previous.time) || 0, dateValue(item.visitedAt)),
      kind:item.category || 'Atlasdossier', saved:Boolean(item.saved)
    });
  });
  const reading = [...readingMap.values()].sort((a, b) => b.time - a.time);

  const exerciseHref = item => item.kind === 'emotion-scene'
    ? `speelhal/oefeningen/emotionele-routekaart.html?kaart=${encodeURIComponent(item.savedAt || '')}#premiere`
    : item.kind === 'beast' ? 'mijn-profiel.html' : 'speelhal.html';

  const played = [
    ...quizSnapshots.map(item => ({ title:item.quizTitle || item.resultTitle || 'Quizspiegel', href:'speelhal.html', meta:item.resultTitle || 'Bewaarde spiegel', time:dateValue(item.savedAt) })),
    ...labSnapshots.map(item => ({ title:item.title || 'Bewaarde proef', href:exerciseHref(item), meta:item.kind === 'beast' ? 'Dierenprofiel' : item.kind === 'emotion-scene' ? 'Filmische scènekaart' : 'Proefnotitie', time:dateValue(item.savedAt) })),
    ...completedWeeks.map(item => ({ title:'Een week mentale rekbaarheid', href:'speelhal-week.html', meta:'Afgeronde weekroute', time:dateValue(item.completedAt) }))
  ].sort((a, b) => b.time - a.time);

  const saved = [
    ...reading.filter(item => item.saved).map(item => ({ ...item, meta:item.kind || 'Bewaarde vondst' })),
    ...quizSnapshots.map(item => ({ title:item.resultTitle || item.quizTitle || 'Bewaarde spiegel', href:'speelhal.html', meta:'Speelhal · spiegel', time:dateValue(item.savedAt) })),
    ...labSnapshots.map(item => ({ title:item.title || 'Bewaarde notitie', href:exerciseHref(item), meta:item.kind === 'emotion-scene' ? 'Spoel even terug' : 'Mijn notitie', time:dateValue(item.savedAt) }))
  ].sort((a, b) => b.time - a.time);

  const unfinished = reading.filter(item => item.progress > 0 && item.progress < 99).map(item => ({ ...item, meta:`${Math.round(item.progress)}% gelezen` }));
  if (quizProgress?.quizId) unfinished.unshift({ title:'Een spel in de Speelhal', href:`speelhal.html?quiz=${encodeURIComponent(quizProgress.quizId)}`, meta:'Nog niet afgerond', time:dateValue(quizProgress.savedAt) });
  if (beastProgress && Array.isArray(beastProgress.answers) && beastProgress.answers.some(value => value !== null)) unfinished.unshift({ title:'De Grote Beestenquiz', href:'dierenquiz.html', meta:'Je profielspiegel staat nog open', time:Date.now() - 1 });
  if (depthProgress) unfinished.unshift({ title:'Waar komt jouw ja vandaan?', href:'dieptequiz-ja.html', meta:'Dieptequiz nog open', time:dateValue(depthProgress.savedAt) });
  if (routeProgress) unfinished.unshift({ title:'De Veranderroute', href:'veranderroute.html', meta:'Route nog open', time:dateValue(routeProgress.updatedAt || routeProgress.savedAt) });
  if (exerciseDrafts && Object.keys(exerciseDrafts).length) unfinished.unshift({ title:'Spoel even terug', href:'speelhal/oefeningen/emotionele-routekaart.html', meta:'Montagetafel nog open', time:Date.now() - 2 });

  function renderList(name, items, emptyText) {
    const list = document.querySelector(`[data-list-${name}]`);
    const count = document.querySelector(`[data-count-${name}]`);
    count.textContent = String(items.length);
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'track-empty';
      li.textContent = emptyText;
      list.replaceChildren(li);
      return;
    }
    list.replaceChildren(...items.slice(0, 3).map(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = localHref(item.href, 'home.html');
      const title = document.createElement('span');
      title.textContent = item.title;
      const meta = document.createElement('small');
      meta.textContent = item.meta || (item.progress ? `${Math.round(item.progress)}%` : 'Open');
      link.append(title, meta);
      li.append(link);
      return li;
    }));
  }

  renderList('reading', reading, 'Je eerste vondst ligt nog op je te wachten.');
  renderList('played', played, 'Nog niets gespeeld. De rode knop weet waar de ingang is.');
  renderList('saved', saved, 'Nog niets bewaard. Alleen wat jij kiest, verschijnt hier.');
  renderList('unfinished', unfinished, 'Geen losse eindjes. Je mag iets nieuws laten trekken.');

  function renderEmotionScenes() {
    const section = document.querySelector('[data-emotion-scenes]');
    const list = document.querySelector('[data-emotion-scene-list]');
    if (!section || !list) return;
    const scenes = labSnapshots.filter(item => item?.kind === 'emotion-scene' || item?.kind === 'exercise');
    section.hidden = !scenes.length;
    if (!scenes.length) return;
    list.replaceChildren(...scenes.map(item => {
      const article = document.createElement('article'); article.className = 'emotion-track-card';
      const eyebrow = document.createElement('span'); eyebrow.textContent = item.version === 2 ? 'Spoel even terug · scènekaart' : 'Oude Werkbank-notitie';
      const title = document.createElement('h3'); title.textContent = item.title || 'Een scène die ik wilde begrijpen';
      const date = document.createElement('time'); date.dateTime = item.savedAt || ''; date.textContent = formatDate(item.savedAt);
      article.append(eyebrow, title, date);
      const rows = item.version === 2 ? [
        ['Kantelpunt', item.turningPoint], ['Voorlopige emotienamen', Array.isArray(item.emotionNames) ? item.emotionNames.join(', ') : ''],
        ['Eerste impuls', item.impulse], ['Werkelijk gedrag', item.actualAction], ['Golf aan het einde', item.waveEnd], ['Experimenteel shot', item.experimentalShot]
      ] : [['Oude samenvatting', item.prompt || 'De oorspronkelijke Werkbank-notitie bevatte geen samenvatting.'], ['Observatie', item.observation], ['Volgende stap', item.nextAction]];
      const dl = document.createElement('dl');
      rows.filter(([, value]) => typeof value === 'string' && value.trim()).forEach(([label, value]) => {
        const div = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd');
        dt.textContent = label; dd.textContent = value; div.append(dt, dd); dl.append(div);
      });
      if (!dl.children.length) { const p = document.createElement('p'); p.textContent = 'Deze bewaarde versie bevat weinig detail. Ze blijft behouden en kan veilig worden verwijderd.'; article.append(p); }
      else article.append(dl);
      const actions = document.createElement('div'); actions.className = 'emotion-track-card__actions';
      if (item.version === 2 && item.data && item.privacyMode !== 'experiment-only') {
        const open = document.createElement('a'); open.href = exerciseHref(item); open.textContent = 'Volledige kaart bekijken'; actions.append(open);
      }
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Verwijderen'; remove.setAttribute('aria-label', `Verwijder ${title.textContent}`);
      remove.addEventListener('click', () => {
        if (!confirm(`Wil je “${title.textContent}” uit Mijn spoor verwijderen?`)) return;
        const progress = readJson('menslab-progress-v3', {}); const current = Array.isArray(progress.labSnapshots) ? progress.labSnapshots : [];
        progress.labSnapshots = current.filter(snapshot => snapshot.savedAt !== item.savedAt);
        try { localStorage.setItem('menslab-progress-v3', JSON.stringify(progress)); location.reload(); }
        catch (_) { const message = document.querySelector('[data-emotion-scene-status]'); if (message) message.textContent = 'Verwijderen lukt niet in deze browser.'; }
      });
      actions.append(remove); article.append(actions); return article;
    }));
  }

  renderEmotionScenes();

  function renderActive() {
    const active = unfinished[0] || reading[0] || played[0];
    const root = document.querySelector('[data-active-track]');
    if (!active) return;
    root.querySelector('[data-active-title]').textContent = active.title;
    root.querySelector('[data-active-copy]').textContent = active.meta || 'Hier kun je de draad weer oppakken.';
    root.querySelector('[data-active-link]').href = localHref(active.href, 'home.html');
    root.hidden = false;
  }

  const status = document.querySelector('[data-track-status]');
  document.querySelector('[data-export-track]')?.addEventListener('click', () => {
    try {
      const stores = {};
      storageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) stores[key] = value;
      });
      const payload = { format:'onwijze-lokaal-spoor', version:2, exportedAt:new Date().toISOString(), stores };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mijn-onwijze-spoor-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 0);
      status.textContent = 'Je lokale spoor staat klaar als bestand.';
    } catch (_) { status.textContent = 'Bewaren lukt niet in deze browser.'; }
  });

  document.querySelector('[data-import-track]')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      try {
        const payload = JSON.parse(String(reader.result || ''));
        if (payload?.format !== 'onwijze-lokaal-spoor' || payload?.version !== 2 || !payload.stores) throw new Error('Ongeldig');
        storageKeys.forEach(key => localStorage.removeItem(key));
        Object.entries(payload.stores).forEach(([key, value]) => {
          if (storageKeys.includes(key) && typeof value === 'string') localStorage.setItem(key, value);
        });
        status.textContent = 'Je spoor is teruggezet. De pagina wordt vernieuwd.';
        location.reload();
      } catch (_) { status.textContent = 'Dit bestand lijkt geen geldig spoor te zijn.'; }
    });
    reader.readAsText(file);
  });

  document.querySelector('[data-clear-track]')?.addEventListener('click', () => {
    if (!confirm('Wil je je profiel, leesvoortgang, quizspiegels en lokale notities op dit apparaat wissen?')) return;
    storageKeys.forEach(key => localStorage.removeItem(key));
    status.textContent = 'Je lokale spoor is gewist. De pagina wordt vernieuwd.';
    location.reload();
  });

  renderProfile();
  renderActive();
}());
