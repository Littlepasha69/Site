(function () {
  const data = window.BEAST_QUIZ;
  if (!data) return;
  const traitKeys = Object.keys(data.traits);
  const intro = document.querySelector('[data-quiz-intro]');
  const stage = document.querySelector('[data-quiz-stage]');
  const result = document.querySelector('[data-quiz-result]');
  const profileMaker = document.querySelector('[data-profile-maker]');
  const profilePreview = document.querySelector('[data-profile-preview]');
  const answers = new Array(data.questions.length).fill(null);
  let current = 0;
  let ranked = [];

  function showOnly(target) {
    [intro, stage, result, profileMaker, profilePreview].forEach(section => { section.hidden = section !== target; });
    if (target !== intro) target.focus?.();
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    const question = data.questions[current];
    const trait = data.traits[question.trait];
    const chapterIndex = Math.floor(current / 7);
    document.querySelector('[data-chapter-label]').textContent = `Hoofdstuk ${chapterIndex + 1} van 5 · ${data.chapters[chapterIndex]}`;
    document.querySelector('[data-progress-count]').textContent = `Vraag ${current + 1} van ${data.questions.length}`;
    const percent = Math.round((current + 1) / data.questions.length * 100);
    document.querySelector('[data-progress-percent]').textContent = `${percent}%`;
    document.querySelector('[data-progress-bar]').style.width = `${percent}%`;
    document.querySelector('[data-question-symbol]').textContent = trait.symbol;
    document.querySelector('[data-question-dimension]').textContent = trait.label;
    document.querySelector('[data-question-text]').textContent = question.text;
    const scale = document.querySelector('[data-answer-scale]');
    scale.replaceChildren(...data.scale.map((label, index) => {
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
      const number = document.createElement('span');
      number.textContent = String(index + 1);
      answerLabel.append(number, document.createTextNode(label));
      input.addEventListener('change', () => {
        answers[current] = index + 1;
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
    document.querySelector('.question-card').focus?.();
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
    const maximum = Math.sqrt(traitKeys.length * 10000);
    return data.beasts.map(beast => {
      const distance = Math.sqrt(traitKeys.reduce((sum, key, index) => sum + Math.pow(traits[key] - beast.vector[index], 2), 0));
      return { beast, affinity: Math.max(0, Math.round(100 - distance / maximum * 100)) };
    }).sort((a, b) => b.affinity - a.affinity || a.beast.name.localeCompare(b.beast.name, 'nl'));
  }

  function renderResult() {
    const traits = calculateTraits();
    ranked = rankBeasts(traits);
    const top = ranked[0];
    const beast = top.beast;
    document.querySelector('[data-result-sigil]').textContent = beast.mark;
    document.querySelector('[data-result-world]').textContent = beast.world;
    document.querySelector('[data-result-archetype]').textContent = beast.archetype;
    document.querySelector('[data-result-name]').textContent = beast.name;
    document.querySelector('[data-result-essence]').textContent = beast.essence;
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
    showOnly(result);
  }

  function prepareProfile(beast) {
    document.querySelector('[data-mini-sigil]').textContent = beast.mark;
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
    document.querySelector('[data-profile-sigil]').textContent = beast.mark;
    document.querySelector('[data-profile-animal]').textContent = beast.name;
    document.querySelector('[data-profile-name]').textContent = profileName.value.trim();
    document.querySelector('[data-profile-archetype]').textContent = beast.archetype;
    document.querySelector('[data-profile-bio]').textContent = profileIntro.value.trim() || 'Nog geen introductie toegevoegd.';
    document.querySelector('[data-profile-tags]').replaceChildren(...selected.map(interest => { const tag = document.createElement('span'); tag.textContent = interest; return tag; }));
    document.querySelector('[data-profile-strength]').textContent = beast.strength;
    document.querySelector('[data-profile-pitfall]').textContent = beast.pitfall;
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

  document.querySelector('[data-start-quiz]').addEventListener('click', () => { current = 0; showOnly(stage); renderQuestion(); });
  document.querySelector('[data-exit-quiz]').addEventListener('click', () => showOnly(intro));
  document.querySelector('[data-previous-question]').addEventListener('click', () => { if (current > 0) { current -= 1; renderQuestion(); } });
  document.querySelector('[data-next-question]').addEventListener('click', () => {
    if (answers[current] === null) return;
    if (current < data.questions.length - 1) { current += 1; renderQuestion(); }
    else renderResult();
  });
  document.querySelector('[data-restart-quiz]').addEventListener('click', () => { answers.fill(null); current = 0; showOnly(stage); renderQuestion(); });
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
})();
