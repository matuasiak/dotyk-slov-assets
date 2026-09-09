(function(){
  'use strict';

  function $(s,r){return (r||document).querySelector(s)}

  function getTop(){
    var header=$('#ds-site-header');
    if(!header)return 104;
    return Math.max(0,Math.round(header.getBoundingClientRect().bottom))+8;
  }

  function build(){
    var oldOverlay=$('#ds-site-search');
    var oldBackdrop=$('#ds-site-search-backdrop');
    if(oldOverlay)oldOverlay.remove();
    if(oldBackdrop)oldBackdrop.remove();

    var oldTrigger=$('.ds-site-search-open');
    if(!oldTrigger)return false;

    /* Clone strips every previous search listener from header.js/search-mega. */
    var trigger=oldTrigger.cloneNode(true);
    oldTrigger.replaceWith(trigger);

    var panel=document.createElement('div');
    panel.id='ds-basic-search';
    panel.setAttribute('aria-hidden','true');
    panel.innerHTML=''+
      '<div class="ds-basic-search__head">'+
        '<p class="ds-basic-search__label">HĽADAŤ V DOTYKU</p>'+
        '<button class="ds-basic-search__close" type="button" aria-label="Zavrieť">×</button>'+
      '</div>'+
      '<form class="ds-basic-search__form" action="/vyhladavanie/" method="get" role="search">'+
        '<input class="ds-basic-search__input" type="search" name="string" placeholder="Hľadať" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" inputmode="search" enterkeyhint="search">'+
        '<button class="ds-basic-search__submit" type="submit" aria-label="Hľadať">'+
          '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>'+
        '</button>'+
      '</form>';
    document.body.appendChild(panel);

    var input=$('.ds-basic-search__input',panel);
    var close=$('.ds-basic-search__close',panel);

    function syncTop(){
      document.documentElement.style.setProperty('--ds-basic-search-top',getTop()+'px');
    }

    function open(){
      syncTop();
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden','false');
      trigger.setAttribute('aria-expanded','true');
      setTimeout(function(){input.focus({preventScroll:true})},30);
    }

    function shut(){
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden','true');
      trigger.setAttribute('aria-expanded','false');
    }

    trigger.setAttribute('aria-controls','ds-basic-search');
    trigger.setAttribute('aria-expanded','false');
    trigger.addEventListener('click',function(e){
      e.preventDefault();
      if(panel.classList.contains('is-open'))shut();else open();
    });

    close.addEventListener('click',shut);

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape')shut();
    });

    document.addEventListener('pointerdown',function(e){
      if(!panel.classList.contains('is-open'))return;
      if(panel.contains(e.target)||trigger.contains(e.target))return;
      shut();
    },true);

    addEventListener('resize',syncTop,{passive:true});
    addEventListener('scroll',syncTop,{passive:true});
    syncTop();
    return true;
  }

  function boot(){
    if(build())return;
    var observer=new MutationObserver(function(){
      if(build())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){observer.disconnect()},8000);
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
