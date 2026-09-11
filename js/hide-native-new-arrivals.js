/* DOTYK SLOV — hide native Shoptet "Novinky" homepage section v1 */
(function(){
  'use strict';

  function clean(v){return (v||'').replace(/\s+/g,' ').trim();}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}

  function isCustom(node){
    return !!(node && node.closest && node.closest('#ds-new-arrivals-gallery,#ds-home-discovery'));
  }

  function looksLikeProducts(node){
    if(!node || node.nodeType!==1)return false;
    if(node.matches('.products-block,.products,.products-block-wrapper,.products-wrapper,.product-slider,.product-slider-holder'))return true;
    return !!node.querySelector('.products-block,.products-block .product,.products .product,.product-item,[data-micro-product-id]');
  }

  function hideNativeNovinky(){
    if(!document.body || !document.body.classList.contains('in-index'))return false;

    var headings=Array.prototype.slice.call(document.querySelectorAll('.homepage-group-title,h1,h2,h3,h4,.h1,.h2,.h3,.h4'));
    var hidden=false;

    headings.forEach(function(title){
      if(isCustom(title) || norm(title.textContent)!=='novinky')return;

      var block=null;
      var sibling=title.nextElementSibling;
      var steps=0;

      while(sibling && steps<4){
        if(looksLikeProducts(sibling)){
          block=sibling;
          break;
        }
        sibling=sibling.nextElementSibling;
        steps++;
      }

      if(block){
        title.style.setProperty('display','none','important');
        block.style.setProperty('display','none','important');
        title.setAttribute('data-ds-native-novinky-hidden','1');
        block.setAttribute('data-ds-native-novinky-hidden','1');

        var parent=title.parentElement;
        if(parent && block.parentElement===parent){
          var visibleChildren=Array.prototype.slice.call(parent.children).filter(function(el){
            if(el===title || el===block)return false;
            if(el.tagName==='SCRIPT' || el.tagName==='STYLE')return false;
            return true;
          });
          if(!visibleChildren.length){
            parent.style.setProperty('display','none','important');
            parent.setAttribute('data-ds-native-novinky-hidden','1');
          }
        }
        hidden=true;
        return;
      }

      /* Fallback for Shoptet variants where heading + products live inside one wrapper. */
      var node=title.parentElement;
      var depth=0;
      while(node && node!==document.body && depth<5){
        if(isCustom(node))break;
        if(looksLikeProducts(node)){
          var otherTitles=Array.prototype.slice.call(node.querySelectorAll('.homepage-group-title,h2,h3,h4')).filter(function(h){
            return h!==title && clean(h.textContent);
          });
          if(otherTitles.length===0){
            node.style.setProperty('display','none','important');
            node.setAttribute('data-ds-native-novinky-hidden','1');
            hidden=true;
          }
          break;
        }
        node=node.parentElement;
        depth++;
      }
    });

    return hidden;
  }

  function boot(){
    hideNativeNovinky();

    var attempts=0;
    var timer=setInterval(function(){
      hideNativeNovinky();
      attempts++;
      if(attempts>=20)clearInterval(timer);
    },350);

    var observer=new MutationObserver(function(){hideNativeNovinky();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect();},10000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
