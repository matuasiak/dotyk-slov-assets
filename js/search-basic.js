(function(){
  'use strict';

  var SUGGESTIONS=['mám toho dosť','nevolaj mi','citovo nedostupný','overthinking','mikiny'];
  var BOOST_ORDER=['oblečenie','produkty podľa textu','doplnky'];
  var cache=new Map();
  var activeController=null;

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]})}
  function absUrl(v){
    if(!v)return'';
    try{return new URL(v,location.origin).href}catch(_){return v}
  }

  function getTop(){
    var header=$('#ds-site-header');
    if(!header)return 104;
    return Math.max(0,Math.round(header.getBoundingClientRect().bottom))+8;
  }

  function getBoostCategories(){
    var links=[];

    $$('#ds-site-header .ds-site-nav-link').forEach(function(a){
      if(a&&a.href)links.push({text:clean(a.textContent),href:a.href});
    });

    if(!links.length){
      $$('#navigation .menu-level-1 > li > a[href]').forEach(function(a){
        links.push({text:clean(a.textContent),href:a.href});
      });
    }

    var seen={};
    links=links.filter(function(x){
      var k=norm(x.text);
      if(!k||seen[k])return false;
      seen[k]=1;
      return true;
    });

    var picked=[];
    BOOST_ORDER.forEach(function(wanted){
      var target=norm(wanted);
      var hit=links.find(function(x){return norm(x.text)===target||norm(x.text).indexOf(target)>=0});
      if(hit)picked.push(hit);
    });

    if(picked.length<3){
      links.forEach(function(x){
        if(picked.length>=3)return;
        if(!picked.some(function(y){return y.href===x.href}))picked.push(x);
      });
    }

    return picked.slice(0,3);
  }

  function extrasMarkup(){
    var cats=getBoostCategories();

    return ''+
      '<div class="ds-basic-search__extras">'+
        '<div class="ds-basic-search__group">'+
          '<span class="ds-basic-search__group-label">Skús</span>'+
          '<div class="ds-basic-search__chips">'+
            SUGGESTIONS.map(function(q){return '<button type="button" class="ds-basic-search__chip" data-search-q="'+esc(q)+'">'+esc(q)+'</button>'}).join('')+
          '</div>'+
        '</div>'+
        '<div class="ds-basic-search__group ds-basic-search__group--categories">'+
          '<span class="ds-basic-search__group-label">Objaviť</span>'+
          '<div class="ds-basic-search__category-links">'+
            cats.map(function(c,i){return '<a href="'+esc(c.href)+'" class="ds-basic-search__category"><span>'+esc(c.text)+(i<2?'<small>BOOST</small>':'')+'</span><b>→</b></a>'}).join('')+
          '</div>'+
        '</div>'+
      '</div>';
  }

  function liveMarkup(){
    return ''+
      '<div class="ds-basic-search__live" aria-live="polite">'+
        '<div class="ds-basic-search__live-head">'+
          '<span class="ds-basic-search__group-label">Výsledky</span>'+
          '<a class="ds-basic-search__all" href="/vyhladavanie/">Zobraziť všetko →</a>'+
        '</div>'+
        '<div class="ds-basic-search__results"></div>'+
      '</div>';
  }

  function imageSource(img){
    if(!img)return'';
    var src=img.getAttribute('src')||img.getAttribute('data-src')||'';
    if(!src){
      var srcset=img.getAttribute('srcset')||img.getAttribute('data-srcset')||'';
      src=srcset.split(',')[0].trim().split(/\s+/)[0]||'';
    }
    return absUrl(src);
  }

  function productFromCard(card){
    var link=$('.p-name a,.name a,.p-in-in a,.product-name a,a.p-name,a.name,.image a',card)||$('a[href]',card);
    var titleNode=$('.p-name,.name,.p-in-in,.product-name',card);
    var img=$('.image img,.product-image img,img',card);
    var price=$('.price-final,.price,.p-bottom .price,.price-standard,.product-price',card);
    var title=clean((titleNode&&titleNode.textContent)||(link&&link.textContent));
    var href=link&&link.getAttribute('href');
    var image=imageSource(img);
    if(!title||!href)return null;
    return {title:title,href:absUrl(href),image:image,price:clean(price&&price.textContent)};
  }

  function parseProducts(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    var cards=$$('.products-block .product,.products .product,.product-slider .product,.product-item,[data-micro-product-id]',doc);
    var seen={};
    return cards.map(productFromCard).filter(Boolean).filter(function(p){
      if(seen[p.href])return false;
      seen[p.href]=1;
      return true;
    }).slice(0,8);
  }

  function productHtml(p){
    return '<a class="ds-basic-search__result" href="'+esc(p.href)+'">'+
      '<span class="ds-basic-search__result-media">'+(p.image?'<img src="'+esc(p.image)+'" alt="" loading="lazy">':'<i></i>')+'</span>'+
      '<span class="ds-basic-search__result-copy">'+
        '<span class="ds-basic-search__result-title">'+esc(p.title)+'</span>'+
        (p.price?'<span class="ds-basic-search__result-price">'+esc(p.price)+'</span>':'')+
      '</span>'+
    '</a>';
  }

  async function fetchProducts(q){
    var key=norm(q);
    if(cache.has(key))return cache.get(key);

    if(activeController)activeController.abort();
    activeController=new AbortController();

    var response=await fetch('/vyhladavanie/?string='+encodeURIComponent(q),{
      credentials:'same-origin',
      signal:activeController.signal
    });
    if(!response.ok)throw new Error('search '+response.status);
    var html=await response.text();
    var products=parseProducts(html);
    cache.set(key,products);
    return products;
  }

  function build(){
    var oldOverlay=$('#ds-site-search');
    var oldBackdrop=$('#ds-site-search-backdrop');
    if(oldOverlay)oldOverlay.remove();
    if(oldBackdrop)oldBackdrop.remove();

    var oldTrigger=$('.ds-site-search-open');
    if(!oldTrigger)return false;

    var trigger=oldTrigger.cloneNode(true);
    oldTrigger.replaceWith(trigger);

    var panel=document.createElement('div');
    panel.id='ds-basic-search';
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML=''+
      '<div class="ds-basic-search__head">'+
        '<p class="ds-basic-search__label">HĽADAŤ V DOTYKU</p>'+
        '<button class="ds-basic-search__close" type="button" aria-label="Zavrieť">×</button>'+
      '</div>'+
      '<form class="ds-basic-search__form" action="/vyhladavanie/" method="get" role="search">'+
        '<input class="ds-basic-search__input" type="search" name="string" placeholder="Hľadať" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" inputmode="search" enterkeyhint="search">'+
        '<button class="ds-basic-search__submit" type="submit" aria-label="Hľadať">'+
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>'+
        '</button>'+
      '</form>'+extrasMarkup()+liveMarkup();
    document.body.appendChild(panel);

    var input=$('.ds-basic-search__input',panel);
    var close=$('.ds-basic-search__close',panel);
    var extras=$('.ds-basic-search__extras',panel);
    var live=$('.ds-basic-search__live',panel);
    var results=$('.ds-basic-search__results',panel);
    var all=$('.ds-basic-search__all',panel);
    var timer=null;
    var renderToken=0;

    function syncTop(){
      document.documentElement.style.setProperty('--ds-basic-search-top',getTop()+'px');
    }

    function showExtras(){
      extras.hidden=false;
      live.classList.remove('is-visible');
      results.innerHTML='';
      if(activeController){activeController.abort();activeController=null}
    }

    async function showResults(){
      var q=clean(input.value);
      var token=++renderToken;

      if(q.length<2){showExtras();return}

      extras.hidden=true;
      live.classList.add('is-visible');
      all.href='/vyhladavanie/?string='+encodeURIComponent(q);
      results.innerHTML='<p class="ds-basic-search__state">Hľadám…</p>';

      try{
        var products=await fetchProducts(q);
        if(token!==renderToken)return;
        if(products.length){
          results.innerHTML=products.map(productHtml).join('');
        }else{
          results.innerHTML='<p class="ds-basic-search__state">Nič sme nenašli. Možno to zatiaľ ostalo len v hlave.</p>';
        }
      }catch(err){
        if(err&&err.name==='AbortError')return;
        if(token!==renderToken)return;
        results.innerHTML='<p class="ds-basic-search__state">Vyhľadávanie sa teraz nepodarilo načítať.</p>';
      }
    }

    function queueResults(){
      clearTimeout(timer);
      timer=setTimeout(showResults,220);
    }

    function open(){
      syncTop();
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      trigger.setAttribute('aria-expanded','true');
      setTimeout(function(){input.focus({preventScroll:true})},30);
    }

    function shut(){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      trigger.setAttribute('aria-expanded','false');
    }

    trigger.setAttribute('aria-controls','ds-basic-search');
    trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click',function(e){
      e.preventDefault();
      if(panel.classList.contains('is-open'))shut();else open();
    });

    close.addEventListener('click',shut);

    panel.addEventListener('click',function(e){
      var chip=e.target.closest('[data-search-q]');
      if(!chip)return;
      input.value=chip.getAttribute('data-search-q')||'';
      input.focus({preventScroll:true});
      input.dispatchEvent(new Event('input',{bubbles:true}));
    });

    input.addEventListener('input',queueResults);

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape')shut();
    });

    document.addEventListener('pointerdown',function(e){
      if(!panel.classList.contains('is-open'))return;
      if(panel.contains(e.target)||trigger.contains(e.target))return;
      shut();
    },true);

    addEventListener('resize',syncTop,{passive:true});
    addEventListener('scroll',syncTop,{passive:true});
    syncTop();
    return true;
  }

  function boot(){
    if(build())return;
    var observer=new MutationObserver(function(){
      if(build())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect()},8000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
