/* DOTYK SLOV — modular newsletter v1 */
(function(){
  'use strict';
  var ROOT='ds-home-newsletter';
  function $(s,r){return (r||document).querySelector(s)}
  function ensureCss(){var h='https://matuasiak.github.io/dotyk-slov-assets/css/home-newsletter.css?v=1';var l=document.querySelector('link[data-ds-news-css]');if(l){l.href=h;return}l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.dsNewsCss='1';document.head.appendChild(l)}
  function moveForm(root){var slot=$('[data-ds-news-slot]',root);if(!slot)return false;var form=$('#footer .newsletter form,#footer form[action*="newsletter"],#footer form[action*="subscribe"],.newsletter form');if(!form||form.closest('#'+ROOT))return false;var wrap=form.closest('.newsletter')||form.parentElement;slot.innerHTML='';slot.appendChild(form);if(wrap&&wrap!==form&&wrap.closest('#footer'))wrap.style.setProperty('display','none','important');return true}
  function build(){if(!document.body.classList.contains('in-index')||document.getElementById(ROOT))return true;var anchor=document.getElementById('ds-home-instagram')||document.getElementById('ds-home-bestsellers')||document.getElementById('ds-new-arrivals-gallery');if(!anchor)return false;ensureCss();var s=document.createElement('section');s.id=ROOT;s.innerHTML='<div class="ds-news-wrap"><div class="ds-news-copy"><span>NEWSLETTER / OBČAS</span><h2>len keď máme<br>čo povedať.</h2><p>Nový drop, limitka alebo niečo, čo nechcelo zostať iba v hlave.</p></div><div class="ds-news-form" data-ds-news-slot><p>Newsletter sa načítava…</p></div></div>';anchor.insertAdjacentElement('afterend',s);moveForm(s);return true}
  function boot(){var n=0;(function run(){var ok=build();if(ok){var r=document.getElementById(ROOT);if(r&&!moveForm(r)&&++n<20)setTimeout(run,350);return}if(++n<20)setTimeout(run,350)})()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();