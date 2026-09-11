/* DOTYK SLOV — homepage tail v1
   Bestsellery + brand story + community + newsletter + footer enhancement. */
(function(){
  'use strict';

  var ROOT_ID='ds-home-tail';
  var ASSET='https://matuasiak.github.io/dotyk-slov-assets/images/';
  var IG='https://www.instagram.com/dotykslov/';
  var MAX_BEST=4;

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function abs(v){if(!v)return'';try{return new URL(v,location.origin).href}catch(_){return v}}

  function ensureStyles(){
    var href='https://matuasiak.github.io/dotyk-slov-assets/css/homepage-tail.css?v=1';
    var old=document.querySelector('link[data-ds-home-tail-css]');
    if(old){old.href=href;return}
    var link=document.createElement('link');
    link.rel='stylesheet';link.href=href;link.setAttribute('data-ds-home-tail-css','1');
    document.head.appendChild(link);
  }

  function validImage(v){
    if(!v)return'';
    v=clean(v);
    if(!v||/^data:/i.test(v)||/^blob:/i.test(v)||/placeholder|spacer|transparent/i.test(v))return'';
    return abs(v);
  }

  function imageFrom(img){
    if(!img)return'';
    var attrs=['data-src','data-lazy-src','data-original','data-lazy','src'];
    for(var i=0;i<attrs.length;i++){
      var v=validImage(img.getAttribute(attrs[i]));
      if(v)return v;
    }
    var set=img.getAttribute('data-srcset')||img.getAttribute('srcset')||'';
    if(set){
      var parts=set.split(',').map(function(x){return clean(x).split(/\s+/)[0]}).filter(Boolean);
      if(parts.length)return validImage(parts[parts.length-1]);
    }
    return'';
  }

  function firstText(root,sels){
    for(var i=0;i<sels.length;i++){
      var el=$(sels[i],root),t=clean(el&&el.textContent);
      if(t)return t;
    }
    return'';
  }

  function firstLink(root,sels){
    for(var i=0;i<sels.length;i++){
      var el=$(sels[i],root);
      if(el&&el.href)return el;
    }
    return null;
  }

  function productNodes(doc){
    var out=[];
    ['.products-block .product','.products .product','.product-item','[data-micro-product-id]'].forEach(function(sel){
      $$(sel,doc).forEach(function(el){if(out.indexOf(el)<0)out.push(el)});
    });
    return out;
  }

  function productFromNode(node){
    var link=firstLink(node,['a.name[href]','.name a[href]','.p-name a[href]','.p-in-in a[href]','.product-name a[href]','h2 a[href]','h3 a[href]']);
    if(!link)link=$('a[href]',node);
    if(!link)return null;
    var name=firstText(node,['[data-micro="name"]','.name','.p-name','.p-in-in','.product-name','h2','h3'])||clean(link.getAttribute('title'))||clean(link.textContent);
    var price=firstText(node,['.price-final strong','.price-final','.p-final-price','[data-micro="price"]','.price']);
    var img=imageFrom($('img',node));
    if(!name||!img)return null;
    return {name:name,price:price,href:abs(link.href),image:img};
  }

  function uniqueProducts(nodes){
    var seen={},out=[];
    nodes.forEach(function(node){
      if(node.closest&&node.closest('#ds-new-arrivals-gallery,#ds-home-tail'))return;
      var p=productFromNode(node);
      if(!p||seen[p.href])return;
      seen[p.href]=1;out.push(p);
    });
    return out;
  }

  function allNavLinks(){
    return $$('#ds-site-header a[href],#navigation a[href],#ds-home-discovery a[href]');
  }

  function bestsellerHref(){
    var wanted=['bestsellery','best seller','najpredavanejsie','najpredávanejšie','top produkty'];
    var links=allNavLinks();
    for(var i=0;i<links.length;i++){
      var t=norm(links[i].textContent+' '+(links[i].getAttribute('aria-label')||''));
      if(wanted.some(function(w){return t===norm(w)||t.indexOf(norm(w))>=0}))return links[i].href;
    }
    return'';
  }

  async function fetchDoc(url){
    if(!url)return null;
    try{
      var r=await fetch(url,{credentials:'same-origin',cache:'no-store'});
      if(!r.ok)return null;
      return new DOMParser().parseFromString(await r.text(),'text/html');
    }catch(_){return null}
  }

  async function loadBestsellers(){
    var href=bestsellerHref();
    var items=[];
    if(href){
      var doc=await fetchDoc(href);
      if(doc)items=uniqueProducts(productNodes(doc));
    }
    if(items.length<MAX_BEST){
      var fallback=await fetchDoc('/bestsellery/');
      if(fallback){
        var fromFallback=uniqueProducts(productNodes(fallback));
        if(fromFallback.length){items=fromFallback;href=href||abs('/bestsellery/')}
      }
    }
    if(items.length<MAX_BEST){
      var page=uniqueProducts(productNodes(document));
      page.forEach(function(p){if(items.length<MAX_BEST&&!items.some(function(x){return x.href===p.href}))items.push(p)});
    }
    return {items:items.slice(0,MAX_BEST),href:href};
  }

  function productCard(p,i){
    return '<a class="ds-best-card" href="'+esc(p.href)+'" aria-label="'+esc(p.name)+'">'+
      '<span class="ds-best-card__media"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy" decoding="async"></span>'+ 
      '<span class="ds-best-card__meta">'+
        '<span class="ds-best-card__code">DS / 0'+(i+1)+'</span>'+ 
        '<strong>'+esc(p.name)+'</strong>'+ 
        (p.price?'<span class="ds-best-card__price">'+esc(p.price)+'</span>':'')+
      '</span>'+ 
    '</a>';
  }

  function bestMarkup(data){
    return '<section class="ds-best" aria-label="Bestsellery">'+
      '<div class="ds-tail-wrap">'+
        '<div class="ds-tail-head">'+
          '<div><span>BESTSELLERY / MOST WORN</span><h2>veci, ku ktorým<br>sa ľudia vracajú.</h2></div>'+ 
          (data.href?'<a href="'+esc(data.href)+'">Pozrieť bestsellery →</a>':'')+
        '</div>'+ 
        '<div class="ds-best-grid">'+data.items.map(productCard).join('')+'</div>'+ 
      '</div>'+ 
    '</section>';
  }

  function storyMarkup(){
    return '<section class="ds-brand-story" aria-label="O značke Dotyk Slov">'+
      '<div class="ds-brand-story__copy">'+
        '<span>DOTYK SLOV / OD 2024</span>'+ 
        '<h2>nie všetko treba<br>povedať nahlas.</h2>'+ 
        '<p>Niektoré veci sa ľahšie nosia, než vysvetľujú. Dotyk Slov vznikol pre myšlienky, ktoré ostali v hlave, pre iróniu, ktorú pochopí ten správny človek, a pre dni, keď oblečenie povie presne dosť.</p>'+ 
        '<a href="/o-nas/">viac o nás →</a>'+ 
      '</div>'+ 
      '<div class="ds-brand-story__media ds-brand-story__media--main"><img src="'+ASSET+'story.jpg" alt="Dotyk Slov" loading="lazy" decoding="async"></div>'+ 
      '<div class="ds-brand-story__media ds-brand-story__media--small"><img src="'+ASSET+'promo2.jpg" alt="Dotyk Slov detail" loading="lazy" decoding="async"></div>'+ 
    '</section>';
  }

  function communityMarkup(){
    var pics=['p1.jpg','p2.jpg','p3.jpg','p4.jpg'];
    return '<section class="ds-community" aria-label="Dotyk Slov community">'+
      '<div class="ds-tail-wrap">'+
        '<div class="ds-community__head"><span>COMMUNITY / @DOTYKSLOV</span><h2>ak toto chápeš,<br>patríš sem.</h2><a href="'+IG+'" target="_blank" rel="noopener">Instagram →</a></div>'+ 
        '<div class="ds-community__grid">'+pics.map(function(x,i){return '<a href="'+IG+'" target="_blank" rel="noopener" class="ds-community__tile ds-community__tile--'+(i+1)+'"><img src="'+ASSET+x+'" alt="Dotyk Slov community" loading="lazy" decoding="async"><span>@dotykslov</span></a>'}).join('')+'</div>'+ 
      '</div>'+ 
    '</section>';
  }

  function newsletterMarkup(){
    return '<section class="ds-newsletter" aria-label="Newsletter">'+
      '<div class="ds-tail-wrap ds-newsletter__inner">'+
        '<div><span>INBOX / OBČAS</span><h2>žiadny spam.<br>len keď máme čo povedať.</h2><p>Nový drop, limitka alebo myšlienka, ktorá nechcela zostať len v hlave.</p></div>'+ 
        '<div class="ds-newsletter__form" data-ds-newsletter-slot><p class="ds-newsletter__fallback">Newsletter sa načítava…</p></div>'+ 
      '</div>'+ 
    '</section>';
  }

  function markup(data){
    return '<div id="'+ROOT_ID+'">'+bestMarkup(data)+storyMarkup()+communityMarkup()+newsletterMarkup()+'</div>';
  }

  function moveNewsletter(){
    var slot=$('[data-ds-newsletter-slot]');
    if(!slot)return false;
    var form=$('#footer .newsletter form,#footer form[action*="newsletter"],#footer form[action*="subscribe"],.newsletter form');
    if(!form||form.closest('#'+ROOT_ID))return false;
    var wrap=form.closest('.newsletter')||form.parentElement;
    slot.innerHTML='';
    slot.appendChild(form);
    if(wrap&&wrap!==form&&wrap.closest('#footer'))wrap.setAttribute('data-ds-newsletter-moved','1');
    return true;
  }

  function enhanceFooter(){
    var footer=$('#footer');
    if(!footer)return false;
    footer.classList.add('ds-footer-redesign');
    if(!$('.ds-footer-masthead',footer)){
      var top=document.createElement('div');
      top.className='ds-footer-masthead';
      top.innerHTML='<div class="ds-footer-masthead__inner"><div><span>DOTYK SLOV</span><strong>nie všetko treba povedať nahlas.</strong></div><a href="'+IG+'" target="_blank" rel="noopener">@dotykslov ↗</a></div>';
      footer.insertBefore(top,footer.firstChild);
    }
    return true;
  }

  function hideNativeBest(){
    var headings=$$('.homepage-group-title,h2,h3,h4').filter(function(h){
      if(h.closest('#'+ROOT_ID))return false;
      var t=norm(h.textContent);
      return t==='bestsellery'||t==='najpredavanejsie'||t==='najpredávanejšie';
    });
    headings.forEach(function(h){
      var p=h.parentElement,depth=0;
      while(p&&p!==document.body&&depth<4){
        if(p.querySelector('.products-block .product,.products .product,.product-item')){
          p.style.setProperty('display','none','important');
          p.setAttribute('data-ds-native-best-hidden','1');
          break;
        }
        p=p.parentElement;depth++;
      }
    });
  }

  async function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if($('#'+ROOT_ID)){enhanceFooter();moveNewsletter();return true}
    var anchor=$('#ds-new-arrivals-gallery');
    if(!anchor||!anchor.parentNode)return false;
    ensureStyles();
    var data=await loadBestsellers();
    if($('#'+ROOT_ID))return true;
    var holder=document.createElement('div');
    holder.innerHTML=markup(data);
    anchor.insertAdjacentElement('afterend',holder.firstElementChild);
    hideNativeBest();
    enhanceFooter();
    moveNewsletter();
    return true;
  }

  function boot(){
    var tries=0;
    function run(){
      Promise.resolve(build()).then(function(done){
        enhanceFooter();moveNewsletter();hideNativeBest();
        if(done)return;
        tries++;if(tries<24)setTimeout(run,350);
      });
    }
    run();
    var obs=new MutationObserver(function(){enhanceFooter();moveNewsletter();hideNativeBest()});
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){obs.disconnect()},12000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
