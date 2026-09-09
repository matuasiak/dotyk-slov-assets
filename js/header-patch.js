(function(){
  function $(s,r){return (r||document).querySelector(s)}

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