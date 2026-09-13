(()=>{
"use strict";
const VERSION='2.9.24';
const SEARCH_SELECTOR='#chatSearch';
const PEOPLE_SELECTOR='#people';
const ROW_SELECTORS=[
  '.q299helpRow',
  '.q306groupRow',
  '.q26row',
  '.q304row',
  '.q308chatRow',
  '.chatRow',
  '.conversation',
  '.person',
  '#people > div'
];

function lang(){
  try{
    return String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en')
      .toLowerCase().split(/[-_]/)[0];
  }catch(_){return 'en'}
}
const TXT={
  de:{
    placeholder:'Chats, Nummern und Gruppen suchen',
    empty:'Keine Treffer',
    emptySub:'Versuche einen anderen Namen, eine Nummer oder einen Text aus der letzten Nachricht.',
    clear:'Suche leeren'
  },
  en:{
    placeholder:'Search chats, numbers and groups',
    empty:'No results',
    emptySub:'Try another name, phone number, group or text from the last message.',
    clear:'Clear search'
  }
};
function t(k){const d=TXT[lang()]||TXT.en;return d[k]||TXT.en[k]||k}

let styleEl=null;
function ensureStyle(){
  if(styleEl) return;
  styleEl=document.createElement('style');
  styleEl.id='q313style';
  styleEl.textContent=`
html,body{overflow-x:hidden!important;background:#f7fafc!important}
body,#app,#root,#homeScreen,.screen,.page,.page-wrap,.app-shell{
  max-width:none!important;width:100%!important;margin:0!important;min-width:0!important;
}
#homeScreen,.homeScreen,.chats-page{
  padding-left:0!important;padding-right:0!important;
}
#homeScreen .content,#homeScreen .inner,.page-content,#peopleWrap,#people{
  max-width:none!important;width:100%!important;
}
#homeScreen .topbar,.topbar{
  padding:12px 16px 0 16px!important;
}
#homeScreen .topbar .brand,.topbar .brand,.topbar .logo,.app-brand,.appLogo,.appWordmark{
  display:none!important;
}
#homeScreen h1,.page h1,.section-title{
  letter-spacing:-.03em!important;
}
#people{
  padding:10px 16px 120px!important;
  box-sizing:border-box!important;
}
#people > .q313emptyState{display:none}
.q313rowShow{display:flex!important}
.q313hidden{display:none!important}
.q313surface,
#people > div,
.q299helpRow,
.q306groupRow,
.q26row,
.q304row,
.q308chatRow,
.chatRow,
.conversation{
  box-sizing:border-box!important;
  border:1px solid #e7edf3!important;
  border-radius:24px!important;
  background:#ffffff!important;
  box-shadow:0 8px 22px rgba(18,33,53,.045)!important;
}
.q299helpRow,.q306groupRow,.q26row,.q304row,.q308chatRow,.chatRow,.conversation,
#people > div{
  margin:0 0 12px 0!important;
  padding:18px 16px!important;
}
#chatSearch,
${SEARCH_SELECTOR}{
  width:100%!important;
  height:62px!important;
  border-radius:24px!important;
  border:1.5px solid #dfe8f1!important;
  background:#fbfdff!important;
  box-shadow:0 6px 16px rgba(18,33,53,.035)!important;
  padding:0 52px 0 56px!important;
  font-size:18px!important;
  line-height:1!important;
  color:#17212b!important;
  outline:none!important;
}
#chatSearch::placeholder{color:#8b9aaa!important}
.q313searchWrap{
  position:relative!important;
  margin:0 16px 16px!important;
}
.q313searchIcon{
  position:absolute!important;
  left:18px!important;
  top:50%!important;
  transform:translateY(-50%)!important;
  width:24px!important;height:24px!important;
  color:#7f91a1!important;
  pointer-events:none!important;
}
.q313clear{
  position:absolute!important;
  right:14px!important;
  top:50%!important;
  transform:translateY(-50%)!important;
  width:34px!important;height:34px!important;
  border:none!important;
  border-radius:50%!important;
  background:#eef4f9!important;
  color:#4d6478!important;
  display:none!important;
  align-items:center!important;
  justify-content:center!important;
  font-size:18px!important;
  font-weight:900!important;
}
.q313clear.on{display:flex!important}
.q313emptyState{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  text-align:center;
  padding:26px 18px!important;
  border:1px dashed #d9e4ee!important;
  border-radius:24px!important;
  background:#fbfdff!important;
  color:#6f8291!important;
}
.q313emptyTitle{font-size:18px;font-weight:900;color:#17212b}
.q313emptySub{font-size:13px;line-height:1.45}
.q308profileChip,.q308profileCard,.q308miniProfile,.profileChip{
  border:1px solid #e5edf3!important;
  border-radius:22px!important;
  box-shadow:0 8px 22px rgba(18,33,53,.045)!important;
}
.q308profileChip{
  padding:10px 12px!important;
}
.q308profileChip img,.q308profileCard img,.profileChip img{
  border-radius:16px!important;
}
.fab,.qfab,#fab,.composeFab,.newChatFab{
  box-shadow:0 16px 30px rgba(67,152,228,.28)!important;
  border-radius:28px!important;
}
button,input,textarea,select,.q308profileChip,.q299helpRow,.q306groupRow,#people > div{
  transition:box-shadow .16s ease,border-color .16s ease,background .16s ease,transform .16s ease!important;
}
button:active,.fab:active,#fab:active{transform:scale(.985)!important}
`;
  document.head.appendChild(styleEl);
}

function getSearchInput(){
  return document.querySelector(SEARCH_SELECTOR);
}
function getPeople(){
  return document.querySelector(PEOPLE_SELECTOR);
}
function ensureSearchWrap(){
  const input=getSearchInput();
  if(!input || input.dataset.q313wired==='1') return;
  input.dataset.q313wired='1';
  input.setAttribute('placeholder',t('placeholder'));
  const parent=input.parentElement;
  if(!parent) return;
  if(!parent.classList.contains('q313searchWrap')) parent.classList.add('q313searchWrap');
  if(!parent.querySelector('.q313searchIcon')){
    const icon=document.createElement('div');
    icon.className='q313searchIcon';
    icon.innerHTML='\
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24" aria-hidden="true">\
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="2"></circle>\
        <path d="M16 16L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>\
      </svg>';
    parent.appendChild(icon);
  }
  let clearBtn=parent.querySelector('.q313clear');
  if(!clearBtn){
    clearBtn=document.createElement('button');
    clearBtn.type='button';
    clearBtn.className='q313clear';
    clearBtn.setAttribute('aria-label',t('clear'));
    clearBtn.textContent='×';
    clearBtn.addEventListener('click',()=>{
      input.value='';
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.focus();
    });
    parent.appendChild(clearBtn);
  }
  const debounced=debounce(()=>runSearch(input.value||''),70);
  input.addEventListener('input',()=>{
    clearBtn.classList.toggle('on', !!String(input.value||'').trim());
    debounced();
  });
  input.addEventListener('focus',()=>clearBtn.classList.toggle('on', !!String(input.value||'').trim()));
  clearBtn.classList.toggle('on', !!String(input.value||'').trim());
}

function textOf(el){
  return String(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
}
function isSearchableRow(el){
  if(!el || !(el instanceof HTMLElement)) return false;
  if(el.classList.contains('q313emptyState')) return false;
  const txt=textOf(el);
  if(!txt) return false;
  if(el.matches('.q306groupSection,.section-header,.heading,.titleOnly')) return false;
  const style=getComputedStyle(el);
  if(style.display==='none') return false;
  return true;
}
function allRows(){
  const people=getPeople();
  if(!people) return [];
  const found=[];
  const seen=new Set();
  for(const sel of ROW_SELECTORS){
    people.querySelectorAll(sel).forEach(el=>{
      if(!seen.has(el) && isSearchableRow(el)){
        seen.add(el); found.push(el);
      }
    });
  }
  if(!found.length){
    [...people.children].forEach(el=>{
      if(!seen.has(el) && isSearchableRow(el)){
        seen.add(el); found.push(el);
      }
    });
  }
  return found;
}

function ensureEmptyState(){
  const people=getPeople();
  if(!people) return null;
  let box=people.querySelector('.q313emptyState');
  if(!box){
    box=document.createElement('div');
    box.className='q313emptyState';
    box.innerHTML=`<div class="q313emptyTitle">${escapeHtml(t('empty'))}</div><div class="q313emptySub">${escapeHtml(t('emptySub'))}</div>`;
    people.appendChild(box);
  }else{
    const title=box.querySelector('.q313emptyTitle');
    const sub=box.querySelector('.q313emptySub');
    if(title) title.textContent=t('empty');
    if(sub) sub.textContent=t('emptySub');
  }
  return box;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function runSearch(query){
  const people=getPeople();
  const input=getSearchInput();
  if(input) input.setAttribute('placeholder',t('placeholder'));
  if(!people) return;
  const q=String(query||'').trim().toLowerCase();
  const rows=allRows();
  let visible=0;
  rows.forEach(row=>{
    const match=!q || textOf(row).includes(q);
    row.classList.toggle('q313hidden', !match);
    if(match) visible++;
  });
  const empty=ensureEmptyState();
  if(empty) empty.style.display = visible===0 ? 'flex' : 'none';
}

function debounce(fn,wait){
  let t=0;
  return function(...args){
    clearTimeout(t);
    t=setTimeout(()=>fn.apply(this,args),wait);
  }
}

let scheduled=false;
function refresh(){
  if(scheduled) return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    ensureStyle();
    ensureSearchWrap();
    runSearch(getSearchInput()?.value||'');
  });
}

new MutationObserver(refresh).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('focus',refresh);
window.addEventListener('pageshow',refresh);
[0,120,450,1200].forEach(ms=>setTimeout(refresh,ms));
})();