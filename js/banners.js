(function () {
  'use strict';

  function mountVilgainRail() {
    if (!document.body.classList.contains('in-index')) return;

    var carousel = document.querySelector('#carousel');
    var track = carousel && carousel.querySelector('.carousel-inner');
    if (!carousel || !track || carousel.dataset.dsVilgainMounted === 'true') return;

    var items = Array.prototype.filter.call(track.children, function (item) {
      return item.matches('.item') && item.querySelector('a[href] img');
    });

    /* Pri jednom banneri nechávame bezpečné natívne zobrazenie Shoptetu. */
    if (items.length < 2) return;

    carousel.dataset.dsVilgainMounted = 'true';
    carousel.dataset.dsCleanMounted = 'true';
    carousel.dataset.dsEditorialMounted = 'true';
    carousel.removeAttribute('data-ride');
    carousel.setAttribute('data-interval', 'false');
    carousel.classList.remove('ds-banner-clean', 'ds-editorial-grid', 'ds-one-card');
    carousel.classList.add('ds-vilgain-rail');
    track.classList.remove('ds-banner-clean-track');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', 'Ponuky a kolekcie Dotyk Slov');

    Array.prototype.forEach.call(
      document.querySelectorAll('.ds-banner-toolbar, .ds-clean-scroll-hint'),
      function (element) { element.remove(); }
    );

    if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.carousel === 'function') {
      try {
        window.jQuery(carousel).carousel('pause');
      } catch (error) {
        /* Bannerový rail nesmie zablokovať ostatný Shoptet kód. */
      }
    }

    items.forEach(function (item, index) {
      var image = item.querySelector('img');
      var link = item.querySelector('a[href]');
      var adminTexts = item.querySelector('.extended-banner-texts');

      item.classList.remove(
        'next', 'prev', 'left', 'right',
        'ds-editorial-card', 'ds-editorial-wide',
        'ds-has-admin-copy', 'ds-has-admin-cta',
        'ds-vg-hero', 'ds-vg-card', 'ds-vg-has-copy'
      );
      item.classList.add(index === 0 ? 'ds-vg-hero' : 'ds-vg-card');
      item.classList.toggle(
        'ds-vg-has-copy',
        Boolean(adminTexts && adminTexts.textContent.trim())
      );
      item.setAttribute('data-ds-banner-position', String(index + 1));
      item.style.removeProperty('--ds-source-ratio');

      if (link && !link.getAttribute('aria-label') && image.alt) {
        link.setAttribute('aria-label', image.alt);
      }
    });

    function nearestIndex() {
      var trackLeft = track.getBoundingClientRect().left;
      var bestIndex = 0;
      var bestDistance = Infinity;

      items.forEach(function (item, index) {
        if (window.getComputedStyle(item).display === 'none') return;
        var distance = Math.abs(item.getBoundingClientRect().left - trackLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    }

    function goTo(index) {
      var visibleItems = items.filter(function (item) {
        return window.getComputedStyle(item).display !== 'none';
      });
      var safeIndex = Math.max(0, Math.min(visibleItems.length - 1, index));
      var target = visibleItems[safeIndex];
      if (!target) return;
      track.scrollTo({
        left: target.offsetLeft - track.offsetLeft,
        behavior: 'smooth'
      });
    }

    track.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var visibleItems = items.filter(function (item) {
        return window.getComputedStyle(item).display !== 'none';
      });
      var currentItem = items[nearestIndex()];
      var currentVisibleIndex = Math.max(0, visibleItems.indexOf(currentItem));
      goTo(currentVisibleIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });

    /* Na počítači sa dá rail chytiť myšou. Mobil používa natívny swipe. */
    var dragging = false;
    var moved = false;
    var startX = 0;
    var startScrollLeft = 0;

    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 5) moved = true;
      track.scrollLeft = startScrollLeft - delta;
    });

    function stopDragging(event) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      window.setTimeout(function () { moved = false; }, 0);
    }

    track.addEventListener('pointerup', stopDragging);
    track.addEventListener('pointercancel', stopDragging);
    track.addEventListener('dragstart', function (event) {
      event.preventDefault();
    });

    track.addEventListener('click', function (event) {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
      moved = false;
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountVilgainRail, { once: true });
  } else {
    mountVilgainRail();
  }
})();
