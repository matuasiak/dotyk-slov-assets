/* DOTYK SLOV — tagged Instagram UGC v2
   This is NOT the brand's own feed.
   It expects tagged media from a server-side endpoint:
   window.DS_INSTAGRAM_TAGGED_ENDPOINT = 'https://your-worker.workers.dev/'

   Endpoint response:
   { items:[{id,media_url,thumbnail_url,permalink,media_type,caption,username,timestamp}] }

   Optional shoppable hotspots:
   window.DS_IG_SHOP_MAP = {
     '<media-id>': [{x:52,y:61,href:'/produkt/',label:'Produkt'}]
   }
*/
(function(){
  'use strict';
  var ROOT='ds-home-instagram';
  var IG='https://www.instagram.com/dotykslov/';
  var ENDPOINT=window.DS_INSTAGRAM_TAGGED_ENDPOINT||window.DS_INSTAGRAM_FEED_ENDPOINT||'';

  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function ensureCss(){var h='https://matuasiak.github.io/dotyk-slov-assets/css/home-instagram.css?v=2';var l=document.querySelector('link[data-ds-ig-css]');if(l){l.href=h;return}l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.dsIgCss='1';document.head.appendChild(l)}

  async function load(){
    if(!ENDPOINT)return [];
    try{
      var r=await fetch(ENDPOINT,{cache:'no-store'});
      if(!r.ok)throw 0;
      var d=await r.json();
      var a=Array.isArray(d)?d:d.items;
      if(!Array.isArray(a))throw 0;
      return a.slice(0,8).map(function(x){
        return{
          id:String(x.id||''),
          media_url:x.thumbnail_url||x.media_url||'',
          permalink:x.permalink||IG,
          caption:x.caption||'',
          username:x.username||'',
          timestamp:x.timestamp||''
        };
      }).filter(function(x){return x.media_url&&x.permalink});
    }catch(_){return []}
  }

  function hotspots(item){
    var map=window.DS_IG_SHOP_MAP||{};
    var hs=map[item.id]||[];
    if(!hs.length)return'';
    return hs.map(function(h){
      return '<a class="ds-ig-hotspot" href="'+esc(h.href||item.permalink)+'" aria-label="'+esc(h.label||'Pozrieť produkt')+'" style="left:'+Number(h.x||50)+'%;top:'+Number(h.y||50)+'%">+</a>';
    }).join('');
  }

  function tile(item,i){
    var user=item.username?'@'+item.username:'označené na Instagrame';
    return '<article class="ds-ig-tile ds-ig-tile--'+(i+1)+'">'+
      '<a class="ds-ig-image" href="'+esc(item.permalink)+'" target="_blank" rel="noopener">'+
        '<img src="'+esc(item.media_url)+'" alt="'+esc(item.caption||user)+'" loading="lazy" decoding="async">'+
        '<span class="ds-ig-user">'+esc(user)+' ↗</span>'+ 
      '</a>'+hotspots(item)+
    '</article>';
  }

  function emptyMarkup(){
    return '<div class="ds-ig-empty">'+
      '<div><span>UGC / ČAKÁ NA PREPOJENIE</span><strong>sem patria vaše fotky.<br>nie naše kampane.</strong></div>'+ 
      '<div><p>Keď nás niekto označí na Instagrame, zobrazí sa tu jeho príspevok. Bez kopírovania nášho vlastného feedu.</p><a href="'+IG+'" target="_blank" rel="noopener">Označiť @dotykslov ↗</a></div>'+ 
    '</div>';
  }

  async function build(){
    if(!document.body.classList.contains('in-index')||document.getElementById(ROOT))return true;
    var anchor=document.getElementById('ds-home-bestsellers')||document.getElementById('ds-new-arrivals-gallery');
    if(!anchor)return false;
    ensureCss();
    var items=await load();
    var s=document.createElement('section');s.id=ROOT;
    s.innerHTML='<div class="ds-ig-wrap">'+
      '<div class="ds-ig-head"><div><span>OZNAČILI STE NÁS / @DOTYKSLOV</span><h2>vy v Dotyku.</h2><p>Reálne fotky ľudí, ktorí nás označili. Žiadny druhý brand feed.</p></div><a href="'+IG+'" target="_blank" rel="noopener">Instagram ↗</a></div>'+ 
      (items.length?'<div class="ds-ig-grid">'+items.map(tile).join('')+'</div>':emptyMarkup())+
    '</div>';
    anchor.insertAdjacentElement('afterend',s);
    return true;
  }

  function boot(){var n=0;(function run(){Promise.resolve(build()).then(function(ok){if(ok)return;if(++n<20)setTimeout(run,350)})})()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
