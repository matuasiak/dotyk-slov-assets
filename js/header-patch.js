(function(){
  function $(s,r){return (r||document).querySelector(s)}

  function ensureAdaptiveLogoStyle(){
    if($('#ds-native-logo-colors'))return;
    var style=document.createElement('style');
    style.id='ds-native-logo-colors';
    style.textContent='\n'+
      '#ds-site-header .ds-site-logo img{filter:brightness(0) invert(1)!important;transition:filter .18s ease,opacity .18s ease;}\n'+
      '#ds-site-header.is-light .ds-site-logo img,body.ds-header-light #ds-site-header .ds-site-logo img{filter:brightness(0)!important;}\n';
    document.head.appendChild(style);
  }

  function replaceButton(selector,url){
    var old=$(selector);
    if(!old||old.dataset.dsPatchDone==='1')return;
    var fresh=old.cloneNode(true);
    fresh.dataset.dsPatchDone='1';
    old.replaceWith(fresh);
    fresh.addEventListener('click',function(e){
      e.preventDefault();
      document.body.classList.remove('ds-site-search-open','ds-wishlist-open');
      location.href=url;
    });
  }

  function patch(){
    var legacy=$('#ds-header-patch-styles');
    if(legacy)legacy.remove();
    if(!$('#ds-site-header'))return false;
    ensureAdaptiveLogoStyle();
    replaceButton('.ds-site-cart','/kosik/');
    replaceButton('.ds-site-account','/klient/');
    return true;
  }

  if(!patch()){
    var o=new MutationObserver(function(){if(patch())o.disconnect()});
    o.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){o.disconnect()},8000);
  }
})();