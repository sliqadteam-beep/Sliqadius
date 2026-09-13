(()=>{
'use strict';
if(window.__skaysa318Installed)return;
window.__skaysa318Installed=true;

const VERSION='2.9.47';
const D=id=>document.getElementById(id);

const css=document.createElement('style');
css.id='skaysa318style';
css.textContent=`
:root{
  --sk-bg:#f4f7fa;
  --sk-card:#ffffff;
  --sk-line:#e8eef3;
  --sk-text:#17212b;
  --sk-muted:#7b8a95;
  --sk-blue:#6aaef0;
  --sk-blue2:#4f93dc;
}
html,body{background:var(--sk-bg)!important;color:var(--sk-text)!important}
#homeScreen{background:var(--sk-bg)!important}
#homeScreen .topbar{background:transparent!important;border:0!important;padding:12px 16px 0!important;backdrop-filter:none!important}
#homeScreen .q26hero{padding:8px 18px 8px!important}
#homeScreen .q26headline{font-size:30px!important;line-height:1.05!important;letter-spacing:-1px!important;font-weight:900!important;margin:0!important;color:var(--sk-text)!important}
#homeScreen .q26searchWrap{padding:4px 16px 10px!important;gap:8px!important}
#homeScreen .q26search{
  height:46px!important;
  border-radius:15px!important;
  background:#eef3f6!important;
  border:1px solid transparent!important;
  box-shadow:none!important;
  padding:0 13px!important;
}
#homeScreen .q26search:focus-within{background:#fff!important;border-color:#b9d6ef!important;box-shadow:0 0 0 3px rgba(87,157,222,.10)!important}
#homeScreen #chatSearch{font-size:14px!important;color:var(--sk-text)!important}
#homeScreen #chatSearch::placeholder{color:#8b99a3!important;opacity:1!important}
#homeScreen .q26new{
  position:fixed!important;
  right:20px!important;
  bottom:calc(22px + env(safe-area-inset-bottom))!important;
  width:54px!important;
  height:54px!important;
  min-width:54px!important;
  border-radius:18px!important;
  background:linear-gradient(145deg,#7dbcf3,#5c9fdf)!important;
  color:#17344e!important;
  box-shadow:0 12px 26px rgba(77,142,204,.28)!important;
  z-index:80!important;
  font-size:28px!important;
}
#people{
  width:100%!important;
  padding:2px 14px 100px!important;
  box-sizing:border-box!important;
  background:transparent!important;
}
#people>.q26section{padding:9px 4px 5px!important;color:#93a0a9!important;font-size:10px!important}
#people>.q26row,
#people>.q306groupRow{
  min-height:68px!important;
  margin:0 0 8px!important;
  padding:10px 11px!important;
  border:1px solid var(--sk-line)!important;
  border-radius:17px!important;
  background:var(--sk-card)!important;
  box-shadow:0 2px 8px rgba(23,33,43,.025)!important;
  transform:none!important;
}
#people>.q26row:active,#people>.q306groupRow:active{background:#f7fafc!important;transform:scale(.995)!important}
#people .q26avatar{
  width:48px!important;
  height:48px!important;
  min-width:48px!important;
  border-radius:16px!important;
  border:0!important;
  background:#e3f2f4!important;
  color:#2c7f87!important;
  font-size:15px!important;
  box-shadow:none!important;
}
#people .q26avatar.online:after{width:10px!important;height:10px!important;border-width:2px!important;border-color:#fff!important}
#people .q26name{font-size:15.5px!important;font-weight:800!important;color:var(--sk-text)!important}
#people .q26preview{font-size:12.5px!important;color:var(--sk-muted)!important;margin-top:3px!important}
#people .q26time{font-size:10.5px!important;color:#98a5ae!important}
#people .q26badge{background:#82bff0!important;color:#17344e!important}
#people .q26pin{display:none!important}
#people .q305phone{display:none!important}
#people .q299helpRow{display:none!important}

.q308profileChip{
  margin-top:0!important;
  min-height:44px!important;
  border:1px solid var(--sk-line)!important;
  border-radius:17px!important;
  background:#fff!important;
  box-shadow:0 2px 8px rgba(23,33,43,.035)!important;
  padding:5px 8px!important;
}
.q308profileChip .q308miniAvatar{width:36px!important;height:36px!important;min-width:36px!important;border-radius:12px!important}
.q308profileChip .q308miniInfo{font-size:11px!important}

#chatScreen{background:#f3f6f8!important}
#chatScreen .topbar{
  background:#fff!important;
  border-bottom:1px solid var(--sk-line)!important;
  padding:calc(8px + env(safe-area-inset-top)) 10px 8px!important;
  backdrop-filter:none!important;
}
#chatScreen .q26chatAvatar{width:40px!important;height:40px!important;border-radius:14px!important;border:0!important;background:#e4f2f4!important;color:#287d84!important}
#chatScreen .chatName{font-size:16px!important;font-weight:850!important;color:var(--sk-text)!important}
#chatScreen .chatPresence{font-size:10.5px!important;color:#8897a1!important}
#messages,.messages{
  background:#f3f6f8!important;
  padding:12px 10px 18px!important;
  gap:3px!important;
}
.bubble{
  background:#fff!important;
  border:1px solid #e6edf2!important;
  box-shadow:0 1px 4px rgba(23,33,43,.03)!important;
  border-radius:17px 17px 17px 6px!important;
  padding:9px 11px 7px!important;
}
.mine .bubble{
  background:#dceeff!important;
  border-color:#d0e5f8!important;
  border-radius:17px 17px 6px 17px!important;
}
.btext{font-size:15px!important;line-height:1.38!important;color:var(--sk-text)!important}
.meta{font-size:9px!important;color:#87959e!important}
.q26day{background:#e8eef2!important;border:0!important;color:#7b8992!important}
.composer{
  background:#fff!important;
  border-top:1px solid var(--sk-line)!important;
  padding:7px 8px calc(8px + env(safe-area-inset-bottom))!important;
}
.q26composeBox{
  min-height:50px!important;
  border-radius:18px!important;
  background:#f2f5f7!important;
  border:1px solid transparent!important;
}
.q26composeBox:focus-within{background:#fff!important;border-color:#c9dcea!important}
.composer textarea{font-size:14.5px!important;color:var(--sk-text)!important}
.send{
  width:48px!important;
  height:48px!important;
  border-radius:16px!important;
  background:linear-gradient(145deg,#75b8ef,#5598db)!important;
  color:#17344e!important;
  box-shadow:none!important;
}
.sheet{background:#fff!important;border-color:var(--sk-line)!important}
button,input,textarea{-webkit-tap-highlight-color:transparent!important}
@media(max-width:380px){
  #homeScreen .q26headline{font-size:27px!important}
  #people{padding-left:10px!important;padding-right:10px!important}
}
`;
document.head.appendChild(css);

function removeHelp(){
  document.querySelectorAll('.q299helpRow').forEach(el=>el.remove());
}

function cleanRows(){
  document.querySelectorAll('#people>.q26row').forEach(row=>{
    if(row.classList.contains('q299helpRow')){row.remove();return}
    const phone=String(row.dataset.phone||'').trim();
    if(!phone)return;
    const preview=row.querySelector('.q26preview');
    const phoneLine=row.querySelector('.q305phone');
    if(phoneLine)phoneLine.style.display='none';
    if(preview){
      const ptxt=String(preview.textContent||'').replace(/\s/g,'');
      const norm=phone.replace(/\s/g,'');
      if(ptxt===norm)preview.textContent='';
    }
  });
}

let opening=false;
let activePhone='';

function installOpenChat(){
  const prior=window.openChat;
  if(typeof prior!=='function'||prior.__sk318)return;

  const wrapped=function(phone,name,online,push){
    phone=String(phone||'').trim();
    if(!phone)return;
    if(opening&&activePhone===phone)return;

    opening=true;
    activePhone=phone;

    try{
      const r=prior.call(this,phone,name,online,false);
      requestAnimationFrame(()=>{
        const home=D('homeScreen');
        const chat=D('chatScreen');
        if(home)home.classList.remove('active');
        if(chat)chat.classList.add('active');
        try{
          if(typeof window.loadMessages==='function')window.loadMessages();
        }catch(_){}
      });
      setTimeout(()=>{opening=false},260);
      return r;
    }catch(e){
      opening=false;
      throw e;
    }
  };
  wrapped.__sk318=true;
  wrapped.__sk318Prior=prior;
  window.openChat=wrapped;
}

window.skaysaHandleBack=function(){
  const reaction=document.querySelector('.q315reactionBack.on,.q315confirmBack.on,.q295actionBack.on');
  if(reaction){reaction.classList.remove('on');return true}

  const group=document.querySelector('.q306groupScreen.on');
  if(group){
    const b=group.querySelector('.q306backBtn');
    if(b)b.click(); else group.classList.remove('on');
    return true;
  }

  const sheet=[...document.querySelectorAll('.sheetBack.open,.sheetBack.on,.q306back.on')].find(x=>x.offsetParent!==null);
  if(sheet){
    sheet.classList.remove('open');
    sheet.classList.remove('on');
    return true;
  }

  const chat=D('chatScreen');
  if(chat&&chat.classList.contains('active')){
    try{if(typeof window.home==='function')window.home()}catch(_){}
    return true;
  }
  return false;
};

function install(){
  removeHelp();
  cleanRows();
  installOpenChat();

  const people=D('people');
  if(people&&!people.__sk318obs){
    people.__sk318obs=true;
    new MutationObserver(()=>{
      removeHelp();
      cleanRows();
    }).observe(people,{childList:true,subtree:true});
  }
}

setTimeout(install,180);
setTimeout(install,700);
setTimeout(install,1600);
window.addEventListener('focus',install);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)install()});
})();