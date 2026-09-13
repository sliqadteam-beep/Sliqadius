(()=>{
'use strict';
if(window.__skaysa316Installed)return;
window.__skaysa316Installed=true;

const VERSION='2.9.47';
const SCROLL_KEY='skaysa_chat_scroll_v1';
const LAST_CHAT_KEY='skaysa_last_chat_meta_v1';
const META_KEY='qevyno_local_conversations_v2';
const GET_RETRY_EXCLUDE=/^\/api\/events(?:\?|$)/;
const D=id=>document.getElementById(id);

function norm(v){
  v=String(v||'').trim().replace(/[\s().-]/g,'');
  if(v.startsWith('00'))v='+'+v.slice(2);
  return v;
}
function validPhone(v){return /^\+[1-9]\d{7,14}$/.test(norm(v))}
function currentPhone(){
  try{return norm((typeof peer!=='undefined'&&peer&&peer.phone)||document.querySelector('#chatPresence .q26phone')?.textContent||'')}catch(_){return''}
}
function currentName(phone){
  try{
    const m=JSON.parse(localStorage.getItem(META_KEY)||'{}')||{};
    if(m[phone]?.display_name)return String(m[phone].display_name);
  }catch(_){}
  try{if(typeof peer!=='undefined'&&peer&&peer.phone===phone&&peer.name)return String(peer.name)}catch(_){}
  return phone;
}
function readLocalChat(phone){
  try{
    if(window.QevynoDevice&&QevynoDevice.loadChat){
      const a=JSON.parse(QevynoDevice.loadChat(phone)||'[]');
      if(Array.isArray(a))return a;
    }
  }catch(_){}
  try{
    const a=JSON.parse(localStorage.getItem('qevyno_chat_'+phone)||'[]');
    return Array.isArray(a)?a:[];
  }catch(_){return[]}
}
function scrollMap(){
  try{const x=JSON.parse(localStorage.getItem(SCROLL_KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return{}}
}
function saveScroll(phone){
  const box=D('messages');phone=norm(phone||currentPhone());
  if(!box||!phone)return;
  try{
    const all=scrollMap();
    const distance=Math.max(0,box.scrollHeight-box.scrollTop-box.clientHeight);
    all[phone]={top:Math.max(0,box.scrollTop),bottom:distance,at:Date.now()};
    const entries=Object.entries(all).sort((a,b)=>Number(b[1]?.at||0)-Number(a[1]?.at||0)).slice(0,80);
    localStorage.setItem(SCROLL_KEY,JSON.stringify(Object.fromEntries(entries)));
  }catch(_){}
}
function restoreScroll(phone){
  const box=D('messages');if(!box)return;
  let s=null;try{s=scrollMap()[phone]||null}catch(_){}
  requestAnimationFrame(()=>{
    try{
      if(s&&Number(s.bottom)>120){
        box.scrollTop=Math.min(Number(s.top)||0,Math.max(0,box.scrollHeight-box.clientHeight));
      }else{
        box.scrollTop=box.scrollHeight;
      }
    }catch(_){}
  });
}
function saveLastMeta(phone,name,online){
  try{localStorage.setItem(LAST_CHAT_KEY,JSON.stringify({phone,name:String(name||phone),online:!!online,at:Date.now()}))}catch(_){}
}
function loadLastMeta(phone){
  try{
    const x=JSON.parse(localStorage.getItem(LAST_CHAT_KEY)||'null');
    if(x&&norm(x.phone)===phone)return x;
  }catch(_){}
  return{phone,name:currentName(phone),online:false};
}
function closeTransientSheets(){
  try{
    ['newChatSheet','chatInfoSheet','sheetBack'].forEach(id=>{
      const el=D(id);if(!el)return;
      el.classList.remove('open');el.classList.remove('on');
    });
  }catch(_){}
}
function renderCached(phone){
  try{
    const arr=readLocalChat(phone);
    if(arr.length&&typeof window.renderMessages==='function'){
      window.renderMessages(arr);
      restoreScroll(phone);
      return true;
    }
  }catch(_){}
  return false;
}
function routeHome(){
  try{
    const base=location.href.replace(/#.*$/,'');
    history.replaceState({skaysa:'home'},'',base);
  }catch(_){}
}
function routeChat(phone,push){
  try{
    const state=history.state||{};
    if(push!==false&&!(state.skaysa==='chat'&&norm(state.phone)===phone)){
      history.pushState({skaysa:'chat',phone},'','#chat');
    }else{
      history.replaceState({skaysa:'chat',phone},'','#chat');
    }
  }catch(_){}
}

const style=document.createElement('style');
style.id='skaysa316style';
style.textContent=`
#people .q26row,#people .q306groupRow{touch-action:manipulation;user-select:none;-webkit-user-select:none;cursor:pointer}
#people .q26row.q316press,#people .q306groupRow.q316press{transform:scale(.988)!important;background:#f2f7fb!important}
#chatScreen{will-change:transform,opacity}
#chatScreen.active{animation:q316chatIn .16s cubic-bezier(.22,1,.36,1)}
@keyframes q316chatIn{from{opacity:.65;transform:translateX(8px)}to{opacity:1;transform:none}}
#sendBtn:disabled,.q306send:disabled{opacity:.42!important;box-shadow:none!important}
#messages.q316cached{content-visibility:auto}
.q316net{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translateX(-50%) translateY(-8px);z-index:2200;background:#fff4df;color:#885b13;border:1px solid #f0d59e;border-radius:999px;padding:6px 11px;font:750 11px/1.1 system-ui;box-shadow:0 5px 18px rgba(35,47,55,.10);opacity:0;pointer-events:none;transition:.16s}
.q316net.on{opacity:1;transform:translateX(-50%) translateY(0)}
body.q26nomotion #chatScreen.active{animation:none}
`;
document.head.appendChild(style);

const net=document.createElement('div');
net.className='q316net';
net.textContent='Offline';
document.body.appendChild(net);
function updateNet(){
  const off=typeof navigator!=='undefined'&&navigator.onLine===false;
  net.classList.toggle('on',off);
}
window.addEventListener('online',()=>{updateNet();try{if(currentPhone()&&typeof loadMessages==='function')loadMessages();else if(typeof window.loadConversations==='function')window.loadConversations()}catch(_){}});
window.addEventListener('offline',updateNet);
updateNet();

/* GET request coalescing + one safe retry for transient reads.
   /api/events is deliberately excluded so event handling is never duplicated. */
function installApiLayer(){
  const prior=window.api;
  if(typeof prior!=='function'||prior.__sk316)return;
  const inflight=new Map();
  const wrapped=async function(path,method='GET',body=null,auth=true){
    const m=String(method||'GET').toUpperCase();
    if(m!=='GET'||GET_RETRY_EXCLUDE.test(String(path||'')))return prior(path,method,body,auth);
    const key=(auth===false?'0':'1')+'|'+String(path||'');
    if(inflight.has(key))return inflight.get(key);
    const job=(async()=>{
      let r=await prior(path,method,body,auth);
      if(r&&['server_unreachable','bad_response'].includes(String(r.error||''))&&navigator.onLine!==false){
        await new Promise(res=>setTimeout(res,180));
        r=await prior(path,method,body,auth);
      }
      return r;
    })();
    inflight.set(key,job);
    try{return await job}finally{inflight.delete(key)}
  };
  wrapped.__sk316=true;
  wrapped.__sk316Prior=prior;
  window.api=wrapped;
  try{api=wrapped}catch(_){}
}

let opening=false;
let openingPhone='';
function installOpenChat(){
  const prior=window.openChat;
  if(typeof prior!=='function'||prior.__sk316)return;
  const wrapped=function(phone,name,online,push){
    phone=norm(phone);
    if(!validPhone(phone))return;
    name=String(name||phone).trim()||phone;

    const active=D('chatScreen')?.classList.contains('active')&&currentPhone()===phone;
    if(active){
      saveLastMeta(phone,name,online);
      try{if(typeof loadMessages==='function')loadMessages()}catch(_){}
      return;
    }
    if(opening&&openingPhone===phone)return;

    saveScroll(currentPhone());
    opening=true;openingPhone=phone;
    closeTransientSheets();
    saveLastMeta(phone,name,online);

    let result;
    try{
      result=prior.call(this,phone,name,online,false);
      const box=D('messages');
      if(box)box.classList.add('q316cached');
      requestAnimationFrame(()=>{
        renderCached(phone);
        try{if(typeof loadMessages==='function')loadMessages()}catch(_){}
      });
      setTimeout(()=>restoreScroll(phone),90);
    }finally{
      setTimeout(()=>{opening=false;openingPhone=''},230);
    }
    return result;
  };
  wrapped.__sk316=true;
  wrapped.__sk316Prior=prior;
  window.openChat=wrapped;
}

function installHome(){
  const prior=window.home;
  if(typeof prior!=='function'||prior.__sk316)return;
  const wrapped=async function(){
    saveScroll(currentPhone());
    const r=await prior.apply(this,arguments);
    return r;
  };
  wrapped.__sk316=true;
  wrapped.__sk316Prior=prior;
  window.home=wrapped;
}

function decorateRows(){
  document.querySelectorAll('#people .q26row,#people .q306groupRow').forEach(row=>{
    if(row.dataset.q316bound==='1')return;
    row.dataset.q316bound='1';
    row.setAttribute('role','button');
    if(row.tabIndex<0)row.tabIndex=0;
    const label=row.querySelector('.q26name')?.textContent||row.querySelector('.q306groupMeta')?.textContent||'Chat';
    row.setAttribute('aria-label',String(label||'Chat'));
    let x=0,y=0;
    row.addEventListener('pointerdown',e=>{x=e.clientX;y=e.clientY;row.classList.add('q316press')},{passive:true});
    row.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-x,e.clientY-y)>9)row.classList.remove('q316press')},{passive:true});
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>row.addEventListener(ev,()=>row.classList.remove('q316press'),{passive:true}));
    if(row.classList.contains('q306groupRow')){
      row.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();row.click()}});
    }
  });
}

