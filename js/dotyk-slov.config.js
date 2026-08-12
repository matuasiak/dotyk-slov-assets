(() => {
  "use strict";

  /*
   * Toto je jediné miesto s bežnými nastaveniami témy.
   * true = zapnuté, false = vypnuté.
   */
  window.DOTYK_SLOV_THEME = {
    release: "10.1.0",
    features: {
      announcement: false,
      stickyHeader: true,
      heroOverlay: true,
      quickCategories: true,
      productTabs: true,
      editorialSections: true,
      editorialStatement: false,
      editorialMoods: true,
      editorialCustom: false,
      editorialStory: false,
      editorialNewsletter: false,
      productAssurances: true,
      cartConfidence: true,
      footerBrand: true,
      postPurchase: true,
    },
    design: {
      ink: "#0b0b0b",
      paper: "#f5f4f0",
      accent: "#d9ff45",
      violet: "#5c46ed",
      cornerRadius: 24,
    },
    header: {
      searchPlaceholder: "Čo chceš povedať bez slov?",
    },
    announcement: [
      "Doprava zdarma nad 50 €",
      "Rýchle doručenie 2–3 dni",
      "Ručne a lokálne potlačené",
    ],
    hero: {
      eyebrow: "NOVÝ DROP / 08—26",
      headline: "Nie všetko treba povedať nahlas.",
      copy: "Niekedy stačí, keď to máš na sebe.",
      primaryLabel: "Pozrieť novinky",
      primaryUrl: "#ds-products",
      secondaryLabel: "Vybrať podľa nálady",
      secondaryUrl: "#ds-editorial",
    },
    categories: [
      { label: "Tričká", url: "/unisex-tricka/" },
      { label: "Cropy", url: "/crop-topy/" },
      { label: "Mikiny", url: "/mikiny/" },
      { label: "Šiltovky", url: "/doplnky/" },
      { label: "Doplnky", url: "/doplnky/" },
      { label: "Všetko", url: "/oblecenie/" },
    ],
    statement: {
      eyebrow: "DOTYK SLOV / OD 2022",
      headline: "Nie merch. Nálada, ktorú si môžeš obliecť.",
      facts: [
        { value: "lokálne", label: "potlačené u nás" },
        { value: "od 1 kusa", label: "žiadna masovka" },
        { value: "7 000+", label: "ľudí v komunite" },
      ],
    },
    moods: {
      eyebrow: "PODĽA NÁLADY",
      headline: "Nájdi sa. Alebo sa aspoň skús.",
      cards: [
        {
          label: "01 / OVERTHINKING",
          headline: "Keď cítiš príliš veľa.",
          url: "/produkty-podla-textu/",
          image: "https://matuasiak.github.io/dotyk-slov-assets/images/dotyk-editorial-cream.webp",
        },
        {
          label: "02 / SOCIAL BATTERY",
          headline: "Dnes to nedávam.",
          url: "/produkty-podla-textu/",
          image: "https://matuasiak.github.io/dotyk-slov-assets/images/dotyk-hero.webp",
        },
        {
          label: "03 / MAIN CHARACTER",
          headline: "Ale aspoň dobre vyzerám.",
          url: "/produkty-podla-textu/",
          image: "https://matuasiak.github.io/dotyk-slov-assets/images/dotyk-product-black.webp",
        },
      ],
    },
    custom: {
      eyebrow: "TVOJE SLOVÁ",
      headline: "Máš vetu, ktorú nikto iný nemá?",
      copy: "Pošli ju nám. My z nej spravíme vec, ktorú budeš chcieť nosiť častejšie než vlastné myšlienky.",
      buttonLabel: "Vytvoriť vlastný kúsok",
      buttonUrl: "/vytvor-si-vlastne-tricko-2/",
      thoughts: ["mám toho dosť", "ale esteticky", "...", "asi som v pohode", "neodpisujem"],
    },
    story: {
      eyebrow: "ZNAČKA S VLASTNÝM HLASOM",
      headline: "Vzniklo to z viet, ktoré ostali v hlave.",
      copy: "Dotyk Slov je pre ľudí, ktorí cítia veľa, hovoria málo a humor používajú ako obranný mechanizmus. Každý kúsok navrhujeme a tlačíme lokálne.",
      buttonLabel: "Náš príbeh",
      buttonUrl: "/o-nas/",
      image: "https://matuasiak.github.io/dotyk-slov-assets/images/dotyk-editorial-cream.webp",
    },
    newsletter: {
      eyebrow: "TICHÁ POŠTA",
      headline: "Občas ti niečo povieme. Nahlas nie.",
      placeholder: "tvoj@email.sk",
      buttonLabel: "Chcem byť pri tom",
    },
    productPage: {
      assurances: [
        "Ručne a lokálne potlačené",
        "Doprava zdarma od 50 €",
        "Bezpečná platba",
      ],
    },
    cart: {
      confidence: ["Lokálna výroba", "Bezpečná platba", "Doprava zdarma od 50 €"],
      addOnLabel: "Drobnosť, ktorá dotiahne košík",
      addOnCopy: "Pozri doplnky bez zbytočného presviedčania.",
      addOnUrl: "/doplnky/",
    },
    postPurchase: {
      eyebrow: "OBJEDNÁVKA JE U NÁS",
      headline: "Tvoje slová už idú do sveta.",
      copy: "Keď kúsok dorazí, označ nás. Nie kvôli algoritmu. Kvôli ľuďom, ktorí sa v tom možno nájdu tiež.",
      buttonLabel: "Pozrieť ďalšie nálady",
      buttonUrl: "/produkty-podla-textu/",
    },
  };
})();
