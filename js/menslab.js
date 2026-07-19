(function () {
  const checks = [...document.querySelectorAll('[data-week-days] input[type="checkbox"]')];
  const score = document.querySelector('[data-week-score]');
  const bar = document.querySelector('[data-week-bar]');
  const note = document.querySelector('[data-week-note]');
  const noteStatus = document.querySelector('[data-week-note-status]');
  const completion = document.querySelector('[data-week-complete]');
  const nextIntention = document.querySelector('[data-next-intention]');
  const fileStatus = document.querySelector('[data-track-file-status]');
  const progressStorageKey = 'menslab-progress-v3';
  const previousStorageKey = 'menslab-progress-v2';
  const legacyStorageKey = 'menslab-week-progress-v1';
  const siteStorageKeys = [
    progressStorageKey, previousStorageKey, legacyStorageKey,
    'onwijze-atlas-footprints-v1', 'onwijze-reading-history-v1',
    'beestenquiz-progress-v2', 'quizkast-progress-v1', 'dieptequiz-ja-progress-v1',
    'onwijze-veranderroute-v2', 'onwijze-veranderroute-v1', 'menslab-exercise-drafts-v1',
    'onwijze-profile-v1', 'onwijze-next-door-v1', 'onwijze-laatste-spoor', 'onwijze-ingang-gezien'
  ];
  const movementLabels = ['Opmerken', 'Vertragen', 'Omdraaien', 'Veranderen', 'Benoemen', 'Vragen', 'Kiezen'];
  const questions = [
    'Wanneer veranderde je voor het laatst écht van mening — en wat maakte dat mogelijk?',
    'Welke eigenschap veroordeel je snel bij anderen, maar herken je soms ook bij jezelf?',
    'Wat doe je uit gewoonte terwijl het eigenlijk niet meer bij je past?',
    'In welke situatie probeer je vooral sterk over te komen terwijl je behoefte hebt aan zachtheid?',
    'Welke oude versie van jezelf probeer je nog altijd tevreden te houden?',
    'Wanneer voelt gelijk krijgen belangrijker dan elkaar begrijpen?',
    'Wat zou je proberen als mislukken niets over jouw waarde zou zeggen?',
    'Welke grens merk je meestal pas op nadat iemand eroverheen is gegaan?',
    'Wat noem je uitstel, terwijl het misschien bescherming is?',
    'Welke overtuiging over jezelf heb je nog nooit echt onderzocht?',
    'Waar verlang je naar dat je moeilijk hardop durft te vragen?',
    'Welke kleine verandering zou jouw dagelijks leven één procent lichter maken?'
  ];
  const dailyExperiments = [
    { title:'Vind de trekker', prompt:'Onderzoek één gewoonte die je vandaag werkelijk wilt onderbreken. Niet met wilskracht, maar door de situatie vlak vóór de automatische reactie te veranderen.', aim:'de prikkel vóór automatisch gedrag herkennen en één contextdetail aanpassen.', steps:['Kies één lichte, terugkerende reactie.','Benoem waar, wanneer of na welke prikkel ze meestal begint.','Verander vóór één volgend moment één zichtbaar contextdetail en probeer je alternatief eenmaal.'], mechanism:'Gewoonten worden mede opgeroepen door terugkerende contextprikkels. Onderzoek laat zien dat een contextverandering gewoon gedrag kan verstoren en zo tijdelijk meer ruimte voor een bewuste keuze kan geven.', boundary:'Dit is geen bewijs dat één omweg een gewoonte verandert. Herhaling, haalbaarheid en omstandigheden blijven bepalend.', sources:[['Wood, Tam & Guerrero Witt (2005) — context en gewoonte','https://pubmed.ncbi.nlm.nih.gov/15982113/']], expectationQuestion:'Welke concrete prikkel verwacht je vlak vóór je automatische reactie?', expectationPlaceholder:'Bijvoorbeeld: zodra ik mijn laptop sluit, grijp ik zonder nadenken naar mijn telefoon.', observationQuestion:'Wat gebeurde er toen je precies die situatie één keer veranderde?', observationPlaceholder:'Noteer gedrag: wat was de prikkel, wat deed je en waar nam de oude route het over?', nextQuestion:'Welke contextverandering test je bij de volgende herhaling?', nextPlaceholder:'Bijvoorbeeld: als ik mijn laptop sluit, leg ik mijn telefoon eerst buiten handbereik.' },
    { title:'Tien seconden ruimte', prompt:'Bouw bij één niet-dringend bericht een korte pauze in tussen impuls en antwoord. Gebruik die pauze om te kiezen, niet om het perfecte antwoord te vinden.', aim:'een kritieke situatie vooraf koppelen aan een kleine, gekozen reactie.', steps:['Kies één soort niet-dringend bericht.','Maak je plan: “Als ik de drang voel meteen te antwoorden, dan leg ik mijn hand tien seconden naast mijn telefoon.”','Voer het plan eenmaal uit en kies daarna bewust: antwoorden, later antwoorden of niets doen.'], mechanism:'Als-danplannen koppelen een herkenbare situatie aan vooraf gekozen gedrag. Meta-analyses vinden gemiddeld betere doelrealisatie, al verschillen de effecten per doel, persoon en context.', boundary:'Tien seconden is hier een praktische proefduur, geen wetenschappelijk bewezen magisch getal en geen behandeling voor impulsiviteit.', sources:[['Gollwitzer & Sheeran (2006) — meta-analyse als-danplannen','https://www.socmot.uni-konstanz.de/publications/implementation-intentions-and-goal-achievement-meta-analysis-effects-and-processes']], expectationQuestion:'Wat verwacht je dat de pauze bij dit specifieke bericht oproept?', expectationPlaceholder:'Noem de situatie en je vermoedelijke eerste impuls.', observationQuestion:'Heb je de afgesproken pauze uitgevoerd, en welke keuze volgde erop?', observationPlaceholder:'Beschrijf wat je deed; rustiger voelen is geen vereiste.', nextQuestion:'Wil je hetzelfde plan behouden, kleiner maken of aanpassen?', nextPlaceholder:'Schrijf één aangepaste als-danzin.' },
    { title:'De eerste twee minuten', prompt:'Kies iets nuttigs dat je uitstelt en voer alleen de kleinste zichtbare start uit. De opdracht is beginnen, niet afwerken.', aim:'de afstand tussen bedoeling en eerste waarneembare handeling verkleinen.', steps:['Kies één taak die licht en veilig genoeg is.','Maak de start zo klein dat ze binnen ongeveer twee minuten past.','Bepaal waar en wanneer je die start vandaag uitvoert — en doe alleen dat eerste stukje.'], mechanism:'Concreet plannen wanneer, waar en hoe je begint, helpt bedoelingen vaker in gedrag om te zetten. De limiet van twee minuten is een ontwerpkeuze om de proef klein te houden.', boundary:'Een kleine start lost geen uitputting, depressie, onveiligheid of structurele overbelasting op. Stop als de taak niet licht of veilig is.', sources:[['Gollwitzer & Sheeran (2006) — planning en doelrealisatie','https://www.socmot.uni-konstanz.de/publications/implementation-intentions-and-goal-achievement-meta-analysis-effects-and-processes']], expectationQuestion:'Welke kleinste zichtbare start ga je waar en wanneer uitvoeren?', expectationPlaceholder:'Bijvoorbeeld: na de lunch open ik het document en schrijf ik alleen de titel.', observationQuestion:'Begon je op het gekozen moment? Wat hielp of blokkeerde de eerste handeling?', observationPlaceholder:'Noteer uitvoering en obstakel, niet je karakteroordeel.', nextQuestion:'Wat is de eerstvolgende even kleine stap?', nextPlaceholder:'Eén werkwoord en één concreet moment zijn genoeg.' },
    { title:'De als-danbrug', prompt:'Vertaal één vaag voornemen naar een herkenbaar moment en één uitvoerbare reactie. Test de zin vandaag eenmaal in het echt.', aim:'vooraf beslissen wat je doet wanneer een kans of hindernis verschijnt.', steps:['Kies iets wat je al wílt doen; deze proef maakt geen motivatie uit het niets.','Schrijf: “Als [concrete situatie], dan [klein gedrag].”','Zorg dat de situatie vandaag kan voorkomen en test het plan eenmaal.'], mechanism:'Implementatie-intenties zijn als-danplannen die een kritieke situatie aan doelgericht gedrag koppelen. Het gemiddelde effect is positief, maar een plan werkt niet automatisch wanneer het doel onduidelijk, onhaalbaar of niet echt gewenst is.', boundary:'Een zin is geen garantie. Zie mislukken als informatie over de prikkel, de stapgrootte of de omstandigheden.', sources:[['Gollwitzer & Sheeran (2006) — meta-analyse als-danplannen','https://www.socmot.uni-konstanz.de/publications/implementation-intentions-and-goal-achievement-meta-analysis-effects-and-processes']], expectationQuestion:'Welke exacte als-danzin ga je vandaag testen?', expectationPlaceholder:'Als … gebeurt, dan doe ik …', observationQuestion:'Verscheen de gekozen situatie, en volgde het geplande gedrag?', observationPlaceholder:'Ja, deels, nee of de situatie kwam niet — met één concrete toelichting.', nextQuestion:'Welke aanpassing maakt je volgende test realistischer?', nextPlaceholder:'Verfijn de prikkel of maak het gedrag kleiner.' },
    { title:'Eerst de vraag', prompt:'Vraag in één veilig gesprek of de ander wil dat je luistert, vragen stelt of meedenkt. Volg het antwoord vijf minuten zonder van rol te wisselen.', aim:'steun afstemmen op wat de ander op dit moment als helpend aangeeft.', steps:['Kies een licht en veilig gesprek; niet een crisis of conflict met dwang.','Vraag: “Wil je dat ik luister, vragen stel of meedenk?”','Doe vijf minuten alleen wat de ander koos en vraag daarna of dat inderdaad hielp.'], mechanism:'Relatieonderzoek verbindt ervaren responsiviteit — zich begrepen, gewaardeerd en verzorgd voelen — met betere relationele uitkomsten. Deze precieze driekeuzezin is een praktische vertaling, niet zelf als interventie bewezen.', boundary:'Niet iedere ander weet of zegt wat die nodig heeft. Bij onveiligheid, controle of geweld is beter afstemmen geen passende oplossing en ligt de verantwoordelijkheid niet gelijk.', sources:[['Pauw et al. (2021) — responsiviteit in steuninteracties','https://pubmed.ncbi.nlm.nih.gov/33746855/'],['Selçuk et al. (2017) — responsiviteit en welzijn over tijd','https://pubmed.ncbi.nlm.nih.gov/28592909/']], expectationQuestion:'Wat hoop of vrees je dat er tussen jullie gebeurt wanneer je niet meteen invult wat de ander nodig heeft?', expectationPlaceholder:'Denk aan nabijheid, ongemak, duidelijkheid, afwijzing of jouw behoefte om nuttig te zijn.', observationQuestion:'Nadat je het werkelijk vroeg en vijf minuten probeerde: wat merkte je bij de ander, in de sfeer en in jezelf?', observationPlaceholder:'Beschrijf wat je waarnam. Ook geen merkbaar verschil is informatie.', nextQuestion:'Wat wil je in een volgend veilig gesprek herhalen of anders vragen?', nextPlaceholder:'Bijvoorbeeld: ik check na vijf minuten opnieuw in plaats van te blijven aannemen.' },
    { title:'Leg de weg vrij', prompt:'Verander één ding in je omgeving zodat gewenst gedrag makkelijker begint of ongewenst automatisch gedrag één extra stap vraagt.', aim:'de omgeving laten meewerken in plaats van alles aan wilskracht over te laten.', steps:['Kies één klein gedrag dat je al wilt uitvoeren.','Leg één voorwerp, herinnering of hulpmiddel klaar — of maak de oude route één stap minder direct.','Test vandaag of die verandering je eerste handeling werkelijk beïnvloedt.'], mechanism:'Gedragswetenschap beschrijft prikkels en herinrichting van de fysieke omgeving als afzonderlijke gedragstechnieken. Contextonderzoek laat bovendien zien dat stabiele prikkels gewoonten mee oproepen.', boundary:'De techniekencatalogus benoemt onderdelen, maar bewijst niet dat elke omgevingsaanpassing voor elk doel effectief is. Daarom test je gedrag, niet alleen een goed gevoel over je plan.', sources:[['Michie et al. (2008) — taxonomie gedragstechnieken','https://pubmed.ncbi.nlm.nih.gov/18624603/'],['Wood et al. (2005) — contextprikkels en gewoonte','https://pubmed.ncbi.nlm.nih.gov/15982113/']], expectationQuestion:'Welke omgevingsverandering verwacht je dat één gedrag makkelijker of minder automatisch maakt?', expectationPlaceholder:'Noem het voorwerp of de prikkel én het gedrag dat erop moet volgen.', observationQuestion:'Veranderde de omgeving je feitelijke eerste handeling?', observationPlaceholder:'Wat lag of stond anders, en wat deed je vervolgens werkelijk?', nextQuestion:'Wat laat je liggen, verplaats je of verwijder je voor de volgende test?', nextPlaceholder:'Kies één concrete aanpassing, geen volledige make-over.' },
    { title:'Kijk, leer, stel bij', prompt:'Doe één concrete actie die belangrijk voor je is, leg de uitvoering vast en pas daarna pas je volgende poging aan.', aim:'voortgang zichtbaar maken zonder van één resultaat een oordeel over jezelf te maken.', steps:['Kies één uitvoerbaar gedrag en voorspel of je het vandaag doet.','Voer het uit of merk eerlijk op dat het niet gebeurde.','Noteer één feit over de uitvoering en verander daarmee je volgende poging.'], mechanism:'Een meta-analyse van 138 experimentele studies vond dat interventies die voortgangsmonitoring verhogen gemiddeld ook doelrealisatie verbeteren; effecten waren groter wanneer uitkomsten fysiek werden vastgelegd.', boundary:'Meten helpt niet elk doel en kan bij sommige mensen druk of fixatie vergroten. Kies geen oefening rond eten, gewicht of dwang als registreren je klachten versterkt.', sources:[['Harkin et al. (2016) — meta-analyse voortgangsmonitoring','https://pubmed.ncbi.nlm.nih.gov/26479070/']], expectationQuestion:'Welk zichtbaar gedrag ga je vandaag wel of niet uitvoeren, en wanneer?', expectationPlaceholder:'Formuleer iets dat achteraf waarneembaar is.', observationQuestion:'Wat gebeurde er feitelijk — zonder verklaring of zelfoordeel?', observationPlaceholder:'Bijvoorbeeld: om 16.00 uur opende ik het bestand; ik werkte vier minuten.', nextQuestion:'Welke ene aanpassing test je de volgende keer?', nextPlaceholder:'Behoud wat hielp; wijzig één obstakel.' }
  ];
  const labKindLabels = { daily:'Proef van vandaag', brain:'Breinpret', together:'Jij & ik', reflection:'Reflectievraag', beast:'Beestenquiz', route:'Veranderroute', exercise:'Menslab-oefening' };
  const quizFitLabels = { raakt:'Raakt iets', deels:'Klopt gedeeltelijk', mist:'Mist iets belangrijks' };
  let currentQuestion = 0;
  let libraryMode = 'all';
  let libraryExpanded = false;
  let todayMode = '';
  let quizLibraryExpanded = false;
  let state = emptyState();

  function emptyState() {
    return {
      checks: new Array(checks.length).fill(false),
      note: '',
      startedAt: new Date().toISOString(),
      completedWeeks: [],
      carryForward: '',
      quizSnapshots: [],
      labSnapshots: [],
      drafts: {
        nextIntention: '',
        daily: { key:'', expectation:'', observation:'', nextAction:'', stage:'writing' },
        reflection: { index:0, note:'' },
        amusements: { brain:{ prompt:'', observation:'' }, together:{ prompt:'', observation:'' } }
      }
    };
  }

  function safeLocalHref(value) {
    if (typeof value !== 'string') return '';
    const href = value.trim();
    if (!href || href.includes('..') || /^(?:[a-z][a-z\d+.-]*:|\/\/|\\)/i.test(href)) return '';
    return href.slice(0, 220);
  }

  function normalizeState(value) {
    const clean = emptyState();
    if (!value || typeof value !== 'object') return clean;
    if (Array.isArray(value.checks)) clean.checks = checks.map((_, index) => value.checks[index] === true);
    if (typeof value.note === 'string') clean.note = value.note.slice(0, 280);
    if (typeof value.startedAt === 'string') clean.startedAt = value.startedAt;
    if (typeof value.carryForward === 'string') clean.carryForward = value.carryForward.slice(0, 160);
    if (Array.isArray(value.completedWeeks)) {
      clean.completedWeeks = value.completedWeeks.slice(0, 260).filter(item => item && typeof item.completedAt === 'string').map(item => {
        const movements = Array.isArray(item.movements)
          ? [...new Set(item.movements.filter(index => Number.isInteger(index) && index >= 0 && index < checks.length))]
          : movementLabels.map((_, index) => index);
        return {
          completedAt: item.completedAt,
          note: typeof item.note === 'string' ? item.note.slice(0, 280) : '',
          carryForward: typeof item.carryForward === 'string' ? item.carryForward.slice(0, 160) : '',
          movements
        };
      });
    }
    if (Array.isArray(value.quizSnapshots)) {
      clean.quizSnapshots = value.quizSnapshots.slice(0, 250).filter(item => item && typeof item.savedAt === 'string' && typeof item.resultTitle === 'string').map(item => ({
        quizId: typeof item.quizId === 'string' ? item.quizId : '',
        quizTitle: typeof item.quizTitle === 'string' ? item.quizTitle.slice(0, 120) : 'Speelhal',
        resultId: typeof item.resultId === 'string' ? item.resultId : '',
        resultTitle: item.resultTitle.slice(0, 120),
        summary: typeof item.summary === 'string' ? item.summary.slice(0, 500) : '',
        experiment: typeof item.experiment === 'string' ? item.experiment.slice(0, 500) : '',
        observation: typeof item.observation === 'string' ? item.observation.slice(0, 500) : '',
        kind: item.kind === 'depth' ? 'depth' : 'quick',
        context: typeof item.context === 'string' ? item.context.slice(0, 80) : '',
        situation: typeof item.situation === 'string' ? item.situation.slice(0, 90) : '',
        fit: ['raakt', 'deels', 'mist'].includes(item.fit) ? item.fit : '',
        reflection: typeof item.reflection === 'string' ? item.reflection.slice(0, 280) : '',
        readHref: safeLocalHref(item.readHref),
        readLabel: typeof item.readLabel === 'string' ? item.readLabel.slice(0, 120) : '',
        method: item.method && typeof item.method === 'object' ? {
          answered: Number.isInteger(item.method.answered) ? item.method.answered : 0,
          dual: Number.isInteger(item.method.dual) ? item.method.dual : 0,
          missed: Number.isInteger(item.method.missed) ? item.method.missed : 0,
          skipped: Number.isInteger(item.method.skipped) ? item.method.skipped : 0
        } : null,
        followUp: item.followUp && typeof item.followUp === 'object' && typeof item.followUp.completedAt === 'string' ? {
          actualAnswer: ['ja', 'voorwaardelijk', 'nee', 'nog-niet'].includes(item.followUp.actualAnswer) ? item.followUp.actualAnswer : '',
          costReality: ['lichter', 'ongeveer', 'zwaarder', 'niet-getest'].includes(item.followUp.costReality) ? item.followUp.costReality : '',
          mirrorNow: ['klopt', 'deels', 'anders'].includes(item.followUp.mirrorNow) ? item.followUp.mirrorNow : '',
          note: typeof item.followUp.note === 'string' ? item.followUp.note.slice(0, 280) : '',
          completedAt: item.followUp.completedAt
        } : null,
        savedAt: item.savedAt
      }));
    }
    if (Array.isArray(value.labSnapshots)) {
      clean.labSnapshots = value.labSnapshots.slice(0, 250).filter(item => item && typeof item.savedAt === 'string' && typeof item.title === 'string').map(item => ({
        kind: ['daily', 'brain', 'together', 'reflection', 'beast', 'route', 'exercise'].includes(item.kind) ? item.kind : 'daily',
        title: (item.kind === 'beast' && item.title === 'Kraken' ? 'Leviathan' : item.title).slice(0, 140),
        prompt: typeof item.prompt === 'string' ? item.prompt.slice(0, 500) : '',
        expectation: typeof item.expectation === 'string' ? item.expectation.slice(0, 280) : '',
        observation: typeof item.observation === 'string' ? item.observation.slice(0, 500) : '',
        nextAction: typeof item.nextAction === 'string' ? item.nextAction.slice(0, 220) : '',
        savedAt: item.savedAt
      }));
    }
    if (value.drafts && typeof value.drafts === 'object') {
      const drafts = value.drafts;
      clean.drafts.nextIntention = typeof drafts.nextIntention === 'string' ? drafts.nextIntention.slice(0, 160) : '';
      if (drafts.daily && typeof drafts.daily === 'object') clean.drafts.daily = {
        key: typeof drafts.daily.key === 'string' ? drafts.daily.key.slice(0, 80) : '',
        expectation: typeof drafts.daily.expectation === 'string' ? drafts.daily.expectation.slice(0, 280) : '',
        observation: typeof drafts.daily.observation === 'string' ? drafts.daily.observation.slice(0, 280) : '',
        nextAction: typeof drafts.daily.nextAction === 'string' ? drafts.daily.nextAction.slice(0, 220) : '',
        stage: ['writing', 'planned', 'observing'].includes(drafts.daily.stage) ? drafts.daily.stage : (drafts.daily.observation ? 'observing' : 'writing')
      };
      if (drafts.reflection && typeof drafts.reflection === 'object') clean.drafts.reflection = {
        index: Number.isInteger(drafts.reflection.index) ? Math.max(0, Math.min(questions.length - 1, drafts.reflection.index)) : 0,
        note: typeof drafts.reflection.note === 'string' ? drafts.reflection.note.slice(0, 280) : ''
      };
      ['brain', 'together'].forEach(kind => {
        const item = drafts.amusements?.[kind];
        if (!item || typeof item !== 'object') return;
        clean.drafts.amusements[kind] = {
          prompt: typeof item.prompt === 'string' ? item.prompt.slice(0, 500) : '',
          observation: typeof item.observation === 'string' ? item.observation.slice(0, 280) : ''
        };
      });
    }
    return clean;
  }

  let autosaveTimer;
  function autosave(messageTarget) {
    clearTimeout(autosaveTimer);
    if (messageTarget) messageTarget.textContent = 'Wordt automatisch bewaard…';
    autosaveTimer = setTimeout(() => {
      saveProgress();
      if (messageTarget) messageTarget.textContent = 'Automatisch bewaard in deze browser.';
    }, 280);
  }

  function saveProgress() {
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify(state));
      localStorage.removeItem(previousStorageKey);
      localStorage.removeItem(legacyStorageKey);
    } catch (_) {
      /* Het Menslab blijft bruikbaar wanneer lokale opslag niet beschikbaar is. */
    }
  }

  function loadProgress() {
    try {
      const current = localStorage.getItem(progressStorageKey);
      if (current) {
        state = normalizeState(JSON.parse(current));
        return;
      }
      const previous = localStorage.getItem(previousStorageKey);
      if (previous) {
        state = normalizeState(JSON.parse(previous));
        saveProgress();
        return;
      }
      const legacy = JSON.parse(localStorage.getItem(legacyStorageKey));
      if (Array.isArray(legacy)) {
        state.checks = checks.map((_, index) => legacy[index] === true);
        saveProgress();
      }
    } catch (_) {
      state = emptyState();
    }
  }

  loadProgress();

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Datum onbekend';
    return new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function renderHistory() {
    const history = document.querySelector('[data-track-history]');
    if (!state.completedWeeks.length) {
      const empty = document.createElement('li');
      empty.className = 'progress-history__empty';
      empty.textContent = 'Hier verschijnen de weken die je bewust afrondt.';
      history.replaceChildren(empty);
      return;
    }
    history.replaceChildren(...state.completedWeeks.map(item => {
      const row = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = `${item.movements.length} van ${checks.length} bewegingen`;
      const date = document.createElement('span');
      date.textContent = formatDate(item.completedAt);
      row.append(title, date);
      if (item.note) {
        const memory = document.createElement('em');
        memory.textContent = item.note;
        row.append(memory);
      }
      return row;
    }));
  }

  function renderQuizSnapshots() {
    const section = document.querySelector('[data-quiz-snapshots]');
    section.hidden = !state.quizSnapshots.length;
    if (section.hidden) return;
    document.querySelector('[data-quiz-snapshot-list]').replaceChildren(...state.quizSnapshots.slice(0, 6).map(item => {
      const row = document.createElement('li');
      const quiz = document.createElement('span');
      quiz.textContent = item.quizTitle;
      const title = document.createElement('strong');
      title.textContent = item.resultTitle;
      const date = document.createElement('small');
      const context = item.kind === 'depth' && item.context ? `${item.context} · ` : '';
      date.textContent = `${context}${formatDate(item.savedAt)}`;
      row.append(quiz, title, date);
      if (item.fit) {
        const fit = document.createElement('span');
        fit.className = `snapshot-fit snapshot-fit--${item.fit}`;
        fit.textContent = `Jouw antwoord: ${quizFitLabels[item.fit]}`;
        row.append(fit);
      }
      if (item.observation) {
        const basis = document.createElement('small');
        basis.className = 'snapshot-basis';
        basis.textContent = item.observation;
        row.append(basis);
      }
      if (item.reflection) {
        const reflection = document.createElement('em');
        reflection.textContent = `Jij schreef terug: ${item.reflection}`;
        row.append(reflection);
      }
      if (item.kind === 'quick' && item.readHref) {
        const reading = document.createElement('a');
        reading.href = item.readHref;
        reading.textContent = item.readLabel ? `Open ${item.readLabel} →` : 'Open de tekst bij deze spiegel →';
        row.append(reading);
      }
      if (item.kind === 'depth') {
        const followup = document.createElement('a');
        followup.href = `dieptequiz-ja.html?terugblik=${encodeURIComponent(item.savedAt)}`;
        followup.textContent = item.followUp ? 'Bekijk of wijzig je terugblik →' : 'Kijk later terug: wat gebeurde er? →';
        row.append(followup);
        if (item.followUp?.note) {
          const lived = document.createElement('em');
          lived.className = 'snapshot-followup-note';
          lived.textContent = `Terugblik: ${item.followUp.note}`;
          row.append(lived);
        }
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Verwijder deze spiegel';
      remove.addEventListener('click', () => {
        state.quizSnapshots = state.quizSnapshots.filter(snapshot => snapshot.savedAt !== item.savedAt);
        saveProgress();
        renderProgress();
      });
      row.append(remove);
      return row;
    }));
  }

  function renderLabSnapshots() {
    const section = document.querySelector('[data-lab-snapshots]');
    section.hidden = !state.labSnapshots.length;
    if (section.hidden) return;
    document.querySelector('[data-lab-snapshot-list]').replaceChildren(...state.labSnapshots.slice(0, 8).map(item => {
      const row = document.createElement('li');
      const kind = document.createElement('span');
      kind.textContent = labKindLabels[item.kind] || 'Menslab';
      const title = document.createElement('strong');
      title.textContent = item.title;
      const date = document.createElement('small');
      date.textContent = formatDate(item.savedAt);
      row.append(kind, title, date);
      if (item.prompt && item.kind !== 'daily') {
        const prompt = document.createElement('p');
        prompt.textContent = item.prompt;
        row.append(prompt);
      }
      if (item.expectation) {
        const expectation = document.createElement('em');
        expectation.textContent = `Verwachting: ${item.expectation}`;
        row.append(expectation);
      }
      if (item.observation) {
        const observation = document.createElement('em');
        observation.textContent = `Observatie: ${item.observation}`;
        row.append(observation);
      }
      if (item.nextAction) {
        const nextAction = document.createElement('em');
        nextAction.textContent = `Volgende stap: ${item.nextAction}`;
        row.append(nextAction);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Verwijder deze proefnotitie';
      remove.addEventListener('click', () => {
        state.labSnapshots = state.labSnapshots.filter(snapshot => snapshot.savedAt !== item.savedAt);
        saveProgress();
        renderProgress();
      });
      row.append(remove);
      return row;
    }));
  }

  function addLabSnapshot(snapshot) {
    state.labSnapshots.unshift({ ...snapshot, savedAt: new Date().toISOString() });
    state.labSnapshots = state.labSnapshots.slice(0, 250);
    saveProgress();
    renderProgress();
  }

  function renderDepthPatterns() {
    const section = document.querySelector('[data-depth-patterns]');
    const depth = state.quizSnapshots.filter(item => item.kind === 'depth');
    section.hidden = depth.length < 3;
    if (section.hidden) return;
    const contexts = new Set(depth.map(item => item.context).filter(Boolean));
    const titleCounts = depth.reduce((counts, item) => { counts[item.resultTitle] = (counts[item.resultTitle] || 0) + 1; return counts; }, {});
    const recurring = Object.entries(titleCounts).sort((a, b) => b[1] - a[1])[0];
    const followups = depth.filter(item => item.followUp);
    const changed = followups.filter(item => item.followUp.mirrorNow !== 'klopt').length;
    const lines = [
      `${depth.length} bewaarde situaties in ${contexts.size || 1} ${contexts.size === 1 ? 'omgeving' : 'omgevingen'}.`,
      recurring[1] > 1 ? `De werktitel “${recurring[0]}” keerde ${recurring[1]} keer terug.` : 'Tot nu toe kreeg iedere situatie een andere werktitel.',
      followups.length ? `${followups.length} ${followups.length === 1 ? 'terugblik' : 'terugblikken'} bewaard; in ${changed} daarvan verschoof of nuanceerde de eerste spiegel.` : 'Er is nog geen tweede ontmoeting bewaard; de eerste spiegels blijven voorlopig hypotheses.'
    ];
    document.querySelector('[data-depth-pattern-list]').replaceChildren(...lines.map(line => { const item = document.createElement('li'); item.textContent = line; return item; }));
  }

  function renderPatterns() {
    const section = document.querySelector('[data-progress-patterns]');
    const counts = new Array(checks.length).fill(0);
    state.completedWeeks.forEach(week => week.movements.forEach(index => { counts[index] += 1; }));
    section.hidden = state.completedWeeks.length < 2;
    if (section.hidden) return;
    const ranked = counts.map((count, index) => ({ count, index })).filter(item => item.count > 0).sort((a, b) => b.count - a.count || a.index - b.index).slice(0, 3);
    document.querySelector('[data-pattern-list]').replaceChildren(...ranked.map(item => {
      const row = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = movementLabels[item.index];
      const count = document.createElement('span');
      count.textContent = `${item.count} ${item.count === 1 ? 'week' : 'weken'}`;
      row.append(label, count);
      return row;
    }));
  }

  function renderReview() {
    const section = document.querySelector('[data-progress-review]');
    section.hidden = state.completedWeeks.length < 3;
    if (section.hidden) return;
    document.querySelector('[data-review-notes]').replaceChildren(...state.completedWeeks.slice(0, 3).map(item => {
      const quote = document.createElement('blockquote');
      quote.textContent = item.note || 'Geen notitie bewaard — de bewegingen zelf tellen ook.';
      const date = document.createElement('span');
      date.textContent = formatDate(item.completedAt);
      quote.append(date);
      return quote;
    }));
  }

  function renderReadingHistory() {
    const section = document.querySelector('[data-reading-history]');
    const list = document.querySelector('[data-reading-history-list]');
    if (!section || !list) return;

    const readArray = key => {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) { return []; }
    };
    const safeReadingHref = value => {
      try {
        const url = new URL(String(value || ''), location.href);
        return ['file:', 'http:', 'https:'].includes(url.protocol) ? url.href : '';
      } catch (_) { return ''; }
    };
    const footprintKey = 'onwijze-atlas-footprints-v1';
    const readingKey = 'onwijze-reading-history-v1';
    const atlasItems = readArray(footprintKey).map(item => ({
      source:'atlas', storageKey:footprintKey, storedUrl:item.url,
      href:safeReadingHref(`${item.url || ''}${item.chapterId ? `#${encodeURIComponent(item.chapterId)}` : ''}`),
      title:typeof item.title === 'string' ? item.title : '',
      type:typeof item.category === 'string' ? item.category : 'Atlasdossier',
      saved:item.saved === true,
      progress:Math.max(0, Math.min(100, Math.round(Number(item.progress) || 0))),
      chapter:typeof item.chapterLabel === 'string' ? item.chapterLabel : '',
      visitedAt:Number(item.visitedAt) || 0
    }));
    const readingItems = readArray(readingKey).map(item => ({
      source:'reading', storageKey:readingKey, storedUrl:item.url,
      href:safeReadingHref(item.url),
      title:typeof item.title === 'string' ? item.title : '',
      type:'Leesroute', saved:false,
      progress:Math.max(0, Math.min(100, Math.round(Number(item.progress) || 0))),
      chapter:'', visitedAt:Number(item.visitedAt) || 0
    }));
    const items = [...atlasItems, ...readingItems]
      .filter(item => item.title && item.href)
      .sort((a, b) => Number(b.saved) - Number(a.saved) || b.visitedAt - a.visitedAt);

    section.hidden = !items.length;
    if (section.hidden) return;

    const filtered = items.filter(item => {
      if (libraryMode === 'saved') return item.saved;
      if (libraryMode === 'continue') return item.progress < 99;
      return true;
    });
    const visible = libraryExpanded ? filtered : filtered.slice(0, 6);
    const count = document.querySelector('[data-library-count]');
    const more = document.querySelector('[data-library-more]');
    if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? 'vondst' : 'vondsten'}`;
    document.querySelectorAll('[data-library-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.libraryFilter === libraryMode));
    });
    if (more) {
      more.hidden = filtered.length <= 6;
      more.textContent = libraryExpanded ? 'Toon minder' : `Toon alle ${filtered.length}`;
    }

    if (!visible.length) {
      const empty = document.createElement('li');
      empty.className = 'progress-library__empty';
      empty.textContent = libraryMode === 'saved'
        ? 'Nog niets bewust bewaard. Open een dossier en kies daar “Bewaar dit dossier”.'
        : 'Geen onafgewerkte leesroute gevonden.';
      list.replaceChildren(empty);
      return;
    }

    list.replaceChildren(...visible.map(item => {
      const row = document.createElement('li');
      if (item.saved) row.classList.add('is-saved');
      const link = document.createElement('a');
      link.href = item.href;
      const meta = document.createElement('span');
      meta.className = 'progress-library__meta';
      const kind = document.createElement('span');
      kind.textContent = item.type;
      const stateLabel = document.createElement('em');
      stateLabel.textContent = item.saved ? 'Bewaard' : item.progress >= 99 ? 'Uitgelezen' : item.progress ? `${item.progress}% gelezen` : 'Net geopend';
      meta.append(kind, stateLabel);
      const title = document.createElement('strong');
      title.textContent = item.title;
      const action = document.createElement('small');
      action.textContent = item.progress >= 99 ? 'Lees opnieuw →' : item.chapter ? `Verder bij: ${item.chapter} →` : 'Ga verder →';
      const progress = document.createElement('i');
      progress.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('b');
      fill.style.width = `${item.progress}%`;
      progress.append(fill);
      link.append(meta, title, action, progress);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Verwijder';
      remove.setAttribute('aria-label', `Verwijder ${item.title} uit Mijn spoor`);
      remove.addEventListener('click', () => {
        const remaining = readArray(item.storageKey).filter(entry => entry.url !== item.storedUrl);
        try {
          localStorage.setItem(item.storageKey, JSON.stringify(remaining));
          const status = document.querySelector('[data-library-status]');
          if (status) status.textContent = `${item.title} is uit Mijn spoor verwijderd.`;
          renderReadingHistory();
        } catch (_) {
          const status = document.querySelector('[data-library-status]');
          if (status) status.textContent = 'Verwijderen is in deze browser niet beschikbaar.';
        }
      });
      row.append(link, remove);
      return row;
    }));
  }

  document.querySelectorAll('[data-library-filter]').forEach(button => {
    button.addEventListener('click', () => {
      libraryMode = ['all', 'saved', 'continue'].includes(button.dataset.libraryFilter) ? button.dataset.libraryFilter : 'all';
      libraryExpanded = false;
      renderReadingHistory();
    });
  });
  document.querySelector('[data-library-more]')?.addEventListener('click', () => {
    libraryExpanded = !libraryExpanded;
    renderReadingHistory();
  });

  function renderQuizLibrary() {
    const results = document.querySelector('[data-quiz-library-results]');
    const search = document.querySelector('[data-quiz-library-search]');
    const category = document.querySelector('[data-quiz-library-category]');
    if (!results || !search || !category) return;
    const items = (Array.isArray(window.MENSLAB_QUIZZES) ? window.MENSLAB_QUIZZES : []).map(quiz => ({
      id:quiz.id,
      href:`speelhal.html?quiz=${encodeURIComponent(quiz.id)}`,
      title:quiz.title,
      category:String(quiz.eyebrow || 'Andere vragen').split('·')[0].trim(),
      duration:typeof quiz.duration === 'string' ? quiz.duration : (quiz.questions?.length > 8 ? 'ongeveer 6 minuten' : 'ongeveer 3 minuten'),
      search:[quiz.title, quiz.eyebrow, ...Object.values(quiz.results || {}).map(result => `${result.title || ''} ${result.summary || ''}`)].join(' ')
    }));
    items.push({
      id:'diepte-ja', href:'dieptequiz-ja.html', category:'Dieptequiz', duration:'ongeveer 8–10 minuten',
      title:'Een ja is geen type. Wat beslist er allemaal mee?',
      search:'ja keuze context motivatie grenzen verantwoordelijkheid dieptequiz'
    });
    if (category.options.length === 1) {
      [...new Set(items.map(item => item.category))].sort((a, b) => a.localeCompare(b, 'nl')).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        category.append(option);
      });
    }
    const normalize = value => String(value || '').toLocaleLowerCase('nl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const query = normalize(search.value.trim());
    const filtered = items.filter(item => (!category.value || item.category === category.value) && (!query || normalize(item.search).includes(query)));
    const visible = quizLibraryExpanded ? filtered : filtered.slice(0, 6);
    const count = document.querySelector('[data-quiz-library-count]');
    const more = document.querySelector('[data-quiz-library-more]');
    const empty = document.querySelector('[data-quiz-library-empty]');
    if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? 'quiz' : 'quizzen'} gevonden`;
    if (more) {
      more.hidden = filtered.length <= 6;
      more.textContent = quizLibraryExpanded ? 'Toon minder' : `Toon alle ${filtered.length}`;
    }
    if (empty) empty.hidden = filtered.length > 0;
    results.replaceChildren(...visible.map(item => {
      const link = document.createElement('a');
      link.href = item.href;
      const shelf = document.createElement('span');
      shelf.textContent = item.category;
      const title = document.createElement('strong');
      title.textContent = item.title;
      const time = document.createElement('small');
      time.textContent = `${item.duration} →`;
      link.append(shelf, title, time);
      return link;
    }));
  }

  document.querySelector('[data-quiz-library-search]')?.addEventListener('input', () => {
    quizLibraryExpanded = false;
    renderQuizLibrary();
  });
  document.querySelector('[data-quiz-library-category]')?.addEventListener('change', () => {
    quizLibraryExpanded = false;
    renderQuizLibrary();
  });
  document.querySelector('[data-quiz-library-more]')?.addEventListener('click', () => {
    quizLibraryExpanded = !quizLibraryExpanded;
    renderQuizLibrary();
  });

  function renderToday() {
    const portal = document.querySelector('[data-today-link]');
    if (!portal) return;
    const done = state.checks.filter(Boolean).length;
    const hasActiveWeek = done > 0 || Boolean(state.note) || Boolean(state.carryForward);
    const dailyDraft = state.drafts.daily?.key === dailyKey ? state.drafts.daily : null;
    const hasDailyDraft = Boolean(dailyDraft?.expectation || dailyDraft?.observation);
    if (!['quick', 'question', 'week'].includes(todayMode)) todayMode = hasActiveWeek ? 'week' : 'quick';
    const choices = {
      quick: {
        href:'#dagproef', kicker:'2 minuten', label:hasDailyDraft ? 'Je dagproef staat nog open' : 'Proef van vandaag', title:dailyExperiment.title,
        copy:hasDailyDraft
          ? dailyDraft.observation ? 'Je observatie staat klaar. Bewaar ze wanneer dat goed voelt.' : 'Je verwachting staat klaar. Probeer alleen wanneer er genoeg ruimte is.'
          : dailyExperiment.prompt,
        action:hasDailyDraft ? 'Ga verder met je proef' : 'Begin met deze proef'
      },
      question: {
        href:'#quizkast', kicker:'2–10 minuten', label:'Eén vraag, geen volledig programma', title:'Welke vraag trekt vandaag?',
        copy:'Zoek in de quizcabine en open alleen de vraag die nu nieuwsgierig maakt. Een uitslag is geen oordeel.', action:'Snuffel in de quizcabine'
      },
      week: {
        href:'#weeklab', kicker:'7 losse haltes', label:hasActiveWeek ? 'Je week loopt al' : 'Een spoor door de week',
        title:hasActiveWeek ? `${done} van 7 bewegingen onderweg` : 'Een week mentale rekbaarheid',
        copy:hasActiveWeek ? 'Ga verder bij de eerstvolgende beweging die haalbaar voelt. De week hoeft niet volledig te zijn.' : 'Zeven uitnodigingen verspreid over de tijd. Geen streak, geen achterstand en geen perfecte dagen.',
        action:hasActiveWeek ? 'Ga verder met je week' : 'Bekijk de zeven haltes'
      }
    };
    const choice = choices[todayMode];
    portal.href = choice.href;
    document.querySelector('[data-today-kicker]').textContent = choice.kicker;
    document.querySelector('[data-today-label]').textContent = choice.label;
    document.querySelector('[data-today-title]').textContent = choice.title;
    document.querySelector('[data-today-copy]').textContent = choice.copy;
    document.querySelector('[data-today-action]').firstChild.textContent = `${choice.action} `;
    document.querySelector('[data-today-date]').textContent = new Intl.DateTimeFormat('nl-BE', { weekday:'long', day:'numeric', month:'long' }).format(today);
    const latest = state.labSnapshots[0];
    const savedToday = latest?.savedAt && new Date(latest.savedAt).toDateString() === today.toDateString();
    document.querySelector('[data-today-status]').textContent = savedToday
      ? 'Vandaag bewaarde je al iets. Je mag hier ook gewoon stoppen.'
      : hasActiveWeek && todayMode !== 'week'
        ? `Er loopt ook een weekspoor: ${done} van 7 bewegingen.`
        : hasDailyDraft && todayMode !== 'quick'
          ? 'Je dagproef staat nog open en blijft lokaal voor je klaarstaan.'
          : 'Niets moet af. Eén kleine beweging is genoeg.';
    document.querySelectorAll('[data-today-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.todayMode === todayMode)));
  }

  document.querySelectorAll('[data-today-mode]').forEach(button => {
    button.addEventListener('click', () => {
      todayMode = button.dataset.todayMode;
      renderToday();
    });
  });

  function renderProgress() {
    const done = state.checks.filter(Boolean).length;
    const weeks = state.completedWeeks.length;
    const archivedTotal = state.completedWeeks.reduce((sum, week) => sum + week.movements.length, 0);
    const total = archivedTotal + done + state.labSnapshots.length + state.quizSnapshots.length;
    score.textContent = `${done}/${checks.length}`;
    bar.style.width = `${Math.round(done / checks.length * 100)}%`;
    document.querySelector('[data-track-current]').textContent = `${done} van ${checks.length}`;
    document.querySelector('[data-track-total]').textContent = String(total);
    document.querySelector('[data-track-weeks]').textContent = String(weeks);
    const currentCopy = document.querySelector('[data-track-current-copy]');
    if (done === 0) currentCopy.textContent = 'Je eerste kleine beweging ligt nog voor je.';
    else if (done < checks.length) currentCopy.textContent = `Je bent op weg: nog ${checks.length - done} uitnodiging${checks.length - done === 1 ? '' : 'en'} over — zonder verplichting.`;
    else currentCopy.textContent = 'Je hebt alle zeven uitnodigingen geprobeerd.';
    completion.hidden = done === 0;
    if (done > 0) document.querySelector('[data-week-finish-title]').textContent = `Je hebt ${done} van de ${checks.length} bewegingen geprobeerd.`;

    const bridge = document.querySelector('[data-week-bridge]');
    bridge.hidden = !state.carryForward;
    document.querySelector('[data-week-bridge-text]').textContent = state.carryForward;

    const hasActiveWeek = done > 0 || Boolean(state.note) || Boolean(state.carryForward);
    const hasProgress = hasActiveWeek || weeks > 0 || state.quizSnapshots.length > 0 || state.labSnapshots.length > 0;
    const youTrack = document.querySelector('[data-you-track]');
    if (youTrack) youTrack.hidden = !hasProgress;
    renderToday();
    renderHistory();
    renderLabSnapshots();
    renderQuizSnapshots();
    renderDepthPatterns();
    renderPatterns();
    renderReview();
    renderReadingHistory();
    renderPersonalProfile();
  }

  function renderPersonalProfile() {
    const root = document.querySelector('[data-personal-profile]');
    if (!root) return;
    try {
      const profile = JSON.parse(localStorage.getItem('onwijze-profile-v1') || 'null');
      const beast = window.BEAST_QUIZ?.beasts?.find(item => item.id === profile?.beastId || item.legacyIds?.includes(profile?.beastId));
      if (!profile || !beast) { root.hidden = true; return; }
      root.querySelector('[data-personal-profile-image]').src = beast.image || `images/beasts/${beast.id}.jpg`;
      root.querySelector('[data-personal-profile-image]').alt = `Illustratie van ${beast.name}`;
      root.querySelector('[data-personal-profile-name]').textContent = profile.name;
      root.querySelector('[data-personal-profile-beast]').textContent = `${beast.name} · ${beast.archetype}`;
      root.querySelector('[data-personal-profile-intro]').textContent = profile.intro || 'Je eigen plek groeit mee met wat je onderzoekt en probeert.';
      root.hidden = false;
    } catch (_) { root.hidden = true; }
  }

  function syncControls() {
    checks.forEach((input, index) => { input.checked = state.checks[index]; });
    note.value = state.note;
    nextIntention.value = state.drafts.nextIntention;
    currentQuestion = state.drafts.reflection.index;
    document.querySelector('[data-question-number]').textContent = `Vraag ${String(currentQuestion + 1).padStart(2, '0')}`;
    document.querySelector('[data-reflection-question]').textContent = questions[currentQuestion];
    document.querySelector('[data-reflection-note]').value = state.drafts.reflection.note;
    renderProgress();
  }

  checks.forEach((input, index) => input.addEventListener('change', () => {
    state.checks[index] = input.checked;
    saveProgress();
    renderProgress();
  }));

  document.querySelector('[data-save-week-note]')?.addEventListener('click', () => {
    state.note = note.value.trim();
    saveProgress();
    renderProgress();
    noteStatus.textContent = state.note ? 'Bewaard in deze browser.' : 'De notitie is leeggemaakt.';
  });

  note.addEventListener('input', () => {
    state.note = note.value.slice(0, 280);
    autosave(noteStatus);
  });
  nextIntention.addEventListener('input', () => {
    state.drafts.nextIntention = nextIntention.value.slice(0, 160);
    autosave();
  });

  document.querySelector('[data-archive-week]')?.addEventListener('click', () => {
    const movements = state.checks.map((checked, index) => checked ? index : -1).filter(index => index >= 0);
    if (!movements.length) return;
    state.note = note.value.trim();
    const carryForward = nextIntention.value.trim();
    state.completedWeeks.unshift({ completedAt: new Date().toISOString(), note: state.note, carryForward, movements });
    state.carryForward = carryForward;
    state.checks = new Array(checks.length).fill(false);
    state.note = '';
    state.drafts.nextIntention = '';
    state.startedAt = new Date().toISOString();
    saveProgress();
    syncControls();
    noteStatus.textContent = 'Deze week staat nu in Mijn spoor.';
    document.getElementById('mijn-spoor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelector('[data-clear-bridge]')?.addEventListener('click', () => {
    state.carryForward = '';
    saveProgress();
    renderProgress();
  });

  document.querySelector('[data-reset-week]')?.addEventListener('click', () => {
    state.checks = new Array(checks.length).fill(false);
    state.note = '';
    state.drafts.nextIntention = '';
    state.startedAt = new Date().toISOString();
    saveProgress();
    syncControls();
    noteStatus.textContent = 'Deze week is leeggemaakt.';
  });

  document.querySelector('[data-export-track]')?.addEventListener('click', () => {
    try {
      saveProgress();
      const stores = {};
      siteStorageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) stores[key] = value;
      });
      const payload = { format: 'onwijze-lokaal-spoor', version: 2, exportedAt: new Date().toISOString(), stores };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mijn-volledige-onwijze-spoor-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      fileStatus.textContent = 'Je volledige lokale spoor is als bestand klaargezet.';
    } catch (_) {
      fileStatus.textContent = 'Deze browser laat lokale opslag of export hier niet toe.';
    }
  });

  document.querySelector('[data-import-track]')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (payload?.format === 'menslab-spoor' && payload?.version === 1 && payload.data) {
        state = normalizeState(payload.data);
        saveProgress();
      } else if (payload?.format === 'onwijze-lokaal-spoor' && payload?.version === 2 && payload.stores && typeof payload.stores === 'object') {
        siteStorageKeys.forEach(key => localStorage.removeItem(key));
        Object.entries(payload.stores).forEach(([key, value]) => {
          if (siteStorageKeys.includes(key) && typeof value === 'string') localStorage.setItem(key, value);
        });
        const restored = localStorage.getItem(progressStorageKey);
        state = normalizeState(restored ? JSON.parse(restored) : null);
      } else throw new Error('Ongeldig bestand');
      syncControls();
      fileStatus.textContent = 'Je volledige bewaarde spoor is teruggezet. Andere pagina’s zien dit zodra je ze opnieuw opent.';
    } catch (_) {
      fileStatus.textContent = 'Dit bestand lijkt geen geldig Menslab-spoor te zijn.';
    } finally {
      event.target.value = '';
    }
  });

  const clearTrack = document.querySelector('[data-clear-track]');
  let clearTrackArmed = false;
  let clearTrackTimer;
  clearTrack?.addEventListener('click', () => {
    if (!clearTrackArmed) {
      clearTrackArmed = true;
      clearTrack.textContent = 'Klik nog eens om alle lokale gegevens te wissen';
      clearTimeout(clearTrackTimer);
      clearTrackTimer = setTimeout(() => {
        clearTrackArmed = false;
        clearTrack.textContent = 'Wis al mijn lokale gegevens';
      }, 5000);
      return;
    }
    clearTimeout(clearTrackTimer);
    clearTrackArmed = false;
    state = emptyState();
    try {
      siteStorageKeys.forEach(key => localStorage.removeItem(key));
    } catch (_) {}
    syncControls();
    noteStatus.textContent = 'Alle lokale gegevens van deze site zijn gewist.';
    clearTrack.textContent = 'Wis al mijn lokale gegevens';
  });

  document.querySelector('[data-new-question]')?.addEventListener('click', () => {
    currentQuestion = (currentQuestion + 1) % questions.length;
    document.querySelector('[data-question-number]').textContent = `Vraag ${String(currentQuestion + 1).padStart(2, '0')}`;
    document.querySelector('[data-reflection-question]').textContent = questions[currentQuestion];
    document.querySelector('[data-reflection-note]').value = '';
    document.querySelector('[data-reflection-status]').textContent = '';
    state.drafts.reflection = { index:currentQuestion, note:'' };
    saveProgress();
  });

  document.querySelector('[data-reflection-note]')?.addEventListener('input', event => {
    state.drafts.reflection = { index:currentQuestion, note:event.currentTarget.value.slice(0, 280) };
    autosave(document.querySelector('[data-reflection-status]'));
  });

  document.querySelector('[data-save-reflection]')?.addEventListener('click', () => {
    const reflection = document.querySelector('[data-reflection-note]').value.trim();
    addLabSnapshot({ kind:'reflection', title:'Een vraag die mocht meelopen', prompt:questions[currentQuestion], expectation:'', observation:reflection });
    state.drafts.reflection = { index:currentQuestion, note:'' };
    document.querySelector('[data-reflection-note]').value = '';
    saveProgress();
    document.querySelector('[data-reflection-status]').textContent = 'Bewaard in Mijn spoor op dit apparaat.';
  });

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - startOfYear) / 86400000);
  const dailyExperiment = dailyExperiments[dayOfYear % dailyExperiments.length];
  const dailyKey = `${today.toISOString().slice(0, 10)}:${dailyExperiment.title}`;
  document.querySelector('[data-daily-number]').textContent = `Vandaag · ${new Intl.DateTimeFormat('nl-BE', { day:'numeric', month:'long' }).format(today)}`;
  document.querySelector('[data-daily-title]').textContent = dailyExperiment.title;
  document.querySelector('[data-daily-prompt]').textContent = dailyExperiment.prompt;
  document.querySelector('[data-daily-aim]').textContent = dailyExperiment.aim;
  document.querySelector('[data-daily-steps]').replaceChildren(...dailyExperiment.steps.map(step => { const item = document.createElement('li'); item.textContent = step; return item; }));
  document.querySelector('[data-daily-mechanism]').textContent = dailyExperiment.mechanism;
  document.querySelector('[data-daily-boundary]').textContent = dailyExperiment.boundary;
  document.querySelector('[data-daily-sources]').replaceChildren(...dailyExperiment.sources.map(([label, href]) => { const link = document.createElement('a'); link.href = href; link.target = '_blank'; link.rel = 'noopener'; link.textContent = `${label} ↗`; return link; }));
  document.querySelector('[data-daily-expectation-question]').textContent = dailyExperiment.expectationQuestion;
  document.querySelector('[data-daily-expectation]').placeholder = dailyExperiment.expectationPlaceholder;
  document.querySelector('[data-daily-observation-question]').textContent = dailyExperiment.observationQuestion;
  document.querySelector('[data-daily-observation]').placeholder = dailyExperiment.observationPlaceholder;
  document.querySelector('[data-daily-next-question]').textContent = dailyExperiment.nextQuestion;
  document.querySelector('[data-daily-next]').placeholder = dailyExperiment.nextPlaceholder;
  if (state.drafts.daily.key === dailyKey) {
    document.querySelector('[data-daily-expectation]').value = state.drafts.daily.expectation;
    document.querySelector('[data-daily-observation]').value = state.drafts.daily.observation;
    document.querySelector('[data-daily-next]').value = state.drafts.daily.nextAction;
    if (state.drafts.daily.stage === 'observing') {
      document.querySelector('[data-daily-after]').hidden = false;
      document.querySelector('[data-daily-plan]').hidden = true;
    } else if (state.drafts.daily.stage === 'planned') {
      document.querySelector('[data-daily-plan]').hidden = true;
      document.querySelector('[data-daily-pause]').hidden = false;
    }
  } else state.drafts.daily = { key:dailyKey, expectation:'', observation:'', nextAction:'', stage:'writing' };
  ['[data-daily-expectation]', '[data-daily-observation]', '[data-daily-next]'].forEach(selector => document.querySelector(selector)?.addEventListener('input', () => {
    state.drafts.daily = {
      key:dailyKey,
      expectation:document.querySelector('[data-daily-expectation]').value.slice(0, 280),
      observation:document.querySelector('[data-daily-observation]').value.slice(0, 280),
      nextAction:document.querySelector('[data-daily-next]').value.slice(0, 220),
      stage:state.drafts.daily.stage || 'writing'
    };
    autosave(document.querySelector('[data-daily-status]'));
  }));
  document.querySelector('[data-daily-plan]')?.addEventListener('click', () => {
    const expectation = document.querySelector('[data-daily-expectation]').value.trim();
    const status = document.querySelector('[data-daily-status]');
    if (!expectation) {
      status.textContent = 'Noteer eerst kort wat je verwacht of vreest.';
      document.querySelector('[data-daily-expectation]').focus();
      return;
    }
    state.drafts.daily = { key:dailyKey, expectation:expectation.slice(0, 280), observation:'', nextAction:'', stage:'planned' };
    saveProgress();
    renderToday();
    document.querySelector('[data-daily-plan]').hidden = true;
    document.querySelector('[data-daily-pause]').hidden = false;
    status.textContent = 'Je verwachting staat lokaal klaar voor wanneer je terugkomt.';
  });
  document.querySelector('[data-daily-tried]')?.addEventListener('click', () => {
    const after = document.querySelector('[data-daily-after]');
    after.hidden = false;
    document.querySelector('[data-daily-pause]').hidden = true;
    state.drafts.daily.stage = 'observing';
    saveProgress();
    document.querySelector('[data-daily-observation]').focus();
  });
  document.querySelector('[data-save-daily]')?.addEventListener('click', () => {
    const expectation = document.querySelector('[data-daily-expectation]').value.trim();
    const observation = document.querySelector('[data-daily-observation]').value.trim();
    const nextAction = document.querySelector('[data-daily-next]').value.trim();
    const status = document.querySelector('[data-daily-status]');
    if (!observation) {
      status.textContent = 'Noteer eerst kort wat je werkelijk merkte.';
      document.querySelector('[data-daily-observation]').focus();
      return;
    }
    addLabSnapshot({ kind:'daily', title:dailyExperiment.title, prompt:dailyExperiment.prompt, expectation, observation, nextAction });
    state.drafts.daily = { key:dailyKey, expectation:'', observation:'', nextAction:'', stage:'writing' };
    document.querySelector('[data-daily-expectation]').value = '';
    document.querySelector('[data-daily-observation]').value = '';
    document.querySelector('[data-daily-next]').value = '';
    document.querySelector('[data-daily-after]').hidden = true;
    document.querySelector('[data-daily-pause]').hidden = true;
    document.querySelector('[data-daily-plan]').hidden = false;
    saveProgress();
    renderToday();
    status.textContent = 'Bewaard in Mijn spoor op dit apparaat.';
  });

  const brainAmusements = [
    'Kies een voorwerp in de kamer. Bedenk in dertig seconden drie volstrekt verkeerde toepassingen. De vierde mag bruikbaar zijn.',
    'Doe één routinehandeling in een andere volgorde. Waar probeert je automatische piloot het stuur terug te pakken?',
    'Kijk tien seconden naar de breinillustratie. Sluit je ogen. Hoeveel ladders denk je dat je zag? Controleer — je geheugen hoeft niet te winnen.',
    'Noem vijf dingen die je vandaag níét hebt opgemerkt. Ja, dit is een onredelijke opdracht. Begin bij wat je nu pas ziet.',
    'Voorspel welke gedachte over vijf seconden zal opkomen. Wacht. Geef je voorspellingsmachine een uiterst onofficiële score.',
    'Kies een alledaags probleem en bedenk eerst de slechtst mogelijke oplossing. Welke bruikbare hint zit erin verstopt?'
  ];
  const togetherAmusements = [
    'Vraag vóór een gesprek: “Wil je dat ik luister, vragen stel of meedenk?” Doe daarna alleen dat.',
    'Vertel dezelfde gebeurtenis elk in twintig seconden. Welke details koos ieder van jullie als “de kern”?',
    'Maak twee zinnen: “Wat ik bedoelde…” en “Wat jij misschien hoorde…”. Vergelijk zonder rechter.',
    'Kies een klein meningsverschil en verzin samen een derde optie waar geen van beiden mee begon.',
    'Raad eerst wat de ander zal antwoorden op: “Waar had jij deze week meer van willen hebben?” Vraag het daarna echt.',
    'Geef een compliment over iets wat iemand dééd, niet over wie die persoon volgens jou is.'
  ];

  function drawAmusement(selector, items, button) {
    const target = document.querySelector(selector);
    if (!target) return;
    const current = items.indexOf(target.textContent.trim());
    let next = Math.floor(Math.random() * items.length);
    if (items.length > 1 && next === current) next = (next + 1) % items.length;
    const draw = target.closest('.amusement-draw');
    draw?.classList.remove('amusement-draw--changing');
    void target.offsetWidth;
    target.textContent = items[next];
    draw?.classList.add('amusement-draw--changing');
    const observation = draw?.querySelector('[data-amusement-observation]');
    if (observation) observation.hidden = true;
    const open = draw?.querySelector('[data-open-amusement-note]');
    if (open) open.setAttribute('aria-expanded', 'false');
    const textarea = draw?.querySelector('textarea');
    if (textarea) textarea.value = '';
    const status = draw?.querySelector('[data-amusement-observation] span');
    if (status) status.textContent = '';
    const kind = draw?.querySelector('[data-save-amusement]')?.dataset.saveAmusement;
    if (kind) {
      state.drafts.amusements[kind] = { prompt:items[next], observation:'' };
      saveProgress();
    }
    button.setAttribute('aria-label', `Nieuwe mini-proef. Huidige proef: ${items[next]}`);
  }

  document.querySelector('[data-new-brain-amusement]')?.addEventListener('click', event => drawAmusement('[data-brain-amusement-prompt]', brainAmusements, event.currentTarget));
  document.querySelector('[data-new-together-amusement]')?.addEventListener('click', event => drawAmusement('[data-together-amusement-prompt]', togetherAmusements, event.currentTarget));
  document.querySelectorAll('[data-open-amusement-note]').forEach(button => button.addEventListener('click', () => {
    const observation = button.closest('.amusement-draw').querySelector('[data-amusement-observation]');
    observation.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    observation.querySelector('textarea').focus();
  }));
  document.querySelectorAll('[data-save-amusement]').forEach(button => {
    const draw = button.closest('.amusement-draw');
    const kind = button.dataset.saveAmusement;
    const saved = state.drafts.amusements[kind];
    if (saved?.prompt) draw.querySelector('blockquote').textContent = saved.prompt;
    if (saved?.observation) {
      draw.querySelector('textarea').value = saved.observation;
      draw.querySelector('[data-amusement-observation]').hidden = false;
      draw.querySelector('[data-open-amusement-note]').setAttribute('aria-expanded', 'true');
    }
    draw.querySelector('textarea').addEventListener('input', event => {
      state.drafts.amusements[kind] = {
        prompt:draw.querySelector('blockquote').textContent.trim(),
        observation:event.currentTarget.value.slice(0, 280)
      };
      autosave(draw.querySelector('[data-amusement-observation] span'));
    });
  });
  document.querySelectorAll('[data-save-amusement]').forEach(button => button.addEventListener('click', () => {
    const draw = button.closest('.amusement-draw');
    const observation = draw.querySelector('textarea').value.trim();
    const status = draw.querySelector('[data-amusement-observation] span');
    if (!observation) {
      status.textContent = 'Noteer eerst kort wat je merkte.';
      draw.querySelector('textarea').focus();
      return;
    }
    const kind = button.dataset.saveAmusement;
    const prompt = draw.querySelector('blockquote').textContent.trim();
    addLabSnapshot({ kind, title:kind === 'brain' ? 'Een proef in mijn hoofd' : 'Een proef tussen ons', prompt, expectation:'', observation });
    state.drafts.amusements[kind] = { prompt, observation:'' };
    draw.querySelector('textarea').value = '';
    saveProgress();
    status.textContent = 'Bewaard in Mijn spoor op dit apparaat.';
  }));

  const amusementTabs = [...document.querySelectorAll('[data-amusement-tab]')];
  const amusementPanels = [...document.querySelectorAll('[data-amusement-panel]')];
  function activateAmusementTab(index, moveFocus = false) {
    const active = amusementTabs[index];
    amusementTabs.forEach(item => {
      const selected = item === active;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    amusementPanels.forEach(panel => { panel.hidden = panel.dataset.amusementPanel !== active.dataset.amusementTab; });
    if (moveFocus) active.focus();
  }
  amusementTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateAmusementTab(index));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % amusementTabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + amusementTabs.length) % amusementTabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = amusementTabs.length - 1;
      else return;
      event.preventDefault();
      activateAmusementTab(next, true);
    });
  });

  renderQuizLibrary();
  syncControls();
})();
