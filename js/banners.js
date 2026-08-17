(function () {
  'use strict';

  function mountCleanBanners() {
    if (!document.body.classList.contains('in-index')) return;

    const carousel = document.querySelector('#carousel');
    const inner = carousel && carousel.querySelector('.carousel-inner');
    if (!carousel || !inner || carousel.dataset.dsCleanMounted) return;

    const items = Array.from(inner.children).filter((item) =>
      item.matches('.item') && item.querySelector('a[href] img')
    );

    // Keep the native wide banner when Admin currently contains only one item.
    if (items.length < 2) return;

    carousel.dataset.dsCleanMounted = 'true';
    carousel.removeAttribute('data-ride');
    carousel.setAttribute('data-interval', 'false');
    carousel.classList.add('ds-banner-clean');
    inner.classList.add('ds-banner-clean-track');

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

    const hint = document.createElement('div');
    hint.className = 'ds-clean-scroll-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Potiahni a objav ďalšie';
    carousel.insertAdjacentElement('afterend', hint);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCleanBanners, { once: true });
  } else {
    mountCleanBanners();
  }
})();
