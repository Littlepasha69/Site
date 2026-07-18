class SiteHeader extends HTMLElement {
  connectedCallback() {
    const active = this.getAttribute('active') || '';
    const links = [
      ['home', 'index.html', 'Ontdekken'],
      ['kennisbank', 'onderwerpen.html', 'Atlas'],
      ['menslab', 'menslab.html', 'Menslab'],
      ['denkstukken', 'denkstukken.html', 'Denkstukken'],
      ['community', 'forum.html', 'Community']
    ];

    this.innerHTML = `
      <header class="site-header">
        <a class="skip-link" href="#inhoud">Ga naar de inhoud</a>
        <div class="site-header__inner">
          <a class="brand" href="index.html" aria-label="De Onwijze Wijsheden – home">
            <img src="images/logo-wide.png" alt="" width="2172" height="724">
          </a>
          <nav class="site-nav" aria-label="Hoofdnavigatie">
            ${links.map(([key, href, label]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
          </nav>
          <a class="header-search" href="zoeken.html" aria-label="Zoeken in de bibliotheek">Zoeken</a>
        </div>
      </header>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer-new">
        <div>
          <p class="footer-mark">De Onwijze Wijsheden</p>
          <p>Een Nederlandstalige ontdekplek over de mens, verandering en het onbekende.</p>
        </div>
        <nav aria-label="Voettekstnavigatie">
          <a href="manifest.html">Onze werkwijze</a>
          <a href="onderwerpen.html">De Menselijke Atlas</a>
          <a href="menslab.html">Menslab</a>
          <a href="denkstukken.html">Denkstukken</a>
          <a href="bronnenbeleid.html">Bronnenbeleid</a>
          <a href="correcties.html">Correcties</a>
          <a href="communityregels.html">Communityregels</a>
          <a href="privacy.html">Privacy</a>
          <a href="dierenquiz.html">De Beestenquiz</a>
          <a href="jouw-bijdrage.html">Draag iets bij</a>
          <a href="over-mij.html">Over het platform</a>
        </nav>
        <p class="footer-small">© 2025–2026 · Lees wat we weten. Onderzoek wat er in jou beweegt.</p>
      </footer>`;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
