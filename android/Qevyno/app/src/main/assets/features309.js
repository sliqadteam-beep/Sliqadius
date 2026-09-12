(()=>{
'use strict';
const VERIFIED_PHONE='+4915229463681';
const PUSH_SYNC_MS=10000;
function norm(p){return String(p||'').replace(/[\s().-]/g,'')}
function isVerified(p){return norm(p)===VERIFIED_PHONE}
function badgeNode(){
  const s=document.createElement('span');
  s.className='q309verified';
  s.textContent='✓';
  s.setAttribute('aria-label','Verifiziert');
  s.title='Verifiziert';
  return s;
}
const style=document.createElement('style');
style.id='sliqchat309style';
style.textContent=`
.q309verified{display:inline-grid;place-items:center;width:17px;height:17px;min-width:17px;margin-left:5px;border-radius:50%;background:#7c3aed;color:#fff;font-size:11px;font-weight:950;line-height:1;vertical-align:middle;box-shadow:0 1px 4px rgba(124,58,237,.22)}
.q308miniNameLine,.q308titleLine{display:flex!important;align-items:center!important;min-width:0!important}
.q308miniInfo,.q308headText{display:flex!important;flex-direction:column!important;justify-content:center!important}
.q308miniPhone,.q308phone{display:block!important;margin-top:2px!important}
#homeScreen,#people,#people .q26row,#people .q306groupRow{animation:none!important}
#people{overflow-anchor:none!important;scroll-behavior:auto!important}
#people .q26row,#people .q306groupRow{transform:none!important;transition:background-color .12s ease,border-color .12s ease!important}
`;
document.head.appendChild(style);

function addBadge(container){
  if(!container||container.querySelector('.q295verified,.q308verified,.q309verified'))return;
  container.appendChild(badgeNode());
}
function decorateVerified(){
  document.querySelectorAll('#people .q26row[data-phone]').forEach(row=>{
    if(!isVerified(row.dataset.phone))return;
    addBadge(row.querySelector('.q26nameLine'));
  });
  document.querySelectorAll('.q306sender[data-phone]').forEach(el=>{
    if(isVerified(el.dataset.phone))addBadge(el);
  });
  const presence=document.getElementById('chatPresence');
  if(presence&&isVerified(presence.textContent)){
    const name=document.getElementById('chatName');
    if(name&&!name.querySelector('.q295verified,.q308verified,.q309verified'))name.appendChild(badgeNode());
  }
  const ownPhone=norm(localStorage.getItem('qevyno_phone')||'');
  if(isVerified(ownPhone)){
    const mini=document.querySelector('.q308miniNameLine');
    if(mini)addBadge(mini);
    const title=document.querySelector('.q308titleLine');
    if(title)addBadge(title);
  }
}
let lastToken='',lastPhone='';
function syncPush(){
  try{
    if(!window.QevynoDevice)return;
    const token=String(localStorage.getItem('qevyno_token')||'');
    const phone=String(localStorage.getItem('qevyno_phone')||'');
    if(token&&phone){
      if(token!==lastToken||phone!==lastPhone){
        if(QevynoDevice.configureNotifications)QevynoDevice.configureNotifications(token,phone);
        lastToken=token;lastPhone=phone;
      }
    }else{
      if(lastToken||lastPhone){
        if(QevynoDevice.disableNotifications)QevynoDevice.disableNotifications();
        lastToken='';lastPhone='';
      }
    }
  }catch(_){}
}
let pending=false;
function decorate(){
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;decorateVerified();});
}
new MutationObserver(decorate).observe(document.body,{subtree:true,childList:true});
[0,180,500,1200,2400].forEach(ms=>setTimeout(()=>{decorate();syncPush()},ms));
setInterval(syncPush,PUSH_SYNC_MS);
window.addEventListener('focus',()=>{decorate();syncPush()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){decorate();syncPush()}});
})();