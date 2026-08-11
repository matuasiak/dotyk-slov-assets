(() => {
  "use strict";

  const CONFIG_URL = "https://matuasiak.github.io/dotyk-slov-assets/js/dotyk-slov.config.js";
  let CONFIG = window.DOTYK_SLOV_THEME || {};
  let started = false;
  const FALLBACK_ASSETS = "https://matuasiak.github.io/dotyk-slov-assets/images";

  const get = (path, fallback) => {
    const value = path.split(".").reduce((current, key) => current?.[key], CONFIG);
    return value === undefined || value === null || value === "" ? fallback : value;
  };

  const list = (path, fallback = []) => {
    const value = get(path, fallback);
    return Array.isArray(value) ? value : fallback;
  };

  const escapeHTML = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const safeURL = (value, fallback = "#") => {
    const url = String(value || "").trim();
    if (/^(#|\/|https:\/\/)/i.test(url)) return escapeHTML(url);
    return fallback;
  };

  const isHomepage = () =>
    document.body.classList.contains("in-index") || ["", "/"].includes(window.location.pathname);

  const isProduct = () =>
    document.body.classList.contains("type-detail") || document.body.classList.contains("type-product");

  const isCart = () =>
    document.body.classList.contains("in-kosik") || window.location.pathname.includes("kosik");

  const isThankYou = () =>
    document.body.classList.contains("in-dekujeme") || /dakujeme|thank-you|objednavka[/]dokoncena/i.test(window.location.pathname);

  const removeLegacyState = () => {
    const legacy = [
      "ds-clean-theme",
      "ds-clean-home-active",
      "ds-home-active",
      "ds8-theme",
      "ds8-home-active",
      "ds8-motion-ready",
    ];
    document.documentElement.classList.remove(...legacy);
    document.body.classList.remove(...legacy);
    document.querySelectorAll(".ds-home,.ds8-home,.ds8-footer-brand,.ds-footer-brand,.ds-quicknav,#ds-topbar").forEach((node) => node.remove());
  };

  const ensureFont = () => {
    if (document.querySelector('link[data-ds9-font]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
    link.dataset.ds9Font = "true";
    document.head.appendChild(link);
  };

  const applyDesignTokens = () => {
    const color = (path, fallback) => {
      const value = String(get(path, fallback)).trim();
      return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    };
    const radius = Number(get("design.cornerRadius", 26));
    const root = document.documentElement;
    root.style.setProperty("--ds9-ink", color("design.ink", "#0b0b0b"));
    root.style.setProperty("--ds9-paper", color("design.paper", "#f5f4f0"));
    root.style.setProperty("--ds9-acid", color("design.accent", "#d9ff45"));
    root.style.setProperty("--ds9-violet", color("design.violet", "#5c46ed"));
    root.style.setProperty("--ds9-radius", `${Math.max(12, Math.min(40, Number.isFinite(radius) ? radius : 26))}px`);
  };

  const renderAnnouncement = () => {
    const header = document.querySelector("#header");
    if (!header) return;
    header.querySelectorAll(":scope > .ds9-announcement").forEach((node) => node.remove());
    const messages = list("announcement", ["Doprava zdarma nad 50 €", "Ručne a lokálne potlačené"]);
    if (!messages.length) return;
    const bar = document.createElement("div");
    bar.className = "ds9-announcement";
    bar.setAttribute("aria-label", "Informácie o nákupe");
    bar.innerHTML = `<div class="ds9-announcement-track">${messages
      .map((message) => `<span>${escapeHTML(message)}</span>`)
      .join("")}</div>`;
    header.prepend(bar);
  };

  const enhanceHeader = () => {
    const header = document.querySelector("#header");
    if (!header) return;
    renderAnnouncement();

    const searchInput = header.querySelector(".search-input");
    if (searchInput) searchInput.placeholder = "Čo chceš povedať bez slov?";

    const buttons = header.querySelector(".navigation-buttons");
    if (buttons && !buttons.querySelector(".ds9-account-link")) {
      const account = document.createElement("a");
      account.className = "ds9-account-link";
      account.href = "/client-center/";
      account.rel = "nofollow";
      account.setAttribute("aria-label", "Prihlásenie a účet");
      account.innerHTML = '<span class="ds9-account-icon" aria-hidden="true"></span><span>Účet</span>';
      const cart = [...buttons.children].find(
        (node) => node.matches?.(".cart-count") || node.querySelector?.(".cart-count"),
      );
      buttons.insertBefore(account, cart || null);
    }
  };

  const enhanceFooter = () => {
    const footer = document.querySelector("#footer");
    if (!footer) return;
    footer.querySelectorAll(".ds9-footer-brand").forEach((node) => node.remove());
    footer.insertAdjacentHTML(
      "afterbegin",
      '<div class="container ds9-footer-brand"><strong>DOTYK SLOV<span>.</span></strong><p>Nie všetko treba povedať nahlas.</p></div>',
    );
  };

  const categoriesMarkup = () => {
    const categories = list("categories", [
      { label: "Tričká", url: "/unisex-tricka/" },
      { label: "Cropy", url: "/crop-topy/" },
      { label: "Mikiny", url: "/mikiny/" },
      { label: "Doplnky", url: "/doplnky/" },
    ]);
    return categories
      .map(
        (item) =>
          `<a href="${safeURL(item.url)}"><span>${escapeHTML(item.label)}</span><i aria-hidden="true">↗</i></a>`,
      )
      .join("");
  };

  const factsMarkup = () =>
    list("statement.facts", [
      { value: "lokálne", label: "potlačené u nás" },
      { value: "od 1 kusa", label: "žiadna masovka" },
      { value: "7 000+", label: "ľudí v komunite" },
    ])
      .map((fact) => `<span><strong>${escapeHTML(fact.value)}</strong>${escapeHTML(fact.label)}</span>`)
      .join("");

  const moodsMarkup = () =>
    list("moods.cards", [])
      .slice(0, 4)
      .map(
        (mood, index) => `
          <a class="ds9-mood-card ds9-tilt-card" href="${safeURL(mood.url, "/produkty-podla-textu/")}" data-ds9-reveal style="--ds9-order:${index}">
            <img src="${safeURL(mood.image, `${FALLBACK_ASSETS}/dotyk-hero.webp`)}" alt="" loading="lazy">
            <span class="ds9-mood-overlay"></span>
            <p>${escapeHTML(mood.label || `0${index + 1} / NÁLADA`)}</p>
            <h3>${escapeHTML(mood.headline || "Nájdi sa v slovách.")}</h3>
            <span class="ds9-mood-arrow" aria-hidden="true">↗</span>
          </a>`,
      )
      .join("");

  const thoughtsMarkup = () =>
    list("custom.thoughts", ["mám toho dosť", "ale esteticky", "...", "asi som v pohode", "neodpisujem"])
      .slice(0, 5)
      .map((thought, index) => `<span class="ds9-thought ds9-thought--${index + 1}">${escapeHTML(thought)}</span>`)
      .join("");

  const homepageMarkup = (welcomeTitle, welcomeCopy) => {
    const bridgeWords = list("bridge.words", ["SLOVÁ", "KTORÉ", "NOSÍŠ"]).slice(0, 3);
    return `
      <div class="ds9-home" id="ds9-top">
        <section class="ds9-hero" id="novinky">
          <div class="ds9-hero-media"></div>
          <div class="ds9-hero-shade"></div>
          <div class="ds9-hero-content" data-ds9-reveal>
            <p class="ds9-eyebrow ds9-eyebrow--light">${escapeHTML(get("hero.eyebrow", "NOVÝ DROP"))}</p>
            <h1>${escapeHTML(welcomeTitle || get("hero.headline", "Nie všetko treba povedať nahlas."))}</h1>
            <p class="ds9-hero-copy">${escapeHTML(welcomeCopy || get("hero.copy", "Niekedy stačí, keď to máš na sebe."))}</p>
            <div class="ds9-hero-actions">
              <a class="ds9-button ds9-button--light" href="${safeURL(get("hero.primaryUrl", "#ds9-products"))}">${escapeHTML(get("hero.primaryLabel", "Pozrieť novinky"))}</a>
              <a class="ds9-text-link ds9-text-link--light" href="${safeURL(get("hero.secondaryUrl", "#ds9-moods"))}">${escapeHTML(get("hero.secondaryLabel", "Vybrať podľa nálady"))} →</a>
            </div>
          </div>
          <div class="ds9-hero-depth-card" aria-hidden="true"><span>${escapeHTML(get("hero.floatingLabel", "VNÚTORNÝ MONOLÓG"))}</span><strong>${escapeHTML(get("hero.floatingValue", "ON / OFF"))}</strong><i></i></div>
        </section>

        <nav class="ds9-quick-categories" aria-label="Kategórie" data-ds9-reveal>${categoriesMarkup()}</nav>
        <div class="ds9-benefits-slot"></div>

        <section class="ds9-products-area" id="ds9-products">
          <div class="ds9-section-heading" data-ds9-reveal>
            <div><p class="ds9-eyebrow">${escapeHTML(get("products.eyebrow", "VYBRANÉ PRE TEBA"))}</p><h2>${escapeHTML(get("products.headline", "Veci, ktoré hovoria za teba."))}</h2></div>
            <a class="ds9-text-link" href="${safeURL(get("products.allUrl", "/oblecenie/"))}">${escapeHTML(get("products.allLabel", "Pozrieť všetko"))} →</a>
          </div>
          <div class="ds9-products-stack"></div>
        </section>

        <section class="ds9-depth-bridge" aria-label="Slová, ktoré nosíš" data-ds9-reveal>
          <div class="ds9-depth-bridge-track" aria-hidden="true">${bridgeWords.map((word) => `<span>${escapeHTML(word)}</span>`).join("")}</div>
          <p>${escapeHTML(get("bridge.copy", "Niektoré vety ostanú v hlave. Iné idú s tebou."))}</p>
        </section>

        <section class="ds9-statement-panel" data-ds9-reveal>
          <div class="ds9-statement-orb" aria-hidden="true"></div>
          <p class="ds9-eyebrow ds9-eyebrow--light">${escapeHTML(get("statement.eyebrow", "DOTYK SLOV / OD 2022"))}</p>
          <p class="ds9-statement-copy">${escapeHTML(get("statement.headline", "Nie merch. Nálada, ktorú si môžeš obliecť."))}</p>
          <div class="ds9-statement-facts">${factsMarkup()}</div>
        </section>

        <section class="ds9-moods-section" id="ds9-moods">
          <div class="ds9-section-heading" data-ds9-reveal>
            <div><p class="ds9-eyebrow">${escapeHTML(get("moods.eyebrow", "PODĽA NÁLADY"))}</p><h2>${escapeHTML(get("moods.headline", "Nájdi sa. Alebo sa aspoň skús."))}</h2></div>
          </div>
          <div class="ds9-mood-grid">${moodsMarkup()}</div>
        </section>

        <section class="ds9-custom-section" id="ds9-custom" data-ds9-reveal>
          <div class="ds9-custom-copy">
            <p class="ds9-eyebrow ds9-eyebrow--light">${escapeHTML(get("custom.eyebrow", "TVOJE SLOVÁ"))}</p>
            <h2>${escapeHTML(get("custom.headline", "Máš vetu, ktorú nikto iný nemá?"))}</h2>
            <p>${escapeHTML(get("custom.copy", "Pošli ju nám. My ju prenesieme na kúsok, ktorý bude iba tvoj."))}</p>
            <a class="ds9-button ds9-button--light" href="${safeURL(get("custom.buttonUrl", "/vytvor-si-vlastne-tricko-2/"))}">${escapeHTML(get("custom.buttonLabel", "Vytvoriť vlastný kúsok"))}</a>
          </div>
          <div class="ds9-thought-cloud" aria-hidden="true">${thoughtsMarkup()}</div>
        </section>

        <section class="ds9-story-section" data-ds9-reveal>
          <div class="ds9-story-image ds9-parallax-frame"><img src="${safeURL(get("story.image", `${FALLBACK_ASSETS}/dotyk-editorial-cream.webp`))}" alt="Dotyk Slov editorial" loading="lazy"></div>
          <div class="ds9-story-copy">
            <p class="ds9-eyebrow">${escapeHTML(get("story.eyebrow", "ZNAČKA S VLASTNÝM HLASOM"))}</p>
            <h2>${escapeHTML(get("story.headline", "Vzniklo to z viet, ktoré ostali v hlave."))}</h2>
            <p>${escapeHTML(get("story.copy", "Dotyk Slov je pre ľudí, ktorí cítia veľa, hovoria málo a humor používajú ako obranný mechanizmus."))}</p>
            <a class="ds9-text-link" href="${safeURL(get("story.buttonUrl", "/o-nas/"))}">${escapeHTML(get("story.buttonLabel", "Náš príbeh"))} →</a>
          </div>
        </section>

        <section class="ds9-newsletter" data-ds9-reveal>
          <div><p class="ds9-eyebrow">${escapeHTML(get("newsletter.eyebrow", "TICHÁ POŠTA"))}</p><h2>${escapeHTML(get("newsletter.headline", "Občas ti niečo povieme. Nahlas nie."))}</h2></div>
          <a class="ds9-newsletter-action" href="#formNewsletterWidget"><span>${escapeHTML(get("newsletter.placeholder", "tvoj@email.sk"))}</span><strong>${escapeHTML(get("newsletter.buttonLabel", "Chcem byť pri tom"))} →</strong></a>
        </section>
      </div>`;
  };

  const getWelcomeContent = (content) => {
    const welcome = content.querySelector(":scope > .welcome-wrapper, :scope > .homepage-text, :scope > .container-narrow .welcome-wrapper");
    if (!welcome) return { title: "", copy: "", node: null };
    const title = welcome.querySelector("h1")?.textContent?.trim() || "";
    const copy = welcome.querySelector("p")?.textContent?.trim() || "";
    return { title, copy, node: welcome };
  };

  const collectProductGroups = (content) => {
    const children = [...content.children];
    const groups = [];
    children.forEach((node, index) => {
      if (!node.classList.contains("homepage-group-title")) return;
      const wrapper = children.slice(index + 1).find((candidate) => candidate.classList.contains("products-wrapper"));
      if (wrapper && !groups.some((group) => group.wrapper === wrapper)) groups.push({ heading: node, wrapper });
    });
    return groups;
  };

  const prepareNativeProductGroup = ({ heading, wrapper }, index, host) => {
    const section = document.createElement("section");
    section.className = "ds9-native-product-section";
    section.dataset.groupIndex = String(index);
    heading.classList.add("ds9-native-product-heading");
    wrapper.classList.add("ds9-native-products");
    wrapper.removeAttribute("style");
    wrapper.querySelectorAll(".product-slider,.products-block,.product").forEach((node) => node.removeAttribute("style"));
    section.append(heading, wrapper);
    host.appendChild(section);
  };

  const prepareProductTabs = (home) => {
    const sections = [...home.querySelectorAll(".ds9-native-product-section")];
    if (sections.length < 2) return;
    const tabs = document.createElement("div");
    tabs.className = "ds9-product-tabs";
    tabs.setAttribute("role", "tablist");
    sections.forEach((section, index) => {
      const title = section.querySelector(".homepage-group-title")?.textContent?.trim() || `Kolekcia ${index + 1}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `ds9-product-tab${index === 0 ? " is-active" : ""}`;
      button.textContent = title;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      section.classList.toggle("is-active", index === 0);
      button.addEventListener("click", () => {
        tabs.querySelectorAll(".ds9-product-tab").forEach((tab) => {
          tab.classList.remove("is-active");
          tab.setAttribute("aria-selected", "false");
        });
        sections.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        button.setAttribute("aria-selected", "true");
        section.classList.add("is-active");
      });
      tabs.appendChild(button);
    });
    home.querySelector(".ds9-products-stack")?.before(tabs);
  };

  const enhanceHomepage = () => {
    if (!isHomepage()) return;
    const content = document.querySelector("#content");
    if (!content) return;

    const bannerRow = content.querySelector(":scope > .banners-row");
    const benefits = content.querySelector(":scope > .benefitBanner");
    const groups = collectProductGroups(content);
    const welcome = getWelcomeContent(content);

    content.querySelectorAll(":scope > .ds9-home").forEach((node) => node.remove());
    content.insertAdjacentHTML("afterbegin", homepageMarkup(welcome.title, welcome.copy));
    const home = content.querySelector(":scope > .ds9-home");
    if (!home) return;

    document.body.classList.add("ds9-home-active");
    content.classList.add("ds9-content");

    const mediaHost = home.querySelector(".ds9-hero-media");
    if (bannerRow) {
      bannerRow.classList.add("ds9-native-hero");
      bannerRow.querySelectorAll("a[target='_blank']").forEach((link) => link.removeAttribute("target"));
      mediaHost.appendChild(bannerRow);
    } else {
      mediaHost.innerHTML = `<img src="${safeURL(get("hero.fallbackImage", `${FALLBACK_ASSETS}/dotyk-hero.webp`))}" alt="Dotyk Slov" fetchpriority="high">`;
    }

    if (benefits) {
      benefits.classList.add("ds9-native-benefits");
      home.querySelector(".ds9-benefits-slot")?.appendChild(benefits);
    }

    const productsHost = home.querySelector(".ds9-products-stack");
    groups.forEach((group, index) => prepareNativeProductGroup(group, index, productsHost));
    prepareProductTabs(home);
    if (!groups.length) {
      productsHost.innerHTML = '<a class="ds9-products-empty" href="/oblecenie/">Produkty nastavíš v Shoptete v časti Produkty → Titulná strana.</a>';
    }

    welcome.node?.remove();
    content.querySelectorAll(":scope > .container-narrow:empty").forEach((node) => node.remove());
  };

  const enhanceProductPage = () => {
    if (!isProduct()) return;
    document.body.classList.add("ds9-product-page");

    const cartBlock = document.querySelector(".p-to-cart-block");
    if (cartBlock && !document.querySelector(".ds9-product-assurance")) {
      const assurance = document.createElement("div");
      assurance.className = "ds9-product-assurance";
      assurance.innerHTML = list("productPage.assurances", ["Ručne a lokálne potlačené", "Doprava zdarma od 50 €", "Bezpečná platba"])
        .map((item) => `<span><i aria-hidden="true">✓</i>${escapeHTML(item)}</span>`)
        .join("");
      cartBlock.insertAdjacentElement("afterend", assurance);
    }

    const related = document.querySelector(".products-related");
    if (related && !document.querySelector(".ds9-related-intro")) {
      const intro = document.createElement("div");
      intro.className = "ds9-related-intro";
      intro.innerHTML = `<p>${escapeHTML(get("productPage.relatedEyebrow", "DÁVA ZMYSEL SPOLU"))}</p><h2>${escapeHTML(get("productPage.relatedHeadline", "Ešte jedna veta do nálady."))}</h2><span>${escapeHTML(get("productPage.relatedCopy", "Doplnky a kúsky, ktoré sa k tomuto produktu prirodzene hodia."))}</span>`;
      related.parentNode.insertBefore(intro, related);
      related.classList.add("ds9-related-products");
    }
  };

  const enhanceCart = () => {
    if (!isCart()) return;
    document.body.classList.add("ds9-cart-page");

    const delivery = document.querySelector(".extra.delivery");
    delivery?.classList.add("ds9-shipping-progress");

    const summary = document.querySelector(".row.summary");
    if (summary && !document.querySelector(".ds9-cart-confidence")) {
      const block = document.createElement("aside");
      block.className = "ds9-cart-confidence";
      block.innerHTML = `<div>${list("cart.confidence", ["Lokálna výroba", "Bezpečná platba", "Doprava zdarma od 50 €"])
        .map((item) => `<span><i aria-hidden="true">✓</i>${escapeHTML(item)}</span>`)
        .join("")}</div><a href="${safeURL(get("cart.addOnUrl", "/doplnky/"))}"><strong>${escapeHTML(get("cart.addOnLabel", "Drobnosť, ktorá dotiahne košík"))}</strong><small>${escapeHTML(get("cart.addOnCopy", "Pozri doplnky bez zbytočného presviedčania."))}</small><b aria-hidden="true">↗</b></a>`;
      summary.insertAdjacentElement("afterend", block);
    }
  };

  const enhanceThankYou = () => {
    if (!isThankYou()) return;
    const content = document.querySelector("#content .content-inner, #content");
    if (!content || document.querySelector(".ds9-post-purchase")) return;
    const section = document.createElement("section");
    section.className = "ds9-post-purchase";
    section.innerHTML = `<p>${escapeHTML(get("postPurchase.eyebrow", "OBJEDNÁVKA JE U NÁS"))}</p><h2>${escapeHTML(get("postPurchase.headline", "Tvoje slová už idú do sveta."))}</h2><span>${escapeHTML(get("postPurchase.copy", "Keď kúsok dorazí, označ nás. Možno sa v tom nájde niekto ďalší."))}</span><a href="${safeURL(get("postPurchase.buttonUrl", "/produkty-podla-textu/"))}">${escapeHTML(get("postPurchase.buttonLabel", "Pozrieť ďalšie nálady"))} →</a>`;
    content.appendChild(section);
  };

  const initMotion = () => {
    const home = document.querySelector(".ds9-home");
    if (!home || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("ds9-motion-ready");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
        { rootMargin: "0px 0px -8%", threshold: 0.1 },
      );
      home.querySelectorAll("[data-ds9-reveal]").forEach((node) => observer.observe(node));
    } else {
      home.querySelectorAll("[data-ds9-reveal]").forEach((node) => node.classList.add("is-visible"));
    }

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const hero = home.querySelector(".ds9-hero");
      hero?.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty("--ds9-hero-x", `${x * 22}px`);
        hero.style.setProperty("--ds9-hero-y", `${y * 17}px`);
        hero.style.setProperty("--ds9-hero-rx", `${y * -2.5}deg`);
        hero.style.setProperty("--ds9-hero-ry", `${x * 3}deg`);
      });
      hero?.addEventListener("pointerleave", () => {
        ["--ds9-hero-x", "--ds9-hero-y", "--ds9-hero-rx", "--ds9-hero-ry"].forEach((name) => hero.style.removeProperty(name));
      });

      home.querySelectorAll(".ds9-tilt-card").forEach((card) => {
        card.addEventListener("pointermove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty("--ds9-tilt-x", `${(0.5 - y) * 6}deg`);
          card.style.setProperty("--ds9-tilt-y", `${(x - 0.5) * 6}deg`);
        });
        card.addEventListener("pointerleave", () => {
          card.style.setProperty("--ds9-tilt-x", "0deg");
          card.style.setProperty("--ds9-tilt-y", "0deg");
        });
      });
    }

    const parallaxImage = home.querySelector(".ds9-parallax-frame img");
    if (parallaxImage && window.matchMedia("(min-width: 821px)").matches) {
      let ticking = false;
      const update = () => {
        const rect = parallaxImage.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        parallaxImage.style.setProperty("--ds9-parallax-y", `${Math.max(-22, Math.min(22, center * -0.035))}px`);
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      }, { passive: true });
      update();
    }
  };

  const init = () => {
    if (started) return;
    started = true;
    CONFIG = window.DOTYK_SLOV_THEME || {};
    removeLegacyState();
    ensureFont();
    applyDesignTokens();
    document.documentElement.classList.add("ds9-theme");
    document.body.classList.add("ds9-theme");
    enhanceHeader();
    enhanceFooter();
    enhanceHomepage();
    enhanceProductPage();
    enhanceCart();
    enhanceThankYou();
    initMotion();
  };

  const startWhenReady = () => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
      init();
    }
  };

  const loadConfiguration = () => {
    if (window.DOTYK_SLOV_THEME) {
      startWhenReady();
      return;
    }

    const existing = document.querySelector("script[data-ds9-config]");
    if (existing) {
      existing.addEventListener("load", startWhenReady, { once: true });
      existing.addEventListener("error", startWhenReady, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = CONFIG_URL;
    script.async = true;
    script.dataset.ds9Config = "true";
    script.addEventListener("load", startWhenReady, { once: true });
    script.addEventListener("error", startWhenReady, { once: true });
    document.head.appendChild(script);
  };

  loadConfiguration();
})();
