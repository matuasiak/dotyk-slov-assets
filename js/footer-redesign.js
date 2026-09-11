/* DOTYK SLOV — footer redesign v4
   Clean light footer inspired by fashion/editorial retail.
   Rebuilds the visual footer from native Shoptet links so admin-managed URLs stay intact. */
(function(){
  'use strict';

  var ROOT_CLASS='ds-footer-v4';
  var IG='https://www.instagram.com/dotykslov/';

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return (v||'').replace(/\s+/g,' ').trim()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function uniqLinks(links){
    var seen={},out=[];
    links.forEach(function(a){
      if(!a||!a.href)return;
      var text=clean(a.textContent)||clean(a.getAttribute('aria-label'));
      if(!text)return;
      var key=a.href+'|'+text.toLowerCase();
      if(seen[key])return;
      seen[key]=1;
      out.push({href:a.href,text:text,target:a.target||''});
    });
    return out;
  }

  function ensureCss(){
    var href='https://matuasiak.github.io/dotyk-slov-assets/css/footer-redesign.css?v=4';
    var link=document.querySelector('link[data-ds-footer-css]');
    if(link){link.href=href;return}
    link=document.createElement('link');
    link.rel='stylesheet';link.href=href;link.setAttribute('data-ds-footer-css','1');
    document.head.appendChild(link);
  }

  function groupContainer(title,footer){
    var node=title.parentElement,depth=0;
    while(node&&node!==footer&&depth<4){
      var count=node.querySelectorAll('a[href]').length;
      if(count>0&&count<=18)return node;
      node=node.parentElement;depth++;
    }
    return title.parentElement;
  }

  function collectGroups(footer){
    var titles=$$('h2,h3,h4,.footer-title,.footer-header,.footer-heading,.custom-footer__title',footer);
    var groups=[],seen={};

    titles.forEach(function(title){
      if(title.closest('.ds-footer-v4__shell'))return;
      var name=clean(title.textContent);
      if(!name)return;
      var box=groupContainer(title,footer);
      if(!box)return;
      var links=uniqLinks($$('a[href]',box)).filter(function(x){
        return !/^mailto:|^tel:/i.test(x.href)&&!/instagram\.com|facebook\.com|tiktok\.com|youtube\.com/i.test(x.href);
      });
      if(!links.length)return;
      var key=name.toLowerCase();
      if(seen[key])return;
      seen[key]=1;
      groups.push({title:name,links:links.slice(0,12)});
    });

    if(groups.length<2){
      var all=uniqLinks($$('a[href]',footer)).filter(function(x){
        return !/^mailto:|^tel:/i.test(x.href)&&!/instagram\.com|facebook\.com|tiktok\.com|youtube\.com/i.test(x.href)&&x.text.length<60;
      });
      if(all.length){
        groups=[];
        var size=Math.max(4,Math.ceil(all.length/3));
        for(var i=0;i<all.length&&groups.length<3;i+=size){
          groups.push({title:groups.length===0?'Nakupovanie':groups.length===1?'Informácie':'Ďalej',links:all.slice(i,i+size)});
        }
      }
    }

    return groups.slice(0,4);
  }

  function contactData(footer){
    var mail=$('a[href^="mailto:"]',footer);
    var phone=$('a[href^="tel:"]',footer);
    var social=uniqLinks($$('a[href]',footer)).filter(function(x){return /instagram\.com|facebook\.com|tiktok\.com|youtube\.com/i.test(x.href)});
    if(!social.some(function(x){return /instagram\.com/i.test(x.href)}))social.unshift({href:IG,text:'Instagram',target:'_blank'});
    return {
      email:mail?{href:mail.href,text:clean(mail.textContent)||mail.href.replace(/^mailto:/,'')}:null,
      phone:phone?{href:phone.href,text:clean(phone.textContent)||phone.href.replace(/^tel:/,'')}:null,
      social:social.slice(0,4)
    };
  }

  function linkMarkup(link){
    return '<a href="'+esc(link.href)+'"'+(link.target?' target="'+esc(link.target)+'"':'')+(link.target==='_blank'?' rel="noopener"':'')+'>'+esc(link.text)+'</a>';
  }

  function groupMarkup(group,i){
    return '<details class="ds-footer-v4__group" data-ds-footer-group'+(i<3?' open':'')+'>'+ 
      '<summary>'+esc(group.title)+'<span>+</span></summary>'+ 
      '<div class="ds-footer-v4__links">'+group.links.map(linkMarkup).join('')+'</div>'+ 
    '</details>';
  }

  function build(){
    var footer=$('#footer');
    if(!footer)return false;
    if(footer.classList.contains(ROOT_CLASS))return true;

    ensureCss();
    var groups=collectGroups(footer);
    var contact=contactData(footer);
    var year=new Date().getFullYear();

    var shell=document.createElement('div');
    shell.className='ds-footer-v4__shell';
    shell.innerHTML=
      '<div class="ds-footer-v4__accent"></div>'+ 
      '<div class="ds-footer-v4__wrap">'+
        '<div class="ds-footer-v4__top">'+
          '<div class="ds-footer-v4__brand">'+
            '<span class="ds-footer-v4__brandname">DOTYK SLOV</span>'+ 
            '<h2>nie všetko treba<br>povedať nahlas.</h2>'+ 
          '</div>'+ 
          '<div class="ds-footer-v4__quick">'+
            '<span>NÁJDEŠ NÁS AJ TU</span>'+ 
            '<div>'+contact.social.map(function(x){return '<a href="'+esc(x.href)+'" target="_blank" rel="noopener">'+esc(x.text)+' ↗</a>'}).join('')+'</div>'+ 
          '</div>'+ 
        '</div>'+ 
        '<div class="ds-footer-v4__middle">'+
          '<div class="ds-footer-v4__groups">'+groups.map(groupMarkup).join('')+'</div>'+ 
          '<aside class="ds-footer-v4__contact">'+
            '<span>POTREBUJEŠ NIEČO?</span>'+ 
            '<p>napíš. ozveme sa, keď budeme vedieť čo povedať.</p>'+ 
            (contact.email?'<a href="'+esc(contact.email.href)+'">'+esc(contact.email.text)+' →</a>':'')+
            (contact.phone?'<a href="'+esc(contact.phone.href)+'">'+esc(contact.phone.text)+'</a>':'')+
          '</aside>'+ 
        '</div>'+ 
        '<div class="ds-footer-v4__bottom">'+
          '<span>© '+year+' DOTYK SLOV</span>'+ 
          '<span>navrhnuté doma. nosené všade.</span>'+ 
        '</div>'+ 
      '</div>';

    footer.insertBefore(shell,footer.firstChild);
    footer.classList.add(ROOT_CLASS);

    function sync(){
      var mobile=window.matchMedia('(max-width:767px)').matches;
      $$('[data-ds-footer-group]',shell).forEach(function(d){d.open=!mobile});
    }
    sync();
    window.addEventListener('resize',function(){clearTimeout(window.__dsFooterResize);window.__dsFooterResize=setTimeout(sync,120)},{passive:true});
    return true;
  }

  function boot(){
    var n=0;
    (function run(){if(build())return;if(++n<30)setTimeout(run,300)})();
  }

  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
