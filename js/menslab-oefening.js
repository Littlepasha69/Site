(function () {
  const page = document.querySelector('[data-exercise-id]');
  const form = document.querySelector('[data-practice-form]');
  if (!page || !form) return;

  const exerciseId = page.dataset.exerciseId;
  const draftStorageKey = 'menslab-exercise-drafts-v1';
  const progressStorageKey = 'menslab-progress-v3';
  const fields = [...form.querySelectorAll('textarea[name]')];
  const stops = [...form.querySelectorAll('[data-practice-stop]')];
  const autosave = document.querySelector('[data-practice-autosave]');
  const status = document.querySelector('[data-practice-status]');
  let timer;

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function fieldValues() {
    return Object.fromEntries(fields.map(field => [field.name, field.value.slice(0, Number(field.maxLength) || 500)]));
  }

  function renderProgress() {
    const touched = stops.filter(stop => [...stop.querySelectorAll('textarea')].some(field => field.value.trim())).length;
    document.querySelector('[data-practice-count]').textContent = String(touched);
    document.querySelector('[data-practice-bar]').style.width = `${(touched / stops.length) * 100}%`;
  }

  function saveDraft(message) {
    try {
      const drafts = readJSON(draftStorageKey, {});
      drafts[exerciseId] = { values:fieldValues(), updatedAt:new Date().toISOString() };
      localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
      if (message) autosave.textContent = message;
    } catch (error) {
      autosave.textContent = 'Deze browser laat lokale opslag hier niet toe.';
    }
  }

  const draft = readJSON(draftStorageKey, {})[exerciseId];
  if (draft?.values && typeof draft.values === 'object') {
    fields.forEach(field => { if (typeof draft.values[field.name] === 'string') field.value = draft.values[field.name]; });
    autosave.textContent = 'Je eerdere concept staat klaar.';
  }
  renderProgress();

  fields.forEach(field => field.addEventListener('input', () => {
    renderProgress();
    autosave.textContent = 'Wordt lokaal bewaard…';
    clearTimeout(timer);
    timer = setTimeout(() => saveDraft('Concept lokaal bewaard.'), 280);
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = fieldValues();
    if (!Object.values(values).some(value => value.trim())) {
      status.textContent = 'Raak eerst minstens één halte aan.';
      fields[0].focus();
      return;
    }
    try {
      const progress = readJSON(progressStorageKey, {});
      const snapshots = Array.isArray(progress.labSnapshots) ? progress.labSnapshots : [];
      const compact = parts => parts.filter(([, value]) => value.trim()).map(([label, value]) => `${label}: ${value.trim()}`).join(' · ');
      snapshots.unshift({
        kind:'exercise',
        title:'De emotionele routekaart',
        prompt:compact([['Camera', values.camera], ['Lichaam', values.body], ['Mogelijke namen', values.names], ['Betekenis', values.meaning], ['Impuls', values.impulse]]).slice(0, 500),
        expectation:'',
        observation:compact([['Vóór', values.before], ['Tijdens', values.during], ['Erna', values.after]]).slice(0, 500),
        nextAction:values.values.trim().slice(0, 220),
        savedAt:new Date().toISOString()
      });
      progress.labSnapshots = snapshots.slice(0, 250);
      localStorage.setItem(progressStorageKey, JSON.stringify(progress));
      saveDraft('Deze versie staat ook als concept klaar.');
      status.textContent = 'Bewaard in Mijn spoor op dit apparaat.';
      document.querySelector('[data-practice-track-link]').focus();
    } catch (error) {
      status.textContent = 'Bewaren lukt niet in deze browser. Je tekst blijft op deze pagina staan.';
    }
  });
})();
