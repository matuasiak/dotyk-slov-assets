(function () {
  'use strict';

  var SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
  var SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';

  function loadSwiper() {
    if (window.Swiper) return Promise.resolve(window.Swiper);

    if (!document.querySelector('link[data-ds-swiper]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = SWIPER_CSS;
      css.dataset.dsSwiper = 'true';
      document.head.appendChild(css);
    }

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-ds-swiper]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.Swiper); }, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }

      var script = document.createElement('script');
      script.src = SWIPER_JS;
      script.async = true;
      script.dataset.dsSwiper = 'true';
      script.onload = function () { resolve(window.Swiper); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function cleanBootstrapCarousel(carousel) {
    carousel.removeAttribute('data-ride');
    carousel.setAttribute('data-interval', 'false');

    if (window.jQuery && window.jQuery.fn && typeof window.jQuery.fn.carousel === 'function') {
      try {
        window.jQuery(carousel).carousel('pause');
      } catch (_) {
        /* Native Shoptet carousel must never block our fallback. */
      }
    }
  }

  function getSlides(track) {
    return Array.prototype.filter.call(track.children, function (item) {
      return item.matches('.item') && item.querySelector('img');
    });
  }

  function prepareSlides(slides) {
    slides.forEach(function (slide, index) {
      var title = slide.querySelector('.extended-banner-title');
      var text = slide.querySelector('.extended-banner-text');
      var cta = slide.querySelector('.extended-banner-link');
      var copy = slide.querySelector('.extended-banner-texts');
      var image = slide.querySelector('img');
      var link = slide.querySelector('a[href]');

      var hasCopy = Boolean(
        (title && title.textContent.trim()) ||
        (text && text.textContent.trim()) ||
        (cta && cta.textContent.trim())
      );

      slide.classList.remove('active', 'next', 'prev', 'left', 'right');
      slide.classList.add('swiper-slide');
      slide.classList.toggle('ds-fashion-has-copy', hasCopy);
      slide.dataset.dsSlide = String(index + 1);

      if (copy && hasCopy) copy.removeAttribute('style');

      if (image) {
        image.removeAttribute('width');
        image.removeAttribute('height');
        if (index === 0) image.setAttribute('fetchpriority', 'high');
        else image.setAttribute('loading', 'lazy');
      }

      if (link && image && !link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', image.alt || ('Dotyk Slov slide ' + (index + 1)));
      }
    });
  }

  function createUi(carousel, count) {
    var old = carousel.querySelector('.ds-fashion-slider-ui');
    if (old) old.remove();

    var ui = document.createElement('div');
    ui.className = 'ds-fashion-slider-ui';
    ui.innerHTML =
      '<button class="ds-fashion-slider-button ds-fashion-slider-prev" type="button" aria-label="Predchádzajúci slide">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>' +
      '</button>' +
      '<div class="ds-fashion-slider-fraction"><strong>01</strong> / <span>' + String(count).padStart(2, '0') + '</span></div>' +
      '<button class="ds-fashion-slider-button ds-fashion-slider-next" type="button" aria-label="Ďalší slide">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>' +
      '</button>';

    carousel.appendChild(ui);

    var mark = document.createElement('div');
    mark.className = 'ds-fashion-slider-mark';
    mark.textContent = 'veci, ktoré sa niekedy ťažko hovoria';
    carousel.appendChild(mark);

    return ui;
  }

  function mountFallback(carousel, track, slides) {
    carousel.classList.add('ds-fashion-slider');
    slides[0].classList.add('active');
    createUi(carousel, slides.length);
  }

  function mountFashionSlider() {
    if (!document.body.classList.contains('in-index')) return;

    var carousel = document.querySelector('#carousel');
    var track = carousel && carousel.querySelector('.carousel-inner');
    if (!carousel || !track || carousel.dataset.dsFashionMounted === 'true') return;

    var slides = getSlides(track);
    if (!slides.length) return;

    carousel.dataset.dsFashionMounted = 'true';
    cleanBootstrapCarousel(carousel);
    prepareSlides(slides);

    carousel.classList.remove('ds-vilgain-rail', 'ds-banner-clean', 'ds-editorial-grid');
    carousel.classList.add('swiper', 'ds-fashion-slider');
    track.classList.add('swiper-wrapper');

    var ui = createUi(carousel, slides.length);
    var current = ui.querySelector('.ds-fashion-slider-fraction strong');

    if (slides.length === 1) {
      slides[0].classList.add('swiper-slide-active', 'active');
      ui.querySelectorAll('.ds-fashion-slider-button').forEach(function (button) {
        button.style.display = 'none';
      });
      return;
    }

    loadSwiper().then(function (Swiper) {
      if (!Swiper) {
        mountFallback(carousel, track, slides);
        return;
      }

      var slider = new Swiper(carousel, {
        loop: true,
        speed: 1050,
        grabCursor: true,
        allowTouchMove: true,
        watchSlidesProgress: true,
        effect: 'creative',
        creativeEffect: {
          limitProgress: 2,
          prev: {
            translate: ['-18%', 0, -1],
            scale: 0.96,
            opacity: 0.45
          },
          next: {
            translate: ['100%', 0, 0],
            scale: 1,
            opacity: 1
          }
        },
        autoplay: {
          delay: 5600,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        keyboard: {
          enabled: true,
          onlyInViewport: true
        },
        navigation: {
          nextEl: ui.querySelector('.ds-fashion-slider-next'),
          prevEl: ui.querySelector('.ds-fashion-slider-prev')
        },
        on: {
          init: function (swiper) {
            current.textContent = String(swiper.realIndex + 1).padStart(2, '0');
          },
          slideChange: function (swiper) {
            current.textContent = String(swiper.realIndex + 1).padStart(2, '0');
          }
        }
      });

      carousel.dsFashionSwiper = slider;
    }).catch(function () {
      mountFallback(carousel, track, slides);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountFashionSlider, { once: true });
  } else {
    mountFashionSlider();
  }
})();
