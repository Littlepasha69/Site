(function () {
  const quizzes = window.MENSLAB_QUIZZES;
  if (!Array.isArray(quizzes) || !quizzes.length) return;

  const home = document.querySelector('[data-quiz-home]');
  const shelf = document.querySelector('[data-quiz-shelf]');
  const stage = document.querySelector('[data-mini-quiz]');
  const resultSection = document.querySelector('[data-mini-result]');
  const resultContent = document.querySelector('[data-result-content]');
  const tieSection = document.querySelector('[data-result-tie]');
  const journey = document.querySelector('[data-mini-journey]');
  const journeyNote = document.querySelector('[data-mini-journey-note]');
  const answerHint = document.querySelector('[data-mini-answer-hint]');
  const questionCard = document.querySelector('.mini-question');
  const missingButton = document.querySelector('[data-question-misses]');
  const saveButton = document.querySelector('[data-save-mini-result]');
  const reflectionField = document.querySelector('[data-mini-reflection]');
  const fitButtons = [...document.querySelectorAll('[data-mini-fit]')];
  const missingAnswer = '__mist__';
  const fitLabels = {
    raakt: 'Dit raakt iets',
    deels: 'Dit klopt gedeeltelijk',
    mist: 'Dit mist iets belangrijks'
  };
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
  const quizProgressKey = 'quizkast-progress-v1';
  let activeQuiz;
  let current = 0;
  let answers = [];
  let activeResult;
  let resultMeta;
  let fit = '';
  let reflection = '';
  let selectedResultId = '';
  let resultSaved = false;

  function readQuizProgress() {
    try { return JSON.parse(localStorage.getItem(quizProgressKey) || 'null'); }
    catch (_) { return null; }
  }

  function saveQuizProgress(screen = 'questions') {
    if (!activeQuiz) return;
    try {
      localStorage.setItem(quizProgressKey, JSON.stringify({
        quizId: activeQuiz.id,
        current,
        answers,
        screen,
        fit,
        reflection: reflection.slice(0, 280),
        selectedResultId,
        savedAt: new Date().toISOString()
      }));
    } catch (_) {}
  }

  function clearQuizProgress() {
    try { localStorage.removeItem(quizProgressKey); } catch (_) {}
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
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

  function startQuiz(id, forceFresh = false) {
    activeQuiz = quizzes.find(quiz => quiz.id === id);
    if (!activeQuiz) return;
    const stored = forceFresh ? null : readQuizProgress();
    const canResume = stored?.quizId === id && Array.isArray(stored.answers) && stored.answers.length === activeQuiz.questions.length;
    current = canResume && Number.isInteger(stored.current) ? Math.max(0, Math.min(activeQuiz.questions.length - 1, stored.current)) : 0;
    answers = canResume ? stored.answers.map(value => value === null || typeof value === 'string' ? value : null) : new Array(activeQuiz.questions.length).fill(null);
    fit = canResume && ['raakt', 'deels', 'mist'].includes(stored.fit) ? stored.fit : '';
    reflection = canResume && typeof stored.reflection === 'string' ? stored.reflection.slice(0, 280) : '';
    selectedResultId = canResume && typeof stored.selectedResultId === 'string' ? stored.selectedResultId : '';
    resultSaved = false;
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
    saveButton.disabled = true;
    saveButton.textContent = 'Reageer eerst op de spiegel';
    document.querySelector('[data-save-mini-status]').textContent = '';
    fitButtons.forEach(button => { button.disabled = false; });
    reflectionField.disabled = false;
    if (canResume && stored.screen === 'result' && answers.every(Boolean)) renderResult(selectedResultId);
    else {
      showOnly(stage);
      renderQuestion();
      saveQuizProgress();
    }
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
    if (answers[current] === missingAnswer) answerHint.textContent = 'Helder. Deze vraag telt niet mee in de uitslag.';
    else answerHint.textContent = answers[current] === null ? 'Kies wat vandaag het dichtst in de buurt komt.' : 'Je eerdere antwoord staat nog klaar. Je mag het veranderen.';
    missingButton.setAttribute('aria-pressed', String(answers[current] === missingAnswer));
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
        missingButton.setAttribute('aria-pressed', 'false');
        saveQuizProgress();
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
    answers.forEach(key => { if (Object.hasOwn(scores, key)) scores[key] += 1; });
    const answered = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const missed = answers.filter(value => value === missingAnswer).length;
    if (answered < 2) return { scores, answered, missed, leaders: [], maxScore: answered, noMatch: true };
    const maxScore = Math.max(...Object.values(scores));
    const leaders = activeQuiz.resultOrder.filter(key => scores[key] === maxScore);
    return { scores, answered, missed, leaders, maxScore, noMatch: false };
  }

  function openResult() {
    return {
      id: 'open',
      kicker: 'Een geldige uitslag',
      title: 'De spiegel blijft open',
      summary: 'Geen antwoordcategorie kreeg genoeg grond onder de voeten. Dat is geen fout: deze quiz stelde vandaag blijkbaar niet de juiste vragen voor jouw situatie.',
      strength: 'Je hebt geen passend verhaal geforceerd alleen omdat de quiz erom vroeg.',
      friction: 'Een open spiegel vertelt nog niet wat er wél speelt. Daarvoor zijn andere woorden, context of vragen nodig.',
      counter: 'Welke vraag had deze quiz wél moeten stellen om jouw situatie te begrijpen?',
      experiment: 'Schrijf één betere vraag op. Je hoeft haar vandaag nog niet te beantwoorden.',
      readHref: 'atlas-kompas.html',
      readLabel: 'Lees hoe de Atlas ruimte laat voor onzekerheid →',
      readTitle: 'Het Atlas-kompas',
      readReason: 'Deze tekst legt uit waarom een mens nooit volledig in één model, score of verhaal past.'
    };
  }

  function buildTieChoices(meta, chosenId = '') {
    const container = document.querySelector('[data-result-tie-options]');
    container.replaceChildren(...meta.leaders.map(id => {
      const result = activeQuiz.results[id];
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.tieResult = id;
      button.setAttribute('aria-pressed', String(id === chosenId));
      const title = document.createElement('strong');
      title.textContent = result.title;
      const summary = document.createElement('span');
      summary.textContent = result.summary;
      button.append(title, summary);
      button.addEventListener('click', () => {
        const changed = selectedResultId && selectedResultId !== id;
        selectedResultId = id;
        if (changed) {
          fit = '';
          reflection = '';
          resultSaved = false;
        }
        renderResult(id);
      });
      return button;
    }));
  }

  function renderTie(meta, chosenId = '') {
    tieSection.hidden = false;
    tieSection.classList.toggle('mini-tie--resolved', Boolean(chosenId));
    tieSection.querySelector('h1').textContent = chosenId ? 'Je antwoorden lieten meer dan één richting open.' : 'Meer dan één spiegel past even sterk.';
    const names = meta.leaders.map(id => activeQuiz.results[id].title).join(' en ');
    document.querySelector('[data-result-tie-copy]').textContent = chosenId
      ? `${names} kregen elk ${meta.maxScore} antwoord${meta.maxScore === 1 ? '' : 'en'}. Je bekijkt nu ${activeQuiz.results[chosenId].title}, maar je kunt de andere spiegel ook openen.`
      : `${names} kregen elk ${meta.maxScore} antwoord${meta.maxScore === 1 ? '' : 'en'}. De quiz kiest niet stiekem voor jou.`;
    buildTieChoices(meta, chosenId);
  }

  function describeBasis(meta, result) {
    if (meta.noMatch) return `Slechts ${meta.answered} van de ${answers.length} vragen ${meta.answered === 1 ? 'leverde' : 'leverden'} een tellend antwoord op; ${meta.missed} vraag${meta.missed === 1 ? '' : 'en'} markeerde je als niet passend. Daarom maken we geen profiel op zo weinig grond.`;
    const missedCopy = meta.missed ? ` ${meta.missed} vraag${meta.missed === 1 ? '' : 'en'} telde${meta.missed === 1 ? '' : 'n'} bewust niet mee.` : '';
    if (meta.leaders.length > 1) return `${meta.leaders.length} spiegels kregen elk ${meta.maxScore} van je ${meta.answered} tellende antwoorden. Jij koos ${result.title} om verder te onderzoeken.${missedCopy}`;
    const otherScores = activeQuiz.resultOrder.filter(id => id !== result.id && meta.scores[id] > 0).length;
    const spreadCopy = otherScores ? ` Je overige antwoorden wezen ook naar ${otherScores} andere richting${otherScores === 1 ? '' : 'en'}.` : '';
    return `${meta.maxScore} van je ${meta.answered} tellende antwoorden wezen het sterkst naar deze spiegel.${spreadCopy}${missedCopy}`;
  }

  function renderReading(result) {
    const reading = document.querySelector('[data-mini-reading]');
    reading.hidden = !result.readHref;
    if (result.readHref) {
      document.querySelector('[data-mini-reading-title]').textContent = result.readTitle || 'Lees verder';
      document.querySelector('[data-mini-reading-reason]').textContent = result.readReason || 'Gebruik deze tekst om de uitslag verder te onderzoeken.';
      const anchor = document.querySelector('[data-mini-reading-anchor]');
      anchor.href = result.readHref;
      anchor.textContent = result.readLabel || 'Open de bestaande tekst →';
    }
    const theoryLink = document.querySelector('[data-mini-theory-link]');
    theoryLink.hidden = Boolean(result.readHref) || !activeQuiz.theoryHref;
    if (!result.readHref && activeQuiz.theoryHref) {
      const anchor = document.querySelector('[data-mini-theory-anchor]');
      anchor.href = activeQuiz.theoryHref;
      anchor.textContent = activeQuiz.theoryLabel;
    }
  }

  function syncReactionControls() {
    fitButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.miniFit === fit));
      button.disabled = resultSaved;
    });
    reflectionField.value = reflection;
    reflectionField.disabled = resultSaved;
    const reactionStatus = document.querySelector('[data-mini-reaction-status]');
    if (resultSaved) reactionStatus.textContent = `${fitLabels[fit]}. Jouw antwoord en eventuele aanvulling zijn mee bewaard.`;
    else if (fit) reactionStatus.textContent = `${fitLabels[fit]}. Je kunt dit nu samen met je eigen woorden bewaren.`;
    else reactionStatus.textContent = 'Kies eerst hoe goed de spiegel past. Je eigen aanvulling mag leeg blijven.';
    saveButton.disabled = !fit || resultSaved;
    saveButton.textContent = resultSaved ? 'Bewaard in Mijn spoor' : fit ? 'Bewaar mijn uitslag én antwoord' : 'Reageer eerst op de spiegel';
  }

  function renderResult(requestedId = '') {
    resultMeta = calculateResult();
    showOnly(resultSection);
    if (resultMeta.leaders.length > 1 && !resultMeta.leaders.includes(requestedId)) {
      activeResult = null;
      selectedResultId = '';
      resultSection.setAttribute('aria-labelledby', 'mini-tie-title');
      renderTie(resultMeta);
      resultContent.hidden = true;
      saveQuizProgress('result');
      return;
    }
    tieSection.hidden = resultMeta.leaders.length < 2;
    resultSection.setAttribute('aria-labelledby', 'mini-result-title');
    if (resultMeta.leaders.length > 1) renderTie(resultMeta, requestedId);
    resultContent.hidden = false;
    const resultId = resultMeta.noMatch ? 'open' : resultMeta.leaders.length > 1 ? requestedId : resultMeta.leaders[0];
    selectedResultId = resultId;
    activeResult = resultMeta.noMatch ? openResult() : { id: resultId, ...activeQuiz.results[resultId] };
    document.querySelector('[data-result-kicker]').textContent = activeResult.kicker;
    document.querySelector('[data-result-title]').textContent = activeResult.title;
    document.querySelector('[data-result-summary]').textContent = activeResult.summary;
    document.querySelector('[data-result-basis]').textContent = describeBasis(resultMeta, activeResult);
    document.querySelector('[data-result-strength]').textContent = activeResult.strength;
    document.querySelector('[data-result-friction]').textContent = activeResult.friction;
    document.querySelector('[data-result-counter]').textContent = activeResult.counter;
    document.querySelector('[data-result-experiment]').textContent = activeResult.experiment;
    renderReading(activeResult);
    syncReactionControls();
    saveQuizProgress('result');
  }

  function saveResultToTrack() {
    if (!activeResult || !fit) {
      document.querySelector('[data-save-mini-status]').textContent = 'Kies eerst of deze spiegel raakt, gedeeltelijk klopt of iets belangrijks mist.';
      return;
    }
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
      const basis = describeBasis(resultMeta, activeResult);
      progress.quizSnapshots.unshift({
        quizId: activeQuiz.id,
        quizTitle: activeQuiz.title,
        resultId: activeResult.id,
        resultTitle: activeResult.title,
        summary: activeResult.summary,
        experiment: activeResult.experiment,
        observation: basis,
        kind: 'quick',
        fit,
        reflection: reflection.trim().slice(0, 280),
        readHref: activeResult.readHref || '',
        readLabel: activeResult.readTitle || activeResult.readLabel || '',
        method: {
          answered: resultMeta.answered,
          dual: resultMeta.leaders.length > 1 ? resultMeta.leaders.length : 0,
          missed: resultMeta.missed,
          skipped: 0
        },
        savedAt: new Date().toISOString()
      });
      progress.quizSnapshots = progress.quizSnapshots.slice(0, 250);
      localStorage.setItem(trackStorageKey, JSON.stringify(progress));
      localStorage.removeItem(previousTrackStorageKey);
      resultSaved = true;
      syncReactionControls();
      document.querySelector('[data-save-mini-status]').textContent = 'De quizspiegel én jouw tegenspraak staan alleen in deze browser in Mijn spoor.';
      clearQuizProgress();
    } catch (_) {
      document.querySelector('[data-save-mini-status]').textContent = 'Bewaren lukt niet in deze browser. De uitslag en jouw woorden blijven wel zichtbaar.';
    }
  }

  document.querySelectorAll('[data-start-mini-quiz]').forEach(button => button.addEventListener('click', () => startQuiz(button.dataset.startMiniQuiz)));
  document.querySelector('[data-back-to-shelf]').addEventListener('click', showShelf);
  missingButton.addEventListener('click', () => {
    const wasMissing = answers[current] === missingAnswer;
    answers[current] = wasMissing ? null : missingAnswer;
    document.querySelectorAll('[data-mini-options] input').forEach(input => { input.checked = false; });
    missingButton.setAttribute('aria-pressed', String(!wasMissing));
    document.querySelector('[data-mini-next]').disabled = wasMissing;
    answerHint.textContent = wasMissing ? 'Kies wat vandaag het dichtst in de buurt komt.' : 'Helder. Deze vraag telt niet mee in de uitslag.';
    saveQuizProgress();
  });
  document.querySelector('[data-mini-previous]').addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      saveQuizProgress();
      renderQuestion();
    }
  });
  document.querySelector('[data-mini-next]').addEventListener('click', () => {
    if (answers[current] === null) return;
    if (current < activeQuiz.questions.length - 1) {
      current += 1;
      saveQuizProgress();
      renderQuestion();
    } else renderResult();
  });
  fitButtons.forEach(button => button.addEventListener('click', () => {
    fit = button.dataset.miniFit;
    syncReactionControls();
    saveQuizProgress('result');
  }));
  reflectionField.addEventListener('input', event => {
    reflection = event.currentTarget.value.slice(0, 280);
    saveQuizProgress('result');
  });
  document.querySelector('[data-restart-mini]').addEventListener('click', () => { clearQuizProgress(); startQuiz(activeQuiz.id, true); });
  document.querySelector('[data-choose-another]').addEventListener('click', showShelf);
  saveButton.addEventListener('click', saveResultToTrack);
  const requestedQuiz = new URLSearchParams(window.location.search).get('quiz');
  if (requestedQuiz && quizzes.some(quiz => quiz.id === requestedQuiz)) startQuiz(requestedQuiz);
})();
