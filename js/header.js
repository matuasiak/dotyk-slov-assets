(function () {
  'use strict';

  const icons = {
    contact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-6h4M4 13h4v6H6a2 2 0 0 1-2-2v-4Z"/><path d="M16 19c0 1.1-1.3 2-3 2h-1"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    cart: '<svg class="ds-cart-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>'
  };

  const mobileMq = window.matchMedia('(max-width: 767px)');

  function makeDesktopAction({ className, label, icon, href = '#', target }) {
    const link = document.createElement('a');
    link.href = href;
    link.className = `ds-approved-action ${className}${target ? ' toggle-window' : ''}`;
    link.setAttribute('aria-label', label);

    if (target) link.dataset.target = target;

    link.innerHTML = `${icon}<span class="ds-tooltip">${label}</span>`;
    return link;
  }

  function makeMobileButton(className, label, icon) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `ds-mobile-control ${className}`;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = icon;
    return button;
  }

  function mountHeader() {
    const headerTop = document.querySelector('#header .header-top');
    const actions = document.querySelector('#header .navigation-buttons');
    const cart = actions && actions.querySelector('.cart-count');

    if (!headerTop || !actions || !cart) return;

    /* Remove older custom header controls from previous versions. */
    actions.querySelectorAll('.ds-approved-action').forEach((node) => node.remove());
    document.getElementById('ds-mobile-controls')?.remove();

    /* Desktop actions only. */
    [
      makeDesktopAction({
        className: 'ds-contact',
        label: 'Kontakt',
        icon: icons.contact,
        href: '/kontakty/'
      }),
      makeDesktopAction({
        className: 'ds-account',
        label: 'Môj účet',
        icon: icons.account,
        target: 'login'
      })
    ].forEach((item) => actions.insertBefore(item, cart));

    /* Our own mobile buttons are <button>, therefore Shoptet's
       generic .navigation-buttons > a::before cannot corrupt them. */
    const controls = document.createElement('div');
    controls.id = 'ds-mobile-controls';

    const menuButton = makeMobileButton(
      'ds-mobile-control--menu',
      'Otvoriť menu',
      icons.menu
    );

    const searchButtonMobile = makeMobileButton(
      'ds-mobile-control--search',
      'Hľadať',
      icons.search
    );

    controls.append(menuButton, searchButtonMobile);
    headerTop.appendChild(controls);

    /* Cart icon */
    cart.querySelector('.ds-cart-svg')?.remove();
    cart.insertAdjacentHTML('afterbegin', icons.cart);

    /* Search form icon */
    const searchButton = document.querySelector('#header .search-form .btn');
    if (searchButton) {
      searchButton.textContent = '';
      searchButton.insertAdjacentHTML('afterbegin', icons.search);
      searchButton.setAttribute('aria-label', 'Hľadať');
    }
  }

  function detectNativeFastBar() {
    if (!mobileMq.matches) {
      document.body.classList.remove('ds-native-fastbar');
      return;
    }

    const wanted = 'rýchle doručenie 2–3 dni';

    const nodes = Array.from(document.body.querySelectorAll('body *'))
      .filter((node) => {
        if (node.closest('.top-navigation-bar')) return false;
        const text = (node.textContent || '').trim().toLowerCase();
        if (!text || !text.includes(wanted)) return false;

        const rect = node.getBoundingClientRect();
        return rect.top < 100 && rect.height > 0 && rect.height < 80;
      });

    document.body.classList.toggle('ds-native-fastbar', nodes.length > 0);
  }

  function ensureMobileCloseButton() {
    const navigation = document.getElementById('navigation');
    if (!navigation || navigation.querySelector('.navigation-close')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'navigation-close';
    button.setAttribute('aria-label', 'Zavrieť menu');
    navigation.prepend(button);
  }

  function isMobileMenuOpen() {
    return (
      document.body.classList.contains('navigation-window-visible') ||
      document.body.classList.contains('ds-mobile-nav-open')
    );
  }

  function openMobileMenu() {
    if (!mobileMq.matches) return;

    document.body.classList.remove('search-window-visible');
    document.body.classList.add('navigation-window-visible', 'ds-mobile-nav-open');

    document
      .querySelector('#ds-mobile-controls .ds-mobile-control--menu')
      ?.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    document.body.classList.remove(
      'navigation-window-visible',
      'ds-mobile-nav-open',
      'submenu-visible'
    );

    document
      .querySelectorAll('#navigation .menu-level-1 > li.ext.exp')
      .forEach((item) => item.classList.remove('exp'));

    document
      .querySelector('#ds-mobile-controls .ds-mobile-control--menu')
      ?.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileSearch() {
    if (!mobileMq.matches) return;

    const opening = !document.body.classList.contains('search-window-visible');

    closeMobileMenu();
    document.body.classList.toggle('search-window-visible', opening);

    document
      .querySelector('#ds-mobile-controls .ds-mobile-control--search')
      ?.setAttribute('aria-expanded', opening ? 'true' : 'false');

    if (opening) {
      window.setTimeout(() => {
        document.querySelector('#header .search-input')?.focus();
      }, 80);
    }
  }

  function toggleSubmenu(event, arrow) {
    if (!mobileMq.matches) return;

    const item = arrow.closest('li.ext');
    if (!item) return;

    event.preventDefault();
    event.stopPropagation();

    const willOpen = !item.classList.contains('exp');

    document
      .querySelectorAll('#navigation .menu-level-1 > li.ext.exp')
      .forEach((other) => {
        if (other !== item) other.classList.remove('exp');
      });

    item.classList.toggle('exp', willOpen);

    document.body.classList.toggle(
      'submenu-visible',
      !!document.querySelector('#navigation .menu-level-1 > li.ext.exp')
    );

    arrow.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  function bindMobileNavigation() {
    ensureMobileCloseButton();

    document.addEventListener(
      'click',
      function (event) {
        const menuButton = event.target.closest(
          '#ds-mobile-controls .ds-mobile-control--menu'
        );

        if (menuButton) {
          event.preventDefault();
          event.stopPropagation();

          if (isMobileMenuOpen()) closeMobileMenu();
          else openMobileMenu();
          return;
        }

        const searchButton = event.target.closest(
          '#ds-mobile-controls .ds-mobile-control--search'
        );

        if (searchButton) {
          event.preventDefault();
          event.stopPropagation();
          toggleMobileSearch();
          return;
        }

        const closeButton = event.target.closest('#navigation .navigation-close');

        if (closeButton) {
          event.preventDefault();
          event.stopPropagation();
          closeMobileMenu();
          return;
        }

        const submenuArrow = event.target.closest(
          '#navigation .menu-level-1 > li.ext > a > .submenu-arrow'
        );

        if (submenuArrow) {
          toggleSubmenu(event, submenuArrow);
          return;
        }

        if (
          mobileMq.matches &&
          isMobileMenuOpen() &&
          !event.target.closest('#navigation') &&
          !event.target.closest('#ds-mobile-controls')
        ) {
          closeMobileMenu();
        }
      },
      true
    );

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;

      closeMobileMenu();
      document.body.classList.remove('search-window-visible');
    });
  }

  function positionCartPopup() {
    if (mobileMq.matches) return;

    const cart = document.querySelector('#header .navigation-buttons .cart-count');
    const popup = document.querySelector('.user-action .popup-widget.cart-widget');

    if (!cart || !popup) return;

    const rect = cart.getBoundingClientRect();

    const right = Math.max(12, Math.round(window.innerWidth - rect.right));
    const top = Math.round(rect.bottom + 10);

    /* Inline !important beats all the older CSS rules that were fighting us. */
    popup.style.setProperty('position', 'fixed', 'important');
    popup.style.setProperty('top', `${top}px`, 'important');
    popup.style.setProperty('right', `${right}px`, 'important');
    popup.style.setProperty('bottom', 'auto', 'important');
    popup.style.setProperty('left', 'auto', 'important');
    popup.style.setProperty('margin', '0', 'important');
    popup.style.setProperty('transform', 'none', 'important');

    document.documentElement.style.setProperty('--ds-cart-top', `${top}px`);
    document.documentElement.style.setProperty('--ds-cart-right', `${right}px`);
  }

  function watchCartPopup() {
    const cart = document.querySelector('#header .navigation-buttons .cart-count');
    if (!cart) return;

    ['mouseenter', 'focusin', 'click'].forEach((eventName) => {
      cart.addEventListener(eventName, function () {
        positionCartPopup();
        requestAnimationFrame(positionCartPopup);
        setTimeout(positionCartPopup, 20);
      });
    });

    const observer = new MutationObserver(function () {
      positionCartPopup();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    window.addEventListener('resize', positionCartPopup, { passive: true });
    window.addEventListener('scroll', positionCartPopup, { passive: true });
  }

  function startTyping() {
    const input = document.querySelector('#header .search-input');
    if (!input || input.dataset.typingActive) return;

    input.dataset.typingActive = 'true';

    const suggestions = [
      'Nie som nasratá, len sa tak tvárim',
      'Need money for letenka do prdele',
      'Psík je láska',
      'Všetko prejde',
      'Ja nekričím, ja tak rozprávam'
    ];

    let suggestion = 0;
    let character = 0;
    let deleting = false;

    function type() {
      if (document.activeElement === input || input.value) {
        setTimeout(type, 500);
        return;
      }

      const text = suggestions[suggestion];
      character += deleting ? -1 : 1;
      input.placeholder = `Skúste napríklad: ${text.slice(0, character)}`;

      let delay = deleting ? 34 : 62;

      if (!deleting && character === text.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && character === 0) {
        deleting = false;
        suggestion = (suggestion + 1) % suggestions.length;
        delay = 350;
      }

      setTimeout(type, delay);
    }

    type();
  }

  function boot() {
    mountHeader();
    detectNativeFastBar();
    bindMobileNavigation();
    watchCartPopup();
    startTyping();
    positionCartPopup();

    window.addEventListener('resize', detectNativeFastBar, { passive: true });

    if (mobileMq.addEventListener) {
      mobileMq.addEventListener('change', function () {
        detectNativeFastBar();

        if (!mobileMq.matches) {
          closeMobileMenu();
          document.body.classList.remove('search-window-visible');
        }

        positionCartPopup();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
