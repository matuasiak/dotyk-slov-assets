(function(){
  'use strict';

  var ASSET='https://matuasiak.github.io/dotyk-slov-assets/images/';
  var BOOST=['oblecenie','produkty podla textu','doplnky','limitky','vypredaj'];
  var FALLBACK_PRODUCTS=[
    {title:'mám toho dosť. esteticky.',price:'',image:ASSET+'promo1.jpg',href:'#'},
    {title:'veci, ktoré nepovieš nahlas.',price:'',image:ASSET+'hero.jpg',href:'#'},
    {title:'real feelings.',price:'',image:ASSET+'promo2.jpg',href:'#'},
    {title:'overthinking club.',price:'',image:ASSET+'story.jpg',href:'#'}
  ];

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function txt(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return txt(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function removeOldPatchSearchStyles(){
    var old=$('#ds-header-patch-styles');
    if(old) old.remove();
    if(!$('#ds-mega-safety-style')){
      var style=document.createElement('style');
      style.id='ds-mega-safety-style';
      style.textContent='html,body{max-width:100%!important;overflow-x:clip!important}';
      document.head.appendChild(style);
    }
  }

  function addCategory(out,a){
    if(!a||!a.href)return;
    var label=txt(a.textContent);
    if(!label)return;
    out.push({text:label,href:a.href});
  }

  function categories(){
    var out=[];

    /* Preferred source: our mounted header. */
    $$('#ds-site-header .ds-site-nav-item').forEach(function(item){
      addCategory(out,$('.ds-site-nav-link',item));
      $$('.ds-site-submenu-grid a',item).forEach(function(a){addCategory(out,a)});
    });

    /* Mobile-safe fallback: original Shoptet navigation still exists in DOM. */
    if(out.length<5){
      $$('#navigation .menu-level-1 > li > a,#navigation .menu-level-2 a').forEach(function(a){addCategory(out,a)});
    }

    var seen={};
    out=out.filter(function(x){
      var k=norm(x.text);
      if(!k||seen[k])return false;
      seen[k]=1;
      return true;
    });

    out.sort(function(a,b){
      function score(x){
        var n=norm(x.text);
        var i=BOOST.findIndex(function(t){return n.indexOf(t)>=0});
        return i<0?99:i;
      }
      return score(a)-score(b);
    });
    return out.slice(0,7);
  }

  function productFromCard(card){
    var link=$('.p-name a,.name a,.p-in-in a,a.p-name,a.name,.image a',card)||$('a[href]',card);
    var image=$('.image img,img',card);
    var price=$('.price-final,.price,.p-bottom .price,.price-standard',card);
    var title=link&&txt(link.textContent);
    if(!title){var t=$('.p-name,.name,.p-in-in',card);title=t&&txt(t.textContent)}
    if(!link||!title||!image)return null;
    return {
      title:title,
      price:price&&txt(price.textContent)||'',
      image:image.currentSrc||image.src||image.getAttribute('data-src')||image.getAttribute('data-srcset')||'',
      href:link.href
    };
  }

  function productsFromDocument(doc){
    var cards=$$('.products-block .product,.products .product,.product-slider .product,.product',doc);
    var items=cards.map(productFromCard).filter(Boolean);
    var seen={};
    return items.filter(function(x){
      if(!x.href||seen[x.href])return false;
      seen[x.href]=1;
      return true;
    }).slice(0,10);
  }

  function pageProducts(){return productsFromDocument(document).slice(0,8)}

  function productHtml(p,cls){
    return '<a class="ds-search-mega__product '+(cls||'')+'" href="'+esc(p.href||'#')+'">'+
      '<span class="ds-search-mega__product-media">'+(p.image?'<img src="'+esc(p.image)+'" alt="" loading="lazy">':'')+'</span>'+
      '<span class="ds-search-mega__product-copy"><span class="ds-search-mega__product-title">'+esc(p.title)+'</span><span class="ds-search-mega__product-price">'+esc(p.price||'')+'</span></span>'+
    '</a>';
  }

  function defaultMarkup(){
    var cats=categories();
    var products=pageProducts();
    if(products.length<4) products=products.concat(FALLBACK_PRODUCTS).slice(0,6);
    var feature=products[0]||FALLBACK_PRODUCTS[0];
    var rest=products.slice(1,7);

    return '<div class="ds-search-mega__default"><div class="ds-search-mega__body">'+
      '<section class="ds-search-mega__column"><p class="ds-search-mega__label"><i></i>Objaviť</p><div class="ds-search-mega__categories">'+
        cats.map(function(c,i){return '<a class="ds-search-mega__category" href="'+esc(c.href)+'"><span>'+esc(c.text)+(i<2?'<small class="ds-search-mega__boost">BOOST</small>':'')+'</span><span>→</span></a>'}).join('')+
      '</div></section>'+
      '<section class="ds-search-mega__column"><p class="ds-search-mega__label"><i></i>Vybrali sme</p><a class="ds-search-mega__feature" href="'+esc(feature.href||'#')+'"><span class="ds-search-mega__feature-media">'+(feature.image?'<img src="'+esc(feature.image)+'" alt="" loading="lazy">':'')+'<b class="ds-search-mega__feature-tag">MOOD</b></span><span class="ds-search-mega__feature-title">'+esc(feature.title)+'</span><span class="ds-search-mega__feature-price">'+esc(feature.price||'')+'</span></a></section>'+
      '<section class="ds-search-mega__column"><p class="ds-search-mega__label"><i></i>Možno hľadáš</p><div class="ds-search-mega__products">'+rest.map(function(p){return productHtml(p)}).join('')+'</div></section>'+
    '</div></div><div class="ds-search-mega__live"><div class="ds-search-mega__live-head"><span>Výsledky</span><a href="#" class="ds-search-mega__all">Zobraziť všetko →</a></div><div class="ds-search-mega__live-products"></div></div>';
  }

  var requestSeq=0;
  async function fetchSearchProducts(query){
    var id=++requestSeq;
    var url='/vyhladavanie/?string='+encodeURIComponent(query);
    var response=await fetch(url,{credentials:'same-origin'});
    if(!response.ok)throw new Error('search '+response.status);
    var html=await response.text();
    if(id!==requestSeq)return null;
    var doc=new DOMParser().parseFromString(html,'text/html');
    return productsFromDocument(doc);
  }

  async function renderLive(mega,input){
    var q=txt(input.value);
    var live=$('.ds-search-mega__live-products',mega);
    var all=$('.ds-search-mega__all',mega);

    if(q.length<2){
      mega.classList.remove('is-live');
      return;
    }

    mega.classList.add('is-live');
    if(all) all.href='/vyhladavanie/?string='+encodeURIComponent(q);
    live.innerHTML='<p class="ds-search-mega__empty">Hľadám veci, ktoré by ti mohli sadnúť…</p>';

    try{
      var items=await fetchSearchProducts(q);
      if(items&&items.length){
        live.innerHTML=items.slice(0,8).map(function(p){return productHtml(p)}).join('');
        return;
      }
    }catch(_){ }

    live.innerHTML='<p class="ds-search-mega__empty">Nič sme nenašli. Možno to zatiaľ ostalo len v hlave.</p>';
  }

  function suppressNativeWhisperers(){
    var selectors=['.search-whisperer','.search-results','.search-results-groups','#search-results','.search-results-wrapper'];
    selectors.forEach(function(selector){
      $$(selector).forEach(function(node){
        if(node.closest('.ds-search-mega__live'))return;
        node.setAttribute('aria-hidden','true');
      });
    });
  }

  function mount(){
    removeOldPatchSearchStyles();
    var overlay=$('#ds-site-search');
    if(!overlay||overlay.dataset.dsMega==='1')return !!overlay;
    var oldInner=$('.ds-site-search-inner',overlay);
    var slot=oldInner&&$('.ds-site-search-slot',oldInner);
    var native=slot&&$('.search',slot);
    if(!oldInner||!native)return false;

    var input=$('.search-input',native);
    if(!input)return false;

    input.setAttribute('autocomplete','off');
    input.setAttribute('autocorrect','off');
    input.setAttribute('autocapitalize','none');
    input.setAttribute('spellcheck','false');
    input.setAttribute('inputmode','search');
    input.setAttribute('enterkeyhint','search');
    input.setAttribute('role','searchbox');

    var mega=document.createElement('div');
    mega.className='ds-search-mega';
    mega.innerHTML='<div class="ds-search-mega__top"><div class="ds-search-mega__eyebrow"><span>HĽADAŤ V DOTYKU</span><button type="button" class="ds-site-search-close" aria-label="Zavrieť">×</button></div><div class="ds-site-search-slot"></div></div>'+defaultMarkup();
    $('.ds-site-search-slot',mega).appendChild(native);
    oldInner.replaceWith(mega);
    overlay.dataset.dsMega='1';

    $('.ds-site-search-close',mega).addEventListener('click',function(){document.body.classList.remove('ds-site-search-open')});

    var timer;
    input.addEventListener('input',function(){
      suppressNativeWhisperers();
      clearTimeout(timer);
      timer=setTimeout(function(){renderLive(mega,input)},180);
    });
    input.addEventListener('focus',function(){
      suppressNativeWhisperers();
      renderLive(mega,input);
    });

    /* Shoptet may inject its native whisperer after our input event. Hide it immediately. */
    var observer=new MutationObserver(function(){
      suppressNativeWhisperers();
    });
    observer.observe(document.body,{childList:true,subtree:true});

    suppressNativeWhisperers();
    return true;
  }

  function boot(){
    if(mount())return;
    var o=new MutationObserver(function(){if(mount())o.disconnect()});
    o.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){o.disconnect()},8000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();