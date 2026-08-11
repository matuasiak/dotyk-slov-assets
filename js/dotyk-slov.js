/**
 * Dotyk Slov — Shoptet interactions
 * Kept intentionally small in stage 1 so native Shoptet behaviour remains intact.
 */
(() => {
  "use strict";

  document.documentElement.classList.add("ds-js");

  const init = () => {
    document.body.classList.add("ds-ready");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
