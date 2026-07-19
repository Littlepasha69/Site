(function () {
  const gate = document.querySelector('[data-dada-gate]');
  if (!gate) return;

  const STORAGE_KEY = 'speelhal-dada-intro-day-v2';
  const narrator = gate.querySelector('[data-dada-narrator]');
  const roleButtons = Array.from(gate.querySelectorAll('[data-dada-role]'));
  const nihilist = gate.querySelector('[data-dada-role="nihilist"]');
  const enterButton = gate.querySelector('[data-dada-enter]');
  const backButton = gate.querySelector('[data-dada-back]');
  const finishButtons = Array.from(gate.querySelectorAll('[data-dada-finish]'));
  const replayButton = document.querySelector('[data-dada-replay]');
  const backgroundNodes = Array.from(document.querySelectorAll('body > site-header, body > site-footer, main > :not([data-dada-gate])'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverCounts = new Map();
  let timers = [];
  let active = false;
  let startedAt = 0;
  let userHasInteracted = false;
  let interactionCount = 0;
  let nihilistEscaped = false;
  let chaseCount = 0;
  let backChanged = false;
  let lastFocused = null;

  function localDay() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  }

  function readDay() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
  }

  function rememberToday() {
    try { window.localStorage.setItem(STORAGE_KEY, localDay()); } catch (error) { /* De entree werkt ook zonder opslag. */ }
  }

  function later(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach(function (timer) { window.clearTimeout(timer); });
    timers = [];
  }

  function say(message) {
    narrator.textContent = message;
    gate.classList.remove('is-waiting');
  }

  function chooseRole(button) {
    roleButtons.forEach(function (item) {
      const chosen = item === button;
      item.classList.toggle('is-chosen', chosen);
      item.setAttribute('aria-pressed', chosen ? 'true' : 'false');
    });
  }

  function letNihilistEscape() {
    if (!active || nihilistEscaped) return;
    nihilistEscaped = true;
    gate.classList.add('has-breakout');
    nihilist?.querySelector('small')?.replaceChildren('“Het maakt toch niets uit welke knop je kiest.”');
    say('“Het maakt toch niets uit welke knop je kiest.”');
    later(function () {
      if (!active || !nihilistEscaped) return;
      gate.classList.add('has-returned');
      nihilist?.querySelector('small')?.replaceChildren('“Maar blijf van míjn knop.”');
      say('“Maar blijf van míjn knop.”');
    }, reducedMotion ? 0 : 1350);
  }

  function armScene() {
    later(function () {
      if (active && !userHasInteracted) letNihilistEscape();
    }, 2100);
    later(function () {
      if (!active || userHasInteracted) return;
      gate.classList.add('is-waiting');
      narrator.textContent = 'Je wacht. Dat is óók gedrag.';
    }, 6100);
  }

  function resetStage() {
    clearTimers();
    gate.classList.remove('is-visible', 'is-leaving', 'is-crumbling', 'is-waiting', 'has-breakout', 'has-returned', 'is-watching', 'control-scene', 'pleaser-backpedals', 'door-changed', 'is-chased-a', 'is-chased-b');
    roleButtons.forEach(function (button) {
      button.classList.remove('is-chosen');
      button.setAttribute('aria-pressed', 'false');
      const small = button.querySelector('small');
      if (small && button.dataset.originalSmall) small.textContent = button.dataset.originalSmall;
    });
    hoverCounts.clear();
    userHasInteracted = false;
    interactionCount = 0;
    nihilistEscaped = false;
    chaseCount = 0;
    backChanged = false;
    if (backButton) backButton.textContent = '← IK WIL TERUG';
    narrator.textContent = 'Vijf keurige kaders. Wat kan er misgaan?';
  }

  function releaseBackground() {
    gate.hidden = true;
    document.body.classList.remove('dada-intro-active');
    backgroundNodes.forEach(function (node) {
      node.inert = false;
      node.removeAttribute('aria-hidden');
    });
    resetStage();
    if (lastFocused && lastFocused !== document.body && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function finishIntro(crumble) {
    if (!active) return;
    active = false;
    clearTimers();
    if (crumble && !reducedMotion) {
      gate.classList.add('is-crumbling');
      later(releaseBackground, 980);
      return;
    }
    gate.classList.add('is-leaving');
    gate.classList.remove('is-visible');
    later(releaseBackground, reducedMotion ? 0 : 500);
  }

  function showIntro() {
    if (active) return;
    lastFocused = document.activeElement;
    resetStage();
    rememberToday();
    active = true;
    startedAt = Date.now();
    gate.hidden = false;
    document.body.classList.add('dada-intro-active');
    backgroundNodes.forEach(function (node) {
      node.inert = true;
      node.setAttribute('aria-hidden', 'true');
    });
    window.requestAnimationFrame(function () {
      gate.classList.add('is-visible');
      roleButtons[0]?.focus({ preventScroll: true });
    });
    armScene();
  }

  function immediateClick() {
    return interactionCount === 0 && Date.now() - startedAt < 1600;
  }

  roleButtons.forEach(function (button) {
    const small = button.querySelector('small');
    if (small) button.dataset.originalSmall = small.textContent;
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('pointerenter', function () {
      if (!active || hoverCounts.get(button) === 'done') return;
      const count = Number(hoverCounts.get(button) || 0) + 1;
      hoverCounts.set(button, count);
      if (count === 3) {
        userHasInteracted = true;
        clearTimers();
        hoverCounts.set(button, 'done');
        gate.classList.add('is-watching');
        say('Je hebt hem nu drie keer niet gekozen.');
      }
    });

    button.addEventListener('click', function () {
      if (!active) return;
      const wasImmediate = immediateClick();
      userHasInteracted = true;
      interactionCount += 1;
      clearTimers();
      chooseRole(button);

      if (button === nihilist && nihilistEscaped) {
        chaseCount += 1;
        gate.classList.toggle('is-chased-a', chaseCount % 2 === 1);
        gate.classList.toggle('is-chased-b', chaseCount % 2 === 0);
        say('Controle voelt soms verrassend veel als achter iets aanlopen.');
        return;
      }

      if (button.dataset.dadaRole === 'controleur') gate.classList.add('control-scene');
      if (button.dataset.dadaRole === 'pleaser') {
        gate.classList.add('pleaser-backpedals');
        if (small) small.textContent = '“Of kies gerust iemand anders, echt geen probleem.”';
      }
      if (button === nihilist) letNihilistEscape();

      if (wasImmediate) {
        say('Dat ging snel. Was het nieuwsgierigheid of wilde je gewoon van deze vraag af?');
        if (button !== nihilist) later(function () { if (active) say(button.dataset.dadaMessage); }, 1250);
      } else if (button !== nihilist) {
        say(button.dataset.dadaMessage);
      }
    });
  });

  enterButton?.addEventListener('click', function () {
    if (!active) return;
    const wasImmediate = immediateClick();
    userHasInteracted = true;
    interactionCount += 1;
    clearTimers();
    if (wasImmediate) {
      say('Dat ging snel. Was het nieuwsgierigheid of wilde je gewoon van deze vraag af?');
      later(function () { finishIntro(true); }, 1050);
      return;
    }
    finishIntro(true);
  });

  backButton?.addEventListener('click', function () {
    if (!active) return;
    userHasInteracted = true;
    clearTimers();
    if (backChanged) {
      finishIntro(false);
      return;
    }
    backChanged = true;
    gate.classList.add('door-changed');
    backButton.textContent = 'DE DEUR STAAT NU DAAR →';
    say('Je mag weg. De deur is alleen even van mening veranderd.');
  });

  finishButtons.forEach(function (button) {
    button.addEventListener('click', function () { finishIntro(false); });
  });
  replayButton?.addEventListener('click', showIntro);
  document.addEventListener('keydown', function (event) {
    if (active && event.key === 'Escape') finishIntro(false);
  });

  const url = new URL(window.location.href);
  const forced = url.searchParams.get('intro') === '1' || window.location.hash === '#vreemde-entree';
  const enteredFromMyTrack = url.searchParams.get('entree') === 'spoor';
  const opensSpecificGame = url.searchParams.has('quiz');
  if (forced || enteredFromMyTrack) {
    url.searchParams.delete('intro');
    url.searchParams.delete('entree');
    if (window.location.hash === '#vreemde-entree') url.hash = '';
    window.history.replaceState({}, '', url);
  }
  if (forced || enteredFromMyTrack || (!opensSpecificGame && readDay() !== localDay())) showIntro();
}());
