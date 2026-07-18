class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || '';
    const base = this.getAttribute('base') || '';
    const links = [
      ['home', 'home.html', 'Ontdekken'],
      ['kennisbank', 'onderwerpen.html', 'Atlas'],
      ['menslab', 'menslab.html', 'Menslab'],
      ['denkstukken', 'denkstukken.html', 'Denkstukken'],
      ['wegwijzer', 'wegwijzer.html', 'Wegwijzer'],
      ['community', 'community.html', 'Community']
    ];

    this.innerHTML = `
      <header class="site-header">
        <a class="skip-link" href="#inhoud">Ga naar de inhoud</a>
        <div class="site-header__inner">
          <a class="brand" href="${base}home.html" aria-label="De Onwijze Wijsheden – home">
            <img src="${base}images/logo-wide.png" alt="" width="2172" height="724">
          </a>
          <nav class="site-nav" aria-label="Hoofdnavigatie">
            ${links.map(([key, href, label]) => `<a href="${base}${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
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
          <a href="${base}menslab.html">Menslab</a>
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
        </nav>
        <p class="footer-small">© 2025–2026 · Lees wat we weten. Onderzoek wat er in jou beweegt.</p>
      </footer>`;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
