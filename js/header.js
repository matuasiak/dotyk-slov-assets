(function () {
  'use strict';

  const icons = {
    contact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-6h4M4 13h4v6H6a2 2 0 0 1-2-2v-4Z"/><path d="M16 19c0 1.1-1.3 2-3 2h-1"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    search: '<svg class="ds-search-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    cart: '<svg class="ds-cart-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>'
  };

  function makeAction({ className, label, icon, href = '#', target }) {
    const link = document.createElement('a');
    link.href = href;
    link.className = `ds-approved-action ${className}${target ? ' toggle-window' : ''}`;
    link.setAttribute('aria-label', label);
    if (target) link.dataset.target = target;
    link.innerHTML = `${icon}<span class="ds-tooltip">${label}</span>`;
    return link;
  }

  function mountHeader() {
    const actions = document.querySelector('#header .navigation-buttons');
    const cart = actions && actions.querySelector('.cart-count');
    if (!actions || !cart) return;

    actions.querySelectorAll('.ds-approved-action').forEach((node) => node.remove());
    [
      makeAction({ className: 'ds-mobile-action ds-mobile-menu', label: 'Menu', icon: icons.menu, target: 'navigation' }),
      makeAction({ className: 'ds-contact', label: 'Kontakt', icon: icons.contact, href: '/kontakty/' }),
      makeAction({ className: 'ds-account', label: 'Môj účet', icon: icons.account, target: 'login' }),
      makeAction({ className: 'ds-mobile-action ds-mobile-search', label: 'Hľadať', icon: icons.search, target: 'search' })
    ].forEach((item) => actions.insertBefore(item, cart));

    cart.querySelector('.ds-cart-svg')?.remove();
    cart.insertAdjacentHTML('afterbegin', icons.cart);

    const searchButton = document.querySelector('#header .search-form .btn');
    if (searchButton) {
      searchButton.textContent = '';
      searchButton.insertAdjacentHTML('afterbegin', icons.search);
      searchButton.setAttribute('aria-label', 'Hľadať');
    }
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
    startTyping();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
