(function () {
  const form = document.querySelector('[data-direct-profile-form]');
  if (!form) return;

  const profileKey = 'onwijze-profile-v1';
  const interestLimit = 3;
  const interestInputs = [...form.querySelectorAll('input[name="interests"]')];
  const mailInputs = [...form.querySelectorAll('input[name="mailPreferences"]')];
  const mailAll = form.querySelector('[data-mail-all]');
  const interestStatus = form.querySelector('[data-interest-status]');
  const error = form.querySelector('[data-form-error]');
  const avatarInput = form.querySelector('[data-avatar-input]');
  const avatarPreview = form.querySelector('[data-avatar-preview]');
  const avatarImage = form.querySelector('[data-avatar-image]');
  const avatarInitial = form.querySelector('[data-avatar-initial]');
  const useSignature = form.querySelector('[data-use-signature]');
  const signatureInputs = [...form.querySelectorAll('input[name="signature"]')];
  const cancel = form.querySelector('[data-profile-cancel]');
  const title = document.querySelector('[data-editor-title]');
  const submit = form.querySelector('[data-profile-submit]');
  const editMode = new URLSearchParams(location.search).has('bewerken');
  let avatarMode = 'signature';
  let avatarDataUrl = '';

  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(profileKey) || 'null');
      return value && (value.version === 1 || value.version === 2) ? value : null;
    } catch (_) {
      return null;
    }
  }

  function selectedSignature() {
    return form.elements.signature?.value || 'orbit';
  }

  function setSignaturePreview(signature) {
    avatarPreview.dataset.signature = signature || 'orbit';
    avatarPreview.classList.remove('has-image');
    avatarImage.hidden = true;
    avatarInitial.hidden = false;
  }

  function setImagePreview(src) {
    if (!src) return;
    avatarImage.src = src;
    avatarImage.hidden = false;
    avatarInitial.hidden = true;
    avatarPreview.classList.add('has-image');
  }

  function updateInitial() {
    const name = form.elements.name.value.trim();
    avatarInitial.textContent = name ? name.charAt(0).toLocaleUpperCase('nl') : '?';
  }

  function updateInterestState(changed) {
    const checked = interestInputs.filter(input => input.checked);
    if (checked.length > interestLimit && changed) changed.checked = false;
    const count = interestInputs.filter(input => input.checked).length;
    interestInputs.forEach(input => {
      input.disabled = !input.checked && count >= interestLimit;
    });
    interestStatus.textContent = count ? `${count} van ${interestLimit} gekozen.` : 'Je mag er maximaal drie kiezen.';
  }

  function syncMailAll() {
    mailAll.checked = mailInputs.every(input => input.checked);
    mailAll.indeterminate = !mailAll.checked && mailInputs.some(input => input.checked);
  }

  function fileToSquareImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Kies een afbeelding.'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Deze foto is groter dan 10 MB. Kies een kleinere afbeelding.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Deze afbeelding kon niet worden gelezen.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('Deze afbeelding kon niet worden geopend.'));
        image.onload = () => {
          const size = Math.min(image.naturalWidth, image.naturalHeight);
          const sourceX = (image.naturalWidth - size) / 2;
          const sourceY = (image.naturalHeight - size) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = 520;
          canvas.height = 520;
          const context = canvas.getContext('2d');
          context.fillStyle = '#123f3b';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, sourceX, sourceY, size, size, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', .82));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function setField(name, value) {
    const field = form.elements[name];
    if (field && typeof value === 'string') field.value = value;
  }

  function prefill(profile) {
    if (!profile) {
      updateInitial();
      updateInterestState();
      return;
    }
    setField('name', profile.name || '');
    setField('email', profile.email || '');
    setField('intro', profile.intro || '');
    setField('fear', profile.personal?.fear || '');
    setField('guilty', profile.personal?.guilty || '');
    setField('dream', profile.personal?.dream || '');
    interestInputs.forEach(input => { input.checked = (profile.interests || []).includes(input.value); });
    mailInputs.forEach(input => { input.checked = (profile.mailPreferences || []).includes(input.value); });
    ['normal', 'history', 'chaos'].forEach(name => {
      const value = profile.quick?.[name];
      const input = [...form.querySelectorAll(`input[name="${name}"]`)].find(item => item.value === value);
      if (input) input.checked = true;
    });
    const signature = profile.signature || 'orbit';
    const signatureInput = signatureInputs.find(input => input.value === signature);
    if (signatureInput) signatureInput.checked = true;
    avatarMode = profile.avatarMode || (profile.beastId ? 'beast' : 'signature');
    avatarDataUrl = profile.avatarDataUrl || '';
    updateInitial();
    setSignaturePreview(signature);
    if (avatarMode === 'upload' && avatarDataUrl) {
      setImagePreview(avatarDataUrl);
    } else if (avatarMode === 'beast' && profile.beastId) {
      const beast = window.BEAST_QUIZ?.beasts?.find(item => item.id === profile.beastId || item.legacyIds?.includes(profile.beastId));
      if (beast) setImagePreview(beast.image || `images/beasts/${beast.id}.jpg`);
    }
    updateInterestState();
    syncMailAll();
  }

  form.elements.name.addEventListener('input', updateInitial);
  interestInputs.forEach(input => input.addEventListener('change', () => updateInterestState(input)));
  mailInputs.forEach(input => input.addEventListener('change', syncMailAll));
  mailAll.addEventListener('change', () => {
    mailInputs.forEach(input => { input.checked = mailAll.checked; });
    syncMailAll();
  });
  signatureInputs.forEach(input => input.addEventListener('change', () => {
    if (avatarMode === 'signature') setSignaturePreview(input.value);
  }));
  useSignature.addEventListener('click', () => {
    avatarMode = 'signature';
    avatarDataUrl = '';
    avatarInput.value = '';
    setSignaturePreview(selectedSignature());
    error.textContent = 'Je geometrische signatuur wordt je profielbeeld.';
  });
  avatarInput.addEventListener('change', async () => {
    error.textContent = 'Je foto wordt lokaal klaargemaakt…';
    try {
      avatarDataUrl = await fileToSquareImage(avatarInput.files?.[0]);
      avatarMode = 'upload';
      setImagePreview(avatarDataUrl);
      error.textContent = 'Je foto blijft alleen op dit apparaat.';
    } catch (reason) {
      avatarInput.value = '';
      error.textContent = reason.message || 'Deze foto kon niet worden gebruikt.';
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const mailPreferences = mailInputs.filter(input => input.checked).map(input => input.value);
    if (name.length < 2) {
      error.textContent = 'Geef ons minstens twee tekens om je te herkennen.';
      form.elements.name.focus();
      return;
    }
    if (mailPreferences.length && !email) {
      error.textContent = 'Vul je e-mailadres in als je later updates wilt ontvangen.';
      form.elements.email.focus();
      return;
    }
    if (!form.elements.localConsent.checked) {
      error.textContent = 'Vink eerst aan dat we dit profiel lokaal mogen bewaren.';
      form.elements.localConsent.focus();
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const previous = readProfile() || {};
    const now = new Date().toISOString();
    const profile = {
      ...previous,
      version: 2,
      name,
      email,
      intro: form.elements.intro.value.trim(),
      interests: interestInputs.filter(input => input.checked).map(input => input.value),
      mailPreferences,
      signature: selectedSignature(),
      avatarMode,
      avatarDataUrl: avatarMode === 'upload' ? avatarDataUrl : '',
      personal: {
        fear: form.elements.fear.value.trim(),
        guilty: form.elements.guilty.value.trim(),
        dream: form.elements.dream.value.trim()
      },
      quick: {
        normal: form.elements.normal.value || '',
        history: form.elements.history.value || '',
        chaos: form.elements.chaos.value || ''
      },
      createdAt: previous.createdAt || now,
      updatedAt: now
    };
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      location.href = 'mijn-profiel.html?gemaakt=1';
    } catch (_) {
      error.textContent = 'Je profiel past niet in de lokale opslag. Probeer een andere of kleinere foto.';
    }
  });

  const current = readProfile();
  if (editMode && current) {
    title.textContent = 'Schuif je profiel weer een beetje dichter naar jezelf.';
    submit.textContent = 'Bewaar mijn profiel';
    cancel.hidden = false;
    cancel.href = 'mijn-profiel.html';
  }
  prefill(current);
}());
