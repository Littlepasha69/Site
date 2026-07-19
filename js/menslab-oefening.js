(function () {
  const page = document.querySelector('[data-exercise-id]');
  const form = document.querySelector('[data-practice-form]');
  if (!page || !form) return;

  const exerciseId = page.dataset.exerciseId;
  const draftStorageKey = 'menslab-exercise-drafts-v1';
  const progressStorageKey = 'menslab-progress-v3';
  const stops = [...form.querySelectorAll('[data-practice-stop]')];
  const autosave = document.querySelector('[data-practice-autosave]');
  const status = document.querySelector('[data-practice-status]');
  const premiere = document.querySelector('[data-premiere]');
  const moments = [
    ['before', 'Vooraf'], ['start', 'Begin van de scène'], ['peak', 'Sterkste moment'],
    ['change', 'Moment van verandering'], ['end', 'Einde van de scène']
  ];
  const bodySignals = ['Hart sneller', 'Borst strak', 'Adem vast', 'Keel dicht', 'Warmte', 'Koude', 'Gespannen kaken', 'Buik trok samen', 'Trillen', 'Zwaar of slap', 'Onrust', 'Verdoofd of vlak', 'Niets opgemerkt', 'Iets anders'];
  const emotions = ['Boosheid', 'Angst', 'Verdriet', 'Schaamte', 'Schuld', 'Teleurstelling', 'Jaloezie', 'Afkeer', 'Opluchting', 'Verlangen', 'Machteloosheid', 'Verwarring', 'Geen passend woord'];
  const stakes = ['Verbinding', 'Erkenning', 'Respect', 'Veiligheid', 'Controle', 'Eerlijkheid', 'Rechtvaardigheid', 'Vrijheid', 'Erbij horen', 'Iets kunnen of goed doen', 'Verlies', 'Verlangen', 'Onzekerheid', 'Iets anders', 'Ik weet het niet'];
  const closer = ['Intimiteit', 'Hoop', 'Erkenning', 'Een kans', 'Verandering', 'Waarheid', 'Vrijheid', 'Niet van toepassing', 'Iets anders'];
  const impulses = ['Iets zeggen of confronteren', 'Weggaan', 'Bevriezen', 'Mezelf verbergen', 'Uitleg vragen', 'Contact zoeken', 'Herstellen', 'De ander geruststellen', 'Huilen', 'Mezelf beschermen', 'Niets doen', 'Iets anders'];
  const constraints = ['Machtsverschil', 'Afhankelijkheid', 'Angst voor gevolgen', 'Sociale of culturele verwachtingen', 'Geen veilige persoon beschikbaar', 'Tijdsdruk', 'Vermoeidheid', 'Ik wist niet wat ik nodig had', 'Iets anders'];
  const changes = ['Iemand reageerde', 'Tijd verstreek', 'Mijn aandacht verschoof', 'Ik begreep de situatie anders', 'Ik nam afstand', 'Iemand bood steun', 'Ik sprak iets uit', 'Ik bewoog of ademde anders', 'De omgeving veranderde', 'Ik werd moe', 'Ik duwde het gevoel weg', 'Ik weet niet wat iets veranderde', 'Iets anders'];
  const waveEnds = ['Grotendeels gezakt', 'Nog aanwezig', 'Veranderd in een andere emotie', 'Tijdelijk weggeduwd', 'Later teruggekomen', 'Moeilijk te zeggen'];
  const experiments = ['Eén vraag stellen vóór ik besluit wat iets betekent', 'Eerst opmerken wat ik nodig heb', 'Mijn grens vroeger uitspreken', 'Kort afstand nemen', 'Steun zoeken', 'Niets veranderen — mijn reactie was begrijpelijk', 'Nog geen idee'];
  let timer;

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    } catch (_) { return fallback; }
  }

  function idFrom(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function checkboxGrid(root, name, values) {
    values.forEach(value => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox'; input.name = name; input.value = value;
      label.append(input, document.createTextNode(value)); root.append(label);
    });
  }

  function timingSelect(name, labelText, choices = [...moments.map(([, label]) => label), 'Moeilijk te zeggen']) {
    const label = document.createElement('label');
    label.textContent = labelText;
    const select = document.createElement('select'); select.name = name;
    [['', 'Moment kiezen'], ...choices.map(label => [label, label])].forEach(([value, text]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
    });
    label.append(select); return label;
  }

  const bodyRoot = document.querySelector('[data-body-signals]');
  bodySignals.forEach(signal => {
    const row = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input'); input.type = 'checkbox'; input.name = 'bodySignals'; input.value = signal;
    label.append(input, document.createTextNode(signal));
    const timing = timingSelect(`bodyTiming__${idFrom(signal)}`, 'Wanneer?', ['Vlak ervoor', 'Bij het kantelpunt', 'Vlak erna', 'Moeilijk te zeggen']); timing.hidden = true;
    input.addEventListener('change', () => { timing.hidden = !input.checked; if (!input.checked) timing.querySelector('select').value = ''; });
    row.append(label, timing); bodyRoot.append(row);
  });

  const emotionRoot = document.querySelector('[data-emotion-choices]');
  checkboxGrid(emotionRoot, 'emotionNames', emotions);
  const emotionMessage = document.createElement('p'); emotionMessage.className = 'field-message'; emotionMessage.setAttribute('aria-live', 'polite'); emotionRoot.after(emotionMessage);
  function checkedEmotionInputs() { return [...emotionRoot.querySelectorAll('input:checked')]; }
  emotionRoot.addEventListener('change', event => {
    if (!event.target.matches('input[type="checkbox"]')) return;
    const ownCounts = Boolean(form.elements.emotionOwn?.value.trim());
    if (checkedEmotionInputs().length + Number(ownCounts) > 3) { event.target.checked = false; emotionMessage.textContent = 'Kies maximaal drie voorlopige emotienamen. Je eigen woord telt mee.'; }
    else emotionMessage.textContent = '';
    renderEmotionTimings();
  });

  checkboxGrid(document.querySelector('[data-stakes]'), 'stakes', stakes);
  checkboxGrid(document.querySelector('[data-closer]'), 'closer', closer);
  checkboxGrid(document.querySelector('[data-constraints]'), 'constraints', constraints);
  checkboxGrid(document.querySelector('[data-wave-end]'), 'waveEnd', waveEnds);
  checkboxGrid(document.querySelector('[data-experiments]'), 'experiment', experiments);
  const waveEndRoot = document.querySelector('[data-wave-end]');
  waveEndRoot.querySelectorAll('input').forEach(input => { input.type = 'radio'; });
  const experimentRoot = document.querySelector('[data-experiments]');
  experimentRoot.querySelectorAll('input').forEach(input => { input.type = 'radio'; });

  const impulseSelect = form.elements.impulse;
  impulses.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; impulseSelect.append(option); });

  const changeRoot = document.querySelector('[data-changes]');
  changes.forEach(change => {
    const row = document.createElement('div');
    const label = document.createElement('label'); const input = document.createElement('input');
    input.type = 'checkbox'; input.name = 'changes'; input.value = change; label.append(input, document.createTextNode(change));
    const timing = timingSelect(`changeTiming__${idFrom(change)}`, 'Bij welk golfmoment?'); timing.hidden = true;
    input.addEventListener('change', () => { timing.hidden = !input.checked; if (!input.checked) timing.querySelector('select').value = ''; });
    row.append(label, timing); changeRoot.append(row);
  });

  const waveEditor = document.querySelector('[data-wave-editor]');
  moments.forEach(([id, label], index) => {
    const control = document.createElement('label'); control.innerHTML = `<b>${index + 1}</b><span>${label}</span>`;
    const select = document.createElement('select'); select.name = `wave__${id}`; select.setAttribute('aria-label', `${label}: intensiteit van 0 tot 5`);
    const blank = document.createElement('option'); blank.value = ''; blank.textContent = '—'; select.append(blank);
    for (let value = 0; value <= 5; value += 1) { const option = document.createElement('option'); option.value = String(value); option.textContent = String(value); select.append(option); }
    control.append(select); waveEditor.append(control);
  });

  function serializeForm() {
    const result = {};
    [...form.elements].forEach(field => {
      if (!field.name || field.disabled || field.type === 'button' || field.type === 'submit') return;
      if (field.type === 'checkbox') {
        if (!Array.isArray(result[field.name])) result[field.name] = [];
        if (field.checked) result[field.name].push(field.value);
      } else if (field.type === 'radio') {
        if (!(field.name in result)) result[field.name] = '';
        if (field.checked) result[field.name] = field.value;
      } else {
        result[field.name] = String(field.value || '').slice(0, Number(field.maxLength) > 0 ? Number(field.maxLength) : 700);
      }
    });
    return result;
  }

  function hydrate(values) {
    if (!values || typeof values !== 'object') return;
    [...form.elements].forEach(field => {
      if (!field.name || !(field.name in values)) return;
      const value = values[field.name];
      if (field.type === 'checkbox') field.checked = Array.isArray(value) && value.includes(field.value);
      else if (field.type === 'radio') field.checked = value === field.value;
      else if (typeof value === 'string' || typeof value === 'number') field.value = String(value);
    });
    bodyRoot.querySelectorAll('input[type="checkbox"]').forEach(input => { input.closest('div').querySelector('label+label').hidden = !input.checked; });
    changeRoot.querySelectorAll('input[type="checkbox"]').forEach(input => { input.closest('div').querySelector('label+label').hidden = !input.checked; });
    renderEmotionTimings(values);
  }

  function hasValue(field) {
    if (field.type === 'checkbox' || field.type === 'radio') return field.checked;
    return Boolean(String(field.value || '').trim());
  }

  function renderProgress() {
    const touched = stops.filter(stop => [...stop.querySelectorAll('input,textarea,select')].some(hasValue)).length;
    document.querySelector('[data-practice-count]').textContent = String(touched);
    document.querySelector('[data-practice-bar]').style.width = `${(touched / stops.length) * 100}%`;
  }

  function saveDraft(message) {
    try {
      const drafts = readJSON(draftStorageKey, {});
      drafts[exerciseId] = { version:2, values:serializeForm(), updatedAt:new Date().toISOString() };
      localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
      if (message) autosave.textContent = message;
    } catch (_) { autosave.textContent = 'Deze browser laat lokale opslag hier niet toe.'; }
  }

  function clearDraft() {
    const drafts = readJSON(draftStorageKey, {}); delete drafts[exerciseId];
    try { localStorage.setItem(draftStorageKey, JSON.stringify(drafts)); } catch (_) {}
  }

  function renderRecap() {
    const root = document.querySelector('[data-frame-recap]'); root.replaceChildren();
    [['frameBefore', 'Vlak ervoor'], ['frameTurn', 'Het kantelpunt'], ['frameAfter', 'Vlak erna']].forEach(([name, label]) => {
      const value = String(form.elements[name]?.value || '').trim();
      if (!value) return;
      const card = document.createElement('article'); const strong = document.createElement('strong'); strong.textContent = `Wat zichtbaar was · ${label}`;
      const p = document.createElement('p'); p.textContent = value; card.append(strong, p); root.append(card);
    });
  }

  function renderEmotionTimings(savedValues) {
    const root = document.querySelector('[data-emotion-timings]');
    const current = savedValues || serializeForm(); root.replaceChildren();
    const selected = [...emotionRoot.querySelectorAll('input:checked')].map(input => input.value);
    const own = String(form.elements.emotionOwn?.value || '').trim();
    if (own) selected.push(own);
    selected.forEach(emotion => {
      const name = `emotionTiming__${idFrom(emotion)}`;
      const control = timingSelect(name, `${emotion}: bij welk moment?`);
      const stored = current[name]; if (typeof stored === 'string') control.querySelector('select').value = stored;
      root.append(control);
    });
  }

  function waveValues(values) {
    return moments.map(([id, label]) => ({ id, label, value: values[`wave__${id}`] === '' || values[`wave__${id}`] == null ? null : Math.max(0, Math.min(5, Number(values[`wave__${id}`]))) }));
  }

  function drawWave(root, values) {
    const points = waveValues(values); root.replaceChildren();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 600 220'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Lijn met de vijf gekozen intensiteiten');
    const valid = points.map((point, index) => point.value == null ? null : `${50 + index * 125},${180 - point.value * 28}`).filter(Boolean);
    if (valid.length > 1) { const polyline = document.createElementNS(svg.namespaceURI, 'polyline'); polyline.setAttribute('points', valid.join(' ')); polyline.setAttribute('fill', 'none'); polyline.setAttribute('stroke', 'currentColor'); polyline.setAttribute('stroke-width', '5'); polyline.setAttribute('stroke-linecap', 'round'); polyline.setAttribute('stroke-linejoin', 'round'); svg.append(polyline); }
    points.forEach((point, index) => {
      if (point.value == null) return;
      const circle = document.createElementNS(svg.namespaceURI, 'circle'); circle.setAttribute('cx', String(50 + index * 125)); circle.setAttribute('cy', String(180 - point.value * 28)); circle.setAttribute('r', '9'); svg.append(circle);
      const number = document.createElementNS(svg.namespaceURI, 'text'); number.setAttribute('x', String(50 + index * 125)); number.setAttribute('y', String(174 - point.value * 28)); number.setAttribute('text-anchor', 'middle'); number.textContent = String(point.value); svg.append(number);
    });
    const list = document.createElement('ol'); points.forEach(point => { const li = document.createElement('li'); li.innerHTML = `<span>${point.label}</span><strong>${point.value == null ? 'Niet ingevuld' : `${point.value} / 5`}</strong>`; list.append(li); });
    root.append(svg, list);
  }

  function scalar(values, key) { return typeof values[key] === 'string' ? values[key].trim() : ''; }
  function array(values, key) { return Array.isArray(values[key]) ? values[key].filter(Boolean) : []; }
  function chosenWithOwn(values, key, ownKey) { return [...array(values, key), scalar(values, ownKey)].filter(Boolean); }

  function renderPremiere(values) {
    const card = document.querySelector('[data-premiere-card]'); const summary = document.querySelector('[data-premiere-summary]');
    card.replaceChildren(); summary.replaceChildren();
    const title = scalar(values, 'sceneTitle') || 'Een scène die ik wilde begrijpen';
    const h3 = document.createElement('h3'); h3.textContent = title; card.append(h3);
    const bodyByMoment = {};
    array(values, 'bodySignals').forEach(signal => {
      const rawTiming = scalar(values, `bodyTiming__${idFrom(signal)}`) || 'Moment niet gekozen';
      const timing = rawTiming === 'Bij het kantelpunt' ? 'Het kantelpunt' : rawTiming;
      (bodyByMoment[timing] ||= []).push(signal);
    });
    const frameGrid = document.createElement('div'); frameGrid.className = 'premiere-frames';
    [['frameBefore', 'subtitleBefore', 'Vlak ervoor'], ['frameTurn', 'subtitleTurn', 'Het kantelpunt'], ['frameAfter', 'subtitleAfter', 'Vlak erna']].forEach(([frameKey, subtitleKey, label]) => {
      const visible = scalar(values, frameKey); const subtitle = scalar(values, subtitleKey);
      if (!visible && !subtitle && !bodyByMoment[label]?.length) return;
      const frame = document.createElement('article'); const head = document.createElement('strong'); head.textContent = label; frame.append(head);
      if (visible) { const p = document.createElement('p'); p.innerHTML = '<b>Camera</b>'; p.append(document.createTextNode(visible)); frame.append(p); }
      if (subtitle) { const p = document.createElement('p'); p.innerHTML = '<b>Ondertiteling</b>'; p.append(document.createTextNode(subtitle)); frame.append(p); }
      if (bodyByMoment[label]?.length) { const p = document.createElement('p'); p.innerHTML = '<b>Lichaam</b>'; p.append(document.createTextNode(bodyByMoment[label].join(', '))); frame.append(p); }
      frameGrid.append(frame);
    });
    if (frameGrid.children.length) card.append(frameGrid);

    if (waveValues(values).some(point => point.value != null)) { const section = document.createElement('section'); section.innerHTML = '<h4>De emotionele golf</h4>'; const chart = document.createElement('div'); chart.className = 'emotion-wave'; drawWave(chart, values); section.append(chart); card.append(section); }

    const emotionNames = chosenWithOwn(values, 'emotionNames', 'emotionOwn').slice(0, 3);
    const timedEmotions = emotionNames.map(name => {
      const timing = scalar(values, `emotionTiming__${idFrom(name)}`);
      return timing ? `${name} · ${timing}` : name;
    });
    const timedChanges = array(values, 'changes').map(name => {
      const timing = scalar(values, `changeTiming__${idFrom(name)}`);
      return timing ? `${name} · ${timing}` : name;
    });
    const looseBodySignals = Object.entries(bodyByMoment).filter(([moment]) => !['Vlak ervoor', 'Het kantelpunt', 'Vlak erna'].includes(moment)).flatMap(([moment, signals]) => signals.map(signal => `${signal} · ${moment}`));
    const detailRows = [
      ['Mogelijke emotienamen', timedEmotions.join(', ')], ['Lichaam · moment niet aan een frame gekoppeld', looseBodySignals.join(', ')], ['Een tweede emotie', scalar(values, 'secondEmotionOwn') || scalar(values, 'secondEmotion')],
      ['Wat op het spel leek te staan', array(values, 'stakes').join(', ')], ['Wat misschien dichterbij kwam', array(values, 'closer').join(', ')],
      ['Take 1 · eerste impuls', scalar(values, 'impulseOwn') || scalar(values, 'impulse')], ['Take 2 · werkelijk gedrag', scalar(values, 'actualAction')],
      ['De niet-gedraaide scène', scalar(values, 'unavailableAction')], ['Wat dit moeilijk maakte', array(values, 'constraints').join(', ')],
      ['Wat de golf veranderde', timedChanges.join(', ')], ['Waar de golf eindigde', scalar(values, 'waveEnd')],
      ['Een andere montage', [scalar(values, 'alternativeReading'), scalar(values, 'alternativeChoice')].filter(Boolean).join(' · ')],
      ['Het experimentele shot', scalar(values, 'experimentOwn') || scalar(values, 'experiment')]
    ].filter(([, value]) => value);
    if (detailRows.length) { const dl = document.createElement('dl'); detailRows.forEach(([label, value]) => { const div = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; div.append(dt, dd); dl.append(div); }); card.append(dl); }

    const heading = document.createElement('h3'); heading.textContent = 'In dit ene moment beschreef je…'; summary.append(heading);
    const list = document.createElement('ul'); [
      ['Wat zichtbaar gebeurde', scalar(values, 'frameTurn')], ['Wat je brein erbij vertelde', scalar(values, 'subtitleTurn')],
      ['Mogelijke emotienamen', emotionNames.join(', ')], ['Je eerste impuls', scalar(values, 'impulseOwn') || scalar(values, 'impulse')],
      ['Wat je werkelijk deed', scalar(values, 'actualAction')], ['Wat de golf veranderde', array(values, 'changes').join(', ')],
      ['Aan het einde was de golf', scalar(values, 'waveEnd')]
    ].filter(([, value]) => value).forEach(([label, value]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = `${label}: `; li.append(b, document.createTextNode(value)); list.append(li); });
    if (list.children.length) summary.append(list); else { const p = document.createElement('p'); p.textContent = 'Alleen wat jij invult verschijnt hier. Deze kaart voegt geen verklaring toe.'; summary.append(p); }
    premiere.hidden = false; drawWave(document.querySelector('[data-wave-chart]'), values);
  }

  function snapshotFrom(values, mode) {
    const experiment = scalar(values, 'experimentOwn') || scalar(values, 'experiment');
    const storedValues = mode === 'experiment-only' ? { sceneTitle:scalar(values, 'sceneTitle'), experiment } : { ...values };
    if (mode === 'without-scene') delete storedValues.sceneMoment;
    delete storedValues.saveMode;
    return {
      kind:'emotion-scene', version:2, privacyMode:mode,
      title:scalar(values, 'sceneTitle') || 'Een scène die ik wilde begrijpen',
      turningPoint:mode === 'experiment-only' ? '' : scalar(values, 'frameTurn'),
      emotionNames:mode === 'experiment-only' ? [] : chosenWithOwn(values, 'emotionNames', 'emotionOwn').slice(0, 3),
      impulse:mode === 'experiment-only' ? '' : (scalar(values, 'impulseOwn') || scalar(values, 'impulse')),
      actualAction:mode === 'experiment-only' ? '' : scalar(values, 'actualAction'),
      waveEnd:mode === 'experiment-only' ? '' : scalar(values, 'waveEnd'),
      experimentalShot:experiment, data:storedValues, savedAt:new Date().toISOString()
    };
  }

  const draft = readJSON(draftStorageKey, {})[exerciseId];
  if (draft?.values && typeof draft.values === 'object') { hydrate(draft.values); autosave.textContent = draft.version === 2 ? 'Je eerdere montage staat klaar.' : 'Je oude Werkbank-concept bleef bewaard; de velden die nog passen staan klaar.'; }

  const requestedCard = new URLSearchParams(location.search).get('kaart');
  if (requestedCard) {
    const progress = readJSON(progressStorageKey, {}); const saved = Array.isArray(progress.labSnapshots) ? progress.labSnapshots.find(item => item.savedAt === requestedCard && item.kind === 'emotion-scene') : null;
    if (saved?.data) { form.reset(); hydrate(saved.data); renderPremiere({ ...saved.data, sceneTitle:saved.title || saved.data.sceneTitle }); setTimeout(() => premiere.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 80); }
  }

  renderRecap(); renderProgress(); drawWave(document.querySelector('[data-wave-chart]'), serializeForm());

  form.addEventListener('input', event => {
    if (event.target.name?.startsWith('frame')) renderRecap();
    if (event.target.name?.startsWith('wave__')) drawWave(document.querySelector('[data-wave-chart]'), serializeForm());
    if (event.target.name === 'emotionOwn') {
      const checked = checkedEmotionInputs();
      if (event.target.value.trim() && checked.length > 2) { checked.slice(2).forEach(input => { input.checked = false; }); emotionMessage.textContent = 'Je eigen woord telt mee als één van maximaal drie emotienamen.'; }
      renderEmotionTimings();
    }
    if (event.target.name === 'sceneTitle' && !premiere.hidden) renderPremiere(serializeForm());
    renderProgress(); autosave.textContent = 'Wordt lokaal bewaard…'; clearTimeout(timer); timer = setTimeout(() => saveDraft('Concept lokaal bewaard.'), 280);
  });
  form.addEventListener('change', () => { renderProgress(); clearTimeout(timer); timer = setTimeout(() => saveDraft('Concept lokaal bewaard.'), 120); });

  document.querySelectorAll('[data-skip-step]').forEach(button => button.addEventListener('click', () => {
    const section = button.closest('[data-practice-stop]'); section.dataset.skipped = 'true';
    const next = section.nextElementSibling; autosave.textContent = 'Deze halte is overgeslagen. Je kunt altijd terugkeren.'; saveDraft();
    next?.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
  }));

  const dialog = document.querySelector('[data-stop-dialog]'); let lastFocus;
  document.querySelectorAll('[data-practice-stop-now]').forEach(button => button.addEventListener('click', () => { saveDraft('Concept lokaal bewaard.'); lastFocus = button; dialog.hidden = false; document.querySelector('[data-stop-continue]').focus(); }));
  document.querySelector('[data-stop-continue]').addEventListener('click', () => { dialog.hidden = true; lastFocus?.focus(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.hidden) { dialog.hidden = true; lastFocus?.focus(); } });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = serializeForm(); renderPremiere(values); saveDraft('Je montage is lokaal als concept bewaard.');
    premiere.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' });
  });

  document.querySelector('[data-save-premiere]').addEventListener('click', () => {
    const values = serializeForm(); const mode = scalar(values, 'saveMode') || 'full';
    if (mode === 'none') { clearDraft(); status.textContent = 'Er is geen kaart bewaard. Je ingevulde scène is ook uit het lokale concept verwijderd.'; return; }
    if (mode === 'experiment-only' && !(scalar(values, 'experimentOwn') || scalar(values, 'experiment'))) { status.textContent = 'Er is nog geen experimenteel shot om apart te bewaren.'; form.elements.experimentOwn.focus(); return; }
    try {
      const progress = readJSON(progressStorageKey, {}); const snapshots = Array.isArray(progress.labSnapshots) ? progress.labSnapshots : [];
      snapshots.unshift(snapshotFrom(values, mode)); progress.labSnapshots = snapshots.slice(0, 250); localStorage.setItem(progressStorageKey, JSON.stringify(progress));
      clearDraft(); status.textContent = mode === 'full' ? 'De volledige kaart staat lokaal in Mijn spoor.' : mode === 'without-scene' ? 'De kaart staat lokaal in Mijn spoor, zonder je oorspronkelijke scènebeschrijving.' : 'Alleen je experimentele shot staat lokaal in Mijn spoor.';
    } catch (_) { status.textContent = 'Bewaren lukt niet in deze browser. Je antwoorden blijven voorlopig op deze pagina staan.'; }
  });
}());
