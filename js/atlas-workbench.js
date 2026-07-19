(function () {
  const lab = document.querySelector('[data-atlas-workbench]');
  if (!lab) return;

  const id = lab.dataset.atlasWorkbench;
  const storageKey = `onwijze-atlas-werkplaats-${id}-v1`;
  const fields = Array.from(lab.querySelectorAll('[data-workbench-field]'));
  const status = lab.querySelector('[data-workbench-status]');

  function setStatus(message) {
    if (!status) return;
    status.textContent = message;
    window.clearTimeout(setStatus.timer);
    setStatus.timer = window.setTimeout(() => { status.textContent = ''; }, 3500);
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    fields.forEach(field => {
      if (typeof saved[field.dataset.workbenchField] === 'string') {
        field.value = saved[field.dataset.workbenchField];
      }
    });
  } catch (_) {}

  lab.querySelector('[data-workbench-save]')?.addEventListener('click', () => {
    const payload = {};
    fields.forEach(field => { payload[field.dataset.workbenchField] = field.value; });
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setStatus('Bewaard op dit apparaat ✓');
    } catch (_) {
      setStatus('Bewaren lukt niet in deze browser.');
    }
  });

  lab.querySelector('[data-workbench-clear]')?.addEventListener('click', () => {
    fields.forEach(field => { field.value = ''; });
    try { localStorage.removeItem(storageKey); } catch (_) {}
    setStatus('Werkblad gewist.');
  });
})();
