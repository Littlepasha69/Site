(function () {
  const quizzes = window.MENSLAB_QUIZZES;
  if (!Array.isArray(quizzes) || !quizzes.length) return;
  const home = document.querySelector('[data-quiz-home]');
  const shelf = document.querySelector('[data-quiz-shelf]');
  const stage = document.querySelector('[data-mini-quiz]');
  const resultSection = document.querySelector('[data-mini-result]');
  const journey = document.querySelector('[data-mini-journey]');
  const journeyNote = document.querySelector('[data-mini-journey-note]');
  const answerHint = document.querySelector('[data-mini-answer-hint]');
  const questionCard = document.querySelector('.mini-question');
  const visualThemes = {
    'beweging-vandaag': {
      symbol: '↗',
      note: 'Zes kleine schuifjes. Geen levensverbouwing met een helm op.',
      confirmations: ['Dat mag vandaag genoeg zijn.', 'Kleine beweging gespot.', 'Genoteerd zonder er een vijfjarenplan van te maken.']
    },
    'luisteren-of-repareren': {
      symbol: '◌',
      note: 'Even luisteren naar hoe jij luistert. Meta, maar draaglijk.',
      confirmations: ['We laten dit antwoord even uitspreken.', 'Aha. De gereedschapskist blijft nog heel even dicht.', 'Deze reactie krijgt een stoel in het gesprek.']
    },
    'waar-komt-je-ja-vandaan': {
      symbol: 'JA?',
      note: 'Zes keer onder de motorkap van één klein woordje.',
      confirmations: ['Dat ja heeft alvast een voetnoot.', 'Interessant. Je antwoord kwam niet alleen.', 'Genoteerd — zonder je meteen ergens voor in te schrijven.']
    },
    'wie-zit-aan-het-stuur': {
      symbol: 'JIJ?',
      note: 'Geen typecasting. We kijken alleen wie vandaag de meeste tekst heeft.',
      confirmations: ['Die hoofdrolspeler krijgt een streepje in het script.', 'Aha. Iemand vooraan in de bus zwaait.', 'Genoteerd. Je andere kanten zijn niet ontslagen.']
    }
  };
  const trackStorageKey = 'menslab-progress-v3';
  const previousTrackStorageKey = 'menslab-progress-v2';
  let activeQuiz;
  let current = 0;
  let answers = [];
  let activeResult;

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showShelf() {
    home.hidden = false;
    shelf.hidden = false;
    stage.hidden = true;
    resultSection.hidden = true;
    scrollTop();
  }

  function showOnly(target) {
    home.hidden = true;
    shelf.hidden = true;
    stage.hidden = target !== stage;
    resultSection.hidden = target !== resultSection;
    target.focus?.();
    scrollTop();
  }

  function startQuiz(id) {
    activeQuiz = quizzes.find(quiz => quiz.id === id);
    if (!activeQuiz) return;
    current = 0;
    answers = new Array(activeQuiz.questions.length).fill(null);
    const visual = visualThemes[activeQuiz.id];
    stage.dataset.quizTheme = activeQuiz.id;
    resultSection.dataset.quizTheme = activeQuiz.id;
    stage.style.setProperty('--quiz-symbol', `"${visual.symbol}"`);
    resultSection.style.setProperty('--quiz-symbol', `"${visual.symbol}"`);
    journeyNote.textContent = visual.note;
    journey.style.setProperty('--step-count', activeQuiz.questions.length);
    journey.replaceChildren(...activeQuiz.questions.map((_, index) => {
      const step = document.createElement('span');
      step.className = 'mini-journey__step';
      step.textContent = index + 1;
      step.setAttribute('aria-label', `Vraag ${index + 1}`);
      return step;
    }));
    document.querySelector('[data-save-mini-result]').disabled = false;
    document.querySelector('[data-save-mini-result]').textContent = 'Bewaar deze spiegel in Mijn spoor';
    document.querySelector('[data-save-mini-status]').textContent = '';
    showOnly(stage);
    renderQuestion();
  }

  function renderQuestion() {
    const question = activeQuiz.questions[current];
    const percent = Math.round((current + 1) / activeQuiz.questions.length * 100);
    document.querySelector('[data-mini-quiz-name]').textContent = activeQuiz.title;
    document.querySelector('[data-mini-eyebrow]').textContent = activeQuiz.eyebrow;
    document.querySelector('[data-mini-count]').textContent = `Vraag ${current + 1} van ${activeQuiz.questions.length}`;
    document.querySelector('[data-mini-percent]').textContent = `${percent}%`;
    document.querySelector('[data-mini-progress]').style.width = `${percent}%`;
    document.querySelector('[data-mini-question]').textContent = question.text;
    stage.style.setProperty('--question-number', `"${String(current + 1).padStart(2, '0')}"`);
    journey.querySelectorAll('.mini-journey__step').forEach((step, index) => {
      step.classList.toggle('is-complete', index < current);
      step.classList.toggle('is-current', index === current);
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    answerHint.textContent = answers[current] === null ? 'Kies wat vandaag het dichtst in de buurt komt.' : 'Je eerdere antwoord staat nog klaar. Je mag het veranderen.';
    questionCard.classList.remove('mini-question--answered');
    const options = document.querySelector('[data-mini-options]');
    options.replaceChildren(options.querySelector('legend'), ...question.options.map((option, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `mini-question-${current}`;
      input.id = `mini-answer-${current}-${index}`;
      input.value = option.result;
      input.checked = answers[current] === option.result;
      const label = document.createElement('label');
      label.htmlFor = input.id;
      const marker = document.createElement('span');
      marker.textContent = String.fromCharCode(65 + index);
      label.append(marker, document.createTextNode(option.text));
      input.addEventListener('change', () => {
        answers[current] = option.result;
        document.querySelector('[data-mini-next]').disabled = false;
        questionCard.classList.remove('mini-question--answered');
        void questionCard.offsetWidth;
        questionCard.classList.add('mini-question--answered');
        const messages = visualThemes[activeQuiz.id].confirmations;
        answerHint.textContent = messages[(current + index) % messages.length];
      });
      wrapper.append(input, label);
      return wrapper;
    }));
    document.querySelector('[data-mini-previous]').disabled = current === 0;
    const next = document.querySelector('[data-mini-next]');
    next.disabled = answers[current] === null;
    next.textContent = current === activeQuiz.questions.length - 1 ? 'Bekijk mijn spiegel →' : 'Volgende →';
    questionCard.focus({ preventScroll: true });
    stage.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function calculateResult() {
    const scores = Object.fromEntries(activeQuiz.resultOrder.map(key => [key, 0]));
    answers.forEach(key => { scores[key] += 1; });
    const resultId = activeQuiz.resultOrder.reduce((best, key) => scores[key] > scores[best] ? key : best, activeQuiz.resultOrder[0]);
    return { id: resultId, ...activeQuiz.results[resultId] };
  }

  function renderResult() {
    activeResult = calculateResult();
    document.querySelector('[data-result-kicker]').textContent = activeResult.kicker;
    document.querySelector('[data-result-title]').textContent = activeResult.title;
    document.querySelector('[data-result-summary]').textContent = activeResult.summary;
    document.querySelector('[data-result-strength]').textContent = activeResult.strength;
    document.querySelector('[data-result-friction]').textContent = activeResult.friction;
    document.querySelector('[data-result-counter]').textContent = activeResult.counter;
    document.querySelector('[data-result-experiment]').textContent = activeResult.experiment;
    showOnly(resultSection);
  }

  function saveResultToTrack() {
    try {
      const raw = localStorage.getItem(trackStorageKey) || localStorage.getItem(previousTrackStorageKey);
      const progress = raw ? JSON.parse(raw) : {
        checks: new Array(7).fill(false),
        note: '',
        startedAt: new Date().toISOString(),
        completedWeeks: [],
        carryForward: ''
      };
      if (!progress || typeof progress !== 'object') throw new Error('Ongeldig spoor');
      if (!Array.isArray(progress.quizSnapshots)) progress.quizSnapshots = [];
      progress.quizSnapshots.unshift({
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        resultId: activeResult.id,
        resultTitle: activeResult.title,
        summary: activeResult.summary,
        experiment: activeResult.experiment,
        savedAt: new Date().toISOString()
      });
      progress.quizSnapshots = progress.quizSnapshots.slice(0, 24);
      localStorage.setItem(trackStorageKey, JSON.stringify(progress));
      localStorage.removeItem(previousTrackStorageKey);
      const button = document.querySelector('[data-save-mini-result]');
      button.disabled = true;
      button.textContent = 'Bewaard in Mijn spoor';
      document.querySelector('[data-save-mini-status]').textContent = 'Deze momentopname staat alleen in deze browser in Mijn spoor.';
    } catch (_) {
      document.querySelector('[data-save-mini-status]').textContent = 'Bewaren lukt niet in deze browser. De uitslag blijft wel zichtbaar.';
    }
  }

  document.querySelectorAll('[data-start-mini-quiz]').forEach(button => button.addEventListener('click', () => startQuiz(button.dataset.startMiniQuiz)));
  document.querySelector('[data-back-to-shelf]').addEventListener('click', showShelf);
  document.querySelector('[data-mini-previous]').addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      renderQuestion();
    }
  });
  document.querySelector('[data-mini-next]').addEventListener('click', () => {
    if (answers[current] === null) return;
    if (current < activeQuiz.questions.length - 1) {
      current += 1;
      renderQuestion();
    } else renderResult();
  });
  document.querySelector('[data-restart-mini]').addEventListener('click', () => startQuiz(activeQuiz.id));
  document.querySelector('[data-choose-another]').addEventListener('click', showShelf);
  document.querySelector('[data-save-mini-result]').addEventListener('click', saveResultToTrack);
  const requestedQuiz = new URLSearchParams(window.location.search).get('quiz');
  if (requestedQuiz && quizzes.some(quiz => quiz.id === requestedQuiz)) startQuiz(requestedQuiz);
})();
