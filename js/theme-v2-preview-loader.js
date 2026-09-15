/* DOTYK SLOV — Theme v2 local preview loader
   Safe production behavior: does nothing unless ds-preview=1 was enabled in this browser.
   Disable with ?ds-preview=0.
*/
(function(){
  'use strict';

  var KEY='ds-theme-v2-preview';
  var params=new URLSearchParams(window.location.search);
  var requested=params.get('ds-preview');

  if(requested==='0'){
    try{localStorage.removeItem(KEY)}catch(_){ }
    return;
  }

  if(requested==='1'){
    try{localStorage.setItem(KEY,'1')}catch(_){ }
  }

  var enabled=false;
  try{enabled=localStorage.getItem(KEY)==='1'}catch(_){enabled=requested==='1'}
  if(!enabled)return;

  window.DS_THEME_PREVIEW=true;
  window.DS_BUNDLED_THEME=true;

  var SELF='theme-v2-preview-loader.js';
  var ASSET_ROOT='matuasiak.github.io/dotyk-slov-assets/';

  function assetUrl(el){
    return String((el&&((el.getAttribute&&el.getAttribute('href'))||(el.getAttribute&&el.getAttribute('src'))))||'');
  }

  function isLegacyAsset(el){
    if(!el||el.nodeType!==1)return false;
    var tag=(el.tagName||'').toLowerCase();
    if(tag!=='link'&&tag!=='script')return false;
    var url=assetUrl(el);
    return url.indexOf(ASSET_ROOT)!==-1 && url.indexOf(SELF)===-1;
  }

  function removeLegacy(root){
    if(!root)return;
    if(isLegacyAsset(root)){
      root.remove();
      return;
    }
    if(!root.querySelectorAll)return;
    Array.prototype.forEach.call(root.querySelectorAll('link[href],script[src]'),function(el){
      if(isLegacyAsset(el))el.remove();
    });
  }

  removeLegacy(document);

  var observer=new MutationObserver(function(records){
    records.forEach(function(record){
      Array.prototype.forEach.call(record.addedNodes||[],removeLegacy);
    });
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  function badge(text,error){
    var old=document.getElementById('ds-v2-preview-badge');
    if(old)old.remove();
    var el=document.createElement('div');
    el.id='ds-v2-preview-badge';
    el.textContent=text;
    el.style.cssText='position:fixed;right:12px;bottom:12px;z-index:2147483647;padding:8px 11px;background:'+(error?'#b42318':'#11110f')+';color:#f4f2ed;font:700 10px/1.2 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;border-radius:999px;box-shadow:none;';
    (document.body||document.documentElement).appendChild(el);
  }

  function start(){
    document.documentElement.classList.add('ds-theme-v2-preview');
    badge('Dotyk v2 / local');

    var script=document.createElement('script');
    script.type='module';
    script.src='http://127.0.0.1:5173/src/theme/main.js';
    script.setAttribute('data-ds-v2-local','1');
    script.onerror=function(){badge('V2 localhost nejde',true)};
    document.head.appendChild(script);
  }

  if(document.head)start();
  else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
