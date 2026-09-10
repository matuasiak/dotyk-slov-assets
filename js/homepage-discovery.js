(function(){
  'use strict';

  var CATEGORY_CONFIG=[
    {title:'Tričká',match:['tričká','tricka']},
    {title:'Cropy',match:['cropy','crop topy','crop top','crop']},
    {title:'Mikiny',match:['mikiny','mikina']},
    {title:'Doplnky',match:['doplnky','doplnok']},
    {title:'Novinky',match:['novinky','nové','nove']},
    {title:'Limitky',match:['limitky','limitované','limitovane']}
  ];

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]})}
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
      var score=parseFloat(bits[1])||0;
      if(/w$/i.test(bits[1]||''))score*=10;
      return {url:bits[0]||'',score:score};
    }).filter(function(x){return validImage(x.url)});
    if(!parts.length)return'';
    parts.sort(function(a,b){return b.score-a.score});
    return validImage(parts[0].url);
  }

  function imageFromNode(img,scope){
    var out=[];
    function push(v){var x=validImage(v);if(x&&out.indexOf(x)<0)out.push(x)}
    if(img){
      ['data-src','data-lazy-src','data-original','data-lazy','src'].forEach(function(a){push(img.getAttribute(a))});
      push(bestFromSrcset(img.getAttribute('data-srcset')));
      push(bestFromSrcset(img.getAttribute('srcset')));
      var picture=img.closest&&img.closest('picture');
      if(picture){
        $$('source',picture).forEach(function(source){
          push(bestFromSrcset(source.getAttribute('data-srcset')));
          push(bestFromSrcset(source.getAttribute('srcset')));
        });
      }
    }
    if(scope){
      var meta=$('meta[itemprop="image"],meta[property="og:image"]',scope);
      if(meta)push(meta.getAttribute('content'));
    }
    return out[0]||'';
  }

  function allMenuLinks(){
    var out=[];
    $$('#ds-site-header .ds-site-nav-link,#ds-site-header .ds-site-submenu-grid a[href]').forEach(function(a){
      if(!a.href)return;
      var text=clean(a.textContent);
      if(text)out.push({text:text,href:a.href,norm:norm(text)});
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

  async function fetchCategoryImage(href,index){
    if(!href)return'';
    try{
      var response=await fetch(href,{credentials:'same-origin',cache:'force-cache'});
      if(!response.ok)return'';
      var doc=new DOMParser().parseFromString(await response.text(),'text/html');
      var cards=$$('.products-block .product,.products .product,.product-item,[data-micro-product-id]',doc);
      if(cards.length){
        var preferred=cards[Math.min(index%3,cards.length-1)]||cards[0];
        var img=$('.image img,.product-image img,picture img,img',preferred);
        var src=imageFromNode(img,preferred);
        if(src)return src;
      }
      var categoryImg=$('.category-header img,.category-perex img,.banner img,picture img',doc);
      return imageFromNode(categoryImg,doc);
    }catch(_){return''}
  }

  function cardHtml(route,index){
    return '<a class="ds-home-category-card" href="'+esc(route.href)+'" data-ds-category-card="'+index+'">'+
      '<span class="ds-home-category-card__media"><i></i></span>'+ 
      '<span class="ds-home-category-card__foot">'+
        '<span class="ds-home-category-card__title">'+esc(route.title)+'</span>'+ 
        '<span class="ds-home-category-card__arrow">→</span>'+ 
      '</span>'+ 
    '</a>';
  }

  function markup(routes){
    return ''+
      '<section id="ds-home-discovery" aria-label="Objaviť Dotyk Slov">'+
        '<div class="ds-home-trust" aria-label="Prečo Dotyk Slov">'+
          '<div class="ds-home-trust__inner">'+
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">01</span><span><strong>slovenská značka</strong><small>vzniká doma, nie v katalógu.</small></span></div>'+ 
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">02</span><span><strong>vlastné texty</strong><small>veci, ktoré inde nenájdeš.</small></span></div>'+ 
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">03</span><span><strong>tlačíme u nás</strong><small>od nápadu po hotový kus.</small></span></div>'+ 
            '<div class="ds-home-trust__item"><span class="ds-home-trust__index">04</span><span><strong>doprava zdarma</strong><small>limit strážime priamo v košíku.</small></span></div>'+ 
          '</div>'+ 
        '</div>'+ 
        '<div class="ds-home-category-shell">'+
          '<div class="ds-home-category-head">'+
            '<div><span class="ds-home-kicker">RÝCHLY VÝBER</span><h2>nájdi si svoje.</h2></div>'+ 
            '<p>Bez zbytočného hľadania. Vyber si kategóriu a ideš.</p>'+ 
          '</div>'+ 
          '<div class="ds-home-category-grid">'+routes.map(cardHtml).join('')+'</div>'+ 
        '</div>'+ 
      '</section>';
  }

  async function hydrate(routes,root){
    await Promise.all(routes.map(async function(route,index){
      var image=await fetchCategoryImage(route.href,index);
      if(!image)return;
      var media=$('[data-ds-category-card="'+index+'"] .ds-home-category-card__media',root);
      if(!media)return;
      media.innerHTML='';
      var img=document.createElement('img');
      img.src=image;
      img.alt='';
      img.loading=index<2?'eager':'lazy';
      img.decoding='async';
      img.onerror=function(){media.innerHTML='<i></i>'};
      media.appendChild(img);
    }));
  }

  function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if($('#ds-home-discovery'))return true;

    var hero=$('#ds-fashion-hero')||$('.banners-row');
    if(!hero||!hero.parentNode)return false;

    var links=allMenuLinks();
    if(!links.length)return false;

    var used={};
    var routes=CATEGORY_CONFIG.map(function(config){
      var hit=findRoute(config,links,used);
      if(!hit)return null;
      used[hit.href]=1;
      return {title:config.title,href:hit.href};
    }).filter(Boolean);

    if(!routes.length)return false;

    var holder=document.createElement('div');
    holder.innerHTML=markup(routes);
    var section=holder.firstElementChild;
    hero.insertAdjacentElement('afterend',section);
    hydrate(routes,section);
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
