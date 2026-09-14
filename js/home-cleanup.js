/* DOTYK SLOV — homepage cleanup v1
   Removes legacy Shoptet homepage blocks that clash with the custom editorial HP. */
(function(){
  'use strict';
  function clean(v){return (v||'').replace(/\s+/g,' ').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function hideSectionByHeading(){
    if(!document.body.classList.contains('in-index'))return;
    var targets=['posledne komentare','latest comments','komentare','hodnotenia zakaznikov'];
    Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,h4,.homepage-group-title,.h4')).forEach(function(h){
      if(h.closest('[id^="ds-"],#ds-home-discovery,#ds-new-arrivals-gallery,#ds-home-bestsellers,#ds-home-instagram,#ds-home-newsletter'))return;
      var t=clean(h.textContent);
      if(!targets.some(function(x){return t===x||t.indexOf(x)>=0}))return;
      var n=h,depth=0,best=null;
      while(n&&n!==document.body&&depth<6){
        var rect=n.getBoundingClientRect();
        if(rect.width>window.innerWidth*.45&&rect.height>100)best=n;
        if(n.matches&&n.matches('section,.content-wrapper,.homepage-group,.content-inner,.row')){best=n;break}
        n=n.parentElement;depth++;
      }
      if(best){best.style.setProperty('display','none','important');best.setAttribute('data-ds-hidden-native','comments')}
    });
  }
  function boot(){hideSectionByHeading();var n=0;var timer=setInterval(function(){hideSectionByHeading();if(++n>15)clearInterval(timer)},350)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();