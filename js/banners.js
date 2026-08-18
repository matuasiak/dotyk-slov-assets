(function () {
  'use strict';

  function mountCleanBanners() {
    if (!document.body.classList.contains('in-index')) return;

    var carousel = document.querySelector('#carousel');
    var track = carousel && carousel.querySelector('.carousel-inner');
    if (!carousel || !track || carousel.dataset.dsCleanMounted === 'true') return;

    var items = Array.prototype.filter.call(track.children, function (item) {
      return item.matches('.item') && item.querySelector('a[href] img');
    });

    /* Pri jednom banneri nemeníme natívne správanie Shoptetu. */
    if (items.length < 2) return;

    carousel.dataset.dsCleanMounted = 'true';
    carousel.removeAttribute('data-ride');
    carousel.setAttribute('data-interval', 'false');
    carousel.classList.add('ds-banner-clean');
    track.classList.add('ds-banner-clean-track');

    items.forEach(function (item, index) {
      item.classList.remove('next', 'prev', 'left', 'right');
      item.setAttribute('data-ds-banner-position', String(index + 1));
    });

    if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.carousel === 'function') {
      try {
        window.jQuery(carousel).carousel('pause');
      } catch (error) {
        /* Vylepšenie nesmie zablokovať natívny Shoptet kód. */
      }
    }

    var toolbar = document.createElement('div');
    toolbar.className = 'ds-banner-toolbar';
    toolbar.setAttribute('aria-label', 'Navigácia bannerov');
    toolbar.innerHTML =
      '<span class="ds-banner-count" aria-live="polite">01 / ' + pad(items.length) + '</span>' +
      '<span class="ds-banner-progress" aria-hidden="true"><span></span></span>' +
      '<span class="ds-banner-swipe-label" aria-hidden="true">Potiahni ďalej</span>' +
      '<span class="ds-banner-actions">' +
        '<button class="ds-banner-arrow ds-banner-prev" type="button" aria-label="Predchádzajúci banner">←</button>' +
        '<button class="ds-banner-arrow ds-banner-next" type="button" aria-label="Ďalší banner">→</button>' +
      '</span>';

    carousel.insertAdjacentElement('afterend', toolbar);

    var count = toolbar.querySelector('.ds-banner-count');
    var progress = toolbar.querySelector('.ds-banner-progress > span');
    var previous = toolbar.querySelector('.ds-banner-prev');
    var next = toolbar.querySelector('.ds-banner-next');
    var activeIndex = 0;
    var ticking = false;

    function pad(number) {
      return String(number).padStart(2, '0');
    }

    function nearestIndex() {
      var trackLeft = track.getBoundingClientRect().left;
      var bestIndex = 0;
      var bestDistance = Infinity;

      items.forEach(function (item, index) {
        var distance = Math.abs(item.getBoundingClientRect().left - trackLeft);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      return bestIndex;
    }

    function updateToolbar() {
      activeIndex = nearestIndex();
      var maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
      var percentage = Math.min(100, Math.max(0, (track.scrollLeft / maxScroll) * 100));

      count.textContent = pad(activeIndex + 1) + ' / ' + pad(items.length);
      progress.style.width = percentage + '%';
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
      ticking = false;
    }

    function goTo(index) {
      var safeIndex = Math.max(0, Math.min(items.length - 1, index));
      var left = items[safeIndex].offsetLeft - track.offsetLeft;
      track.scrollTo({ left: left, behavior: 'smooth' });
    }

    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateToolbar);
    }, { passive: true });

    previous.addEventListener('click', function () {
      goTo(nearestIndex() - 1);
    });

    next.addEventListener('click', function () {
      goTo(nearestIndex() + 1);
    });

    /* Myšou sa dá slider chytiť a potiahnuť; dotykové zariadenia ostávajú natívne. */
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
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      if (moved) goTo(nearestIndex());
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

    window.addEventListener('resize', function () {
      window.requestAnimationFrame(updateToolbar);
    }, { passive: true });

    updateToolbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCleanBanners, { once: true });
  } else {
    mountCleanBanners();
  }
})();