let scrollTimer=0;
function bindMessageScroll(){
  const box=D('messages');
  if(!box||box.dataset.q316scroll==='1')return;
  box.dataset.q316scroll='1';
  box.addEventListener('scroll',()=>{
    clearTimeout(scrollTimer);
    scrollTimer=setTimeout(()=>saveScroll(currentPhone()),100);
  },{passive:true});
}

let sendLock=0;
function updateSend(){
  const ta=D('messageBox'),b=D('sendBtn');
  if(ta&&b&&!b.dataset.q316busy){
    b.disabled=!String(ta.value||'').trim();
  }
  const gta=document.querySelector('.q306composer textarea');
  const gb=document.querySelector('.q306send');
  if(gta&&gb)gb.disabled=!String(gta.value||'').trim();
}
function bindComposer(){
  const ta=D('messageBox'),b=D('sendBtn');
  if(ta&&ta.dataset.q316bound!=='1'){
    ta.dataset.q316bound='1';
    ta.addEventListener('input',updateSend);
  }
  if(b&&b.dataset.q316bound!=='1'){
    b.dataset.q316bound='1';
    b.addEventListener('click',e=>{
      const now=Date.now();
      if(now-sendLock<220){e.preventDefault();e.stopImmediatePropagation();return}
      sendLock=now;
    },true);
  }
  const gta=document.querySelector('.q306composer textarea');
  if(gta&&gta.dataset.q316bound!=='1'){
    gta.dataset.q316bound='1';
    gta.addEventListener('input',updateSend);
  }
  updateSend();
}

