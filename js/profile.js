(function () {
  const data = window.BEAST_QUIZ;
  const empty = document.querySelector('[data-profile-empty]');
  const content = document.querySelector('[data-profile-content]');
  if (!data || !empty || !content) return;

  const profileKey = 'onwijze-profile-v1';
  const trackKey = 'menslab-progress-v3';
  const doorKey = 'onwijze-next-door-v1';
  const doorModes = {
    understand: { label:'Begrijpen', signal:'Een vraag om in af te dalen', action:'Open het dossier' },
    try: { label:'Proberen', signal:'Een kleine proef, zonder prestatiedruk', action:'Naar het Menslab' },
    recognise: { label:'Herkennen', signal:'Een verhaal om naast het jouwe te leggen', action:'Lees deze vondst' }
  };
  const doorCatalog = {
    'Brein & zenuwstelsel': {
      understand:[['onderwerpen/aandacht.html','Wat kiest jouw aandacht?','Aandacht is een toegangspoort naar wat voorgrond wordt.'],['onderwerpen/hersenen.html','Begin bij het brein','Een brede kaart voordat je een kleinere route kiest.']],
      try:[['menslab.html#amusement-brain','Speel met een voorspelling','Een lichte proef waarin je brein even niet hoeft te winnen.'],['menslab.html#dagproef','Doe de proef van vandaag','Twee minuten tussen verwachting en waarneming.']],
      recognise:[['denk-box06.html','Het zenuwstelsel dat niet stilzit','Een persoonlijke tekst over drukte, overleven en een plek proberen te zijn.']]
    },
    'Emoties & herstel': {
      understand:[['onderwerpen/emotieregulatie.html','Wat gebeurt er vóór een reactie?','Volg de route van prikkel, betekenis en handelingsneiging.'],['onderwerpen/stress.html','Wanneer wordt belasting stress?','Onderzoek de wisselwerking tussen lichaam, context en draagkracht.']],
      try:[['menslab.html#dagproef','Maak tien seconden ruimte','Een kleine proef tussen impuls en antwoord.'],['menslab.html#reflectie','Trek een vraag die mag meelopen','Geen oplossing, alleen iets om nauwkeuriger te zien.']],
      recognise:[['denk-box09.html','Terugkwispelen','Over oude patronen die blijven aankloppen en het verlangen om anders te leven.']]
    },
    'Leren & veranderen': {
      understand:[['onderwerpen/leren.html','Wanneer wordt een poging leren?','Aandacht, feedback, ophalen en tijd als één beweeglijk geheel.'],['onderwerpen/neuroplasticiteit.html','Wat kan werkelijk veranderen?','Plasticiteit zonder de mythe van onbeperkte maakbaarheid.']],
      try:[['menslab.html#weeklab','Volg zeven kleine haltes','Een spoor van losse bewegingen, niet van perfecte dagen.'],['menslab.html#dagproef','Verander één klein detail','Kijk wat gewoonte doet wanneer de route even afwijkt.']],
      recognise:[['denk-box15.html','De neuro-archeoloog in mij','Een afdaling langs oude overtuigingen en kleine nieuwe paden.']]
    },
    'Relaties & hechting': {
      understand:[['onderwerpen/hechting.html','Wat ontstaat er tussen twee mensen?','Nabijheid en afstand als relationele beweging, niet als vast type.'],['onderwerpen/de-ander-verandert-je.html','Hoe verandert een ander jou?','Invloed, steun en autonomie zonder een verborgen ware zelf te beloven.']],
      try:[['menslab.html#speelhallen','Probeer eerst af te stemmen','Vraag in een veilig gesprek: luisteren, vragen of meedenken?'],['menslab.html#reflectie','Onderzoek een grens','Een vraag die helpt opmerken vóór je hoeft te besluiten.']],
      recognise:[['denk-box05.html','Lieve Mama','Een brief over verbondenheid en wat soms verdwijnt wanneer we spreken.']]
    },
    'Bewustzijn & metafysica': {
      understand:[['onderwerpen/bewustzijn.html','Wat bedoelen we met bewustzijn?','Wetenschap, filosofie en de vragen die werkelijk openblijven.'],['onderwerpen/ervaring.html','Hoe wordt ervaring een wereld?','Een ingang via waarneming, betekenis en eerste-persoonsperspectief.']],
      try:[['menslab.html#amusement-brain','Voorspel je volgende gedachte','Een speelse proef met controle, verwachting en verrassing.'],['menslab.html#reflectie','Trek een onoplosbare vraag','Niet om af te ronden, wel om beter te leren kijken.']],
      recognise:[['denk-box08.html','Kompas sterfelijkheid','Een filosofische tekst over eindigheid, verbondenheid en betekenis.']]
    },
    'Persoonlijke verhalen': {
      understand:[['denkstukken.html','Hoe werkt een persoonlijk verhaal?','Verken ervaringen als betekenis, niet als universeel bewijs.']],
      try:[['menslab.html#reflectie','Leg één vraag naast je verhaal','Kijk wat verandert wanneer je niet meteen een conclusie zoekt.']],
      recognise:[['denk-box14.html','Een avond met de drie Nancy’s','Een nachtelijke rit langs oude reflexen en terugkeren naar jezelf.'],['denkstukken.html','Dwaal tussen de Denkstukken','Kies het verhaal waarvan de titel iets bij je wakker maakt.']]
    },
    'Zelfonderzoek': {
      understand:[['onderwerpen/persoonlijkheid.html','Ben je een trek, toestand of verhaal?','Een rijker beeld van persoonlijkheid dan één score of type.']],
      try:[['menslab.html#reflectie','Trek een onderzoeksvraag','Geen score. Wel een vraag die even mag meelopen.'],['menslab.html#dagproef','Vergelijk verwachting met ervaring','Eerst voorspellen, dan pas kijken wat er werkelijk gebeurde.']],
      recognise:[['denk-box14.html','Een avond met de drie Nancy’s','Een verhaal over meerdere versies van jezelf in één leven.']]
    },
    'Community bouwen': {
      understand:[['onderwerpen/de-groep-in-je-hoofd.html','Welke groep praat in jou mee?','Over normen, erbij horen en de stemmen die we meenemen.']],
      try:[['jouw-bijdrage.html','Leg een vondst op tafel','Deel een vraag, ervaring of correctie zonder jezelf als antwoord te presenteren.']],
      recognise:[['community.html','Wie graaft er nog meer?','Vind gesprekken en plannen die misschien niet alleen hoeven te bestaan.']]
    }
  };
  const fallbackDoors = {
    understand:[['onderwerpen.html','Graaf in de Atlas','Kies de vraag die vandaag het meeste weerstand of nieuwsgierigheid oproept.']],
    try:[['menslab.html#dagproef','Doe de proef van vandaag','Twee minuten, één verwachting en één observatie.']],
    recognise:[['denkstukken.html','Dwaal tussen de Denkstukken','Kies niet het verhaal dat je bevestigt, maar het verhaal dat iets opent.']]
  };

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value ?? fallback;
    } catch (_) { return fallback; }
  }

  function localPath(value) {
    if (typeof value !== 'string') return '';
    try {
      const url = new URL(value, location.href);
      return `${url.pathname.replace(/^.*\/Site\//, '').replace(/^\//, '')}${url.hash}`;
    } catch (_) { return value.replace(/^\.\//, ''); }
  }

  const profile = readJson(profileKey, null);
  const beast = data.beasts.find(item => item.id === profile?.beastId || item.legacyIds?.includes(profile?.beastId));
  if (!profile || profile.version !== 1 || !beast) {
    empty.hidden = false;
    content.hidden = true;
    return;
  }

  empty.hidden = true;
  content.hidden = false;
  const image = document.querySelector('[data-profile-image]');
  image.src = beast.image || `images/beasts/${beast.id}.jpg`;
  image.alt = `Illustratie van ${beast.name}, ${beast.archetype.toLowerCase()}`;
  document.querySelector('[data-profile-world]').textContent = beast.world;
  document.querySelector('[data-profile-name]').textContent = profile.name;
  document.querySelector('[data-profile-beast]').textContent = beast.name;
  document.querySelector('[data-profile-archetype]').textContent = beast.archetype;
  document.querySelector('[data-profile-intro]').textContent = profile.intro || 'Ik ben hier om te onderzoeken wat beweegt, schuurt en nog niet helemaal te begrijpen valt.';
  document.querySelector('[data-profile-updated]').textContent = `Lokaal bijgewerkt op ${new Intl.DateTimeFormat('nl-BE', { day:'numeric', month:'long', year:'numeric' }).format(new Date(profile.updatedAt || profile.createdAt))}`;
  document.querySelector('[data-profile-interests]').replaceChildren(...(profile.interests || []).map(interest => {
    const tag = document.createElement('span');
    tag.textContent = interest;
    return tag;
  }));

  document.querySelector('[data-profile-mirror-title]').textContent = `${beast.name}, ${beast.archetype.toLowerCase()}`;
  document.querySelector('[data-profile-motto]').textContent = `“${beast.motto}”`;
  document.querySelector('[data-profile-strength]').textContent = beast.strength;
  document.querySelector('[data-profile-pitfall]').textContent = beast.pitfall;
  document.querySelector('[data-profile-role]').textContent = beast.role;

  const kindredRoot = document.querySelector('[data-profile-kindred]');
  const kindred = (profile.kindred || []).map(match => ({ ...match, beast:data.beasts.find(item => item.id === match.id || item.legacyIds?.includes(match.id)) })).filter(match => match.beast);
  if (kindred.length) {
    document.querySelector('[data-profile-kindred-section]').hidden = false;
    kindredRoot.replaceChildren(...kindred.map(match => {
      const article = document.createElement('article');
      const img = document.createElement('img');
      img.src = match.beast.image || `images/beasts/${match.beast.id}.jpg`;
      img.alt = '';
      const copy = document.createElement('div');
      const small = document.createElement('span');
      small.textContent = `${match.affinity}% verwantschap`;
      const title = document.createElement('strong');
      title.textContent = match.beast.name;
      const text = document.createElement('p');
      text.textContent = match.beast.archetype;
      copy.append(small, title, text);
      article.append(img, copy);
      return article;
    }));
  }

  const track = readJson(trackKey, {});
  const footprints = readJson('onwijze-atlas-footprints-v1', []);
  const reading = readJson('onwijze-reading-history-v1', []);
  const lab = Array.isArray(track.labSnapshots) ? track.labSnapshots : [];
  const quizzes = Array.isArray(track.quizSnapshots) ? track.quizSnapshots : [];
  const weeks = Array.isArray(track.completedWeeks) ? track.completedWeeks : [];

  const doorState = readJson(doorKey, {});
  const selectedMode = doorModes[doorState.mode] ? doorState.mode : 'understand';
  const indexes = doorState.indexes && typeof doorState.indexes === 'object' ? doorState.indexes : {};
  const historyItems = [
    ...(Array.isArray(footprints) ? footprints : []),
    ...(Array.isArray(reading) ? reading : [])
  ];
  const visitedPaths = new Set(historyItems.map(item => localPath(item.url).split('#')[0]).filter(Boolean));
  let activeMode = selectedMode;
  let activeRoute = null;

  function candidatesFor(mode) {
    const found = [];
    (profile.interests || []).forEach(interest => {
      (doorCatalog[interest]?.[mode] || []).forEach(route => found.push({ interest, href:route[0], title:route[1], reason:route[2] }));
    });
    fallbackDoors[mode].forEach(route => found.push({ interest:'Vrije ingang', href:route[0], title:route[1], reason:route[2] }));
    return found.filter((route, index, all) => all.findIndex(item => item.href === route.href) === index);
  }

  function progressFor(href) {
    const path = localPath(href).split('#')[0];
    return historyItems.reduce((highest, item) => localPath(item.url).split('#')[0] === path ? Math.max(highest, Number(item.progress) || 0) : highest, 0);
  }

  function unfinishedLastDoor(mode, candidates) {
    const last = doorState.lastOpened;
    if (!last || last.mode !== mode || !Number.isFinite(Number(last.openedAt))) return null;
    if (Date.now() - Number(last.openedAt) > 1000 * 60 * 60 * 24 * 21) return null;
    const match = candidates.find(route => route.href === last.href);
    if (!match) return null;
    if (mode === 'try' && lab.some(item => Date.parse(item.savedAt) > Number(last.openedAt))) return null;
    if (mode !== 'try' && progressFor(match.href) >= 80) return null;
    return match;
  }

  function saveDoorState(extra) {
    try {
      localStorage.setItem(doorKey, JSON.stringify({ version:1, mode:activeMode, indexes, ...extra }));
    } catch (_) {}
  }

  function renderDoor(mode, preferLast = false) {
    activeMode = doorModes[mode] ? mode : 'understand';
    const candidates = candidatesFor(activeMode);
    const last = preferLast ? unfinishedLastDoor(activeMode, candidates) : null;
    const unvisited = candidates.filter(route => !visitedPaths.has(localPath(route.href).split('#')[0]));
    const pool = unvisited.length ? unvisited : candidates;
    const index = Math.abs(Number(indexes[activeMode]) || 0) % pool.length;
    activeRoute = last || pool[index];
    const meta = doorModes[activeMode];
    const portal = document.querySelector('[data-next-door-link]');
    portal.href = activeRoute.href;
    document.querySelector('[data-next-door-signal]').textContent = meta.signal;
    document.querySelector('[data-next-door-source]').textContent = `${activeRoute.interest} · ${meta.label}`;
    document.querySelector('[data-next-door-route-title]').textContent = activeRoute.title;
    document.querySelector('[data-next-door-reason]').textContent = activeRoute.reason;
    document.querySelector('[data-next-door-action]').firstChild.textContent = `${last ? 'Ga verder door deze deur' : meta.action} `;
    document.querySelector('[data-next-door-status]').textContent = last
      ? 'Je opende deze deur eerder. Ze blijft hier staan tot je verdergaat of iets anders kiest.'
      : `${unvisited.length ? 'Nog niet in je recente spoor' : 'Een bekend spoor, opnieuw bekeken'} · voorgesteld vanuit ${activeRoute.interest.toLowerCase()}.`;
    document.querySelectorAll('[data-door-mode]').forEach(button => {
      const selected = button.dataset.doorMode === activeMode;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    saveDoorState({ lastOpened:doorState.lastOpened || null });
  }

  document.querySelectorAll('[data-door-mode]').forEach(button => {
    button.addEventListener('click', () => renderDoor(button.dataset.doorMode));
  });
  document.querySelector('[data-another-door]').addEventListener('click', () => {
    indexes[activeMode] = (Number(indexes[activeMode]) || 0) + 1;
    renderDoor(activeMode);
  });
  document.querySelector('[data-next-door-link]').addEventListener('click', () => {
    saveDoorState({ lastOpened:{ mode:activeMode, href:activeRoute.href, title:activeRoute.title, openedAt:Date.now() } });
  });
  renderDoor(activeMode, true);

  document.querySelector('[data-stat-atlas]').textContent = String(Array.isArray(footprints) ? footprints.length : 0);
  document.querySelector('[data-stat-lab]').textContent = String(lab.length + quizzes.length + weeks.length);
  document.querySelector('[data-stat-reading]').textContent = String(Array.isArray(reading) ? reading.length : 0);

  const activity = [
    ...(Array.isArray(footprints) ? footprints.map(item => ({ title:item.title, meta:item.saved ? 'Atlas · bewaard' : `Atlas · ${item.progress || 0}% gelezen`, href:item.url, time:Number(item.visitedAt) || 0 })) : []),
    ...(Array.isArray(reading) ? reading.map(item => ({ title:item.title, meta:`Verder lezen · ${item.progress || 0}%`, href:item.url, time:Number(item.visitedAt) || 0 })) : []),
    ...lab.map(item => ({ title:item.title, meta:'Menslab · bewaard', href:'menslab.html#mijn-spoor', time:Date.parse(item.savedAt) || 0 })),
    ...quizzes.map(item => ({ title:item.resultTitle, meta:'Quizkast · spiegel', href:'menslab.html#mijn-spoor', time:Date.parse(item.savedAt) || 0 }))
  ].filter(item => item.title).sort((a, b) => b.time - a.time).slice(0, 5);
  if (activity.length) {
    document.querySelector('[data-profile-activity]').hidden = false;
    document.querySelector('[data-profile-activity-list]').replaceChildren(...activity.map(item => {
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.href;
      const meta = document.createElement('span');
      meta.textContent = item.meta;
      const title = document.createElement('strong');
      title.textContent = item.title;
      link.append(meta, title);
      row.append(link);
      return row;
    }));
  }

  const deleteButton = document.querySelector('[data-delete-profile]');
  const status = document.querySelector('[data-profile-status]');
  let deleteArmed = false;
  let deleteTimer;
  deleteButton.addEventListener('click', () => {
    if (!deleteArmed) {
      deleteArmed = true;
      deleteButton.textContent = 'Klik nog eens om alleen dit profiel te verwijderen';
      status.textContent = 'Je quizantwoorden en Mijn spoor blijven bestaan.';
      clearTimeout(deleteTimer);
      deleteTimer = setTimeout(() => {
        deleteArmed = false;
        deleteButton.textContent = 'Verwijder alleen mijn profiel';
        status.textContent = '';
      }, 5000);
      return;
    }
    try {
      localStorage.removeItem(profileKey);
      location.reload();
    } catch (_) {
      status.textContent = 'Verwijderen is in deze browser niet beschikbaar.';
    }
  });
}());
