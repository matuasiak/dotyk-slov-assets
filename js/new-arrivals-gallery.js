/* DOTYK SLOV — Circular New Arrivals Gallery v1
   Shoptet-native implementation inspired by the React CircularGallery component.
   Pulls products from the Novinky category / NEW flags and renders a 3D rotating gallery. */
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
  function clamp(v,min,max){return Math.min(max,Math.max(min,v))}

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
    var selectors=[
      '.products-block .product',
      '.products .product',
      '.product-item',
      '[data-micro-product-id]'
    ];
    var out=[];
    selectors.forEach(function(sel){
      $$(sel,doc).forEach(function(node){
        if(out.indexOf(node)<0)out.push(node);
      });
    });
    return out;
  }

  function productFromNode(node){
    if(!node)return null;

    var link=firstLink(node,[
      'a.name[href]',
      '.name a[href]',
      '.p-name a[href]',
      '.p-in-in a[href]',
      '.product-name a[href]',
      'h2 a[href]',
      'h3 a[href]',
      'a[data-micro="url"][href]'
    ]);
    if(!link){
      var links=$$('a[href]',node).filter(function(a){return a.querySelector('img')||clean(a.textContent)});
      link=links[0]||null;
    }
    if(!link||!link.href)return null;

    var name=firstText(node,[
      '[data-micro="name"]',
      '.name',
      '.p-name',
      '.p-in-in',
      '.product-name',
      'h2',
      'h3'
    ])||clean(link.getAttribute('title'))||clean(link.textContent);
    if(!name)return null;

    var price=firstText(node,[
      '.price-final strong',
      '.price-final',
      '.p-final-price',
      '[data-micro="price"]',
      '.price'
    ]);

    var img=imageFromNode($('img',node));
    if(!img)return null;

    return {
      name:name,
      price:price||'',
      href:absUrl(link.href),
      image:img
    };
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

  function allNavLinks(){
    return $$('#ds-site-header a[href],#navigation a[href],#ds-home-discovery a[href]');
  }

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
        if(fallback.length){
          sourceHref=sourceHref||absUrl('/novinky/');
          products=fallback;
        }
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
          '<span class="ds-circular-new__hint">potiahni / scrolluj</span>'+ 
          '<button class="ds-circular-new__control" type="button" data-ds-circular-next aria-label="Ďalší produkt">→</button>'+ 
        '</div>'+ 
      '</div>'+ 
    '</section>';
  }

  function productMarkup(item,index,count){
    var angle=(360/count)*index;
    return '<a class="ds-circular-product" href="'+esc(item.href)+'" style="--ds-item-angle:'+angle+'deg" aria-label="'+esc(item.name)+'">'+
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
    var href='https://matuasiak.github.io/dotyk-slov-assets/css/new-arrivals-gallery.css?v=1';
    var existing=document.querySelector('link[data-ds-new-arrivals-css]');
    if(existing){if(existing.href!==href)existing.href=href;return}
    var link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.setAttribute('data-ds-new-arrivals-css','1');
    document.head.appendChild(link);
  }

  function initInteraction(section,items){
    var stage=$('.ds-circular-new__stage',section);
    var ring=$('.ds-circular-new__ring',section);
    var cards=$$('.ds-circular-product',section);
    if(!stage||!ring||!cards.length)return;

    var state={
      rotation:0,
      visible:true,
      interacting:false,
      drag:false,
      dragMoved:false,
      startX:0,
      startRotation:0,
      lastScrollY:window.scrollY,
      interactionTimer:null,
      raf:null
    };

    var anglePer=360/cards.length;

    function markInteraction(){
      state.interacting=true;
      if(state.interactionTimer)clearTimeout(state.interactionTimer);
      state.interactionTimer=setTimeout(function(){state.interacting=false},180);
    }

    function setRadius(){
      var width=stage.clientWidth||window.innerWidth;
      var radius;
      if(width<480)radius=Math.max(225,width*.66);
      else if(width<800)radius=Math.min(390,width*.54);
      else if(width<1200)radius=Math.min(490,width*.42);
      else radius=Math.min(620,width*.365);
      stage.style.setProperty('--ds-gallery-radius',Math.round(radius)+'px');
    }

    function updateDepth(){
      cards.forEach(function(card,i){
        var itemAngle=i*anglePer;
        var relative=(itemAngle+state.rotation)%360;
        if(relative<0)relative+=360;
        var normalized=Math.abs(relative>180?360-relative:relative);
        var opacity=Math.max(.14,1-(normalized/145));
        var scale=1-(Math.min(normalized,120)/120)*.11;
        card.style.opacity=String(opacity);
        card.style.zIndex=String(Math.round(100-normalized));
        card.style.pointerEvents=normalized<82?'auto':'none';
        var inner=$('.ds-circular-product__card',card);
        if(inner)inner.style.transform='scale('+scale.toFixed(3)+')';
      });
    }

    function render(){
      ring.style.transform='rotateY('+state.rotation+'deg)';
      updateDepth();
    }

    function animate(){
      if(state.visible&&!state.interacting&&!state.drag&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        state.rotation+=.018;
      }
      render();
      state.raf=requestAnimationFrame(animate);
    }

    stage.addEventListener('pointerdown',function(e){
      if(e.pointerType==='mouse'&&e.button!==0)return;
      state.drag=true;
      state.dragMoved=false;
      state.startX=e.clientX;
      state.startRotation=state.rotation;
      stage.classList.add('is-dragging');
      try{stage.setPointerCapture(e.pointerId)}catch(_){}
      markInteraction();
    });

    stage.addEventListener('pointermove',function(e){
      if(!state.drag)return;
      var dx=e.clientX-state.startX;
      if(Math.abs(dx)>5)state.dragMoved=true;
      state.rotation=state.startRotation+dx*.24;
      markInteraction();
    });

    function endDrag(e){
      if(!state.drag)return;
      state.drag=false;
      stage.classList.remove('is-dragging');
      try{stage.releasePointerCapture(e.pointerId)}catch(_){}
      markInteraction();
      setTimeout(function(){state.dragMoved=false},80);
    }
    stage.addEventListener('pointerup',endDrag);
    stage.addEventListener('pointercancel',endDrag);

    stage.addEventListener('wheel',function(e){
      state.rotation+=e.deltaY*.045+e.deltaX*.03;
      markInteraction();
    },{passive:true});

    stage.addEventListener('click',function(e){
      if(state.dragMoved){e.preventDefault();e.stopPropagation()}
    },true);

    var prev=$('[data-ds-circular-prev]',section);
    var next=$('[data-ds-circular-next]',section);
    if(prev)prev.addEventListener('click',function(){state.rotation+=anglePer;markInteraction()});
    if(next)next.addEventListener('click',function(){state.rotation-=anglePer;markInteraction()});

    window.addEventListener('scroll',function(){
      var now=window.scrollY;
      var delta=now-state.lastScrollY;
      state.lastScrollY=now;
      if(!state.visible||Math.abs(delta)>180)return;
      state.rotation+=delta*.035;
      markInteraction();
    },{passive:true});

    window.addEventListener('resize',setRadius,{passive:true});

    if('IntersectionObserver' in window){
      var observer=new IntersectionObserver(function(entries){
        state.visible=!!(entries[0]&&entries[0].isIntersecting);
      },{threshold:.08});
      observer.observe(section);
    }

    setRadius();
    render();
    animate();
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

    ring.innerHTML=data.items.map(function(item,index){return productMarkup(item,index,data.items.length)}).join('');
    initInteraction(section,data.items);
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
