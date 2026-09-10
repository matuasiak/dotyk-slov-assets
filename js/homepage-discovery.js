(function(){
  'use strict';

  var ROUTES=[
    {title:'Tričká',match:['tričká','tricka'],meta:'najčastejšia voľba',featured:true},
    {title:'Cropy',match:['cropy','crop'],meta:'kratší strih'},
    {title:'Mikiny',match:['mikiny','mikina'],meta:'keď je trochu zima'},
    {title:'Doplnky',match:['doplnky','doplnok'],meta:'malé veci. veľa povedia.'},
    {title:'Novinky',match:['novinky','nové','nove'],meta:'čerstvo vonku'},
    {title:'Limitky',match:['limitky','limitované','limitovane'],meta:'kým sú'}
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
    try{
      if(typeof window.getShoptetDataLayer==='function')return window.getShoptetDataLayer(key);
    }catch(_){}
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
    var priceLeft=left&&typeof left.priceLeft==='number'?left.priceLeft:null;
    var formatted=clean(left&&left.formattedPrice);
    if(priceLeft!==null&&priceLeft>0&&formatted)return 'doprava zdarma od '+formatted.replace(/^[-–—]\s*/, '');
    if(info&&info.freeShipping)return 'dopravu máš zdarma';
    return 'doprava zdarma';
  }

  function trustMarkup(){
    return '<div class="ds-home-trust" aria-label="Prečo Dotyk Slov">'+
      '<div class="ds-home-trust__inner">'+
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">01</span><span><strong>slovenská značka</strong><small>navrhnuté doma.</small></span></div>'+ 
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">02</span><span><strong>tlačíme u nás</strong><small>od nápadu po kus.</small></span></div>'+ 
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">03</span><span><strong>vlastné myšlienky</strong><small>nie katalógové slogany.</small></span></div>'+ 
        '<div class="ds-home-trust__item"><span class="ds-home-trust__index">04</span><span><strong data-ds-free-shipping>'+esc(freeShippingCopy())+'</strong><small>keď košík trafí limit.</small></span></div>'+ 
      '</div>'+ 
    '</div>';
  }

  function cardMarkup(route,index){
    return '<a class="ds-hub-card'+(route.featured?' ds-hub-card--featured':'')+'" href="'+esc(route.href)+'">'+
      '<span class="ds-hub-card__top"><span>0'+(index+1)+'</span><span>'+esc(route.meta)+'</span></span>'+ 
      '<span class="ds-hub-card__bottom"><strong>'+esc(route.title)+'</strong><b>→</b></span>'+ 
    '</a>';
  }

  function markup(routes){
    return '<section id="ds-home-discovery" aria-label="Rýchla navigácia">'+
      trustMarkup()+
      '<div class="ds-home-hub">'+
        '<div class="ds-home-hub__head">'+
          '<div><span class="ds-home-kicker">NÁJDI SI SVOJE</span><h2>kam ďalej?</h2></div>'+ 
          '<p>Bez zbytočného hľadania. Vyber si, čo chceš nosiť.</p>'+ 
        '</div>'+ 
        '<div class="ds-home-hub__grid">'+routes.map(cardMarkup).join('')+'</div>'+ 
      '</div>'+ 
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
      routes.push({title:config.title,href:hit.href,meta:config.meta,featured:!!config.featured});
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
