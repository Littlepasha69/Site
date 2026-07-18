(function () {
  const checks = [...document.querySelectorAll('[data-week-days] input[type="checkbox"]')];
  const score = document.querySelector('[data-week-score]');
  const bar = document.querySelector('[data-week-bar]');
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
  let current = 0;

  function updateWeek() {
    const done = checks.filter(input => input.checked).length;
    score.textContent = `${done}/7`;
    bar.style.width = `${Math.round((done / checks.length) * 100)}%`;
  }

  checks.forEach(input => input.addEventListener('change', updateWeek));
  document.querySelector('[data-new-question]')?.addEventListener('click', () => {
    current = (current + 1) % questions.length;
    document.querySelector('[data-question-number]').textContent = `Vraag ${String(current + 1).padStart(2, '0')}`;
    document.querySelector('[data-reflection-question]').textContent = questions[current];
  });
  updateWeek();
})();
