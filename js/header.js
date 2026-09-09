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
  function text(v){return (v||'').replace(/\s+/g,' ').trim()}
  function esc(v){return String(v||'').replace(/[&<>'"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]})}

  function getNav(){
    return $$('#navigation .menu-level-1 > li > a[href]').map(function(a){
      var clone=a.cloneNode(true);
      clone.querySelectorAll('.submenu-arrow,svg,i').forEach(function(n){n.remove()});
      return {text:text(clone.textContent),href:a.href};
    }).filter(function(x){return x.text}).slice(0,7);
  }

  function getData(){
    var logoImg=$('#header .site-name img');
    var logoLink=$('#header .site-name a');
    var cart=$('#header .navigation-buttons .cart-count');
    var cartCount=cart&&$('i',cart);
    var account=$('#header .navigation-buttons a[data-target="login"],#header .navigation-buttons .login,#header a[href*="klient"],#header a[href*="customer"]');
    return {
      logoSrc:logoImg&&logoImg.src,
      logoAlt:logoImg&&logoImg.alt||'Dotyk Slov',
      homeHref:logoLink&&logoLink.href||'/',
      nav:getNav(),
      cartHref:cart&&cart.href||'/kosik/',
      cartCount:text(cartCount&&cartCount.textContent),
      accountHref:account&&account.href||'#'
    };
  }

  function buildHeader(data){
    var h=document.createElement('header');
    h.id='ds-site-header';
    var path=location.pathname.replace(/\/$/,'')||'/';
    h.innerHTML=
      '<a class="ds-site-announcement" href="#"><span></span>NOVÝ DROP JE VONKU →</a>'+
      '<div class="ds-site-main">'+
        '<button class="ds-site-mobile-menu" type="button" aria-label="Menu">'+icons.menu+'</button>'+
        '<a class="ds-site-logo" href="'+esc(data.homeHref)+'">'+(data.logoSrc?'<img src="'+esc(data.logoSrc)+'" alt="'+esc(data.logoAlt)+'">':'DOTYK SLOV')+'</a>'+
        '<nav class="ds-site-nav" aria-label="Hlavná navigácia">'+data.nav.map(function(item){var active=(new URL(item.href,location.href).pathname.replace(/\/$/,'')||'/')===path?' is-active':'';return '<a class="'+active+'" href="'+esc(item.href)+'">'+esc(item.text)+'</a>'}).join('')+'</nav>'+
        '<div class="ds-site-tools">'+
          '<button class="ds-site-search-open" type="button">'+icons.search+'<span>Hľadať</span></button>'+
          '<button class="ds-site-wishlist" type="button" aria-label="Obľúbené">'+icons.heart+'</button>'+
          '<a class="ds-site-account toggle-window" data-target="login" href="'+esc(data.accountHref)+'" aria-label="Môj účet">'+icons.account+'</a>'+
          '<a class="ds-site-cart" href="'+esc(data.cartHref)+'" aria-label="Košík">'+icons.bag+(data.cartCount?'<b>'+esc(data.cartCount)+'</b>':'')+'</a>'+
        '</div>'+
      '</div>'+
      '<div class="ds-site-mobile-panel">'+data.nav.map(function(item){return '<a href="'+esc(item.href)+'">'+esc(item.text)+'</a>'}).join('')+'</div>';
    return h;
  }

  function buildSearch(){
    var nativeSearch=$('#header .search');
    if(!nativeSearch) return null;
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
    return overlay;
  }

  function mount(){
    if($('#ds-site-header')) return true;
    var sourceHeader=$('#header');
    var sourceNav=$('#navigation');
    if(!sourceHeader||!sourceNav) return false;
    var data=getData();
    if(!data.nav.length) return false;

    var custom=buildHeader(data);
    var wrapper=$('.overall-wrapper')||document.body;
    wrapper.insertBefore(custom,wrapper.firstChild);
    var searchOverlay=buildSearch();
    document.body.classList.add('ds-custom-header-ready');

    var announcement=$('.ds-site-announcement',custom);
    var newest=data.nav.find(function(x){return /novink|new|výpredaj|vypredaj|limit/i.test(x.text)});
    announcement.href=newest&&newest.href||'#';
    if(announcement.getAttribute('href')==='#') announcement.addEventListener('click',function(e){e.preventDefault()});

    function searchTop(){document.documentElement.style.setProperty('--ds-site-search-top',Math.max(0,Math.round(custom.getBoundingClientRect().bottom))+'px')}
    function sticky(){
      if(document.body.classList.contains('in-index')) custom.classList.toggle('is-stuck',scrollY>60);
      else custom.classList.toggle('is-stuck',scrollY>18);
      searchTop();
    }
    function closeSearch(){document.body.classList.remove('ds-site-search-open')}

    var open=$('.ds-site-search-open',custom);
    var close=searchOverlay&&$('.ds-site-search-close',searchOverlay);
    if(open&&searchOverlay){open.addEventListener('click',function(){document.body.classList.remove('ds-site-mobile-open');document.body.classList.add('ds-site-search-open');searchTop();setTimeout(function(){var i=$('.search-input',searchOverlay);if(i)i.focus()},40)});close.addEventListener('click',closeSearch)}

    $('.ds-site-mobile-menu',custom).addEventListener('click',function(){closeSearch();document.body.classList.toggle('ds-site-mobile-open')});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeSearch();document.body.classList.remove('ds-site-mobile-open')}});
    addEventListener('scroll',sticky,{passive:true});
    addEventListener('resize',searchTop,{passive:true});
    sticky();
    return true;
  }

  function boot(){
    if(mount()) return;
    var o=new MutationObserver(function(){if(mount())o.disconnect()});
    o.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){o.disconnect()},6000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();