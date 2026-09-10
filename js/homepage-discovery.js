(function(){
  'use strict';

  var PRODUCT_ROUTES=[
    {title:'tričká',match:['tričká','tricka']},
    {title:'mikiny',match:['mikiny','mikina']},
    {title:'doplnky',match:['doplnky','doplnok']},
    {title:'novinky',match:['novinky','nové','nove']},
    {title:'limitky',match:['limitky','limitované','limitovane']}
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

  function textRoutes(){
    var navItems=$$('#ds-site-header .ds-site-nav-item');
    for(var i=0;i<navItems.length;i++){
      var link=$('.ds-site-nav-link',navItems[i]);
      if(!link)continue;
      var label=norm(link.textContent);
      if(label.indexOf('produkty podla textu')<0&&label.indexOf('podla textu')<0)continue;
      var subs=$$('.ds-site-submenu-grid a[href]',navItems[i]).map(function(a){
        return {title:clean(a.textContent),href:a.href};
      }).filter(function(x){return x.title&&x.href});
      if(subs.length)return subs.slice(0,6);
    }

    var links=allMenuLinks();
    var fallback=links.find(function(x){return x.norm.indexOf('podla textu')>=0});
    return fallback?[{title:'všetky texty',href:fallback.href}]:[];
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

  function routeHtml(route,index,group){
    return '<a class="ds-home-route'+(index===0?' is-active':'')+'" href="'+esc(route.href||'#')+'" data-ds-route="'+group+'-'+index+'" data-index="'+index+'">'+
      '<span class="ds-home-route__index">0'+(index+1)+'</span>'+ 
      '<span class="ds-home-route__title">'+esc(route.title)+'</span>'+ 
      '<span class="ds-home-route__thumb"></span>'+ 
      '<span class="ds-home-route__arrow">→</span>'+ 
    '</a>';
  }

  function groupHtml(routes,group,active){
    return '<div class="ds-home-route-group'+(active?' is-active':'')+'" data-ds-group="'+group+'" '+(active?'':'hidden')+'>'+routes.map(function(r,i){return routeHtml(r,i,group)}).join('')+'</div>';
  }

  function markup(productRoutes,textRouteList){
    return ''+
      '<section id="ds-home-discovery" aria-label="Objaviť Dotyk Slov">'+
        '<div class="ds-home-discovery-shell">'+
          '<div class="ds-home-discovery-copy">'+
            '<span class="ds-home-kicker">DOTYK SLOV / NÁJDI SI SVOJE</span>'+ 
            '<h2>nie podľa trendu.<br>podľa seba.</h2>'+ 
            '<p>Dve cesty. Podľa toho, čo chceš nosiť — alebo čo chceš povedať bez slov.</p>'+ 
          '</div>'+ 
          '<div class="ds-home-navigator">'+
            '<div class="ds-home-tabs" role="tablist" aria-label="Spôsob výberu">'+
              '<button type="button" class="is-active" data-ds-tab="product" role="tab" aria-selected="true">podľa produktu</button>'+ 
              '<button type="button" data-ds-tab="text" role="tab" aria-selected="false">podľa textu</button>'+ 
            '</div>'+ 
            '<div class="ds-home-navigator__body">'+
              '<div class="ds-home-route-lists">'+
                groupHtml(productRoutes,'product',true)+
                groupHtml(textRouteList,'text',false)+
              '</div>'+ 
              '<a class="ds-home-preview" href="'+esc(productRoutes[0]&&productRoutes[0].href||'#')+'" aria-label="Otvoriť kategóriu">'+
                '<span class="ds-home-preview__media"></span>'+ 
                '<span class="ds-home-preview__meta"><span>DISCOVER</span><strong>'+esc(productRoutes[0]&&productRoutes[0].title||'')+'</strong><b>→</b></span>'+ 
              '</a>'+ 
            '</div>'+ 
          '</div>'+ 
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

  function setupGroupImages(routes,group,root,cache){
    if(cache[group])return cache[group];
    cache[group]=Promise.all(routes.map(async function(route,index){
      var image=await fetchCategoryImage(route.href,index);
      route.image=image;
      if(image){
        var thumb=$('[data-ds-route="'+group+'-'+index+'"] .ds-home-route__thumb',root);
        if(thumb){
          var img=document.createElement('img');
          img.src=image;img.alt='';img.loading='lazy';img.decoding='async';thumb.appendChild(img);
        }
      }
      return route;
    }));
    return cache[group];
  }

  function applyPreview(route,root){
    if(!route)return;
    var preview=$('.ds-home-preview',root);
    var media=$('.ds-home-preview__media',root);
    var title=$('.ds-home-preview__meta strong',root);
    if(preview)preview.href=route.href||'#';
    if(title)title.textContent=route.title||'';
    if(media){
      media.innerHTML='';
      if(route.image){
        var img=document.createElement('img');
        img.src=route.image;img.alt='';img.decoding='async';media.appendChild(img);
      }
    }
  }

  function wire(root,groups){
    var cache={};
    var activeGroup='product';

    function activate(group,index){
      var routes=groups[group]||[];
      if(!routes.length)return;
      index=Math.max(0,Math.min(index,routes.length-1));
      $$('[data-ds-group="'+group+'"] .ds-home-route',root).forEach(function(a,i){a.classList.toggle('is-active',i===index)});
      setupGroupImages(routes,group,root,cache).then(function(){applyPreview(routes[index],root)});
    }

    $$('.ds-home-tabs button',root).forEach(function(button){
      button.addEventListener('click',function(){
        var group=button.getAttribute('data-ds-tab');
        if(!groups[group]||!groups[group].length)return;
        activeGroup=group;
        $$('.ds-home-tabs button',root).forEach(function(b){
          var on=b===button;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',on?'true':'false');
        });
        $$('.ds-home-route-group',root).forEach(function(g){
          var on=g.getAttribute('data-ds-group')===group;g.hidden=!on;g.classList.toggle('is-active',on);
        });
        activate(group,0);
      });
    });

    $$('.ds-home-route',root).forEach(function(a){
      function preview(){
        var bits=(a.getAttribute('data-ds-route')||'').split('-');
        var group=bits[0],index=parseInt(bits[1],10)||0;
        if(group===activeGroup)activate(group,index);
      }
      a.addEventListener('mouseenter',preview);
      a.addEventListener('focus',preview);
    });

    setupGroupImages(groups.product,'product',root,cache).then(function(){activate('product',0)});
  }

  function build(){
    if(!document.body.classList.contains('in-index'))return true;
    if($('#ds-home-discovery'))return true;

    var hero=$('#ds-fashion-hero')||$('.banners-row');
    if(!hero||!hero.parentNode)return false;

    var links=allMenuLinks();
    if(!links.length)return false;

    var used={};
    var products=PRODUCT_ROUTES.map(function(config){
      var hit=findRoute(config,links,used);
      if(hit)used[hit.href]=1;
      return hit?{title:config.title,href:hit.href}:null;
    }).filter(Boolean);

    if(!products.length)return false;
    var texts=textRoutes();
    if(!texts.length){
      var fallback=links.find(function(x){return x.norm.indexOf('podla textu')>=0});
      if(fallback)texts=[{title:'všetky texty',href:fallback.href}];
    }

    var holder=document.createElement('div');
    holder.innerHTML=markup(products,texts);
    var section=holder.firstElementChild;
    hero.insertAdjacentElement('afterend',section);
    wire(section,{product:products,text:texts});
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
