(function () {
  const KEY = 'onwijze-veranderroute-v2';
  const PREVIOUS_KEY = 'onwijze-veranderroute-v1';
  const TRACK_KEY = 'menslab-progress-v3';
  const PREVIOUS_TRACK_KEY = 'menslab-progress-v2';
  const form = document.querySelector('[data-change-builder]');
  const panel = document.querySelector('[data-seven-days]');
  if (!form || !panel) return;

  const checks = [...document.querySelectorAll('[data-day-check]')];
  const notes = [...document.querySelectorAll('[data-day-note]')];
  const dayCards = [...document.querySelectorAll('[data-day-card]')];
  const reviewFields = [...document.querySelectorAll('[data-route-review]')];
  const reflectionFields = [...document.querySelectorAll('[data-seed-target]')];
  const builderSteps = [...document.querySelectorAll('[data-builder-step]')];
  const builderProgress = [...document.querySelectorAll('[data-builder-progress]')];
  const mapLinks = [...document.querySelectorAll('[data-route-link]')];
  const error = document.querySelector('[data-builder-error]');
  const status = document.querySelector('[data-storage-status]');
  const resume = document.querySelector('[data-route-resume]');
  const finish = document.querySelector('[data-route-finish]');
  const progress = document.querySelector('[data-route-progress]');
  const summaryCard = document.querySelector('[data-route-summary]');
  const postSummaryActions = [...document.querySelectorAll('[data-post-summary]')];
  const decisionLabels = {
    behouden: 'De kleine reactie behouden',
    verkleinen: 'De reactie nog kleiner maken',
    aanpassen: 'De reactie aanpassen',
    loslaten: 'Dit experiment loslaten'
  };
  let startedAt = '';
  let routeActive = false;
  let clearArmed = false;
  let clearTimer;

  function text(value, maximum) {
    return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
  }

  function normalizedStored(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const clean = {
      pattern: text(value.pattern, 100),
      cue: text(value.cue, 140),
      oldResponse: text(value.oldResponse, 140),
      conditions: text(value.conditions, 160),
      need: text(value.need, 140),
      newResponse: text(value.newResponse, 160),
      fallbackResponse: text(value.fallbackResponse, 160),
      startedAt: typeof value.startedAt === 'string' && !Number.isNaN(new Date(value.startedAt).getTime()) ? value.startedAt : new Date().toISOString(),
      checks: checks.map((_, index) => value.checks?.[index] === true),
      notes: notes.map((_, index) => text(value.notes?.[index], 600)),
      reviewDiscovery: text(value.reviewDiscovery, 280),
      reviewConditions: text(value.reviewConditions, 280),
      reviewDecision: Object.prototype.hasOwnProperty.call(decisionLabels, value.reviewDecision) ? value.reviewDecision : ''
    };
    if (![clean.pattern, clean.cue, clean.oldResponse, clean.newResponse].every(item => item.length >= 4)) return null;
    return clean;
  }

  function formData() {
    return {
      pattern: form.elements.pattern.value.trim(),
      cue: form.elements.cue.value.trim(),
      oldResponse: form.elements.oldResponse.value.trim(),
      conditions: form.elements.conditions.value.trim(),
      need: form.elements.need.value.trim(),
      newResponse: form.elements.newResponse.value.trim(),
      fallbackResponse: form.elements.fallbackResponse.value.trim(),
      persist: form.elements.persist.checked,
      startedAt: startedAt || new Date().toISOString(),
      checks: checks.map(input => input.checked),
      notes: notes.map(input => input.value.trim()),
      reviewDiscovery: document.querySelector('[name="reviewDiscovery"]').value.trim(),
      reviewConditions: document.querySelector('[name="reviewConditions"]').value.trim(),
      reviewDecision: document.querySelector('[name="reviewDecision"]').value
    };
  }

  function cleanCue(value) {
    const cue = value.trim().replace(/^(wanneer|als)\s+/i, '');
    return cue ? cue.charAt(0).toLocaleLowerCase('nl-BE') + cue.slice(1) : value.trim().toLocaleLowerCase('nl-BE');
  }

  function sentence(data) {
    return `Wanneer ${cleanCue(data.cue)}, probeer ik in plaats van “${data.oldResponse}” deze kleinere reactie: “${data.newResponse}”.`;
  }

  function calendarStamp(date) {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function currentDay() {
    const start = new Date(startedAt || Date.now());
    const elapsed = Math.floor((calendarStamp(new Date()) - calendarStamp(start)) / 86400000);
    return Math.min(7, Math.max(1, elapsed + 1));
  }

  function nextUnfinishedDay() {
    const index = checks.findIndex(input => !input.checked);
    return index === -1 ? 7 : index + 1;
  }

  function setActiveStep(step) {
    mapLinks.forEach(link => {
      if (Number(link.dataset.routeLink) === step) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }

  function updateDayFocus(done) {
    const activeDay = currentDay();
    const nextDay = nextUnfinishedDay();
    const start = new Date(startedAt || Date.now());
    const formatter = new Intl.DateTimeFormat('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' });
    dayCards.forEach((card, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      card.classList.toggle('is-today', index === activeDay - 1 && done < 7);
      card.classList.toggle('is-next', index === nextDay - 1 && done < 7);
      card.querySelector('[data-day-date]').textContent = formatter.format(date);
    });
    const today = document.querySelector('[data-route-today]');
    today.textContent = done === 7
      ? 'Je hebt zeven dagen verkend. De eindspiegel hieronder vraagt niet om een perfecte conclusie.'
      : activeDay === nextDay
        ? `Volgens je startdatum is dit dag ${activeDay}, ook je eerstvolgende onverkende stap. Het ritme blijft een voorstel.`
        : `Volgens je startdatum is dit dag ${activeDay}. Je eerstvolgende onverkende stap is dag ${nextDay}; vroeger, later of overslaan mag.`;
  }

  function renderResume(done) {
    resume.hidden = !routeActive;
    if (!routeActive) return;
    const day = nextUnfinishedDay();
    const pattern = form.elements.pattern.value.trim();
    document.querySelector('[data-route-resume-title]').textContent = done === 7
      ? `Je eindspiegel voor “${pattern}” staat klaar.`
      : `Je eerstvolgende onverkende stap rond “${pattern}” is dag ${day}. ${done} van 7 dagen verkend.`;
    document.querySelector('[data-route-resume-action]').textContent = done === 7 ? 'Bekijk je eindspiegel →' : `Ga verder met dag ${day} →`;
    resume.href = done === 7 ? '#route-finish' : `#route-day-${day}`;
  }

  function saveIfChosen() {
    if (!routeActive) return;
    try {
      if (form.elements.persist.checked) {
        localStorage.setItem(KEY, JSON.stringify(formData()));
        localStorage.removeItem(PREVIOUS_KEY);
        status.textContent = 'Lokaal bewaard op dit apparaat. Er wordt niets verzonden.';
      } else {
        localStorage.removeItem(KEY);
        localStorage.removeItem(PREVIOUS_KEY);
        status.textContent = 'Tijdelijke modus: je route verdwijnt wanneer je deze pagina sluit of vernieuwt.';
      }
    } catch (_) {
      status.textContent = 'Deze browser laat lokaal bewaren niet toe. Je kunt de route wel blijven gebruiken of als tekstbestand bewaren.';
    }
  }

  function updateProgress() {
    const done = checks.filter(input => input.checked).length;
    document.querySelector('[data-route-score]').textContent = `${done}/7`;
    document.querySelector('[data-route-bar]').style.width = `${Math.round(done / 7 * 100)}%`;
    progress.setAttribute('aria-valuenow', String(done));
    finish.hidden = done < 7;
    if (done < 7) {
      summaryCard.hidden = true;
      postSummaryActions.forEach(action => { action.hidden = true; });
    }
    updateDayFocus(done);
    renderResume(done);
    saveIfChosen();
  }

  function enableSevenDays(enabled) {
    const link = document.querySelector('[data-route-link="5"]');
    link.setAttribute('aria-disabled', String(!enabled));
    link.title = enabled ? 'Ga naar je zevendaagse experiment' : 'Maak eerst bij halte 04 je experiment';
  }

  function showPlan(data, focus) {
    routeActive = true;
    startedAt = data.startedAt || startedAt || new Date().toISOString();
    let plan = sentence(data);
    if (data.fallbackResponse) plan += ` Op een moeilijke dag mag de route krimpen tot: “${data.fallbackResponse}”.`;
    document.querySelector('[data-plan-sentence]').textContent = plan;
    panel.hidden = false;
    enableSevenDays(true);
    updateProgress();
    if (focus) {
      setActiveStep(5);
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function showBuilderStep(step, focus) {
    builderSteps.forEach(section => { section.hidden = Number(section.dataset.builderStep) !== step; });
    builderProgress.forEach(item => {
      const itemStep = Number(item.dataset.builderProgress);
      if (itemStep === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.classList.toggle('is-complete', itemStep < step);
    });
    error.textContent = '';
    if (focus) builderSteps.find(section => Number(section.dataset.builderStep) === step)?.querySelector('input')?.focus();
  }

  function valid(required = ['pattern', 'cue', 'oldResponse', 'newResponse']) {
    let first;
    required.forEach(name => {
      const field = form.elements[name];
      const bad = field.value.trim().length < 4;
      field.setAttribute('aria-invalid', String(bad));
      if (bad && !first) first = field;
    });
    error.textContent = first ? 'Vul de gemarkeerde velden in met minstens vier tekens.' : '';
    first?.focus();
    return !first;
  }

  function restore() {
    let stored;
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(PREVIOUS_KEY);
      stored = normalizedStored(raw ? JSON.parse(raw) : null);
    } catch (_) {
      try { localStorage.removeItem(KEY); localStorage.removeItem(PREVIOUS_KEY); } catch (_) {}
    }
    if (!stored) return;
    ['pattern', 'cue', 'oldResponse', 'conditions', 'need', 'newResponse', 'fallbackResponse'].forEach(name => { form.elements[name].value = stored[name] || ''; });
    reflectionFields.forEach(field => { field.value = stored[field.dataset.seedTarget] || ''; });
    form.elements.persist.checked = true;
    checks.forEach((input, index) => { input.checked = stored.checks[index]; });
    notes.forEach((input, index) => { input.value = stored.notes[index]; });
    document.querySelector('[name="reviewDiscovery"]').value = stored.reviewDiscovery;
    document.querySelector('[name="reviewConditions"]').value = stored.reviewConditions;
    document.querySelector('[name="reviewDecision"]').value = stored.reviewDecision;
    startedAt = stored.startedAt;
    showPlan(stored, false);
  }

  function saveToMenslab() {
    const trackStatus = document.querySelector('[data-route-track-status]');
    const data = formData();
    const decision = decisionLabels[data.reviewDecision] || 'Nog geen beslissing';
    const livedNote = data.notes.filter(Boolean).slice(-2).join(' ');
    const observations = [
      data.reviewDiscovery && `Wat hielp of verraste: ${data.reviewDiscovery}`,
      data.reviewConditions && `Wat de oude route waarschijnlijker maakte: ${data.reviewConditions}`,
      !data.reviewConditions && data.conditions && `Wat er vlak ervoor moeilijk was: ${data.conditions}`,
      !data.reviewDiscovery && !data.reviewConditions && livedNote && `Uit de dagnotities: ${livedNote}`,
      `Volgende keuze: ${decision}.`
    ].filter(Boolean).join(' ');
    try {
      const raw = localStorage.getItem(TRACK_KEY) || localStorage.getItem(PREVIOUS_TRACK_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const track = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      const snapshots = Array.isArray(track.labSnapshots) ? track.labSnapshots : [];
      const title = `Veranderroute · ${data.pattern}`.slice(0, 140);
      track.labSnapshots = snapshots
        .filter(item => !(item?.kind === 'route' && item?.title === title))
        .slice(0, 249);
      track.labSnapshots.unshift({
        kind: 'route',
        title,
        prompt: sentence(data),
        expectation: data.fallbackResponse ? `Nooduitgang: ${data.fallbackResponse}` : '',
        observation: observations.slice(0, 500),
        savedAt: new Date().toISOString()
      });
      localStorage.setItem(TRACK_KEY, JSON.stringify(track));
      localStorage.removeItem(PREVIOUS_TRACK_KEY);
      document.querySelector('[data-save-route-track]').textContent = 'Eindspiegel bewaard';
      const link = document.createElement('a');
      link.href = 'menslab.html#mijn-spoor';
      link.textContent = 'Bekijk Mijn spoor →';
      trackStatus.replaceChildren(document.createTextNode('Je eindspiegel is alleen op dit apparaat bewaard. '), link);
    } catch (_) {
      trackStatus.textContent = 'Bewaren in Mijn spoor lukt niet in deze browser. Je kunt je route wel als tekstbestand bewaren.';
    }
  }

  function buildSummary(focus) {
    const data = formData();
    const livedNote = data.notes.filter(Boolean).slice(-1)[0];
    document.querySelector('[data-summary-pattern]').textContent = data.pattern || 'Mijn kleine veranderroute';
    document.querySelector('[data-summary-conditions]').textContent = data.reviewConditions || data.conditions || data.cue || 'Ik wil dit nog verder onderzoeken.';
    document.querySelector('[data-summary-discovery]').textContent = data.reviewDiscovery || livedNote || 'Ik wil dit nog verder in woorden brengen.';
    document.querySelector('[data-summary-decision]').textContent = decisionLabels[data.reviewDecision] || 'Ik hoef nog niet te besluiten.';
    summaryCard.hidden = false;
    summaryCard.setAttribute('tabindex', '-1');
    postSummaryActions.forEach(action => { action.hidden = false; });
    if (focus) {
      summaryCard.focus?.({ preventScroll: true });
      summaryCard.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }
  }

  reflectionFields.forEach(field => field.addEventListener('input', () => {
    const target = form.elements[field.dataset.seedTarget];
    if (!target.value || target.dataset.seeded === 'true') {
      target.value = field.value;
      target.dataset.seeded = 'true';
    }
  }));

  document.querySelectorAll('[data-builder-next]').forEach(button => button.addEventListener('click', () => {
    const current = Number(button.closest('[data-builder-step]').dataset.builderStep);
    const requiredByStep = { 1: ['pattern', 'oldResponse'], 2: ['cue'] };
    if (!valid(requiredByStep[current] || [])) return;
    showBuilderStep(Number(button.dataset.builderNext), true);
  }));
  document.querySelectorAll('[data-builder-back]').forEach(button => button.addEventListener('click', () => showBuilderStep(Number(button.dataset.builderBack), true)));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const requiredByStep = [['pattern', 'oldResponse'], ['cue'], ['newResponse']];
    const invalidStep = requiredByStep.findIndex(names => names.some(name => form.elements[name].value.trim().length < 4));
    if (invalidStep !== -1) {
      showBuilderStep(invalidStep + 1, false);
      valid(requiredByStep[invalidStep]);
      return;
    }
    if (!startedAt) startedAt = new Date().toISOString();
    showPlan(formData(), true);
  });

  form.querySelectorAll('input').forEach(field => field.addEventListener('input', () => {
    if (field.dataset.seeded === 'true') field.dataset.seeded = 'false';
    if (field.getAttribute('aria-invalid') === 'true' && field.value.trim().length >= 4) field.setAttribute('aria-invalid', 'false');
  }));
  form.elements.persist.addEventListener('change', saveIfChosen);
  checks.forEach(input => input.addEventListener('change', updateProgress));
  notes.forEach(input => input.addEventListener('input', saveIfChosen));
  reviewFields.forEach(input => input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => {
    saveIfChosen();
    if (!summaryCard.hidden) buildSummary(false);
  }));

  mapLinks.forEach(link => link.addEventListener('click', event => {
    if (link.getAttribute('aria-disabled') !== 'true') return;
    event.preventDefault();
    error.textContent = 'Maak bij halte 04 eerst een kleine route. Daarna verschijnt je zevendaagse experiment.';
    document.getElementById('halte-4').scrollIntoView({ behavior: 'smooth', block: 'start' });
    builderSteps.find(section => !section.hidden)?.querySelector('input')?.focus({ preventScroll: true });
  }));

  const visibleStops = new Map();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { visibleStops.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0); });
      const active = [...visibleStops.entries()].sort((a, b) => b[1] - a[1])[0];
      if (active?.[1] > 0) setActiveStep(Number(active[0].replace('halte-', '')));
    }, { rootMargin: '-18% 0px -58% 0px', threshold: [0, .15, .4, .7] });
    document.querySelectorAll('#halte-1,#halte-2,#halte-3,#halte-4,#halte-5').forEach(section => observer.observe(section));
  }

  const clearButton = document.querySelector('[data-clear-route]');
  clearButton.addEventListener('click', () => {
    if (!clearArmed) {
      clearArmed = true;
      clearButton.textContent = 'Klik nog eens om je lokale route te wissen';
      status.textContent = 'Je eindspiegel in Mijn spoor wordt hiermee niet gewist.';
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        clearArmed = false;
        clearButton.textContent = 'Wis mijn lokale route';
        if (status.textContent === 'Je eindspiegel in Mijn spoor wordt hiermee niet gewist.') status.textContent = '';
      }, 5000);
      return;
    }
    clearTimeout(clearTimer);
    clearArmed = false;
    try { localStorage.removeItem(KEY); localStorage.removeItem(PREVIOUS_KEY); } catch (_) {}
    form.reset();
    checks.forEach(input => { input.checked = false; });
    notes.forEach(input => { input.value = ''; });
    reviewFields.forEach(input => { input.value = ''; });
    startedAt = '';
    routeActive = false;
    panel.hidden = true;
    finish.hidden = true;
    summaryCard.hidden = true;
    postSummaryActions.forEach(action => { action.hidden = true; });
    resume.hidden = true;
    enableSevenDays(false);
    error.textContent = '';
    status.textContent = '';
    clearButton.textContent = 'Wis mijn lokale route';
    reflectionFields.forEach(field => { field.value = ''; });
    showBuilderStep(1, false);
    setActiveStep(4);
    form.elements.pattern.focus();
  });

  document.querySelector('[data-download-route]').addEventListener('click', () => {
    const data = formData();
    const start = new Date(data.startedAt);
    const dateFormatter = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
    const dayLines = notes.map((note, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return `DAG ${index + 1} · ${dateFormatter.format(date)}${checks[index].checked ? ' — verkend' : ''}\n${note.value.trim() || 'Geen notitie.'}`;
    }).join('\n\n');
    const review = ['EINDSPIEGEL', `WAT HIELP OF VERRASTE: ${data.reviewDiscovery || 'Niet ingevuld.'}`, `WAT MAAKTE DE OUDE ROUTE WAARSCHIJNLIJKER: ${data.reviewConditions || 'Niet ingevuld.'}`, `VOLGENDE KEUZE: ${decisionLabels[data.reviewDecision] || 'Nog niet gekozen.'}`].join('\n');
    const output = ['DE ONWIJZE WIJSHEDEN — MIJN VERANDERROUTE', '', `GESTART: ${dateFormatter.format(start)}`, `PATROON: ${data.pattern}`, `AANLEIDING: ${data.cue}`, `GEWONE REACTIE: ${data.oldResponse}`, `WAT ER VLAK ERVOOR MOEILIJK WAS: ${data.conditions || 'Niet ingevuld.'}`, `WAT DE REACTIE MOGELIJK OPLEVERT OF HELPT VERMIJDEN: ${data.need || 'Niet ingevuld.'}`, `NIEUWE KLEINE REACTIE: ${data.newResponse}`, `NOODUITGANG: ${data.fallbackResponse || 'Niet ingevuld.'}`, '', sentence(data), '', dayLines, '', review, '', 'Dit bestand werd lokaal gemaakt. Er is niets automatisch verzonden.'].join('\n');
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mijn-veranderroute.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  document.querySelector('[data-build-route-summary]').addEventListener('click', () => buildSummary(true));
  document.querySelector('[data-save-route-track]').addEventListener('click', saveToMenslab);
  restore();
})();
