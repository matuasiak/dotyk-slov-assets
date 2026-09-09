(function(){
  'use strict';

  var phrases=['mám toho dosť','nevolaj mi','citovo nedostupný','overthinking','mikiny','veci, ktoré nepovieš nahlas'];
  var icons={
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    account:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.7a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z"/></svg>',
    bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function esc(v){return String(v||'').replace(/[&<>'\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]})}
  function cleanLinkText(a){
    if(!a)return'';
    var c=a.cloneNode(true);
    c.querySelectorAll('.submenu-arrow,svg,i,.menu-image,picture,img').forEach(function(n){n.remove()});
    return clean(c.textContent);
  }
  function uniqueLinks(list){
    var seen={};
    return list.filter(function(x){
      var key=(x.href||'')+'|'+(x.text||'').toLowerCase();
      if(!x.text||seen[key])return false;
      seen[key]=true;
      return true;
    });
  }

  /* Shoptet menu markup differs slightly between templates. We intentionally
     keep only the shallowest link level under .menu-level-2. */
  function directChildren(li){
    var submenu=li.querySelector('.menu-level-2');
    if(!submenu)return[];
    var links=$$('a[href]',submenu);
    if(!links.length)return[];

    var scored=links.map(function(a){
      var depth=0;
      var p=a.parentElement;
      while(p&&p!==submenu){
        if(p.tagName==='UL'||p.classList.contains('menu-level-3'))depth+=1;
        p=p.parentElement;
      }
      return {a:a,depth:depth};
    });
    var min=Math.min.apply(null,scored.map(function(x){return x.depth}));
    var children=scored.filter(function(x){return x.depth===min}).map(function(x){
      var label=cleanLinkText(x.a);
      return label?{text:label,href:x.a.href}:null;
    }).filter(Boolean);

    /* Fallback for unusual wrappers. Never dump an unlimited recursive tree. */
    if(!children.length){
      children=links.slice(0,16).map(function(a){
        var label=cleanLinkText(a);
        return label?{text:label,href:a.href}:null;
      }).filter(Boolean);
    }
    return uniqueLinks(children).slice(0,24);
  }

  function getNav(){
    return $$('#navigation .menu-level-1 > li').map(function(li){
      var a=li.querySelector(':scope > a[href]');
      if(!a)return null;
      var label=cleanLinkText(a);
      if(!label)return null;
      return {text:label,href:a.href,children:directChildren(li)};
    }).filter(Boolean).slice(0,7);
  }

  function getNativeActions(){
    var source=$('#header');
    if(!source)return{};
    var accountTrigger=$(
      'button.toggle-window[data-target="login"],button[data-dialog-id="login"],button[aria-controls="login"],a.toggle-window[data-target="login"],.top-nav-button-login',
      source
    );
    var accountLink=$(
      'a[href*="/klient"],a[href*="/customer"],a[href*="/account"],a[href*="/prihlas"]',
      source
    );
    var cartTrigger=$(
      'button.toggle-window[data-target="cart"],button[aria-controls="cart-widget"],[data-target="cart"].toggle-window,.cart-count.toggle-window',
      source
    );
    var cartLink=$('.cart-count[href],a[href*="/kosik"],a[href*="/cart"]',source);
    return {
      accountTrigger:accountTrigger,
      accountHref:accountLink&&accountLink.href||'#',
      cartTrigger:cartTrigger,
      cartHref:cartLink&&cartLink.href||'/kosik/'
    };
  }

  function getData(){
    var logoImg=$('#header .site-name img');
    var logoLink=$('#header .site-name a');
    var cart=$('#header .navigation-buttons .cart-count');
    var cartCount=cart&&$('i',cart);
    var actions=getNativeActions();
    return {
      logoSrc:logoImg&&logoImg.src,
      logoAlt:logoImg&&logoImg.alt||'Dotyk Slov',
      homeHref:logoLink&&logoLink.href||'/',
      nav:getNav(),
      cartHref:actions.cartHref,
      cartCount:clean(cartCount&&cartCount.textContent),
      accountHref:actions.accountHref,
      nativeActions:actions
    };
  }

  function navHtml(data){
    var path=location.pathname.replace(/\/$/,'')||'/';
    return data.nav.map(function(item){
      var active=(new URL(item.href,location.href).pathname.replace(/\/$/,'')||'/')===path?' is-active':'';
      var children=item.children||[];
      var submenu='';
      if(children.length){
        var visible=children.slice(0,16);
        submenu='<div class="ds-site-submenu"><div class="ds-site-submenu-inner">'+
          '<div class="ds-site-submenu-head"><span>'+esc(item.text)+'</span><a href="'+esc(item.href)+'">Zobraziť všetko →</a></div>'+
          '<div class="ds-site-submenu-grid">'+visible.map(function(child){return '<a href="'+esc(child.href)+'">'+esc(child.text)+'</a>'}).join('')+'</div>'+
        '</div></div>';
      }
      return '<div class="ds-site-nav-item'+(children.length?' has-submenu':'')+'"><a class="ds-site-nav-link'+active+'" href="'+esc(item.href)+'">'+esc(item.text)+'</a>'+submenu+'</div>';
    }).join('');
  }

  function mobileHtml(data){
    return data.nav.map(function(item){
      var child=(item.children||[]).slice(0,12);
      if(!child.length)return '<a class="ds-mobile-main" href="'+esc(item.href)+'">'+esc(item.text)+'</a>';
      return '<details><summary>'+esc(item.text)+'</summary><div class="ds-mobile-sub">'+child.map(function(x){return '<a href="'+esc(x.href)+'">'+esc(x.text)+'</a>'}).join('')+'<a href="'+esc(item.href)+'">Zobraziť všetko →</a></div></details>';
    }).join('');
  }

  function buildHeader(data){
    var h=document.createElement('header');
    h.id='ds-site-header';
    h.innerHTML=
      '<a class="ds-site-announcement" href="#"><span></span>NOVÝ DROP JE VONKU →</a>'+
      '<div class="ds-site-main">'+
        '<button class="ds-site-mobile-menu" type="button" aria-label="Menu">'+icons.menu+'</button>'+
        '<a class="ds-site-logo" href="'+esc(data.homeHref)+'">'+(data.logoSrc?'<img src="'+esc(data.logoSrc)+'" alt="'+esc(data.logoAlt)+'">':'DOTYK SLOV')+'</a>'+
        '<nav class="ds-site-nav" aria-label="Hlavná navigácia">'+navHtml(data)+'</nav>'+
        '<div class="ds-site-tools">'+
          '<button class="ds-site-search-open" type="button" aria-label="Hľadať">'+icons.search+'<span>Hľadať</span></button>'+
          '<button class="ds-site-wishlist" type="button" aria-label="Obľúbené">'+icons.heart+'</button>'+
          '<button class="ds-site-account" type="button" aria-label="Môj účet">'+icons.account+'</button>'+
          '<button class="ds-site-cart" type="button" aria-label="Košík">'+icons.bag+(data.cartCount?'<b>'+esc(data.cartCount)+'</b>':'')+'</button>'+
        '</div>'+
      '</div>'+
      '<div class="ds-site-mobile-panel">'+mobileHtml(data)+'</div>';
    return h;
  }

  function buildSearch(){
    var nativeSearch=$('#header .search');
    if(!nativeSearch)return null;

    var backdrop=document.createElement('div');
    backdrop.id='ds-site-search-backdrop';
    document.body.appendChild(backdrop);

    var overlay=document.createElement('div');
    overlay.id='ds-site-search';
    overlay.innerHTML='<div class="ds-site-search-inner"><div class="ds-site-search-top"><span>HĽADAŤ V DOTYKU</span><button type="button" class="ds-site-search-close" aria-label="Zavrieť">×</button></div><div class="ds-site-search-slot"></div><div class="ds-site-search-hints"></div></div>';
    document.body.appendChild(overlay);
    $('.ds-site-search-slot',overlay).appendChild(nativeSearch);

    var input=$('.search-input',nativeSearch);
    var submit=$('.search-form .btn',nativeSearch);
    if(submit){submit.textContent='';submit.insertAdjacentHTML('afterbegin',icons.search);submit.setAttribute('aria-label','Hľadať')}

    var hints=$('.ds-site-search-hints',overlay);
    hints.innerHTML=phrases.slice(0,5).map(function(p){return '<button type="button" data-q="'+esc(p)+'">'+esc(p)+'</button>'}).join('');
    hints.addEventListener('click',function(e){var b=e.target.closest('[data-q]');if(!b||!input)return;input.value=b.dataset.q;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()});

    if(input){
      var index=0;
      input.placeholder='Hľadať: '+phrases[0];
      setInterval(function(){if(input.value||document.activeElement===input)return;index=(index+1)%phrases.length;input.placeholder='Hľadať: '+phrases[index]},1900);
    }
    return {overlay:overlay,backdrop:backdrop,input:input};
  }

  function buildWishlist(){
    var backdrop=document.createElement('div');
    backdrop.id='ds-wishlist-backdrop';
    var drawer=document.createElement('aside');
    drawer.id='ds-wishlist-drawer';
    drawer.setAttribute('aria-hidden','true');
    drawer.innerHTML='<div class="ds-wishlist-head"><span>OBĽÚBENÉ</span><button type="button" aria-label="Zavrieť">×</button></div><div class="ds-wishlist-body"><p class="ds-wishlist-title">veci, ku ktorým sa chceš vrátiť.</p><p class="ds-wishlist-copy">Zatiaľ tu nič nemáš. Wishlist napojíme na produktové karty v ďalšom kroku.</p></div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    return {drawer:drawer,backdrop:backdrop,close:$('button',drawer)};
  }

  function popupVisible(el){
    if(!el)return false;
    if(el.getAttribute('aria-hidden')==='false')return true;
    if(el.hasAttribute('open'))return true;
    var s=getComputedStyle(el);
    return s.display!=='none'&&s.visibility!=='hidden'&&parseFloat(s.opacity||'1')>0;
  }

  function findLoginPopup(){return $('#login.login-widget,#login[role="dialog"],.user-action-login.popup-widget')}
  function findCartPopup(){return $('#cart-widget,.cart-widget.popup-widget,.user-action .cart-widget')}

  function mount(){
    if($('#ds-site-header'))return true;
    var sourceHeader=$('#header');
    var sourceNav=$('#navigation');
    if(!sourceHeader||!sourceNav)return false;
    var data=getData();
    if(!data.nav.length)return false;

    var custom=buildHeader(data);
    var wrapper=$('.overall-wrapper')||document.body;
    wrapper.insertBefore(custom,wrapper.firstChild);
    var search=buildSearch();
    var wishlist=buildWishlist();
    document.body.classList.add('ds-custom-header-ready');

    var announcement=$('.ds-site-announcement',custom);
    var newest=data.nav.find(function(x){return /novink|new|výpredaj|vypredaj|limit/i.test(x.text)});
    announcement.href=newest&&newest.href||'#';
    if(announcement.getAttribute('href')==='#')announcement.addEventListener('click',function(e){e.preventDefault()});

    function searchTop(){document.documentElement.style.setProperty('--ds-site-search-top',Math.max(0,Math.round(custom.getBoundingClientRect().bottom))+'px')}
    function sticky(){
      custom.classList.toggle('is-stuck',document.body.classList.contains('in-index')?scrollY>60:scrollY>18);
      searchTop();
    }
    function closeSearch(){document.body.classList.remove('ds-site-search-open')}
    function openWishlist(){document.body.classList.add('ds-wishlist-open');wishlist.drawer.setAttribute('aria-hidden','false')}
    function closeWishlist(){document.body.classList.remove('ds-wishlist-open');wishlist.drawer.setAttribute('aria-hidden','true')}

    /* Robust desktop submenu state in addition to CSS :hover. */
    $$('.ds-site-nav-item.has-submenu',custom).forEach(function(item){
      item.addEventListener('mouseenter',function(){item.classList.add('is-open')});
      item.addEventListener('mouseleave',function(){item.classList.remove('is-open')});
      item.addEventListener('focusin',function(){item.classList.add('is-open')});
      item.addEventListener('focusout',function(e){if(!item.contains(e.relatedTarget))item.classList.remove('is-open')});
    });

    var openSearch=$('.ds-site-search-open',custom);
    if(openSearch&&search){
      openSearch.addEventListener('click',function(){
        document.body.classList.remove('ds-site-mobile-open','ds-wishlist-open');
        document.body.classList.add('ds-site-search-open');
        searchTop();
        setTimeout(function(){if(search.input)search.input.focus()},40);
      });
      $('.ds-site-search-close',search.overlay).addEventListener('click',closeSearch);
      search.backdrop.addEventListener('click',closeSearch);
    }

    var wishlistBtn=$('.ds-site-wishlist',custom);
    wishlistBtn.addEventListener('click',function(){closeSearch();openWishlist()});
    wishlist.close.addEventListener('click',closeWishlist);
    wishlist.backdrop.addEventListener('click',closeWishlist);

    var accountBtn=$('.ds-site-account',custom);
    var cartBtn=$('.ds-site-cart',custom);
    var nativeAccount=data.nativeActions.accountTrigger;
    var nativeCart=data.nativeActions.cartTrigger;

    function openAccount(){
      closeSearch();closeWishlist();
      if(nativeAccount){nativeAccount.click();return}
      if(data.accountHref&&data.accountHref!=='#'){location.href=data.accountHref;return}
      location.href='/klient/';
    }
    function openCart(){
      closeSearch();closeWishlist();
      if(nativeCart){nativeCart.click();return}
      location.href=data.cartHref||'/kosik/';
    }

    accountBtn.addEventListener('click',openAccount);
    cartBtn.addEventListener('click',openCart);

    /* Fashion-shop style hover preview, using Shoptet's own widgets. */
    accountBtn.addEventListener('mouseenter',function(){
      if(!nativeAccount||popupVisible(findLoginPopup()))return;
      setTimeout(function(){if(accountBtn.matches(':hover')&&!popupVisible(findLoginPopup()))nativeAccount.click()},140);
    });
    cartBtn.addEventListener('mouseenter',function(){
      if(!nativeCart||popupVisible(findCartPopup()))return;
      setTimeout(function(){if(cartBtn.matches(':hover')&&!popupVisible(findCartPopup()))nativeCart.click()},140);
    });

    $('.ds-site-mobile-menu',custom).addEventListener('click',function(){closeSearch();closeWishlist();document.body.classList.toggle('ds-site-mobile-open')});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeSearch();closeWishlist();document.body.classList.remove('ds-site-mobile-open')}});
    addEventListener('scroll',sticky,{passive:true});
    addEventListener('resize',searchTop,{passive:true});
    sticky();
    return true;
  }

  function boot(){
    if(mount())return;
    var o=new MutationObserver(function(){if(mount())o.disconnect()});
    o.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){o.disconnect()},6000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();