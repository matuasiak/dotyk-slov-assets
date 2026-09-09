(function(){
  'use strict';

  var CHECKOUT_URL='/objednavka/krok-1/';
  var DELIVERY_MIN_BUSINESS_DAYS=2;
  var DELIVERY_MAX_BUSINESS_DAYS=4;

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function absUrl(v){if(!v)return'';try{return new URL(v,location.origin).href}catch(_){return v}}

  function getShoptetValue(key){
    try{
      if(typeof window.getShoptetDataLayer==='function')return window.getShoptetDataLayer(key);
    }catch(_){}
    try{
      var layers=window.dataLayer||[];
      for(var i=0;i<layers.length;i++){
        if(layers[i]&&layers[i].shoptet&&Object.prototype.hasOwnProperty.call(layers[i].shoptet,key))return layers[i].shoptet[key];
      }
    }catch(_){}
    return null;
  }

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

  function parseAmount(text){
    if(!text)return null;
    var normalized=String(text)
      .replace(/\s|\u00a0/g,'')
      .replace(/[^0-9,.-]/g,'')
      .replace(/\.(?=\d{3}(?:\D|$))/g,'')
      .replace(',','.');
    var match=normalized.match(/-?\d+(?:\.\d+)?/);
    if(!match)return null;
    var value=parseFloat(match[0]);
    return isFinite(value)?value:null;
  }

  function addBusinessDays(date,days){
    var d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
    var added=0;
    while(added<days){
      d.setDate(d.getDate()+1);
      var day=d.getDay();
      if(day!==0&&day!==6)added++;
    }
    return d;
  }

  function formatShortDate(date){
    return new Intl.DateTimeFormat('sk-SK',{day:'numeric',month:'numeric'}).format(date);
  }

  function deliveryRange(){
    var now=new Date();
    var from=addBusinessDays(now,DELIVERY_MIN_BUSINESS_DAYS);
    var to=addBusinessDays(now,DELIVERY_MAX_BUSINESS_DAYS);
    return formatShortDate(from)+' – '+formatShortDate(to);
  }

  function parseCart(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    var selectors=['.cart-table tr','.cart-table .cart-item','.cart-table .cart-p-item','.cart-item','[data-micro-product-id]'];
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
    var total=clean(totalNode&&totalNode.textContent);
    var count=items.reduce(function(sum,item){var n=parseInt(item.quantity,10);return sum+(isFinite(n)?n:1)},0);

    return {items:items,count:count,total:total,totalValue:parseAmount(total)};
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
        '<div class="ds-cart-shipping" hidden>'+ 
          '<div class="ds-cart-shipping__row"><span></span><strong></strong></div>'+ 
          '<div class="ds-cart-shipping__track"><i></i></div>'+ 
          '<small class="ds-cart-shipping__note" hidden>Doprava zdarma sa môže líšiť podľa krajiny doručenia.</small>'+ 
        '</div>'+ 
        '<div class="ds-cart-delivery">'+
          '<span class="ds-cart-delivery__label">Predpokladané doručenie</span>'+ 
          '<strong class="ds-cart-delivery__date"></strong>'+ 
          '<small>pri objednaní dnes</small>'+ 
        '</div>'+ 
        '<div class="ds-cart-summary"><span>Medzisúčet</span><strong></strong></div>'+ 
        '<a class="ds-cart-cta" href="'+CHECKOUT_URL+'"><span>Pokračovať k objednávke</span><b>→</b></a>'+ 
        '<div class="ds-cart-checkout-note">Dopravu a platbu vyberieš v ďalšom kroku.</div>'+ 
        '<a class="ds-cart-secondary" href="/kosik/">Upraviť košík</a>'+ 
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    var close=$('.ds-cart-close',drawer);
    var body=$('.ds-cart-body',drawer);
    var footer=$('.ds-cart-footer',drawer);
    var countEl=$('.ds-cart-head__count',drawer);
    var totalEl=$('.ds-cart-summary strong',drawer);
    var shipping=$('.ds-cart-shipping',drawer);
    var shippingText=$('.ds-cart-shipping__row span',drawer);
    var shippingStrong=$('.ds-cart-shipping__row strong',drawer);
    var shippingBar=$('.ds-cart-shipping__track i',drawer);
    var shippingNote=$('.ds-cart-shipping__note',drawer);
    var deliveryDate=$('.ds-cart-delivery__date',drawer);

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
      }else if(badge){badge.remove()}
    }

    function renderShipping(totalValue){
      var info=getShoptetValue('cartInfo');
      var left=info&&info.leftToFreeShipping;
      var priceLeft=left&&typeof left.priceLeft==='number'?left.priceLeft:null;
      var formatted=clean(left&&left.formattedPrice);
      var isFree=!!(info&&info.freeShipping)||(priceLeft!==null&&priceLeft<=0);

      if(!info||(!left&&!info.freeShipping)){
        shipping.hidden=true;
        return;
      }

      shipping.hidden=false;
      shippingNote.hidden=!(left&&left.dependOnRegion);

      if(isFree){
        shippingText.textContent='Dopravu máš';
        shippingStrong.textContent='ZDARMA';
        shippingBar.style.width='100%';
        return;
      }

      shippingText.textContent='Do dopravy zdarma ti chýba';
      shippingStrong.textContent=formatted||String(priceLeft).replace('.',',')+' €';

      var progress=0;
      if(totalValue!==null&&isFinite(totalValue)&&priceLeft!==null&&priceLeft>=0){
        var inferredThreshold=totalValue+priceLeft;
        if(inferredThreshold>0)progress=Math.max(0,Math.min(100,(totalValue/inferredThreshold)*100));
      }
      shippingBar.style.width=progress+'%';
    }

    function render(cart){
      syncHeaderCount(cart.count);
      deliveryDate.textContent=deliveryRange();

      if(cart.count>0){countEl.hidden=false;countEl.textContent=String(cart.count)}else{countEl.hidden=true}

      if(!cart.items.length){
        body.innerHTML='<div class="ds-cart-state ds-cart-empty"><p class="ds-cart-empty__title">zatiaľ nič.</p><p class="ds-cart-empty__copy">Košík je prázdny. Aspoň hlava nemusí byť.</p></div>';
        footer.hidden=true;
        return;
      }

      body.innerHTML='<div class="ds-cart-items">'+cart.items.map(itemHtml).join('')+'</div>';
      footer.hidden=false;
      totalEl.textContent=cart.total||'';
      $('.ds-cart-summary',footer).style.display=cart.total?'flex':'none';
      renderShipping(cart.totalValue);
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
        shipping.hidden=true;
        $('.ds-cart-summary',footer).style.display='none';
        deliveryDate.textContent=deliveryRange();
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
