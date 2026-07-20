(function () {
  const quizzes = window.MENSLAB_QUIZZES;
  if (!Array.isArray(quizzes) || !quizzes.length) return;

  const home = document.querySelector('[data-quiz-home]');
  const shelf = document.querySelector('[data-quiz-shelf]');
  const stage = document.querySelector('[data-mini-quiz]');
  const standardGame = document.querySelector('[data-standard-game]');
  const customGame = document.querySelector('[data-custom-game]');
  const supportIntro = document.querySelector('[data-support-intro]');
  const steeringIntro = document.querySelector('[data-steering-intro]');
  const steeringBackButton = document.querySelector('[data-back-to-steering-intro]');
  const steeringStartLabel = document.querySelector('[data-steering-start-label]');
  const steeringMirror = document.querySelector('[data-steering-mirror]');
  const customBoard = document.querySelector('[data-custom-board]');
  const customMissButton = document.querySelector('[data-custom-misses]');
  const customFinishButton = document.querySelector('[data-finish-custom]');
  const steeringFinishHelp = document.querySelector('[data-steering-finish-help]');
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
      note: 'Zes gesprekken, twee beurten. Geen perfecte luisteraar, wel zichtbare wisselwerking.',
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
  let supportRound = 1;
  let steeringDraft = { problem:'', aim:'', song:'', labels:{}, messages:{} };

  const allQuizLibrary = document.querySelector('[data-all-quiz-library]');
  const allQuizSearch = document.querySelector('[data-all-quiz-search]');
  const allQuizType = document.querySelector('[data-all-quiz-type]');
  const allQuizCategory = document.querySelector('[data-all-quiz-category]');
  const cabinetDrawer = document.querySelector('[data-cabinet-drawer]');
  const familyButtons = [...document.querySelectorAll('[data-family]')];
  const arcadeReveal = document.querySelector('[data-arcade-reveal]');
  const arcadePickButtons = [...document.querySelectorAll('[data-arcade-pick]')];
  const arcadeSurpriseButton = document.querySelector('[data-arcade-surprise]');
  const arcadeDoubt = document.querySelector('[data-arcade-doubt]');
  const arcadeDoubtCopy = document.querySelector('[data-arcade-doubt-copy]');
  const arcadeTrustButtons = [...document.querySelectorAll('[data-arcade-trust]')];
  let lastArcadeMode = 'surprise';
  let arcadeDoubtStep = 0;

  function allQuizItems() {
    return [
      { id:'beweging-vandaag', href:'speelhal.html?quiz=beweging-vandaag', title:'Wat wil je vandaag anders aanpakken?', type:'Check-in', mode:'quick', category:'Vandaag', duration:'± 2 minuten', copy:'Verdeel vijf vonkjes over vertragen, benoemen, begrenzen, verbinden en kiezen.', search:'vonkjes vandaag vertragen benoemen grens contact kiezen licht kort' },
      { id:'luisteren-of-repareren', href:'speelhal.html?quiz=luisteren-of-repareren', title:'Luister je nog — of heb je het al opgelost?', type:'Simulatie', mode:'investigate', category:'Relaties & gesprekken', duration:'± 12–15 minuten', copy:'Speel zes gesprekken en zie wat er verandert wanneer je luistert, helpt, herstelt of begrenst.', search:'luisteren helpen repareren gesprek steun afstemmen herstel grens' },
      { id:'laat-maar', href:'speelhal/laat-maar.html', title:'O nee. Iemand zei: “Laat maar.”', type:'Keuzeverhaal', mode:'investigate', category:'Relaties & gesprekken', duration:'± 6–8 minuten', copy:'Volg een relationele horrorfilm en onderzoek wat jij probeert te herstellen wanneer teleurstelling dreigt.', search:'pleasen harmonie spanning teleurstelling afwijzing laat maar horror keuze verhaal' },
      { id:'autospel', href:'speelhal/autospel.html', title:'Wie zit er aan het stuur?', type:'Werkbank', mode:'real', category:'Keuzes & innerlijk conflict', duration:'± 10–15 minuten', copy:'Leg één echt kruispunt neer en geef reflex, relatieradar, kompas en verhalenmaker elk een plaats.', search:'auto stuur stemmen conflict dilemma kruispunt situatie eigen moment' },
      { id:'dieptequiz-ja', href:'dieptequiz-ja.html', title:'Een ja is geen type.', type:'Spiegelspel', mode:'investigate', category:'Keuzes', duration:'± 8–10 minuten', copy:'Onderzoek verlangen, zorg, druk, draagkracht en hoeveel keuze er werkelijk meespeelt.', search:'ja keuze motivatie grenzen verantwoordelijkheid draagkracht context spiegel' },
      { id:'beestenquiz', href:'dierenquiz.html', title:'De Grote Beestenquiz', type:'Spiegelspel', mode:'investigate', category:'Persoonlijkheid', duration:'± 10–12 minuten', copy:'Maak een speels dierenprofiel van patronen die vandaag in je antwoorden opvallen.', search:'beestenquiz persoonlijkheid patronen dieren profiel archetype mythisch' },
      { id:'emotionele-routekaart', href:'speelhal/oefeningen/emotionele-routekaart.html', title:'Spoel even terug', type:'Werkbank', mode:'real', category:'Emoties & zelfinzicht', duration:'± 15–20 minuten', copy:'Leg één moment op de montagetafel en haal gebeurtenis, betekenis, lichaam, emotie en impuls even uiteen.', search:'emotie lichaam betekenis impuls golf scène montage ondertiteling eigen moment werkbank' },
      { id:'weekroute', href:'speelhal-week.html', title:'Een week mentale rekbaarheid', type:'Route & experiment', mode:'real', category:'Veranderen', duration:'7 dagen · lichte haltes', copy:'Zeven lichte haltes rond voorspellen, vertragen, anders kijken en opnieuw proberen.', search:'week route experiment mentale rekbaarheid voorspellen vertragen proberen' },
      { id:'veranderroute', href:'veranderroute.html', title:'De Veranderroute', type:'Route & experiment', mode:'real', category:'Veranderen', duration:'± 10–15 minuten', copy:'Ga van iets dat schuurt naar één kleine, haalbare proef met ruimte om terug te keren.', search:'veranderen route experiment verwachting observatie beweging gewoonte' }
    ];
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
      link.dataset.family = item.type;
      const category = document.createElement('span');
      category.textContent = `${item.type} · ${item.category}`;
      const title = document.createElement('strong');
      title.textContent = item.title;
      const copy = document.createElement('p');
      copy.textContent = item.copy;
      const duration = document.createElement('small');
      duration.textContent = `${item.duration} →`;
      link.append(category, title, copy, duration);
      return link;
    }));
  }

  allQuizSearch?.addEventListener('input', renderAllQuizzes);
  allQuizType?.addEventListener('change', () => {
    familyButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.family === allQuizType.value)));
    renderAllQuizzes();
  });
  allQuizCategory?.addEventListener('change', renderAllQuizzes);
  familyButtons.forEach(button => button.addEventListener('click', () => {
    familyButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    allQuizType.value = button.dataset.family;
    renderAllQuizzes();
    if (cabinetDrawer) {
      cabinetDrawer.hidden = false;
      cabinetDrawer.classList.toggle('is-catalog', button.dataset.family === '');
    }
    familyButtons.forEach(item => item.setAttribute('aria-expanded', String(item === button)));
    cabinetDrawer?.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest' });
  }));

  function readLocalJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (_) { return null; }
  }

  function chooseArcadeGame(mode) {
    const catalog = allQuizItems();
    const eligible = mode === 'surprise' ? catalog : catalog.filter(item => item.mode === mode);
    if (!eligible.length || !arcadeReveal) return;
    let previous = '';
    try { previous = sessionStorage.getItem('onwijze-arcade-last-pick-v1') || ''; } catch (_) {}
    const fresh = eligible.length > 1 ? eligible.filter(item => item.id !== previous) : eligible;
    const selected = fresh[Math.floor(Math.random() * fresh.length)];
    try { sessionStorage.setItem('onwijze-arcade-last-pick-v1', selected.id); } catch (_) {}
    lastArcadeMode = mode;
    arcadeReveal.querySelector('[data-arcade-reveal-meta]').textContent = `${selected.type} · ${selected.category} · ${selected.duration}`;
    arcadeReveal.querySelector('[data-arcade-reveal-title]').textContent = selected.title;
    arcadeReveal.querySelector('[data-arcade-reveal-copy]').textContent = selected.copy;
    const link = arcadeReveal.querySelector('[data-arcade-reveal-link]');
    link.href = selected.href;
    arcadeReveal.hidden = false;
    arcadeReveal.classList.remove('is-revealed');
    requestAnimationFrame(() => arcadeReveal.classList.add('is-revealed'));
    arcadeReveal.scrollIntoView({ behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'center' });
  }

  function closeArcadeDoubt() {
    if (!arcadeDoubt) return;
    arcadeDoubt.hidden = true;
    arcadeDoubt.classList.remove('is-offended');
    arcadeSurpriseButton?.setAttribute('aria-expanded', 'false');
  }

  function openArcadeDoubt() {
    if (!arcadeDoubt || !arcadeDoubtCopy) return;
    arcadeDoubtStep = 0;
    arcadeDoubt.hidden = false;
    arcadeDoubt.classList.remove('is-offended');
    arcadeDoubtCopy.textContent = 'Vertrouw je deze knop werkelijk?';
    arcadeTrustButtons.forEach(item => { item.hidden = false; });
    if (arcadeTrustButtons[0]) arcadeTrustButtons[0].textContent = 'Ja';
    if (arcadeTrustButtons[1]) arcadeTrustButtons[1].textContent = 'Nee';
    arcadeSurpriseButton?.setAttribute('aria-expanded', 'true');
    arcadeTrustButtons[0]?.focus({ preventScroll:true });
  }

  arcadePickButtons.forEach(button => button.addEventListener('click', () => {
    closeArcadeDoubt();
    chooseArcadeGame(button.dataset.arcadePick);
  }));
  arcadeSurpriseButton?.addEventListener('click', openArcadeDoubt);
  arcadeTrustButtons.forEach(button => button.addEventListener('click', () => {
    if (arcadeDoubtStep === 0 && button.dataset.arcadeTrust === 'yes') {
      closeArcadeDoubt();
      chooseArcadeGame('surprise');
      return;
    }
    if (arcadeDoubtStep === 0) {
      arcadeDoubtStep = 1;
      arcadeDoubtCopy.textContent = 'Ben je daar wel heel zeker van?';
      arcadeTrustButtons[0].textContent = 'Nee';
      arcadeTrustButtons[1].textContent = 'Ook nee';
      return;
    }
    arcadeDoubtCopy.textContent = 'Jammer. De knop had net vertrouwen in jou gekregen.';
    arcadeDoubt.classList.add('is-offended');
    arcadeTrustButtons.forEach(item => { item.hidden = true; });
    arcadeSurpriseButton?.setAttribute('aria-expanded', 'false');
  }));
  document.querySelector('[data-arcade-pick-again]')?.addEventListener('click', () => chooseArcadeGame(lastArcadeMode));

  function syncArcadeResume() {
    const control = document.querySelector('[data-arcade-resume]');
    if (!control) return;
    const catalog = allQuizItems();
    const candidates = [];
    const quickProgress = readLocalJson('quizkast-progress-v1');
    if (quickProgress?.quizId) {
      const item = catalog.find(game => game.id === quickProgress.quizId || (quickProgress.quizId === 'wie-zit-aan-het-stuur' && game.id === 'autospel'));
      if (item) candidates.push({ ...item, savedAt:quickProgress.savedAt || '' });
    }
    const steering = readLocalJson('onwijze-steering-game-v1');
    if (steering?.updatedAt) candidates.push({ ...catalog.find(game => game.id === 'autospel'), savedAt:steering.updatedAt });
    const horror = readLocalJson('onwijze-laat-maar-game-v1');
    if (horror?.updatedAt && horror.phase !== 'intro') candidates.push({ ...catalog.find(game => game.id === 'laat-maar'), savedAt:horror.updatedAt });
    const depth = readLocalJson('dieptequiz-ja-progress-v1');
    if (depth) candidates.push({ ...catalog.find(game => game.id === 'dieptequiz-ja'), savedAt:depth.savedAt || '' });
    const route = readLocalJson('onwijze-veranderroute-v2');
    if (route) candidates.push({ ...catalog.find(game => game.id === 'veranderroute'), savedAt:route.savedAt || route.updatedAt || '' });
    const latest = candidates.filter(Boolean).sort((a, b) => Date.parse(b.savedAt || 0) - Date.parse(a.savedAt || 0))[0];
    if (!latest?.href) return;
    control.href = latest.href;
    control.querySelector('[data-arcade-resume-title]').textContent = latest.title;
    control.hidden = false;
  }

  syncArcadeResume();
  renderAllQuizzes();

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
        supportRound: activeQuiz.mode === 'support' ? supportRound : undefined,
        steeringDraft: activeQuiz.id === 'wie-zit-aan-het-stuur' ? steeringDraft : undefined,
        savedAt: new Date().toISOString()
      }));
    } catch (_) {}
  }

  function clearQuizProgress() {
    try { localStorage.removeItem(quizProgressKey); } catch (_) {}
  }

  function cleanSteeringText(value, maximum) {
    return typeof value === 'string' ? value.trimStart().slice(0, maximum) : '';
  }

  function makeSteeringDraft(quiz, stored) {
    const supplied = stored && typeof stored === 'object' ? stored : {};
    const suppliedLabels = supplied.labels && typeof supplied.labels === 'object' ? supplied.labels : {};
    const suppliedMessages = supplied.messages && typeof supplied.messages === 'object' ? supplied.messages : {};
    return {
      problem:cleanSteeringText(supplied.problem, 160),
      aim:cleanSteeringText(supplied.aim, 140),
      song:cleanSteeringText(supplied.song, 100),
      labels:Object.fromEntries(quiz.gameOptions.map(option => [
        option.result,
        cleanSteeringText(suppliedLabels[option.result], 48) || option.label
      ])),
      messages:Object.fromEntries(quiz.gameOptions.map(option => [
        option.result,
        cleanSteeringText(suppliedMessages[option.result], 160)
      ]))
    };
  }

  function steeringLabel(resultId) {
    return steeringDraft.labels[resultId] || activeQuiz.gameOptions.find(option => option.result === resultId)?.label || 'Onbenoemde stem';
  }

  function steeringMessage(resultId) {
    return steeringDraft.messages[resultId] || '';
  }

  function steeringMissingMessages() {
    return activeQuiz.gameOptions.filter(option => !steeringMessage(option.result).trim());
  }

  function playSteeringEngine() {
    const ignition = document.querySelector('.steering-ignition');
    ignition?.classList.remove('is-starting');
    requestAnimationFrame(() => ignition?.classList.add('is-starting'));
    window.setTimeout(() => ignition?.classList.remove('is-starting'), 1150);
    try {
      const AudioEngine = window.AudioContext || window.webkitAudioContext;
      if (!AudioEngine) return;
      const audio = new AudioEngine();
      const now = audio.currentTime;
      const master = audio.createGain();
      const filter = audio.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.14, now + 0.08);
      master.gain.exponentialRampToValueAtTime(0.075, now + 0.48);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);
      filter.connect(master).connect(audio.destination);
      [42, 63, 86].forEach((frequency, index) => {
        const motor = audio.createOscillator();
        const motorGain = audio.createGain();
        motor.type = index === 0 ? 'sawtooth' : 'square';
        motor.frequency.setValueAtTime(frequency, now);
        motor.frequency.exponentialRampToValueAtTime(frequency * 2.1, now + 0.32);
        motor.frequency.exponentialRampToValueAtTime(frequency * 1.35, now + 0.92);
        motorGain.gain.value = index === 0 ? 0.7 : 0.18;
        motor.connect(motorGain).connect(filter);
        motor.start(now + index * 0.025);
        motor.stop(now + 1.08);
      });
      window.setTimeout(() => audio.close().catch(() => {}), 1200);
    } catch (_) {}
  }

  function syncSteeringFinishControl() {
    if (activeQuiz?.id !== 'wie-zit-aan-het-stuur') {
      steeringFinishHelp.hidden = true;
      customFinishButton.textContent = 'Bekijk mijn spiegel →';
      return;
    }
    steeringFinishHelp.hidden = false;
    if (customIsMissing()) {
      customFinishButton.disabled = false;
      customFinishButton.textContent = 'Bekijk mijn open spiegel →';
      steeringFinishHelp.textContent = 'Je koos ervoor de autometafoor niet te gebruiken. Ook dat is een volledig antwoord.';
      return;
    }
    const hasScene = Boolean(steeringDraft.problem.trim());
    const missingMessages = steeringMissingMessages().length;
    const missingSeats = answers.filter(value => value === null).length;
    customFinishButton.disabled = !hasScene || missingMessages > 0 || missingSeats > 0;
    if (!hasScene) {
      customFinishButton.textContent = 'Vul eerst je situatie in';
      steeringFinishHelp.textContent = 'Begin bij stap 1A: beschrijf één concreet moment.';
    } else if (missingMessages) {
      customFinishButton.textContent = `Nog ${missingMessages} reactie${missingMessages === 1 ? '' : 's'} invullen`;
      steeringFinishHelp.textContent = 'Beantwoord bij stap 2 de vier vragen. Eén eerlijke zin per kaart is genoeg.';
    } else if (missingSeats) {
      customFinishButton.textContent = `Nog ${missingSeats} stoel${missingSeats === 1 ? '' : 'en'} kiezen`;
      steeringFinishHelp.textContent = 'Je zinnen zijn klaar. Kies nu op iedere kaart een stoel via het menu. Slepen mag, maar hoeft niet.';
    } else {
      customFinishButton.textContent = 'Bekijk mijn spiegel →';
      steeringFinishHelp.textContent = 'Alles staat. Je kunt nog wisselen, of de hele wagen van buitenaf bekijken.';
    }
  }

  function syncSteeringSeatGate() {
    if (activeQuiz?.id !== 'wie-zit-aan-het-stuur') return;
    const missingMessages = steeringMissingMessages().length;
    const ready = Boolean(steeringDraft.problem.trim()) && missingMessages === 0;
    const panel = document.querySelector('.steering-seats');
    const cabin = document.querySelector('.steering-cabin');
    const tip = document.querySelector('.steering-placement-tip');
    panel?.classList.toggle('is-locked', !ready);
    if (cabin) cabin.hidden = !ready;
    document.querySelectorAll('.steering-placement select').forEach(select => {
      select.disabled = customIsMissing();
    });
    if (!tip) return;
    const emphasis = document.createElement('strong');
    if (ready) {
      emphasis.textContent = 'Kies op iedere kaart een stoel via het menu.';
      tip.replaceChildren(emphasis, document.createTextNode(' Slepen mag ook, maar hoeft niet.'));
    } else {
      emphasis.textContent = 'Je mag hierboven al een stoel kiezen.';
      const reason = steeringDraft.problem.trim()
        ? ` De volledige auto verschijnt zodra je de andere ${missingMessages} vraag${missingMessages === 1 ? '' : 'en'} ook hebt beantwoord.`
        : ' De volledige auto verschijnt zodra je een concrete situatie en de vier vragen hebt ingevuld.';
      tip.replaceChildren(emphasis, document.createTextNode(reason));
    }
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
    if (quiz?.mode === 'support') return false;
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
    if (quiz.mode === 'support') {
      const cleanSupport = values.map((value, index) => {
        if (value === missingAnswer) return missingAnswer;
        const question = quiz.questions[index];
        if (!value || typeof value !== 'object') return null;
        const first = question.options.some(option => option.id === value.first) ? value.first : '';
        const second = question.secondOptions.some(option => option.id === value.second) ? value.second : '';
        return first ? { first, second } : null;
      });
      return cleanSupport.every(value => value === null) ? null : cleanSupport;
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
    if (activeQuiz.mode === 'support') return Boolean(value && typeof value === 'object' && value.first && value.second);
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
    if (id === 'waar-komt-je-ja-vandaan') {
      location.href = 'speelhal/laat-maar.html';
      return;
    }
    if (id === 'wie-zit-aan-het-stuur') {
      location.href = 'speelhal/autospel.html';
      return;
    }
    activeQuiz = quizzes.find(quiz => quiz.id === id);
    if (!activeQuiz) return;
    const stored = forceFresh ? null : readQuizProgress();
    const restoredAnswers = stored?.quizId === id ? sanitizeStoredAnswers(stored.answers, activeQuiz) : null;
    const canResume = Boolean(restoredAnswers);
    current = canResume && Number.isInteger(stored.current) && !isCustomMode()
      ? Math.max(0, Math.min(activeQuiz.questions.length - 1, stored.current))
      : 0;
    supportRound = activeQuiz.mode === 'support' && canResume && stored.supportRound === 2 ? 2 : 1;
    answers = canResume ? restoredAnswers : new Array(expectedAnswerCount()).fill(null);
    fit = canResume && ['raakt', 'deels', 'mist'].includes(stored.fit) ? stored.fit : '';
    reflection = canResume && typeof stored.reflection === 'string' ? stored.reflection.slice(0, 280) : '';
    selectedResultId = canResume && typeof stored.selectedResultId === 'string' ? stored.selectedResultId : '';
    resultSaved = false;
    const visual = visualThemes[activeQuiz.id];
    const showSupportIntro = activeQuiz.mode === 'support' && !canResume;
    const showSteeringIntro = activeQuiz.id === 'wie-zit-aan-het-stuur' && !canResume;
    steeringDraft = activeQuiz.id === 'wie-zit-aan-het-stuur'
      ? makeSteeringDraft(activeQuiz, canResume ? stored.steeringDraft : null)
      : { problem:'', aim:'', song:'', labels:{}, messages:{} };
    stage.dataset.quizTheme = activeQuiz.id;
    stage.dataset.gameMode = activeQuiz.mode;
    resultSection.dataset.quizTheme = activeQuiz.id;
    resultSection.dataset.gameMode = activeQuiz.mode;
    stage.style.setProperty('--quiz-symbol', `"${visual.symbol}"`);
    resultSection.style.setProperty('--quiz-symbol', `"${visual.symbol}"`);
    document.querySelector('[data-mini-quiz-name]').textContent = activeQuiz.title;
    standardGame.hidden = isCustomMode() || showSupportIntro || showSteeringIntro;
    customGame.hidden = !isCustomMode() || showSteeringIntro;
    supportIntro.hidden = !showSupportIntro;
    steeringIntro.hidden = !showSteeringIntro;
    steeringBackButton.hidden = activeQuiz.id !== 'wie-zit-aan-het-stuur';
    if (steeringStartLabel) steeringStartLabel.textContent = 'START';
    stage.setAttribute('aria-labelledby', showSteeringIntro ? 'steering-intro-title' : isCustomMode() ? 'mini-custom-title' : showSupportIntro ? 'support-intro-title' : 'mini-question-title');
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
    else if (showSteeringIntro) showOnly(stage);
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

  function supportChoice(question, round, id) {
    return (round === 1 ? question.options : question.secondOptions).find(option => option.id === id);
  }

  function renderSupportExchange(question, round, choice) {
    const panel = document.querySelector('[data-support-exchange]');
    if (!choice) { panel.hidden = true; return; }
    panel.hidden = false;
    document.querySelector('[data-support-exchange-label]').textContent = round === 1 ? 'De ander reageert' : choice.recovery ? 'Herstel verandert de koers' : 'De ander reageert opnieuw';
    document.querySelector('[data-support-partner-reply]').textContent = choice.reply;
    document.querySelector('[data-support-effect]').textContent = choice.effect;
    document.querySelector('[data-support-missing]').textContent = round === 1 ? choice.missing : 'Dit is één geloofwaardige reactie binnen deze simulatie. Een echte persoon kan anders reageren.';
  }

  function renderSupportOptions(question) {
    const answer = answers[current] && answers[current] !== missingAnswer ? answers[current] : { first:'', second:'' };
    const source = supportRound === 1 ? question.options : question.secondOptions;
    return source.map((base, index) => {
      const option = base.id === 'repair' ? { ...base, text:question.options.find(item => item.id === answer.first)?.repair || 'Ik wil mijn eerste reactie corrigeren en opnieuw afstemmen.' } : base;
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-option mini-option--conversation';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `support-${current}-${supportRound}`;
      input.id = `support-answer-${current}-${supportRound}-${index}`;
      input.value = option.id;
      input.checked = (supportRound === 1 ? answer.first : answer.second) === option.id;
      const label = document.createElement('label');
      label.htmlFor = input.id;
      const marker = document.createElement('span');
      marker.textContent = supportRound === 1 ? '↩' : '↪';
      label.append(marker, document.createTextNode(option.text));
      input.addEventListener('change', () => {
        const nextAnswer = answers[current] && answers[current] !== missingAnswer ? { ...answers[current] } : { first:'', second:'' };
        if (supportRound === 1) { nextAnswer.first = option.id; nextAnswer.second = ''; }
        else nextAnswer.second = option.id;
        answers[current] = nextAnswer;
        missingButton.setAttribute('aria-pressed', 'false');
        renderSupportExchange(question, supportRound, option);
        answerHint.textContent = supportRound === 1 ? 'Lees wat deze reactie mogelijk opende of vernauwde. Daarna kun je verder afstemmen.' : 'Je tweede reactie staat. Dit gesprek mag nu verder reizen.';
        document.querySelector('[data-mini-next]').disabled = false;
        saveQuizProgress();
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
    const supportAnswer = activeQuiz.mode === 'support' && answers[current] && answers[current] !== missingAnswer ? answers[current] : null;
    const firstChoice = supportAnswer ? question.options.find(option => option.id === supportAnswer.first) : null;
    document.querySelector('[data-mini-question]').textContent = activeQuiz.mode === 'support' && supportRound === 2 && firstChoice ? firstChoice.reply : question.text;
    stage.style.setProperty('--question-number', `"${String(current + 1).padStart(2, '0')}"`);
    updateJourney();
    questionCard.classList.remove('mini-question--answered');
    const options = document.querySelector('[data-mini-options]');
    const legend = options.querySelector('legend');
    legend.textContent = isConversation ? 'Kies de reactie die het dichtst bij je spontane antwoord komt' : 'Kies eerst de sterkste stem en eventueel een tweede';
    legend.textContent = activeQuiz.mode === 'support' ? (supportRound === 1 ? 'Kies je waarschijnlijke eerste reactie' : 'Kies hoe je nu verdergaat') : legend.textContent;
    const optionNodes = activeQuiz.mode === 'support' ? renderSupportOptions(question) : isConversation ? renderConversationOptions(question, options) : renderPathOptions(question);
    options.replaceChildren(legend, ...optionNodes);
    const counterCopy = document.querySelector('.mini-question__counterchoice span');
    missingButton.textContent = isConversation ? 'Geen van deze reacties klinkt als mij' : 'Dit kruispunt mist mijn situatie';
    counterCopy.textContent = isConversation ? 'Dan telt dit gespreksmoment niet mee.' : 'Dan telt dit kruispunt niet mee.';
    document.querySelector('[data-mini-previous]').disabled = current === 0 && !(activeQuiz.mode === 'support' && supportRound === 2);
    const next = document.querySelector('[data-mini-next]');
    next.textContent = activeQuiz.mode === 'support' && supportRound === 1 ? 'Bekijk wat dit deed →' : current === activeQuiz.questions.length - 1 ? 'Bekijk mijn terugblik →' : isConversation ? 'Naar het volgende gesprek →' : 'Volgend kruispunt →';
    if (isConversation) {
      missingButton.setAttribute('aria-pressed', String(answers[current] === missingAnswer));
      next.disabled = activeQuiz.mode === 'support' ? !(supportRound === 1 ? supportAnswer?.first : supportAnswer?.second) : !isAnswered(answers[current]);
      if (answers[current] === missingAnswer) answerHint.textContent = 'Dit gespreksmoment telt niet mee in de uitslag.';
      else answerHint.textContent = activeQuiz.mode === 'support' ? (supportRound === 1 ? 'Kies wat je waarschijnlijk als eerste zou zeggen.' : 'Je hebt nieuwe informatie. Blijf je op koers of stuur je bij?') : answers[current] === null ? 'Wat zou jij waarschijnlijk als eerste terugsturen?' : 'Je eerdere reactie staat nog klaar. Je mag haar veranderen.';
      if (activeQuiz.mode === 'support') renderSupportExchange(question, supportRound === 2 && !supportAnswer?.second ? 1 : supportRound, supportRound === 1 ? firstChoice : supportAnswer?.second ? supportChoice(question, 2, supportAnswer.second) : firstChoice);
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
    const isSteering = activeQuiz.id === 'wie-zit-aan-het-stuur';
    const emptyMessages = isSteering ? steeringMissingMessages() : [];
    const seatsReady = !isSteering || (Boolean(steeringDraft.problem.trim()) && emptyMessages.length === 0);
    document.querySelector('[data-custom-status]').textContent = missing
      ? 'Deze cast krijgt vandaag geen rol. Dat is een geldige uitkomst.'
      : isSteering && !steeringDraft.problem.trim()
        ? 'Begin bij 1A: welk concrete moment wil je bekijken? Eén of twee zinnen zijn genoeg.'
        : isSteering && emptyMessages.length
          ? `Je situatie staat. Beantwoord nu nog ${emptyMessages.length} van de vier vragen bij stap 2.`
      : nextSeat >= 0
        ? isSteering ? `De vier zinnen staan. Kies nog ${answers.filter(value => value === null).length} stoel${answers.filter(value => value === null).length === 1 ? '' : 'en'} via de menu’s op de kaarten. Slepen mag ook.` : `Kies nu: ${activeQuiz.rankSeats[nextSeat].label}.`
        : isSteering ? 'De auto is ingevuld. Je spiegel is klaar — wisselen mag nog.' : 'De tijdelijke bezetting staat. Je kunt nog een plaats vrijmaken.';
    const moveToSeat = (resultId, targetIndex) => {
      if (missing || !isValidResult(resultId) || targetIndex < 0 || targetIndex >= answers.length) return;
      const previousIndex = answers.indexOf(resultId);
      const displaced = answers[targetIndex];
      answers[targetIndex] = resultId;
      if (previousIndex >= 0 && previousIndex !== targetIndex) answers[previousIndex] = displaced && displaced !== resultId ? displaced : null;
      saveQuizProgress();
      renderCustomGame();
    };
    const seats = document.createElement('ol');
    seats.className = 'rank-seats';
    activeQuiz.rankSeats.forEach((seat, index) => {
      const row = document.createElement('li');
      row.className = answers[index] && answers[index] !== missingAnswer ? 'is-filled' : '';
      row.dataset.seatIndex = String(index);
      const label = document.createElement('span');
      label.textContent = seat.label;
      if (isSteering && seat.help) {
        const help = document.createElement('small');
        help.textContent = seat.help;
        label.append(help);
      }
      const chosen = activeQuiz.gameOptions.find(option => option.result === answers[index]);
      const value = document.createElement('strong');
      value.textContent = chosen ? (isSteering ? steeringLabel(chosen.result) : chosen.label) : isSteering ? 'Nog geen reactie gekozen' : 'Nog leeg';
      if (chosen && isSteering) value.dataset.steeringResult = chosen.result;
      row.append(label, value);
      if (isSteering) {
        const seatShape = document.createElement('i');
        seatShape.className = 'steering-seat-shape';
        seatShape.setAttribute('aria-hidden', 'true');
        row.prepend(seatShape);
        row.addEventListener('dragover', event => {
          event.preventDefault();
          row.classList.add('is-dragover');
          event.dataTransfer.dropEffect = 'move';
        });
        row.addEventListener('dragleave', () => row.classList.remove('is-dragover'));
        row.addEventListener('drop', event => {
          event.preventDefault();
          row.classList.remove('is-dragover');
          moveToSeat(event.dataTransfer.getData('text/plain'), index);
        });
      }
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
    if (isSteering) {
      const castHeading = document.createElement('div');
      castHeading.className = 'steering-section-heading';
      const castStep = document.createElement('span');
      castStep.textContent = '02';
      const castCopy = document.createElement('div');
      const castTitle = document.createElement('strong');
      castTitle.textContent = 'Bekijk dezelfde situatie vanuit vier hoeken';
      const castHelp = document.createElement('small');
      castHelp.textContent = 'Iedere kaart stelt één andere vraag over het concrete moment uit stap 1. Schrijf het eerste eerlijke antwoord dat in je opkomt; één zin is genoeg.';
      castCopy.append(castTitle, castHelp);
      castHeading.append(castStep, castCopy);
      cast.append(castHeading);
    }
    activeQuiz.gameOptions.forEach(option => {
      const card = makeCustomCard(option, 'custom-card--ranking');
      const usedAt = answers.indexOf(option.result);
      if (isSteering) {
        card.draggable = !missing;
        card.dataset.voice = option.result;
        card.setAttribute('aria-label', `${steeringLabel(option.result)}. Sleepbaar naamkaartje.`);
        card.addEventListener('dragstart', event => {
          event.dataTransfer.setData('text/plain', option.result);
          event.dataTransfer.effectAllowed = 'move';
          card.classList.add('is-dragging');
        });
        card.addEventListener('dragend', () => card.classList.remove('is-dragging'));
        const oldTitle = card.querySelector('h3');
        const nameLabel = document.createElement('label');
        nameLabel.className = 'steering-name';
        const nameHint = document.createElement('span');
        nameHint.textContent = 'Herschrijf dit naamkaartje';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.maxLength = 48;
        nameInput.value = steeringLabel(option.result);
        nameInput.setAttribute('aria-label', `Naam van ${option.label}`);
        nameInput.addEventListener('pointerdown', event => event.stopPropagation());
        nameInput.addEventListener('keydown', event => event.stopPropagation());
        nameInput.addEventListener('input', event => {
          steeringDraft.labels[option.result] = event.currentTarget.value.slice(0, 48);
          const placedName = seats.querySelector(`[data-steering-result="${option.result}"]`);
          if (placedName) placedName.textContent = steeringLabel(option.result);
          saveQuizProgress();
        });
        nameLabel.append(nameHint, nameInput);
        oldTitle.replaceWith(nameLabel);
        const messageLabel = document.createElement('label');
        messageLabel.className = 'steering-message';
        const messagePrompt = document.createElement('span');
        messagePrompt.textContent = option.prompt || 'Wat merk je vanuit deze hoek aan de situatie?';
        const messageInput = document.createElement('textarea');
        messageInput.rows = 2;
        messageInput.maxLength = 160;
        messageInput.placeholder = option.placeholder || 'Eén korte zin…';
        messageInput.value = steeringMessage(option.result);
        messageInput.setAttribute('aria-label', `${steeringLabel(option.result)} over deze situatie`);
        messageInput.addEventListener('pointerdown', event => event.stopPropagation());
        messageInput.addEventListener('keydown', event => event.stopPropagation());
        messageInput.addEventListener('input', event => {
          steeringDraft.messages[option.result] = event.currentTarget.value.slice(0, 160);
          saveQuizProgress();
          const emptyCount = steeringMissingMessages().length;
          document.querySelector('[data-custom-status]').textContent = emptyCount
            ? `Beantwoord nog ${emptyCount} van de vier vragen bij stap 2.`
            : answers.some(value => value === null)
              ? 'De vier zinnen staan. Geef iedere reactie nu een stoel via het menu op de kaart.'
              : 'De auto is ingevuld. Je kunt de spiegel openen of nog van stoel wisselen.';
          syncSteeringFinishControl();
          syncSteeringSeatGate();
        });
        messageLabel.append(messagePrompt, messageInput);
        nameLabel.after(messageLabel);
      }
      if (isSteering) {
        const placement = document.createElement('label');
        placement.className = 'steering-placement';
        const placementTitle = document.createElement('span');
        placementTitle.textContent = 'Geef deze reactie een stoel';
        const placementSelect = document.createElement('select');
        placementSelect.disabled = missing;
        placementSelect.setAttribute('aria-label', `Stoel voor ${steeringLabel(option.result)}`);
        const openOption = document.createElement('option');
        openOption.value = '';
        openOption.textContent = 'Kies een stoel…';
        placementSelect.append(openOption, ...activeQuiz.rankSeats.map((seat, index) => {
          const seatOption = document.createElement('option');
          seatOption.value = String(index);
          seatOption.textContent = seat.label;
          return seatOption;
        }));
        placementSelect.value = usedAt >= 0 ? String(usedAt) : '';
        placementSelect.addEventListener('pointerdown', event => event.stopPropagation());
        placementSelect.addEventListener('change', event => {
          if (event.currentTarget.value === '') {
            const occupied = answers.indexOf(option.result);
            if (occupied >= 0) {
              answers[occupied] = null;
              saveQuizProgress();
              renderCustomGame();
            }
            return;
          }
          moveToSeat(option.result, Number(event.currentTarget.value));
        });
        placement.append(placementTitle, placementSelect);
        card.append(placement);
      } else {
        const choose = document.createElement('button');
        choose.type = 'button';
        choose.disabled = missing || usedAt >= 0 || nextSeat < 0;
        choose.textContent = usedAt >= 0 ? activeQuiz.rankSeats[usedAt].label : nextSeat >= 0 ? `Zet bij: ${activeQuiz.rankSeats[nextSeat].label}` : 'Geplaatst';
        choose.addEventListener('click', () => {
          burstFromElement(choose, option.symbol, 6);
          const empty = answers.findIndex(value => value === null);
          if (empty >= 0) moveToSeat(option.result, empty);
        });
        card.append(choose);
      }
      cast.append(card);
    });
    if (isSteering) {
      const setup = document.createElement('section');
      setup.className = 'steering-setup';
      const setupHeading = document.createElement('div');
      setupHeading.className = 'steering-section-heading';
      const setupStep = document.createElement('span');
      setupStep.textContent = '01';
      const setupCopy = document.createElement('div');
      const setupTitle = document.createElement('strong');
      setupTitle.textContent = 'Zet één scène stil';
      const setupHint = document.createElement('small');
      setupHint.textContent = 'Niet je hele leven of relatie. Neem één moment waar je iets moet zeggen, kiezen of doen.';
      setupCopy.append(setupTitle, setupHint);
      setupHeading.append(setupStep, setupCopy);
      const starters = document.createElement('div');
      starters.className = 'steering-starters';
      const starterTitle = document.createElement('strong');
      starterTitle.textContent = 'Vastgelopen? Kies een beginzin:';
      starters.append(starterTitle);
      ['Ik moet iemand zeggen dat…', 'Ik twijfel of ik…', 'Ik blijf hangen in…', 'Ik wil iets doen, maar…', 'Iemand verwacht van mij dat…'].forEach(starter => {
        const starterButton = document.createElement('button');
        starterButton.type = 'button';
        starterButton.textContent = starter;
        starterButton.addEventListener('click', () => {
          if (!steeringDraft.problem.trim() || window.confirm('Je huidige rit vervangen door deze beginzin?')) {
            steeringDraft.problem = starter;
            problemInput.value = starter;
            problemInput.focus();
            problemInput.setSelectionRange(starter.length, starter.length);
            saveQuizProgress();
            document.querySelector('[data-custom-status]').textContent = steeringMissingMessages().length
              ? `Goed begin. Maak je zin concreet en beantwoord daarna de vier vragen.`
              : 'De vier antwoorden staan. Geef iedere reactie nu een stoel.';
            syncSteeringFinishControl();
          }
        });
        starters.append(starterButton);
      });
      const problemLabel = document.createElement('label');
      const problemTitle = document.createElement('span');
      problemTitle.textContent = '1A · Welk concrete moment wil je bekijken? · verplicht';
      const problemHelp = document.createElement('small');
      problemHelp.textContent = 'Wie is erbij, wat moet er gebeuren en wanneer? Schrijf alsof een camera het begin van het moment moet herkennen.';
      const problemInput = document.createElement('input');
      problemInput.type = 'text';
      problemInput.maxLength = 160;
      problemInput.placeholder = 'Bijvoorbeeld: ik moet mijn collega zeggen dat ik die extra taak niet overneem';
      problemInput.value = steeringDraft.problem;
      problemInput.addEventListener('input', event => {
        steeringDraft.problem = event.currentTarget.value.slice(0, 160);
        const windscreenScene = document.querySelector('.steering-windscreen strong');
        if (windscreenScene) windscreenScene.textContent = steeringDraft.problem.trim() || 'Nog geen situatie ingevuld';
        saveQuizProgress();
        const emptyCount = steeringMissingMessages().length;
        document.querySelector('[data-custom-status]').textContent = steeringDraft.problem.trim()
          ? emptyCount ? `Je situatie staat. Beantwoord nu nog ${emptyCount} van de vier vragen bij stap 2.` : 'De vier zinnen staan. Geef iedere reactie nu een stoel.'
          : 'Begin bij 1A: welk concrete moment wil je bekijken? Eén of twee zinnen zijn genoeg.';
        syncSteeringFinishControl();
        syncSteeringSeatGate();
      });
      problemLabel.append(problemTitle, problemHelp, problemInput);
      const aimLabel = document.createElement('label');
      const aimTitle = document.createElement('span');
      aimTitle.textContent = '1B · Wat zou je aan het einde graag gedaan of besloten hebben? · optioneel';
      const aimHelp = document.createElement('small');
      aimHelp.textContent = 'Geen perfecte afloop — alleen wat je aan het einde graag gedaan, gezegd of besloten wilt hebben.';
      const aimInput = document.createElement('input');
      aimInput.type = 'text';
      aimInput.maxLength = 140;
      aimInput.placeholder = 'Bijvoorbeeld: duidelijk zijn zonder mezelf weg te cijferen';
      aimInput.value = steeringDraft.aim;
      aimInput.addEventListener('input', event => {
        steeringDraft.aim = event.currentTarget.value.slice(0, 140);
        saveQuizProgress();
      });
      aimLabel.append(aimTitle, aimHelp, aimInput);
      const songLabel = document.createElement('label');
      const songTitle = document.createElement('span');
      songTitle.textContent = 'Extra · Welk nummer speelt er op de radio? · optioneel en volstrekt onwetenschappelijk';
      const songHelp = document.createElement('small');
      songHelp.textContent = 'De echte of denkbeeldige soundtrack bij deze situatie.';
      const songInput = document.createElement('input');
      songInput.type = 'text';
      songInput.maxLength = 100;
      songInput.placeholder = 'Titel + artiest, of: dreigende vioolmuziek';
      songInput.value = steeringDraft.song;
      songInput.addEventListener('input', event => {
        steeringDraft.song = event.currentTarget.value.slice(0, 100);
        saveQuizProgress();
      });
      songLabel.append(songTitle, songHelp, songInput);
      setup.append(setupHeading, starters, problemLabel, aimLabel, songLabel);
      const seatPanel = document.createElement('section');
      seatPanel.className = `steering-seats${seatsReady ? '' : ' is-locked'}`;
      const seatHeading = document.createElement('div');
      seatHeading.className = 'steering-section-heading';
      const seatStep = document.createElement('span');
      seatStep.textContent = '03';
      const seatCopy = document.createElement('div');
      const seatTitle = document.createElement('strong');
      seatTitle.textContent = 'Geef iedere reactie een plaats in de auto';
      const seatHelp = document.createElement('small');
      seatHelp.textContent = 'Aan het stuur zet je je automatische reactie. Als copiloot kies je informatie die je bewust wilt gebruiken. De andere twee reacties mogen mee zonder te beslissen.';
      seatCopy.append(seatTitle, seatHelp);
      seatHeading.append(seatStep, seatCopy);
      const placementTip = document.createElement('p');
      placementTip.className = 'steering-placement-tip';
      placementTip.innerHTML = seatsReady
        ? '<strong>Kies op iedere kaart een stoel via het menu.</strong> Slepen mag ook, maar hoeft niet.'
        : `<strong>Deze stap staat nog even geparkeerd.</strong> ${steeringDraft.problem.trim() ? `Beantwoord eerst nog ${emptyMessages.length} van de vier vragen hierboven.` : 'Vul eerst je concrete situatie en de vier vragen hierboven in.'}`;
      const cabin = document.createElement('div');
      cabin.className = 'steering-cabin';
      cabin.hidden = !seatsReady;
      const carNose = document.createElement('div');
      carNose.className = 'steering-car-nose';
      carNose.setAttribute('aria-hidden', 'true');
      carNose.innerHTML = '<i></i><strong>STUURTAFEL</strong><i></i>';
      const windscreen = document.createElement('div');
      windscreen.className = 'steering-windscreen';
      const windscreenLabel = document.createElement('span');
      windscreenLabel.textContent = 'Voorruit · jouw situatie';
      const windscreenScene = document.createElement('strong');
      windscreenScene.textContent = steeringDraft.problem.trim() || 'Nog geen situatie ingevuld';
      windscreen.append(windscreenLabel, windscreenScene);
      cabin.append(carNose, windscreen, seats);
      seatPanel.append(seatHeading, placementTip, cabin);
      customBoard.replaceChildren(setup, cast, seatPanel);
    } else customBoard.replaceChildren(seats, cast);
    if (isSteering) syncSteeringFinishControl();
    else customFinishButton.disabled = !missing && answers.some(value => value === null);
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
    syncSteeringFinishControl();
    syncSteeringSeatGate();
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
        const question = activeQuiz.questions[questionIndex];
        const chosen = value && typeof value === 'object' ? [question?.options.find(item => item.id === value.first), question?.secondOptions.find(item => item.id === value.second)].filter(Boolean) : [];
        if (chosen.length !== 2) return;
        answered += 1;
        chosen.forEach(option => Object.entries(option.signals || {}).forEach(([key, amount]) => { if (key in scores) scores[key] += amount; }));
      });
      const maxima = Object.fromEntries(scoreKeys.map(key => [key, activeQuiz.questions.reduce((sum, question) => sum + Math.max(0, ...question.options.map(option => Number(option.signals?.[key]) || 0)) + Math.max(0, ...question.secondOptions.map(option => Number(option.signals?.[key]) || 0)), 0)]));
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
      const names = answers.filter(value => isValidResult(value)).map((id, index) => `${activeQuiz.rankSeats[index].label}: ${activeQuiz.id === 'wie-zit-aan-het-stuur' ? steeringLabel(id) : activeQuiz.results[id].title}`);
      if (activeQuiz.id === 'wie-zit-aan-het-stuur') {
        return `Jouw tijdelijke bezetting was ${names.join(' · ')}. De bestuurder voorspelt je automatische reactie; de andere plaatsen beschrijven welke informatie je wel hoort maar niet noodzakelijk volgt.`;
      }
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

  function supportNarrative() {
    const traces = [];
    const counts = {};
    answers.forEach((answer, index) => {
      if (!answer || answer === missingAnswer) return;
      const question = activeQuiz.questions[index];
      const first = question.options.find(option => option.id === answer.first);
      const second = question.secondOptions.find(option => option.id === answer.second);
      if (!first || !second) return;
      [...(first.movements || []), ...(second.movements || [])].forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      traces.push({ question, first, second });
    });
    const ordered = group => Object.entries(activeQuiz.movements).filter(([, item]) => item.group === group).map(([id, item]) => ({ id, ...item, count:counts[id] || 0 })).filter(item => item.count).sort((a, b) => b.count - a.count).slice(0, 3);
    return { traces, helpful:ordered('helpful'), pressure:ordered('pressure') };
  }

  function movementCards(items, fallback) {
    if (!items.length) {
      const p = document.createElement('p'); p.textContent = fallback; return [p];
    }
    return items.map(item => {
      const p = document.createElement('p');
      const strong = document.createElement('strong'); strong.textContent = item.label;
      p.append(strong, document.createTextNode(item.group === 'helpful' ? ' kwam in meerdere keuzes terug. De passendheid hing telkens af van wat de ander daarna liet zien.' : ' verscheen in minstens één scène. Dat is geen gebrek: dezelfde beweging kan bij urgentie of duidelijke expertise juist bruikbaar zijn.'));
      return p;
    });
  }

  function renderSupportNarrative(narrative) {
    const dashboard = document.querySelector('[data-support-dashboard]');
    dashboard.hidden = false;
    document.querySelector('[data-support-helpful]').replaceChildren(...movementCards(narrative.helpful, 'Er sprong geen enkele vaste steunbeweging uit. Je keuzes wisselden sterk met de context.'));
    document.querySelector('[data-support-pressure]').replaceChildren(...movementCards(narrative.pressure, 'Geen drukbeweging kwam duidelijk terug. Dat bewijst niet hoe je in een snel, persoonlijk of werkelijk onveilig gesprek zou reageren.'));
    const limits = [
      'Je koos na rustig lezen; een spontaan gesprek kan anders verlopen.',
      'De gesprekspartner reageerde hier duidelijk. In het echt blijft behoefte vaak dubbelzinniger.',
      'Zes scènes zeggen niets definitiefs over langdurige relationele patronen.',
      'Een andere persoon kan op precies dezelfde woorden anders reageren.'
    ];
    document.querySelector('[data-support-limits]').replaceChildren(...limits.map(text => { const p=document.createElement('p'); p.textContent=text; return p; }));
    const preferred = narrative.traces.filter(trace => trace.second.recovery || (trace.first.movements || []).some(id => activeQuiz.movements[id]?.group === 'pressure'));
    const lookbacks = [...preferred, ...narrative.traces.filter(trace => !preferred.includes(trace))].slice(0, 2);
    document.querySelector('[data-support-lookbacks]').replaceChildren(...lookbacks.map(trace => {
      const article = document.createElement('article');
      const span = document.createElement('span'); span.textContent = trace.question.scene;
      const quote = document.createElement('blockquote'); quote.textContent = trace.first.text;
      const reaction = document.createElement('p'); reaction.textContent = `De ander reageerde in deze simulatie: ${trace.first.reply}`;
      const effect = document.createElement('p'); effect.textContent = trace.first.effect;
      const follow = document.createElement('strong'); follow.textContent = `Daarna koos je: ${trace.second.text || trace.first.repair}`;
      const caution = document.createElement('small'); caution.textContent = trace.first.missing;
      article.append(span, quote, reaction, effect, follow, caution);
      return article;
    }));
  }

  function supportNarrativeResult() {
    return {
      id:'support-map', kicker:'Jouw terugblik', title:'Zes gesprekken, meerdere manieren van helpen.',
      summary:'Je keuzes vormden geen vast luistertype. Ze lieten zien hoe erkenning, praktische hulp, verantwoordelijkheid, herstel en grenzen anders uitpakken naargelang de situatie.',
      strength:'', friction:'', counter:'',
      experiment:'Vraag in één veilig gesprek vóór je helpt welke vorm van steun nu past.', readHref:'', readTitle:'', readLabel:'', readReason:''
    };
  }

  function steeringResultCopy() {
    const driverId = answers[0];
    const driver = steeringLabel(driverId);
    const base = activeQuiz.results[driverId];
    const problem = steeringDraft.problem.trim();
    const driverMessage = steeringMessage(driverId).trim();
    const copilot = steeringLabel(answers[1]);
    const aim = steeringDraft.aim.trim();
    return {
      id:driverId,
      kicker:'Momentopname van jouw nachtrit',
      title:`Vandaag rijdt ${driver}.`,
      summary:`Voor “${problem}” verwacht je dat ${driver} op automatische piloot het meeste invloed krijgt. De bestuurder zegt: “${driverMessage}” Dit is geen persoonlijkheidsoordeel, maar een werkhypothese over één situatie.`,
      strength:`${base.strength} ${copilot} zit ernaast als bewust gekozen informatiebron.${aim ? ` Je gewenste richting was: “${aim}”.` : ''}`,
      friction:'Een geestige metafoor kan te netjes worden. Werkelijke macht, geld, veiligheid, ziekte, zorglast en andere omstandigheden verdwijnen niet doordat je van perspectief wisselt.',
      counter:`Als deze rit van iemand was van wie je houdt: zou je dan nog steeds ${driver} laten rijden, of de copiloot één stoel laten opschuiven?`,
      experiment:'Noem jezelf één keer bij je voornaam. Vat daarna de situatie, het nuttige signaal en één haalbare volgende stap samen in drie zinnen. Geen seizoensfinale nodig.',
      readHref:'onderwerpen/persoonlijkheid.html',
      readTitle:'Persoonlijkheid',
      readLabel:'Lees waarom geen enkele stoel je hele persoonlijkheid is →',
      readReason:'Dit dossier zet terugkerende trekken naast context, doelen en levensverhalen. Zo blijft de Stuurtafel een perspectiefproef en geen typetest.'
    };
  }

  function renderSteeringMirror() {
    if (activeQuiz.id !== 'wie-zit-aan-het-stuur' || resultMeta.noMatch) {
      steeringMirror.hidden = true;
      return;
    }
    steeringMirror.hidden = false;
    const problem = steeringDraft.problem.trim();
    const aim = steeringDraft.aim.trim();
    const song = steeringDraft.song.trim();
    const problemBox = steeringMirror.querySelector('[data-steering-result-problem]');
    problemBox.innerHTML = '';
    const problemLabel = document.createElement('span');
    problemLabel.textContent = 'De rit';
    const problemCopy = document.createElement('strong');
    problemCopy.textContent = problem || 'Je liet het concrete probleem open — ook dat zegt iets over de rit.';
    problemBox.append(problemLabel, problemCopy);
    if (aim) {
      const aimLabel = document.createElement('span');
      aimLabel.textContent = 'Gewenste richting';
      const aimCopy = document.createElement('strong');
      aimCopy.textContent = aim;
      problemBox.append(aimLabel, aimCopy);
    }
    const cast = steeringMirror.querySelector('[data-steering-result-cast]');
    cast.replaceChildren(...answers.map((id, index) => {
      const item = document.createElement('li');
      const seat = document.createElement('span');
      seat.textContent = activeQuiz.rankSeats[index].label;
      const voice = document.createElement('strong');
      voice.textContent = steeringLabel(id);
      const message = document.createElement('em');
      message.textContent = steeringMessage(id);
      item.append(seat, voice, message);
      return item;
    }));
    const songBox = steeringMirror.querySelector('[data-steering-result-song]');
    songBox.innerHTML = '';
    const songLabel = document.createElement('span');
    songLabel.textContent = 'Op de radio';
    const songCopy = document.createElement('strong');
    songCopy.textContent = song || 'Vandaag rijdt de wagen opvallend genoeg zonder soundtrack.';
    songBox.append(songLabel, songCopy);
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
      const support = supportNarrative();
      activeResult = supportNarrativeResult();
      selectedResultId = activeResult.id;
      document.querySelector('[data-result-kicker]').textContent = activeResult.kicker;
      document.querySelector('[data-result-title]').textContent = activeResult.title;
      document.querySelector('[data-result-summary]').textContent = activeResult.summary;
      document.querySelector('[data-result-basis]').textContent = `Gebaseerd op ${resultMeta.answered} van de ${activeQuiz.questions.length} gesprekken, telkens met twee beurten. Dit is geen vaardigheidsscore.`;
      document.querySelector('[data-result-strength]').textContent = activeResult.strength;
      document.querySelector('[data-result-friction]').textContent = activeResult.friction;
      document.querySelector('[data-result-counter]').textContent = activeResult.counter;
      document.querySelector('[data-result-experiment]').textContent = activeResult.experiment;
      const gridLabels = document.querySelectorAll('.mini-result__grid article>span');
      if (gridLabels[0]) gridLabels[0].textContent = 'Wat je al inzet';
      if (gridLabels[1]) gridLabels[1].textContent = 'Wat onder druk kan schuren';
      renderSupportNarrative(support);
      renderReading(activeResult);
      syncReactionControls();
      saveQuizProgress('result');
      return;
    }
    document.querySelector('[data-support-dashboard]').hidden = true;
    steeringMirror.hidden = true;
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
    activeResult = resultMeta.noMatch ? openResult() : activeQuiz.id === 'wie-zit-aan-het-stuur' ? steeringResultCopy() : { id: resultId, ...activeQuiz.results[resultId] };
    document.querySelector('[data-result-kicker]').textContent = activeResult.kicker;
    document.querySelector('[data-result-title]').textContent = activeResult.title;
    document.querySelector('[data-result-summary]').textContent = activeResult.summary;
    document.querySelector('[data-result-basis]').textContent = describeBasis(resultMeta, activeResult);
    document.querySelector('[data-result-strength]').textContent = activeResult.strength;
    document.querySelector('[data-result-friction]').textContent = activeResult.friction;
    document.querySelector('[data-result-counter]').textContent = activeResult.counter;
    document.querySelector('[data-result-experiment]').textContent = activeResult.experiment;
    renderSteeringMirror();
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
        exerciseData:activeQuiz.id === 'wie-zit-aan-het-stuur' ? {
          problem:steeringDraft.problem.trim(),
          aim:steeringDraft.aim.trim(),
          song:steeringDraft.song.trim(),
          seats:answers.map((id, index) => ({
            seat:activeQuiz.rankSeats[index]?.label || '',
            voice:steeringLabel(id),
            message:steeringMessage(id).trim()
          }))
        } : undefined,
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
  document.querySelector('[data-start-steering-game]')?.addEventListener('click', () => {
    playSteeringEngine();
    steeringIntro.hidden = true;
    customGame.hidden = false;
    stage.setAttribute('aria-labelledby', 'mini-custom-title');
    renderCustomGame();
    saveQuizProgress();
  });
  steeringBackButton?.addEventListener('click', () => {
    customGame.hidden = true;
    steeringIntro.hidden = false;
    stage.setAttribute('aria-labelledby', 'steering-intro-title');
    if (steeringStartLabel) steeringStartLabel.textContent = 'VERDER';
    saveQuizProgress();
    steeringIntro.focus?.({ preventScroll: true });
    scrollTop();
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
    if (activeQuiz.mode === 'support' && supportRound === 2) {
      supportRound = 1;
      saveQuizProgress();
      renderQuestion();
      return;
    }
    if (current > 0) {
      current -= 1;
      if (activeQuiz.mode === 'support') supportRound = 2;
      saveQuizProgress();
      renderQuestion();
    }
  });
  document.querySelector('[data-mini-next]').addEventListener('click', () => {
    if (activeQuiz.mode === 'support') {
      const answer = answers[current];
      if (answer === missingAnswer) {
        supportRound = 2;
      } else if (supportRound === 1) {
        if (!answer?.first) return;
        supportRound = 2;
        saveQuizProgress();
        renderQuestion();
        return;
      } else if (!answer?.second) return;
    } else if (!isAnswered(answers[current])) return;
    if (current < activeQuiz.questions.length - 1) {
      current += 1;
      if (activeQuiz.mode === 'support') supportRound = 1;
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
  if (requestedQuiz === 'waar-komt-je-ja-vandaan') location.replace('speelhal/laat-maar.html');
  else if (requestedQuiz && quizzes.some(quiz => quiz.id === requestedQuiz)) startQuiz(requestedQuiz);
})();
