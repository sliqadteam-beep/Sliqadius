(()=>{
'use strict';
const VERSION='2.9.27';

function lang(){
  try{return String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}
  catch(_){return'en'}
}
const PLACEHOLDER={
  de:'Chats, Nummern und Gruppen suchen',
  en:'Search chats, numbers and groups',
  es:'Buscar chats, números y grupos',
  fr:'Rechercher chats, numéros et groupes',
  it:'Cerca chat, numeri e gruppi',
  pt:'Pesquisar chats, números e grupos',
  nl:'Zoek chats, nummers en groepen',
  pl:'Szukaj czatów, numerów i grup',
  tr:'Sohbet, numara ve grup ara'
};
function searchPlaceholder(){return PLACEHOLDER[lang()]||PLACEHOLDER.en}

function ensureStyle(){
  if(document.getElementById('q313style')) return;
  const s=document.createElement('style');
  s.id='q313style';
  s.textContent=`
html,body{overflow-x:hidden!important;background:#fff!important}
body,#app,#root,#homeScreen,.screen,.page,.page-wrap,.app-shell{max-width:none!important;width:100%!important;margin:0!important;min-width:0!important}
#homeScreen,.homeScreen,.chats-page{padding-left:0!important;padding-right:0!important}
#homeScreen .topbar,.topbar{padding:10px 16px 0!important}
#homeScreen .topbar .brand,.topbar .brand,.topbar .logo,.app-brand,.appLogo,.appWordmark{display:none!important}
#homeScreen .q26hero{padding:8px 18px 10px!important}
#homeScreen .q26headline{font-size:38px!important;line-height:1.02!important;letter-spacing:-1.7px!important;margin:0!important}

/* Search behavior belongs ONLY to features312. This layer is visual-only. */
#homeScreen .q26searchWrap{padding:6px 16px 14px!important;gap:10px!important}
#homeScreen .q26search{height:58px!important;border-radius:22px!important;background:#f7fafc!important;border:1px solid #dbe6ee!important;box-shadow:none!important;padding:0 15px!important;display:flex!important;align-items:center!important;overflow:hidden!important}
#homeScreen .q26search:focus-within{background:#fff!important;border-color:#8ABFF4!important;box-shadow:0 0 0 4px rgba(138,191,244,.16)!important}
#homeScreen .q26search>span:first-child{width:25px!important;height:25px!important;min-width:25px!important;margin-right:11px!important;display:grid!important;place-items:center!important;color:#718797!important}
#homeScreen .q26search>span:first-child svg{width:21px!important;height:21px!important}
#homeScreen #chatSearch{height:100%!important;min-height:0!important;width:100%!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;outline:none!important;font-size:16px!important;line-height:1.2!important;color:#17212b!important;appearance:none!important;-webkit-appearance:none!important}
#homeScreen #chatSearch::placeholder{color:#95a4ae!important;opacity:1!important}
#homeScreen .q312clear{flex:0 0 34px!important}
.q313searchIcon,.q313clear,.q313emptyState{display:none!important}
.q313hidden{display:revert!important}
#homeScreen .q26new{width:58px!important;height:58px!important;border-radius:21px!important;box-shadow:0 10px 24px rgba(83,137,193,.16)!important}

.q308profileChip,.q308profileCard,.q308miniProfile,.profileChip{border:1px solid #e3ebf1!important;border-radius:22px!important;box-shadow:0 6px 18px rgba(18,33,53,.045)!important;background:#fbfdff!important}
.q308profileChip{padding:8px 10px!important}
#people{width:100%!important;max-width:none!important;padding:4px 16px 120px!important;box-sizing:border-box!important;overflow-anchor:none!important}
#people>.q299helpRow,#people>.q306groupRow,#people>.q26row,#people>.q304row,#people>.q308chatRow,#people>.chatRow,#people>.conversation{margin:0 0 10px!important;border:1px solid #e5edf3!important;border-radius:22px!important;background:#fff!important;box-shadow:0 5px 17px rgba(18,33,53,.035)!important;transform:none!important}
#people>.q299helpRow:active,#people>.q306groupRow:active,#people>.q26row:active{background:#f5f9fc!important;transform:none!important}
.fab,.qfab,#fab,.composeFab,.newChatFab{box-shadow:0 14px 28px rgba(67,152,228,.24)!important;border-radius:27px!important}
button,input,textarea,select{-webkit-tap-highlight-color:transparent}
@media(max-width:380px){#homeScreen .q26headline{font-size:34px!important}#homeScreen .q26searchWrap{padding-left:12px!important;padding-right:12px!important}}
`;
  document.head.appendChild(s);
}

let observedInput=null;
let placeholderObserver=null;
function stabilizeSearch(){
  const input=document.getElementById('chatSearch');
  if(!input) return;
  const desired=searchPlaceholder();
  if(input.placeholder!==desired) input.placeholder=desired;

  document.querySelectorAll('.q313searchIcon,.q313clear,.q313emptyState').forEach(el=>el.remove());
  document.querySelectorAll('.q313hidden').forEach(el=>el.classList.remove('q313hidden'));

  if(observedInput===input) return;
  observedInput=input;
  try{placeholderObserver?.disconnect()}catch(_){}
  placeholderObserver=new MutationObserver(()=>{
    const wanted=searchPlaceholder();
    if(input.placeholder!==wanted) input.placeholder=wanted;
  });
  placeholderObserver.observe(input,{attributes:true,attributeFilter:['placeholder']});
  input.addEventListener('focus',()=>{const wanted=searchPlaceholder();if(input.placeholder!==wanted)input.placeholder=wanted},true);
  input.addEventListener('blur',()=>{const wanted=searchPlaceholder();if(input.placeholder!==wanted)input.placeholder=wanted},true);
}

function ready(){
  ensureStyle();
  stabilizeSearch();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    setTimeout(()=>{
      stabilizeSearch();
      window.__skaysaReady=true;
      try{window.skaysaHideBoot&&window.skaysaHideBoot()}catch(_){}
      try{window.dispatchEvent(new Event('skaysa-ready'))}catch(_){}
    },120);
  }));
}

const mo=new MutationObserver(()=>{ensureStyle();stabilizeSearch()});
mo.observe(document.documentElement,{subtree:true,childList:true});
[0,80,220,500,1000,1800].forEach(ms=>setTimeout(ready,ms));
window.addEventListener('focus',ready);
window.addEventListener('pageshow',ready);
})();