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

  function moveOutsideShoptetWrapper(){
    var wrapper=$('.overall-wrapper');
    if(!wrapper||!wrapper.parentNode)return false;

    var header=$('#ds-site-header');
    if(header&&header.parentNode===wrapper){
      wrapper.parentNode.insertBefore(header,wrapper);
    }

    var hero=$('#ds-fashion-hero');
    if(hero&&hero.parentNode!==wrapper.parentNode){
      wrapper.parentNode.insertBefore(hero,wrapper);
    }

    return !!header;
  }

  function patch(){
    var legacy=$('#ds-header-patch-styles');
    if(legacy)legacy.remove();

    if(!moveOutsideShoptetWrapper())return false;

    replaceButton('.ds-site-cart','/kosik/');
    replaceButton('.ds-site-account','/klient/');
    return true;
  }

  if(!patch()){
    var o=new MutationObserver(function(){
      if(patch()&&$('#ds-fashion-hero'))o.disconnect();
    });
    o.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(function(){o.disconnect()},10000);
  }

  document.addEventListener('DotykFashionHeroReady',function(){
    moveOutsideShoptetWrapper();
  });
})();