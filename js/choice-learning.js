(() => {
  const setupChoiceLab = () => {
    const lab = document.querySelector('[data-choice-lab]');
    if (!lab) return;

    const cases = Array.from(lab.querySelectorAll('[data-choice-case]'));
    const progress = lab.querySelector('[data-choice-progress]');
    const complete = lab.querySelector('[data-choice-complete]');
    const reset = lab.querySelector('[data-choice-reset]');

    const updateProgress = () => {
      const answered = cases.filter(item => item.dataset.answered === 'true').length;
      progress.textContent = `${answered}/${cases.length} ontleed`;
      complete.hidden = answered !== cases.length;
    };

    cases.forEach(item => {
      const correct = item.dataset.correct;
      const feedback = item.querySelector('[data-choice-feedback]');
      const verdict = item.querySelector('[data-choice-verdict]');
      const buttons = Array.from(item.querySelectorAll('[data-choice-answer]'));

      buttons.forEach(button => {
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          if (item.dataset.answered === 'true') return;
          const chosen = button.dataset.choiceAnswer;
          const isCorrect = chosen === correct;

          item.dataset.answered = 'true';
          item.classList.add('is-answered');
          buttons.forEach(option => {
            option.setAttribute('aria-pressed', String(option === button));
            option.setAttribute('aria-disabled', 'true');
            if (option.dataset.choiceAnswer === correct) option.classList.add('is-correct');
          });
          if (!isCorrect) button.classList.add('is-missed');
          verdict.textContent = isCorrect ? 'Sterk gezien.' : 'Logische gedachte — kijk nog één laag verder.';
          feedback.hidden = false;
          updateProgress();
        });
      });
    });

    reset?.addEventListener('click', () => {
      cases.forEach(item => {
        delete item.dataset.answered;
        item.classList.remove('is-answered');
        item.querySelector('[data-choice-feedback]').hidden = true;
        item.querySelectorAll('[data-choice-answer]').forEach(button => {
          button.classList.remove('is-correct', 'is-missed');
          button.removeAttribute('aria-disabled');
          button.setAttribute('aria-pressed', 'false');
        });
      });
      updateProgress();
      cases[0]?.querySelector('[data-choice-answer]')?.focus();
    });

    updateProgress();
  };

  const setupRecallCheck = () => {
    const check = document.querySelector('[data-recall-check]');
    if (!check) return;

    const items = Array.from(check.querySelectorAll('[data-recall-item]'));
    const progress = check.querySelector('[data-recall-progress]');
    const result = check.querySelector('[data-recall-result]');
    const scoreNode = check.querySelector('[data-recall-score]');
    const title = check.querySelector('[data-recall-title]');
    const summary = check.querySelector('[data-recall-summary]');
    const reset = check.querySelector('[data-recall-reset]');

    const updateResult = () => {
      const answered = items.filter(item => item.dataset.answered === 'true');
      const score = answered.filter(item => item.dataset.correctAnswer === 'true').length;
      progress.textContent = `${answered.length}/${items.length} beantwoord`;
      result.hidden = answered.length !== items.length;
      if (result.hidden) return;

      scoreNode.textContent = `${score}/${items.length}`;
      if (score === items.length) {
        title.textContent = 'Je hebt de nuance mee.';
        summary.textContent = 'Niet één oorzaak, niet één schuldige en niet één automatische uitkomst.';
      } else if (score >= 2) {
        title.textContent = 'De kern zit er bijna helemaal.';
        summary.textContent = 'Lees vooral de uitleg bij de gemiste bewering; daar zit precies de interessante grens.';
      } else {
        title.textContent = 'Mooi: nu weet je waar het schuurt.';
        summary.textContent = 'Een lage score is hier geen oordeel. De feedback toont welke vanzelfsprekende mensformule te simpel klonk.';
      }
    };

    items.forEach(item => {
      const correct = item.dataset.correct;
      const feedback = item.querySelector('[data-recall-feedback]');
      const verdict = item.querySelector('[data-recall-verdict]');
      const buttons = Array.from(item.querySelectorAll('[data-recall-answer]'));

      buttons.forEach(button => {
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          if (item.dataset.answered === 'true') return;
          const isCorrect = button.dataset.recallAnswer === correct;
          item.dataset.answered = 'true';
          item.dataset.correctAnswer = String(isCorrect);
          item.classList.add('is-answered');

          buttons.forEach(option => {
            option.setAttribute('aria-pressed', String(option === button));
            option.setAttribute('aria-disabled', 'true');
            if (option.dataset.recallAnswer === correct) option.classList.add('is-correct');
          });
          if (!isCorrect) button.classList.add('is-missed');
          verdict.textContent = isCorrect ? 'Juist.' : 'Niet helemaal.';
          feedback.hidden = false;
          updateResult();
        });
      });
    });

    reset?.addEventListener('click', () => {
      items.forEach(item => {
        delete item.dataset.answered;
        delete item.dataset.correctAnswer;
        item.classList.remove('is-answered');
        item.querySelector('[data-recall-feedback]').hidden = true;
        item.querySelectorAll('[data-recall-answer]').forEach(button => {
          button.classList.remove('is-correct', 'is-missed');
          button.removeAttribute('aria-disabled');
          button.setAttribute('aria-pressed', 'false');
        });
      });
      updateResult();
      items[0]?.querySelector('[data-recall-answer]')?.focus();
    });

    updateResult();
  };

  setupChoiceLab();
  setupRecallCheck();
})();
