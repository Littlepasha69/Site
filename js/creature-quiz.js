(function () {
  const data = window.BEAST_QUIZ;
  if (!data) return;
  const traitKeys = Object.keys(data.traits);
  const intro = document.querySelector('[data-quiz-intro]');
  const stage = document.querySelector('[data-quiz-stage]');
  const result = document.querySelector('[data-quiz-result]');
  const profileMaker = document.querySelector('[data-profile-maker]');
  const profilePreview = document.querySelector('[data-profile-preview]');
  const startButton = document.querySelector('[data-start-quiz]');
  const clearSavedButton = document.querySelector('[data-clear-quiz]');
  const chapterMap = document.querySelector('[data-chapter-map]');
  const chapterNote = document.querySelector('[data-chapter-note]');
  const answerHint = document.querySelector('[data-answer-hint]');
  const questionCard = document.querySelector('.question-card');
  const answers = new Array(data.questions.length).fill(null);
  const quizStorageKey = 'beestenquiz-progress-v2';
  const profileStorageKey = 'onwijze-profile-v1';
  const trackStorageKey = 'menslab-progress-v3';
  const previousTrackStorageKey = 'menslab-progress-v2';
  const answerGlyphs = ['○', '◔', '◑', '◕', '●'];
  let current = 0;
  let ranked = [];
  let completed = false;
  let currentTraits = null;

  function readProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(profileStorageKey) || 'null');
      return parsed && typeof parsed === 'object' && parsed.version === 1 ? parsed : null;
    } catch (_) { return null; }
  }

  function saveProfile(beast, selected) {
    const previous = readProfile();
    const now = new Date().toISOString();
    const payload = {
      version: 1,
      name: profileName.value.trim().slice(0, 50),
      intro: profileIntro.value.trim().slice(0, 180),
      interests: selected.slice(0, 3),
      beastId: beast.id,
      affinity: ranked[0]?.affinity || null,
      traitScores: currentTraits,
      kindred: ranked.slice(1, 3).map(match => ({ id:match.beast.id, affinity:match.affinity })),
      createdAt: previous?.createdAt || now,
      updatedAt: now
    };
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(payload));
      return payload;
    } catch (_) { return null; }
  }

  chapterMap.replaceChildren(...data.chapters.map((chapter, index) => {
    const step = document.createElement('span');
    step.className = 'chapter-step';
    step.dataset.chapterStep = String(index);
    const marker = document.createElement('b');
    marker.textContent = String(index + 1);
    const label = document.createElement('small');
    label.textContent = chapter;
    step.append(marker, label);
    return step;
  }));

  function saveProgress() {
    try { localStorage.setItem(quizStorageKey, JSON.stringify({ current, answers, completed })); }
    catch (_) { /* De quiz blijft bruikbaar wanneer lokale opslag niet beschikbaar is. */ }
  }

  function clearProgress() {
    try { localStorage.removeItem(quizStorageKey); } catch (_) {}
  }

  function saveBeastToTrack() {
    const beast = ranked[0]?.beast;
    const button = document.querySelector('[data-save-beast-result]');
    const status = document.querySelector('[data-save-beast-status]');
    if (!beast || !button || !status) return;
    try {
      const raw = localStorage.getItem(trackStorageKey) || localStorage.getItem(previousTrackStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      const track = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      const snapshots = Array.isArray(track.labSnapshots) ? track.labSnapshots : [];
      track.labSnapshots = snapshots
        .filter(item => !(item?.kind === 'beast' && item?.title === beast.name))
        .slice(0, 249);
      track.labSnapshots.unshift({
        kind: 'beast',
        title: beast.name,
        prompt: 'Jouw beest als spiegel',
        expectation: '',
        observation: beast.essence,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem(trackStorageKey, JSON.stringify(track));
      localStorage.removeItem(previousTrackStorageKey);
      button.textContent = 'Bewaard in Mijn spoor';
      const trackLink = document.createElement('a');
      trackLink.href = 'menslab.html#mijn-spoor';
      trackLink.textContent = 'Bekijk Mijn spoor →';
      status.replaceChildren(document.createTextNode('Alleen op dit apparaat bewaard. '), trackLink);
    } catch (_) {
      status.textContent = 'Bewaren lukt niet in deze browser. De quizuitslag blijft wel zichtbaar.';
    }
  }

  function restoreProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(quizStorageKey));
      if (!saved || !Array.isArray(saved.answers) || saved.answers.length !== answers.length) return;
      saved.answers.forEach((value, index) => {
        if (value === null || (Number.isInteger(value) && value >= 1 && value <= 5)) answers[index] = value;
      });
      current = Number.isInteger(saved.current) ? Math.min(Math.max(saved.current, 0), answers.length - 1) : 0;
      completed = saved.completed === true && answers.every(value => value !== null);
      const answered = answers.filter(value => value !== null).length;
      if (answered > 0) {
        startButton.firstChild.textContent = completed ? 'Bekijk mijn uitslag opnieuw ' : `Ga verder met vraag ${current + 1} `;
        clearSavedButton.hidden = false;
      }
    } catch (_) { clearProgress(); }
  }

  function showOnly(target) {
    [intro, stage, result, profileMaker, profilePreview].forEach(section => { section.hidden = section !== target; });
    if (target !== intro) target.focus?.();
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    const question = data.questions[current];
    const trait = data.traits[question.trait];
    const questionsPerChapter = Math.ceil(data.questions.length / data.chapters.length);
    const chapterIndex = Math.min(data.chapters.length - 1, Math.floor(current / questionsPerChapter));
    stage.dataset.chapter = String(chapterIndex + 1);
    document.querySelector('[data-chapter-label]').textContent = `Hoofdstuk ${chapterIndex + 1} van ${data.chapters.length} · ${data.chapters[chapterIndex]}`;
    chapterNote.textContent = data.chapterNotes?.[chapterIndex] || '';
    chapterMap.querySelectorAll('[data-chapter-step]').forEach((step, index) => {
      step.classList.toggle('is-current', index === chapterIndex);
      step.classList.toggle('is-complete', index < chapterIndex);
      if (index === chapterIndex) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    document.querySelector('[data-progress-count]').textContent = `Vraag ${current + 1} van ${data.questions.length}`;
    const percent = Math.round((current + 1) / data.questions.length * 100);
    document.querySelector('[data-progress-percent]').textContent = `${percent}%`;
    document.querySelector('[data-progress-bar]').style.width = `${percent}%`;
    document.querySelector('[data-question-symbol]').textContent = trait.symbol;
    document.querySelector('[data-question-dimension]').textContent = question.kicker || trait.label;
    document.querySelector('[data-question-text]').textContent = question.text;
    questionCard.style.setProperty('--question-mark', `"${trait.symbol}"`);
    questionCard.classList.remove('question-card--answered');
    answerHint.textContent = answers[current] === null
      ? 'Kies wat meestal bij je past. Je innerlijke pr-afdeling mag even koffie halen.'
      : 'Dit spoor koos je eerder. Je mag het natuurlijk veranderen.';
    const answerRoot = document.querySelector('[data-answer-scale]');
    const choices = question.options || data.scale;
    answerRoot.replaceChildren(...choices.map((label, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'answer-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `question-${current}`;
      input.id = `answer-${current}-${index + 1}`;
      input.value = String(index + 1);
      input.checked = answers[current] === index + 1;
      const answerLabel = document.createElement('label');
      answerLabel.htmlFor = input.id;
      answerLabel.style.setProperty('--answer-order', String(index));
      const number = document.createElement('span');
      number.textContent = answerGlyphs[index] || String(index + 1);
      number.setAttribute('aria-hidden', 'true');
      answerLabel.append(number, document.createTextNode(label));
      input.addEventListener('change', () => {
        answers[current] = index + 1;
        saveProgress();
        questionCard.classList.add('question-card--answered');
        const confirmations = data.confirmations || ['Dat spoor nemen we mee.'];
        answerHint.textContent = confirmations[(current + index) % confirmations.length];
        document.querySelector('[data-next-question]').disabled = false;
      });
      wrapper.append(input, answerLabel);
      return wrapper;
    }));
    const previous = document.querySelector('[data-previous-question]');
    previous.disabled = current === 0;
    const next = document.querySelector('[data-next-question]');
    next.disabled = answers[current] === null;
    next.textContent = current === data.questions.length - 1 ? 'Ontdek mijn beest →' : 'Volgende →';
    questionCard.focus({ preventScroll:true });
    stage.scrollIntoView({ block:'start', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function calculateTraits() {
    const buckets = Object.fromEntries(traitKeys.map(key => [key, []]));
    data.questions.forEach((question, index) => {
      let score = (answers[index] - 1) / 4 * 100;
      if (question.reverse) score = 100 - score;
      buckets[question.trait].push(score);
    });
    return Object.fromEntries(traitKeys.map(key => [key, Math.round(buckets[key].reduce((sum, value) => sum + value, 0) / buckets[key].length)]));
  }

  function rankBeasts(traits) {
    const profileValues = traitKeys.map(key => traits[key]);
    const profileShape = profileValues.map(value => value - 50);
    const profileMagnitude = Math.sqrt(profileShape.reduce((sum, value) => sum + value * value, 0));
    return data.beasts.map(beast => {
      const distance = Math.sqrt(beast.vector.reduce((sum, value, index) => sum + Math.pow(profileValues[index] - value, 2), 0) / traitKeys.length);
      const closeness = Math.max(0, 100 - distance);
      const beastShape = beast.vector.map(value => value - 50);
      const beastMagnitude = Math.sqrt(beastShape.reduce((sum, value) => sum + value * value, 0));
      const shape = profileMagnitude > 0 && beastMagnitude > 0
        ? (beastShape.reduce((sum, value, index) => sum + value * profileShape[index], 0) / (beastMagnitude * profileMagnitude) + 1) / 2 * 100
        : closeness;
      const match = closeness * .55 + shape * .45;
      return { beast, affinity: Math.round(match), match };
    }).sort((a, b) => b.match - a.match || a.beast.name.localeCompare(b.beast.name, 'nl'));
  }

  function renderResult(previewTraits) {
    const traits = previewTraits || calculateTraits();
    currentTraits = traits;
    ranked = rankBeasts(traits);
    const top = ranked[0];
    const beast = top.beast;
    const saveBeastButton = document.querySelector('[data-save-beast-result]');
    const saveBeastStatus = document.querySelector('[data-save-beast-status]');
    saveBeastButton.hidden = Boolean(previewTraits);
    saveBeastButton.textContent = 'Bewaar in Mijn spoor';
    saveBeastStatus.replaceChildren();
    document.querySelector('[data-result-sigil]').textContent = beast.mark;
    document.querySelector('[data-result-world]').textContent = beast.world;
    document.querySelector('[data-result-archetype]').textContent = beast.archetype;
    document.querySelector('[data-result-name]').textContent = beast.name;
    document.querySelector('[data-result-essence]').textContent = beast.essence;
    const portrait = document.querySelector('[data-result-portrait]');
    const portraitImage = document.querySelector('[data-result-image]');
    portrait.hidden = false;
    portraitImage.src = beast.image || `images/beasts/${beast.id}.jpg`;
    portraitImage.alt = `Illustratie van ${beast.name}, ${beast.archetype.toLowerCase()}`;
    document.querySelector('[data-result-affinity]').textContent = `${top.affinity}%`;
    document.querySelector('[data-result-strength]').textContent = beast.strength;
    document.querySelector('[data-result-pitfall]').textContent = beast.pitfall;
    document.querySelector('[data-result-role]').textContent = beast.role;
    document.querySelector('[data-result-motto]').textContent = `“${beast.motto}”`;

    const chart = document.querySelector('[data-trait-chart]');
    chart.replaceChildren(...traitKeys.map(key => {
      const trait = data.traits[key];
      const row = document.createElement('div');
      row.className = 'trait-row';
      const label = document.createElement('label');
      label.textContent = trait.label;
      label.title = `${trait.low} ↔ ${trait.high}. ${trait.description}`;
      const track = document.createElement('div');
      track.className = 'trait-track';
      track.setAttribute('aria-label', `${trait.label}: ${traits[key]} van 100`);
      const fill = document.createElement('span');
      fill.style.width = `${traits[key]}%`;
      track.append(fill);
      const value = document.createElement('b');
      value.textContent = String(traits[key]);
      row.append(label, track, value);
      return row;
    }));

    const kindred = document.querySelector('[data-kindred-grid]');
    kindred.replaceChildren(...ranked.slice(1, 3).map(match => {
      const card = document.createElement('article');
      card.className = 'kindred-card';
      const sigil = document.createElement('div');
      sigil.className = 'kindred-sigil';
      sigil.textContent = match.beast.mark;
      const copy = document.createElement('div');
      const world = document.createElement('span');
      world.textContent = match.beast.world;
      const title = document.createElement('h3');
      title.textContent = match.beast.name;
      const description = document.createElement('p');
      description.textContent = match.beast.archetype;
      copy.append(world, title, description);
      const affinity = document.createElement('b');
      affinity.textContent = `${match.affinity}%`;
      card.append(sigil, copy, affinity);
      return card;
    }));
    prepareProfile(beast);
    if (!previewTraits) {
      completed = true;
      saveProgress();
    }
    showOnly(result);
  }

  function prepareProfile(beast) {
    const savedProfile = readProfile();
    const miniImage = document.querySelector('[data-mini-image]');
    miniImage.src = beast.image || `images/beasts/${beast.id}.jpg`;
    miniImage.alt = `Profielbeeld van ${beast.name}`;
    document.querySelector('[data-mini-animal]').textContent = beast.name;
    const interestRoot = document.querySelector('[data-interest-options]');
    interestRoot.replaceChildren(...data.interests.map((interest, index) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'interest-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'interests';
      input.value = interest;
      input.id = `interest-${index}`;
      input.checked = savedProfile?.interests?.includes(interest) || false;
      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.textContent = interest;
      input.addEventListener('change', () => {
        const checked = [...document.querySelectorAll('input[name="interests"]:checked')];
        if (checked.length > 3) {
          input.checked = false;
          document.querySelector('[data-interest-error]').textContent = 'Kies maximaal drie interessegebieden.';
        } else document.querySelector('[data-interest-error]').textContent = '';
      });
      wrapper.append(input, label);
      return wrapper;
    }));
    if (savedProfile) {
      profileName.value = savedProfile.name || '';
      profileIntro.value = savedProfile.intro || '';
      document.querySelector('[data-mini-name]').textContent = savedProfile.name || 'Jouw naam';
      document.querySelector('[data-profile-count]').textContent = `${profileIntro.value.length}/180`;
    }
  }

  function profileBeast() { return ranked[0]?.beast; }
  const profileForm = document.querySelector('[data-profile-form]');
  const profileName = profileForm.elements.name;
  const profileIntro = profileForm.elements.intro;
  profileName.addEventListener('input', () => { document.querySelector('[data-mini-name]').textContent = profileName.value.trim() || 'Jouw naam'; });
  profileIntro.addEventListener('input', () => { document.querySelector('[data-profile-count]').textContent = `${profileIntro.value.length}/180`; });

  function renderProfile() {
    const beast = profileBeast();
    const selected = [...profileForm.querySelectorAll('input[name="interests"]:checked')].map(input => input.value);
    const saved = saveProfile(beast, selected);
    const profileImage = document.querySelector('[data-profile-image]');
    profileImage.src = beast.image || `images/beasts/${beast.id}.jpg`;
    profileImage.alt = `Profielbeeld van ${beast.name}`;
    document.querySelector('[data-profile-animal]').textContent = beast.name;
    document.querySelector('[data-profile-name]').textContent = profileName.value.trim();
    document.querySelector('[data-profile-archetype]').textContent = beast.archetype;
    document.querySelector('[data-profile-bio]').textContent = profileIntro.value.trim() || 'Nog geen introductie toegevoegd.';
    document.querySelector('[data-profile-tags]').replaceChildren(...selected.map(interest => { const tag = document.createElement('span'); tag.textContent = interest; return tag; }));
    document.querySelector('[data-profile-strength]').textContent = beast.strength;
    document.querySelector('[data-profile-pitfall]').textContent = beast.pitfall;
    document.querySelector('[data-profile-status]').textContent = saved
      ? 'Je profiel is lokaal bewaard en staat klaar op je eigen profielpagina.'
      : 'Je profiel kan in deze browser niet blijvend worden bewaard.';
    showOnly(profilePreview);
  }

  profileForm.addEventListener('submit', event => {
    event.preventDefault();
    let valid = true;
    const nameError = document.getElementById('profile-name-error');
    if (profileName.value.trim().length < 2) { nameError.textContent = 'Gebruik minstens twee tekens.'; profileName.setAttribute('aria-invalid', 'true'); valid = false; }
    else { nameError.textContent = ''; profileName.setAttribute('aria-invalid', 'false'); }
    const understandError = document.querySelector('[data-understand-error]');
    if (!profileForm.elements.understand.checked) { understandError.textContent = 'Deze bevestiging is nodig.'; valid = false; }
    else understandError.textContent = '';
    if (!valid) { document.querySelector('[data-profile-status]').textContent = 'Controleer de gemarkeerde velden.'; profileForm.querySelector('[aria-invalid="true"], input[name="understand"]:not(:checked)')?.focus(); return; }
    document.querySelector('[data-profile-status]').textContent = '';
    renderProfile();
  });

  startButton.addEventListener('click', () => {
    if (completed) renderResult();
    else { showOnly(stage); renderQuestion(); }
  });
  clearSavedButton.addEventListener('click', () => {
    answers.fill(null);
    current = 0;
    completed = false;
    clearProgress();
    startButton.firstChild.textContent = 'Begin de tocht ';
    clearSavedButton.hidden = true;
  });
  document.querySelector('[data-exit-quiz]').addEventListener('click', () => showOnly(intro));
  document.querySelector('[data-previous-question]').addEventListener('click', () => { if (current > 0) { current -= 1; completed = false; saveProgress(); renderQuestion(); } });
  document.querySelector('[data-next-question]').addEventListener('click', () => {
    if (answers[current] === null) return;
    if (current < data.questions.length - 1) { current += 1; saveProgress(); renderQuestion(); }
    else renderResult();
  });
  document.querySelector('[data-restart-quiz]').addEventListener('click', () => { answers.fill(null); current = 0; completed = false; clearProgress(); showOnly(stage); renderQuestion(); });
  document.querySelector('[data-save-beast-result]').addEventListener('click', saveBeastToTrack);
  document.querySelector('[data-open-profile]').addEventListener('click', () => showOnly(profileMaker));
  document.querySelector('[data-close-profile]').addEventListener('click', () => showOnly(result));
  document.querySelector('[data-edit-profile]').addEventListener('click', () => showOnly(profileMaker));
  document.querySelector('[data-back-result]').addEventListener('click', () => showOnly(result));
  document.querySelector('[data-save-profile]').addEventListener('click', () => {
    const beast = profileBeast();
    const selected = [...profileForm.querySelectorAll('input[name="interests"]:checked')].map(input => input.value);
    const lines = ['DE ONWIJZE WIJSHEDEN — LOKAAL PROEFPROFIEL','',`NAAM: ${profileName.value.trim()}`,`BEEST: ${beast.name}`,`ARCHETYPE: ${beast.archetype}`,'',`INTRODUCTIE: ${profileIntro.value.trim() || 'Niet opgegeven.'}`,`INTERESSES: ${selected.join(', ') || 'Niet opgegeven.'}`,'',`KRACHT: ${beast.strength}`,`VALKUIL: ${beast.pitfall}`,'','Dit bestand werd lokaal gemaakt. Er is geen account aangemaakt en niets werd automatisch verzonden.'];
    const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mijn-beestenprofiel.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  const previewId = new URLSearchParams(location.search).get('voorbeeld');
  const editProfile = new URLSearchParams(location.search).get('profiel') === 'wijzigen';
  const previewBeast = previewId && data.beasts.find(beast => beast.id === previewId);
  if (previewBeast) {
    const previewTraits = Object.fromEntries(traitKeys.map((key, index) => [key, previewBeast.vector[index]]));
    renderResult(previewTraits);
  } else {
    restoreProgress();
    if (editProfile) {
      if (completed) {
        renderResult();
        showOnly(profileMaker);
      } else {
        const savedProfile = readProfile();
        const savedTraits = savedProfile?.traitScores;
        const savedBeast = data.beasts.find(beast => beast.id === savedProfile?.beastId);
        if (savedBeast && savedTraits && traitKeys.every(key => Number.isFinite(savedTraits[key]))) {
          currentTraits = savedTraits;
          ranked = rankBeasts(savedTraits);
          ranked.sort((a, b) => Number(b.beast.id === savedBeast.id) - Number(a.beast.id === savedBeast.id));
          prepareProfile(savedBeast);
          showOnly(profileMaker);
        }
      }
    }
  }
})();
