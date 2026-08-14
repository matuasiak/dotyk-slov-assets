(function () {
  'use strict';

  function collectionCountLabel(count) {
    if (count === 1) return '1 kolekcia';
    if (count >= 2 && count <= 4) return `${count} kolekcie`;
    return `${count} kolekcií`;
  }

  function mountBannerMosaic() {
    if (!document.body.classList.contains('in-index')) return;

    const carousel = document.querySelector('#carousel');
    const inner = carousel && carousel.querySelector('.carousel-inner');
    if (!carousel || !inner || carousel.dataset.dsMosaicMounted) return;

    const items = Array.from(inner.children).filter((item) =>
      item.matches('.item') && item.querySelector('a[href] img')
    );

    // One banner keeps the elegant native full-width presentation.
    // Two or more banners switch to the data-driven mosaic.
    if (items.length < 2) return;

    carousel.dataset.dsMosaicMounted = 'true';
    carousel.removeAttribute('data-ride');
    carousel.setAttribute('data-interval', 'false');
    carousel.classList.add('ds-banner-mosaic');

    items.forEach((item, index) => {
      item.classList.remove('next', 'prev', 'left', 'right');
      item.setAttribute('data-ds-banner-position', String(index + 1));
    });

    if (window.jQuery && typeof window.jQuery.fn.carousel === 'function') {
      try {
        window.jQuery(carousel).carousel('pause');
      } catch (_) {
        // The visual enhancement must never block native Shoptet code.
      }
    }

    const counter = document.createElement('div');
    counter.className = 'ds-banner-count';
    counter.setAttribute('aria-hidden', 'true');
    counter.textContent = `${collectionCountLabel(items.length)} · objav všetky`;
    carousel.insertAdjacentElement('afterend', counter);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountBannerMosaic, { once: true });
  } else {
    mountBannerMosaic();
  }
})();
