/* DOTYK SLOV — New Arrivals Coverflow v3
   Shoptet-native. Pulls products from Novinky / NEW flags.
   Desktop = centered coverflow. Mobile = native swipe. */
(function(){
  'use strict';

  var ROOT_ID='ds-new-arrivals-gallery';
  var SOURCE_LABEL='Novinky';
  var MAX_ITEMS=10;
  var MIN_ITEMS=5;

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
    var parts=v.split(',').map(function(x){
      var bits=clean(x).split(/\s+/);
      return {url:bits[0]||'',score:parseFloat(bits[1])||0};
    }).filter(function(x){return validImage(x.url)});
    if(!parts.length)return'';
    parts.sort(function(a,b){return b.score-a.score});
    return validImage(parts[0].url);
  }
  function imageFromNode(img){
    if(!img)return'';
    var attrs=['data-src','data-lazy-src','data-original','data-lazy','src'];
    for(var i=0;i<attrs.length;i++){
      var v=validImage(img.getAttribute(attrs[i]));
      if(v)return v;
    }
    return bestFromSrcset(img.getAttribute('data-srcset'))||bestFromSrcset(img.getAttribute('srcset'))||'';
  }
  function firstText(root,selectors){
    for(var i=0;i<selectors.length;i++){
      var el=$(selectors[i],root);
      var text=clean(el&&el.textContent);
      if(text)return text;
    }
    return'';
  }
  function firstLink(root,selectors){
    for(var i=0;i<selectors.length;i++){
      var el=$(selectors[i],root);
      if(el&&el.href)return el;
    }
    return null;
  }
  function candidateProductNodes(doc){
    var selectors=['.products-block .product','.products .product','.product-item','[data-micro-product-id]'];
    var out=[];
    selectors.forEach(function(sel){
      $$(sel,doc).forEach(function(node){if(out.indexOf(node)<0)out.push(node)});
    });
    return out;
  }
  function productFromNode(node){
    if(!node)return null;
    var link=firstLink(node,['a.name[href]','.name a[href]','.p-name a[href]','.p-in-in a[href]','.product-name a[href]','h2 a[href]','h3 a[href]','a[data-micro="url"][href]']);
    if(!link){
      var links=$$('a[href]',node).filter(function(a){return a.querySelector('img')||clean(a.textContent)});
      link=links[0]||null;
    }
    if(!link||!link.href)return null;

    var name=firstText(node,['[data-micro="name"]','.name','.p-name','.p-in-in','.product-name','h2','h3'])||clean(link.getAttribute('title'))||clean(link.textContent);
    if(!name)return null;
    var price=firstText(node,['.price-final strong','.price-final','.p-final-price','[data-micro="price"]','.price']);
    var img=imageFromNode($('img',node));
    if(!img)return null;

    return {name:name,price:price||'',href:absUrl(link.href),image:img};
  }
  function uniqueProducts(nodes,onlyNew){
    var seen={};
    var out=[];
    nodes.forEach(function(node){
      if(onlyNew){
        var flag=$('.flag-new,.flag.flag-new,[class*="flag-new"],[class*="flag_new"]',node);
        var flagText=clean($$('.flag,.flags span,.p-label',node).map(function(el){return el.textContent}).join(' '));
        if(!flag&&!/novinka|nové|nove|new/i.test(flagText))return;
      }
      var p=productFromNode(node);
      if(!p||seen[p.href])return;
      seen[p.href]=1;
      out.push(p);
    });
    return out;
  }
  function allNavLinks(){return $$('#ds-site-header a[href],#navigation a[href],#ds-home-discovery a[href]')}
  function findSourceHref(){
    var wanted=norm(SOURCE_LABEL);
    var links=allNavLinks();
    var exact=links.find(function(a){return norm(a.textContent)===wanted||norm(a.getAttribute('aria-label'))===wanted});
    if(exact)return exact.href;
    var partial=links.find(function(a){
      var t=norm(a.textContent+' '+(a.getAttribute('aria-label')||''));
      return t.indexOf(wanted)>=0;
    });
    return partial?partial.href:'';
  }
  async function fetchDocument(url){
    if(!url)return null;
    try{
      var response=await fetch(url,{credentials:'same-origin',cache:'no-store'});
      if(!response.ok)return null;
      return new DOMParser().parseFromString(await response.text(),'text/html');
    }catch(_){return null}
  }
  async function loadProducts(){
    var products=uniqueProducts(candidateProductNodes(document),true);
    var sourceHref=findSourceHref();

    if(sourceHref){
      var sourceDoc=await fetchDocument(sourceHref);
      if(sourceDoc){
        var fromCategory=uniqueProducts(candidateProductNodes(sourceDoc),false);
        if(fromCategory.length)products=fromCategory;
      }
    }
    if(products.length<MIN_ITEMS){
      var fallbackDoc=await fetchDocument('/novinky/');
      if(fallbackDoc){
        var fallback=uniqueProducts(candidateProductNodes(fallbackDoc),false);
        if(fallback.length){sourceHref=sourceHref||absUrl('/novinky/');products=fallback}
      }
    }
    if(products.length<MIN_ITEMS){
      var allOnPage=uniqueProducts(candidateProductNodes(document),false);
      allOnPage.forEach(function(p){
        if(products.length>=MAX_ITEMS)return;
        if(!products.some(function(x){return x.href===p.href}))products.push(p);
      });
    }
    return {items:products.slice(0,MAX_ITEMS),href:sourceHref};
  }

  function sectionMarkup(sourceHref){
    return '<section id="'+ROOT_ID+'" aria-label="Novinky">'+
      '<div class="ds-circular-new__inner">'+
        '<div class="ds-circular-new__header">'+
          '<div>'+ 
            '<p class="ds-circular-new__kicker">NOVINKY / PRÁVE PRIBUDLO</p>'+ 
            '<h2 class="ds-circular-new__title">nové veci.<br>rovnaký chaos.</h2>'+ 
            '<p class="ds-circular-new__sub">To, čo pribudlo skôr, než si to stihol premyslieť.</p>'+ 
          '</div>'+ 
          (sourceHref?'<a class="ds-circular-new__all" href="'+esc(sourceHref)+'">Pozrieť všetky novinky <span>→</span></a>':'')+
        '</div>'+ 
        '<div class="ds-circular-new__stage" aria-label="Interaktívna galéria noviniek">'+
          '<div class="ds-circular-new__ring"></div>'+ 
        '</div>'+ 
        '<div class="ds-circular-new__footer">'+
          '<button class="ds-circular-new__control" type="button" data-ds-circular-prev aria-label="Predchádzajúci produkt">←</button>'+ 
          '<span class="ds-circular-new__hint">potiahni / swipe</span>'+ 
          '<button class="ds-circular-new__control" type="button" data-ds-circular-next aria-label="Ďalší produkt">→</button>'+ 
        '</div>'+ 
      '</div>'+ 
    '</section>';
  }

  function productMarkup(item,index){
    return '<a class="ds-circular-product" href="'+esc(item.href)+'" data-ds-arc-index="'+index+'" aria-label="'+esc(item.name)+'">'+
      '<span class="ds-circular-product__card">'+
        '<img class="ds-circular-product__image" src="'+esc(item.image)+'" alt="'+esc(item.name)+'" loading="lazy" decoding="async">'+
        '<span class="ds-circular-product__arrow">↗</span>'+ 
        '<span class="ds-circular-product__meta">'+
          '<span class="ds-circular-product__topline">'+
            '<span class="ds-circular-product__badge">NEW</span>'+ 
            (item.price?'<span class="ds-circular-product__price">'+esc(item.price)+'</span>':'')+
          '</span>'+ 
          '<strong class="ds-circular-product__name">'+esc(item.name)+'</strong>'+ 
        '</span>'+ 
      '</span>'+ 
    '</a>';
  }

  function ensureStyles(){
    var href='https://matuasiak.github.io/dotyk-slov-assets/css/new-arrivals-gallery.css?v=3';
    var existing=document.querySelector('link[data-ds-new-arrivals-css]');
    if(existing){if(existing.href!==href)existing.href=href;return}
    var link=document.createElement('link');
    link.rel='stylesheet';link.href=href;link.setAttribute('data-ds-new-arrivals-css','1');
    document.head.appendChild(link);
  }

  function initInteraction(section){
    var stage=$('.ds-circular-new__stage',section);
    var track=$('.ds-circular-new__ring',section);
    var cards=$$('.ds-circular-product',section);
    if(!stage||!track||!cards.length)return;

    var active=Math.min(1,cards.length-1);
    var drag=false;
    var dragMoved=false;
    var startX=0;
    var autoTimer=null;
    var autoDirection=1;
    var mobile=window.matchMedia('(max-width:767px)');
    var scrollTimer=null;

    function renderDesktop(){
      var card=cards[active];
      if(!card)return;

      var target=stage.clientWidth/2-(card.offsetLeft+card.offsetWidth/2);
      track.style.transform='translate3d('+Math.round(target)+'px,0,0)';

      cards.forEach(function(el,i){
        var rel=i-active;
        var abs=Math.abs(rel);
        var rotate=rel===0?0:(rel<0?7:-7);
        var y=abs*11;
        var scale=abs===0?1:Math.max(.82,1-abs*.075);
        var opacity=abs===0?1:(abs===1?.78:(abs===2?.42:.16));
        el.style.transform='translateY('+y+'px) rotateY('+rotate+'deg) scale('+scale+')';
        el.style.opacity=String(opacity);
        el.style.zIndex=String(20-abs);
        el.style.pointerEvents=abs<=2?'auto':'none';
        el.classList.toggle('is-active',abs===0);
      });
    }

    function clearDesktopStyles(){
      track.style.transform='none';
      cards.forEach(function(el){
        el.style.transform='';
        el.style.opacity='';
        el.style.zIndex='';
        el.style.pointerEvents='';
      });
    }

    function scrollMobile(behavior){
      var card=cards[active];
      if(!card)return;
      var left=card.offsetLeft-(stage.clientWidth-card.clientWidth)/2;
      stage.scrollTo({left:Math.max(0,left),behavior:behavior||'smooth'});
    }

    function render(behavior){
      if(mobile.matches){
        clearDesktopStyles();
        cards.forEach(function(el,i){el.classList.toggle('is-active',i===active)});
        if(behavior)scrollMobile(behavior);
      }else{
        stage.scrollLeft=0;
        renderDesktop();
      }
    }

    function go(delta,behavior){
      var next=Math.max(0,Math.min(cards.length-1,active+delta));
      if(next===active)return;
      active=next;
      render(behavior||'smooth');
      restartAuto();
    }

    function restartAuto(){
      if(autoTimer)clearInterval(autoTimer);
      if(mobile.matches||cards.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      autoTimer=setInterval(function(){
        if(active>=cards.length-1)autoDirection=-1;
        if(active<=0)autoDirection=1;
        active+=autoDirection;
        render();
      },3600);
    }

    var prev=$('[data-ds-circular-prev]',section);
    var next=$('[data-ds-circular-next]',section);
    if(prev)prev.addEventListener('click',function(){go(-1)});
    if(next)next.addEventListener('click',function(){go(1)});

    stage.addEventListener('pointerdown',function(e){
      if(mobile.matches)return;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      drag=true;dragMoved=false;startX=e.clientX;stage.classList.add('is-dragging');
      try{stage.setPointerCapture(e.pointerId)}catch(_){}
      if(autoTimer)clearInterval(autoTimer);
    });
    stage.addEventListener('pointermove',function(e){
      if(!drag||mobile.matches)return;
      if(Math.abs(e.clientX-startX)>7)dragMoved=true;
    });
    function endDrag(e){
      if(!drag)return;
      var dx=e.clientX-startX;
      drag=false;stage.classList.remove('is-dragging');
      try{stage.releasePointerCapture(e.pointerId)}catch(_){}
      if(Math.abs(dx)>45)go(dx<0?1:-1);
      else restartAuto();
      setTimeout(function(){dragMoved=false},100);
    }
    stage.addEventListener('pointerup',endDrag);
    stage.addEventListener('pointercancel',endDrag);
    stage.addEventListener('click',function(e){if(dragMoved){e.preventDefault();e.stopPropagation()}},true);

    stage.addEventListener('wheel',function(e){
      if(mobile.matches)return;
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>16){
        e.preventDefault();
        go(e.deltaX>0?1:-1);
      }
    },{passive:false});

    stage.addEventListener('scroll',function(){
      if(!mobile.matches)return;
      if(scrollTimer)clearTimeout(scrollTimer);
      scrollTimer=setTimeout(function(){
        var center=stage.scrollLeft+stage.clientWidth/2;
        var best=0,bestDistance=Infinity;
        cards.forEach(function(el,i){
          var c=el.offsetLeft+el.offsetWidth/2;
          var d=Math.abs(c-center);
          if(d<bestDistance){bestDistance=d;best=i}
        });
        active=best;
        cards.forEach(function(el,i){el.classList.toggle('is-active',i===active)});
      },90);
    },{passive:true});

    stage.addEventListener('mouseenter',function(){if(autoTimer)clearInterval(autoTimer)});
    stage.addEventListener('mouseleave',restartAuto);

    if(mobile.addEventListener)mobile.addEventListener('change',function(){render();restartAuto()});
    else if(mobile.addListener)mobile.addListener(function(){render();restartAuto()});
    window.addEventListener('resize',function(){render()},{passive:true});

    requestAnimationFrame(function(){render();restartAuto()});
  }

  async function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if(document.getElementById(ROOT_ID))return true;

    var anchor=document.getElementById('ds-home-discovery')||document.getElementById('ds-fashion-hero')||$('.banners-row');
    if(!anchor||!anchor.parentNode)return false;

    ensureStyles();
    var data=await loadProducts();
    if(document.getElementById(ROOT_ID))return true;

    var holder=document.createElement('div');
    holder.innerHTML=sectionMarkup(data.href);
    var section=holder.firstElementChild;
    anchor.insertAdjacentElement('afterend',section);

    var ring=$('.ds-circular-new__ring',section);
    if(!data.items.length){
      ring.innerHTML='<div class="ds-circular-new__empty">Novinky sa zatiaľ nepodarilo načítať.</div>';
      return true;
    }

    ring.innerHTML=data.items.map(productMarkup).join('');
    initInteraction(section);
    return true;
  }

  function boot(){
    var attempts=0;
    function tryBuild(){
      Promise.resolve(build()).then(function(done){
        if(done)return;
        attempts++;
        if(attempts<20)setTimeout(tryBuild,350);
      });
    }
    tryBuild();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();