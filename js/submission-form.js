(function () {
  const form = document.querySelector('[data-submission-form]');
  if (!form) return;

  const preview = document.querySelector('[data-submission-preview]');
  const formPanel = document.querySelector('[data-form-panel]');
  const status = document.querySelector('[data-form-status]');
  const summary = form.elements.summary;
  const body = form.elements.body;
  const summaryCount = document.querySelector('[data-summary-count]');
  const bodyCount = document.querySelector('[data-body-count]');

  function words(value) { return value.trim() ? value.trim().split(/\s+/).length : 0; }
  function updateCounters() {
    summaryCount.textContent = `${summary.value.length}/300`;
    bodyCount.textContent = `${words(body.value)} woorden`;
  }

  const launchParams = new URLSearchParams(location.search);
  const requestedSubject = launchParams.get('onderwerp');
  const requestedType = launchParams.get('type');
  if (requestedType && [...form.elements.type.options].some(option => option.value === requestedType)) {
    form.elements.type.value = requestedType;
  }
  if (requestedSubject) {
    const readableSubject = requestedSubject
      .replace(/[-_]+/g, ' ')
      .replace(/^./, character => character.toLocaleUpperCase('nl'));
    if (!form.elements.title.value) form.elements.title.value = `Aanvulling bij dossier: ${readableSubject}`;
    const context = document.createElement('div');
    context.className = 'submission-edit-context';
    context.innerHTML = '<span aria-hidden="true">◉</span><div><strong></strong><p>Je wijzigt de publicatie niet rechtstreeks. Maak hier een correctie, bron of nuance klaar voor redactionele beoordeling.</p></div>';
    context.querySelector('strong').textContent = `Je werkt aan: ${readableSubject}`;
    form.prepend(context);
  }

  summary.addEventListener('input', updateCounters);
  body.addEventListener('input', updateCounters);
  updateCounters();

  function setError(field, message) {
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    const error = document.getElementById(`${field.id}-error`);
    if (error) error.textContent = message;
    return !message;
  }

  function sourceList() {
    return form.elements.sources.value.split(/\n/).map(value => value.trim()).filter(Boolean);
  }

  function validate() {
    let valid = true;
    const type = form.elements.type;
    const title = form.elements.title;
    const author = form.elements.author;
    const email = form.elements.email;
    const minimumWords = ['correctie', 'bron'].includes(type.value) ? 25 : 80;

    valid = setError(type, type.value ? '' : 'Kies welk soort bijdrage dit is.') && valid;
    valid = setError(title, title.value.trim().length >= 8 ? '' : 'Gebruik minstens 8 tekens voor de titel.') && valid;
    valid = setError(summary, summary.value.trim().length >= 30 ? '' : 'Vat je bijdrage samen in minstens 30 tekens.') && valid;
    valid = setError(body, words(body.value) >= minimumWords ? '' : `Schrijf minstens ${minimumWords} woorden voor dit type bijdrage.`) && valid;
    valid = setError(author, author.value.length <= 80 ? '' : 'Naam of pseudoniem mag maximaal 80 tekens bevatten.') && valid;
    valid = setError(email, !email.value || email.validity.valid ? '' : 'Vul een geldig e-mailadres in of laat dit veld leeg.') && valid;

    const invalidSource = sourceList().find(value => {
      try { return new URL(value).protocol !== 'https:'; } catch { return true; }
    });
    valid = setError(form.elements.sources, invalidSource ? 'Gebruik één volledige https-link per regel.' : '') && valid;

    for (const checkbox of form.querySelectorAll('[data-required-check]')) {
      const error = document.getElementById(`${checkbox.id}-error`);
      if (error) error.textContent = checkbox.checked ? '' : 'Deze bevestiging is nodig.';
      if (!checkbox.checked) valid = false;
    }
    if (form.elements.website.value) valid = false;
    return valid;
  }

  function put(selector, value, fallback = 'Niet opgegeven') {
    const element = preview.querySelector(selector);
    element.textContent = value || fallback;
  }

  function renderPreview() {
    const data = new FormData(form);
    put('[data-preview-type]', form.elements.type.options[form.elements.type.selectedIndex].text);
    put('[data-preview-title]', data.get('title'));
    put('[data-preview-summary]', data.get('summary'));
    put('[data-preview-body]', data.get('body'));
    put('[data-preview-author]', data.get('author'), 'Anoniem');
    put('[data-preview-email]', data.get('email'), 'Geen contactadres');
    put('[data-preview-interests]', data.get('interests'), 'Geen belangen vermeld');

    const sourceRoot = preview.querySelector('[data-preview-sources]');
    sourceRoot.replaceChildren();
    const sources = sourceList();
    if (!sources.length) sourceRoot.textContent = 'Geen externe bronnen opgegeven.';
    else sources.forEach(url => {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      sourceRoot.append(link);
    });

    formPanel.hidden = true;
    preview.hidden = false;
    preview.focus();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = '';
    if (!validate()) {
      status.textContent = 'Controleer de gemarkeerde velden en bevestigingen.';
      const firstInvalid = form.querySelector('[aria-invalid="true"], [data-required-check]:not(:checked)');
      firstInvalid?.focus();
      return;
    }
    renderPreview();
  });

  preview.querySelector('[data-edit-submission]').addEventListener('click', () => {
    preview.hidden = true;
    formPanel.hidden = false;
    form.elements.title.focus();
  });

  preview.querySelector('[data-download-submission]').addEventListener('click', () => {
    const typeLabel = form.elements.type.options[form.elements.type.selectedIndex].text;
    const lines = [
      'DE ONWIJZE WIJSHEDEN — CONCEPTINZENDING',
      `Aangemaakt: ${new Date().toLocaleString('nl-BE')}`,
      '', `TYPE: ${typeLabel}`, `TITEL: ${form.elements.title.value.trim()}`,
      `AUTEUR/PSEUDONIEM: ${form.elements.author.value.trim() || 'Anoniem'}`,
      `CONTACT (NIET PUBLICEREN): ${form.elements.email.value.trim() || 'Niet opgegeven'}`,
      '', 'SAMENVATTING', form.elements.summary.value.trim(),
      '', 'BIJDRAGE', form.elements.body.value.trim(),
      '', 'BRONNEN', ...(sourceList().length ? sourceList() : ['Geen externe bronnen opgegeven.']),
      '', 'MOGELIJKE BELANGEN', form.elements.interests.value.trim() || 'Geen belangen vermeld.',
      '', 'PRIVACY', 'Dit bestand is lokaal gemaakt en werd niet automatisch verzonden.'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const slug = form.elements.title.value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55) || 'inzending';
    link.href = URL.createObjectURL(blob);
    link.download = `${slug}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
})();
