(function(){'use strict';
var SWIPER_JS='https://cdn.jsdelivr.net/npm/swiper@14.2.0/swiper-bundle.min.js';
var SWIPER_CSS='https://cdn.jsdelivr.net/npm/swiper@14.2.0/swiper-bundle.min.css';
var ASSET='https://matuasiak.github.io/dotyk-slov-assets/images/';
var slides=[
  {bg:'#171716',image:'hero.jpg',word:'DOTYK',kicker:'NEW DROP',title:'veci, ktoré sa ťažko hovoria.',text:'Preto ich niekedy radšej nosíme.',cta:'Objaviť kolekciu',href:'#'},
  {bg:'#20201e',image:'story.jpg',word:'OVERTHINK',kicker:'MOOD 02',title:'mám toho dosť. esteticky.',text:'Nie všetko treba povedať nahlas.',cta:'Pozrieť novinky',href:'#'},
  {bg:'#151515',image:'promo1.jpg',word:'FEELINGS',kicker:'REAL FEELINGS',title:'niekedy tričko povie viac.',text:'Pre ľudí, ktorí cítia priveľa a hovoria tak akurát.',cta:'Pozrieť tričká',href:'#'},
  {bg:'#23181b',image:'promo2.jpg',word:'NOT SORRY',kicker:'LIMITED',title:'citovo nedostupný. ale milý.',text:'Malý chaos. Dobrý outfit.',cta:'Objaviť drop',href:'#'}
];
function loadSwiper(){if(window.Swiper)return Promise.resolve(window.Swiper);if(!document.querySelector('link[data-ds-swiper]')){var l=document.createElement('link');l.rel='stylesheet';l.href=SWIPER_CSS;l.dataset.dsSwiper='1';document.head.append(l)}return new Promise(function(resolve,reject){var old=document.querySelector('script[data-ds-swiper]');if(old){old.addEventListener('load',function(){resolve(window.Swiper)},{once:true});old.addEventListener('error',reject,{once:true});return}var s=document.createElement('script');s.src=SWIPER_JS;s.async=true;s.dataset.dsSwiper='1';s.onload=function(){resolve(window.Swiper)};s.onerror=reject;document.head.append(s)})}
function slideHtml(s,i){return '<div class="swiper-slide" style="--slide-bg:'+s.bg+'">'+
  '<div class="ds-fs-bgword" data-swiper-parallax="22%" data-swiper-parallax-opacity="0.25">'+s.word+'</div>'+
  '<div class="ds-fs-image-wrap" data-swiper-parallax="-16%" data-swiper-parallax-scale="0.93"><img src="'+ASSET+s.image+'" alt="" loading="lazy"></div>'+
  '<div class="ds-fs-overlay"></div>'+
  '<div class="ds-fs-copy" data-swiper-parallax="-10%" data-swiper-parallax-opacity="0"><span class="ds-fs-kicker">'+s.kicker+'</span><h2>'+s.title+'</h2><p>'+s.text+'</p><a class="ds-fs-cta" href="'+s.href+'">'+s.cta+' →</a></div>'+
  '<div class="ds-fs-side" data-swiper-parallax="12%">nie všetko treba povedať nahlas.</div>'+
  '<div class="ds-fs-index">0'+(i+1)+' — DOTYK SLOV</div>'+
'</div>'}
function mount(){
  if(!document.body.classList.contains('in-index')||document.getElementById('ds-fashion-hero'))return;
  var native=document.querySelector('.banners-row');
  if(!native)return;
  var hero=document.createElement('section');
  hero.id='ds-fashion-hero';
  hero.setAttribute('aria-label','Dotyk Slov campaign');
  hero.innerHTML='<div class="swiper ds-fs-swiper"><div class="swiper-wrapper">'+slides.map(slideHtml).join('')+'</div><div class="ds-fs-nav"><button class="ds-fs-button ds-fs-prev" type="button" aria-label="Predchádzajúci slide"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><div class="ds-fs-fraction"><strong>01</strong>&nbsp;/&nbsp;<span>'+String(slides.length).padStart(2,'0')+'</span></div><button class="ds-fs-button ds-fs-next" type="button" aria-label="Ďalší slide"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div></div>';
  native.parentNode.insertBefore(hero,native);
  document.body.classList.add('ds-fashion-hero-mounted');
  document.dispatchEvent(new CustomEvent('DotykFashionHeroReady'));

  loadSwiper().then(function(Swiper){
    var current=hero.querySelector('.ds-fs-fraction strong');
    var slider=new Swiper(hero.querySelector('.ds-fs-swiper'),{
      loop:true,
      speed:1150,
      slidesPerView:1,
      grabCursor:true,
      watchSlidesProgress:true,
      parallax:true,
      effect:'creative',
      creativeEffect:{
        limitProgress:2,
        prev:{translate:['-22%',0,-320],scale:.94,opacity:0},
        next:{translate:['100%',0,0],scale:1,opacity:1}
      },
      keyboard:{enabled:true,onlyInViewport:true},
      autoplay:{delay:5200,disableOnInteraction:false,pauseOnMouseEnter:true},
      navigation:{prevEl:hero.querySelector('.ds-fs-prev'),nextEl:hero.querySelector('.ds-fs-next')},
      on:{
        init:function(sw){current.textContent=String(sw.realIndex+1).padStart(2,'0')},
        slideChange:function(sw){current.textContent=String(sw.realIndex+1).padStart(2,'0')}
      }
    });
    hero.dsFashionSwiper=slider;
  }).catch(function(){hero.querySelectorAll('.swiper-slide').forEach(function(x,i){x.style.display=i===0?'block':'none'})});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount,{once:true}):mount();
})();