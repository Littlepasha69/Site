(function () {
  const KEY = 'onwijze-veranderroute-v1';
  const form = document.querySelector('[data-change-builder]');
  const panel = document.querySelector('[data-seven-days]');
  if (!form || !panel) return;
  const checks = [...document.querySelectorAll('[data-day-check]')];
  const notes = [...document.querySelectorAll('[data-day-note]')];
  const error = document.querySelector('[data-builder-error]');
  const status = document.querySelector('[data-storage-status]');

  function formData() {
    return {
      pattern: form.elements.pattern.value.trim(), cue: form.elements.cue.value.trim(),
      oldResponse: form.elements.oldResponse.value.trim(), need: form.elements.need.value.trim(),
      newResponse: form.elements.newResponse.value.trim(), persist: form.elements.persist.checked,
      checks: checks.map(input => input.checked), notes: notes.map(input => input.value)
    };
  }
  function sentence(data) {
    return `Wanneer ${data.cue.toLowerCase()}, probeer ik in plaats van “${data.oldResponse}” deze kleinere reactie: “${data.newResponse}”.`;
  }
  function updateProgress() {
    const done = checks.filter(input => input.checked).length;
    document.querySelector('[data-route-score]').textContent = `${done}/7`;
    document.querySelector('[data-route-bar]').style.width = `${Math.round(done / 7 * 100)}%`;
    saveIfChosen();
  }
  function saveIfChosen() {
    if (form.elements.persist.checked && panel.hidden === false) {
      localStorage.setItem(KEY, JSON.stringify(formData()));
      status.textContent = 'Lokaal bewaard op dit apparaat. Er wordt niets verzonden.';
    } else if (!form.elements.persist.checked) {
      localStorage.removeItem(KEY);
      status.textContent = 'Tijdelijke modus: je route verdwijnt wanneer je deze pagina sluit of vernieuwt.';
    }
  }
  function showPlan(data, focus) {
    document.querySelector('[data-plan-sentence]').textContent = sentence(data);
    panel.hidden = false;
    updateProgress();
    if (focus) panel.focus();
  }
  function valid() {
    const required = ['pattern','cue','oldResponse','newResponse'];
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
    let data;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch { localStorage.removeItem(KEY); }
    if (!data) return;
    ['pattern','cue','oldResponse','need','newResponse'].forEach(name => { form.elements[name].value = data[name] || ''; });
    form.elements.persist.checked = true;
    checks.forEach((input, index) => { input.checked = Boolean(data.checks?.[index]); });
    notes.forEach((input, index) => { input.value = data.notes?.[index] || ''; });
    showPlan(data, false);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    showPlan(formData(), true);
  });
  form.elements.persist.addEventListener('change', saveIfChosen);
  checks.forEach(input => input.addEventListener('change', updateProgress));
  notes.forEach(input => input.addEventListener('input', saveIfChosen));
  document.querySelector('[data-clear-route]').addEventListener('click', () => {
    localStorage.removeItem(KEY); form.reset(); checks.forEach(x => x.checked = false); notes.forEach(x => x.value = '');
    panel.hidden = true; error.textContent = ''; status.textContent = ''; form.elements.pattern.focus();
  });
  document.querySelector('[data-download-route]').addEventListener('click', () => {
    const data = formData();
    const dayLines = notes.map((note, i) => `DAG ${i + 1}${checks[i].checked ? ' — verkend' : ''}\n${note.trim() || 'Geen notitie.'}`).join('\n\n');
    const text = ['DE ONWIJZE WIJSHEDEN — MIJN VERANDERROUTE','',`PATROON: ${data.pattern}`,`AANLEIDING: ${data.cue}`,`GEWONE REACTIE: ${data.oldResponse}`,`MOGELIJKE BEHOEFTE: ${data.need || 'Niet ingevuld.'}`,`NIEUWE KLEINE REACTIE: ${data.newResponse}`,'',sentence(data),'',dayLines,'','Dit bestand werd lokaal gemaakt. Er is niets automatisch verzonden.'].join('\n');
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'}); const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'mijn-veranderroute.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  restore();
})();
