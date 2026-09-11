/* DOTYK SLOV — homepage transitions v1
   Optional rhythm layer between independent homepage modules.
   Remove this script to remove all separators without touching sections.

   Optional video:
   window.DS_HOME_SEPARATOR_VIDEO = 'https://.../separator.mp4';
*/
(function(){
  'use strict';
  var CSS='https://matuasiak.github.io/dotyk-slov-assets/css/home-transitions.css?v=1';
  var IMAGE='https://matuasiak.github.io/dotyk-slov-assets/images/promo1.jpg';
  var VIDEO=window.DS_HOME_SEPARATOR_VIDEO||'';
  function $(s){return document.querySelector(s)}
  function ensureCss(){var l=document.querySelector('link[data-ds-transitions-css]');if(l){l.href=CSS;return}l=document.createElement('link');l.rel='stylesheet';l.href=CSS;l.dataset.dsTransitionsCss='1';document.head.appendChild(l)}
  function quote(){var el=document.createElement('div');el.id='ds-transition-quote';el.className='ds-home-transition ds-home-transition--quote';el.innerHTML='<div><span>DOTYK SLOV</span><strong>nie všetko treba povedať nahlas.</strong><span>WEAR THE THOUGHT</span></div>';return el}
  function media(){var el=document.createElement('section');el.id='ds-transition-media';el.className='ds-home-transition ds-home-transition--media';var m=VIDEO?'<video autoplay muted loop playsinline preload="metadata" poster="'+IMAGE+'"><source src="'+VIDEO+'" type="video/mp4"></video>':'<img src="'+IMAGE+'" alt="Dotyk Slov editorial" loading="lazy" decoding="async">';el.innerHTML=m+'<span class="ds-home-transition__shade"></span><div class="ds-home-transition__caption"><span>DOTYK / OUTSIDE</span><strong>to, čo ostalo v hlave,<br>išlo von.</strong></div>';return el}
  function index(){var el=document.createElement('div');el.id='ds-transition-index';el.className='ds-home-transition ds-home-transition--index';el.innerHTML='<div><span>MYŠLIENKY</span><i></i><span>ĽUDIA</span><i></i><span>OBLEČENIE</span><i></i><span>MOOD</span></div>';return el}
  function place(){if(!document.body.classList.contains('in-index'))return true;ensureCss();var n=$('#ds-new-arrivals-gallery'),b=$('#ds-home-bestsellers'),i=$('#ds-home-instagram'),w=$('#ds-home-newsletter');if(n&&b&&!$('#ds-transition-quote'))b.insertAdjacentElement('beforebegin',quote());if(b&&i&&!$('#ds-transition-media'))i.insertAdjacentElement('beforebegin',media());if(i&&w&&!$('#ds-transition-index'))w.insertAdjacentElement('beforebegin',index());return !!(n&&b&&i&&w)}
  function boot(){var tries=0;(function run(){if(place())return;if(++tries<35)setTimeout(run,300)})();var obs=new MutationObserver(place);obs.observe(document.documentElement,{childList:true,subtree:true});setTimeout(function(){obs.disconnect()},12000)}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
