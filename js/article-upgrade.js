(function () {
  document.body.classList.add('article-modern');

  const oldHeader = document.querySelector('body > header');
  let header = document.querySelector('body > site-header');
  if (!header) {
    header = document.createElement('site-header');
    header.setAttribute('active', 'denkstukken');
    if (oldHeader) oldHeader.replaceWith(header);
    else document.body.prepend(header);
  }

  const container = document.querySelector('.denkbox-container');
  const titleBox = container?.querySelector('.title-box');
  if (titleBox) {
    const kicker = document.createElement('p');
    kicker.className = 'article-kicker';
    kicker.textContent = container.dataset.kicker || 'Denkstuk';
    titleBox.prepend(kicker);

    const articleText = container?.querySelector('.denktext');
    const wordCount = articleText?.textContent.trim().split(/\s+/).filter(Boolean).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 220));
    const details = document.createElement('div');
    details.className = 'article-details';
    details.innerHTML = `<span>${readingTime} min. leestijd</span><span>${wordCount.toLocaleString('nl-BE')} woorden</span>`;
    titleBox.append(details);
  }

  if (container) {
    const back = document.createElement('nav');
    back.className = 'article-back';
    back.setAttribute('aria-label', 'Kruimelpad');
    back.innerHTML = '<a href="denkstukken.html">← Alle denkstukken</a>';
    container.insertAdjacentElement('beforebegin', back);
  }

  const progress = document.createElement('div');
  progress.className = 'article-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.prepend(progress);

  const progressBar = progress.firstElementChild;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 0;
    progressBar.style.width = `${percentage}%`;
  }
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (!document.querySelector('site-footer')) document.body.append(document.createElement('site-footer'));
})();
