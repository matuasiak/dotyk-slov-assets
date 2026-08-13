(function () {
  'use strict';

  function action(target, label, icon, extraClass) {
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'ds-header-action toggle-window ' + (extraClass || '');
    link.dataset.target = target;
    link.setAttribute('aria-label', label);
    link.innerHTML = icon;
    return link;
  }

  function mountHeaderActions() {
    var actions = document.querySelector('#header .navigation-buttons');
    if (!actions || actions.querySelector('.ds-header-action')) return;

    var cart = actions.querySelector('.cart-count');
    var search = action('search', 'Hľadať', '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>', 'ds-search');
    var account = action('login', 'Môj účet', '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>', 'ds-account');

    actions.insertBefore(search, cart);
    actions.insertBefore(account, cart);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountHeaderActions, { once: true });
  } else {
    mountHeaderActions();
  }
})();
