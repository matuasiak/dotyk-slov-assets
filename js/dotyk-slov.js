(() => {
  "use strict";

  const CONFIG = window.DOTYK_SLOV_THEME || {};
  const ASSET_ROOT = "https://matuasiak.github.io/dotyk-slov-assets/images";

  const get = (path, fallback) => {
    const value = path.split(".").reduce((current, key) => current?.[key], CONFIG);
    return value === undefined || value === null || value === "" ? fallback : value;
  };

  const list = (path, fallback = []) => {
    const value = get(path, fallback);
    return Array.isArray(value) ? value : fallback;
  };

  const enabled = (name, fallback = true) => Boolean(get(`features.${name}`, fallback));

  const escapeHTML = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const safeURL = (value, fallback = "#") => {
    const url = String(value || "").trim();
    return /^(#|\/|https:\/\/)/i.test(url) ? escapeHTML(url) : fallback;
  };

  const isHomepage = () =>
    document.body.classList.contains("in-index") || ["", "/"].includes(window.location.pathname);

  const isProduct = () =>
    document.body.classList.contains("type-detail") || document.body.classList.contains("type-product");

  const isCart = () =>
    document.body.classList.contains("in-kosik") || window.location.pathname.includes("kosik");

  const isThankYou = () =>
    document.body.classList.contains("in-dekujeme") || /dakujeme|thank-you|objednavka[/]dokoncena/i.test(window.location.pathname);

  const ensureFont = () => {
    if (document.querySelector('link[data-ds-font]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
    link.dataset.dsFont = "true";
    document.head.appendChild(link);
  };

  const applyDesignTokens = () => {
    const color = (path, fallback) => {
      const value = String(get(path, fallback)).trim();
      return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    };
    const radius = Number(get("design.cornerRadius", 24));
    const root = document.documentElement;
    root.style.setProperty("--ds-ink", color("design.ink", "#0b0b0b"));
    root.style.setProperty("--ds-paper", color("design.paper", "#f5f4f0"));
    root.style.setProperty("--ds-accent", color("design.accent", "#d9ff45"));
    root.style.setProperty("--ds-violet", color("design.violet", "#5c46ed"));
    root.style.setProperty("--ds-radius", `${Math.max(12, Math.min(40, Number.isFinite(radius) ? radius : 24))}px`);
  };

  const enhanceAnnouncement = () => {
    if (!enabled("announcement")) return;
    const header = document.querySelector("#header");
    if (!header || header.querySelector(":scope > .ds-announcement")) return;
    const messages = list("announcement", ["Doprava zdarma nad 50 €", "Ručne a lokálne potlačené"]);
    if (!messages.length) return;
    const bar = document.createElement("div");
    bar.className = "ds-announcement";
    bar.dataset.dsOwned = "announcement";
    bar.setAttribute("aria-label", "Informácie o nákupe");
    bar.innerHTML = `<div class="ds-announcement__track">${messages
      .map((message) => `<span>${escapeHTML(message)}</span>`)
      .join("")}</div>`;
    header.prepend(bar);
  };

  const enhanceHeader = () => {
    const header = document.querySelector("#header");
    if (!header) return;
    header.classList.add("ds-header");
    if (enabled("stickyHeader")) header.classList.add("ds-header--sticky");
    const input = header.querySelector(".search-input");
    if (input) input.placeholder = get("header.searchPlaceholder", "Čo chceš povedať bez slov?");
  };

  const categoryMarkup = () =>
    list("categories", [
      { label: "Tričká", url: "/unisex-tricka/" },
      { label: "Cropy", url: "/crop-topy/" },
      { label: "Mikiny", url: "/mikiny/" },
      { label: "Doplnky", url: "/doplnky/" },
    ])
      .slice(0, 6)
      .map((item) => `<a href="${safeURL(item.url)}"><span>${escapeHTML(item.label)}</span><i aria-hidden="true">↗</i></a>`)
      .join("");

  const enhanceHero = (content) => {
    const hero = content.querySelector(":scope > .banners-row");
    if (!hero) return null;
    hero.classList.add("ds-native-hero");
    if (!enabled("heroOverlay") || hero.querySelector(":scope > .ds-hero-copy")) return hero;
    const copy = document.createElement("div");
    copy.className = "ds-hero-copy ds-reveal";
    copy.dataset.dsOwned = "hero-copy";
    copy.innerHTML = `
      <p>${escapeHTML(get("hero.eyebrow", "NOVÝ DROP"))}</p>
      <h1>${escapeHTML(get("hero.headline", "Nie všetko treba povedať nahlas."))}</h1>
      <span>${escapeHTML(get("hero.copy", "Niekedy stačí, keď to máš na sebe."))}</span>
      <div>
        <a class="ds-button ds-button--light" href="${safeURL(get("hero.primaryUrl", "#ds-products"))}">${escapeHTML(get("hero.primaryLabel", "Pozrieť novinky"))}</a>
        <a class="ds-text-link ds-text-link--light" href="${safeURL(get("hero.secondaryUrl", "#ds-editorial"))}">${escapeHTML(get("hero.secondaryLabel", "Vybrať podľa nálady"))} →</a>
      </div>`;
    hero.appendChild(copy);
    return hero;
  };

  const enhanceQuickCategories = (hero) => {
    if (!hero || !enabled("quickCategories") || document.querySelector(".ds-quick-categories")) return;
    const nav = document.createElement("nav");
    nav.className = "ds-quick-categories";
    nav.dataset.dsOwned = "quick-categories";
    nav.setAttribute("aria-label", "Kategórie");
    nav.innerHTML = categoryMarkup();
    hero.insertAdjacentElement("afterend", nav);
  };

  const collectProductGroups = (content) => {
    const children = [...content.children];
    return children.flatMap((heading, index) => {
      if (!heading.classList.contains("homepage-group-title")) return [];
      const nextHeading = children.slice(index + 1).findIndex((node) => node.classList.contains("homepage-group-title"));
      const candidates = nextHeading < 0 ? children.slice(index + 1) : children.slice(index + 1, index + 1 + nextHeading);
      const wrapper = candidates.find((node) => node.classList.contains("products-wrapper"));
      return wrapper ? [{ heading, wrapper }] : [];
    });
  };

  const enhanceProductGroups = (content) => {
    const groups = collectProductGroups(content);
    groups.forEach(({ heading, wrapper }, index) => {
      heading.classList.add("ds-product-heading");
      wrapper.classList.add("ds-native-products");
      heading.dataset.dsGroup = String(index);
      wrapper.dataset.dsGroup = String(index);
    });
    if (!groups.length || !enabled("productTabs") || content.querySelector(":scope > .ds-product-tabs")) return groups;

    const tabs = document.createElement("div");
    tabs.className = "ds-product-tabs";
    tabs.id = "ds-products";
    tabs.dataset.dsOwned = "product-tabs";
    tabs.setAttribute("role", "tablist");

    const activate = (activeIndex) => {
      groups.forEach(({ heading, wrapper }, index) => {
        const active = index === activeIndex;
        heading.classList.toggle("is-active", active);
        wrapper.classList.toggle("is-active", active);
      });
      [...tabs.children].forEach((button, index) => {
        const active = index === activeIndex;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
      window.dispatchEvent(new Event("resize"));
    };

    groups.forEach(({ heading }, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ds-product-tab";
      button.textContent = heading.textContent.trim() || `Kolekcia ${index + 1}`;
      button.setAttribute("role", "tab");
      button.addEventListener("click", () => activate(index));
      tabs.appendChild(button);
    });
    groups[0].heading.insertAdjacentElement("beforebegin", tabs);
    activate(0);
    return groups;
  };

  const moodMarkup = () =>
    list("moods.cards", [])
      .slice(0, 4)
      .map((mood, index) => `
        <a class="ds-mood-card ds-reveal" href="${safeURL(mood.url, "/produkty-podla-textu/")}">
          <img src="${safeURL(mood.image, `${ASSET_ROOT}/dotyk-hero.webp`)}" alt="" loading="lazy">
          <span></span><p>${escapeHTML(mood.label || `0${index + 1} / NÁLADA`)}</p>
          <h3>${escapeHTML(mood.headline || "Nájdi sa v slovách.")}</h3><i aria-hidden="true">↗</i>
        </a>`)
      .join("");

  const factsMarkup = () =>
    list("statement.facts", [])
      .slice(0, 3)
      .map((fact) => `<span><strong>${escapeHTML(fact.value)}</strong>${escapeHTML(fact.label)}</span>`)
      .join("");

  const thoughtsMarkup = () =>
    list("custom.thoughts", ["mám toho dosť", "ale esteticky", "...", "asi som v pohode", "neodpisujem"])
      .slice(0, 5)
      .map((thought, index) => `<span class="ds-thought ds-thought--${index + 1}">${escapeHTML(thought)}</span>`)
      .join("");

  const editorialMarkup = () => `
    <section class="ds-statement ds-reveal">
      <p class="ds-eyebrow ds-eyebrow--light">${escapeHTML(get("statement.eyebrow", "DOTYK SLOV / OD 2022"))}</p>
      <h2>${escapeHTML(get("statement.headline", "Nie merch. Nálada, ktorú si môžeš obliecť."))}</h2>
      <div>${factsMarkup()}</div>
    </section>
    <section class="ds-moods">
      <div class="ds-section-title ds-reveal"><p class="ds-eyebrow">${escapeHTML(get("moods.eyebrow", "PODĽA NÁLADY"))}</p><h2>${escapeHTML(get("moods.headline", "Nájdi sa. Alebo sa aspoň skús."))}</h2></div>
      <div class="ds-mood-grid">${moodMarkup()}</div>
    </section>
    <section class="ds-custom ds-reveal">
      <div><p class="ds-eyebrow ds-eyebrow--light">${escapeHTML(get("custom.eyebrow", "TVOJE SLOVÁ"))}</p><h2>${escapeHTML(get("custom.headline", "Máš vetu, ktorú nikto iný nemá?"))}</h2><p>${escapeHTML(get("custom.copy", "Pošli ju nám. My ju prenesieme na kúsok, ktorý bude iba tvoj."))}</p><a class="ds-button ds-button--light" href="${safeURL(get("custom.buttonUrl", "/vytvor-si-vlastne-tricko-2/"))}">${escapeHTML(get("custom.buttonLabel", "Vytvoriť vlastný kúsok"))}</a></div>
      <div class="ds-thoughts" aria-hidden="true">${thoughtsMarkup()}</div>
    </section>
    <section class="ds-story ds-reveal">
      <div><img src="${safeURL(get("story.image", `${ASSET_ROOT}/dotyk-editorial-cream.webp`))}" alt="Dotyk Slov editorial" loading="lazy"></div>
      <article><p class="ds-eyebrow">${escapeHTML(get("story.eyebrow", "ZNAČKA S VLASTNÝM HLASOM"))}</p><h2>${escapeHTML(get("story.headline", "Vzniklo to z viet, ktoré ostali v hlave."))}</h2><p>${escapeHTML(get("story.copy", "Dotyk Slov je pre ľudí, ktorí cítia veľa, hovoria málo a humor používajú ako obranný mechanizmus."))}</p><a class="ds-text-link" href="${safeURL(get("story.buttonUrl", "/o-nas/"))}">${escapeHTML(get("story.buttonLabel", "Náš príbeh"))} →</a></article>
    </section>
    <section class="ds-newsletter ds-reveal">
      <div><p class="ds-eyebrow">${escapeHTML(get("newsletter.eyebrow", "TICHÁ POŠTA"))}</p><h2>${escapeHTML(get("newsletter.headline", "Občas ti niečo povieme. Nahlas nie."))}</h2></div>
      <a href="#formNewsletterWidget"><span>${escapeHTML(get("newsletter.placeholder", "tvoj@email.sk"))}</span><strong>${escapeHTML(get("newsletter.buttonLabel", "Chcem byť pri tom"))} →</strong></a>
    </section>`;

  const enhanceEditorial = (content, groups) => {
    if (!enabled("editorialSections") || content.querySelector(":scope > .ds-editorial")) return;
    const section = document.createElement("div");
    section.className = "ds-editorial";
    section.id = "ds-editorial";
    section.dataset.dsOwned = "editorial";
    section.innerHTML = editorialMarkup();
    const anchor = groups.at(-1)?.wrapper || content.lastElementChild;
    if (anchor) anchor.insertAdjacentElement("afterend", section);
    else content.appendChild(section);
  };

  const enhanceHomepage = () => {
    if (!isHomepage()) return;
    const content = document.querySelector("#content");
    if (!content) return;
    document.body.classList.add("ds-home-page");
    const hero = enhanceHero(content);
    enhanceQuickCategories(hero);
    content.querySelector(":scope > .benefitBanner")?.classList.add("ds-native-benefits");
    const groups = enhanceProductGroups(content);
    enhanceEditorial(content, groups);
  };

  const enhanceProductPage = () => {
    if (!isProduct()) return;
    document.body.classList.add("ds-product-page");
    if (!enabled("productAssurances")) return;
    const cartBlock = document.querySelector(".p-to-cart-block");
    if (!cartBlock || document.querySelector(".ds-product-assurance")) return;
    const assurance = document.createElement("div");
    assurance.className = "ds-product-assurance";
    assurance.dataset.dsOwned = "product-assurance";
    assurance.innerHTML = list("productPage.assurances", ["Ručne a lokálne potlačené", "Doprava zdarma od 50 €", "Bezpečná platba"])
      .map((item) => `<span><i aria-hidden="true">✓</i>${escapeHTML(item)}</span>`)
      .join("");
    cartBlock.insertAdjacentElement("afterend", assurance);
  };

  const enhanceCart = () => {
    if (!isCart()) return;
    document.body.classList.add("ds-cart-page");
    if (!enabled("cartConfidence")) return;
    const summary = document.querySelector(".row.summary");
    if (!summary || document.querySelector(".ds-cart-confidence")) return;
    const block = document.createElement("aside");
    block.className = "ds-cart-confidence";
    block.dataset.dsOwned = "cart-confidence";
    block.innerHTML = `<div>${list("cart.confidence", ["Lokálna výroba", "Bezpečná platba", "Doprava zdarma od 50 €"])
      .map((item) => `<span><i aria-hidden="true">✓</i>${escapeHTML(item)}</span>`).join("")}</div><a href="${safeURL(get("cart.addOnUrl", "/doplnky/"))}"><strong>${escapeHTML(get("cart.addOnLabel", "Drobnosť, ktorá dotiahne košík"))}</strong><small>${escapeHTML(get("cart.addOnCopy", "Pozri doplnky bez zbytočného presviedčania."))}</small><b aria-hidden="true">↗</b></a>`;
    summary.insertAdjacentElement("afterend", block);
  };

  const enhanceFooter = () => {
    if (!enabled("footerBrand")) return;
    const footer = document.querySelector("#footer");
    if (!footer || footer.querySelector(":scope > .ds-footer-brand")) return;
    const brand = document.createElement("div");
    brand.className = "container ds-footer-brand";
    brand.dataset.dsOwned = "footer-brand";
    brand.innerHTML = "<strong>DOTYK SLOV<span>.</span></strong><p>Nie všetko treba povedať nahlas.</p>";
    footer.prepend(brand);
  };

  const enhanceThankYou = () => {
    if (!isThankYou() || !enabled("postPurchase")) return;
    const content = document.querySelector("#content .content-inner, #content");
    if (!content || content.querySelector(".ds-post-purchase")) return;
    const section = document.createElement("section");
    section.className = "ds-post-purchase";
    section.dataset.dsOwned = "post-purchase";
    section.innerHTML = `<p>${escapeHTML(get("postPurchase.eyebrow", "OBJEDNÁVKA JE U NÁS"))}</p><h2>${escapeHTML(get("postPurchase.headline", "Tvoje slová už idú do sveta."))}</h2><span>${escapeHTML(get("postPurchase.copy", "Keď kúsok dorazí, označ nás. Možno sa v tom nájde niekto ďalší."))}</span><a href="${safeURL(get("postPurchase.buttonUrl", "/produkty-podla-textu/"))}">${escapeHTML(get("postPurchase.buttonLabel", "Pozrieť ďalšie nálady"))} →</a>`;
    content.appendChild(section);
  };

  const initMotion = () => {
    if (document.documentElement.classList.contains("ds-motion-ready")) return;
    document.documentElement.classList.add("ds-motion-ready");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".ds-reveal").forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -8%", threshold: 0.08 });
    document.querySelectorAll(".ds-reveal").forEach((node) => observer.observe(node));
  };

  const start = () => {
    ensureFont();
    applyDesignTokens();
    document.documentElement.classList.add("ds-theme");
    document.body.classList.add("ds-theme");
    enhanceAnnouncement();
    enhanceHeader();
    enhanceHomepage();
    enhanceProductPage();
    enhanceCart();
    enhanceThankYou();
    enhanceFooter();
    initMotion();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
  document.addEventListener("shoptetDOMReady", start);
  document.addEventListener("ShoptetDOMPageContentLoaded", start);
})();
