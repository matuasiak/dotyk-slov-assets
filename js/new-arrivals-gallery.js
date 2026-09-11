/* DOTYK SLOV — New Arrivals rail v8
   Shoptet-native. Pulls products from Novinky / NEW flags.
   Flat editorial product rail inspired by workwear/fashion ecommerce restraint. */
(function(){
  'use strict';

  var ROOT_ID='ds-new-arrivals-gallery';
  var SOURCE_LABEL='Novinky';
  var MAX_ITEMS=10;
  var MIN_ITEMS=4;

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function absUrl(v){if(!v)return'';try{return new URL(v,location.origin).href}catch(_){return v}}

  function validImage(v){
    if(!v)return'';
    v=clean(v);
    if(!v||/^data:/i.test(v)||/^blob:/i.test(v)||/transparent|placeholder|spacer/i.test(v))return'';
    return absUrl(v);
  }
  function bestFromSrcset(v){
    if(!v)return'';
    var parts=v.split(',').map(function(x){var bits=clean(x).split(/\s+/);return{url:bits[0]||'',score:parseFloat(bits[1])||0}}).filter(function(x){return validImage(x.url)});
    if(!parts.length)return'';
    parts.sort(function(a,b){return b.score-a.score});
    return validImage(parts[0].url);
  }
  function imageFromNode(img){
    if(!img)return'';
    var attrs=['data-src','data-lazy-src','data-original','data-lazy','src'];
    for(var i=0;i<attrs.length;i++){var v=validImage(img.getAttribute(attrs[i]));if(v)return v}
    return bestFromSrcset(img.getAttribute('data-srcset'))||bestFromSrcset(img.getAttribute('srcset'))||'';
  }
  function firstText(root,selectors){
    for(var i=0;i<selectors.length;i++){var el=$(selectors[i],root);var text=clean(el&&el.textContent);if(text)return text}
    return'';
  }
  function firstLink(root,selectors){
    for(var i=0;i<selectors.length;i++){var el=$(selectors[i],root);if(el&&el.href)return el}
    return null;
  }
  function candidateProductNodes(doc){
    var out=[];
    ['.products-block .product','.products .product','.product-item','[data-micro-product-id]'].forEach(function(sel){$$(sel,doc).forEach(function(node){if(out.indexOf(node)<0)out.push(node)})});
    return out;
  }
  function productFromNode(node){
    if(!node)return null;
    var link=firstLink(node,['a.name[href]','.name a[href]','.p-name a[href]','.p-in-in a[href]','.product-name a[href]','h2 a[href]','h3 a[href]','a[data-micro="url"][href]']);
    if(!link)link=$$('a[href]',node).find(function(a){return a.querySelector('img')||clean(a.textContent)})||null;
    if(!link||!link.href)return null;
    var name=firstText(node,['[data-micro="name"]','.name','.p-name','.p-in-in','.product-name','h2','h3'])||clean(link.getAttribute('title'))||clean(link.textContent);
    var price=firstText(node,['.price-final strong','.price-final','.p-final-price','[data-micro="price"]','.price']);
    var img=imageFromNode($('img',node));
    if(!name||!img)return null;
    return{name:name,price:price||'',href:absUrl(link.href),image:img};
  }
  function uniqueProducts(nodes,onlyNew){
    var seen={},out=[];
    nodes.forEach(function(node){
      if(onlyNew){
        var flag=$('.flag-new,.flag.flag-new,[class*="flag-new"],[class*="flag_new"]',node);
        var flagText=clean($$('.flag,.flags span,.p-label',node).map(function(el){return el.textContent}).join(' '));
        if(!flag&&!/novinka|nové|nove|new/i.test(flagText))return;
      }
      var p=productFromNode(node);
      if(!p||seen[p.href])return;
      seen[p.href]=1;out.push(p);
    });
    return out;
  }
  function allNavLinks(){return $$('#ds-site-header a[href],#navigation a[href],#ds-home-discovery a[href]')}
  function findSourceHref(){
    var wanted=norm(SOURCE_LABEL),links=allNavLinks();
    var exact=links.find(function(a){return norm(a.textContent)===wanted||norm(a.getAttribute('aria-label'))===wanted});
    if(exact)return exact.href;
    var partial=links.find(function(a){return norm(a.textContent+' '+(a.getAttribute('aria-label')||'')).indexOf(wanted)>=0});
    return partial?partial.href:'';
  }
  async function fetchDocument(url){
    if(!url)return null;
    try{var response=await fetch(url,{credentials:'same-origin',cache:'no-store'});if(!response.ok)return null;return new DOMParser().parseFromString(await response.text(),'text/html')}catch(_){return null}
  }
  async function loadProducts(){
    var products=uniqueProducts(candidateProductNodes(document),true);
    var sourceHref=findSourceHref();
    if(sourceHref){
      var sourceDoc=await fetchDocument(sourceHref);
      if(sourceDoc){var fromCategory=uniqueProducts(candidateProductNodes(sourceDoc),false);if(fromCategory.length)products=fromCategory}
    }
    if(products.length<MIN_ITEMS){
      var fallbackDoc=await fetchDocument('/novinky/');
      if(fallbackDoc){var fallback=uniqueProducts(candidateProductNodes(fallbackDoc),false);if(fallback.length){sourceHref=sourceHref||absUrl('/novinky/');products=fallback}}
    }
    if(products.length<MIN_ITEMS){
      uniqueProducts(candidateProductNodes(document),false).forEach(function(p){if(products.length<MAX_ITEMS&&!products.some(function(x){return x.href===p.href}))products.push(p)});
    }
    return{items:products.slice(0,MAX_ITEMS),href:sourceHref};
  }

  function productMarkup(item,index){
    return '<a class="ds-circular-product" href="'+esc(item.href)+'" aria-label="'+esc(item.name)+'">'+
      '<span class="ds-circular-product__media"><img class="ds-circular-product__image" src="'+esc(item.image)+'" alt="'+esc(item.name)+'" loading="lazy" decoding="async"><span class="ds-circular-product__badge">NEW</span></span>'+ 
      '<span class="ds-circular-product__meta"><strong class="ds-circular-product__name">'+esc(item.name)+'</strong>'+(item.price?'<span class="ds-circular-product__price">'+esc(item.price)+'</span>':'')+'</span>'+ 
    '</a>';
  }

  function sectionMarkup(sourceHref){
    return '<section id="'+ROOT_ID+'" aria-label="Novinky">'+
      '<div class="ds-circular-new__inner">'+
        '<div class="ds-circular-new__header">'+
          '<div><p class="ds-circular-new__kicker">NOVINKY</p><h2 class="ds-circular-new__title">nové veci.</h2></div>'+ 
          '<div class="ds-circular-new__actions">'+
            (sourceHref?'<a class="ds-circular-new__all" href="'+esc(sourceHref)+'">Pozrieť všetky →</a>':'')+
            '<button class="ds-circular-new__control" type="button" data-ds-circular-prev aria-label="Predchádzajúce produkty">←</button>'+ 
            '<button class="ds-circular-new__control" type="button" data-ds-circular-next aria-label="Ďalšie produkty">→</button>'+ 
          '</div>'+ 
        '</div>'+ 
        '<div class="ds-circular-new__stage" tabindex="0" aria-label="Novinky — horizontálny zoznam"><div class="ds-circular-new__ring"></div></div>'+ 
      '</div>'+ 
    '</section>';
  }

  function ensureStyles(){
    var href='https://matuasiak.github.io/dotyk-slov-assets/css/new-arrivals-gallery.css?v=8';
    var existing=document.querySelector('link[data-ds-new-arrivals-css]');
    if(existing){existing.href=href;return}
    var link=document.createElement('link');link.rel='stylesheet';link.href=href;link.setAttribute('data-ds-new-arrivals-css','1');document.head.appendChild(link);
  }

  function initInteraction(section){
    var stage=$('.ds-circular-new__stage',section);
    var cards=$$('.ds-circular-product',section);
    if(!stage||!cards.length)return;

    function step(){
      var card=cards[0];
      if(!card)return Math.round(stage.clientWidth*.75);
      var gap=parseFloat(getComputedStyle($('.ds-circular-new__ring',section)).gap)||12;
      return card.getBoundingClientRect().width+gap;
    }
    function go(dir){
      var max=Math.max(0,stage.scrollWidth-stage.clientWidth);
      if(dir>0&&stage.scrollLeft>=max-8)stage.scrollTo({left:0,behavior:'smooth'});
      else if(dir<0&&stage.scrollLeft<=8)stage.scrollTo({left:max,behavior:'smooth'});
      else stage.scrollBy({left:dir*step(),behavior:'smooth'});
    }
    var prev=$('[data-ds-circular-prev]',section),next=$('[data-ds-circular-next]',section);
    if(prev)prev.addEventListener('click',function(){go(-1)});
    if(next)next.addEventListener('click',function(){go(1)});
    stage.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}if(e.key==='ArrowRight'){e.preventDefault();go(1)}});

    var dragging=false,startX=0,startScroll=0,moved=false;
    stage.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;dragging=true;moved=false;startX=e.clientX;startScroll=stage.scrollLeft;stage.classList.add('is-dragging');try{stage.setPointerCapture(e.pointerId)}catch(_){} });
    stage.addEventListener('pointermove',function(e){if(!dragging||e.pointerType!=='mouse')return;var dx=e.clientX-startX;if(Math.abs(dx)>4)moved=true;stage.scrollLeft=startScroll-dx});
    function end(e){if(!dragging)return;dragging=false;stage.classList.remove('is-dragging');try{stage.releasePointerCapture(e.pointerId)}catch(_){}setTimeout(function(){moved=false},80)}
    stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
    stage.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation()}},true);
  }

  async function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if($('#'+ROOT_ID))return true;
    var anchor=$('#ds-home-discovery')||$('#ds-fashion-hero')||$('.banners-row');
    if(!anchor||!anchor.parentNode)return false;
    ensureStyles();
    var data=await loadProducts();
    if(!data.items.length)return true;
    if($('#'+ROOT_ID))return true;
    var holder=document.createElement('div');holder.innerHTML=sectionMarkup(data.href);var section=holder.firstElementChild;
    section.querySelector('.ds-circular-new__ring').innerHTML=data.items.map(productMarkup).join('');
    anchor.insertAdjacentElement('afterend',section);
    initInteraction(section);
    return true;
  }

  function boot(){
    var tries=0;
    (function run(){Promise.resolve(build()).then(function(done){if(done)return;if(++tries<24)setTimeout(run,350)})})();
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
