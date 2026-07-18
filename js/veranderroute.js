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
  const mapLinks = [...document.querySelectorAll('[data-route-link]')];
  const error = document.querySelector('[data-builder-error]');
  const status = document.querySelector('[data-storage-status]');
  const resume = document.querySelector('[data-route-resume]');
  const finish = document.querySelector('[data-route-finish]');
  const progress = document.querySelector('[data-route-progress]');
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

  function setActiveStep(step) {
    mapLinks.forEach(link => {
      if (Number(link.dataset.routeLink) === step) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }

  function updateDayFocus(done) {
    const activeDay = currentDay();
    const start = new Date(startedAt || Date.now());
    const formatter = new Intl.DateTimeFormat('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' });
    dayCards.forEach((card, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      card.classList.toggle('is-today', index === activeDay - 1 && done < 7);
      card.querySelector('[data-day-date]').textContent = formatter.format(date);
    });
    const today = document.querySelector('[data-route-today]');
    today.textContent = done === 7
      ? 'Je hebt zeven haltes verkend. De eindspiegel hieronder vraagt niet om een perfecte conclusie.'
      : `Volgens je startdatum is dit dag ${activeDay}. Het ritme is een voorstel: vroeger, later of een dag overslaan mag.`;
  }

  function renderResume(done) {
    resume.hidden = !routeActive;
    if (!routeActive) return;
    const day = currentDay();
    const pattern = form.elements.pattern.value.trim();
    document.querySelector('[data-route-resume-title]').textContent = done === 7
      ? `Je eindspiegel voor “${pattern}” staat klaar.`
      : `Dag ${day} van je route rond “${pattern}”. ${done} van 7 dagen verkend.`;
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

  function valid() {
    const required = ['pattern', 'cue', 'oldResponse', 'newResponse'];
    let first;
    required.forEach(name => {
      const field = form.elements[name];
      const bad = field.value.trim().length < 4;
      field.setAttribute('aria-invalid', String(bad));
      if (bad && !first) first = field;
    });
    error.textContent = first ? 'Vul de vier verplichte velden in met minstens vier tekens.' : '';
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
    ['pattern', 'cue', 'oldResponse', 'need', 'newResponse', 'fallbackResponse'].forEach(name => { form.elements[name].value = stored[name] || ''; });
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

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    if (!startedAt) startedAt = new Date().toISOString();
    showPlan(formData(), true);
  });

  form.querySelectorAll('input').forEach(field => field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true' && field.value.trim().length >= 4) field.setAttribute('aria-invalid', 'false');
  }));
  form.elements.persist.addEventListener('change', saveIfChosen);
  checks.forEach(input => input.addEventListener('change', updateProgress));
  notes.forEach(input => input.addEventListener('input', saveIfChosen));
  reviewFields.forEach(input => input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', saveIfChosen));

  mapLinks.forEach(link => link.addEventListener('click', event => {
    if (link.getAttribute('aria-disabled') !== 'true') return;
    event.preventDefault();
    error.textContent = 'Maak bij halte 04 eerst een kleine route. Daarna verschijnt je zevendaagse experiment.';
    document.getElementById('halte-4').scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.pattern.focus({ preventScroll: true });
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
    resume.hidden = true;
    enableSevenDays(false);
    error.textContent = '';
    status.textContent = '';
    clearButton.textContent = 'Wis mijn lokale route';
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
    const output = ['DE ONWIJZE WIJSHEDEN — MIJN VERANDERROUTE', '', `GESTART: ${dateFormatter.format(start)}`, `PATROON: ${data.pattern}`, `AANLEIDING: ${data.cue}`, `GEWONE REACTIE: ${data.oldResponse}`, `MOGELIJKE BEHOEFTE: ${data.need || 'Niet ingevuld.'}`, `NIEUWE KLEINE REACTIE: ${data.newResponse}`, `NOODUITGANG: ${data.fallbackResponse || 'Niet ingevuld.'}`, '', sentence(data), '', dayLines, '', review, '', 'Dit bestand werd lokaal gemaakt. Er is niets automatisch verzonden.'].join('\n');
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mijn-veranderroute.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  document.querySelector('[data-save-route-track]').addEventListener('click', saveToMenslab);
  restore();
})();
