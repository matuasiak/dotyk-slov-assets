(function () {
  'use strict';

  function mountEditorialBanners() {
    if (!document.body.classList.contains('in-index')) return;

    var carousel = document.querySelector('#carousel');
    var track = carousel && carousel.querySelector('.carousel-inner');
    if (!carousel || !track || carousel.dataset.dsEditorialMounted === 'true') return;

    var items = Array.prototype.filter.call(track.children, function (item) {
      return item.matches('.item') && item.querySelector('a[href] img');
    });

    /* Jeden banner nechávame natívny – žiadny JS zásah nie je potrebný. */
    if (items.length < 2) return;

    carousel.dataset.dsEditorialMounted = 'true';
    carousel.dataset.dsCleanMounted = 'true';
    carousel.removeAttribute('data-ride');
    carousel.setAttribute('data-interval', 'false');
    carousel.classList.remove('ds-banner-clean');
    carousel.classList.add('ds-editorial-grid');
    track.classList.remove('ds-banner-clean-track', 'is-dragging');

    /* Odstránenie prvkov zo starej sliderovej verzie, ak už predtým nabehla. */
    Array.prototype.forEach.call(
      document.querySelectorAll('.ds-banner-toolbar, .ds-clean-scroll-hint'),
      function (element) { element.remove(); }
    );

    if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.carousel === 'function') {
      try {
        window.jQuery(carousel).carousel('pause');
      } catch (error) {
        /* Úprava bannerov nesmie zablokovať ostatný Shoptet kód. */
      }
    }

    var cardCount = 0;

    items.forEach(function (item, index) {
      var image = item.querySelector('img');
      var link = item.querySelector('a[href]');
      var width = image.naturalWidth || parseFloat(image.getAttribute('width')) || 1;
      var height = image.naturalHeight || parseFloat(image.getAttribute('height')) || 1;
      var ratio = width / height;
      var isWide = ratio >= 2.2;

      item.classList.remove('next', 'prev', 'left', 'right', 'ds-editorial-card', 'ds-editorial-wide');
      item.classList.add(isWide ? 'ds-editorial-wide' : 'ds-editorial-card');
      item.setAttribute('data-ds-banner-position', String(index + 1));
      item.style.setProperty('--ds-source-ratio', String(ratio));

      if (!isWide) cardCount += 1;

      if (link && !link.getAttribute('aria-label') && image.alt) {
        link.setAttribute('aria-label', image.alt);
      }
    });

    if (cardCount === 1) carousel.classList.add('ds-one-card');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountEditorialBanners, { once: true });
  } else {
    mountEditorialBanners();
  }
})();
