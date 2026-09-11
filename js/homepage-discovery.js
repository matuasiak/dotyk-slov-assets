/* DOTYK SLOV — homepage discovery v12 / compact nav + editorial separator */
(function(){
  'use strict';

  var EDITORIAL_IMAGE='https://matuasiak.github.io/dotyk-slov-assets/images/story.jpg';

  var ROUTES=[
    {title:'Tričká',match:['tričká','tricka']},
    {title:'Mikiny',match:['mikiny','mikina']},
    {title:'Cropy',match:['cropy','crop']},
    {title:'Doplnky',match:['doplnky','doplnok']},
    {title:'Limitky',match:['limitky','limitované','limitovane']},
    {title:'Vlastný text',match:['vlastný text','vlastny text','produkty podľa textu','produkty podla textu','podľa textu','podla textu']}
  ];

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

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

  function routeMarkup(route,index){
    var num=String(index+1).padStart(2,'0');
    return '<a class="ds-quick-link" href="'+esc(route.href)+'" aria-label="'+esc(route.title)+'">'+
      '<span class="ds-quick-link__index">'+num+'</span>'+ 
      '<strong>'+esc(route.title)+'</strong>'+ 
      '<span class="ds-quick-link__arrow">→</span>'+ 
    '</a>';
  }

  function quickNavMarkup(routes){
    return '<div class="ds-home-quicknav">'+
      '<div class="ds-home-quicknav__head">'+
        '<span>RÝCHLY ROZCESTNÍK</span>'+ 
        '<strong>kam chceš ísť?</strong>'+ 
      '</div>'+ 
      '<nav class="ds-home-quicknav__grid" aria-label="Kategórie">'+routes.map(routeMarkup).join('')+'</nav>'+ 
    '</div>';
  }

  function editorialMarkup(){
    return '<section class="ds-home-editorial" aria-label="Dotyk Slov editorial">'+
      '<div class="ds-home-editorial__image">'+
        '<img src="'+EDITORIAL_IMAGE+'" alt="Dotyk Slov editorial" loading="lazy" decoding="async">'+
      '</div>'+ 
      '<div class="ds-home-editorial__copy">'+
        '<span class="ds-home-editorial__eyebrow">DOTYK / EDITORIAL 01</span>'+ 
        '<h2>veci, ktoré<br>nepovieš nahlas.</h2>'+ 
        '<p>Oblečenie pre všetko, čo ostalo v hlave.</p>'+ 
      '</div>'+ 
    '</section>';
  }

  function markup(routes){
    return '<section id="ds-home-discovery" aria-label="Rýchla navigácia">'+
      trustMarkup()+
      quickNavMarkup(routes)+
      editorialMarkup()+
    '</section>';
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
      routes.push({title:config.title,href:hit.href});
    });
    if(!routes.length)return false;

    var holder=document.createElement('div');
    holder.innerHTML=markup(routes);
    hero.insertAdjacentElement('afterend',holder.firstElementChild);
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
