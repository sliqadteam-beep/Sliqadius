(()=>{
'use strict';
const VERSION='2.9.17';
const META_KEY='qevyno_local_conversations_v2';

const style=document.createElement('style');
style.id='qevyno304style';
style.textContent=`
.chatPresence.q304phone{font-size:11px!important;color:#71867b!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#messages .bubbleRow.q304incomingNew{animation:q304Incoming .26s cubic-bezier(.22,1,.36,1) both!important;transform-origin:bottom left}
@keyframes q304Incoming{0%{opacity:0;transform:translate3d(-8px,8px,0) scale(.975)}65%{opacity:1;transform:translate3d(1px,-1px,0) scale(1.008)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#messages .bubbleRow.q304incomingNew{animation:none!important}}
body.q26nomotion #messages .bubbleRow.q304incomingNew{animation:none!important}
`;
document.head.appendChild(style);

function peerPhone(){try{return String((typeof peer!=='undefined'&&peer&&peer.phone)||'')}catch(_){return''}}
function peerName(phone){
  if(!phone)return'';
  try{
    const all=JSON.parse(localStorage.getItem(META_KEY)||'{}');
    const m=all&&all[phone];
    if(m&&String(m.display_name||'').trim())return String(m.display_name).trim();
  }catch(_){}
  try{if(typeof peer!=='undefined'&&peer&&String(peer.name||'').trim()&&String(peer.name)!==phone)return String(peer.name).trim()}catch(_){}
  return phone;
}
function keepBadgeAndSetName(el,text){
  if(!el)return;
  const badge=el.querySelector('.q295verified');
  const current=Array.from(el.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.nodeValue||'').join('').trim();
  if(current===text)return;
  if(badge)badge.remove();
  el.textContent=text;
  if(badge)el.appendChild(badge);
}
let headerBusy=false;
function updateHeader(){
  if(headerBusy)return;
  const phone=peerPhone();
  if(!phone)return;
  headerBusy=true;
  try{
    const name=document.getElementById('chatName');
    const sub=document.getElementById('chatPresence');
    keepBadgeAndSetName(name,peerName(phone));
    if(sub){
      if(sub.textContent!==phone)sub.textContent=phone;
      sub.classList.add('q304phone');
      sub.setAttribute('aria-label','Phone number');
    }
  }finally{headerBusy=false}
}
function scheduleHeader(){requestAnimationFrame(updateHeader)}

const title=document.querySelector('#chatScreen .chatTitle');
if(title){
  new MutationObserver(()=>{if(!headerBusy)scheduleHeader()}).observe(title,{subtree:true,childList:true,characterData:true});
}
const oldOpen=window.openChat;
if(typeof oldOpen==='function'&&!window.q304OpenWrapped){
  window.q304OpenWrapped=true;
  window.openChat=function(){
    const r=oldOpen.apply(this,arguments);
    setTimeout(updateHeader,0);setTimeout(updateHeader,70);setTimeout(updateHeader,260);
    return r;
  };
}

let activePeer='';
let seenIncoming=new Set();
let scanPending=false;
function incomingRows(){return Array.from(document.querySelectorAll('#messages .bubbleRow:not(.mine)[data-mid]'))}
function scanIncoming(){
  scanPending=false;
  const phone=peerPhone();
  if(!phone){activePeer='';seenIncoming.clear();return}
  const rows=incomingRows();
  if(phone!==activePeer){
    activePeer=phone;
    seenIncoming=new Set(rows.map(r=>String(r.dataset.mid||'')).filter(Boolean));
    updateHeader();
    return;
  }
  for(const row of rows){
    const id=String(row.dataset.mid||'');
    if(!id||seenIncoming.has(id))continue;
    seenIncoming.add(id);
    row.classList.remove('q296bubbleIn');
    row.classList.add('q304incomingNew');
    setTimeout(()=>row.classList.remove('q304incomingNew'),420);
  }
  updateHeader();
}
function scheduleScan(){if(scanPending)return;scanPending=true;requestAnimationFrame(scanIncoming)}
const messages=document.getElementById('messages');
if(messages)new MutationObserver(scheduleScan).observe(messages,{subtree:true,childList:true});

function setVersion(){
  try{document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`Qevyno v${VERSION} • Android 8+`;});}catch(_){}
}
[0,180,500,1000,1800].forEach(ms=>setTimeout(()=>{updateHeader();setVersion();if(ms===0)scanIncoming();},ms));
window.addEventListener('focus',()=>{updateHeader();setVersion()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){updateHeader();setVersion();scheduleScan()}});
})();
