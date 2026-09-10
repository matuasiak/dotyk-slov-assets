(function(){
  'use strict';

  var TILE_CONFIG=[
    {title:'tričká',match:['tričká','tricka']},
    {title:'mikiny',match:['mikiny','mikina']},
    {title:'podľa textu',match:['produkty podľa textu','podľa textu','podla textu']},
    {title:'doplnky',match:['doplnky','doplnok']}
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

  function getMenuLinks(){
    var out=[];
    $$('#ds-site-header .ds-site-nav-link,#ds-site-header .ds-site-submenu-grid a[href]').forEach(function(a){
      if(!a.href)return;
      var text=clean(a.textContent);
      if(!text)return;
      out.push({text:text,href:a.href,norm:norm(text)});
    });

    if(!out.length){
      $$('#navigation a[href]').forEach(function(a){
        var text=clean(a.textContent);
        if(text)out.push({text:text,href:a.href,norm:norm(text)});
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

  function findLink(config,links,used){
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
    return links.find(function(x){return !used[x.href]})||null;
  }

  async function fetchCategoryImage(href,index){
    if(!href)return'';
    try{
      var response=await fetch(href,{credentials:'same-origin',cache:'force-cache'});
      if(!response.ok)return'';
      var doc=new DOMParser().parseFromString(await response.text(),'text/html');
      var cards=$$('.products-block .product,.products .product,.product-item,[data-micro-product-id]',doc);
      var preferred=cards[index%Math.max(cards.length,1)]||cards[0];
      var img=preferred&&$('.image img,.product-image img,picture img,img',preferred);
      var src=imageFromNode(img);
      if(src)return src;

      var categoryImg=$('.category-header img,.category-perex img,.banner img',doc);
      return imageFromNode(categoryImg);
    }catch(_){return''}
  }

  function tileHtml(tile,index){
    return '<a class="ds-home-tile" href="'+esc(tile.href||'#')+'" data-ds-home-tile="'+index+'">'+
      '<span class="ds-home-tile__media"></span>'+ 
      '<span class="ds-home-tile__meta">0'+(index+1)+' / DISCOVER</span>'+ 
      '<span class="ds-home-tile__copy">'+
        '<span class="ds-home-tile__title">'+esc(tile.title)+'</span>'+ 
        '<span class="ds-home-tile__arrow">→</span>'+ 
      '</span>'+ 
    '</a>';
  }

  function markup(tiles){
    return ''+
      '<section id="ds-home-discovery" aria-label="Objaviť Dotyk Slov">'+
        '<div class="ds-home-intro">'+
          '<div>'+ 
            '<span class="ds-home-kicker">DOTYK SLOV / NIE VŠETKO TREBA POVEDAŤ NAHLAS</span>'+ 
            '<h2>veci, ktoré ostali v hlave.</h2>'+ 
          '</div>'+ 
          '<p>Vyber si, čo dnes povieš bez toho, aby si musel niečo vysvetľovať.</p>'+ 
        '</div>'+ 
        '<div class="ds-home-discovery-wrap">'+
          '<div class="ds-home-discovery-head">'+
            '<h3>vyber si náladu.</h3>'+ 
            '<span>01—04</span>'+ 
          '</div>'+ 
          '<div class="ds-home-discovery-grid">'+tiles.map(tileHtml).join('')+'</div>'+ 
        '</div>'+ 
        '<div class="ds-home-trust">'+
          '<div class="ds-home-trust__inner">'+
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">01</span><span class="ds-home-trust__title">slovenská značka</span><span class="ds-home-trust__copy">navrhnuté doma. nosené všade.</span></div>'+ 
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">02</span><span class="ds-home-trust__title">vlastné myšlienky</span><span class="ds-home-trust__copy">žiadne katalógové slogany.</span></div>'+ 
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">03</span><span class="ds-home-trust__title">tlačíme u nás</span><span class="ds-home-trust__copy">od nápadu po hotový kus.</span></div>'+ 
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">04</span><span class="ds-home-trust__title">doprava zdarma</span><span class="ds-home-trust__copy">keď košík trafí svoj limit.</span></div>'+ 
          '</div>'+ 
        '</div>'+ 
      '</section>';
  }

  async function hydrateImages(tiles,root){
    await Promise.all(tiles.map(async function(tile,index){
      var image=await fetchCategoryImage(tile.href,index);
      if(!image)return;
      var media=$('[data-ds-home-tile="'+index+'"] .ds-home-tile__media',root);
      if(!media)return;
      var img=document.createElement('img');
      img.src=image;
      img.alt='';
      img.loading=index<2?'eager':'lazy';
      img.decoding='async';
      media.appendChild(img);
    }));
  }

  function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if($('#ds-home-discovery'))return true;

    var hero=$('#ds-fashion-hero')||$('.banners-row');
    if(!hero||!hero.parentNode)return false;

    var links=getMenuLinks();
    if(!links.length)return false;

    var used={};
    var tiles=TILE_CONFIG.map(function(config){
      var link=findLink(config,links,used);
      if(link)used[link.href]=1;
      return {title:config.title,href:link?link.href:'#'};
    });

    var holder=document.createElement('div');
    holder.innerHTML=markup(tiles);
    var section=holder.firstElementChild;
    hero.insertAdjacentElement('afterend',section);
    hydrateImages(tiles,section);
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
