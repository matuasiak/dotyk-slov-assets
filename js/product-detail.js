/* DOTYK SLOV — product detail rollback v2
   Removes the abandoned v1 experiment and restores native Shoptet product detail. */
(function(){
  'use strict';

  function cleanup(){
    var css=document.querySelector('link[data-ds-product-css]');
    if(css) css.remove();

    document.body.classList.remove('ds-product-page');

    document.querySelectorAll('.ds-product-eyebrow,.ds-product-trust,.ds-mobile-buy-shortcut').forEach(function(el){
      el.remove();
    });

    return true;
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  }else{
    cleanup();
  }
})();
