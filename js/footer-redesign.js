/* DOTYK SLOV — modular footer redesign v1 */
(function(){
  'use strict';
  var IG='https://www.instagram.com/dotykslov/';
  function $(s,r){return (r||document).querySelector(s)}
  function ensureCss(){var h='https://matuasiak.github.io/dotyk-slov-assets/css/footer-redesign.css?v=1';var l=document.querySelector('link[data-ds-footer-css]');if(l){l.href=h;return}l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.dsFooterCss='1';document.head.appendChild(l)}
  function build(){var f=$('#footer');if(!f)return false;ensureCss();f.classList.add('ds-footer-v2');if(!$('.ds-footer-v2__top',f)){var t=document.createElement('div');t.className='ds-footer-v2__top';t.innerHTML='<div class="ds-footer-v2__inner"><div><span>DOTYK SLOV</span><strong>nie všetko treba povedať nahlas.</strong></div><a href="'+IG+'" target="_blank" rel="noopener">@dotykslov ↗</a></div>';f.insertBefore(t,f.firstChild)}return true}
  function boot(){var n=0;(function run(){if(build())return;if(++n<30)setTimeout(run,300)})()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();