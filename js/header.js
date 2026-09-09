(function () {
  'use strict';

  var CONFIG = window.DOTYK_V2 || {};
  var mobileMq = window.matchMedia('(max-width: 767px)');

  var icons = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.7a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z"/></svg>',
    cart: '<svg class="ds-fashion-cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>'
  };

  var searchPhrases = [
    'mám toho dosť',
    'nevolaj mi',
    'citovo nedostupný',
    'overthinking',
    'mikiny',
    'veci, ktoré nepovieš nahlas'
  ];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function nativeMenuItems() {
    return $$('#navigation .menu-level-1 > li').map(function (li) {
      var link = li.querySelector(':scope > a');
      if (!link) return null;

      var submenu = li.querySelector(':scope > .menu-level-2, :scope > ul');
      var children = submenu
        ? Array.prototype.slice.call(submenu.querySelectorAll('a[href]')).map(function (child) {
            return {
              text: (child.textContent || '').trim(),
              href: child.href
            };
          }).filter(function (child) { return child.text; })
        : [];

      return {
        text: (link.textContent || '').trim(),
        href: link.href,
        children: children
      };
    }).filter(Boolean);
  }

  function mountAnnouncement(items) {
    var bar = $('.top-navigation-bar');
    var container = bar && $('.container', bar);
    if (!bar || !container) return;

    bar.classList.add('ds-fashion-announcement');
    if ($('.ds-fashion-announcement__link', container)) return;

    var newest = items.find(function (item) {
      return /novink|new/i.test(item.text);
    });

    var link = document.createElement('a');
    link.className = 'ds-fashion-announcement__link';
    link.textContent = 'NOVÝ DROP JE VONKU →';
    link.href = CONFIG.announcementUrl || (newest && newest.href) || '#';
    if (link.getAttribute('href') === '#') {
      link.addEventListener('click', function (event) { event.preventDefault(); });
    }
    container.appendChild(link);
  }

  function mountDesktopNavigation(items) {
    var headerTop = $('#header .header-top');
    var navigation = $('#navigation');
    var logo = headerTop && $('.site-name-wrapper', headerTop);
    if (!headerTop || !navigation || !logo) return;

    navigation.classList.add('ds-fashion-source-nav');
    $('.ds-fashion-nav', headerTop)?.remove();

    var nav = document.createElement('ul');
    nav.className = 'ds-fashion-nav';
    nav.setAttribute('aria-label', 'Hlavná navigácia');

    items.forEach(function (item) {
      if (!item.text) return;

      var li = document.createElement('li');
      li.className = 'ds-fashion-nav__item';

      if (item.children.length) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'ds-fashion-nav__button';
        button.textContent = item.text;
        button.setAttribute('aria-expanded', 'false');

        var dropdown = document.createElement('div');
        dropdown.className = 'ds-fashion-nav__dropdown';
        dropdown.innerHTML = '<ul>' + item.children.map(function (child) {
          return '<li><a href="' + child.href + '">' + child.text + '</a></li>';
        }).join('') + '</ul>';

        button.addEventListener('click', function () {
          var open = !li.classList.contains('is-open');
          $$('.ds-fashion-nav__item.is-open', nav).forEach(function (other) {
            if (other !== li) {
              other.classList.remove('is-open');
              var otherButton = $('.ds-fashion-nav__button', other);
              if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
            }
          });
          li.classList.toggle('is-open', open);
          button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        li.appendChild(button);
        li.appendChild(dropdown);
      } else {
        var link = document.createElement('a');
        link.className = 'ds-fashion-nav__link';
        link.href = item.href;
        link.textContent = item.text;
        li.appendChild(link);
      }

      nav.appendChild(li);
    });

    logo.insertAdjacentElement('afterend', nav);
  }

  function makeAction(className, label, icon, href) {
    var element = document.createElement(href ? 'a' : 'button');
    if (href) element.href = href;
    else element.type = 'button';
    element.className = 'ds-fashion-action ' + className;
    element.setAttribute('aria-label', label);
    element.innerHTML = icon;
    return element;
  }

  function wishlistCount() {
    try {
      var data = JSON.parse(localStorage.getItem('dotykWishlist') || '[]');
      return Array.isArray(data) ? data.length : 0;
    } catch (_) {
      return 0;
    }
  }

  function syncWishlistCount() {
    var badge = $('.ds-fashion-wishlist .ds-fashion-count');
    if (!badge) return;
    var count = wishlistCount();
    badge.dataset.count = String(count);
    badge.textContent = String(count);
  }

  function mountActions() {
    var actions = $('#header .navigation-buttons');
    var cart = actions && $('.cart-count', actions);
    if (!actions || !cart) return;

    $$('.ds-approved-action,.ds-v2-action,.ds-fashion-action', actions).forEach(function (node) {
      node.remove();
    });

    var search = makeAction('ds-fashion-search-trigger', 'Hľadať', icons.search);
    search.insertAdjacentHTML('beforeend', '<span>Hľadať</span>');

    var wishlist = makeAction('ds-fashion-wishlist', 'Obľúbené', icons.heart);
    wishlist.insertAdjacentHTML('beforeend', '<span class="ds-fashion-count" data-count="0">0</span>');
    wishlist.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('DotykWishlistOpen'));
    });

    var account = makeAction('ds-fashion-account toggle-window', 'Môj účet', icons.account, '#');
    account.dataset.target = 'login';

    actions.insertBefore(search, cart);
    actions.insertBefore(wishlist, cart);
    actions.insertBefore(account, cart);

    $$('svg', cart).forEach(function (svg) { svg.remove(); });
    cart.insertAdjacentHTML('afterbegin', icons.cart);
    syncWishlistCount();

    search.addEventListener('click', openSearch);
  }

  function findNativeSearchResults() {
    var selectors = [
      '.search-results',
      '.search-whisperer',
      '.search-results-groups',
      '#search-results',
      '.search-results-wrapper'
    ];

    for (var i = 0; i < selectors.length; i += 1) {
      var nodes = $$(selectors[i]);
      for (var j = 0; j < nodes.length; j += 1) {
        if (!nodes[j].closest('.ds-fashion-search-results')) return nodes[j];
      }
    }
    return null;
  }

  function mirrorNativeSearchResults() {
    var target = $('.ds-fashion-search-results');
    var source = findNativeSearchResults();
    if (!target || !source) return;

    target.innerHTML = '';
    var clone = source.cloneNode(true);
    clone.removeAttribute('id');
    target.appendChild(clone);
  }

  function setSearchTop() {
    var header = $('#header.ds-fashion-header');
    if (!header) return;
    var bottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
    document.documentElement.style.setProperty('--ds-search-top', bottom + 'px');
  }

  function openSearch() {
    document.body.classList.remove('navigation-window-visible');
    document.body.classList.add('ds-fashion-search-open');
    setSearchTop();
    window.setTimeout(function () {
      var input = $('.ds-fashion-search-overlay .search-input');
      if (input) input.focus();
    }, 50);
  }

  function closeSearch() {
    document.body.classList.remove('ds-fashion-search-open');
  }

  function mountSearchOverlay() {
    var search = $('#header .search');
    var input = search && $('.search-input', search);
    var button = search && $('.search-form .btn', search);
    if (!search || !input || $('.ds-fashion-search-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'ds-fashion-search-overlay';
    overlay.innerHTML =
      '<div class="ds-fashion-search-overlay__inner">' +
        '<div class="ds-fashion-search-overlay__top">' +
          '<span class="ds-fashion-search-overlay__label">Hľadať v Dotyku</span>' +
          '<button class="ds-fashion-search-close" type="button" aria-label="Zavrieť">×</button>' +
        '</div>' +
        '<div class="ds-fashion-search-slot"></div>' +
        '<div class="ds-fashion-search-suggestions"></div>' +
        '<div class="ds-fashion-search-results"></div>' +
      '</div>';

    var backdrop = document.createElement('div');
    backdrop.className = 'ds-fashion-search-backdrop';

    document.body.appendChild(backdrop);
    document.body.appendChild(overlay);
    $('.ds-fashion-search-slot', overlay).appendChild(search);

    if (button) {
      button.textContent = '';
      button.insertAdjacentHTML('afterbegin', icons.search);
      button.setAttribute('aria-label', 'Hľadať');
    }

    var suggestions = $('.ds-fashion-search-suggestions', overlay);
    suggestions.innerHTML = searchPhrases.slice(0, 5).map(function (phrase) {
      return '<button class="ds-fashion-search-suggestion" type="button" data-search="' + phrase + '">' + phrase + '</button>';
    }).join('');

    suggestions.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-search]');
      if (!trigger) return;
      input.value = trigger.dataset.search;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });

    $('.ds-fashion-search-close', overlay).addEventListener('click', closeSearch);
    backdrop.addEventListener('click', closeSearch);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeSearch();
    });

    var phraseIndex = 0;
    input.placeholder = 'Hľadať: ' + searchPhrases[phraseIndex];
    window.setInterval(function () {
      if (input.value) return;
      phraseIndex = (phraseIndex + 1) % searchPhrases.length;
      input.placeholder = 'Hľadať: ' + searchPhrases[phraseIndex];
    }, 1900);

    document.addEventListener('ShoptetDOMSearchResultsLoaded', function () {
      window.requestAnimationFrame(mirrorNativeSearchResults);
    });

    var searchObserver = new MutationObserver(function () {
      if (!document.body.classList.contains('ds-fashion-search-open')) return;
      mirrorNativeSearchResults();
    });
    searchObserver.observe(document.body, { childList: true, subtree: true });
  }

  function mountMobileMenuButton() {
    var headerTop = $('#header .header-top');
    if (!headerTop || $('.ds-fashion-mobile-menu', headerTop)) return;

    var button = makeAction('ds-fashion-mobile-menu', 'Menu', icons.menu);
    headerTop.prepend(button);
    button.addEventListener('click', function () {
      closeSearch();
      document.body.classList.toggle('navigation-window-visible');
    });
  }

  function updateStickyHeader() {
    var header = $('#header.ds-fashion-header');
    if (!header) return;

    var shouldStick = !document.body.classList.contains('in-index') || window.scrollY > 36;
    header.classList.toggle('is-stuck', shouldStick);
    setSearchTop();
  }

  function closeOpenDesktopDropdowns(event) {
    if (event.target.closest('.ds-fashion-nav')) return;
    $$('.ds-fashion-nav__item.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var button = $('.ds-fashion-nav__button', item);
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  function boot() {
    var header = $('#header');
    if (!header || header.dataset.dsFashionMounted === 'true') return;

    header.dataset.dsFashionMounted = 'true';
    header.classList.add('ds-fashion-header');

    var items = nativeMenuItems();
    mountAnnouncement(items);
    mountDesktopNavigation(items);
    mountActions();
    mountSearchOverlay();
    mountMobileMenuButton();
    updateStickyHeader();

    window.addEventListener('scroll', updateStickyHeader, { passive: true });
    window.addEventListener('resize', setSearchTop, { passive: true });
    window.addEventListener('storage', syncWishlistCount);
    document.addEventListener('DotykWishlistUpdated', syncWishlistCount);
    document.addEventListener('click', closeOpenDesktopDropdowns);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
