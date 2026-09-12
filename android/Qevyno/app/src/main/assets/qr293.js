(()=>{
  const D=id=>document.getElementById(id);

  const style=document.createElement('style');
  style.id='qevyno293style';
  style.textContent=`
    .q26bottom{display:none!important}.people.q26people{padding-bottom:86px!important}.q26new{bottom:calc(18px + env(safe-area-inset-bottom))!important}
    .q293menu{position:fixed;right:12px;top:calc(54px + env(safe-area-inset-top));z-index:180;min-width:155px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 34px rgba(23,33,43,.14);display:none}.q293menu.on{display:block}.q293menu button{width:100%;height:44px;padding:0 13px;border-radius:10px;background:transparent;color:var(--text);text-align:left;font-size:14px;font-weight:600}.q293menu button:active{background:#eef4f5}
    .q293qrsec{margin-top:14px;padding:16px;background:#f7fafc;border:1px solid var(--line);border-radius:16px;text-align:center}.q293qrtitle{font-size:16px;font-weight:680;color:var(--text)}.q293qrsub{margin:4px auto 13px;max-width:300px;font-size:12px;line-height:1.45;color:var(--muted)}.q293qrbox{width:210px;height:210px;margin:0 auto;padding:12px;background:#fff;border:1px solid #e4ecef;border-radius:16px;display:grid;place-items:center}.q293qrbox img{width:100%;height:100%;display:block;image-rendering:auto}.q293qrphone{margin-top:10px;font-size:12px;color:#61737c;font-weight:600;user-select:text}.q293hint{margin-top:6px;font-size:11px;color:#87969d}
    .q293plusqr{margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:#f7fafc;display:flex;align-items:center;gap:13px}.q293plusqr img{width:104px;height:104px;padding:7px;background:#fff;border:1px solid #e2eaed;border-radius:12px;flex:0 0 auto}.q293plusqrtext{min-width:0}.q293plusqrtext b{display:block;font-size:14px;color:var(--text);margin-bottom:4px}.q293plusqrtext span{display:block;font-size:11.5px;line-height:1.4;color:var(--muted)}
    .q293full{position:fixed;inset:0;z-index:220;background:rgba(23,33,43,.72);display:none;align-items:center;justify-content:center;padding:24px}.q293full.on{display:flex}.q293fullcard{width:min(360px,94vw);padding:22px;background:#fff;border-radius:22px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.22)}.q293fullcard img{width:min(300px,76vw);height:auto;display:block;margin:auto}.q293fullcard b{display:block;margin-top:14px;font-size:16px;color:var(--text)}.q293fullcard span{display:block;margin-top:4px;font-size:12px;color:var(--muted)}
    @media(max-width:390px){.q293plusqr{align-items:flex-start}.q293plusqr img{width:92px;height:92px}}
  `;
  document.head.appendChild(style);

  const menu=document.createElement('div');
  menu.className='q293menu';
  menu.id='q293menu';
  menu.innerHTML='<button id="q293settings">Settings</button>';
  document.body.appendChild(menu);

  const full=document.createElement('div');
  full.className='q293full';
  full.id='q293full';
  full.innerHTML='<div class="q293fullcard"><img id="q293fullimg" alt="Qevyno QR code"><b id="q293fulltitle">Your Qevyno QR code</b><span id="q293fullphone"></span></div>';
  document.body.appendChild(full);

  function qrLink(phone){
    return 'https://sliqado.org/Qevyno/add/?phone='+encodeURIComponent(phone||'');
  }

  function qrData(phone){
    phone=String(phone||mePhone||'').trim();
    if(!/^\+[1-9]\d{7,14}$/.test(phone))return '';
    try{
      if(window.QevynoDevice&&QevynoDevice.getOrCreateQr)return QevynoDevice.getOrCreateQr(phone)||'';
      if(window.QevynoDevice&&QevynoDevice.makeQr)return QevynoDevice.makeQr(qrLink(phone))||'';
    }catch(e){}
    return '';
  }

  function openBigQr(src){
    if(!src)return;
    D('q293fullimg').src=src;
    D('q293fullphone').textContent=mePhone||'';
    full.classList.add('on');
  }

  function ensureSettingsQr(){
    const sheet=document.querySelector('#sheetBack .sheet');
    if(!sheet||!mePhone)return;
    let sec=D('q293qrsec');
    if(!sec){
      sec=document.createElement('div');
      sec.id='q293qrsec';
      sec.className='q293qrsec';
      sec.innerHTML='<div class="q293qrtitle">Your QR code</div><div class="q293qrsub">Let someone scan this code to start a chat with you.</div><button class="q293qrbox" id="q293qrbox" aria-label="Open QR code"><img id="q293qrimg" alt="Your Qevyno QR code"></button><div class="q293qrphone" id="q293qrphone"></div><div class="q293hint">The QR code is generated and stored on this device. If it is missing, Qevyno creates a new one automatically.</div>';
      const profile=sheet.querySelector('.q26profile');
      if(profile&&profile.nextSibling)sheet.insertBefore(sec,profile.nextSibling);else if(profile)profile.after(sec);else sheet.prepend(sec);
      D('q293qrbox').onclick=()=>openBigQr(D('q293qrimg').src);
    }
    D('q293qrphone').textContent=mePhone;
    const src=qrData(mePhone);
    if(src)D('q293qrimg').src=src;
  }

  function ensurePlusQr(){
    const sheet=document.querySelector('#newChatSheet .sheet');
    const input=D('findPhone');
    if(!sheet||!input||!mePhone)return;
    let sec=D('q293plusqr');
    if(!sec){
      sec=document.createElement('button');
      sec.type='button';
      sec.id='q293plusqr';
      sec.className='q293plusqr';
      sec.innerHTML='<img id="q293plusimg" alt="Your Qevyno QR code"><span class="q293plusqrtext"><b id="q293plustitle">Or let them scan your QR</b><span id="q293plussub">Your QR code is stored on this phone and opens a chat with you.</span></span>';
      input.insertAdjacentElement('afterend',sec);
      sec.onclick=()=>openBigQr(D('q293plusimg').src);
    }
    const src=qrData(mePhone);
    if(src)D('q293plusimg').src=src;
  }

  function refreshOwnQr(){
    if(!mePhone)return;
    qrData(mePhone);
    ensureSettingsQr();
    ensurePlusQr();
  }
  window.qevynoRefreshOwnQr=refreshOwnQr;

  const settingsBtn=D('settingsBtn');
  if(settingsBtn){
    settingsBtn.textContent='⋮';
    settingsBtn.setAttribute('aria-label','Menu');
    settingsBtn.onclick=e=>{e.stopPropagation();menu.classList.toggle('on');};
  }
  D('q293settings').onclick=()=>{menu.classList.remove('on');if(typeof openSettings==='function')openSettings();setTimeout(ensureSettingsQr,40);};
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==settingsBtn)menu.classList.remove('on');});
  full.onclick=e=>{if(e.target===full)full.classList.remove('on');};

  const newChatBtn=D('newChatBtn');
  if(newChatBtn){
    const oldClick=newChatBtn.onclick;
    newChatBtn.onclick=e=>{if(typeof oldClick==='function')oldClick.call(newChatBtn,e);setTimeout(ensurePlusQr,30);};
  }
  const navNew=D('navNew');
  if(navNew){
    const oldClick=navNew.onclick;
    navNew.onclick=e=>{if(typeof oldClick==='function')oldClick.call(navNew,e);setTimeout(ensurePlusQr,30);};
  }

  async function openSharedPhone(phone){
    phone=String(phone||'').trim();
    if(!/^\+[1-9]\d{7,14}$/.test(phone))return;
    if(!token){localStorage.setItem('qevyno_pending_add',phone);return;}
    if(phone===mePhone)return;
    const r=await api('/api/find?phone='+encodeURIComponent(phone));
    if(r&&r.ok&&r.user){
      localStorage.removeItem('qevyno_pending_add');
      openChat(r.user.phone,r.user.display_name||r.user.phone,!!r.user.online,true);
    }
  }
  window.qevynoConsumeNativeAdd=phone=>setTimeout(()=>openSharedPhone(phone),250);

  setTimeout(()=>{
    let incoming='';
    try{if(window.QevynoDevice&&QevynoDevice.consumePendingAddPhone)incoming=QevynoDevice.consumePendingAddPhone()||'';}catch(e){}
    if(!incoming)incoming=localStorage.getItem('qevyno_pending_add')||'';
    if(incoming)openSharedPhone(incoming);
    if(mePhone)refreshOwnQr();
  },900);

  const oldSave=window.saveSession;
  if(typeof oldSave==='function'){
    window.saveSession=function(d){
      oldSave(d);
      try{if(d&&d.phone&&window.QevynoDevice&&QevynoDevice.getOrCreateQr)QevynoDevice.getOrCreateQr(d.phone);}catch(e){}
      setTimeout(()=>{
        refreshOwnQr();
        const p=localStorage.getItem('qevyno_pending_add')||'';
        if(p)openSharedPhone(p);
      },350);
    };
  }

  setTimeout(()=>{document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.6 • Android 8+';});},120);
})();

(()=>{
  if(document.getElementById('qevyno296loader'))return;
  const s=document.createElement('script');
  s.id='qevyno296loader';
  s.src='file:///android_asset/features296.js';
  document.head.appendChild(s);
})();
