(function(){
  'use strict';

  var CHECKOUT_URL='/objednavka/krok-1/';
  var DELIVERY_MIN_BUSINESS_DAYS=2;
  var DELIVERY_MAX_BUSINESS_DAYS=4;

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function absUrl(v){if(!v)return'';try{return new URL(v,location.origin).href}catch(_){return v}}

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

  function imageSource(img,scope){
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
      var lazy=$('[data-src],[data-lazy-src],[data-original]',scope);
      if(lazy){push(lazy.getAttribute('data-src'));push(lazy.getAttribute('data-lazy-src'));push(lazy.getAttribute('data-original'))}
    }
    return out[0]||'';
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
    return formatShortDate(addBusinessDays(now,DELIVERY_MIN_BUSINESS_DAYS))+' – '+formatShortDate(addBusinessDays(now,DELIVERY_MAX_BUSINESS_DAYS));
  }

  function quantityFromRow(row){
    var input=$('input[type="number"],input[name*="amount" i],input[name*="quantity" i]',row);
    if(input&&clean(input.value))return clean(input.value);
    var q=$('.p-quantity,.quantity,.cart-p-quantity,[class*="quantity" i]',row);
    var text=clean(q&&q.textContent).match(/\d+/);
    return text?text[0]:'1';
  }

  function inputValue(row,selectors){
    for(var i=0;i<selectors.length;i++){
      var node=$(selectors[i],row);
      if(!node)continue;
      var value=node.value||node.getAttribute('value')||node.getAttribute('data-value')||node.getAttribute('data-item-id')||node.getAttribute('data-price-id')||'';
      if(clean(value))return clean(value);
    }
    return'';
  }

  function identifiersFromRow(row,title){
    var itemId=inputValue(row,['input[name="itemId"]','input[name$="[itemId]"]','input[name*="itemId" i]','[data-item-id]']);
    var priceId=inputValue(row,['input[name="priceId"]','input[name$="[priceId]"]','input[name*="priceId" i]','[data-price-id]']);
    var code=inputValue(row,['input[name="code"]','input[name*="code" i]','[data-product-code]']);

    if(!itemId&&row.getAttribute)itemId=row.getAttribute('data-item-id')||'';
    if(!priceId&&row.getAttribute)priceId=row.getAttribute('data-price-id')||'';
    if(!code&&row.getAttribute)code=row.getAttribute('data-product-code')||'';

    var cart=getShoptetValue('cart');
    if(Array.isArray(cart)&&cart.length){
      var hit=null;
      if(itemId)hit=cart.find(function(x){return String(x.itemId||'')===String(itemId)});
      if(!hit&&priceId)hit=cart.find(function(x){return String(x.priceId||'')===String(priceId)});
      if(!hit&&code)hit=cart.find(function(x){return String(x.code||'')===String(code)});
      if(!hit&&title)hit=cart.find(function(x){return norm(x.name)===norm(title)});
      if(hit){itemId=itemId||hit.itemId||'';priceId=priceId||hit.priceId||'';code=code||hit.code||''}
    }
    return {itemId:String(itemId||''),priceId:String(priceId||''),code:String(code||'')};
  }

  function cartItemFromRow(row){
    var link=$('.p-name a[href],.cart-p-name a[href],.product-name a[href],.name a[href]',row);
    if(!link)return null;
    var href=link.getAttribute('href')||'';
    if(!href||/kosik|cart|objednavk|checkout/i.test(href))return null;
    var title=clean(link.textContent);
    if(!title)return null;

    var ids=identifiersFromRow(row,title);
    var variant=$('.p-variant,.variant,.cart-p-variant,.product-variant,.p-name small,.name small',row);
    var price=$('.p-total .price-final,.p-total .price,.p-price .price-final,.p-price,.price-final,.price',row);
    var img=$('.p-image img,.cart-p-image img,.product-image img,.image img,picture img,img',row);

    return {
      title:title,
      href:absUrl(href),
      variant:clean(variant&&variant.textContent),
      quantity:quantityFromRow(row),
      price:clean(price&&price.textContent),
      image:imageSource(img,row),
      itemId:ids.itemId,
      priceId:ids.priceId,
      code:ids.code
    };
  }

  function parseCart(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    var selectors=['.cart-table tr','.cart-table .cart-item','.cart-table .cart-p-item','.cart-item','[data-micro-product-id]'];
    var nodes=[];
    selectors.forEach(function(sel){$$(sel,doc).forEach(function(n){if(nodes.indexOf(n)<0)nodes.push(n)})});

    var items=nodes.map(cartItemFromRow).filter(Boolean);
    var seen={};
    items=items.filter(function(item){
      var key=item.itemId||item.href+'|'+item.variant;
      if(seen[key])return false;
      seen[key]=1;
      return true;
    });

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
    var qty=parseInt(item.quantity,10)||1;
    var canRemove=!!item.itemId;
    var canChange=!!(item.itemId&&item.priceId);

    return '<div class="ds-cart-item" data-item-id="'+esc(item.itemId)+'" data-price-id="'+esc(item.priceId)+'" data-qty="'+qty+'">'+
      '<a class="ds-cart-item__media-link" href="'+esc(item.href)+'">'+media+'</a>'+
      '<div class="ds-cart-item__copy">'+
        '<a class="ds-cart-item__name" href="'+esc(item.href)+'">'+esc(item.title)+'</a>'+
        (item.variant?'<span class="ds-cart-item__variant">'+esc(item.variant)+'</span>':'')+
        '<div class="ds-cart-item__price-row">'+(item.price?'<span class="ds-cart-item__price">'+esc(item.price)+'</span>':'')+'</div>'+
        '<div class="ds-cart-item__actions">'+
          '<div class="ds-cart-qty" aria-label="Množstvo">'+
            '<button type="button" data-cart-action="minus" aria-label="Znížiť množstvo" '+(canChange?'':'disabled')+'>−</button>'+ 
            '<span>'+qty+'</span>'+ 
            '<button type="button" data-cart-action="plus" aria-label="Zvýšiť množstvo" '+(canChange?'':'disabled')+'>+</button>'+ 
          '</div>'+ 
          '<button class="ds-cart-remove" type="button" data-cart-action="remove" '+(canRemove?'':'disabled')+'>Odstrániť</button>'+ 
        '</div>'+ 
      '</div>'+ 
    '</div>';
  }

  function getShippingInfo(){
    var info=getShoptetValue('cartInfo');
    var left=info&&info.leftToFreeShipping;
    var priceLeft=left&&typeof left.priceLeft==='number'?left.priceLeft:null;
    return {
      raw:info,
      left:left,
      priceLeft:priceLeft,
      formatted:clean(left&&left.formattedPrice),
      free:!!(info&&info.freeShipping)||(priceLeft!==null&&priceLeft<=0),
      dependOnRegion:!!(left&&left.dependOnRegion)
    };
  }

  function categoryUrl(name){
    var target=norm(name);
    var links=$$('#ds-site-header .ds-site-nav-link,#navigation .menu-level-1 > li > a[href]');
    var hit=links.find(function(a){return norm(a.textContent)===target||norm(a.textContent).indexOf(target)>=0});
    if(!hit||!hit.href)return'';
    try{
      var url=new URL(hit.href,location.origin);
      url.searchParams.set('order','price');
      return url.href;
    }catch(_){return hit.href}
  }

  function catalogPriceId(card){
    var node=$('input[name="priceId"],input[name*="priceId" i],[data-price-id],[data-micro-price-id]',card);
    if(!node)return'';
    return clean(node.value||node.getAttribute('value')||node.getAttribute('data-price-id')||node.getAttribute('data-micro-price-id'));
  }

  function catalogProduct(card){
    var link=$('.p-name a[href],.name a[href],.p-in-in a[href],.product-name a[href],a.p-name[href],.image a[href]',card)||$('a[href]',card);
    if(!link)return null;
    var titleNode=$('.p-name,.name,.p-in-in,.product-name',card);
    var priceNode=$('.price-final,.p-bottom .price,.price,.product-price',card);
    var img=$('.image img,.product-image img,picture img,img',card);
    var title=clean((titleNode&&titleNode.textContent)||link.textContent);
    var price=clean(priceNode&&priceNode.textContent);
    var href=link.getAttribute('href')||'';
    var priceValue=parseAmount(price);
    if(!title||!href||priceValue===null||priceValue<=0)return null;
    return {title:title,href:absUrl(href),price:price,priceValue:priceValue,image:imageSource(img,card),priceId:catalogPriceId(card)};
  }

  function parseCatalog(html){
    var doc=new DOMParser().parseFromString(html,'text/html');
    var cards=$$('.products-block .product,.products .product,.product-item,.product-slider .product,[data-micro-product-id]',doc);
    var seen={};
    return cards.map(catalogProduct).filter(Boolean).filter(function(p){
      if(seen[p.href])return false;
      seen[p.href]=1;
      return true;
    }).sort(function(a,b){return a.priceValue-b.priceValue});
  }

  function upsellHtml(product,remaining){
    var media=product.image
      ?'<span class="ds-cart-upsell__media"><img src="'+esc(product.image)+'" alt="" loading="eager" decoding="async"><i></i></span>'
      :'<span class="ds-cart-upsell__media"><i></i></span>';
    var enough=remaining!==null&&product.priceValue>=remaining;
    var action=product.priceId
      ?'<button type="button" class="ds-cart-upsell__action" data-upsell-add data-price-id="'+esc(product.priceId)+'">Pridať +</button>'
      :'<a class="ds-cart-upsell__action" href="'+esc(product.href)+'">Pozrieť →</a>';

    return '<div class="ds-cart-upsell__eyebrow">'+(enough?'TOTO ŤA DOSTANE K DOPRAVE ZDARMA':'NIEČO MALÉ NAVYŠE')+'</div>'+ 
      '<div class="ds-cart-upsell__card">'+
        '<a href="'+esc(product.href)+'" class="ds-cart-upsell__media-link">'+media+'</a>'+ 
        '<div class="ds-cart-upsell__copy">'+
          '<a href="'+esc(product.href)+'" class="ds-cart-upsell__name">'+esc(product.title)+'</a>'+ 
          '<span class="ds-cart-upsell__price">'+esc(product.price)+'</span>'+ 
          action+
        '</div>'+ 
      '</div>';
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
          '<div class="ds-cart-shipping__eyebrow"><i></i><span>DOPRAVA ZDARMA</span></div>'+ 
          '<div class="ds-cart-shipping__row"><span></span><strong></strong></div>'+ 
          '<div class="ds-cart-shipping__sub">Doprava je na nás.</div>'+ 
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
    var shippingSub=$('.ds-cart-shipping__sub',drawer);
    var shippingBar=$('.ds-cart-shipping__track i',drawer);
    var shippingNote=$('.ds-cart-shipping__note',drawer);
    var deliveryDate=$('.ds-cart-delivery__date',drawer);
    var reloadTimer=null;
    var loading=false;
    var upsellToken=0;

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
      if(count>0){if(!badge){badge=document.createElement('b');btn.appendChild(badge)}badge.textContent=String(count)}
      else if(badge)badge.remove();
    }

    function renderShipping(totalValue){
      var state=getShippingInfo();
      if(!state.raw||(!state.left&&!state.free)){
        shipping.hidden=true;
        return state;
      }

      shipping.hidden=false;
      shippingNote.hidden=!state.dependOnRegion;

      if(state.free){
        shippingText.textContent='Máš ju';
        shippingStrong.textContent='ZDARMA';
        shippingSub.textContent='Doprava je na nás.';
        shippingBar.style.width='100%';
        shipping.classList.add('is-free');
        return state;
      }

      shipping.classList.remove('is-free');
      shippingText.textContent='Chýba už len';
      shippingStrong.textContent=state.formatted||String(state.priceLeft).replace('.',',')+' €';
      shippingSub.textContent='a doprava je na nás.';

      var progress=0;
      if(totalValue!==null&&isFinite(totalValue)&&state.priceLeft!==null&&state.priceLeft>=0){
        var inferredThreshold=totalValue+state.priceLeft;
        if(inferredThreshold>0)progress=Math.max(0,Math.min(100,(totalValue/inferredThreshold)*100));
      }
      shippingBar.style.width=progress+'%';
      return state;
    }

    async function loadUpsell(cart,shippingState){
      var token=++upsellToken;
      var target=$('.ds-cart-upsell',body);
      if(!target||!shippingState||shippingState.free||shippingState.priceLeft===null||shippingState.priceLeft<=0)return;

      var url=categoryUrl('doplnky');
      if(!url)return;

      target.hidden=false;
      target.innerHTML='<div class="ds-cart-upsell__loading">Hľadám niečo malé…</div>';

      try{
        var response=await fetch(url,{credentials:'same-origin',cache:'no-store'});
        if(!response.ok)throw new Error('upsell '+response.status);
        var products=parseCatalog(await response.text());
        if(token!==upsellToken)return;

        var cartLinks={};
        cart.items.forEach(function(item){cartLinks[item.href]=1});
        products=products.filter(function(p){return !cartLinks[p.href]});
        if(!products.length){target.hidden=true;return}

        var enough=products.filter(function(p){return p.priceValue>=shippingState.priceLeft});
        var product=(enough.length?enough:products)[0];
        target.innerHTML=upsellHtml(product,shippingState.priceLeft);
      }catch(_){
        if(token!==upsellToken)return;
        target.hidden=true;
      }
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

      body.innerHTML='<div class="ds-cart-items">'+cart.items.map(itemHtml).join('')+'</div><div class="ds-cart-upsell" hidden></div>';
      footer.hidden=false;
      totalEl.textContent=cart.total||'';
      $('.ds-cart-summary',footer).style.display=cart.total?'flex':'none';
      var shippingState=renderShipping(cart.totalValue);
      loadUpsell(cart,shippingState);
    }

    async function load(soft){
      if(loading)return;
      loading=true;
      drawer.classList.toggle('is-updating',!!soft);
      if(!soft){body.innerHTML='<div class="ds-cart-state">Načítavam košík…</div>';footer.hidden=true}
      try{
        var response=await fetch('/kosik/',{credentials:'same-origin',cache:'no-store'});
        if(!response.ok)throw new Error('cart '+response.status);
        render(parseCart(await response.text()));
      }catch(_){
        if(!soft){
          body.innerHTML='<div class="ds-cart-state">Košík sa teraz nepodarilo načítať.</div>';
          footer.hidden=false;
          shipping.hidden=true;
          $('.ds-cart-summary',footer).style.display='none';
          deliveryDate.textContent=deliveryRange();
        }
      }finally{loading=false;drawer.classList.remove('is-updating')}
    }

    function scheduleReload(delay){
      clearTimeout(reloadTimer);
      reloadTimer=setTimeout(function(){if(document.body.classList.contains('ds-cart-open'))load(true)},typeof delay==='number'?delay:120);
    }

    function cartShared(){return window.shoptet&&window.shoptet.cartShared?window.shoptet.cartShared:null}

    function setItemBusy(itemEl,busy){
      if(!itemEl)return;
      itemEl.classList.toggle('is-updating',busy);
      $$('button',itemEl).forEach(function(b){b.disabled=busy});
    }

    function removeItem(itemEl){
      var api=cartShared();
      var itemId=itemEl&&itemEl.getAttribute('data-item-id');
      if(!api||typeof api.removeFromCart!=='function'||!itemId){location.href='/kosik/';return}
      setItemBusy(itemEl,true);
      try{api.removeFromCart({itemId:itemId});scheduleReload(900)}
      catch(_){setItemBusy(itemEl,false);location.href='/kosik/'}
    }

    function changeQuantity(itemEl,delta){
      var api=cartShared();
      var itemId=itemEl&&itemEl.getAttribute('data-item-id');
      var priceId=itemEl&&itemEl.getAttribute('data-price-id');
      var current=parseInt(itemEl&&itemEl.getAttribute('data-qty'),10)||1;
      var amount=current+delta;
      if(amount<=0){removeItem(itemEl);return}
      if(!api||typeof api.updateQuantityInCart!=='function'||!itemId||!priceId){location.href='/kosik/';return}
      setItemBusy(itemEl,true);
      try{
        var numericPriceId=/^\d+$/.test(priceId)?parseInt(priceId,10):priceId;
        api.updateQuantityInCart({itemId:itemId,priceId:numericPriceId,amount:amount});
        scheduleReload(900);
      }catch(_){setItemBusy(itemEl,false);location.href='/kosik/'}
    }

    function addUpsell(button){
      var api=cartShared();
      var priceId=button&&button.getAttribute('data-price-id');
      if(!api||typeof api.addToCart!=='function'||!priceId)return;
      button.disabled=true;
      button.textContent='Pridávam…';
      try{
        var numericPriceId=/^\d+$/.test(priceId)?parseInt(priceId,10):priceId;
        api.addToCart({priceId:numericPriceId,amount:1},true);
        scheduleReload(900);
      }catch(_){button.disabled=false;button.textContent='Pridať +'}
    }

    function open(){
      closeOtherUi();
      document.body.classList.add('ds-cart-open');
      drawer.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-expanded','true');
      load(false);
    }

    btn.setAttribute('aria-controls','ds-cart-drawer');
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',function(e){e.preventDefault();document.body.classList.contains('ds-cart-open')?shut():open()});

    body.addEventListener('click',function(e){
      var upsell=e.target.closest('[data-upsell-add]');
      if(upsell){e.preventDefault();if(!upsell.disabled)addUpsell(upsell);return}

      var action=e.target.closest('[data-cart-action]');
      if(!action)return;
      e.preventDefault();
      var itemEl=action.closest('.ds-cart-item');
      if(!itemEl||action.disabled)return;
      var type=action.getAttribute('data-cart-action');
      if(type==='remove')removeItem(itemEl);
      if(type==='minus')changeQuantity(itemEl,-1);
      if(type==='plus')changeQuantity(itemEl,1);
    });

    ['ShoptetCartUpdated','ShoptetCartSetCartItemAmount','ShoptetCartDeleteCartItem','ShoptetDataLayerUpdated'].forEach(function(eventName){
      document.addEventListener(eventName,function(){scheduleReload(80)});
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