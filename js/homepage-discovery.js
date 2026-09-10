(function(){
  'use strict';

  var ROUTES=[
    {title:'Tričká',match:['tričká','tricka'],imageA:'',imageB:''},
    {title:'Mikiny',match:['mikiny','mikina'],imageA:'',imageB:''},
    {title:'Cropy',match:['cropy','crop'],imageA:'',imageB:''},
    {title:'Doplnky',match:['doplnky','doplnok'],imageA:'',imageB:''},
    {title:'Novinky',match:['novinky','nové','nove'],imageA:'',imageB:''},
    {title:'Limitky',match:['limitky','limitované','limitovane'],imageA:'',imageB:''},
    {title:'Vlastný text',match:['vlastný text','vlastny text','produkty podľa textu','produkty podla textu','podľa textu','podla textu'],imageA:'',imageB:''}
  ];

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

  function allMenuLinks(){
    var out=[];
    $$('#ds-site-header .ds-site-nav-link,#ds-site-header .ds-site-submenu-grid a[href]').forEach(function(a){
      var text=clean(a.textContent);
      if(a.href&&text)out.push({text:text,href:a.href,norm:norm(text)});
    });
    if(!out.length){
      $$('#navigation a[href]').forEach(function(a){
        var text=clean(a.textContent);
        if(a.href&&text)out.push({text:text,href:a.href,norm:norm(text)});
      });
    }
    var seen={};
    return out.filter(function(x){
      var key=x.href+'|'+x.norm;
      if(seen[key])return false;
      seen[key]=1;
      return true;
    });
  }

  function findRoute(config,links,used){
    for(var i=0;i<config.match.length;i++){
      var wanted=norm(config.match[i]);
      var exact=links.find(function(x){return !used[x.href]&&x.norm===wanted});
      if(exact)return exact;
    }
    for(var j=0;j<config.match.length;j++){
      var partial=norm(config.match[j]);
      var hit=links.find(function(x){return !used[x.href]&&x.norm.indexOf(partial)>=0});
      if(hit)return hit;
    }
    return null;
  }

  function getShoptetValue(key){
    try{if(typeof window.getShoptetDataLayer==='function')return window.getShoptetDataLayer(key)}catch(_){}
    try{
      var layers=window.dataLayer||[];
      for(var i=layers.length-1;i>=0;i--){
        if(layers[i]&&layers[i].shoptet&&Object.prototype.hasOwnProperty.call(layers[i].shoptet,key))return layers[i].shoptet[key];
      }
    }catch(_){}
    return null;
  }

  function freeShippingCopy(){
    var info=getShoptetValue('cartInfo');
    var left=info&&info.leftToFreeShipping;
    var formatted=clean(left&&left.formattedPrice);
    if(info&&info.freeShipping)return 'dopravu máš zdarma';
    if(formatted)return 'doprava zdarma od '+formatted.replace(/^[-–—]\s*/, '');
    return 'doprava zdarma';
  }

  function trustMarkup(){
    return '<div class="ds-home-trust" aria-label="Prečo Dotyk Slov">'+
      '<div class="ds-home-trust__inner">'+
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">01</span><span><strong>slovenská značka</strong><small>navrhnuté doma.</small></span></div>'+ 
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">02</span><span><strong>tlačíme u nás</strong><small>od nápadu po kus.</small></span></div>'+ 
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">03</span><span><strong>vlastné myšlienky</strong><small>nie katalógové slogany.</small></span></div>'+ 
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">04</span><span><strong>'+esc(freeShippingCopy())+'</strong><small>keď košík trafí limit.</small></span></div>'+ 
      '</div>'+ 
    '</div>';
  }

  async function fetchCategoryImages(href){
    if(!href)return[];
    try{
      var response=await fetch(href,{credentials:'same-origin',cache:'force-cache'});
      if(!response.ok)return[];
      var doc=new DOMParser().parseFromString(await response.text(),'text/html');
      var candidates=[];
      $$('.category-header img,.category-perex img,.banner img,.products-block .product img,.products .product img,.product-item img,[data-micro-product-id] img',doc).forEach(function(img){
        var src=imageFromNode(img);
        if(src&&candidates.indexOf(src)<0)candidates.push(src);
      });
      return candidates.slice(0,2);
    }catch(_){return[]}
  }

  function cardMarkup(route,index){
    return '<a class="ds-visual-card" href="'+esc(route.href)+'" data-ds-visual="'+index+'" aria-label="'+esc(route.title)+'">'+
      '<span class="ds-visual-card__media">'+
        '<span class="ds-visual-card__image ds-visual-card__image--a"></span>'+ 
        '<span class="ds-visual-card__image ds-visual-card__image--b"></span>'+ 
      '</span>'+ 
      '<span class="ds-visual-card__shade"></span>'+ 
      '<span class="ds-visual-card__label"><strong>'+esc(route.title)+'</strong><span class="ds-visual-card__arrow">→</span></span>'+ 
    '</a>';
  }

  function markup(routes){
    return '<section id="ds-home-discovery" aria-label="Rýchla navigácia">'+
      trustMarkup()+
      '<div class="ds-home-visualnav">'+
        '<div class="ds-home-visualnav__track" role="navigation" aria-label="Kategórie">'+routes.map(cardMarkup).join('')+'</div>'+ 
      '</div>'+ 
    '</section>';
  }

  function addImage(target,src,alt){
    if(!target||!src)return;
    var img=document.createElement('img');
    img.src=src;
    img.alt=alt||'';
    img.loading='lazy';
    img.decoding='async';
    target.appendChild(img);
  }

  async function hydrate(route,index,root){
    var card=$('[data-ds-visual="'+index+'"]',root);
    if(!card)return;
    var slotA=$('.ds-visual-card__image--a',card);
    var slotB=$('.ds-visual-card__image--b',card);
    var a=validImage(route.imageA),b=validImage(route.imageB);
    if(!a||!b){
      var fetched=await fetchCategoryImages(route.href);
      if(!a)a=fetched[0]||'';
      if(!b)b=fetched[1]||fetched[0]||'';
    }
    addImage(slotA,a,route.title);
    addImage(slotB,b,route.title);
    if(b&&b!==a)card.classList.add('has-hover-image');
  }

  function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if($('#ds-home-discovery'))return true;

    var hero=$('#ds-fashion-hero')||$('.banners-row');
    if(!hero||!hero.parentNode)return false;

    var links=allMenuLinks();
    if(!links.length)return false;
    var used={};
    var routes=[];

    ROUTES.forEach(function(config){
      var hit=findRoute(config,links,used);
      if(!hit)return;
      used[hit.href]=1;
      routes.push({title:config.title,href:hit.href,imageA:config.imageA,imageB:config.imageB});
    });

    if(!routes.length)return false;

    var holder=document.createElement('div');
    holder.innerHTML=markup(routes);
    var section=holder.firstElementChild;
    hero.insertAdjacentElement('afterend',section);
    routes.forEach(function(route,index){hydrate(route,index,section)});
    return true;
  }

  function boot(){
    if(build())return;
    var observer=new MutationObserver(function(){if(build())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect()},10000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
