(function () {
  const quizzes = window.MENSLAB_QUIZZES;
  if (!Array.isArray(quizzes) || !quizzes.length) return;

  const home = document.querySelector('[data-quiz-home]');
  const shelf = document.querySelector('[data-quiz-shelf]');
  const stage = document.querySelector('[data-mini-quiz]');
  const standardGame = document.querySelector('[data-standard-game]');
  const customGame = document.querySelector('[data-custom-game]');
  const supportIntro = document.querySelector('[data-support-intro]');
  const customBoard = document.querySelector('[data-custom-board]');
  const customMissButton = document.querySelector('[data-custom-misses]');
  const customFinishButton = document.querySelector('[data-finish-custom]');
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
      note: 'Geen vragenlijst: jij verdeelt zelf welke concrete richting vandaag aandacht krijgt.',
      confirmations: []
    },
    'luisteren-of-repareren': {
      symbol: '◌',
      note: 'Tien gesprekken. Geen perfecte luisteraar, wel zichtbare keuzes.',
      confirmations: []
    },
    'waar-komt-je-ja-vandaan': {
      symbol: 'JA?',
      note: 'Kies op ieder kruispunt eerst de sterkste stem en eventueel een tweede die meetrekt.',
      confirmations: []
    },
    'wie-zit-aan-het-stuur': {
      symbol: 'JIJ?',
      note: 'Geen vragenlijst: jij maakt de tijdelijke bezetting van deze rit.',
      confirmations: []
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

  const allQuizToggle = document.querySelector('[data-show-all-quizzes]');
  const allQuizLibrary = document.querySelector('[data-all-quiz-library]');
  const allQuizSearch = document.querySelector('[data-all-quiz-search]');
  const allQuizType = document.querySelector('[data-all-quiz-type]');
  const allQuizCategory = document.querySelector('[data-all-quiz-category]');

  function allQuizItems() {
    const quick = quizzes.map(quiz => ({
      href:`speelhal.html?quiz=${encodeURIComponent(quiz.id)}`,
      title:quiz.title,
      type:quiz.mode === 'support' || quiz.mode === 'conversation' ? 'Gesprekssimulatie' : quiz.mode === 'path' ? 'Keuzepad' : quiz.mode === 'allocation' ? 'Interactief verdeelspel' : quiz.mode === 'ranking' ? 'Interactieve stuurtafel' : 'Quizspiegel',
      category:quiz.id === 'luisteren-of-repareren' ? 'Relaties & gesprekken' : String(quiz.eyebrow || 'Andere vragen').split('·')[0].trim(),
      duration:quiz.mode === 'support' ? 'ongeveer 8 minuten' : quiz.mode === 'allocation' || quiz.mode === 'ranking' ? 'ongeveer 2 minuten' : 'ongeveer 3 minuten',
      search:[quiz.title, quiz.eyebrow, ...Object.values(quiz.results || {}).map(result => `${result.title || ''} ${result.summary || ''}`)].join(' ')
    }));
    return quick.concat([
      { href:'speelhal/oefeningen/emotionele-routekaart.html', title:'De emotionele routekaart', type:'Interactieve oefening', category:'Emoties & regulatie', duration:'ongeveer 5–10 minuten', search:'emotie lichaam betekenis impuls ruimte routekaart oefening spel' },
      { href:'dieptequiz-ja.html', title:'Een ja is geen type. Wat beslist er allemaal mee?', type:'Dieptequiz', category:'Keuzes', duration:'ongeveer 8–10 minuten', search:'ja keuze motivatie grenzen verantwoordelijkheid draagkracht context' },
      { href:'veranderroute.html', title:'De Veranderroute', type:'Interactieve route', category:'Veranderen', duration:'ongeveer 10–15 minuten', search:'veranderen route experiment verwachting observatie beweging' },
      { href:'dierenquiz.html', title:'De Grote Beestenquiz', type:'Persoonlijkheidsspel', category:'Persoonlijkheid', duration:'ongeveer 10–12 minuten', search:'beestenquiz persoonlijkheid patronen dieren spiegel archetype mythisch' }
    ]);
  }

  function normalizeQuizText(value) {
    return String(value || '').toLocaleLowerCase('nl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function renderAllQuizzes() {
    if (!allQuizLibrary || !allQuizSearch || !allQuizType || !allQuizCategory) return;
    const items = allQuizItems();
    if (allQuizType.options.length === 1) {
      [...new Set(items.map(item => item.type))].sort((a, b) => a.localeCompare(b, 'nl')).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        allQuizType.append(option);
      });
    }
    if (allQuizCategory.options.length === 1) {
      [...new Set(items.map(item => item.category))].sort((a, b) => a.localeCompare(b, 'nl')).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        allQuizCategory.append(option);
      });
    }
    const query = normalizeQuizText(allQuizSearch.value.trim());
    const filtered = items.filter(item => (!allQuizType.value || item.type === allQuizType.value) && (!allQuizCategory.value || item.category === allQuizCategory.value) && (!query || normalizeQuizText(`${item.title} ${item.type} ${item.category} ${item.search}`).includes(query)));
    document.querySelector('[data-all-quiz-count]').textContent = `${filtered.length} ${filtered.length === 1 ? 'spel' : 'spellen'}`;
    document.querySelector('[data-all-quiz-empty]').hidden = filtered.length > 0;
    document.querySelector('[data-all-quiz-results]').replaceChildren(...filtered.map(item => {
      const link = document.createElement('a');
      link.href = item.href;
      const category = document.createElement('span');
      category.textContent = `${item.type} · ${item.category}`;
      const title = document.createElement('strong');
      title.textContent = item.title;
      const duration = document.createElement('small');
      duration.textContent = `${item.duration} →`;
      link.append(category, title, duration);
      return link;
    }));
  }

  allQuizToggle?.addEventListener('click', () => {
    const willOpen = allQuizLibrary.hidden;
    allQuizLibrary.hidden = !willOpen;
    allQuizToggle.setAttribute('aria-expanded', String(willOpen));
    allQuizToggle.querySelector('span').textContent = willOpen ? 'Selectiescherm open' : 'Alle spelvormen · zoeken & filteren';
    allQuizToggle.querySelector('[data-all-quiz-toggle-label]').textContent = willOpen ? 'Verberg de speelvloer' : 'Vind het spel dat nu past';
    allQuizToggle.querySelector('i').textContent = willOpen ? 'CLOSE' : 'START';
    if (willOpen) {
      renderAllQuizzes();
      allQuizSearch.focus();
    }
  });
  allQuizSearch?.addEventListener('input', renderAllQuizzes);
  allQuizType?.addEventListener('change', renderAllQuizzes);
  allQuizCategory?.addEventListener('change', renderAllQuizzes);

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

  function isCustomMode(quiz = activeQuiz) {
    return quiz?.mode === 'allocation' || quiz?.mode === 'ranking';
  }

  function isConversationMode(quiz = activeQuiz) {
    return quiz?.mode === 'conversation' || quiz?.mode === 'support';
  }

  function expectedAnswerCount(quiz = activeQuiz) {
    if (quiz?.mode === 'allocation') return quiz.tokenBudget;
    if (quiz?.mode === 'ranking') return quiz.gameOptions.length;
    return quiz?.questions.length || 0;
  }

  function isValidResult(value, quiz = activeQuiz) {
    if (quiz?.mode === 'support') return typeof value === 'string' && quiz.questions.some(question => question.options.some(option => option.id === value));
    return typeof value === 'string' && quiz.resultOrder.includes(value);
  }

  function sanitizeStoredAnswers(values, quiz) {
    if (!Array.isArray(values) || values.length !== expectedAnswerCount(quiz)) return null;
    if (quiz.mode === 'path') {
      return values.map(value => {
        if (value === missingAnswer) return missingAnswer;
        if (isValidResult(value, quiz)) return [value];
        if (!Array.isArray(value)) return null;
        const clean = [...new Set(value.filter(item => isValidResult(item, quiz)))].slice(0, 2);
        return clean.length ? clean : null;
      });
    }
    const clean = values.map(value => value === missingAnswer || isValidResult(value, quiz) ? value : null);
    if (quiz.mode === 'support' && clean.every(value => value === null)) return null;
    if (quiz.mode === 'ranking') {
      const used = new Set();
      return clean.map(value => {
        if (value === missingAnswer) return value;
        if (!value || used.has(value)) return null;
        used.add(value);
        return value;
      });
    }
    return clean;
  }

  function isAnswered(value) {
    if (value === missingAnswer) return true;
    if (activeQuiz.mode === 'path') return Array.isArray(value) && value.length > 0;
    return isValidResult(value);
  }

  function playIsComplete() {
    return answers.length === expectedAnswerCount() && answers.every(value => isAnswered(value));
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

  function prepareJourney() {
    journeyNote.textContent = visualThemes[activeQuiz.id].note;
    journey.style.setProperty('--step-count', activeQuiz.questions.length);
    journey.replaceChildren(...activeQuiz.questions.map((_, index) => {
      const step = document.createElement('span');
      step.className = 'mini-journey__step';
      step.textContent = index + 1;
      step.setAttribute('aria-label', `${isConversationMode() ? 'Gesprek' : 'Kruispunt'} ${index + 1}`);
      return step;
    }));
  }

  function startQuiz(id, forceFresh = false) {
    activeQuiz = quizzes.find(quiz => quiz.id === id);
    if (!activeQuiz) return;
    const stored = forceFresh ? null : readQuizProgress();
    const restoredAnswers = stored?.quizId === id ? sanitizeStoredAnswers(stored.answers, activeQuiz) : null;
    const canResume = Boolean(restoredAnswers);
    current = canResume && Number.isInteger(stored.current) && !isCustomMode()
      ? Math.max(0, Math.min(activeQuiz.questions.length - 1, stored.current))
      : 0;
    answers = canResume ? restoredAnswers : new Array(expectedAnswerCount()).fill(null);
    fit = canResume && ['raakt', 'deels', 'mist'].includes(stored.fit) ? stored.fit : '';
    reflection = canResume && typeof stored.reflection === 'string' ? stored.reflection.slice(0, 280) : '';
    selectedResultId = canResume && typeof stored.selectedResultId === 'string' ? stored.selectedResultId : '';
    resultSaved = false;
    const visual = visualThemes[activeQuiz.id];
    const showSupportIntro = activeQuiz.mode === 'support' && !canResume;
    stage.dataset.quizTheme = activeQuiz.id;
    stage.dataset.gameMode = activeQuiz.mode;
    resultSection.dataset.quizTheme = activeQuiz.id;
    resultSection.dataset.gameMode = activeQuiz.mode;
    stage.style.setProperty('--quiz-symbol', `"${visual.symbol}"`);
    resultSection.style.setProperty('--quiz-symbol', `"${visual.symbol}"`);
    document.querySelector('[data-mini-quiz-name]').textContent = activeQuiz.title;
    standardGame.hidden = isCustomMode() || showSupportIntro;
    customGame.hidden = !isCustomMode();
    supportIntro.hidden = !showSupportIntro;
    stage.setAttribute('aria-labelledby', isCustomMode() ? 'mini-custom-title' : showSupportIntro ? 'support-intro-title' : 'mini-question-title');
    if (!isCustomMode() && !showSupportIntro) prepareJourney();
    saveButton.disabled = true;
    saveButton.textContent = 'Reageer eerst op de spiegel';
    document.querySelector('[data-save-mini-status]').textContent = '';
    fitButtons.forEach(button => { button.disabled = false; });
    reflectionField.disabled = false;
    if (canResume && stored.screen === 'result' && playIsComplete()) renderResult(selectedResultId);
    else if (showSupportIntro) {
      document.querySelector('[data-support-intro-title]').textContent = activeQuiz.introTitle;
      document.querySelector('[data-support-intro-copy]').textContent = activeQuiz.introCopy;
      showOnly(stage);
    }
    else {
      showOnly(stage);
      if (isCustomMode()) renderCustomGame();
      else renderQuestion();
      saveQuizProgress();
    }
  }

  function updateJourney() {
    journey.querySelectorAll('.mini-journey__step').forEach((step, index) => {
      step.classList.toggle('is-complete', index < current);
      step.classList.toggle('is-current', index === current);
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  function animateQuestion() {
    questionCard.classList.remove('mini-question--answered');
    void questionCard.offsetWidth;
    questionCard.classList.add('mini-question--answered');
  }

  function burstFromElement(element, symbol = '✦', amount = 7) {
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const accent = getComputedStyle(stage).getPropertyValue('--quiz-accent').trim() || '#d3a33f';
    for (let index = 0; index < amount; index += 1) {
      const particle = document.createElement('i');
      particle.className = 'quiz-particle';
      particle.textContent = symbol;
      particle.style.setProperty('--particle-x', `${x}px`);
      particle.style.setProperty('--particle-y', `${y}px`);
      particle.style.setProperty('--particle-rotate', `${Math.round(index * 360 / amount)}deg`);
      particle.style.setProperty('--particle-distance', `${44 + index % 3 * 14}px`);
      particle.style.setProperty('--particle-size', `${.7 + index % 3 * .18}rem`);
      particle.style.color = accent;
      document.body.append(particle);
      window.setTimeout(() => particle.remove(), 760);
    }
  }

  function flashCustomStatus() {
    const status = document.querySelector('[data-custom-status]');
    status.classList.remove('is-flashing');
    void status.offsetWidth;
    status.classList.add('is-flashing');
  }

  function renderConversationOptions(question, options) {
    return question.options.map((option, index) => {
      const optionValue = activeQuiz.mode === 'support' ? option.id : option.result;
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-option mini-option--conversation';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `mini-question-${current}`;
      input.id = `mini-answer-${current}-${index}`;
      input.value = optionValue;
      input.checked = answers[current] === optionValue;
      const label = document.createElement('label');
      label.htmlFor = input.id;
      const marker = document.createElement('span');
      marker.textContent = '↩';
      label.append(marker, document.createTextNode(option.text));
      input.addEventListener('change', () => {
        answers[current] = optionValue;
        missingButton.setAttribute('aria-pressed', 'false');
        burstFromElement(label, '◌', 5);
        saveQuizProgress();
        document.querySelector('[data-mini-next]').disabled = false;
        animateQuestion();
        const messages = visualThemes[activeQuiz.id].confirmations;
        answerHint.textContent = option.feedback || messages[(current + index) % messages.length];
      });
      wrapper.append(input, label);
      return wrapper;
    });
  }

  function syncPathOptions() {
    const selected = Array.isArray(answers[current]) ? answers[current] : [];
    document.querySelectorAll('[data-path-result]').forEach(button => {
      const rank = selected.indexOf(button.dataset.pathResult);
      button.setAttribute('aria-pressed', String(rank >= 0));
      button.dataset.pathRank = rank >= 0 ? String(rank + 1) : '';
      button.querySelector('span').textContent = rank >= 0 ? String(rank + 1) : '○';
    });
    missingButton.setAttribute('aria-pressed', String(answers[current] === missingAnswer));
    document.querySelector('[data-mini-next]').disabled = selected.length === 0 && answers[current] !== missingAnswer;
    if (answers[current] === missingAnswer) answerHint.textContent = 'Dit kruispunt telt niet mee. Ook dat is een geldige route.';
    else if (!selected.length) answerHint.textContent = 'Kies eerst de sterkste stem. Een tweede stem is optioneel.';
    else if (selected.length === 1) answerHint.textContent = 'Je nummer 1 staat. Kies eventueel een tweede stem, of ga verder.';
    else answerHint.textContent = '1 trekt het sterkst; 2 reist mee. Klik opnieuw om een keuze weg te halen.';
  }

  function renderPathOptions(question) {
    return question.options.map(option => {
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-option mini-option--path';
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.pathResult = option.result;
      button.setAttribute('aria-pressed', 'false');
      const marker = document.createElement('span');
      marker.textContent = '○';
      const copy = document.createElement('strong');
      copy.textContent = option.text;
      button.append(marker, copy);
      button.addEventListener('click', () => {
        const selected = Array.isArray(answers[current]) ? [...answers[current]] : [];
        const existing = selected.indexOf(option.result);
        if (existing >= 0) selected.splice(existing, 1);
        else if (selected.length < 2) selected.push(option.result);
        else selected[1] = option.result;
        answers[current] = selected.length ? selected : null;
        const newRank = selected.indexOf(option.result);
        burstFromElement(button, existing >= 0 ? '·' : String(newRank + 1), 5);
        saveQuizProgress();
        syncPathOptions();
        animateQuestion();
      });
      wrapper.append(button);
      return wrapper;
    });
  }

  function renderQuestion() {
    const question = activeQuiz.questions[current];
    const isConversation = isConversationMode();
    const percent = Math.round((current + 1) / activeQuiz.questions.length * 100);
    document.querySelector('[data-mini-eyebrow]').textContent = question.scene || activeQuiz.eyebrow;
    const contextBox = document.querySelector('[data-mini-context-wrap]');
    const hasContext = activeQuiz.mode === 'support' && Boolean(question.context);
    contextBox.hidden = !hasContext;
    if (hasContext) {
      contextBox.dataset.contextTone = question.contextTone || 'ordinary';
      document.querySelector('[data-mini-context-label]').textContent = question.contextLabel || 'Wat je weet';
      document.querySelector('[data-mini-context]').textContent = question.context;
    } else {
      delete contextBox.dataset.contextTone;
      document.querySelector('[data-mini-context-label]').textContent = '';
      document.querySelector('[data-mini-context]').textContent = '';
    }
    document.querySelector('[data-mini-count]').textContent = `${isConversation ? 'Gesprek' : 'Kruispunt'} ${current + 1} van ${activeQuiz.questions.length}`;
    document.querySelector('[data-mini-percent]').textContent = `${percent}%`;
    document.querySelector('[data-mini-progress]').style.width = `${percent}%`;
    document.querySelector('[data-mini-question]').textContent = question.text;
    stage.style.setProperty('--question-number', `"${String(current + 1).padStart(2, '0')}"`);
    updateJourney();
    questionCard.classList.remove('mini-question--answered');
    const options = document.querySelector('[data-mini-options]');
    const legend = options.querySelector('legend');
    legend.textContent = isConversation ? 'Kies de reactie die het dichtst bij je spontane antwoord komt' : 'Kies eerst de sterkste stem en eventueel een tweede';
    const optionNodes = isConversation ? renderConversationOptions(question, options) : renderPathOptions(question);
    options.replaceChildren(legend, ...optionNodes);
    const counterCopy = document.querySelector('.mini-question__counterchoice span');
    missingButton.textContent = isConversation ? 'Geen van deze reacties klinkt als mij' : 'Dit kruispunt mist mijn situatie';
    counterCopy.textContent = isConversation ? 'Dan telt dit gespreksmoment niet mee.' : 'Dan telt dit kruispunt niet mee.';
    document.querySelector('[data-mini-previous]').disabled = current === 0;
    const next = document.querySelector('[data-mini-next]');
    next.textContent = current === activeQuiz.questions.length - 1 ? 'Bekijk mijn spiegel →' : isConversation ? 'Stuur en ga verder →' : 'Volgend kruispunt →';
    if (isConversation) {
      missingButton.setAttribute('aria-pressed', String(answers[current] === missingAnswer));
      next.disabled = !isAnswered(answers[current]);
      if (answers[current] === missingAnswer) answerHint.textContent = 'Dit gespreksmoment telt niet mee in de uitslag.';
      else answerHint.textContent = answers[current] === null ? 'Wat zou jij waarschijnlijk als eerste terugsturen?' : 'Je eerdere reactie staat nog klaar. Je mag haar veranderen.';
    } else syncPathOptions();
    questionCard.focus({ preventScroll: true });
    stage.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function customIsMissing() {
    return answers.length > 0 && answers.every(value => value === missingAnswer);
  }

  function makeCustomCard(option, extraClass) {
    const card = document.createElement('article');
    card.className = `custom-card ${extraClass}`;
    const symbol = document.createElement('span');
    symbol.className = 'custom-card__symbol';
    symbol.textContent = option.symbol;
    const title = document.createElement('h3');
    title.textContent = option.label;
    const copy = document.createElement('p');
    copy.textContent = option.copy;
    card.append(symbol, title, copy);
    return card;
  }

  function renderAllocationBoard() {
    const missing = customIsMissing();
    const assigned = answers.filter(value => isValidResult(value)).length;
    const remaining = activeQuiz.tokenBudget - assigned;
    document.querySelector('[data-custom-status]').textContent = missing
      ? 'Geen vonkjes verdeeld. Deze spiegel blijft bewust open.'
      : remaining
        ? `Nog ${remaining} vonkje${remaining === 1 ? '' : 's'} te verdelen.`
        : 'Alle vonkjes zijn verdeeld. Ongelijk mag.';
    customBoard.replaceChildren(...activeQuiz.gameOptions.map(option => {
      const card = makeCustomCard(option, 'custom-card--allocation');
      const count = answers.filter(value => value === option.result).length;
      card.classList.toggle('is-charged', count > 0);
      card.dataset.sparkCount = String(count);
      card.style.setProperty('--spark-count', String(count));
      const controls = document.createElement('div');
      controls.className = 'spark-controls';
      const minus = document.createElement('button');
      minus.type = 'button';
      minus.textContent = '−';
      minus.setAttribute('aria-label', `Haal een vonkje weg bij ${option.label}`);
      minus.disabled = missing || count === 0;
      const score = document.createElement('strong');
      score.textContent = '✦'.repeat(count) || '0';
      score.setAttribute('aria-label', `${count} vonkjes`);
      const plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
      plus.setAttribute('aria-label', `Geef een vonkje aan ${option.label}`);
      plus.disabled = missing || remaining === 0;
      minus.addEventListener('click', () => {
        const index = answers.lastIndexOf(option.result);
        if (index >= 0) answers[index] = null;
        saveQuizProgress();
        renderCustomGame();
      });
      plus.addEventListener('click', () => {
        burstFromElement(plus, '✦', 8);
        const index = answers.indexOf(null);
        if (index >= 0) answers[index] = option.result;
        saveQuizProgress();
        renderCustomGame();
      });
      controls.append(minus, score, plus);
      card.append(controls);
      return card;
    }));
    customFinishButton.disabled = !missing && remaining > 0;
  }

  function renderRankingBoard() {
    const missing = customIsMissing();
    const nextSeat = answers.findIndex(value => value === null);
    document.querySelector('[data-custom-status]').textContent = missing
      ? 'Deze cast krijgt vandaag geen rol. Dat is een geldige uitkomst.'
      : nextSeat >= 0
        ? `Kies nu: ${activeQuiz.rankSeats[nextSeat].label}.`
        : 'De tijdelijke bezetting staat. Je kunt nog een plaats vrijmaken.';
    const seats = document.createElement('ol');
    seats.className = 'rank-seats';
    activeQuiz.rankSeats.forEach((seat, index) => {
      const row = document.createElement('li');
      row.className = answers[index] && answers[index] !== missingAnswer ? 'is-filled' : '';
      const label = document.createElement('span');
      label.textContent = seat.label;
      const chosen = activeQuiz.gameOptions.find(option => option.result === answers[index]);
      const value = document.createElement('strong');
      value.textContent = chosen?.label || 'Nog leeg';
      row.append(label, value);
      if (chosen) {
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.textContent = 'Maak vrij';
        clear.addEventListener('click', () => {
          answers[index] = null;
          saveQuizProgress();
          renderCustomGame();
        });
        row.append(clear);
      }
      seats.append(row);
    });
    const cast = document.createElement('div');
    cast.className = 'rank-cast';
    activeQuiz.gameOptions.forEach(option => {
      const card = makeCustomCard(option, 'custom-card--ranking');
      const usedAt = answers.indexOf(option.result);
      const choose = document.createElement('button');
      choose.type = 'button';
      choose.disabled = missing || usedAt >= 0 || nextSeat < 0;
      choose.textContent = usedAt >= 0 ? activeQuiz.rankSeats[usedAt].label : nextSeat >= 0 ? `Zet bij: ${activeQuiz.rankSeats[nextSeat].label}` : 'Geplaatst';
      choose.addEventListener('click', () => {
        burstFromElement(choose, option.symbol, 6);
        const empty = answers.findIndex(value => value === null);
        if (empty >= 0) answers[empty] = option.result;
        saveQuizProgress();
        renderCustomGame();
      });
      card.append(choose);
      cast.append(card);
    });
    customBoard.replaceChildren(seats, cast);
    customFinishButton.disabled = !missing && answers.some(value => value === null);
  }

  function renderCustomGame() {
    document.querySelector('[data-custom-eyebrow]').textContent = activeQuiz.customEyebrow;
    document.querySelector('[data-custom-title]').textContent = activeQuiz.customTitle;
    document.querySelector('[data-custom-intro]').textContent = activeQuiz.customIntro;
    customMissButton.textContent = activeQuiz.customMissLabel;
    document.querySelector('[data-custom-misses-help]').textContent = activeQuiz.customMissHelp;
    customMissButton.setAttribute('aria-pressed', String(customIsMissing()));
    customBoard.dataset.customMode = activeQuiz.mode;
    if (activeQuiz.mode === 'allocation') renderAllocationBoard();
    else renderRankingBoard();
    flashCustomStatus();
    customGame.focus?.({ preventScroll: true });
  }

  function calculateResult() {
    const scoreKeys = activeQuiz.mode === 'support' ? Object.keys(activeQuiz.dimensions) : activeQuiz.resultOrder;
    const scores = Object.fromEntries(scoreKeys.map(key => [key, 0]));
    let answered = 0;
    let missed = 0;
    let unit = 'antwoorden';
    if (activeQuiz.mode === 'support') {
      unit = 'reacties';
      answers.forEach((value, questionIndex) => {
        if (value === missingAnswer) { missed += 1; return; }
        const option = activeQuiz.questions[questionIndex]?.options.find(item => item.id === value);
        if (!option) return;
        answered += 1;
        Object.entries(option.signals || {}).forEach(([key, amount]) => { if (key in scores) scores[key] += amount; });
      });
      const maxima = Object.fromEntries(scoreKeys.map(key => [key, activeQuiz.questions.reduce((sum, question) => sum + Math.max(0, ...question.options.map(option => Number(option.signals?.[key]) || 0)), 0)]));
      return { scores, maxima, answered, missed, leaders:[], maxScore:Math.max(0, ...Object.values(scores)), noMatch:answered < Math.ceil(activeQuiz.questions.length * .6), unit };
    }
    if (activeQuiz.mode === 'path') {
      unit = 'routepunten';
      answers.forEach(value => {
        if (value === missingAnswer) { missed += 1; return; }
        if (!Array.isArray(value) || !value.length) return;
        answered += 1;
        if (isValidResult(value[0])) scores[value[0]] += 2;
        if (isValidResult(value[1])) scores[value[1]] += 1;
      });
    } else if (activeQuiz.mode === 'ranking') {
      unit = 'stuurpunten';
      answers.forEach((value, index) => {
        if (value === missingAnswer) { missed += 1; return; }
        if (!isValidResult(value)) return;
        answered += 1;
        scores[value] += activeQuiz.rankSeats[index].weight;
      });
    } else {
      unit = activeQuiz.mode === 'allocation' ? 'vonkjes' : 'reacties';
      answers.forEach(value => {
        if (value === missingAnswer) { missed += 1; return; }
        if (!isValidResult(value)) return;
        answered += 1;
        scores[value] += 1;
      });
    }
    if (answered < 2) return { scores, answered, missed, leaders: [], maxScore: 0, noMatch: true, unit };
    const maxScore = Math.max(...Object.values(scores));
    const leaders = activeQuiz.resultOrder.filter(key => scores[key] === maxScore);
    return { scores, answered, missed, leaders, maxScore, noMatch: false, unit };
  }

  function openResult() {
    return {
      id: 'open',
      kicker: 'Een geldige uitslag',
      title: 'De spiegel blijft open',
      summary: 'Geen richting kreeg genoeg grond onder de voeten. Dat is geen fout: dit spel ving jouw situatie vandaag blijkbaar niet goed genoeg.',
      strength: 'Je hebt geen passend verhaal geforceerd alleen omdat het spel erom vroeg.',
      friction: 'Een open spiegel vertelt nog niet wat er wél speelt. Daarvoor zijn andere woorden, context of vragen nodig.',
      counter: 'Welke vraag of speeloptie ontbrak om jouw situatie beter te begrijpen?',
      experiment: 'Schrijf één betere vraag op. Je hoeft haar vandaag nog niet te beantwoorden.',
      readHref: 'atlas-kompas.html',
      readLabel: 'Lees hoe de Atlas ruimte laat voor onzekerheid →',
      readTitle: 'Het Atlas-kompas',
      readReason: 'Deze tekst legt uit waarom een mens nooit volledig in één model, score of verhaal past.'
    };
  }

  function scoreCopy(score, unit) {
    if (unit === 'reacties') return `${score} reactie${score === 1 ? '' : 's'}`;
    if (unit === 'vonkjes') return `${score} vonkje${score === 1 ? '' : 's'}`;
    return `${score} ${unit}`;
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
          document.querySelector('[data-save-mini-status]').textContent = '';
        }
        renderResult(id);
      });
      return button;
    }));
  }

  function renderTie(meta, chosenId = '') {
    tieSection.hidden = false;
    tieSection.classList.toggle('mini-tie--resolved', Boolean(chosenId));
    tieSection.querySelector('h1').textContent = chosenId ? 'Je spel liet meer dan één richting open.' : 'Meer dan één spiegel past even sterk.';
    const names = meta.leaders.map(id => activeQuiz.results[id].title).join(' en ');
    const score = scoreCopy(meta.maxScore, meta.unit);
    document.querySelector('[data-result-tie-copy]').textContent = chosenId
      ? `${names} kregen elk ${score}. Je bekijkt nu ${activeQuiz.results[chosenId].title}, maar je kunt de andere spiegel ook openen.`
      : `${names} kregen elk ${score}. De Speelhal kiest niet stiekem voor jou.`;
    buildTieChoices(meta, chosenId);
  }

  function describeBasis(meta, result) {
    if (meta.noMatch) return `Er waren slechts ${meta.answered} tellende keuzes. Daarom maken we geen profiel op zo weinig grond.`;
    if (activeQuiz.mode === 'support') return `Gebaseerd op ${meta.answered} van de ${activeQuiz.questions.length} gespreksmomenten. De balkjes beschrijven alleen je keuzes in deze simulatie.`;
    if (activeQuiz.mode === 'allocation') {
      const spread = activeQuiz.resultOrder.filter(id => id !== result.id && meta.scores[id] > 0).length;
      return `${scoreCopy(meta.maxScore, meta.unit)} ging${meta.maxScore === 1 ? '' : 'en'} naar ${result.title}. ${spread ? `Je verdeelde ook over ${spread} andere beweging${spread === 1 ? '' : 'en'}.` : 'Je legde alle nadruk op één beweging.'}`;
    }
    if (activeQuiz.mode === 'ranking') {
      const names = answers.filter(value => isValidResult(value)).map((id, index) => `${activeQuiz.rankSeats[index].label}: ${activeQuiz.results[id].title}`);
      return `Jouw tijdelijke bezetting was ${names.join(' · ')}. De eerste plaats weegt het zwaarst; ze maakt de andere stemmen niet onbelangrijk.`;
    }
    const missedCopy = meta.missed ? ` ${meta.missed} moment${meta.missed === 1 ? '' : 'en'} telde${meta.missed === 1 ? '' : 'n'} bewust niet mee.` : '';
    if (activeQuiz.mode === 'path') {
      if (meta.leaders.length > 1) return `${meta.leaders.length} richtingen kregen elk ${scoreCopy(meta.maxScore, meta.unit)}. Jij koos ${result.title} om verder te onderzoeken.${missedCopy}`;
      return `${result.title} kreeg ${scoreCopy(meta.maxScore, meta.unit)}. Een eerste stem kreeg per kruispunt twee punten; een eventuele tweede één.${missedCopy}`;
    }
    if (meta.leaders.length > 1) return `${meta.leaders.length} luisterspiegels kregen elk ${scoreCopy(meta.maxScore, meta.unit)}. Jij koos ${result.title} om verder te onderzoeken.${missedCopy}`;
    const otherScores = activeQuiz.resultOrder.filter(id => id !== result.id && meta.scores[id] > 0).length;
    const spreadCopy = otherScores ? ` Je andere reacties wezen ook naar ${otherScores} andere luisterbeweging${otherScores === 1 ? '' : 'en'}.` : '';
    return `${scoreCopy(meta.maxScore, meta.unit)} ${meta.maxScore === 1 ? 'wees' : 'wezen'} naar deze spiegel.${spreadCopy}${missedCopy}`;
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

  function supportDimensionOrder(group) {
    return Object.entries(activeQuiz.dimensions).filter(([, item]) => item.group === group).map(([id, item]) => ({
      id,
      ...item,
      score:resultMeta.scores[id] || 0,
      maximum:resultMeta.maxima[id] || 1,
      ratio:(resultMeta.scores[id] || 0) / (resultMeta.maxima[id] || 1)
    })).sort((a, b) => b.ratio - a.ratio || b.score - a.score);
  }

  function makeSupportMeter(item) {
    const row = document.createElement('article');
    const head = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = item.label;
    const count = document.createElement('span');
    count.textContent = `${item.score} signaal${item.score === 1 ? '' : 'punten'}`;
    head.append(label, count);
    const track = document.createElement('div');
    track.className = 'support-meter';
    const fill = document.createElement('i');
    fill.style.width = `${Math.round(item.ratio * 100)}%`;
    track.append(fill);
    const copy = document.createElement('p');
    copy.textContent = item.short;
    row.append(head, track, copy);
    return row;
  }

  function renderSupportDashboard(skills, reflexes) {
    const dashboard = document.querySelector('[data-support-dashboard]');
    dashboard.hidden = false;
    document.querySelector('[data-support-skills]').replaceChildren(...skills.map(makeSupportMeter));
    document.querySelector('[data-support-reflexes]').replaceChildren(...reflexes.map(makeSupportMeter));
    const atlasItems = [];
    [skills[0], reflexes[0], skills[1]].forEach(item => {
      if (!item?.atlasHref || atlasItems.some(existing => existing.atlasHref === item.atlasHref)) return;
      atlasItems.push(item);
    });
    document.querySelector('[data-support-atlas-links]').replaceChildren(...atlasItems.map(item => {
      const link = document.createElement('a');
      link.href = item.atlasHref;
      const label = document.createElement('span');
      label.textContent = item.group === 'skill' ? `Bij ${item.label}` : `Onderzoek ${item.label}`;
      const title = document.createElement('strong');
      title.textContent = item.atlasTitle;
      const copy = document.createElement('p');
      copy.textContent = item.atlasCopy;
      const arrow = document.createElement('small');
      arrow.textContent = 'Open het Atlasdossier →';
      link.append(label, title, copy, arrow);
      return link;
    }));
  }

  function supportResultCopy() {
    const skills = supportDimensionOrder('skill');
    const reflexes = supportDimensionOrder('reflex');
    const leadSkill = skills[0];
    const leadReflex = reflexes[0];
    const reflexAppeared = leadReflex.score > 0;
    const reflexExperiments = {
      fixen:'Vraag vóór je advies: “Wil je dat ik luister, vragen stel of echt meedenk?”',
      overnemen:'Vraag bij één hulpimpuls: “Wat wil je zelf blijven doen, en waar wil je steun bij?”',
      pleasen:'Noem vóór je hulp aanbiedt één eerlijke grens in tijd, energie of verantwoordelijkheid.',
      terugtrekken:'Vervang één stille verdwijning door: “Ik wil reageren, maar heb even tijd nodig. Ik kom erop terug.”'
    };
    return {
      skills,
      reflexes,
      result:{
        id:'support-map',
        kicker:'Jouw gesprekspaneel',
        title:`Je steunde vooral via ${leadSkill.label.toLowerCase()}.`,
        summary:reflexAppeared
          ? `In deze gesprekken was ${leadSkill.label.toLowerCase()} je duidelijkste steunvaardigheid. Wanneer de spanning opliep, verscheen ook ${leadReflex.label.toLowerCase()}. Dat is geen type, maar een combinatie van keuzes die je verder kunt onderzoeken.`
          : `In deze gesprekken was ${leadSkill.label.toLowerCase()} je duidelijkste steunvaardigheid. Geen drukreflex sprong sterk naar voren; andere situaties kunnen uiteraard iets anders oproepen.`,
        strength:`Je sterkste lijn was ${leadSkill.label.toLowerCase()}: ${leadSkill.short}`,
        friction:reflexAppeared ? `${leadReflex.label} kreeg de meeste punten bij je drukreflexen. ${leadReflex.short}` : 'Een lage reflexscore bewijst niet dat je nooit overneemt, pleast, fixt of uit contact gaat.',
        counter:reflexAppeared ? `Wanneer helpt ${leadReflex.label.toLowerCase()} werkelijk — en wanneer maakt die reactie jou of de ander kleiner?` : 'In welke relatie zou dezelfde situatie waarschijnlijk een andere reactie bij je oproepen?',
        experiment:reflexAppeared ? reflexExperiments[leadReflex.id] : 'Vraag in één veilig gesprek expliciet welke vorm van steun nu gewenst is.',
        readHref:'',
        readTitle:'',
        readLabel:'',
        readReason:''
      }
    };
  }

  function renderResult(requestedId = '') {
    resultMeta = calculateResult();
    showOnly(resultSection);
    resultSection.classList.remove('is-revealed');
    void resultSection.offsetWidth;
    resultSection.classList.add('is-revealed');
    if (activeQuiz.mode === 'support') {
      tieSection.hidden = true;
      resultContent.hidden = false;
      resultSection.setAttribute('aria-labelledby', 'mini-result-title');
      if (resultMeta.noMatch) {
        activeResult = openResult();
        selectedResultId = activeResult.id;
        document.querySelector('[data-support-dashboard]').hidden = true;
        document.querySelector('[data-result-kicker]').textContent = activeResult.kicker;
        document.querySelector('[data-result-title]').textContent = activeResult.title;
        document.querySelector('[data-result-summary]').textContent = activeResult.summary;
        document.querySelector('[data-result-basis]').textContent = `Slechts ${resultMeta.answered} gespreksmoment${resultMeta.answered === 1 ? '' : 'en'} telde${resultMeta.answered === 1 ? '' : 'n'} mee. Dat is te weinig voor een bruikbaar dashboard.`;
        document.querySelector('[data-result-strength]').textContent = activeResult.strength;
        document.querySelector('[data-result-friction]').textContent = activeResult.friction;
        document.querySelector('[data-result-counter]').textContent = activeResult.counter;
        document.querySelector('[data-result-experiment]').textContent = activeResult.experiment;
        renderReading(activeResult);
        syncReactionControls();
        saveQuizProgress('result');
        return;
      }
      const support = supportResultCopy();
      activeResult = support.result;
      selectedResultId = activeResult.id;
      document.querySelector('[data-result-kicker]').textContent = activeResult.kicker;
      document.querySelector('[data-result-title]').textContent = activeResult.title;
      document.querySelector('[data-result-summary]').textContent = activeResult.summary;
      document.querySelector('[data-result-basis]').textContent = `Gebaseerd op ${resultMeta.answered} van de ${activeQuiz.questions.length} gespreksmomenten. Ieder gekozen antwoord kan meer dan één signaal bevatten; de balkjes zijn geen percentages of normscore.`;
      document.querySelector('[data-result-strength]').textContent = activeResult.strength;
      document.querySelector('[data-result-friction]').textContent = activeResult.friction;
      document.querySelector('[data-result-counter]').textContent = activeResult.counter;
      document.querySelector('[data-result-experiment]').textContent = activeResult.experiment;
      const gridLabels = document.querySelectorAll('.mini-result__grid article>span');
      if (gridLabels[0]) gridLabels[0].textContent = 'Wat je al inzet';
      if (gridLabels[1]) gridLabels[1].textContent = 'Wat onder druk kan schuren';
      renderSupportDashboard(support.skills, support.reflexes);
      renderReading(activeResult);
      syncReactionControls();
      saveQuizProgress('result');
      return;
    }
    document.querySelector('[data-support-dashboard]').hidden = true;
    const gridLabels = document.querySelectorAll('.mini-result__grid article>span');
    if (gridLabels[0]) gridLabels[0].textContent = 'Wat hier helpend aan kan zijn';
    if (gridLabels[1]) gridLabels[1].textContent = 'Waar het kan schuren';
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
        checks: new Array(7).fill(false), note: '', startedAt: new Date().toISOString(), completedWeeks: [], carryForward: ''
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
  document.querySelector('[data-start-support-simulation]')?.addEventListener('click', () => {
    supportIntro.hidden = true;
    standardGame.hidden = false;
    stage.setAttribute('aria-labelledby', 'mini-question-title');
    prepareJourney();
    renderQuestion();
    saveQuizProgress();
  });
  document.querySelector('[data-back-to-shelf]').addEventListener('click', showShelf);
  missingButton.addEventListener('click', () => {
    const wasMissing = answers[current] === missingAnswer;
    answers[current] = wasMissing ? null : missingAnswer;
    if (isConversationMode()) document.querySelectorAll('[data-mini-options] input').forEach(input => { input.checked = false; });
    missingButton.setAttribute('aria-pressed', String(!wasMissing));
    saveQuizProgress();
    if (activeQuiz.mode === 'path') syncPathOptions();
    else {
      document.querySelector('[data-mini-next]').disabled = wasMissing;
      answerHint.textContent = wasMissing ? 'Kies de reactie die het dichtst bij je spontane antwoord komt.' : 'Dit gespreksmoment telt niet mee in de uitslag.';
    }
  });
  document.querySelector('[data-mini-previous]').addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      saveQuizProgress();
      renderQuestion();
    }
  });
  document.querySelector('[data-mini-next]').addEventListener('click', () => {
    if (!isAnswered(answers[current])) return;
    if (current < activeQuiz.questions.length - 1) {
      current += 1;
      saveQuizProgress();
      renderQuestion();
    } else renderResult();
  });
  customMissButton.addEventListener('click', () => {
    burstFromElement(customMissButton, '?', 6);
    answers = customIsMissing() ? new Array(expectedAnswerCount()).fill(null) : new Array(expectedAnswerCount()).fill(missingAnswer);
    saveQuizProgress();
    renderCustomGame();
  });
  document.querySelector('[data-reset-custom]').addEventListener('click', () => {
    answers = new Array(expectedAnswerCount()).fill(null);
    saveQuizProgress();
    renderCustomGame();
  });
  customFinishButton.addEventListener('click', () => { if (playIsComplete()) renderResult(); });
  fitButtons.forEach(button => button.addEventListener('click', () => {
    fit = button.dataset.miniFit;
    burstFromElement(button, fit === 'mist' ? '?' : '✦', 6);
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
