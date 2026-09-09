(function(){
  'use strict';

  var phrases=[
    'mám toho dosť',
    'nevolaj mi',
    'citovo nedostupný',
    'overthinking',
    'mikiny',
    'veci, ktoré nepovieš nahlas'
  ];

  var icons={
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    account:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>',
    heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.7a5.1 5.1 0 0 0-7.2 0L12 7.3l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2L12 21l8.8-8.1a5.1 5.1 0 0 0 0-7.2Z"/></svg>',
    bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function cleanText(value){return (value||'').replace(/\s+/g,' ').trim()}

  function getNavigationLinks(){
    var direct=$$('#navigation .menu-level-1 > li > a[href]').map(function(a){
      return {text:cleanText(a.childNodes[0]&&a.childNodes[0].textContent||a.textContent),href:a.href};
    }).filter(function(x){return x.text});

    if(direct.length>=3) return direct.slice(0,7);

    var parent=$('#navigation .menu-level-1 > li');
    if(parent){
      var second=$$(':scope > .menu-level-2 > li > a[href], :scope > ul > li > a[href]',parent).map(function(a){
        return {text:cleanText(a.childNodes[0]&&a.childNodes[0].textContent||a.textContent),href:a.href};
      }).filter(function(x){return x.text});
      if(second.length) return second.slice(0,7);
    }

    return direct;
  }

  function nativeData(){
    var logoImg=$('#header .site-name img');
    var logoLink=$('#header .site-name a');
    var cart=$('#header .navigation-buttons .cart-count');
    var cartCount=cart&&cart.querySelector('i');
    var account=$('#header .navigation-buttons a[data-target="login"], #header .navigation-buttons .login, #header a[href*="klient"], #header a[href*="customer"]');
    return {
      logoSrc:logoImg&&logoImg.src,
      logoAlt:logoImg&&logoImg.alt||'Dotyk Slov',
      homeHref:logoLink&&logoLink.href||'/',
      nav:getNavigationLinks(),
      cartHref:cart&&cart.href||'/kosik/',
      cartCount:cleanText(cartCount&&cartCount.textContent)||'',
      accountHref:account&&account.href||'#'
    };
  }

  function buildHeader(data){
    var el=document.createElement('header');
    el.id='ds-site-header';
    el.innerHTML=
      '<a class="ds-site-announcement" href="#"><span></span>NOVÝ DROP JE VONKU →</a>'+
      '<div class="ds-site-main">'+
        '<button class="ds-site-mobile-menu" type="button" aria-label="Menu">'+icons.menu+'</button>'+
        '<a class="ds-site-logo" href="'+data.homeHref+'">'+(data.logoSrc?'<img src="'+data.logoSrc+'" alt="'+data.logoAlt+'">':'DOTYK SLOV')+'</a>'+
        '<nav class="ds-site-nav" aria-label="Hlavná navigácia">'+data.nav.map(function(item){return '<a href="'+item.href+'">'+item.text+'</a>'}).join('')+'</nav>'+
        '<div class="ds-site-tools">'+
          '<button class="ds-site-search-open" type="button">'+icons.search+'<span>Hľadať</span></button>'+
          '<button class="ds-site-wishlist" type="button" aria-label="Obľúbené">'+icons.heart+'</button>'+
          '<a class="ds-site-account toggle-window" data-target="login" href="'+data.accountHref+'" aria-label="Môj účet">'+icons.account+'</a>'+
          '<a class="ds-site-cart" href="'+data.cartHref+'" aria-label="Košík">'+icons.bag+(data.cartCount?'<b>'+data.cartCount+'</b>':'')+'</a>'+
        '</div>'+
      '</div>'+
      '<div class="ds-site-mobile-panel">'+data.nav.map(function(item){return '<a href="'+item.href+'">'+item.text+'</a>'}).join('')+'</div>';
    return el;
  }

  function buildSearchOverlay(){
    var nativeSearch=$('#header .search');
    if(!nativeSearch) return null;

    var overlay=document.createElement('div');
    overlay.id='ds-site-search';
    overlay.innerHTML=
      '<div class="ds-site-search-inner">'+
        '<div class="ds-site-search-top"><span>HĽADAŤ V DOTYKU</span><button type="button" class="ds-site-search-close" aria-label="Zavrieť">×</button></div>'+
        '<div class="ds-site-search-slot"></div>'+
        '<div class="ds-site-search-hints"></div>'+
      '</div>';

    document.body.appendChild(overlay);
    $('.ds-site-search-slot',overlay).appendChild(nativeSearch);

    var input=$('.search-input',nativeSearch);
    var submit=$('.search-form .btn',nativeSearch);
    if(submit){
      submit.textContent='';
      submit.insertAdjacentHTML('afterbegin',icons.search);
      submit.setAttribute('aria-label','Hľadať');
    }

    var hints=$('.ds-site-search-hints',overlay);
    hints.innerHTML=phrases.slice(0,5).map(function(p){return '<button type="button" data-q="'+p+'">'+p+'</button>'}).join('');
    hints.addEventListener('click',function(e){
      var b=e.target.closest('[data-q]');
      if(!b||!input) return;
      input.value=b.dataset.q;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.focus();
    });

    var index=0;
    if(input){
      input.placeholder='Hľadať: '+phrases[0];
      window.setInterval(function(){
        if(input.value||document.activeElement===input) return;
        index=(index+1)%phrases.length;
        input.placeholder='Hľadať: '+phrases[index];
      },1900);
    }

    return overlay;
  }

  function mount(){
    if(!document.body.classList.contains('in-index')) return false;
    var hero=$('#ds-fashion-hero');
    if(!hero||$('#ds-site-header')) return !!$('#ds-site-header');

    var data=nativeData();
    if(!data.nav.length) return false;

    var header=buildHeader(data);
    hero.prepend(header);
    var searchOverlay=buildSearchOverlay();
    document.body.classList.add('ds-custom-header-ready');

    var announcement=$('.ds-site-announcement',header);
    var newest=data.nav.find(function(x){return /novink|new|výpredaj|vypredaj/i.test(x.text)});
    announcement.href=newest&&newest.href||'#';
    if(announcement.getAttribute('href')==='#') announcement.addEventListener('click',function(e){e.preventDefault()});

    function setSearchTop(){
      var rect=header.getBoundingClientRect();
      document.documentElement.style.setProperty('--ds-site-search-top',Math.max(0,Math.round(rect.bottom))+'px');
    }

    function updateSticky(){
      header.classList.toggle('is-stuck',window.scrollY>50);
      setSearchTop();
    }

    var openSearch=$('.ds-site-search-open',header);
    var closeSearch=searchOverlay&&$('.ds-site-search-close',searchOverlay);
    function close(){document.body.classList.remove('ds-site-search-open')}
    if(openSearch&&searchOverlay){
      openSearch.addEventListener('click',function(){
        document.body.classList.remove('ds-site-mobile-open');
        document.body.classList.add('ds-site-search-open');
        setSearchTop();
        window.setTimeout(function(){var i=$('.search-input',searchOverlay);if(i)i.focus()},40);
      });
      closeSearch.addEventListener('click',close);
    }

    var mobile=$('.ds-site-mobile-menu',header);
    mobile.addEventListener('click',function(){
      close();
      document.body.classList.toggle('ds-site-mobile-open');
    });

    document.addEventListener('keydown',function(e){if(e.key==='Escape'){close();document.body.classList.remove('ds-site-mobile-open')}});
    window.addEventListener('scroll',updateSticky,{passive:true});
    window.addEventListener('resize',setSearchTop,{passive:true});
    updateSticky();
    return true;
  }

  function waitForHero(){
    if(mount()) return;
    document.addEventListener('DotykFashionHeroReady',function(){mount()},{once:true});
    var observer=new MutationObserver(function(){if(mount()) observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
    window.setTimeout(function(){observer.disconnect()},6000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',waitForHero,{once:true});
  else waitForHero();
})();