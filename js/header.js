(function () {
  'use strict';

  const CONFIG = window.DOTYK_HEADER_CONFIG || {};
  const SEARCH_CONFIG = window.DOTYK_SEARCH_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const normalize = (value) => (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  const icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.4"/><path d="m16 16 4 4"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.7a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z"/></svg>',
    cart: '<svg class="ds-dark-cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  const fallbackTerms = [
    'mám toho dosť',
    'overthinking',
    'citovo nedostupný',
    'tričká',
    'mikiny'
  ];

  function getNativeNavigation() {
    return $$('#navigation .menu-level-1 > li').map((li) => {
      const link = $(':scope > a', li);
      if (!link) return null;

      const children = $$(':scope > .menu-level-2 a, :scope > ul a', li)
        .map((child) => ({
          text: child.textContent.trim(),
          href: child.href
        }))
        .filter((child) => child.text && child.href);

      return {
        text: link.textContent.trim(),
        href: link.href,
        children
      };
    }).filter(Boolean);
  }

  function findItem(items, terms) {
    return items.find((item) => terms.some((term) => normalize(item.text).includes(term)));
  }

  function createAction(className, label, icon, options = {}) {
    const element = options.href ? document.createElement('a') : document.createElement('button');
    if (options.href) element.href = options.href;
    else element.type = 'button';
    element.className = `ds-dark-action ${className}`;
    element.setAttribute('aria-label', label);
    if (options.target) {
      element.classList.add('toggle-window');
      element.dataset.target = options.target;
    }
    element.innerHTML = icon;
    return element;
  }

  function mountAnnouncement(items) {
    const bar = $('.top-navigation-bar');
    const container = bar && $('.container', bar);
    if (!bar || !container) return;

    bar.classList.add('ds-dark-announcement');
    container.querySelector('.ds-dark-announcement__link')?.remove();

    const newest = findItem(items, ['novink', 'new']);
    const link = document.createElement('a');
    link.className = 'ds-dark-announcement__link';
    link.textContent = 'NOVÝ DROP JE VONKU →';
    link.href = CONFIG.announcementUrl || newest?.href || CONFIG.shopUrl || '#';
    if (link.getAttribute('href') === '#') {
      link.addEventListener('click', (event) => event.preventDefault());
    }
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
    const badge = $('.ds-dark-wishlist .ds-dark-count');
    if (!badge) return;
    const count = wishlistCount();
    badge.dataset.count = String(count);
    badge.textContent = String(count);
  }

  function mountActions() {
    const actions = $('#header .navigation-buttons');
    const cart = actions && $('.cart-count', actions);
    if (!actions || !cart) return;

    $$('.ds-approved-action, .ds-v2-action, .ds-dark-action', actions).forEach((node) => node.remove());
    $('#ds-mobile-controls')?.remove();

    const wishlist = createAction('ds-dark-wishlist', 'Obľúbené', icons.heart);
    wishlist.innerHTML += '<span class="ds-dark-count" data-count="0">0</span>';
    wishlist.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('DotykWishlistOpen'));
    });

    const account = createAction('ds-dark-account', 'Môj účet', icons.account, { target: 'login' });

    actions.insertBefore(wishlist, cart);
    actions.insertBefore(account, cart);

    cart.querySelector('.ds-cart-svg')?.remove();
    cart.querySelector('.ds-v2-cart-icon')?.remove();
    cart.querySelector('.ds-dark-cart-icon')?.remove();
    cart.insertAdjacentHTML('afterbegin', icons.cart);
    syncWishlistCount();
  }

  function uniqueLinks(links) {
    const seen = new Set();
    return links.filter((item) => {
      const key = `${item.text}|${item.href}`;
      if (!item.text || !item.href || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function flattenShopLinks(items, reserved) {
    const utilityTerms = ['kontakt', 'blog', 'faq', 'doprava', 'reklamac', 'podmienk'];
    const links = [];

    items.forEach((item) => {
      if (reserved.includes(item)) return;
      if (utilityTerms.some((term) => normalize(item.text).includes(term))) return;
      links.push({ text: item.text, href: item.href });
      item.children.forEach((child) => links.push(child));
    });

    return uniqueLinks(links);
  }

  function linksMarkup(items) {
    if (!items.length) return '<li><span>Čoskoro.</span></li>';
    return items.map((item) => `<li><a href="${item.href}">${item.text}</a></li>`).join('');
  }

  function mountNavigation(items) {
    const navigation = $('#navigation');
    const navigationIn = navigation && $('.navigation-in', navigation);
    if (!navigation || !navigationIn) return;

    navigation.classList.remove('ds-v2-navigation');
    navigation.classList.add('ds-dark-navigation');
    navigationIn.querySelector('.ds-v2-primary-nav')?.remove();
    navigationIn.querySelector('.ds-dark-primary-nav')?.remove();

    const collections = findItem(items, ['kolek']);
    const about = findItem(items, ['o nas', 'o znack', 'pribeh']);
    const club = findItem(items, ['klub', 'club', 'komunit']);
    const newest = findItem(items, ['novink', 'new']);
    const reserved = [collections, about, club].filter(Boolean);
    const allShop = flattenShopLinks(items, reserved);

    const productTerms = ['novink', 'trick', 'mikin', 'crop', 'oblecen', 'dopln', 'silt', 'task', 'mikina', 'tricko'];
    let primary = allShop.filter((item) => productTerms.some((term) => normalize(item.text).includes(term)));
    if (!primary.length) primary = allShop.slice(0, 7);
    primary = primary.slice(0, 7);
    const secondary = allShop.filter((item) => !primary.includes(item)).slice(0, 7);

    const nav = document.createElement('ul');
    nav.className = 'ds-dark-primary-nav';

    const shop = document.createElement('li');
    shop.className = 'ds-dark-primary-nav__item ds-dark-primary-nav__item--shop';
    shop.innerHTML = `
      <button class="ds-dark-primary-nav__button" type="button" aria-expanded="false">SHOP</button>
      <div class="ds-dark-mega">
        <div class="ds-dark-mega__inner">
          <div>
            <span class="ds-dark-mega__label">SHOP</span>
            <ul class="ds-dark-mega__links">${linksMarkup(primary)}</ul>
          </div>
          <div>
            <span class="ds-dark-mega__label">OBJAVIŤ</span>
            <ul class="ds-dark-mega__links">${linksMarkup(secondary)}</ul>
          </div>
          <a class="ds-dark-mega__statement" href="${CONFIG.dropUrl || newest?.href || CONFIG.shopUrl || '#'}">
            <small>NEW DROP</small>
            <strong>veci, ktoré sa niekedy ťažko hovoria.</strong>
            <em>preto ich nosíme. →</em>
          </a>
        </div>
      </div>`;
    nav.appendChild(shop);

    [
      ['KOLEKCIE', collections],
      ['O NÁS', about],
      ['KLUB', club]
    ].forEach(([label, item]) => {
      if (!item) return;
      const li = document.createElement('li');
      li.className = 'ds-dark-primary-nav__item';
      li.innerHTML = `<a class="ds-dark-primary-nav__link" href="${item.href}">${label}</a>`;
      nav.appendChild(li);
    });

    navigationIn.appendChild(nav);

    const shopButton = $('.ds-dark-primary-nav__button', shop);
    shopButton.addEventListener('click', () => {
      const open = !shop.classList.contains('is-open');
      shop.classList.toggle('is-open', open);
      shopButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!shop.contains(event.target)) {
        shop.classList.remove('is-open');
        shopButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function popularLinks(items) {
    const collections = findItem(items, ['kolek']);
    const about = findItem(items, ['o nas', 'o znack', 'pribeh']);
    const club = findItem(items, ['klub', 'club', 'komunit']);
    const reserved = [collections, about, club].filter(Boolean);
    return flattenShopLinks(items, reserved).slice(0, 6);
  }

  function renderSearchDefault(content, items) {
    const popular = popularLinks(items);
    content.innerHTML = `
      <div class="ds-dark-search-default">
        <div>
          <p class="ds-dark-search-panel__label" style="margin-bottom:16px">SKÚS NAPRÍKLAD</p>
          <div class="ds-dark-search-chips">
            ${fallbackTerms.map((term) => `<button class="ds-dark-search-chip" type="button" data-query="${term}">${term}</button>`).join('')}
          </div>
        </div>
        <div>
          <p class="ds-dark-search-panel__label" style="margin-bottom:16px">TERAZ SA NOSÍ</p>
          <ul class="ds-dark-search-popular">
            ${popular.map((item) => `<li><a href="${item.href}">${item.text}</a></li>`).join('') || '<li>Čoskoro.</li>'}
          </ul>
        </div>
      </div>`;
  }

  function field(hit, ...keys) {
    for (const key of keys) {
      if (hit?.[key] != null) return hit[key];
      if (hit?.attributes?.[key] != null) return hit.attributes[key];
    }
    return '';
  }

  function extractLuigiHits(data) {
    if (!data) return [];
    if (Array.isArray(data.results)) return data.results.flatMap((group) => group.hits || group.items || []);
    if (Array.isArray(data.hits)) return data.hits;
    if (Array.isArray(data.items)) return data.items;
    return [];
  }

  function renderLuigiResults(content, data) {
    const hits = extractLuigiHits(data).slice(0, 9);
    if (!hits.length) {
      content.innerHTML = '<p class="ds-dark-search-empty">Nič sme nenašli. Asi to zatiaľ ostalo len v hlave.</p>';
      return;
    }

    content.innerHTML = `<div class="ds-dark-search-results">${hits.map((hit) => {
      const url = field(hit, 'url') || '#';
      const title = field(hit, 'title', 'name');
      const image = field(hit, 'image_link', 'image');
      const price = field(hit, 'price', 'price_amount');
      return `<a class="ds-dark-search-card" href="${url}">
        ${image ? `<img src="${image}" alt="" loading="lazy">` : '<span></span>'}
        <span class="ds-dark-search-card__title">${title}</span>
        <span class="ds-dark-search-card__price">${price || ''}</span>
      </a>`;
    }).join('')}</div>`;
  }

  async function luigiRequest(query) {
    if (!SEARCH_CONFIG.luigiTrackerId) return null;

    const params = new URLSearchParams({
      tracker_id: SEARCH_CONFIG.luigiTrackerId,
      type: 'item:9,category:3,query:3',
      hit_fields: 'title,url,price,price_amount,image_link'
    });

    let endpoint = 'https://live.luigisbox.com/v1/top_items';
    if (query) {
      endpoint = 'https://live.luigisbox.com/autocomplete/v2';
      params.set('q', query);
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, { credentials: 'omit' });
    if (!response.ok) throw new Error(`Search provider returned ${response.status}`);
    return response.json();
  }

  function findNativeSearchResults(panel) {
    const selectors = [
      '.search-results',
      '.search-whisperer',
      '.search-results-groups',
      '#search-results',
      '.search-results-wrapper'
    ];

    return selectors
      .flatMap((selector) => $$(selector))
      .find((node) => !node.closest('.ds-dark-search-panel') && node.textContent.trim().length > 0) || null;
  }

  function mountSearch(items) {
    const header = $('#header');
    const search = header && $('.search', header);
    const input = search && $('.search-input', search);
    const submit = search && $('.search-form .btn', search);
    if (!header || !search || !input) return;

    $('.ds-v2-search-backdrop')?.remove();
    $('.ds-dark-search-backdrop')?.remove();
    $('.ds-dark-search-panel')?.remove();

    input.placeholder = CONFIG.searchPlaceholder || 'Hľadať medzi myšlienkami…';

    if (submit) {
      submit.textContent = '';
      submit.insertAdjacentHTML('afterbegin', icons.search);
      submit.setAttribute('aria-label', 'Hľadať');
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'ds-dark-search-backdrop';

    const panel = document.createElement('div');
    panel.className = 'ds-dark-search-panel';
    panel.innerHTML = `
      <div class="ds-dark-search-panel__inner">
        <div class="ds-dark-search-panel__head">
          <p class="ds-dark-search-panel__label">VÝSLEDKY / ODPORÚČANIA</p>
          <button class="ds-dark-search-close" type="button" aria-label="Zavrieť">×</button>
        </div>
        <div class="ds-dark-search-panel__content"></div>
      </div>`;

    document.body.append(backdrop, panel);

    const content = $('.ds-dark-search-panel__content', panel);
    const closeButton = $('.ds-dark-search-close', panel);
    let luigiRequestId = 0;
    let nativeSnapshot = '';
    let syncQueued = false;

    function positionPanel() {
      const rect = header.getBoundingClientRect();
      document.documentElement.style.setProperty('--ds-search-panel-top', `${Math.max(0, Math.round(rect.bottom))}px`);
    }

    async function openSearch() {
      positionPanel();
      document.body.classList.add('ds-dark-search-open');

      if (input.value.trim()) return;

      if (!SEARCH_CONFIG.luigiTrackerId) {
        renderSearchDefault(content, items);
        return;
      }

      const requestId = ++luigiRequestId;
      content.innerHTML = '<p class="ds-dark-search-empty">Hľadám, čo by ti mohlo sadnúť…</p>';
      try {
        const data = await luigiRequest('');
        if (requestId === luigiRequestId) renderLuigiResults(content, data);
      } catch (_) {
        renderSearchDefault(content, items);
      }
    }

    function closeSearch() {
      document.body.classList.remove('ds-dark-search-open');
      if (window.innerWidth <= 767) document.body.classList.remove('search-window-visible');
    }

    function syncNativeResults() {
      if (SEARCH_CONFIG.luigiTrackerId || !document.body.classList.contains('ds-dark-search-open')) return;
      const source = findNativeSearchResults(panel);
      if (!source) return;

      const snapshot = source.innerHTML;
      if (!snapshot || snapshot === nativeSnapshot) return;
      nativeSnapshot = snapshot;

      const clone = source.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('ds-dark-native-results');
      content.innerHTML = '';
      content.appendChild(clone);
    }

    function queueNativeSync() {
      if (syncQueued) return;
      syncQueued = true;
      requestAnimationFrame(() => {
        syncQueued = false;
        syncNativeResults();
      });
    }

    input.addEventListener('focus', openSearch);
    input.addEventListener('input', async () => {
      positionPanel();
      document.body.classList.add('ds-dark-search-open');
      const query = input.value.trim();

      if (!query) {
        nativeSnapshot = '';
        openSearch();
        return;
      }

      if (!SEARCH_CONFIG.luigiTrackerId) {
        setTimeout(syncNativeResults, 120);
        setTimeout(syncNativeResults, 320);
        setTimeout(syncNativeResults, 650);
        return;
      }

      if (query.length < 2) return;
      const requestId = ++luigiRequestId;
      try {
        const data = await luigiRequest(query);
        if (requestId === luigiRequestId) renderLuigiResults(content, data);
      } catch (_) {
        content.innerHTML = '<p class="ds-dark-search-empty">Vyhľadávanie sa práve nechce rozprávať.</p>';
      }
    });

    panel.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-query]');
      if (!chip) return;
      input.value = chip.dataset.query;
      input.focus();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    });

    backdrop.addEventListener('click', closeSearch);
    closeButton.addEventListener('click', closeSearch);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeSearch();
        document.body.classList.remove('navigation-window-visible');
      }
    });

    document.addEventListener('ShoptetDOMSearchResultsLoaded', syncNativeResults);

    const observer = new MutationObserver(queueNativeSync);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', positionPanel, { passive: true });
    window.addEventListener('scroll', () => {
      if (document.body.classList.contains('ds-dark-search-open')) positionPanel();
    }, { passive: true });
  }

  function mountMobileControls() {
    const headerTop = $('#header .header-top');
    const actions = $('#header .navigation-buttons');
    if (!headerTop || !actions) return;

    headerTop.querySelector('.ds-dark-mobile-menu')?.remove();
    actions.querySelector('.ds-dark-mobile-search')?.remove();

    const menu = createAction('ds-dark-mobile-menu', 'Menu', icons.menu);
    const search = createAction('ds-dark-mobile-search', 'Hľadať', icons.search);

    headerTop.prepend(menu);
    actions.prepend(search);

    menu.addEventListener('click', () => {
      document.body.classList.remove('search-window-visible', 'ds-dark-search-open');
      document.body.classList.toggle('navigation-window-visible');
    });

    search.addEventListener('click', () => {
      document.body.classList.remove('navigation-window-visible');
      document.body.classList.add('search-window-visible', 'ds-dark-search-open');
      setTimeout(() => $('#header .search-input')?.focus(), 60);
    });
  }

  function mountStickyState() {
    const header = $('#header');
    if (!header) return;

    const update = () => header.classList.toggle('is-compact', window.scrollY > 72);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function boot() {
    const header = $('#header');
    if (!header) return;

    header.classList.remove('ds-v2-header');
    header.classList.add('ds-dark-header');
    document.body.classList.add('ds-dark-ready');

    const items = getNativeNavigation();
    mountAnnouncement(items);
    mountActions();
    mountNavigation(items);
    mountSearch(items);
    mountMobileControls();
    mountStickyState();

    window.addEventListener('storage', syncWishlistCount);
    document.addEventListener('DotykWishlistUpdated', syncWishlistCount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
