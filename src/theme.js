(function () {
  'use strict';

  const asset = (name) => `https://matuasiak.github.io/dotyk-slov-assets/images/${name}`;

  function mountHomepageHero() {
    if (!document.body.classList.contains('in-index')) return;

    const anchor = document.querySelector('.content-wrapper.homepage-box.before-carousel');
    if (!anchor || document.querySelector('.ds-home-hero')) return;

    const section = document.createElement('section');
    section.className = 'ds-home-hero';
    section.setAttribute('aria-label', 'Dotyk Slov');
    section.innerHTML = `
      <a class="ds-home-hero__main" href="/oblecenie/">
        <img src="${asset('hero.jpg')}" alt="Dotyk Slov – oblečenie, ktoré povie viac" fetchpriority="high">
        <span class="ds-home-hero__copy">
          <small>Dotyk Slov</small>
          <strong>Slová, ktoré si netrúfaš povedať nahlas.</strong>
          <em>Objaviť kolekciu</em>
        </span>
      </a>
      <div class="ds-home-hero__rail">
        <a href="/limitky/">
          <img src="${asset('promo1.jpg')}" alt="Limitované kolekcie" loading="lazy">
          <span><strong>Limitky</strong><small>kým sú, tak sú</small></span>
        </a>
        <a href="/mikiny/">
          <img src="${asset('promo2.jpg')}" alt="Mikiny Dotyk Slov" loading="lazy">
          <span><strong>Mikiny</strong><small>komfort, ale s názorom</small></span>
        </a>
      </div>`;

    anchor.parentNode.insertBefore(section, anchor);
  }

  function markNativeSections() {
    document.querySelectorAll('.homepage-group-title').forEach((heading) => {
      heading.classList.add('ds-section-title');
    });
  }

  function boot() {
    document.documentElement.classList.add('ds-theme');
    mountHomepageHero();
    markNativeSections();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

