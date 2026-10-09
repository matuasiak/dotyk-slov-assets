/* DOTYK SLOV / STREETWEAR HOMEPAGE — October 2026
   Scoped progressive enhancement of Shoptet homepage.
   All products/prices/links are sourced from the storefront DOM, not invented. */
(function(){
'use strict';
if(!document.body || !document.body.classList.contains('in-index')) {
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  return;
}
run();
function run(){
  if(!document.body || !document.body.classList.contains('in-index')) return;
  if(document.getElementById('ds-streetwear')) return;
  var ASSET='https://matuasiak.github.io/dotyk-slov-assets/images/';
  var IG='https://www.instagram.com/dotykslov/';
  function one(s,r){return (r||document).querySelector(s)}
  function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim()}
  function norm(s){return clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function escapeHTML(s){return String(s||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function abs(u){try{return new URL(u,location.href).href}catch(_){return''}}
  function ownLink(u){var full=abs(u);return full && new URL(full).origin===location.origin?full:''}
  function imgSrc(i){
    if(!i)return '';
    var keys=['data-src','data-lazy-src','data-original','data-lazy','src'];
    for(var j=0;j<keys.length;j++){
      var val=clean(i.getAttribute(keys[j]));
      if(val && !/^(data|blob):|placeholder|spacer|transparent/i.test(val))return abs(val);
    }
    var set=i.getAttribute('srcset')||i.getAttribute('data-srcset')||'';
    var bits=clean(set.split(',').pop()).split(/\s+/);
    return bits[0]?abs(bits[0]):'';
  }
  function logo(){
    var mark=one('#ds-site-header .ds-site-logo img');
    if(mark && !mark.getAttribute('data-ds-oval')){
      mark.alt='Dotyk Slov';
      mark.setAttribute('data-ds-oval','1');
    }
  }
  logo();
  if(!one('#ds-site-header')) {
    var watcher=new MutationObserver(function(){if(one('#ds-site-header')){logo();watcher.disconnect()}});
    watcher.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){watcher.disconnect()},7000);
  }
  /* Do not pick the active native carousel slide: it changes randomly.
     Only use a campaign image that is explicitly marked Oblecenie s nazorom.
     Until the custom campaign is uploaded, the stable neutral hero is used. */
  var originalBanner=one('.banners-row');
  var heroSource='';
  var originalCampaign=all('.banners-row img').find(function(img){
    var text=norm((img.alt||'')+' '+(img.getAttribute('src')||'')+' '+(img.getAttribute('data-src')||''));
    return /oblecenie.s.nazorom|dotyk.streetwear|streetwear.campaign/.test(text);
  });
  if(originalCampaign)heroSource=imgSrc(originalCampaign);
  /* No unrelated stock hero: use a quiet monochrome fallback. */
  var configuredBanner=!!originalCampaign;
  document.documentElement.classList.toggle('ds-sw-awaiting-campaign',!configuredBanner);

  function links(){
    var n=all('#ds-site-header .ds-site-nav-link[href],#navigation .menu-level-1 > li > a[href],#ds-site-header .ds-site-submenu a[href]');
    return n.map(function(a){return {text:norm(a.textContent),href:ownLink(a.href)}}).filter(function(a){return !!a.href});
  }
  var storeLinks=links();
  function route(names){
    for(var i=0;i<names.length;i++){
      var wanted=norm(names[i]);
      var exact=storeLinks.find(function(x){return x.text===wanted});
      if(exact)return exact.href;
    }
    for(var j=0;j<names.length;j++){
      var contains=norm(names[j]);
      var found=storeLinks.find(function(x){return x.text.indexOf(contains)!==-1});
      if(found)return found.href;
    }
    return '';
  }
  var hrefNew=route(['novinky','nová kolekcia','nova kolekcia']);
  var hrefTee=route(['tričká','tricka','t-shirts']);
  var hrefHood=route(['mikiny','hoodies']);
  var hrefAcc=route(['doplnky','accessories']);
  var hrefAll=route(['všetko','vsetko','kolekcie','oblečenie','oblecenie']);
  var hrefAbout=route(['o nás','o nas','náš príbeh','nas pribeh']);
  function anchor(label,href,cl){
    return href?'<a class="'+cl+'" href="'+escapeHTML(href)+'">'+label+'</a>':'';
  }
  var categories=[
    {label:'TRIČKÁ',href:hrefTee,image:'promo1.jpg',code:'01'},
    {label:'MIKINY',href:hrefHood,image:'story.jpg',code:'02'},
    {label:'DOPLNKY',href:hrefAcc,image:'category-accessories.jpg',code:'03'}
  ].filter(function(c){return !!c.href});
  function categoryImage(c){
    /* Use real Shoptet product photos, not generic fashion stock. */
    var queries={
      'TRIČKÁ':/tričko|tri[ck]ko|crop top/i,
      'MIKINY':/mikina|hoodie/i,
      'DOPLNKY':/taška|taska|šiltovka|siltovka|hrnček|hrncek/i
    };
    var rx=queries[c.label];
    if(rx){
      var nodes=all('.products-block .product,.products .product');
      var matching=nodes.find(function(node){
        var title=one('[data-micro="name"]',node);
        return title&&rx.test(clean(title.textContent))&&one('img',node);
      });
      if(matching){var photo=imgSrc(one('img',matching));if(photo)return photo;}
    }
    return ASSET+c.image;
  }
  function categoryCard(c){
    return '<a class="ds-sw-category" href="'+escapeHTML(c.href)+'">'+
      '<img src="'+escapeHTML(categoryImage(c))+'" alt="" loading="lazy" decoding="async">'+
      '<span class="ds-sw-category__number">'+c.code+' / DS</span>'+
      '<span class="ds-sw-category__name">'+c.label+' <i aria-hidden="true">↗</i></span></a>';
  }
  function trust(){
    return '<div class="ds-sw-trust" aria-label="Dotyk Slov">'+
      '<span><i aria-hidden="true">✳</i> Originálne slovenské dizajny</span>'+
      '<span><i aria-hidden="true">✳</i> Potlač u nás</span>'+
      '<span><i aria-hidden="true">✳</i> Myšlienky, ktoré poznáš</span>'+
      '</div>';
  }
  function hero(){
    return '<section class="ds-sw-hero'+(configuredBanner?' ds-sw-hero--native':' ds-sw-hero--fallback')+'" aria-label="Oblečenie s názorom">'+
      (heroSource?'<div class="ds-sw-hero__media"><img src="'+escapeHTML(heroSource)+'" alt="Dotyk Slov — oblečenie s názorom" fetchpriority="high" decoding="async"></div>':'')+
      '<div class="ds-sw-hero__mobile-copy"><span>DOTYK SLOV / ODEVY S MYŠLIENKOU</span><h1>OBLEČENIE<br><em>S NÁZOROM.</em></h1><p>Nie všetko treba povedať nahlas.</p></div>'+
      '<div class="ds-sw-hero__action">'+anchor('POZRIEŤ KOLEKCIU <span aria-hidden="true">↗</span>',hrefNew||hrefAll||hrefTee,'ds-sw-pill')+'</div>'+
      '</section>';
  }
  function head(kicker,title,rightLink){
    return '<div class="ds-sw-heading"><div><span class="ds-sw-eyebrow">'+kicker+'</span><h2>'+title+'</h2></div>'+rightLink+'</div>';
  }
  function productFrom(el){
    if(el.closest && el.closest('#ds-streetwear,#ds-home-tail,#ds-new-arrivals-gallery,#ds-home-bestsellers'))return null;
    var a=one('a.name[href],.name a[href],.p-name a[href],.p-in-in a[href],.product-name a[href],h2 a[href],h3 a[href]',el);
    if(!a)a=one('a[href] img',el);
    if(a && a.tagName==='IMG')a=a.closest('a[href]');
    if(!a)return null;
    var titleNode=one('[data-micro="name"]',el)||one('a.name,.p-name a,.product-name a,h2 a,h3 a',el);
    var name=clean(titleNode&&titleNode.textContent)||clean(a.getAttribute('title'))||clean(a.textContent);
    var price=clean((one('.price-final strong,.price-final,.p-final-price,[data-micro="price"],.price',el)||{}).textContent);
    var photo=imgSrc(one('img',el));
    var url=ownLink(a.href);
    return name&&photo&&url?{name:name,price:price,image:photo,href:url}:null;
  }
  function parseProducts(doc){
    var used={};
    var selectors='.products-block .product,.products .product,.product-item,[data-micro-product-id]';
    return all(selectors,doc).map(productFrom).filter(function(p){
      if(!p||used[p.href])return false;
      used[p.href]=true;return true;
    });
  }
  async function loadProducts(){
    var items=parseProducts(document);
    var src=hrefNew||'/novinky/';
    if(items.length<5){
      try{
        var response=await fetch(src,{credentials:'same-origin'});
        if(response.ok){
          var html=await response.text();
          var parsed=parseProducts(new DOMParser().parseFromString(html,'text/html'));
          if(parsed.length>0)items=parsed;
        }
      }catch(e){}
    }
    if(items.length<4 && hrefAll){
      try{
        var r=await fetch(hrefAll,{credentials:'same-origin'});
        if(r.ok){
          var more=parseProducts(new DOMParser().parseFromString(await r.text(),'text/html'));
          more.forEach(function(p){if(items.length<8&&!items.some(function(q){return q.href===p.href}))items.push(p)});
        }
      }catch(e){}
    }
    return items.sort(function(a,b){
      function score(p){
        var n=norm(p.name);
        return (/oversized|mikina|hoodie|unisex|boxy|off.white|cierna|oliv|slav|le[tť]enka|maybe/.test(n)?4:0)
          - (/candy.pink|ruzova|cotton.pink|macka.vo.vreci/.test(n)?2:0);
      }
      return score(b)-score(a);
    }).slice(0,6);
  }
  function renderProduct(p,i){
    return '<a class="ds-sw-product" href="'+escapeHTML(p.href)+'">'+
      '<span class="ds-sw-product__photo"><img loading="lazy" decoding="async" src="'+escapeHTML(p.image)+'" alt="'+escapeHTML(p.name)+'"></span>'+
      '<span class="ds-sw-product__name">'+escapeHTML(p.name)+'</span>'+
      (p.price?'<span class="ds-sw-product__price">'+escapeHTML(p.price)+'</span>':'')+
      '</a>';
  }
  function products(){
    return '<section class="ds-sw-products" id="ds-sw-novinky" aria-label="Naše produkty"><div class="ds-sw-inner">'+
      head('DOTYK SLOV / VÝBER','MYŠLIENKY NA NOSENIE.',anchor('POZRIEŤ VŠETKO ↗',hrefNew||hrefAll,'ds-sw-section-link'))+
      '<p class="ds-sw-underheading">Pre všetko, čo niekedy ostáva len v hlave.</p>'+
      '<div class="ds-sw-products__scroll" id="ds-sw-products-list" aria-live="polite"></div></div></section>';
  }
  function editorial(){
    return '<section class="ds-sw-editorial" aria-label="Čo sme">'+
      '<div class="ds-sw-editorial__inner ds-sw-inner">'+
      '<span class="ds-sw-eyebrow">DOTYK SLOV / MANIFEST</span>'+
      '<div class="ds-sw-editorial__copy"><h2>NIE VŠETKO TREBA<br>POVEDAŤ <em>NAHLAS.</em></h2>'+
      '<p>Niektoré myšlienky sa lepšie nosia. Na tričku, na mikine, na vlastných pravidlách.</p></div>'+
      '</div></section>';
  }
  function moods(){
    return '<section class="ds-sw-moods ds-sw-inner" aria-label="Vyber si svoj mood">'+
      head('PODĽA NÁLADY / 003','PRE KAŽDÚ VERZIU TEBA.','')+
      '<div class="ds-sw-moods__grid">'+
      (hrefTee?'<a href="'+escapeHTML(hrefTee)+'"><span>01</span><strong>PRE INTROVERTOV</strong><b>↗</b></a>':'')+
      (hrefHood?'<a href="'+escapeHTML(hrefHood)+'"><span>02</span><strong>PRE OVERTHINKEROV</strong><b>↗</b></a>':'')+
      (hrefAcc?'<a href="'+escapeHTML(hrefAcc)+'"><span>03</span><strong>PRE DETAILISTOV</strong><b>↗</b></a>':'')+
      ((hrefNew||hrefAll)?'<a href="'+escapeHTML(hrefNew||hrefAll)+'"><span>04</span><strong>PRE VŠETKÝCH OSTATNÝCH</strong><b>↗</b></a>':'')+
      '</div></section>';
  }
  function community(){
    var photos=['p1.jpg','p2.jpg','p3.jpg'];
    return '<section class="ds-sw-community ds-sw-inner" aria-label="Dotyk Slov komunita">'+
      head('DOTYK SLOV / ĽUDIA','TÍ, ČO TO CHÁPU.',anchor('SLEDOVAŤ NÁS ↗',IG,'ds-sw-section-link'))+
      '<p class="ds-sw-underheading">Ak toto chápeš, patríš sem. @dotykslov</p>'+
      '<div class="ds-sw-community__scroll">'+photos.map(function(photo,i){
        return '<a href="'+IG+'" target="_blank" rel="noopener noreferrer" aria-label="Dotyk Slov Instagram '+(i+1)+'"><img src="'+ASSET+photo+'" loading="lazy" decoding="async" alt="Dotyk Slov komunita"></a>';
      }).join('')+'</div></section>';
  }
  function newsletter(){
    return '<section class="ds-sw-newsletter" aria-label="Newsletter"><div class="ds-sw-newsletter__inner">'+
      '<div><span class="ds-sw-eyebrow">INBOX / LEN OBČAS</span><h2>BUĎ V OBRAZE.</h2><p>Nové kolekcie, limitované dropy. Žiadny zbytočný spam.</p></div>'+
      '<div class="ds-sw-newsletter__slot" data-ds-sw-newsletter><a href="#footer">Newsletter ↓</a></div></div></section>';
  }
  function moveNewsletter(){
    var slot=one('[data-ds-sw-newsletter]'),form=one('#footer .newsletter form,#footer form[action*="newsletter"],#footer form[action*="subscribe"],.newsletter form');
    if(!slot||!form||form.closest('#ds-streetwear'))return false;
    slot.innerHTML='';
    slot.appendChild(form);
    return true;
  }
  var anchorPoint=one('#content-wrapper')||originalBanner||one('#content .homepage-group-title')||one('#content')||one('.content-wrapper');
  if(!anchorPoint)return;
  var root=document.createElement('div');
  root.id='ds-streetwear';
  root.innerHTML=hero()+
    (categories.length?'<section class="ds-sw-categories ds-sw-inner" aria-label="Nakupovať podľa kategórie">'+
      '<div class="ds-sw-categories__heading"><span class="ds-sw-eyebrow">NÁJDI SI TO SVOJE / 01</span><p>Jednoduché veci. Niekedy veľa hovoria.</p></div>'+
      '<div class="ds-sw-category-grid">'+categories.map(categoryCard).join('')+'</div></section>':'')+
    products()+editorial()+newsletter();
  anchorPoint.parentNode.insertBefore(root,anchorPoint);
  document.body.classList.add('ds-streetwear-ready');
  loadProducts().then(function(items){
    var list=one('#ds-sw-products-list',root);
    if(!list)return;
    if(items.length){
      list.innerHTML=items.map(renderProduct).join('');
      document.body.classList.add('ds-streetwear-products-ready');
    }else{
      var fallback=hrefNew||hrefAll||hrefTee;
      list.innerHTML=anchor('POZRIEŤ PRODUKTY ↗',fallback,'ds-sw-pill');
    }
  }).catch(function(){});
  if(!moveNewsletter()){
    var tries=0, timer=setInterval(function(){if(moveNewsletter()||++tries>16)clearInterval(timer)},400);
  }
  if(!categories.length)one('.ds-sw-categories',root)?.remove();
}
})();