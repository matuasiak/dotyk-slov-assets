/* DOTYK SLOV — footer redesign v3 / fashion anchor */
(function(){
  'use strict';

  var IG='https://www.instagram.com/dotykslov/';

  function $(s,r){return (r||document).querySelector(s)}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}

  function ensureCss(){
    var href='https://matuasiak.github.io/dotyk-slov-assets/css/footer-redesign.css?v=3';
    var old=document.querySelector('link[data-ds-footer-css]');
    if(old){old.href=href;return}
    var link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.setAttribute('data-ds-footer-css','1');
    document.head.appendChild(link);
  }

  function findMail(footer){
    var a=$('a[href^="mailto:"]',footer);
    return a&&a.href?a.href:'';
  }

  function build(){
    var footer=$('#footer');
    if(!footer)return false;

    ensureCss();
    footer.classList.remove('ds-footer-v2');
    footer.classList.add('ds-footer-v3');

    var legacy=$('.ds-footer-v2__top',footer);
    if(legacy)legacy.remove();

    if(!$('.ds-footer-v3__top',footer)){
      var mail=findMail(footer);
      var top=document.createElement('section');
      top.className='ds-footer-v3__top';
      top.setAttribute('aria-label','Dotyk Slov');
      top.innerHTML=''+
        '<div class="ds-footer-v3__top-inner">'+
          '<div class="ds-footer-v3__statement">'+
            '<span class="ds-footer-v3__eyebrow"><i></i> DOTYK SLOV</span>'+ 
            '<strong>nie všetko treba<br>povedať nahlas.</strong>'+ 
          '</div>'+ 
          '<div class="ds-footer-v3__actions">'+
            '<a href="'+IG+'" target="_blank" rel="noopener">Instagram <span>↗</span></a>'+ 
            (mail?'<a href="'+mail+'">Napíš nám <span>→</span></a>':'')+
          '</div>'+ 
        '</div>';
      footer.insertBefore(top,footer.firstChild);
    }

    if(!$('.ds-footer-v3__wordmark',footer)){
      var bottom=document.createElement('div');
      bottom.className='ds-footer-v3__wordmark';
      bottom.setAttribute('aria-hidden','true');
      bottom.innerHTML='<span>DOTYK SLOV</span>';
      footer.appendChild(bottom);
    }

    if(!$('.ds-footer-v3__micro',footer)){
      var micro=document.createElement('div');
      micro.className='ds-footer-v3__micro';
      micro.innerHTML='<div class="ds-footer-v3__micro-inner"><span>veci, ktoré ostali v hlave.</span><a href="#top" data-ds-footer-top>hore ↑</a></div>';
      footer.appendChild(micro);
      var topLink=$('[data-ds-footer-top]',micro);
      if(topLink)topLink.addEventListener('click',function(e){
        e.preventDefault();
        window.scrollTo({top:0,behavior:'smooth'});
      });
    }

    return true;
  }

  function boot(){
    var tries=0;
    (function run(){
      if(build())return;
      if(++tries<30)setTimeout(run,300);
    })();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
