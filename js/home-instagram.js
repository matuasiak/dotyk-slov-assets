/* DOTYK SLOV — Instagram / shop the feed v1
   Set window.DS_INSTAGRAM_FEED_ENDPOINT to a server-side endpoint returning:
   { items:[{id,media_url,thumbnail_url,permalink,media_type,caption}] }
   Optional hotspot map: window.DS_IG_SHOP_MAP = { '<media-id>':[{x:50,y:50,href:'/produkt/',label:'Produkt'}] }
*/
(function(){
  'use strict';
  var ROOT='ds-home-instagram';
  var ASSET='https://matuasiak.github.io/dotyk-slov-assets/images/';
  var IG='https://www.instagram.com/dotykslov/';
  var ENDPOINT=window.DS_INSTAGRAM_FEED_ENDPOINT||'';
  var FALLBACK=[
    {id:'f1',media_url:ASSET+'p1.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f2',media_url:ASSET+'p2.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f3',media_url:ASSET+'p3.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f4',media_url:ASSET+'p4.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f5',media_url:ASSET+'story.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f6',media_url:ASSET+'promo1.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f7',media_url:ASSET+'promo2.jpg',permalink:IG,caption:'Dotyk Slov'},
    {id:'f8',media_url:ASSET+'hero.jpg',permalink:IG,caption:'Dotyk Slov'}
  ];
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function ensureCss(){var h='https://matuasiak.github.io/dotyk-slov-assets/css/home-instagram.css?v=1';var l=document.querySelector('link[data-ds-ig-css]');if(l){l.href=h;return}l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.dsIgCss='1';document.head.appendChild(l)}
  async function load(){if(!ENDPOINT)return FALLBACK;try{var r=await fetch(ENDPOINT,{cache:'no-store'});if(!r.ok)throw 0;var d=await r.json();var a=Array.isArray(d)?d:d.items;if(!Array.isArray(a)||!a.length)throw 0;return a.slice(0,8).map(function(x){return{id:String(x.id||''),media_url:x.thumbnail_url||x.media_url||'',permalink:x.permalink||IG,caption:x.caption||'Dotyk Slov'}}).filter(function(x){return x.media_url})}catch(_){return FALLBACK}}
  function hotspots(item){var map=window.DS_IG_SHOP_MAP||{};var hs=map[item.id]||[];if(!hs.length)return '<a class="ds-ig-hotspot ds-ig-hotspot--fallback" href="'+esc(item.permalink)+'" target="_blank" rel="noopener" aria-label="Pozrieť príspevok">+</a>';return hs.map(function(h){return '<a class="ds-ig-hotspot" href="'+esc(h.href||item.permalink)+'" aria-label="'+esc(h.label||'Pozrieť produkt')+'" style="left:'+Number(h.x||50)+'%;top:'+Number(h.y||50)+'%">+</a>'}).join('')}
  function tile(item,i){return '<article class="ds-ig-tile ds-ig-tile--'+(i+1)+'"><a class="ds-ig-image" href="'+esc(item.permalink)+'" target="_blank" rel="noopener"><img src="'+esc(item.media_url)+'" alt="'+esc(item.caption||'Dotyk Slov Instagram')+'" loading="lazy" decoding="async"></a>'+hotspots(item)+'</article>'}
  async function build(){if(!document.body.classList.contains('in-index')||document.getElementById(ROOT))return true;var anchor=document.getElementById('ds-home-bestsellers')||document.getElementById('ds-new-arrivals-gallery');if(!anchor)return false;ensureCss();var items=await load();var s=document.createElement('section');s.id=ROOT;s.innerHTML='<div class="ds-ig-wrap"><div class="ds-ig-head"><div><span>INSTAGRAM / @DOTYKSLOV</span><h2>videné vonku.<br>nie iba v hlave.</h2></div><a href="'+IG+'" target="_blank" rel="noopener">Sledovať @dotykslov ↗</a></div><div class="ds-ig-grid">'+items.map(tile).join('')+'</div></div>';anchor.insertAdjacentElement('afterend',s);return true}
  function boot(){var n=0;(function run(){Promise.resolve(build()).then(function(ok){if(ok)return;if(++n<20)setTimeout(run,350)})})()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();