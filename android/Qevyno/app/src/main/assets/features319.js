(()=>{
'use strict';
if(window.__skaysa319Installed)return;
window.__skaysa319Installed=true;

const VERSION='2.9.49';
const SERVER='https://qevyno.sliqado.org';
const META_KEY='qevyno_local_conversations_v2';
const D=id=>document.getElementById(id);

const css=document.createElement('style');
css.id='skaysa319style';
css.textContent=`
/* High-contrast chat colors */
#chatScreen .bubble{
  background:#ffffff!important;
  border-color:#dfe7ed!important;
  color:#17232d!important;
}
#chatScreen .bubble .btext{color:#17232d!important}
#chatScreen .bubble .meta{color:#71808b!important}
#chatScreen .mine .bubble{
  background:#cfe7ff!important;
  border-color:#b9d8f5!important;
  color:#102535!important;
}
#chatScreen .mine .bubble .btext{color:#102535!important}
#chatScreen .mine .bubble .meta{color:#526b7c!important}
#chatScreen .q295react{
  background:#f6f8fa!important;
  border-color:#dfe6eb!important;
  color:#1d2c36!important;
}
#chatScreen .composer{
  background:#ffffff!important;
  border-top:1px solid #e1e9ef!important;
}
#chatScreen .q26composeBox{
  background:#f1f5f8!important;
  border:1px solid #dfe8ee!important;
}
#chatScreen .composer textarea{
  color:#15232d!important;
  caret-color:#2f7fbd!important;
}
#chatScreen .composer textarea::placeholder{color:#82919c!important}
#chatScreen .send{
  background:#2f7fbd!important;
  color:#ffffff!important;
  border:0!important;
}
#chatScreen .send:disabled{background:#b7c8d5!important;color:#f7fbfd!important}
#chatScreen .q307attach{
  display:grid!important;
  place-items:center!important;
  width:48px!important;
  height:48px!important;
  min-width:48px!important;
  margin:0 2px 0 0!important;
  border-radius:16px!important;
  background:#eef3f7!important;
  color:#27475e!important;
  border:1px solid #d9e4eb!important;
  font-size:27px!important;
  line-height:1!important;
  box-shadow:none!important;
}
#chatScreen .q307attach:active{background:#e2ebf1!important}
#chatScreen .q307draft{
  background:#ffffff!important;
  border-color:#dce6ec!important;
  color:#17232d!important;
}
#chatScreen .q307draftName{color:#17232d!important}
#chatScreen .q307draftSize{color:#6f7f8a!important}
#chatScreen .q307mediaStatus{color:#dbe8ef!important}
#chatScreen .q307caption{color:#17232d!important}
.q295avatarPic.sk319AvatarLoaded{
  background-size:cover!important;
  background-position:center!important;
  background-repeat:no-repeat!important;
  color:transparent!important;
}
`;
document.head.appendChild(css);

function meta(){
  try{
    const x=JSON.parse(localStorage.getItem(META_KEY)||'{}');
    return x&&typeof x==='object'?x:{};
  }catch(_){return{}}
}
function initials(name){
  const p=String(name||'?').trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0]||'?')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase().slice(0,2);
}
function absAvatar(url){
  url=String(url||'').trim();
  if(!url)return'';
  return /^https?:/i.test(url)?url:SERVER+url;
}
function retryUrl(url,n){
  try{
    const u=new URL(url);
    u.searchParams.set('_skavatar',String(Date.now())+'_'+n);
    return u.toString();
  }catch(_){
    return url+(url.includes('?')?'&':'?')+'_skavatar='+Date.now()+'_'+n;
  }
}
function avatarIdentity(el){
  const row=el.closest?.('[data-phone]');
  let phone=String(row?.dataset?.phone||'').trim();
  let name=String(row?.querySelector?.('.q26name')?.textContent||'').trim();

  if(!phone&&(el.id==='chatAvatar'||el.id==='infoAvatar')){
    phone=String(document.querySelector('#chatPresence .q26phone')?.textContent||
                 document.getElementById('infoPhone')?.textContent||'').trim();
    name=String(document.getElementById(el.id==='chatAvatar'?'chatName':'infoName')?.textContent||'').trim();
  }
  return{phone,name};
}
function robustAvatar(el){
  if(!el||el.closest?.('.q308profileChip'))return;
  const id=avatarIdentity(el);
  if(!id.phone)return;

  const u=meta()[id.phone]||{};
  const name=String(u.display_name||id.name||id.phone);
  const url=absAvatar(u.avatar_url);

  if(!url){
    if(el.dataset.sk319Url){
      delete el.dataset.sk319Url;
      delete el.dataset.sk319State;
      el.style.backgroundImage='';
      el.classList.remove('q295avatarPic','sk319AvatarLoaded');
      el.textContent=initials(name);
    }
    return;
  }

  if(el.dataset.sk319Url===url&&el.dataset.sk319State==='loaded')return;
  if(el.dataset.sk319Url===url&&el.dataset.sk319State==='loading')return;

  el.dataset.sk319Url=url;
  el.dataset.sk319State='loading';

  // Never show a blank avatar while the image is being fetched.
  el.classList.remove('q295avatarPic','sk319AvatarLoaded');
  el.style.backgroundImage='';
  el.textContent=initials(name);

  let attempt=0;
  const load=()=>{
    if(el.dataset.sk319Url!==url)return;
    const img=new Image();
    const candidate=attempt===0?url:retryUrl(url,attempt);
    img.decoding='async';
    img.onload=()=>{
      if(el.dataset.sk319Url!==url)return;
      el.style.backgroundImage=`url("${candidate.replace(/"/g,'%22')}")`;
      el.textContent='';
      el.classList.add('q295avatarPic','sk319AvatarLoaded');
      el.dataset.sk319State='loaded';
    };
    img.onerror=()=>{
      if(el.dataset.sk319Url!==url)return;
      attempt++;
      if(attempt<3){
        el.dataset.sk319State='retry';
        setTimeout(()=>{el.dataset.sk319State='loading';load()},250*attempt);
      }else{
        el.dataset.sk319State='failed';
        el.classList.remove('q295avatarPic','sk319AvatarLoaded');
        el.style.backgroundImage='';
        el.textContent=initials(name);
      }
    };
    img.src=candidate;
  };
  load();
}
function scanAvatars(){
  document.querySelectorAll(
    '#people .q26row[data-phone] .q26avatar,#chatAvatar,#infoAvatar'
  ).forEach(robustAvatar);
}

