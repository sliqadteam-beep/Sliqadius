(()=>{
'use strict';
const BRAND='Skaysa', VERSION='2.9.22', HELP='0000000000';
const LOGO=`<svg viewBox="0 0 108 108" aria-hidden="true" focusable="false">
<defs><linearGradient id="sklg" x1="8" y1="7" x2="100" y2="103" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#B7DEFF"/><stop offset=".48" stop-color="#8ABFF4"/><stop offset="1" stop-color="#5F86DE"/>
</linearGradient></defs>
<path fill="url(#sklg)" d="M16 4h76a12 12 0 0 1 12 12v76a12 12 0 0 1-12 12H16A12 12 0 0 1 4 92V16A12 12 0 0 1 16 4Z"/>
<path fill="#25FFFFFF" d="M4 16A12 12 0 0 1 16 4h35C39 21 25 34 4 44Z"/>
<path d="M27 72C32 52 42 39 56 34C69 29 79 34 87 46" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<path d="M27 72C41 81 59 82 73 73C82 67 87 58 87 46" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
<path d="M37 61C48 51 64 50 77 60" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".92"/>
<circle cx="27" cy="72" r="6" fill="#fff"/><circle cx="56" cy="34" r="6" fill="#fff"/><circle cx="87" cy="46" r="6" fill="#fff"/>
</svg>`;
const helpNames={de:'Skaysa Hilfe',en:'Skaysa Help',es:'Ayuda de Skaysa',fr:'Aide Skaysa',it:'Aiuto Skaysa',pt:'Ajuda Skaysa',nl:'Skaysa Help',pl:'Pomoc Skaysa',tr:'Skaysa Yardım',uk:'Допомога Skaysa',ru:'Помощь Skaysa',ja:'Skaysa ヘルプ',ko:'Skaysa 도움말',zh:'Skaysa 帮助',ar:'مساعدة Skaysa'};
function lang(){try{return String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}catch(_){return'en'}}
function oldBrand(s){return String(s||'').replace(/\bQevyno\b/g,BRAND).replace(/\bSliqChat\b/g,BRAND)}
const st=document.createElement('style');st.id='skaysa310style';st.textContent=`
#conn{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
.q310helpLogo{display:grid!important;place-items:center!important;background:none!important;color:transparent!important;padding:0!important;overflow:hidden!important;border-radius:18px!important}
.q310helpLogo svg{width:100%;height:100%;display:block}
`;document.head.appendChild(st);
try{window.connectionBad=function(){const e=document.getElementById('conn');if(e){e.classList.remove('show');e.style.display='none'}}}catch(_){}
function helpPhone(){try{return String((typeof peer!=='undefined'&&peer&&peer.phone)||'')}catch(_){return''}}
function replaceSafeText(){
  const sels='.brand,.logo,.q27logo,.small,#sheetBack h2,#sheetBack p,.q299helpRow .q26name,.q299helpRow .q26preview,.q308title,.q308qrHint,.q308edit,.q308settings';
  document.querySelectorAll(sels).forEach(el=>{
    if(el.classList.contains('brand')||el.classList.contains('logo')||el.classList.contains('q27logo')){
      if(el.querySelector('b')||el.querySelector('.dot')) el.childNodes.forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent=BRAND});
      else el.textContent=BRAND;
    } else if(el.textContent) el.textContent=oldBrand(el.textContent);
  });
  document.title=BRAND;
  document.querySelectorAll('.small').forEach(el=>{if(/(?:Qevyno|SliqChat|Skaysa)\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`${BRAND} v${VERSION} • Android 8+`});
  const row=document.querySelector('.q299helpRow');
  if(row){
    const n=row.querySelector('.q26name');if(n)n.textContent=helpNames[lang()]||helpNames.en;
    row.querySelectorAll('.q305phone,.q299tag').forEach(x=>x.style.display='none');
    const a=row.querySelector('.q26avatar,.q299avatar,.q308helpLogo,[class*="avatar"]');
    if(a){a.classList.add('q310helpLogo');a.style.backgroundImage='none';a.innerHTML=LOGO}
  }
  const cn=document.getElementById('chatName');
  if(cn && /Qevyno|SliqChat/.test(cn.textContent||'')) cn.textContent=oldBrand(cn.textContent);
  if(helpPhone()===HELP){
    document.querySelectorAll('#messages .btext').forEach(x=>{x.textContent=oldBrand(x.textContent)});
  }
}
[0,120,420,1000,2200,4200].forEach(ms=>setTimeout(replaceSafeText,ms));
window.addEventListener('focus',replaceSafeText);
const people=document.getElementById('people');
if(people)new MutationObserver(()=>{requestAnimationFrame(()=>{const row=people.querySelector('.q299helpRow');if(row)replaceSafeText()})}).observe(people,{childList:true,subtree:false});
})();