/* DOTYK SLOV — modular homepage bestsellers v2 */
(function(){
  'use strict';
  var ROOT='ds-home-bestsellers';
  var MAX=4;
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function abs(v){if(!v)return'';try{return new URL(v,location.origin).href}catch(_){return v}}
  function ensureCss(){var h='https://matuasiak.github.io/dotyk-slov-assets/css/home-bestsellers.css?v=2';var l=document.querySelector('link[data-ds-best-css]');if(l){l.href=h;return}l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.dsBestCss='1';document.head.appendChild(l)}
  function image(img){if(!img)return'';var a=['data-src','data-lazy-src','data-original','data-lazy','src'];for(var i=0;i<a.length;i++){var v=clean(img.getAttribute(a[i]));if(v&&!/^data:|^blob:/i.test(v)&&!/placeholder|spacer|transparent/i.test(v))return abs(v)}return''}
  function nodes(doc){var out=[];['.products-block .product','.products .product','.product-item','[data-micro-product-id]'].forEach(function(s){$$(s,doc).forEach(function(n){if(out.indexOf(n)<0)out.push(n)})});return out}
  function product(n){var a=$('a.name[href],.name a[href],.p-name a[href],.p-in-in a[href],.product-name a[href],h2 a[href],h3 a[href]',n)||$('a[href]',n);if(!a)return null;var name=clean(($('[data-micro="name"],.name,.p-name,.p-in-in,.product-name,h2,h3',n)||{}).textContent)||clean(a.title)||clean(a.textContent);var price=clean(($('.price-final strong,.price-final,.p-final-price,[data-micro="price"],.price',n)||{}).textContent);var img=image($('img',n));if(!name||!img)return null;return{name:name,price:price,href:abs(a.href),image:img}}
  function uniq(ns){var s={},o=[];ns.forEach(function(n){if(n.closest&&n.closest('#ds-new-arrivals-gallery,#'+ROOT))return;var p=product(n);if(!p||s[p.href])return;s[p.href]=1;o.push(p)});return o}
  function bestHref(){var names=['bestsellery','najpredávanejšie','najpredavanejsie','top produkty'];var links=$$('#ds-site-header a[href],#navigation a[href],#ds-home-discovery a[href]');for(var i=0;i<links.length;i++){var t=norm(links[i].textContent);if(names.some(function(x){return t===norm(x)||t.indexOf(norm(x))>=0}))return links[i].href}return''}
  async function fetchDoc(url){if(!url)return null;try{var r=await fetch(url,{credentials:'same-origin',cache:'no-store'});if(!r.ok)return null;return new DOMParser().parseFromString(await r.text(),'text/html')}catch(_){return null}}
  async function load(){var href=bestHref(),items=[];if(href){var d=await fetchDoc(href);if(d)items=uniq(nodes(d))}if(items.length<MAX){var d2=await fetchDoc('/bestsellery/');if(d2){var f=uniq(nodes(d2));if(f.length){items=f;href=href||abs('/bestsellery/')}}}if(items.length<MAX){uniq(nodes(document)).forEach(function(p){if(items.length<MAX&&!items.some(function(x){return x.href===p.href}))items.push(p)})}return{href:href,items:items.slice(0,MAX)}}
  function card(p,i){return '<a class="ds-best-card" href="'+esc(p.href)+'"><span class="ds-best-card__media"><img src="'+esc(p.image)+'" alt="'+esc(p.name)+'" loading="lazy" decoding="async"></span><span class="ds-best-card__meta"><span class="ds-best-card__code">DS / 0'+(i+1)+'</span><strong>'+esc(p.name)+'</strong>'+(p.price?'<span>'+esc(p.price)+'</span>':'')+'</span></a>'}
  async function build(){if(!document.body.classList.contains('in-index')||document.getElementById(ROOT))return true;var anchor=document.getElementById('ds-new-arrivals-gallery');if(!anchor)return false;ensureCss();var d=await load();if(!d.items.length)return true;var s=document.createElement('section');s.id=ROOT;s.innerHTML='<div class="ds-best-wrap"><div class="ds-best-head"><div><span>BESTSELLERY</span><h2>veci, ku ktorým sa ľudia vracajú.</h2></div>'+(d.href?'<a href="'+esc(d.href)+'">Pozrieť všetky →</a>':'')+'</div><div class="ds-best-grid">'+d.items.map(card).join('')+'</div></div>';anchor.insertAdjacentElement('afterend',s);return true}
  function boot(){var n=0;(function run(){Promise.resolve(build()).then(function(ok){if(ok)return;if(++n<20)setTimeout(run,350)})})()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
