(function(){
  function $(s,r){return (r||document).querySelector(s)}

  function installStyles(){
    if($('#ds-header-patch-styles')) return;
    var s=document.createElement('style');
    s.id='ds-header-patch-styles';
    s.textContent='html,body{max-width:100%!important;overflow-x:clip!important}#ds-site-search-backdrop{position:fixed!important;inset:0!important;width:auto!important;height:auto!important}#ds-site-search{position:fixed!important;left:0!important;right:0!important;width:auto!important;max-width:none!important;box-sizing:border-box!important}body.ds-site-search-open{overflow:hidden!important}body.ds-site-search-open .overall-wrapper{width:100%!important;max-width:100%!important;overflow:hidden!important}body.ds-site-search-open #footer{clear:both!important;float:none!important;position:relative!important;left:auto!important;right:auto!important;width:100%!important;max-width:100%!important;margin-left:0!important;margin-right:0!important}';
    document.head.appendChild(s);
  }

  function replaceButton(selector,url){
    var old=$(selector);
    if(!old||old.dataset.dsPatchDone==='1') return;
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
    installStyles();
    if(!$('#ds-site-header')) return false;
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