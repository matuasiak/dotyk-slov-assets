(function () {
  'use strict';

  const CONFIG = window.DOTYK_V2 || {};
  const SEARCH = window.DOTYK_SEARCH_CONFIG || {};
  const mobileMq = window.matchMedia('(max-width: 767px)');

  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.7a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z"/></svg>',
    cart: '<svg class="ds-v2-cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  const fallbackSearches = [
    'overthinking',
    'mám toho dosť',
    'citovo nedostupný',
    'tričká',
    'mikiny'
  ];

  const normalize = (value) => (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  function nativeMenuItems() {
    return Array.from(document.querySelectorAll('#navigation .menu-level-1 > li')).map((li) => {
      const link = li.querySelector(':scope > a');
      const children = Array.from(li.querySelectorAll(':scope > .menu-level-2 a, :scope > ul a'));
      return link ? {
        text: link.textContent.trim(),
        href: link.href,
        children: children.map((a) => ({ text: a.textContent.trim(), href: a.href }))
      } : null;
    }).filter(Boolean);
  }

  function findLink(items, terms) {
    return items.find((item) => terms.some((term) => normalize(item.text).includes(term)));
  }

  function makeAction(className, label, icon, href) {
    const el = document.createElement(href ? 'a' : 'button');
    if (href) el.href = href;
    else el.type = 'button';
    el.className = `ds-v2-action ${className}`;
    el.setAttribute('aria-label', label);
    el.innerHTML = icon;
    return el;
  }

  function mountAnnouncement(items) {
    const bar = document.querySelector('.top-navigation-bar');
    const container = bar?.querySelector('.container');
    if (!bar || !container || container.querySelector('.ds-v2-announcement__link')) return;

    bar.classList.add('ds-v2-announcement');
    const newest = findLink(items, ['novink', 'new']);
    const link = document.createElement('a');
    link.className = 'ds-v2-announcement__link';
    link.textContent = 'NOVÝ DROP JE VONKU →';
    link.href = CONFIG.announcementUrl || newest?.href || '#';
    if (link.getAttribute('href') === '#') link.addEventListener('click', (event) => event.preventDefault());
    container.appendChild(link);
  }

  function wishlistCount() {
    try {
      const value = JSON.parse(localStorage.getItem('dotykWishlist') || '[]');
      return Array.isArray(value) ? value.length : 0;
    } catch (_) {
      return 0;
    }
  }

  function syncWishlistCount() {
    const badge = document.querySelector('.ds-v2-wishlist .ds-v2-count');
    if (!badge) return;
    const count = wishlistCount();
    badge.dataset.count = String(count);
    badge.textContent = String(count);
  }

  function mountActions() {
    const actions = document.querySelector('#header .navigation-buttons');
    const cart = actions?.querySelector('.cart-count');
    if (!actions || !cart || actions.querySelector('.ds-v2-wishlist')) return;

    actions.querySelectorAll('.ds-approved-action, .ds-v2-action').forEach((node) => node.remove());

    const wishlist = makeAction('ds-v2-wishlist', 'Obľúbené', icons.heart);
    wishlist.innerHTML += '<span class="ds-v2-count" data-count="0">0</span>';
    wishlist.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('DotykWishlistOpen'));
    });

    const account = makeAction('ds-v2-account toggle-window', 'Môj účet', icons.account, '#');
    account.dataset.target = 'login';

    actions.insertBefore(wishlist, cart);
    actions.insertBefore(account, cart);

    cart.querySelector('.ds-v2-cart-icon')?.remove();
    cart.insertAdjacentHTML('afterbegin', icons.cart);
    syncWishlistCount();
  }

  function groupShopItems(items, reserved) {
    const shop = items.filter((item) => !reserved.includes(item));
    const primaryTerms = ['novink', 'trick', 'mikin', 'crop', 'oblecen', 'dopln', 'silt', 'task'];
    const primary = shop.filter((item) => primaryTerms.some((term) => normalize(item.text).includes(term)));
    const secondary = shop.filter((item) => !primary.includes(item));
    return {
      primary: (primary.length ? primary : shop).slice(0, 7),
      secondary: secondary.slice(0, 7)
    };
  }

  function renderMegaLinks(items) {
    if (!items.length) return '<li><span>Čoskoro.</span></li>';
    return items.map((item) => `<li><a href="${item.href}">${item.text}</a></li>`).join('');
  }

  function mountNavigation(items) {
    const navigation = document.getElementById('navigation');
    const navIn = navigation?.querySelector('.navigation-in');
    if (!navigation || !navIn || navIn.querySelector('.ds-v2-primary-nav')) return;

    navigation.classList.add('ds-v2-navigation');

    const collections = findLink(items, ['kolek']);
    const about = findLink(items, ['o nas', 'o znack', 'pribeh']);
    const club = findLink(items, ['klub', 'club']);
    const reserved = [collections, about, club].filter(Boolean);
    const shopGroups = groupShopItems(items, reserved);
    const newest = findLink(items, ['novink', 'new']);

    const nav = document.createElement('ul');
    nav.className = 'ds-v2-primary-nav';

    const shopItem = document.createElement('li');
    shopItem.className = 'ds-v2-primary-nav__item ds-v2-primary-nav__item--shop';
    shopItem.innerHTML = `
      <button class="ds-v2-primary-nav__button" type="button" aria-expanded="false">Shop</button>
      <div class="ds-v2-mega">
        <div class="ds-v2-mega__inner">
          <div>
            <span class="ds-v2-mega__eyebrow">Shop</span>
            <ul class="ds-v2-mega__links">${renderMegaLinks(shopGroups.primary)}</ul>
          </div>
          <div>
            <span class="ds-v2-mega__eyebrow">Objaviť</span>
            <ul class="ds-v2-mega__links">${renderMegaLinks(shopGroups.secondary)}</ul>
          </div>
          <a class="ds-v2-mega__feature" href="${CONFIG.dropUrl || newest?.href || '#'}">
            <span class="ds-v2-mega__tag">NEW DROP</span>
            <strong>veci, ktoré nepovieš nahlas.</strong>
          </a>
        </div>
      </div>`;
    nav.appendChild(shopItem);

    [
      ['Kolekcie', collections],
      ['O nás', about],
      ['Klub', club]
    ].forEach(([label, item]) => {
      if (!item) return;
      const li = document.createElement('li');
      li.className = 'ds-v2-primary-nav__item';
      li.innerHTML = `<a class="ds-v2-primary-nav__link" href="${item.href}">${label}</a>`;
      nav.appendChild(li);
    });

    navIn.appendChild(nav);

    const button = shopItem.querySelector('.ds-v2-primary-nav__button');
    button.addEventListener('click', () => {
      const open = !shopItem.classList.contains('is-open');
      shopItem.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function searchPanelMarkup() {
    return `
      <div class="ds-v2-search-panel" aria-live="polite">
        <div class="ds-v2-search-panel__content"></div>
      </div>`;
  }

  function renderFallback(panel) {
    panel.innerHTML = `
      <p class="ds-v2-search-panel__label">Skús napríklad</p>
      <div class="ds-v2-search-chips">
        ${fallbackSearches.map((term) => `<button class="ds-v2-search-chip" type="button" data-query="${term}">${term}</button>`).join('')}
      </div>`;
  }

  function hitValue(hit, ...keys) {
    for (const key of keys) {
      if (hit?.[key] != null) return hit[key];
      if (hit?.attributes?.[key] != null) return hit.attributes[key];
    }
    return '';
  }

  function renderLuigiHits(panel, hits, label) {
    if (!hits.length) {
      panel.innerHTML = '<p class="ds-v2-search-empty">Nič sme nenašli. Možno to zatiaľ ostalo len v hlave.</p>';
      return;
    }

    panel.innerHTML = `
      <p class="ds-v2-search-panel__label">${label}</p>
      <div class="ds-v2-search-results">
        ${hits.slice(0, 6).map((hit) => {
          const url = hitValue(hit, 'url');
          const title = hitValue(hit, 'title', 'name');
          const image = hitValue(hit, 'image_link', 'image');
          const price = hitValue(hit, 'price', 'price_amount');
          return `<a class="ds-v2-search-card" href="${url || '#'}">
            ${image ? `<img src="${image}" alt="" loading="lazy">` : '<span></span>'}
            <span class="ds-v2-search-card__title">${title}</span>
            <span class="ds-v2-search-card__price">${price || ''}</span>
          </a>`;
        }).join('')}
      </div>`;
  }

  async function luigiRequest(query) {
    if (!SEARCH.luigiTrackerId) return null;
    const params = new URLSearchParams({
      tracker_id: SEARCH.luigiTrackerId,
      type: 'item:6,category:3,query:3',
      hit_fields: 'title,url,price,price_amount,image_link'
    });

    let endpoint;
    if (query) {
      endpoint = 'https://live.luigisbox.com/autocomplete/v2';
      params.set('q', query);
    } else {
      endpoint = 'https://live.luigisbox.com/v1/top_items';
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, { credentials: 'omit' });
    if (!response.ok) throw new Error(`Search provider returned ${response.status}`);
    return response.json();
  }

  function extractLuigiHits(data) {
    if (!data) return [];
    if (Array.isArray(data.results)) return data.results.flatMap((group) => group.hits || group.items || []);
    if (Array.isArray(data.hits)) return data.hits;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }

  function findNativeSearchResults() {
    const selectors = [
      '.search-results',
      '.search-whisperer',
      '.search-results-groups',
      '#search-results',
      '.search-results-wrapper'
    ];

    return selectors
      .map((selector) => document.querySelector(selector))
      .find((node) => node && !node.closest('.ds-v2-search-panel')) || null;
  }

  function mirrorNativeResults(panel) {
    const source = findNativeSearchResults();
    if (!source) return;
    panel.innerHTML = '';
    const clone = source.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.add('ds-v2-native-results');
    panel.appendChild(clone);
  }

  function mountSearch() {
    const header = document.getElementById('header');
    const search = header?.querySelector('.search');
    const input = search?.querySelector('.search-input');
    const button = search?.querySelector('.search-form .btn');
    if (!header || !search || !input || search.querySelector('.ds-v2-search-panel')) return;

    header.classList.add('ds-v2-header');
    search.insertAdjacentHTML('beforeend', searchPanelMarkup());

    const panel = search.querySelector('.ds-v2-search-panel__content');
    const backdrop = document.createElement('div');
    backdrop.className = 'ds-v2-search-backdrop';
    document.body.appendChild(backdrop);

    if (button) {
      button.textContent = '';
      button.insertAdjacentHTML('afterbegin', icons.search);
      button.setAttribute('aria-label', 'Hľadať');
    }

    let requestId = 0;

    const open = async () => {
      document.body.classList.add('ds-v2-search-open');
      if (input.value.trim()) return;

      if (SEARCH.luigiTrackerId) {
        const id = ++requestId;
        panel.innerHTML = '<p class="ds-v2-search-empty">Hľadám, čo by ti mohlo sadnúť…</p>';
        try {
          const data = await luigiRequest('');
          if (id !== requestId) return;
          renderLuigiHits(panel, extractLuigiHits(data), 'Možno hľadáš');
        } catch (_) {
          renderFallback(panel);
        }
      } else {
        renderFallback(panel);
      }
    };

    input.addEventListener('focus', open);
    input.addEventListener('input', async () => {
      const query = input.value.trim();
      document.body.classList.add('ds-v2-search-open');

      if (!query) {
        open();
        return;
      }

      if (!SEARCH.luigiTrackerId || query.length < 2) return;

      const id = ++requestId;
      try {
        const data = await luigiRequest(query);
        if (id !== requestId) return;
        renderLuigiHits(panel, extractLuigiHits(data), 'Výsledky');
      } catch (_) {
        panel.innerHTML = '<p class="ds-v2-search-empty">Vyhľadávanie sa práve nechce rozprávať.</p>';
      }
    });

    panel.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-query]');
      if (!chip) return;
      input.value = chip.dataset.query;
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    backdrop.addEventListener('click', () => document.body.classList.remove('ds-v2-search-open'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') document.body.classList.remove('ds-v2-search-open');
    });

    document.addEventListener('ShoptetDOMSearchResultsLoaded', () => {
      if (!SEARCH.luigiTrackerId) mirrorNativeResults(panel);
    });
  }

  function mountMobileControls() {
    const headerTop = document.querySelector('#header .header-top');
    const actions = document.querySelector('#header .navigation-buttons');
    if (!headerTop || !actions || headerTop.querySelector('.ds-v2-mobile-menu')) return;

    const menu = makeAction('ds-v2-mobile-menu', 'Menu', icons.menu);
    const search = makeAction('ds-v2-mobile-search', 'Hľadať', icons.search);
    menu.hidden = !mobileMq.matches;
    search.hidden = !mobileMq.matches;

    headerTop.prepend(menu);
    actions.prepend(search);

    menu.addEventListener('click', () => {
      document.body.classList.toggle('navigation-window-visible');
    });

    search.addEventListener('click', () => {
      const input = document.querySelector('#header .search-input');
      document.body.classList.add('search-window-visible', 'ds-v2-search-open');
      window.setTimeout(() => input?.focus(), 60);
    });
  }

  function bindStickyState() {
    const header = document.getElementById('header');
    if (!header) return;
    let scheduled = false;

    const update = () => {
      header.classList.toggle('is-compact', window.scrollY > 80);
      scheduled = false;
    };

    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function boot() {
    const header = document.getElementById('header');
    if (!header) return;

    header.classList.add('ds-v2-header');
    const items = nativeMenuItems();

    mountAnnouncement(items);
    mountActions();
    mountNavigation(items);
    mountSearch();
    mountMobileControls();
    bindStickyState();

    window.addEventListener('storage', syncWishlistCount);
    document.addEventListener('DotykWishlistUpdated', syncWishlistCount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
