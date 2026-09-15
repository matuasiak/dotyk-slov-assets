/* DOTYK SLOV — product detail v1 */
(function(){
  'use strict';

  var CSS='https://matuasiak.github.io/dotyk-slov-assets/css/product-detail.css?v=1';

  function $(s,r){return (r||document).querySelector(s)}
  function ensureCss(){
    var l=document.querySelector('link[data-ds-product-css]');
    if(l){l.href=CSS;return}
    l=document.createElement('link');
    l.rel='stylesheet';
    l.href=CSS;
    l.setAttribute('data-ds-product-css','1');
    document.head.appendChild(l);
  }

  function isProductPage(){
    if($('.p-detail')) return true;
    try{
      if(typeof window.getShoptetDataLayer==='function'){
        var type=window.getShoptetDataLayer('pageType');
        if(type==='productDetail') return true;
      }
    }catch(e){}
    try{
      var dl=window.dataLayer||[];
      for(var i=0;i<dl.length;i++){
        if(dl[i]&&dl[i].shoptet&&dl[i].shoptet.pageType==='productDetail') return true;
      }
    }catch(e2){}
    return false;
  }

  function addEyebrow(){
    var info=$('.p-info-wrapper');
    if(!info||$('.ds-product-eyebrow',info))return;
    var h1=$('h1',info)||$('h1[itemprop="name"]');
    if(!h1)return;
    var e=document.createElement('span');
    e.className='ds-product-eyebrow';
    e.textContent='DOTYK SLOV / PRODUCT';
    h1.parentNode.insertBefore(e,h1);
  }

  function addTrust(){
    var info=$('.p-info-wrapper');
    if(!info||$('.ds-product-trust',info))return;
    var anchor=$('.add-to-cart',info)||$('#product-detail-form',info)||$('#product-detail-form');
    if(!anchor)return;
    var box=document.createElement('div');
    box.className='ds-product-trust';
    box.innerHTML=''+
      '<div class="ds-product-trust__item"><strong>navrhnuté doma.</strong><span>myšlienky z Dotyku, nie z katalógu.</span></div>'+ 
      '<div class="ds-product-trust__item"><strong>tlačíme u nás.</strong><span>od grafiky po hotový kus.</span></div>'+ 
      '<div class="ds-product-trust__item"><strong>posielame zo Slovenska.</strong><span>bez zbytočných medzičlánkov.</span></div>';
    anchor.insertAdjacentElement('afterend',box);
  }

  function addMobileShortcut(){
    if($('.ds-mobile-buy-shortcut'))return;
    var target=$('#product-detail-form')||$('.add-to-cart')||$('.p-info-wrapper');
    if(!target)return;
    var b=document.createElement('a');
    b.href='#product-detail-form';
    b.className='ds-mobile-buy-shortcut';
    b.textContent='Vybrať variant / kúpiť →';
    b.addEventListener('click',function(e){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'center'});
    });
    document.body.appendChild(b);

    if('IntersectionObserver' in window){
      var o=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){b.classList.toggle('is-hidden',entry.isIntersecting)});
      },{threshold:.15});
      o.observe(target);
    }
  }

  function cleanEmptyShortcodes(){
    var desc=$('.p-short-description');
    if(!desc)return;
    Array.prototype.slice.call(desc.querySelectorAll('p,div')).forEach(function(n){
      var t=(n.textContent||'').trim();
      if(/^\[\[SIZE_CHART:[^\]]+\]\]$/i.test(t)) n.style.display='none';
    });
  }

  function mount(){
    if(!isProductPage())return false;
    ensureCss();
    document.body.classList.add('ds-product-page');
    addEyebrow();
    addTrust();
    addMobileShortcut();
    cleanEmptyShortcodes();
    return true;
  }

  function boot(){
    var tries=0;
    (function run(){
      if(mount())return;
      if(++tries<30)setTimeout(run,250);
    })();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
