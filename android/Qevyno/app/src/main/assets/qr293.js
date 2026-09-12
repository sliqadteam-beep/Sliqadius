(()=>{
  const D=id=>document.getElementById(id);

  const style=document.createElement('style');
  style.id='qevyno293style';
  style.textContent=`
    .q26bottom{display:none!important}.people.q26people{padding-bottom:86px!important}.q26new{bottom:calc(18px + env(safe-area-inset-bottom))!important}
    .q293menu{position:fixed;right:12px;top:calc(54px + env(safe-area-inset-top));z-index:180;min-width:155px;padding:6px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 12px 34px rgba(23,33,43,.14);display:none}.q293menu.on{display:block}.q293menu button{width:100%;height:44px;padding:0 13px;border-radius:10px;background:transparent;color:var(--text);text-align:left;font-size:14px;font-weight:600}.q293menu button:active{background:#eef4f5}
    .q293qrsec{margin-top:14px;padding:16px;background:#f7fafc;border:1px solid var(--line);border-radius:16px;text-align:center}.q293qrtitle{font-size:16px;font-weight:680;color:var(--text)}.q293qrsub{margin:4px auto 13px;max-width:300px;font-size:12px;line-height:1.45;color:var(--muted)}.q293qrbox{width:210px;height:210px;margin:0 auto;padding:12px;background:#fff;border:1px solid #e4ecef;border-radius:16px;display:grid;place-items:center}.q293qrbox img{width:100%;height:100%;display:block;image-rendering:auto}.q293qrphone{margin-top:10px;font-size:12px;color:#61737c;font-weight:600;user-select:text}.q293hint{margin-top:6px;font-size:11px;color:#87969d}
    .q293full{position:fixed;inset:0;z-index:220;background:rgba(23,33,43,.72);display:none;align-items:center;justify-content:center;padding:24px}.q293full.on{display:flex}.q293fullcard{width:min(360px,94vw);padding:22px;background:#fff;border-radius:22px;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.22)}.q293fullcard img{width:min(300px,76vw);height:auto;display:block;margin:auto}.q293fullcard b{display:block;margin-top:14px;font-size:16px;color:var(--text)}.q293fullcard span{display:block;margin-top:4px;font-size:12px;color:var(--muted)}
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
  full.innerHTML='<div class="q293fullcard"><img id="q293fullimg" alt="Qevyno QR code"><b>Your Qevyno QR code</b><span id="q293fullphone"></span></div>';
  document.body.appendChild(full);

  function qrLink(){
    return 'https://sliqado.org/Qevyno/add/?phone='+encodeURIComponent(mePhone||'');
  }

  function qrData(){
    try{
      if(window.QevynoDevice&&QevynoDevice.makeQr)return QevynoDevice.makeQr(qrLink())||'';
    }catch(e){}
    return '';
  }

  function ensureQr(){
    const sheet=document.querySelector('#sheetBack .sheet');
    if(!sheet||!mePhone)return;
    let sec=D('q293qrsec');
    if(!sec){
      sec=document.createElement('div');
      sec.id='q293qrsec';
      sec.className='q293qrsec';
      sec.innerHTML='<div class="q293qrtitle">Your QR code</div><div class="q293qrsub">Let someone scan this code to start a chat with you.</div><button class="q293qrbox" id="q293qrbox" aria-label="Open QR code"><img id="q293qrimg" alt="Your Qevyno QR code"></button><div class="q293qrphone" id="q293qrphone"></div><div class="q293hint">Only your Qevyno phone number is included in the code.</div>';
      const profile=sheet.querySelector('.q26profile');
      if(profile&&profile.nextSibling)sheet.insertBefore(sec,profile.nextSibling);else if(profile)profile.after(sec);else sheet.prepend(sec);
      D('q293qrbox').onclick=()=>{
        const src=D('q293qrimg').src;
        if(!src)return;
        D('q293fullimg').src=src;D('q293fullphone').textContent=mePhone||'';full.classList.add('on');
      };
    }
    D('q293qrphone').textContent=mePhone;
    const src=qrData();
    if(src)D('q293qrimg').src=src;
  }

  const settingsBtn=D('settingsBtn');
  if(settingsBtn){
    settingsBtn.textContent='⋮';
    settingsBtn.setAttribute('aria-label','Menu');
    settingsBtn.onclick=e=>{e.stopPropagation();menu.classList.toggle('on');};
  }
  D('q293settings').onclick=()=>{menu.classList.remove('on');if(typeof openSettings==='function')openSettings();setTimeout(ensureQr,40);};
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==settingsBtn)menu.classList.remove('on');});
  full.onclick=e=>{if(e.target===full||e.target.closest('.q293fullcard'))full.classList.remove('on');};

  // If another user scans a Qevyno QR code, the deep link resolves the exact
  // phone number through the normal authenticated exact-number lookup.
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
  },900);

  const oldSave=window.saveSession;
  if(typeof oldSave==='function'){
    window.saveSession=function(d){oldSave(d);setTimeout(()=>{const p=localStorage.getItem('qevyno_pending_add')||'';if(p)openSharedPhone(p);},350);};
  }

  setTimeout(()=>{document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.3 • Android 8+';});},120);
})();
