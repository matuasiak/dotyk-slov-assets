(() => {
  "use strict";

  const isHomepage = () =>
    document.body.classList.contains("in-index") ||
    window.location.pathname === "/" ||
    window.location.pathname === "";

  const homepageMarkup = `
    <div class="ds-home ds-clean-home">
      <section class="ds-clean-hero" aria-labelledby="ds-clean-title">
        <div class="ds-clean-shell ds-clean-hero-grid">
          <div class="ds-clean-hero-copy">
            <p class="ds-clean-kicker">Dotyk Slov · oblečenie, ktoré povie dosť</p>
            <h1 id="ds-clean-title">Nie všetko treba povedať nahlas.</h1>
            <p>Pre ľudí, ktorí cítia veľa, hovoria menej a chcú nosiť niečo, čo ich naozaj vystihuje.</p>
            <div class="ds-clean-actions">
              <a class="ds-clean-button" href="#ds-products">Pozrieť novinky</a>
              <a class="ds-clean-button ds-clean-button--quiet" href="/oblecenie/">Všetko oblečenie</a>
            </div>
          </div>

          <nav class="ds-clean-categories" aria-label="Hlavné kategórie">
            <a href="/unisex-tricka/"><span>01</span><strong>Tričká</strong><i>→</i></a>
            <a href="/crop-topy/"><span>02</span><strong>Cropy</strong><i>→</i></a>
            <a href="/mikiny/"><span>03</span><strong>Mikiny</strong><i>→</i></a>
            <a href="/doplnky/"><span>04</span><strong>Doplnky</strong><i>→</i></a>
            <a href="/limitky/"><span>05</span><strong>Limitky</strong><i>→</i></a>
            <a href="/vytvor-si-vlastne-tricko-2/"><span>06</span><strong>Vlastný text</strong><i>→</i></a>
          </nav>
        </div>
      </section>

      <section class="ds-clean-benefits" aria-label="Výhody nákupu">
        <div class="ds-clean-shell ds-clean-benefits-grid">
          <div><strong>Originálne texty</strong><span>Nie z Pinterestu. Zo života.</span></div>
          <div><strong>Lokálna výroba</strong><span>Každý kus prejde našimi rukami.</span></div>
          <div><strong>Doprava zdarma</strong><span>Pri nákupe nad 50 €.</span></div>
          <div><strong>Jednoduchá výmena</strong><span>Keď veľkosť netrafí náladu.</span></div>
        </div>
      </section>

      <section class="ds-clean-products-intro" id="ds-products">
        <div class="ds-clean-shell">
          <p>Vybrané vnútorné monológy</p>
          <div>
            <h2>Práve sa nosí.</h2>
            <a href="/oblecenie/">Zobraziť všetko <span>→</span></a>
          </div>
        </div>
      </section>
    </div>`;

  const statementMarkup = `
    <section class="ds-clean-statement">
      <div class="ds-clean-shell">
        <p>Nie iba potlač. Skôr myšlienka, ktorú nemusíš vysvetľovať.</p>
        <div>
          <strong>Ak toto chápeš,<br>patríš sem.</strong>
          <a href="/o-nas/">O Dotyku Slov <span>→</span></a>
        </div>
      </div>
    </section>`;

  const enhanceHeader = () => {
    const header = document.querySelector("#header");
    if (!header) return;

    const searchInput = header.querySelector(".search-input");
    if (searchInput) searchInput.placeholder = "Čo chceš povedať bez slov?";

    const buttons = header.querySelector(".navigation-buttons");
    if (!buttons || buttons.querySelector(".ds-account-link")) return;

    const accountSource = header.querySelector('[data-testid="signin"]');
    if (!accountSource) return;

    const account = document.createElement("a");
    account.className = "ds-account-link";
    account.href = accountSource.getAttribute("href") || "/login/";
    account.rel = "nofollow";
    account.setAttribute("aria-label", "Prihlásenie a účet");
    account.innerHTML =
      '<span class="ds-account-icon" aria-hidden="true"></span><span class="ds-account-text">Účet</span>';

    const cart = buttons.querySelector(".cart-count");
    buttons.insertBefore(account, cart || buttons.lastElementChild);
  };

  const enhanceFooter = () => {
    const footer = document.querySelector("#footer");
    if (!footer || footer.querySelector(".ds-footer-brand")) return;

    footer.insertAdjacentHTML(
      "afterbegin",
      '<div class="container ds-footer-brand"><strong>DOTYK SLOV</strong><p>Nie všetko treba povedať nahlas.</p></div>',
    );
  };

  const enhanceHomepage = () => {
    if (!isHomepage()) return;

    document.body.classList.add("ds-home-active", "ds-clean-home-active");
    const content = document.querySelector("#content");
    if (!content) return;

    const existingHomepage = content.querySelector(":scope > .ds-home");
    if (existingHomepage) existingHomepage.remove();
    content.insertAdjacentHTML("afterbegin", homepageMarkup);

    const productHeadings = [
      ...content.querySelectorAll(":scope > .homepage-group-title"),
    ];
    productHeadings.forEach((heading, index) => {
      heading.classList.add("ds-native-product-heading");
      if (index === 0)
        heading.classList.add("ds-native-product-heading--first");
    });

    content
      .querySelectorAll(":scope > .products-wrapper")
      .forEach((wrapper) => wrapper.classList.add("ds-native-products"));

    const lastProducts = content.querySelector(
      ":scope > .products-wrapper:last-of-type",
    );
    if (lastProducts)
      lastProducts.insertAdjacentHTML("afterend", statementMarkup);
  };

  const init = () => {
    document.documentElement.classList.add("ds-clean-theme");
    document.body.classList.add("ds-clean-theme");
    enhanceHeader();
    enhanceFooter();
    enhanceHomepage();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
