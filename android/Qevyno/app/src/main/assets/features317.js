(()=>{
'use strict';
if(window.__skaysa317Installed)return;
window.__skaysa317Installed=true;

const VERSION='2.9.44';
const D=id=>document.getElementById(id);

const HELP_LOGO=`<svg viewBox="0 0 108 108" aria-hidden="true" focusable="false">
<defs><linearGradient id="sk317g" x1="8" y1="7" x2="100" y2="103" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#D8F1FF"/><stop offset=".48" stop-color="#78B8F3"/><stop offset="1" stop-color="#4D70D2"/>
</linearGradient></defs>
<rect x="4" y="4" width="100" height="100" rx="24" fill="url(#sk317g)"/>
<path d="M77 30C69 22 57 19 46 22C35 25 29 32 30 40C31 48 39 52 51 55L61 58C72 61 79 66 78 75C77 83 68 89 56 90C44 91 33 87 25 80" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M85 16L88 22L94 25L88 28L85 34L82 28L76 25L82 22Z" fill="#EAF8FF"/>
</svg>`;

function lang(){
  try{
    let l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0];
    if(l==='ua')l='uk';
    return l;
  }catch(_){return'en'}
}
const HELP={
  de:['Skaysa Hilfe','Hilfe zur Bedienung von Skaysa'],
  en:['Skaysa Help','Help with using Skaysa'],
  es:['Ayuda de Skaysa','Ayuda para usar Skaysa'],
  fr:['Aide Skaysa','Aide pour utiliser Skaysa'],
  it:['Aiuto Skaysa','Aiuto per usare Skaysa'],
  pt:['Ajuda Skaysa','Ajuda para usar o Skaysa'],
  nl:['Skaysa Help','Hulp bij het gebruik van Skaysa'],
  pl:['Pomoc Skaysa','Pomoc w obsłudze Skaysa'],
  tr:['Skaysa Yardım','Skaysa kullanımı için yardım'],
  uk:['Допомога Skaysa','Допомога з використання Skaysa'],
  ru:['Помощь Skaysa','Помощь по использованию Skaysa'],
  ja:['Skaysa ヘルプ','Skaysa の使い方'],
  ko:['Skaysa 도움말','Skaysa 사용 도움말'],
  zh:['Skaysa 帮助','Skaysa 使用帮助'],
  ar:['مساعدة Skaysa','مساعدة في استخدام Skaysa']
};

let fixingHelp=false;
function stabilizeHelp(){
  if(fixingHelp)return;
  const row=document.querySelector('#people .q299helpRow');
  if(!row)return;
  fixingHelp=true;
  try{
    const t=HELP[lang()]||HELP.en;
    const name=row.querySelector('.q26name');
    const preview=row.querySelector('.q26preview');
    const avatar=row.querySelector('.q26avatar');
    if(name&&name.textContent!==t[0])name.textContent=t[0];
    if(preview&&preview.textContent!==t[1])preview.textContent=t[1];
    row.querySelectorAll('.q299tag,.q305phone').forEach(el=>{if(el.style.display!=='none')el.style.display='none'});
    if(avatar){
      if(!avatar.classList.contains('q317helpLogo'))avatar.classList.add('q317helpLogo');
      if(avatar.dataset.q317logo!=='1'){
        avatar.dataset.q317logo='1';
        avatar.textContent='';
        avatar.innerHTML=HELP_LOGO;
      }
    }
  }finally{fixingHelp=false}
}

const style=document.createElement('style');
style.id='skaysa317style';
style.textContent=`
#people .q299helpRow .q317helpLogo{display:grid!important;place-items:center!important;background:none!important;padding:0!important;overflow:hidden!important;border-radius:18px!important;color:transparent!important}
#people .q299helpRow .q317helpLogo svg{display:block!important;width:100%!important;height:100%!important}
#people .q26row{contain:layout style paint}
#people .q26row.q317tap{background:#f3f8fc!important;transform:scale(.992)!important}
`;
document.head.appendChild(style);

/* Avoid rebuilding the complete list when the server returned exactly the same data.
   This removes the visible avatar/help-row flicker from regular polling. */
let convSig='';
function signature(list){
  const search=String(D('chatSearch')?.value||'');
  let pins='';try{pins=localStorage.getItem('qevyno_pins')||''}catch(_){}
  const rows=(Array.isArray(list)?list:[]).map(u=>[
    String(u?.phone||''),
    String(u?.display_name||''),
    !!u?.online,
    !!u?.verified,
    String(u?.avatar_url||''),
    String(u?.last_message||''),
    Number(u?.last_at||0),
    Number(u?.unread||0)
  ]);
  return JSON.stringify([search,pins,rows]);
}
function installStableRenderer(){
  const prior=window.renderConversations;
  if(typeof prior!=='function'||prior.__sk317)return;
  const wrapped=function(list){
    const sig=signature(list);
    const people=D('people');
    if(sig===convSig&&people&&people.dataset.sk317Rendered==='1'){
      stabilizeHelp();
      return;
    }
    convSig=sig;
    const r=prior.call(this,list);
    if(people)people.dataset.sk317Rendered='1';
    stabilizeHelp();
    requestAnimationFrame(()=>{stabilizeHelp();bindRows()});
    return r;
  };
  wrapped.__sk317=true;
  wrapped.__sk317Prior=prior;
  window.renderConversations=wrapped;
}

/* Always use the newest openChat function instead of an old onclick closure.
   This also makes taps deterministic after other feature layers wrap openChat. */
function bindRows(){
  document.querySelectorAll('#people .q26row').forEach(row=>{
    if(row.classList.contains('q299helpRow')||row.classList.contains('q306groupRow'))return;
    if(row.dataset.q317tapBound==='1')return;
    const phone=String(row.dataset.phone||'').trim();
    if(!phone)return;
    row.dataset.q317tapBound='1';

    row.addEventListener('click',e=>{
      if(e.defaultPrevented)return;
      if(e.target.closest?.('.q26pin'))return;
      const p=String(row.dataset.phone||'').trim();
      if(!p)return;
      const name=String(row.querySelector('.q26name')?.textContent||p).trim()||p;
      const online=!!row.querySelector('.q26avatar.online');
      if(typeof window.openChat!=='function')return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.openChat(p,name,online,true);
    },true);

    let pressed=false;
    row.addEventListener('pointerdown',()=>{pressed=true;row.classList.add('q317tap')},{passive:true});
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>row.addEventListener(ev,()=>{
      if(pressed){pressed=false;row.classList.remove('q317tap')}
    },{passive:true}));
  });
}

/* If another layer recreates the built-in help row, repair it in the same
   microtask before the next browser paint. */
const people=D('people');
if(people){
  new MutationObserver(()=>{
    stabilizeHelp();
    bindRows();
  }).observe(people,{childList:true,subtree:true,characterData:true});
}

/* Ensure visible old brand text cannot flash inside the help row. */
function installHelpGuard(){
  stabilizeHelp();
  setTimeout(stabilizeHelp,0);
  setTimeout(stabilizeHelp,80);
}

function install(){
  installStableRenderer();
  bindRows();
  installHelpGuard();

  // Keep the current list stable when the app regains focus.
  try{
    if(D('homeScreen')?.classList.contains('active')&&typeof window.loadConversations==='function'){
      window.loadConversations();
    }
  }catch(_){}
}

setTimeout(install,250);
setTimeout(install,900);
setTimeout(install,1800);
window.addEventListener('focus',install);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)install()});
})();