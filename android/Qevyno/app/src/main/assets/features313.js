(()=>{
"use strict";
const VERSION='2.9.26';
const SEARCH_SELECTOR='#chatSearch';
const PEOPLE_SELECTOR='#people';
const ROW_SELECTORS=['.q299helpRow','.q306groupRow','.q26row','.q304row','.q308chatRow','.chatRow','.conversation','.person','#people > div'];

function lang(){try{return String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}catch(_){return'en'}}
const TXT={de:{placeholder:'Chats, Nummern und Gruppen suchen',empty:'Keine Treffer',emptySub:'Versuche einen anderen Namen, eine Nummer, Gruppe oder letzte Nachricht.'},en:{placeholder:'Search chats, numbers and groups',empty:'No results',emptySub:'Try another name, phone number, group or last message.'}};
function t(k){const d=TXT[lang()]||TXT.en;return d[k]||TXT.en[k]||k}

let styleEl;
function ensureStyle(){
 if(styleEl)return;
 styleEl=document.createElement('style');styleEl.id='q313style';styleEl.textContent=`
html,body{overflow-x:hidden!important;background:#fff!important}
body,#app,#root,#homeScreen,.screen,.page,.page-wrap,.app-shell{max-width:none!important;width:100%!important;margin:0!important;min-width:0!important}
#homeScreen,.homeScreen,.chats-page{padding-left:0!important;padding-right:0!important}
#homeScreen .topbar,.topbar{padding:10px 16px 0!important}
#homeScreen .topbar .brand,.topbar .brand,.topbar .logo,.app-brand,.appLogo,.appWordmark{display:none!important}
#homeScreen .q26hero{padding:8px 18px 10px!important}
#homeScreen .q26headline{font-size:38px!important;line-height:1.02!important;letter-spacing:-1.7px!important;margin:0!important}

/* ONE search surface only. The existing .q26search is the container. */
#homeScreen .q26searchWrap{padding:6px 16px 14px!important;gap:10px!important}
#homeScreen .q26search{height:58px!important;border-radius:22px!important;background:#f7fafc!important;border:1px solid #dbe6ee!important;box-shadow:none!important;padding:0 15px!important;display:flex!important;align-items:center!important;overflow:hidden!important}
#homeScreen .q26search:focus-within{background:#fff!important;border-color:#8ABFF4!important;box-shadow:0 0 0 4px rgba(138,191,244,.16)!important}
#homeScreen .q26search>span:first-child{width:25px!important;height:25px!important;min-width:25px!important;margin-right:11px!important;display:grid!important;place-items:center!important;color:#718797!important}
#homeScreen .q26search>span:first-child svg{width:21px!important;height:21px!important}
#chatSearch{height:100%!important;min-height:0!important;width:100%!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;outline:none!important;font-size:16px!important;line-height:1.2!important;color:#17212b!important;appearance:none!important;-webkit-appearance:none!important}
#chatSearch::placeholder{color:#95a4ae!important;opacity:1!important}
.q313searchIcon,.q313clear{display:none!important}
.q313searchWrap{margin:0!important;position:static!important}
#homeScreen .q26new{width:58px!important;height:58px!important;border-radius:21px!important;box-shadow:0 10px 24px rgba(83,137,193,.16)!important}

/* Cleaner profile and list */
.q308profileChip,.q308profileCard,.q308miniProfile,.profileChip{border:1px solid #e3ebf1!important;border-radius:22px!important;box-shadow:0 6px 18px rgba(18,33,53,.045)!important;background:#fbfdff!important}
.q308profileChip{padding:8px 10px!important}
#people{width:100%!important;max-width:none!important;padding:4px 16px 120px!important;box-sizing:border-box!important;overflow-anchor:none!important}
#people>.q299helpRow,#people>.q306groupRow,#people>.q26row,#people>.q304row,#people>.q308chatRow,#people>.chatRow,#people>.conversation{margin:0 0 10px!important;border:1px solid #e5edf3!important;border-radius:22px!important;background:#fff!important;box-shadow:0 5px 17px rgba(18,33,53,.035)!important;transform:none!important}
#people>.q299helpRow:active,#people>.q306groupRow:active,#people>.q26row:active{background:#f5f9fc!important;transform:none!important}
.q313hidden{display:none!important}
.q313emptyState{display:none;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center;margin:4px 0;padding:24px 18px!important;border:1px dashed #d7e3ec!important;border-radius:22px!important;background:#f9fbfd!important;color:#738692!important}
.q313emptyTitle{font-size:16px;font-weight:850;color:#17212b}.q313emptySub{font-size:12.5px;line-height:1.45}
.fab,.qfab,#fab,.composeFab,.newChatFab{box-shadow:0 14px 28px rgba(67,152,228,.24)!important;border-radius:27px!important}
button,input,textarea,select{-webkit-tap-highlight-color:transparent}
@media(max-width:380px){#homeScreen .q26headline{font-size:34px!important}#homeScreen .q26searchWrap{padding-left:12px!important;padding-right:12px!important}}
`;
 document.head.appendChild(styleEl);
}
function input(){return document.querySelector(SEARCH_SELECTOR)}
function people(){return document.querySelector(PEOPLE_SELECTOR)}
function cleanupOldSearch(){
 const i=input();if(!i)return;
 i.placeholder=t('placeholder');
 const p=i.parentElement;if(p)p.classList.remove('q313searchWrap');
 document.querySelectorAll('.q313searchIcon,.q313clear').forEach(x=>x.remove());
}
function textOf(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function isRow(el){if(!el||!(el instanceof HTMLElement)||el.classList.contains('q313emptyState'))return false;if(el.matches('.q306groupSection,.q26section,.section-header,.heading,.titleOnly'))return false;return !!textOf(el)}
function rows(){const p=people();if(!p)return[];const found=[],seen=new Set();for(const sel of ROW_SELECTORS)p.querySelectorAll(sel).forEach(el=>{if(!seen.has(el)&&isRow(el)){seen.add(el);found.push(el)}});return found.length?found:[...p.children].filter(isRow)}
function ensureEmpty(){const p=people();if(!p)return null;let e=p.querySelector('.q313emptyState');if(!e){e=document.createElement('div');e.className='q313emptyState';e.innerHTML=`<div class="q313emptyTitle">${t('empty')}</div><div class="q313emptySub">${t('emptySub')}</div>`;p.appendChild(e)}return e}
function runSearch(){const i=input(),p=people();if(!i||!p)return;const q=String(i.value||'').trim().toLowerCase(),list=rows();let n=0;for(const r of list){const show=!q||textOf(r).includes(q);r.classList.toggle('q313hidden',!show);if(show)n++}const e=ensureEmpty();if(e)e.style.display=(q&&n===0)?'flex':'none'}
function bind(){const i=input();if(!i||i.dataset.q313fixed==='1')return;i.dataset.q313fixed='1';i.addEventListener('input',runSearch);i.addEventListener('search',runSearch)}
let pending=false;function refresh(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;ensureStyle();cleanupOldSearch();bind();runSearch()})}
new MutationObserver(refresh).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);[0,80,250,700,1600].forEach(ms=>setTimeout(refresh,ms));
})();