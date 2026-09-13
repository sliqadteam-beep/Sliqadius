(()=>{
'use strict';
const VERSION='2.9.23';
const META_KEY='qevyno_local_conversations_v2';
const GROUPS_KEY='sliqchat_groups_v1';
const GROUP_MSG_PREFIX='sliqchat_group_messages_';
const HELP='0000000000';

function lang(){try{return String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}catch(_){return'en'}}
const T={
 de:{search:'Suchen',clear:'Suche löschen',none:'Keine Treffer',noneSub:'Versuche einen anderen Namen, eine Nummer oder eine Nachricht.',chats:'Chats'},
 en:{search:'Search chats, numbers and groups',clear:'Clear search',none:'No results',noneSub:'Try another name, number or message.',chats:'Chats'},
 es:{search:'Buscar chats, números y grupos',clear:'Borrar búsqueda',none:'Sin resultados',noneSub:'Prueba otro nombre, número o mensaje.',chats:'Chats'},
 fr:{search:'Rechercher chats, numéros et groupes',clear:'Effacer la recherche',none:'Aucun résultat',noneSub:'Essaie un autre nom, numéro ou message.',chats:'Discussions'},
 it:{search:'Cerca chat, numeri e gruppi',clear:'Cancella ricerca',none:'Nessun risultato',noneSub:'Prova un altro nome, numero o messaggio.',chats:'Chat'},
 pt:{search:'Pesquisar chats, números e grupos',clear:'Limpar pesquisa',none:'Sem resultados',noneSub:'Tenta outro nome, número ou mensagem.',chats:'Conversas'},
 nl:{search:'Zoek chats, nummers en groepen',clear:'Zoekopdracht wissen',none:'Geen resultaten',noneSub:'Probeer een andere naam, nummer of bericht.',chats:'Chats'},
 pl:{search:'Szukaj czatów, numerów i grup',clear:'Wyczyść wyszukiwanie',none:'Brak wyników',noneSub:'Spróbuj innej nazwy, numeru lub wiadomości.',chats:'Czaty'},
 tr:{search:'Sohbet, numara ve grup ara',clear:'Aramayı temizle',none:'Sonuç yok',noneSub:'Başka bir ad, numara veya mesaj deneyin.',chats:'Sohbetler'}
};
function tx(k){const d=T[lang()]||T.en;return d[k]||T.en[k]||k}
function normText(v){return String(v??'').normalize?String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase():String(v??'').toLowerCase()}
function normPhone(v){return String(v||'').replace(/[^+\d]/g,'')}
function readJson(key,fallback={}){try{const x=JSON.parse(localStorage.getItem(key)||'');return x&&typeof x==='object'?x:fallback}catch(_){return fallback}}
function loadGroupMessages(id){try{const a=JSON.parse(localStorage.getItem(GROUP_MSG_PREFIX+id)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}

const style=document.createElement('style');style.id='skaysa312style';style.textContent=`
/* Cleaner home: keep the Android launcher icon, remove only the in-app wordmark/logo. */
#homeScreen .topbar .brand{display:none!important}
#homeScreen .topbar{min-height:68px!important;padding-bottom:8px!important;align-items:center!important;border-bottom:0!important}
#homeScreen .topbar>.spacer{display:block!important;flex:1!important}
#homeScreen .q26server{display:none!important}
#homeScreen .q26hero{padding:4px 16px 12px!important}
#homeScreen .q26heroTop{align-items:center!important}
#homeScreen .q26headline{font-size:34px!important;letter-spacing:-1.25px!important}
.q27logo{display:none!important}

/* Search redesigned around #8ABFF4 and made stable while typing. */
#homeScreen .q26searchWrap{padding:2px 14px 11px!important;gap:9px!important}
#homeScreen .q26search{height:52px!important;border-radius:18px!important;background:#f7fafc!important;border:1px solid #d7e4ee!important;box-shadow:0 4px 18px rgba(34,64,92,.045)!important;padding:0 10px 0 14px!important;transition:border-color .15s ease,box-shadow .15s ease,background .15s ease!important}
#homeScreen .q26search:focus-within{background:#fff!important;border-color:#8ABFF4!important;box-shadow:0 0 0 4px rgba(138,191,244,.18),0 5px 20px rgba(34,64,92,.06)!important}
#homeScreen .q26search>span:first-child{width:22px;height:22px;display:grid;place-items:center;color:#718797!important;flex:0 0 auto}
#homeScreen .q26search>span:first-child svg{width:19px;height:19px;display:block}
#homeScreen #chatSearch{font-size:14.5px!important;color:#17212b!important;outline:none!important;padding:0!important;min-width:0!important}
#homeScreen #chatSearch::placeholder{color:#93a3ad!important;opacity:1}
.q312clear{width:34px;height:34px;min-width:34px;border-radius:11px;background:transparent;color:#748893;font-size:20px;display:grid;place-items:center;opacity:0;pointer-events:none;transform:scale(.92);transition:.13s ease}
.q26search.q312hasValue .q312clear{opacity:1;pointer-events:auto;transform:none}.q312clear:active{background:#eaf2f8!important;transform:scale(.95)!important}
#homeScreen .q26new{width:52px!important;height:52px!important;border-radius:18px!important;background:#8ABFF4!important;color:#102335!important;box-shadow:0 7px 20px rgba(83,137,193,.16)!important}

/* Stable, calmer conversation list. */
#people{overflow-anchor:none!important;scrollbar-width:none!important}.q26people::-webkit-scrollbar{display:none}
#people .q26row,.q306groupRow{transform:none!important;transition:background .12s ease,border-color .12s ease!important;margin:3px 0!important;border-radius:19px!important}
#people .q26row:active,.q306groupRow:active{transform:none!important;background:#f2f7fb!important}
#people .q26row:hover{transform:none!important}
#people .q312hidden{display:none!important}
.q312searchEmpty{display:none;margin:5px 14px 12px;padding:20px 18px;border:1px dashed #cbdbe7;border-radius:19px;background:#f8fbfd;text-align:center;color:#17212b}
.q312searchEmpty.on{display:block}.q312searchEmpty b{display:block;font-size:15px}.q312searchEmpty span{display:block;margin-top:5px;font-size:11.5px;line-height:1.45;color:#7b8e9a}
#people .q26empty.q312nativeEmptyHidden{display:none!important}
.q26section,.q306groupSection{transition:none!important}
.q308profileChip{box-shadow:0 3px 13px rgba(23,33,43,.04)!important}
button,input,textarea{-webkit-tap-highlight-color:transparent}

/* More consistent focus visibility. */
button:focus-visible,.q26row:focus-visible{outline:2px solid #8ABFF4!important;outline-offset:2px!important}
@media(max-width:380px){#homeScreen .q26headline{font-size:31px!important}#homeScreen .q26searchWrap{padding-left:11px!important;padding-right:11px!important}}
`;document.head.appendChild(style);

function searchSvg(){return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M16 16l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'}
function ensureSearchUi(){
 const input=document.getElementById('chatSearch'),label=input?.closest('.q26search');if(!input||!label)return null;
 input.placeholder=tx('search');input.setAttribute('aria-label',tx('search'));input.setAttribute('enterkeyhint','search');input.setAttribute('spellcheck','false');
 const icon=label.querySelector(':scope > span:first-child');if(icon&&!icon.dataset.q312icon){icon.dataset.q312icon='1';icon.innerHTML=searchSvg()}
 let clear=label.querySelector('.q312clear');if(!clear){clear=document.createElement('button');clear.type='button';clear.className='q312clear';clear.setAttribute('aria-label',tx('clear'));clear.textContent='×';label.appendChild(clear);clear.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();input.value='';input.focus();scheduleSearch()})}
 label.classList.toggle('q312hasValue',!!input.value.trim());return input;
}
function ensureEmpty(){const home=document.querySelector('#homeScreen .q26home'),wrap=home?.querySelector('.q26searchWrap');if(!home||!wrap)return null;let e=home.querySelector('.q312searchEmpty');if(!e){e=document.createElement('div');e.className='q312searchEmpty';e.innerHTML=`<b>${tx('none')}</b><span>${tx('noneSub')}</span>`;wrap.insertAdjacentElement('afterend',e)}return e}
function groupBlob(id){const groups=readJson(GROUPS_KEY,{}),g=groups[id];if(!g)return'';const members=(Array.isArray(g.members)?g.members:[]).map(m=>typeof m==='string'?m:(m?.name||'')+' '+(m?.phone||'')).join(' '),msgs=loadGroupMessages(id),last=msgs[msgs.length-1];return [g.name,members,last?.text,last?.sender_name].filter(Boolean).join(' ')}
function rowBlob(row){let s=row.textContent||'';const phone=row.dataset.phone||'';if(phone){const meta=readJson(META_KEY,{}),m=meta[phone]||{};s+=' '+phone+' '+(m.display_name||'')+' '+(m.last_message||'')}const gid=row.dataset.groupId||'';if(gid)s+=' '+groupBlob(gid);return s}
function matches(row,q,qPhone){if(!q)return true;const blob=normText(rowBlob(row));if(blob.includes(q))return true;if(qPhone){const p=normPhone(rowBlob(row));if(p.includes(qPhone))return true}return false}
function updateSections(people){const sections=[...people.querySelectorAll('.q26section,.q306groupSection')];for(const sec of sections){let n=sec.nextElementSibling,visible=false;while(n&&!n.matches('.q26section,.q306groupSection')){if(n.matches('.q26row,.q306groupRow')&&!n.classList.contains('q312hidden')){visible=true;break}n=n.nextElementSibling}sec.style.display=visible?'':'none'}}
let applying=false;
function applySearch(){if(applying)return;applying=true;try{
 const input=ensureSearchUi(),people=document.getElementById('people'),empty=ensureEmpty();if(!input||!people)return;
 const raw=input.value.trim(),q=normText(raw),qPhone=normPhone(raw);input.closest('.q26search')?.classList.toggle('q312hasValue',!!raw);
 const rows=[...people.querySelectorAll('.q26row,.q306groupRow')];let visible=0;
 for(const row of rows){const show=matches(row,q,qPhone);row.classList.toggle('q312hidden',!show);if(show)visible++}
 updateSections(people);
 const nativeEmpty=people.querySelector('.q26empty');if(nativeEmpty)nativeEmpty.classList.toggle('q312nativeEmptyHidden',!!raw);
 if(empty)empty.classList.toggle('on',!!raw&&visible===0);
 }finally{applying=false}}
let searchFrame=0;function scheduleSearch(){cancelAnimationFrame(searchFrame);searchFrame=requestAnimationFrame(applySearch)}
function bindSearch(){const input=ensureSearchUi();if(!input||input.dataset.q312bound)return;input.dataset.q312bound='1';
 // Capture the input first: older layers used to rebuild the whole list on every key,
 // which caused flicker/wobble. We filter the existing rows instead.
 input.addEventListener('input',e=>{e.stopImmediatePropagation();scheduleSearch()},true);
 input.addEventListener('keydown',e=>{if(e.key==='Escape'&&input.value){e.preventDefault();input.value='';scheduleSearch()}},true);
 input.addEventListener('focus',()=>input.closest('.q26search')?.classList.add('q312focus'));
 input.addEventListener('blur',()=>input.closest('.q26search')?.classList.remove('q312focus'));
}
function polish(){bindSearch();scheduleSearch();document.querySelectorAll('.small').forEach(el=>{if(/(?:Qevyno|SliqChat|Skaysa)\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`Skaysa v${VERSION} • Android 8+`});const h=document.querySelector('#homeScreen .q26headline');if(h&&/messages|nachrichten/i.test(h.textContent||''))h.textContent=tx('chats')}
const people=document.getElementById('people');if(people)new MutationObserver(scheduleSearch).observe(people,{childList:true,subtree:true});
[0,120,350,800,1600,3000].forEach(ms=>setTimeout(polish,ms));window.addEventListener('focus',polish);document.addEventListener('visibilitychange',()=>{if(!document.hidden)polish()});
})();