let avatarScanTimer=0;
function scheduleAvatarScan(){
  clearTimeout(avatarScanTimer);
  avatarScanTimer=setTimeout(scanAvatars,45);
}

/* Clear stale drafts/text after every text send. features295 clears the textarea
   but older ui26 draft storage can otherwise repopulate the last sent message. */
function clearComposer(phone){
  const box=D('messageBox');
  if(box){
    box.value='';
    box.style.height='auto';
    try{box.dispatchEvent(new Event('input',{bubbles:true}))}catch(_){}
  }
  if(phone){
    try{localStorage.removeItem('qevyno_draft_'+phone)}catch(_){}
  }
}
function installSendGuard(){
  const prior=window.send;
  if(typeof prior!=='function'||prior.__sk319)return;

  const wrapped=async function(){
    let phone='';
    try{phone=String(peer?.phone||'')}catch(_){}
    const box=D('messageBox');
    const hadText=!!String(box?.value||'').trim();

    const promise=prior.apply(this,arguments);
    if(hadText)clearComposer(phone);

    try{
      return await promise;
    }finally{
      if(hadText)clearComposer(phone);
    }
  };
  wrapped.__sk319=true;
  wrapped.__sk319Prior=prior;
  window.send=wrapped;

  const btn=D('sendBtn');
  if(btn){
    btn.onclick=e=>{
      e?.preventDefault?.();
      window.send();
    };
  }
}

/* Make sure the media layer's + button is present whenever the chat composer exists. */
function ensureMediaButton(){
  const composer=document.querySelector('#chatScreen .composer');
  if(!composer)return;
  // features307 owns the actual picker/upload flow. If it is loaded, its button
  // appears automatically. Trigger a harmless DOM mutation if it has not appeared yet.
  if(!composer.querySelector('.q307attach')){
    composer.dataset.sk319MediaWaiting='1';
    setTimeout(()=>{composer.dataset.sk319MediaWaiting='0'},0);
  }
}

function install(){
  installSendGuard();
  scanAvatars();
  ensureMediaButton();

  const people=D('people');
  if(people&&!people.__sk319Observer){
    people.__sk319Observer=true;
    new MutationObserver(scheduleAvatarScan).observe(people,{
      childList:true,subtree:true,attributes:true,
      attributeFilter:['class','style','data-phone']
    });
  }

  const chat=D('chatScreen');
  if(chat&&!chat.__sk319Observer){
    chat.__sk319Observer=true;
    new MutationObserver(scheduleAvatarScan).observe(chat,{
      childList:true,subtree:true,attributes:true,
      attributeFilter:['class','style']
    });
  }
}

setTimeout(install,250);
setTimeout(install,900);
setTimeout(install,1800);
window.addEventListener('focus',()=>{install();scheduleAvatarScan()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){install();scheduleAvatarScan()}});
})();