(function () {
  const checks = [...document.querySelectorAll('[data-week-days] input[type="checkbox"]')];
  const score = document.querySelector('[data-week-score]');
  const bar = document.querySelector('[data-week-bar]');
  const note = document.querySelector('[data-week-note]');
  const noteStatus = document.querySelector('[data-week-note-status]');
  const completion = document.querySelector('[data-week-complete]');
  const nextIntention = document.querySelector('[data-next-intention]');
  const resume = document.querySelector('[data-progress-resume]');
  const fileStatus = document.querySelector('[data-track-file-status]');
  const progressStorageKey = 'menslab-progress-v3';
  const previousStorageKey = 'menslab-progress-v2';
  const legacyStorageKey = 'menslab-week-progress-v1';
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
  let currentQuestion = 0;
  let state = emptyState();

  function emptyState() {
    return {
      checks: new Array(checks.length).fill(false),
      note: '',
      startedAt: new Date().toISOString(),
      completedWeeks: [],
      carryForward: '',
      quizSnapshots: []
    };
  }

  function normalizeState(value) {
    const clean = emptyState();
    if (!value || typeof value !== 'object') return clean;
    if (Array.isArray(value.checks)) clean.checks = checks.map((_, index) => value.checks[index] === true);
    if (typeof value.note === 'string') clean.note = value.note.slice(0, 280);
    if (typeof value.startedAt === 'string') clean.startedAt = value.startedAt;
    if (typeof value.carryForward === 'string') clean.carryForward = value.carryForward.slice(0, 160);
    if (Array.isArray(value.completedWeeks)) {
      clean.completedWeeks = value.completedWeeks.slice(0, 48).filter(item => item && typeof item.completedAt === 'string').map(item => {
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
      clean.quizSnapshots = value.quizSnapshots.slice(0, 24).filter(item => item && typeof item.savedAt === 'string' && typeof item.resultTitle === 'string').map(item => ({
        quizId: typeof item.quizId === 'string' ? item.quizId : '',
        quizTitle: typeof item.quizTitle === 'string' ? item.quizTitle.slice(0, 120) : 'Quizkast',
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
    return clean;
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
      if (item.reflection) {
        const reflection = document.createElement('em');
        reflection.textContent = item.reflection;
        row.append(reflection);
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

  function renderProgress() {
    const done = state.checks.filter(Boolean).length;
    const weeks = state.completedWeeks.length;
    const archivedTotal = state.completedWeeks.reduce((sum, week) => sum + week.movements.length, 0);
    const total = archivedTotal + done;
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

    const hasProgress = done > 0 || weeks > 0 || state.quizSnapshots.length > 0 || Boolean(state.note) || Boolean(state.carryForward);
    resume.hidden = !hasProgress;
    if (hasProgress) {
      const resumeText = document.querySelector('[data-resume-text]');
      if (done > 0) resumeText.textContent = `Je hebt ${done} van de ${checks.length} kleine bewegingen geprobeerd.`;
      else if (state.carryForward) resumeText.textContent = 'Er ligt iets uit je vorige week voor je klaar.';
      else if (state.note) resumeText.textContent = 'Je notitie voor deze week staat hier nog klaar.';
      else if (state.quizSnapshots.length) resumeText.textContent = 'Er staat een nieuwe quizspiegel in Mijn spoor.';
      else resumeText.textContent = `Je hebt al ${weeks} bewaarde ${weeks === 1 ? 'week' : 'weken'} in Mijn spoor.`;
    }
    renderHistory();
    renderQuizSnapshots();
    renderDepthPatterns();
    renderPatterns();
    renderReview();
  }

  function syncControls() {
    checks.forEach((input, index) => { input.checked = state.checks[index]; });
    note.value = state.note;
    nextIntention.value = '';
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

  note.addEventListener('input', () => { noteStatus.textContent = ''; });

  document.querySelector('[data-archive-week]')?.addEventListener('click', () => {
    const movements = state.checks.map((checked, index) => checked ? index : -1).filter(index => index >= 0);
    if (!movements.length) return;
    state.note = note.value.trim();
    const carryForward = nextIntention.value.trim();
    state.completedWeeks.unshift({ completedAt: new Date().toISOString(), note: state.note, carryForward, movements });
    state.carryForward = carryForward;
    state.checks = new Array(checks.length).fill(false);
    state.note = '';
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
    state.startedAt = new Date().toISOString();
    saveProgress();
    syncControls();
    noteStatus.textContent = 'Deze week is leeggemaakt.';
  });

  document.querySelector('[data-export-track]')?.addEventListener('click', () => {
    const payload = { format: 'menslab-spoor', version: 1, exportedAt: new Date().toISOString(), data: state };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mijn-menslab-spoor-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    fileStatus.textContent = 'Je spoor is als lokaal bestand klaargezet.';
  });

  document.querySelector('[data-import-track]')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (payload?.format !== 'menslab-spoor' || payload?.version !== 1 || !payload.data) throw new Error('Ongeldig bestand');
      state = normalizeState(payload.data);
      saveProgress();
      syncControls();
      fileStatus.textContent = 'Je bewaarde spoor is teruggezet.';
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
      clearTrack.textContent = 'Klik nog eens om alles te wissen';
      clearTimeout(clearTrackTimer);
      clearTrackTimer = setTimeout(() => {
        clearTrackArmed = false;
        clearTrack.textContent = 'Wis mijn hele spoor';
      }, 5000);
      return;
    }
    clearTimeout(clearTrackTimer);
    clearTrackArmed = false;
    state = emptyState();
    try {
      localStorage.removeItem(progressStorageKey);
      localStorage.removeItem(previousStorageKey);
      localStorage.removeItem(legacyStorageKey);
    } catch (_) {}
    syncControls();
    noteStatus.textContent = 'Mijn spoor is gewist.';
    clearTrack.textContent = 'Wis mijn hele spoor';
  });

  document.querySelector('[data-new-question]')?.addEventListener('click', () => {
    currentQuestion = (currentQuestion + 1) % questions.length;
    document.querySelector('[data-question-number]').textContent = `Vraag ${String(currentQuestion + 1).padStart(2, '0')}`;
    document.querySelector('[data-reflection-question]').textContent = questions[currentQuestion];
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
    target.closest('.amusement-draw')?.classList.remove('amusement-draw--changing');
    void target.offsetWidth;
    target.textContent = items[next];
    target.closest('.amusement-draw')?.classList.add('amusement-draw--changing');
    button.setAttribute('aria-label', `Nieuwe mini-proef. Huidige proef: ${items[next]}`);
  }

  document.querySelector('[data-new-brain-amusement]')?.addEventListener('click', event => drawAmusement('[data-brain-amusement-prompt]', brainAmusements, event.currentTarget));
  document.querySelector('[data-new-together-amusement]')?.addEventListener('click', event => drawAmusement('[data-together-amusement-prompt]', togetherAmusements, event.currentTarget));

  const amusementTabs = [...document.querySelectorAll('[data-amusement-tab]')];
  const amusementPanels = [...document.querySelectorAll('[data-amusement-panel]')];
  amusementTabs.forEach(tab => tab.addEventListener('click', () => {
    const selected = tab.dataset.amusementTab;
    amusementTabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
    amusementPanels.forEach(panel => { panel.hidden = panel.dataset.amusementPanel !== selected; });
    document.querySelector(`[data-amusement-panel="${selected}"]`)?.focus({ preventScroll: true });
  }));

  loadProgress();
  syncControls();
})();
