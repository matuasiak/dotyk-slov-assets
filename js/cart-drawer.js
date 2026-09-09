(function(){
  'use strict';

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
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

  function imageSource(img,row){
    var out=[];
    function push(v){var x=validImage(v);if(x)out.push(x)}
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
    if(row){
      var meta=$('meta[itemprop="image"],meta[property="og:image"]',row);
      if(meta)push(meta.getAttribute('content'));
    }
    return out[0]||'';
  }

  function quantityFromRow(row){
    var input=$('input[type="number"],input[name*="amount" i],input[name*="quantity" i]',row);
    if(input&&clean(input.value))return clean(input.value);
    var q=$('.p-quantity,.quantity,.cart-p-quantity,[class*="quantity" i]',row);
    var text=clean(q&&q.textContent).match(/\d+/);
    return text?text[0]:'1';
  }

  function cartItemFromRow(row){
    var link=$('.p-name a[href],.cart-p-name a[href],.product-name a[href],.name a[href]',row);
    if(!link)return null;

    var href=link.getAttribute('href')||'';
    if(!href||/kosik|cart|objednavk|checkout/i.test(href))return null;

    var title=clean(link.textContent);
    if(!title)return null;

    var variant=$('.p-variant,.variant,.cart-p-variant,.product-variant,.p-name small,.name small',row);
    var price=$('.p-total .price-final,.p-total .price,.p-price .price-final,.p-price,.price-final,.price',row);
    var img=$('.p-image img,.cart-p-image img,.product-image img,.image img,picture img,img',row);

    return {
      title:title,
      href:absUrl(href),
      variant:clean(variant&&variant.textContent),
      quantity:quantityFromRow(row),
      price:clean(price&&price.textContent),
      image:imageSource(img,row)
    };
  }

  function parseCart(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    var selectors=[
      '.cart-table tr',
      '.cart-table .cart-item',
      '.cart-table .cart-p-item',
      '.cart-item',
      '[data-micro-product-id]'
    ];
    var nodes=[];
    selectors.forEach(function(sel){$$(sel,doc).forEach(function(n){if(nodes.indexOf(n)<0)nodes.push(n)})});

    var items=nodes.map(cartItemFromRow).filter(Boolean);

    var totalNode=$(
      '.cart-summary .price-wrapper .price-final,'+
      '.cart-summary .price-wrapper .price,'+
      '.cart-summary .price-total,'+
      '.cart-summary .total .price,'+
      '.summary-wrapper .price-final,'+
      '.cart-price .price-final,'+
      '.cart-price .price',doc
    );

    var checkout=$(
      'a.next-step[href],.next-step a[href],a[href*="/objednavka/"],a[href*="/checkout/"]',doc
    );

    var count=items.reduce(function(sum,item){var n=parseInt(item.quantity,10);return sum+(isFinite(n)?n:1)},0);

    return {
      items:items,
      count:count,
      total:clean(totalNode&&totalNode.textContent),
      checkoutHref:checkout&&checkout.getAttribute('href')?absUrl(checkout.getAttribute('href')):'/kosik/'
    };
  }

  function itemHtml(item){
    var media=item.image
      ?'<span class="ds-cart-item__media"><img src="'+esc(item.image)+'" alt="" loading="eager" decoding="async" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><i style="display:none"></i></span>'
      :'<span class="ds-cart-item__media"><i></i></span>';

    return '<a class="ds-cart-item" href="'+esc(item.href)+'">'+
      media+
      '<span class="ds-cart-item__copy">'+
        '<span class="ds-cart-item__name">'+esc(item.title)+'</span>'+
        (item.variant?'<span class="ds-cart-item__variant">'+esc(item.variant)+'</span>':'')+
        '<span class="ds-cart-item__meta">'+
          '<span class="ds-cart-item__qty">× '+esc(item.quantity||'1')+'</span>'+
          (item.price?'<span class="ds-cart-item__price">'+esc(item.price)+'</span>':'')+
        '</span>'+
      '</span>'+
    '</a>';
  }

  function build(){
    var oldBtn=$('.ds-site-cart');
    if(!oldBtn)return false;

    /* Clone once more so header.js/header-patch cannot redirect or open native hover cart. */
    var btn=oldBtn.cloneNode(true);
    oldBtn.replaceWith(btn);

    var backdrop=document.createElement('div');
    backdrop.id='ds-cart-backdrop';

    var drawer=document.createElement('aside');
    drawer.id='ds-cart-drawer';
    drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML=''+
      '<div class="ds-cart-head">'+
        '<div class="ds-cart-head__title">KOŠÍK <span class="ds-cart-head__count" hidden>0</span></div>'+
        '<button class="ds-cart-close" type="button" aria-label="Zavrieť">×</button>'+
      '</div>'+
      '<div class="ds-cart-body"><div class="ds-cart-state">Načítavam košík…</div></div>'+
      '<div class="ds-cart-footer" hidden>'+ 
        '<div class="ds-cart-summary"><span>Medzisúčet</span><strong></strong></div>'+ 
        '<a class="ds-cart-cta" href="/kosik/"><span>Pokračovať k objednávke</span><b>→</b></a>'+ 
        '<a class="ds-cart-secondary" href="/kosik/">Zobraziť košík</a>'+ 
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    var close=$('.ds-cart-close',drawer);
    var body=$('.ds-cart-body',drawer);
    var footer=$('.ds-cart-footer',drawer);
    var countEl=$('.ds-cart-head__count',drawer);
    var totalEl=$('.ds-cart-summary strong',drawer);
    var checkout=$('.ds-cart-cta',drawer);

    function closeOtherUi(){
      document.body.classList.remove('ds-wishlist-open','ds-site-search-open');
      var search=$('#ds-basic-search');
      if(search){search.classList.remove('is-open');search.setAttribute('aria-hidden','true')}
      var searchTrigger=$('.ds-site-search-open');
      if(searchTrigger)searchTrigger.setAttribute('aria-expanded','false');
    }

    function shut(){
      document.body.classList.remove('ds-cart-open');
      drawer.setAttribute('aria-hidden','true');
      btn.setAttribute('aria-expanded','false');
    }

    function syncHeaderCount(count){
      var badge=$('b',btn);
      if(count>0){
        if(!badge){badge=document.createElement('b');btn.appendChild(badge)}
        badge.textContent=String(count);
      }else if(badge){
        badge.remove();
      }
    }

    function render(cart){
      syncHeaderCount(cart.count);

      if(cart.count>0){
        countEl.hidden=false;
        countEl.textContent=String(cart.count);
      }else{
        countEl.hidden=true;
      }

      if(!cart.items.length){
        body.innerHTML='<div class="ds-cart-state ds-cart-empty"><p class="ds-cart-empty__title">zatiaľ nič.</p><p class="ds-cart-empty__copy">Košík je prázdny. Aspoň hlava nemusí byť.</p></div>';
        footer.hidden=true;
        return;
      }

      body.innerHTML='<div class="ds-cart-items">'+cart.items.map(itemHtml).join('')+'</div>';
      footer.hidden=false;
      totalEl.textContent=cart.total||'';
      $('.ds-cart-summary',footer).style.display=cart.total?'flex':'none';
      checkout.href=cart.checkoutHref||'/kosik/';
    }

    async function load(){
      body.innerHTML='<div class="ds-cart-state">Načítavam košík…</div>';
      footer.hidden=true;
      try{
        var response=await fetch('/kosik/',{credentials:'same-origin',cache:'no-store'});
        if(!response.ok)throw new Error('cart '+response.status);
        render(parseCart(await response.text()));
      }catch(_){
        body.innerHTML='<div class="ds-cart-state">Košík sa teraz nepodarilo načítať.</div>';
        footer.hidden=false;
        $('.ds-cart-summary',footer).style.display='none';
        checkout.href='/kosik/';
        $('.ds-cart-cta span',footer).textContent='Zobraziť košík';
      }
    }

    function open(){
      closeOtherUi();
      document.body.classList.add('ds-cart-open');
      drawer.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-expanded','true');
      load();
    }

    btn.setAttribute('aria-controls','ds-cart-drawer');
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',function(e){
      e.preventDefault();
      if(document.body.classList.contains('ds-cart-open'))shut();else open();
    });

    close.addEventListener('click',shut);
    backdrop.addEventListener('click',shut);
    document.addEventListener('keydown',function(e){if(e.key==='Escape')shut()});

    return true;
  }

  function boot(){
    if(build())return;
    var observer=new MutationObserver(function(){if(build())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect()},8000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