function closeTopOverlay(){
  const reaction=document.querySelector('.q315reactionBack.on,.q315confirmBack.on');
  if(reaction){reaction.classList.remove('on');return true}
  const groupSheet=[...document.querySelectorAll('.q306back.on')].pop();
  if(groupSheet){groupSheet.classList.remove('on');return true}
  const normal=[...document.querySelectorAll('.sheetBack.open,.sheetBack.on')].filter(x=>x.offsetParent!==null).pop();
  if(normal){
    normal.classList.remove('open');normal.classList.remove('on');return true;
  }
  return false;
}
window.skaysaHandleBack=function(){
  if(closeTopOverlay())return true;
  const group=document.querySelector('.q306groupScreen.on');
  if(group){
    const b=group.querySelector('.q306backBtn');
    if(b)b.click();else group.classList.remove('on');
    return true;
  }
  if(D('chatScreen')?.classList.contains('active')){
    saveScroll(currentPhone());
    try{window.home&&window.home()}catch(_){}
    return true;
  }
  return false;
};

window.addEventListener('skaysa_disabled_popstate_2947',e=>{
  try{
    const st=e.state||{};
    if(st.skaysa==='chat'&&validPhone(st.phone)){
      const p=norm(st.phone),m=loadLastMeta(p);
      const fn=window.openChat;
      if(typeof fn==='function')fn(p,m.name||p,!!m.online,false);
      return;
    }
    if(typeof window.home==='function'&&!D('homeScreen')?.classList.contains('active'))window.home();
  }catch(_){}
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){saveScroll(currentPhone());return}
  setTimeout(()=>{
    try{
      if(D('chatScreen')?.classList.contains('active')&&typeof loadMessages==='function')loadMessages();
      else if(D('homeScreen')?.classList.contains('active')&&typeof window.loadConversations==='function')window.loadConversations();
    }catch(_){}
  },80);
});
window.addEventListener('focus',()=>{
  setTimeout(()=>{
    try{
      if(D('chatScreen')?.classList.contains('active')&&typeof loadMessages==='function')loadMessages();
    }catch(_){}
  },80);
});

/* Do not open the keyboard just because a group was opened. */
window.addEventListener('skaysa-group-opened',()=>{
  try{document.activeElement?.blur()}catch(_){}
});

const people=D('people');
if(people)new MutationObserver(()=>{decorateRows();bindComposer()}).observe(people,{subtree:true,childList:true});
new MutationObserver(()=>{decorateRows();bindComposer();bindMessageScroll()}).observe(document.body,{subtree:true,childList:true});

function install(){
  installApiLayer();
  installOpenChat();
  installHome();
  decorateRows();
  bindComposer();
  bindMessageScroll();
  try{if(location.hash){history.replaceState(null,'',location.href.replace(/#.*$/,''));window.skaysa2947HistoryClean=true}}catch(_){}

  const back=D('backBtn');
  if(back&&!back.__sk316){
    back.__sk316=true;
    back.onclick=()=>window.skaysaHandleBack();
  }
}

setTimeout(install,950);
setTimeout(install,1500);
setTimeout(install,2600);
window.addEventListener('focus',install);
})();