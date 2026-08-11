(() => {
  "use strict";

  const ASSET_ROOT = "https://matuasiak.github.io/dotyk-slov-assets/images";
  const isHomepage = () =>
    document.body.classList.contains("in-index") ||
    window.location.pathname === "/" ||
    window.location.pathname === "";

  const ensureFont = () => {
    if (document.querySelector('link[data-ds8-font]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
    link.dataset.ds8Font = "true";
    document.head.appendChild(link);
  };

  const products = [
    {
      url: "/damske-tricko--off-white-psik-je-laska/",
      image: `${ASSET_ROOT}/dotyk-product-black.webp`,
      imageClass: "ds8-product-image--black",
      tag: "Bestseller",
      name: "PSÍK JE LÁSKA",
      type: "Dámske tričko · off white",
      price: "23,90 €",
    },
    {
      url: "/damsky-crop-top--cierna-vsetko-prejde/",
      image: `${ASSET_ROOT}/dotyk-editorial-cream.webp`,
      imageClass: "ds8-product-image--cream",
      tag: "Nové",
      name: "VŠETKO PREJDE",
      type: "Dámsky crop top · čierna",
      price: "19,90 €",
    },
    {
      url: "/oversized-unisex-tricko--biela-anti-social-dog-owner/",
      image: `${ASSET_ROOT}/dotyk-product-black.webp`,
      imageClass: "ds8-product-image--stone",
      tag: "Core",
      name: "ANTI-SOCIAL DOG OWNER",
      type: "Oversize unisex tričko",
      price: "24,90 €",
    },
    {
      url: "/siltovka--vintage-red-tired-human/",
      image: `${ASSET_ROOT}/dotyk-editorial-cream.webp`,
      imageClass: "ds8-product-image--sand",
      tag: "Nové",
      name: "TIRED HUMAN",
      type: "Šiltovka · vintage red",
      price: "14,90 €",
    },
  ];

  const productCard = (product, index) => `
    <article class="ds8-product-card ds8-tilt-card" data-ds8-reveal style="--ds8-reveal-order:${index}">
      <a class="ds8-product-image ${product.imageClass}" href="${product.url}" aria-label="Pozrieť ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="ds8-product-tag">${product.tag}</span>
        <span class="ds8-quick-add" aria-hidden="true">+</span>
      </a>
      <div class="ds8-product-meta">
        <div><h3><a href="${product.url}">${product.name}</a></h3><p>${product.type}</p></div>
        <strong>${product.price}</strong>
      </div>
    </article>`;

  const homepageMarkup = `
    <div class="ds8-home" id="ds8-top">
      <section class="ds8-hero" id="novinky">
        <img src="${ASSET_ROOT}/dotyk-hero.webp" alt="Dotyk Slov streetwear editorial" fetchpriority="high">
        <div class="ds8-hero-shade"></div>
        <div class="ds8-hero-content" data-ds8-reveal>
          <p class="ds8-eyebrow ds8-eyebrow--light">NOVÝ DROP / 08—26</p>
          <h1>Nie všetko treba povedať nahlas.</h1>
          <p class="ds8-hero-copy">Niekedy stačí, keď to máš na sebe.</p>
          <div class="ds8-hero-actions">
            <a class="ds8-button ds8-button--light" href="#ds8-core">Pozrieť novinky</a>
            <a class="ds8-text-link ds8-text-link--light" href="#ds8-nalady">Vybrať podľa nálady →</a>
          </div>
        </div>
        <div class="ds8-hero-depth-card" aria-hidden="true"><span>VNÚTORNÝ MONOLÓG</span><strong>ON / OFF</strong><i></i></div>
        <div class="ds8-hero-note">DROP 04<br>PRE TÝCH, ČO CÍTIA VIAC</div>
      </section>

      <nav class="ds8-quick-categories" aria-label="Kategórie" data-ds8-reveal>
        <a href="/unisex-tricka/">Tričká<span>↗</span></a>
        <a href="/crop-topy/">Cropy<span>↗</span></a>
        <a href="/mikiny/">Mikiny<span>↗</span></a>
        <a href="/doplnky/">Šiltovky<span>↗</span></a>
        <a href="/doplnky/">Doplnky<span>↗</span></a>
        <a href="/oblecenie/">Všetko<span>↗</span></a>
      </nav>

      <section class="ds8-products-section" id="ds8-core">
        <div class="ds8-section-heading" data-ds8-reveal>
          <div><p class="ds8-eyebrow">CORE / VŽDY PRÍTOMNÉ</p><h2>Veci, ktoré hovoria za teba.</h2></div>
          <a class="ds8-text-link" href="/oblecenie/">Pozrieť všetko →</a>
        </div>
        <div class="ds8-product-grid">${products.map(productCard).join("")}</div>
      </section>

      <section class="ds8-depth-bridge" aria-label="Slová, ktoré nosíš" data-ds8-reveal>
        <div class="ds8-depth-bridge-track" aria-hidden="true"><span>SLOVÁ</span><span>KTORÉ</span><span>NOSÍŠ</span></div>
        <p>Niektoré vety ostanú v hlave. Iné idú s tebou.</p>
      </section>

      <section class="ds8-statement-panel" data-ds8-reveal>
        <div class="ds8-statement-orb" aria-hidden="true"></div>
        <p class="ds8-eyebrow ds8-eyebrow--light">DOTYK SLOV / OD 2022</p>
        <p class="ds8-statement-copy">Nie merch. Nálada, ktorú si môžeš obliecť.</p>
        <div class="ds8-statement-facts" data-ds8-reveal>
          <span><strong>lokálne</strong>potlačené u nás</span>
          <span><strong>od 1 kusa</strong>žiadna masovka</span>
          <span><strong>7 000+</strong>ľudí v komunite</span>
        </div>
      </section>

      <section class="ds8-moods-section" id="ds8-nalady">
        <div class="ds8-section-heading ds8-section-heading--compact" data-ds8-reveal>
          <div><p class="ds8-eyebrow">PODĽA NÁLADY</p><h2>Nájdi sa. Alebo sa aspoň skús.</h2></div>
        </div>
        <div class="ds8-mood-grid">
          <a class="ds8-mood-card ds8-mood-card--1 ds8-tilt-card" href="/produkty-podla-textu/" data-ds8-reveal style="--ds8-reveal-order:0">
            <img src="${ASSET_ROOT}/dotyk-editorial-cream.webp" alt="" loading="lazy"><span class="ds8-mood-overlay"></span><p>01 / OVERTHINKING</p><h3><span>Keď cítiš</span><span>príliš veľa.</span></h3><span class="ds8-mood-arrow">↗</span>
          </a>
          <a class="ds8-mood-card ds8-mood-card--2 ds8-tilt-card" href="/produkty-podla-textu/" data-ds8-reveal style="--ds8-reveal-order:1">
            <img src="${ASSET_ROOT}/dotyk-hero.webp" alt="" loading="lazy"><span class="ds8-mood-overlay"></span><p>02 / SOCIAL BATTERY</p><h3><span>Dnes to</span><span>nedávam.</span></h3><span class="ds8-mood-arrow">↗</span>
          </a>
          <a class="ds8-mood-card ds8-mood-card--3 ds8-tilt-card" href="/produkty-podla-textu/" data-ds8-reveal style="--ds8-reveal-order:2">
            <img src="${ASSET_ROOT}/dotyk-product-black.webp" alt="" loading="lazy"><span class="ds8-mood-overlay"></span><p>03 / MAIN CHARACTER</p><h3><span>Ale aspoň</span><span>dobre vyzerám.</span></h3><span class="ds8-mood-arrow">↗</span>
          </a>
        </div>
      </section>

      <section class="ds8-custom-section" id="ds8-tvoje-slova" data-ds8-reveal>
        <div class="ds8-custom-copy" data-ds8-reveal>
          <p class="ds8-eyebrow ds8-eyebrow--light">TVOJE SLOVÁ</p>
          <h2>Máš vetu, ktorú nikto iný nemá?</h2>
          <p>Pošli ju nám. My z nej spravíme vec, ktorú budeš chcieť nosiť častejšie než vlastné myšlienky.</p>
          <a href="/vytvor-si-vlastne-tricko-2/" class="ds8-button ds8-button--light">Vytvoriť vlastný kúsok</a>
        </div>
        <div class="ds8-thought-cloud" aria-hidden="true">
          <span class="ds8-thought ds8-thought--1">mám toho dosť</span><span class="ds8-thought ds8-thought--2">ale esteticky</span><span class="ds8-thought ds8-thought--3">...</span><span class="ds8-thought ds8-thought--4">asi som v pohode</span><span class="ds8-thought ds8-thought--5">neodpisujem</span>
        </div>
      </section>

      <section class="ds8-story-section" data-ds8-reveal>
        <div class="ds8-story-image ds8-parallax-frame"><img src="${ASSET_ROOT}/dotyk-editorial-cream.webp" alt="Dotyk Slov editorial" loading="lazy"></div>
        <div class="ds8-story-copy" data-ds8-reveal>
          <p class="ds8-eyebrow">ZNAČKA S VLASTNÝM HLASOM</p>
          <h2>Vzniklo to z viet, ktoré ostali v hlave.</h2>
          <p>Dotyk Slov je pre ľudí, ktorí cítia veľa, hovoria málo a humor používajú ako obranný mechanizmus. Každý kúsok navrhujeme a tlačíme lokálne.</p>
          <a href="/o-nas/" class="ds8-text-link">Náš príbeh →</a>
        </div>
      </section>

      <section class="ds8-newsletter" data-ds8-reveal>
        <div><p class="ds8-eyebrow">TICHÁ POŠTA</p><h2>Občas ti niečo povieme. Nahlas nie.</h2></div>
        <a class="ds8-newsletter-action" href="#formNewsletter"><span>tvoj@email.sk</span><strong>Chcem byť pri tom →</strong></a>
      </section>
    </div>`;

  const enhanceHeader = () => {
    const header = document.querySelector("#header");
    if (!header) return;
    const searchInput = header.querySelector(".search-input");
    if (searchInput) searchInput.placeholder = "Čo chceš povedať bez slov?";

    const buttons = header.querySelector(".navigation-buttons");
    const accountSource = header.querySelector('[data-testid="signin"]');
    if (buttons && accountSource && !buttons.querySelector(".ds8-account-link")) {
      const account = document.createElement("a");
      account.className = "ds-account-link ds8-account-link";
      account.href = accountSource.getAttribute("href") || "/login/";
      account.rel = "nofollow";
      account.setAttribute("aria-label", "Prihlásenie a účet");
      account.innerHTML = '<span class="ds-account-icon ds8-account-icon" aria-hidden="true"></span><span class="ds-account-text ds8-account-text">Účet</span>';
      const cart = buttons.querySelector(".cart-count");
      buttons.insertBefore(account, cart || buttons.lastElementChild);
    }
  };

  const enhanceFooter = () => {
    const footer = document.querySelector("#footer");
    if (!footer) return;
    footer.querySelectorAll(".ds-footer-brand,.ds8-footer-brand").forEach((node) => node.remove());
    footer.insertAdjacentHTML(
      "afterbegin",
      '<div class="container ds8-footer-brand"><strong>DOTYK SLOV<span>.</span></strong><p>Nie všetko treba povedať nahlas.</p></div>',
    );
  };

  const enhanceHomepage = () => {
    if (!isHomepage()) return;
    document.body.classList.add("ds8-home-active");
    const content = document.querySelector("#content");
    if (!content) return;
    content.querySelectorAll(":scope > .ds-home,:scope > .ds8-home").forEach((node) => node.remove());
    content.insertAdjacentHTML("afterbegin", homepageMarkup);
  };

  const initMotion = () => {
    const home = document.querySelector(".ds8-home");
    if (!home || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("ds8-motion-ready");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
        { rootMargin: "0px 0px -8%", threshold: 0.12 },
      );
      home.querySelectorAll("[data-ds8-reveal]").forEach((node) => observer.observe(node));
    } else {
      home.querySelectorAll("[data-ds8-reveal]").forEach((node) => node.classList.add("is-visible"));
    }

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const hero = home.querySelector(".ds8-hero");
      if (hero) {
        hero.addEventListener("pointermove", (event) => {
          const rect = hero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          hero.style.setProperty("--ds8-hero-x", `${x * 24}px`);
          hero.style.setProperty("--ds8-hero-y", `${y * 18}px`);
          hero.style.setProperty("--ds8-hero-rx", `${y * -2.8}deg`);
          hero.style.setProperty("--ds8-hero-ry", `${x * 3.2}deg`);
        });
        hero.addEventListener("pointerleave", () => {
          ["--ds8-hero-x", "--ds8-hero-y", "--ds8-hero-rx", "--ds8-hero-ry"].forEach((name) => hero.style.removeProperty(name));
        });
      }

      home.querySelectorAll(".ds8-tilt-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty("--ds8-tilt-x", `${(0.5 - y) * 7}deg`);
          card.style.setProperty("--ds8-tilt-y", `${(x - 0.5) * 7}deg`);
          card.style.setProperty("--ds8-glow-x", `${x * 100}%`);
          card.style.setProperty("--ds8-glow-y", `${y * 100}%`);
        });
        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--ds8-tilt-x", "0deg");
          card.style.setProperty("--ds8-tilt-y", "0deg");
        });
      });
    }

    const parallaxImage = home.querySelector(".ds8-parallax-frame img");
    if (parallaxImage && window.matchMedia("(min-width: 821px)").matches) {
      let ticking = false;
      const updateParallax = () => {
        const rect = parallaxImage.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const shift = Math.max(-22, Math.min(22, center * -0.035));
        parallaxImage.style.setProperty("--ds8-parallax-y", `${shift}px`);
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateParallax);
      }, { passive: true });
      updateParallax();
    }
  };

  const init = () => {
    ensureFont();
    document.documentElement.classList.add("ds-clean-theme", "ds8-theme");
    document.body.classList.add("ds-clean-theme", "ds8-theme");
    enhanceHeader();
    enhanceFooter();
    enhanceHomepage();
    initMotion();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
