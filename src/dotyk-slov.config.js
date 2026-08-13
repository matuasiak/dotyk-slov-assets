(() => {
  "use strict";

  /*
   * Toto je jediné miesto s bežnými nastaveniami témy.
   * true = zapnuté, false = vypnuté.
   */
  window.DOTYK_SLOV_THEME = {
    release: "11.0.0",
    features: {
      announcement: true,
      stickyHeader: true,
      heroOverlay: true,
      quickCategories: true,
      productTabs: true,
      editorialSections: true,
      productAssurances: true,
      cartConfidence: true,
      footerBrand: true,
      postPurchase: true,
    },
    design: {
      ink: "#211a22",
      paper: "#fff9ef",
      accent: "#ef4f96",
      violet: "#663bd8",
      cornerRadius: 24,
    },
    header: {
      searchPlaceholder: "Čo chceš povedať bez slov?",
      serviceLine: "Doprava zadarmo od 50 € · Odosielame do 2–3 dní",
      supportLine: "Podpora: ahoj@dotykslov.sk",
    },
    announcement: [
      "Doprava zdarma nad 50 €",
      "Rýchle doručenie 2–3 dni",
      "Ručne a lokálne potlačené",
    ],
    hero: {
      eyebrow: "4,9 / 5 · ĽUDIA SA V TOM NAŠLI",
      headline: "Slová, ktoré si netrúfaš povedať nahlas.",
      copy: "Myšlienky, emócie a jemný chaos. Na kúskoch, ktoré povedia dosť aj bez vysvetľovania.",
      primaryLabel: "Nakupovať",
      primaryUrl: "#ds-products",
      secondaryLabel: "Nové hlášky",
      secondaryUrl: "#ds-editorial",
    },
    promos: [
      {
        eyebrow: "NOVÝ DROP",
        headline: "Mám toho dosť. Ale esteticky.",
        buttonLabel: "Pozrieť kolekciu",
        url: "/produkty-podla-textu/",
        image: "https://matuasiak.github.io/dotyk-slov-assets/images/dotyk-editorial-cream.webp",
      },
      {
        eyebrow: "TVOJE SLOVÁ",
        headline: "Veta, ktorú nikto iný nemá.",
        buttonLabel: "Vytvoriť vlastný kúsok",
        url: "/vytvor-si-vlastne-tricko-2/",
        image: "https://matuasiak.github.io/dotyk-slov-assets/images/dotyk-product-black.webp",
      },
    ],
    categories: [
      { label: "Tričká", url: "/unisex-tricka/" },
      { label: "Cropy", url: "/crop-topy/" },
      { label: "Mikiny", url: "/mikiny/" },
      { label: "Šiltovky", url: "/doplnky/" },
      { label: "Doplnky", url: "/doplnky/" },
      { label: "Všetko", url: "/oblecenie/" },
    ],
    statement: {
      messages: [
        "Ak to chápeš, patríš sem",
        "Nie všetko treba povedať nahlas",
        "Mám toho dosť, ale esteticky",
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
      copy: "Nové hlášky, limitované kúsky a veci, ktoré nedávame všetkým.",
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
