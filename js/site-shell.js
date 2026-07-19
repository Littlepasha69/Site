class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || '';
    const base = this.getAttribute('base') || '';
    const links = [
      ['home', 'home.html', 'Ontdekken'],
      ['kennisbank', 'onderwerpen.html', 'Atlas'],
      ['spoor', 'menslab.html', 'Mijn spoor'],
      ['denkstukken', 'denkstukken.html', 'Denkstukken'],
      ['wegwijzer', 'wegwijzer.html', 'Wegwijzer'],
      ['community', 'community.html', 'Community']
    ];

    this.innerHTML = `
      <header class="site-header">
        <a class="skip-link" href="#inhoud">Ga naar de inhoud</a>
        <div class="site-header__inner">
          <a class="brand" href="${base}home.html" aria-label="De Onwijze Wijsheden – home">
            <img src="${base}images/logo-wide-ui.png" alt="" width="1000" height="333">
          </a>
          <nav class="site-nav" aria-label="Hoofdnavigatie">
            ${links.map(([key, href, label]) => `<a class="${key === 'spoor' ? 'site-nav__personal' : ''}" href="${base}${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          </nav>
          <a class="header-search" href="${base}zoeken.html" aria-label="Zoeken in de bibliotheek">Zoeken</a>
        </div>
      </header>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const base = this.getAttribute('base') || '';
    this.innerHTML = `
      <footer class="site-footer-new">
        <div>
          <p class="footer-mark">De Onwijze Wijsheden</p>
          <p>Een Nederlandstalige ontdekplek over de mens, verandering en het onbekende.</p>
        </div>
        <nav aria-label="Voettekstnavigatie">
          <a href="${base}manifest.html">Onze werkwijze</a>
          <a href="${base}onderwerpen.html">De Menselijke Atlas</a>
          <a href="${base}atlas-kompas.html">Het Atlas-kompas</a>
          <a href="${base}menslab.html">Mijn spoor</a>
          <a href="${base}speelhal.html">De Speelhal</a>
          <a href="${base}denkstukken.html">Denkstukken</a>
          <a href="${base}wegwijzer.html">De Wegwijzer</a>
          <a href="${base}nancy-onderweg.html">Nancy Onderweg</a>
          <a href="${base}community.html">Community</a>
          <a href="${base}bronnenbeleid.html">Bronnenbeleid</a>
          <a href="${base}correcties.html">Correcties</a>
          <a href="${base}communityregels.html">Communityregels</a>
          <a href="${base}privacy.html">Privacy</a>
          <a href="${base}dierenquiz.html">De Beestenquiz</a>
          <a href="${base}jouw-bijdrage.html">Draag iets bij</a>
          <a href="${base}over-mij.html">Over het platform</a>
          <a href="${base}index.html?welkom=1">Bekijk de ingang opnieuw</a>
        </nav>
        <p class="footer-small">© 2025–2026 · Lees wat we weten. Onderzoek wat er in jou beweegt.</p>
      </footer>`;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

(function enforceLocalRetention() {
  const profileKey = 'onwijze-profile-v1';
  const guestDayKey = 'onwijze-guest-day-v1';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const exactProgressKeys = new Set([
    'menslab-progress-v3', 'menslab-progress-v2', 'menslab-week-progress-v1',
    'menslab-exercise-drafts-v1', 'beestenquiz-progress-v2', 'quizkast-progress-v1',
    'dieptequiz-ja-progress-v1', 'onwijze-veranderroute-v2', 'onwijze-veranderroute-v1',
    'onwijze-atlas-footprints-v1', 'onwijze-reading-history-v1', 'onwijze-laatste-spoor',
    'onwijze-next-door-v1'
  ]);
  const personalPrefixes = ['onwijze-atlas-werkplaats-'];

  function hasProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
      return Boolean(profile && profile.version === 1 && profile.beastId);
    } catch (_) { return false; }
  }

  function clearGuestProgress() {
    try {
      const keys = [];
      for (let index = 0; index < localStorage.length; index += 1) keys.push(localStorage.key(index));
      keys.filter(Boolean).forEach(key => {
        if (exactProgressKeys.has(key) || personalPrefixes.some(prefix => key.startsWith(prefix))) localStorage.removeItem(key);
      });
    } catch (_) {}
  }

  const profiled = hasProfile();
  try {
    if (profiled) {
      localStorage.removeItem(guestDayKey);
    } else {
      const savedDay = localStorage.getItem(guestDayKey);
      if (savedDay !== today) clearGuestProgress();
      localStorage.setItem(guestDayKey, today);
    }
  } catch (_) {}

  window.ONWIJZE_RETENTION = { hasProfile:profiled, day:today, clearGuestProgress };
}());

(function rememberCurrentTrail() {
  const page = location.pathname.split('/').pop() || '';
  const excluded = new Set(['', 'index.html', 'home.html', 'zoeken.html', 'mijn-profiel.html']);
  if (excluded.has(page)) return;

  const heading = document.querySelector('main h1, article h1, h1');
  const title = heading?.textContent?.trim() || document.title.split('—')[0].trim();
  if (!title) return;

  try {
    localStorage.setItem('onwijze-laatste-spoor', JSON.stringify({
      href: location.href,
      title,
      savedAt: Date.now()
    }));
  } catch (error) {
    // De site blijft volledig bruikbaar zonder lokale opslag.
  }
}());

(function rememberReadingProgress() {
  if (document.querySelector('.dossier-page')) return;
  const main = document.querySelector('main');
  const page = location.pathname.split('/').pop() || '';
  const excluded = new Set(['', 'index.html', 'home.html', 'zoeken.html', 'onderwerpen.html', 'menslab.html', 'speelhal.html', 'emotionele-routekaart.html', 'mijn-profiel.html', 'privacy.html', 'forum.html', 'bijdragen.html']);
  if (!main || excluded.has(page)) return;

  const heading = main.querySelector('h1');
  const title = heading?.textContent?.trim() || document.title.split('—')[0].trim();
  if (!title) return;
  const key = 'onwijze-reading-history-v1';
  const url = location.href.split('#')[0];
  let lastSaved = -1;

  function saveReading(force = false) {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(100, Math.round(scrollY / scrollable * 100)));
    if (!force && lastSaved >= 0 && progress < lastSaved + 10) return;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      const history = Array.isArray(parsed) ? parsed : [];
      const previous = history.find(item => item.url === url);
      const entry = { url, title, progress:Math.max(Number(previous?.progress) || 0, progress), visitedAt:Date.now() };
      const next = [entry, ...history.filter(item => item.url !== url)].sort((a, b) => b.visitedAt - a.visitedAt).slice(0, 500);
      localStorage.setItem(key, JSON.stringify(next));
      lastSaved = entry.progress;
    } catch (_) {}
  }

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; saveReading(); });
  }, { passive:true });
  addEventListener('pagehide', () => saveReading(true));
  saveReading(true);
}());
