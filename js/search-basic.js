(function(){
  'use strict';

  var SUGGESTIONS=['mám toho dosť','nevolaj mi','citovo nedostupný','overthinking','mikiny'];
  var BOOST_ORDER=['oblečenie','produkty podľa textu','doplnky'];

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function getTop(){
    var header=$('#ds-site-header');
    if(!header)return 104;
    return Math.max(0,Math.round(header.getBoundingClientRect().bottom))+8;
  }

  function getBoostCategories(){
    var links=[];

    $$('#ds-site-header .ds-site-nav-link').forEach(function(a){
      if(a&&a.href)links.push({text:clean(a.textContent),href:a.href});
    });

    if(!links.length){
      $$('#navigation .menu-level-1 > li > a[href]').forEach(function(a){
        links.push({text:clean(a.textContent),href:a.href});
      });
    }

    var seen={};
    links=links.filter(function(x){
      var k=norm(x.text);
      if(!k||seen[k])return false;
      seen[k]=1;
      return true;
    });

    var picked=[];
    BOOST_ORDER.forEach(function(wanted){
      var target=norm(wanted);
      var hit=links.find(function(x){return norm(x.text)===target||norm(x.text).indexOf(target)>=0});
      if(hit)picked.push(hit);
    });

    if(picked.length<3){
      links.forEach(function(x){
        if(picked.length>=3)return;
        if(!picked.some(function(y){return y.href===x.href}))picked.push(x);
      });
    }

    return picked.slice(0,3);
  }

  function extrasMarkup(){
    var cats=getBoostCategories();

    return ''+
      '<div class="ds-basic-search__extras">'+
        '<div class="ds-basic-search__group">'+
          '<span class="ds-basic-search__group-label">Skús</span>'+
          '<div class="ds-basic-search__chips">'+
            SUGGESTIONS.map(function(q){return '<button type="button" class="ds-basic-search__chip" data-search-q="'+esc(q)+'">'+esc(q)+'</button>'}).join('')+
          '</div>'+
        '</div>'+
        '<div class="ds-basic-search__group ds-basic-search__group--categories">'+
          '<span class="ds-basic-search__group-label">Objaviť</span>'+
          '<div class="ds-basic-search__category-links">'+
            cats.map(function(c,i){return '<a href="'+esc(c.href)+'" class="ds-basic-search__category"><span>'+esc(c.text)+(i<2?'<small>BOOST</small>':'')+'</span><b>→</b></a>'}).join('')+
          '</div>'+
        '</div>'+
      '</div>';
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
      '</form>'+extrasMarkup();
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

    panel.addEventListener('click',function(e){
      var chip=e.target.closest('[data-search-q]');
      if(!chip)return;
      input.value=chip.getAttribute('data-search-q')||'';
      input.focus({preventScroll:true});
    });

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
