function getShoptetPageType() {
  try {
    if (typeof window.getShoptetDataLayer === 'function') {
      const pageType = window.getShoptetDataLayer('pageType');
      if (pageType) return String(pageType);
    }
  } catch (error) {}

  const body = document.body;
  if (!body) return 'unknown';
  if (body.classList.contains('in-index')) return 'homepage';
  if (body.querySelector('.p-detail')) return 'productDetail';
  if (body.classList.contains('in-kosik')) return 'cart';
  if (body.classList.contains('in-kategorie')) return 'category';
  return 'generic';
}

function syncThemeState() {
  const pageType = getShoptetPageType();
  document.documentElement.dataset.dsPage = pageType;
  document.body?.classList.add('ds-theme-v2');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncThemeState, { once: true });
} else {
  syncThemeState();
}

document.addEventListener('ShoptetDOMContentLoaded', syncThemeState);
window.addEventListener('pageshow', syncThemeState);
