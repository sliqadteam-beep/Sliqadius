(()=>{
  const D=id=>document.getElementById(id);
  const state={
    conversations:[],
    filter:'',
    pins:new Set(JSON.parse(localStorage.getItem('qevyno_pins')||'[]')),
    compact:localStorage.getItem('qevyno_compact')==='1',
    reduceMotion:localStorage.getItem('qevyno_reduce_motion')==='1'
  };
  const savePins=()=>localStorage.setItem('qevyno_pins',JSON.stringify([...state.pins]));
  const draftKey=phone=>'qevyno_draft_'+phone;
  const esc2=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const initials=s=>{const p=String(s||'?').trim().split(/\s+/).filter(Boolean);return ((p[0]?.[0]||'?')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase().slice(0,2)};
  const fmtTime=t=>{if(!t)return'';const d=new Date(Number(t)*1000);if(Number.isNaN(d.getTime()))return'';const now=new Date(),same=d.toDateString()===now.toDateString();if(same)return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const y=new Date(now);y.setDate(now.getDate()-1);if(d.toDateString()===y.toDateString())return'Yesterday';return d.toLocaleDateString([],{day:'2-digit',month:'2-digit'})};
  const dayLabel=t=>{const d=new Date(Number(t)*1000),n=new Date(),y=new Date(n);y.setDate(n.getDate()-1);if(d.toDateString()===n.toDateString())return'Today';if(d.toDateString()===y.toDateString())return'Yesterday';return d.toLocaleDateString([],{weekday:'short',day:'numeric',month:'short'})};

  const style=document.createElement('style');
  style.id='qevyno26style';
  style.textContent=`
    :root{--bg:#07100c;--panel:#0e1b15;--panel2:#13251d;--line:#1e3a2c;--text:#f5fff8;--muted:#8fa59a;--green:#43e994;--green2:#24bf72;--danger:#ff6d75;--shadow:0 18px 55px rgba(0,0,0,.28)}
    body{background:radial-gradient(circle at 85% -10%,rgba(67,233,148,.11),transparent 32%),linear-gradient(180deg,#07100c,#08130e 58%,#06100b)}
    .app{background:transparent}.screen{background:transparent}.topbar{border-bottom:0;background:linear-gradient(180deg,rgba(7,16,12,.99),rgba(7,16,12,.9));backdrop-filter:blur(20px);padding:calc(12px + env(safe-area-inset-top)) 14px 10px;z-index:10}.brand{font-size:24px;letter-spacing:-1px}.iconbtn{background:#102019;border:1px solid rgba(255,255,255,.055);box-shadow:inset 0 1px rgba(255,255,255,.025)}
    .q26home{display:flex;flex-direction:column;height:100%;overflow:hidden}.q26hero{padding:8px 16px 13px}.q26heroTop{display:flex;align-items:flex-end;gap:12px}.q26eyebrow{font-size:12px;color:var(--muted);font-weight:700}.q26headline{font-size:32px;font-weight:950;letter-spacing:-1.4px;line-height:1.05;margin-top:3px}.q26me{width:44px;height:44px;border-radius:16px;background:linear-gradient(145deg,var(--green),#22bd70);color:#052014;font-weight:950;display:grid;place-items:center;box-shadow:0 8px 25px rgba(67,233,148,.13)}
    .q26server{margin-top:14px;display:inline-flex;align-items:center;gap:7px;font-size:11px;color:#a8bdb2;background:#0c1a14;border:1px solid #1d382b;border-radius:999px;padding:7px 10px;width:max-content}.q26server i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(67,233,148,.09)}.q26server.bad i{background:var(--danger);box-shadow:0 0 0 4px rgba(255,109,117,.08)}
    .q26searchWrap{padding:0 14px 8px;display:flex;gap:8px}.q26search{height:48px;flex:1;display:flex;align-items:center;gap:10px;background:#0d1b15;border:1px solid #1b3528;border-radius:16px;padding:0 14px}.q26search span{color:#6f877b;font-size:18px}.q26search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--text);font-size:15px}.q26new{width:48px;height:48px;border-radius:16px;background:var(--green);color:#06150d;font-size:26px;font-weight:500;box-shadow:0 9px 25px rgba(67,233,148,.13)}
    .people.q26people{padding:2px 10px 100px;flex:1;overflow-y:auto}.q26section{display:flex;align-items:center;gap:9px;padding:13px 7px 5px;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.11em;font-weight:850}.q26section .count{margin-left:auto;background:#102119;color:#9ab1a5;border-radius:999px;padding:3px 7px;letter-spacing:0}.q26row{display:flex;align-items:center;gap:12px;padding:11px 10px;margin:4px 0;border-radius:20px;position:relative;transition:.15s ease}.q26row:active{background:#0d1c15;transform:scale(.995)}.q26avatar{width:52px;height:52px;min-width:52px;border-radius:18px;background:linear-gradient(145deg,#1b4b34,#113020);border:1px solid #28573e;color:#b8ffd7;display:grid;place-items:center;font-size:17px;font-weight:950;letter-spacing:-.5px;position:relative}.q26avatar.online:after{content:'';position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:50%;background:var(--green);border:3px solid #08130e}.q26info{min-width:0;flex:1}.q26nameLine{display:flex;align-items:center;gap:7px}.q26name{font-size:16px;font-weight:850;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.q26pinMark{font-size:11px;color:var(--green)}.q26preview{font-size:13px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px}.q26right{display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:46px}.q26time{font-size:10.5px;color:#71867b}.q26badge{min-width:22px;height:22px;padding:0 7px;border-radius:999px;background:var(--green);color:#04130b;font-size:11px;font-weight:950;display:grid;place-items:center}.q26pin{position:absolute;right:49px;top:8px;opacity:0;width:31px;height:31px;border-radius:11px;background:#13261d;color:#8ba096;transition:.15s}.q26row:hover .q26pin,.q26row:focus-within .q26pin{opacity:1}.q26pin.active{opacity:1;color:var(--green)}
    .q26empty{margin:22px 5px;padding:34px 22px;background:linear-gradient(145deg,#0e1c16,#0a1711);border:1px dashed #274536;border-radius:24px;text-align:center}.q26emptyIcon{font-size:34px;margin-bottom:10px}.q26empty b{display:block;font-size:18px}.q26empty p{margin:7px 0 0;color:var(--muted);font-size:13px;line-height:1.55}.q26bottom{position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);width:min(430px,calc(100% - 28px));height:62px;border-radius:22px;background:rgba(13,27,21,.96);border:1px solid #1d392b;box-shadow:0 18px 55px rgba(0,0,0,.35);backdrop-filter:blur(22px);display:grid;grid-template-columns:repeat(3,1fr);padding:6px;z-index:20}.q26nav{border-radius:17px;background:transparent;color:#71867b;font-size:11px;font-weight:800;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.q26nav span{font-size:18px;line-height:18px}.q26nav.active{background:#153122;color:#aaffcf}.q26nav:active{transform:scale(.97)}
    .q26chatTop{display:flex;align-items:center;gap:10px;min-width:0;flex:1}.q26chatAvatar{width:42px;height:42px;border-radius:15px;background:linear-gradient(145deg,#1b4b34,#113020);border:1px solid #28573e;color:#c5ffdf;display:grid;place-items:center;font-size:14px;font-weight:950}.chatTitle{min-width:0;flex:1}.chatName{font-size:16px}.chatPresence{font-size:11px}.q26phone{color:#71867b}.q26infoBtn{font-size:18px}
    .messages{padding:10px 11px 18px;gap:4px;background:radial-gradient(circle at 70% 0%,rgba(67,233,148,.045),transparent 28%)}.q26day{align-self:center;margin:10px 0 8px;padding:5px 10px;border-radius:999px;background:#0d1b15;border:1px solid #1a3327;color:#789084;font-size:10.5px;font-weight:800}.bubbleRow{margin:1px 0}.bubble{max-width:83%;padding:10px 12px 7px;border-radius:18px 18px 18px 7px;background:#12241c;border:1px solid rgba(255,255,255,.035);box-shadow:0 4px 15px rgba(0,0,0,.08)}.mine .bubble{background:linear-gradient(145deg,#17613d,#1a7548);border-color:#277d52;border-radius:18px 18px 7px 18px}.btext{font-size:15.5px;line-height:1.38}.meta{font-size:9.5px;color:#b2c5ba}.q26compact .bubble{padding:7px 10px 5px;border-radius:14px 14px 14px 5px}.q26compact .mine .bubble{border-radius:14px 14px 5px 14px}.q26compact .btext{font-size:14.5px}.q26copyHint{position:fixed;left:50%;bottom:95px;transform:translateX(-50%) translateY(10px);opacity:0;pointer-events:none;background:#182a21;color:#d8ffe9;border:1px solid #2a4d3a;padding:9px 13px;border-radius:13px;font-size:12px;z-index:100;transition:.18s}.q26copyHint.show{opacity:1;transform:translateX(-50%) translateY(0)}
    .composer{background:linear-gradient(180deg,rgba(7,16,12,.7),#07100c);border-top:0;padding:7px 9px calc(9px + env(safe-area-inset-bottom));gap:7px}.q26composeBox{flex:1;background:#0e1d16;border:1px solid #1e3b2c;border-radius:21px;padding:5px 7px 5px 13px;display:flex;align-items:flex-end;gap:6px;min-height:54px}.composer textarea{background:transparent;border:0;border-radius:0;min-height:43px;max-height:120px;padding:11px 2px;font-size:15px}.q26chars{font-size:9px;color:#65796f;padding:0 3px 10px;display:none}.q26chars.show{display:block}.send{width:48px;height:48px;padding:0;border-radius:17px;font-size:20px;display:grid;place-items:center;box-shadow:0 8px 25px rgba(67,233,148,.12)}.q26scroll{position:absolute;right:15px;bottom:82px;width:40px;height:40px;border-radius:14px;background:#13261d;color:#b5cbbf;border:1px solid #234333;display:none;z-index:8}.q26scroll.show{display:block}
    .sheetBack{background:rgba(0,0,0,.7);backdrop-filter:blur(7px);z-index:60}.sheet{background:linear-gradient(180deg,#102019,#0b1712);border-color:#254332;border-radius:28px 28px 0 0;padding:12px 14px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -20px 70px rgba(0,0,0,.4);max-height:88vh;overflow-y:auto}.q26handle{width:42px;height:4px;border-radius:99px;background:#3b5045;margin:2px auto 15px}.q26sheetHead{display:flex;align-items:center;gap:12px;margin:0 3px 15px}.q26sheetHead h2{font-size:23px;letter-spacing:-.6px}.q26sheetClose{margin-left:auto;width:40px;height:40px;border-radius:14px;background:#14271e;color:var(--text);font-size:20px}.q26profile{display:flex;align-items:center;gap:13px;background:#0d1b15;border:1px solid #1d392b;border-radius:21px;padding:14px}.q26profile .q26avatar{width:54px;height:54px}.q26profile b{display:block;font-size:17px}.q26profile small{color:var(--muted)}.q26settingTitle{font-size:11px;color:#71867b;text-transform:uppercase;letter-spacing:.1em;font-weight:850;padding:18px 5px 7px}.q26setting{display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 12px;background:#0d1b15;border-bottom:1px solid #172d22}.q26setting:first-of-type{border-radius:18px 18px 0 0}.q26setting:last-of-type{border-radius:0 0 18px 18px;border-bottom:0}.q26settingIcon{width:34px;height:34px;border-radius:11px;background:#173023;color:#a5ffcb;display:grid;place-items:center}.q26settingText{flex:1}.q26settingText b{display:block;font-size:14px}.q26settingText span{color:var(--muted);font-size:11px}.q26switch{width:44px;height:26px;border-radius:999px;background:#24352d;padding:3px;transition:.2s}.q26switch:after{content:'';display:block;width:20px;height:20px;border-radius:50%;background:#789084;transition:.2s}.q26switch.on{background:#174d32}.q26switch.on:after{transform:translateX(18px);background:var(--green)}.q26statusGood{color:var(--green)!important}.q26danger{background:#32191c!important;color:#ffabb0!important}.q26sheetBtn{width:100%;height:52px;border-radius:17px;margin-top:10px;background:#14271e;color:var(--text);font-weight:850}.q26sheetBtn.primaryish{background:var(--green);color:#05150c}.q26newChatDesc{font-size:13px;color:var(--muted);line-height:1.5;margin:0 3px 8px}
    .conn{top:calc(8px + env(safe-area-inset-top));background:#4a2024;border:1px solid #74343b;color:#ffd9dc;padding:7px 12px;box-shadow:var(--shadow)}
    .q26nomotion *,body.q26nomotion *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
    @media(max-width:380px){.q26headline{font-size:29px}.q26avatar{width:48px;height:48px;min-width:48px}.q26bottom{height:59px}.q26pin{display:none}}
  `;
  document.head.appendChild(style);

  // Replace the old home and chat surfaces while keeping API-compatible IDs.
  D('homeScreen').innerHTML=`<div class="q26home">
    <div class="topbar"><div class="brand">Qevyno<span class="dot">.</span></div><div class="spacer"></div><button class="iconbtn" id="settingsBtn" aria-label="Settings">⚙</button></div>
    <div class="q26hero"><div class="q26heroTop"><div><div class="q26eyebrow" id="hello">Welcome back</div><div class="q26headline">Messages</div></div><div class="spacer"></div><div class="q26me" id="meAvatar">Q</div></div><div class="q26server" id="serverChip"><i></i><span>Official server</span></div></div>
    <div class="q26searchWrap"><label class="q26search"><span>⌕</span><input id="chatSearch" placeholder="Search chats" autocomplete="off"></label><button class="q26new" id="newChatBtn" aria-label="New chat">＋</button></div>
    <div class="people q26people" id="people"></div>
    <div class="q26bottom"><button class="q26nav active" id="navChats"><span>●</span>Chats</button><button class="q26nav" id="navNew"><span>＋</span>New</button><button class="q26nav" id="navSettings"><span>⚙</span>Settings</button></div>
  </div>`;

  D('chatScreen').innerHTML=`<div class="topbar"><button class="iconbtn" id="backBtn">‹</button><div class="q26chatTop"><div class="q26chatAvatar" id="chatAvatar">?</div><div class="chatTitle"><div class="chatName" id="chatName"></div><div class="chatPresence" id="chatPresence"></div></div></div><button class="iconbtn q26infoBtn" id="chatInfoBtn">ⓘ</button></div><div class="messages" id="messages"></div><button class="q26scroll" id="scrollBottom">↓</button><div class="composer"><div class="q26composeBox"><textarea rows="1" id="messageBox" maxlength="4000" placeholder="Message"></textarea><span class="q26chars" id="charCount">0</span></div><button class="send" id="sendBtn" aria-label="Send">➤</button></div></section>`;

  const oldSheet=D('sheetBack');
  oldSheet.innerHTML=`<div class="sheet"><div class="q26handle"></div><div class="q26sheetHead"><h2>Settings</h2><button class="q26sheetClose" id="closeSheetBtn">×</button></div><div class="q26profile"><div class="q26avatar" id="settingsAvatar">Q</div><div><b id="settingsName">Qevyno</b><small id="accountInfo"></small></div></div><div class="q26settingTitle">Connection</div><div class="q26setting"><div class="q26settingIcon">↗</div><div class="q26settingText"><b>Official server</b><span id="serverSettingText">qevyno.sliqado.org</span></div><button class="q26sheetClose" id="checkServerBtn">↻</button></div><div class="q26settingTitle">Appearance</div><div class="q26setting"><div class="q26settingIcon">☰</div><div class="q26settingText"><b>Compact messages</b><span>Fit more messages on screen</span></div><button class="q26switch" id="compactToggle"></button></div><div class="q26setting"><div class="q26settingIcon">◌</div><div class="q26settingText"><b>Reduce animations</b><span>Use simpler transitions</span></div><button class="q26switch" id="motionToggle"></button></div><div class="q26settingTitle">Local data</div><button class="q26sheetBtn" id="clearLocalBtn">Clear drafts & pinned chats</button><button class="q26sheetBtn q26danger" id="logoutBtn">Log out</button><div class="small" style="margin:14px 4px 2px">Qevyno 2.6.0 • Android 8+ • HTTPS transport</div></div>`;

  const newSheet=document.createElement('div');
  newSheet.className='sheetBack';newSheet.id='newChatSheet';
  newSheet.innerHTML=`<div class="sheet"><div class="q26handle"></div><div class="q26sheetHead"><h2>New chat</h2><button class="q26sheetClose" id="closeNewChat">×</button></div><p class="q26newChatDesc">Enter the exact international phone number. Qevyno never shows a public phone-number directory.</p><input class="field" id="findPhone" inputmode="tel" autocomplete="tel" placeholder="+49 176 12345678"><div class="error" id="findError"></div><button class="q26sheetBtn primaryish" id="findBtn">Find Qevyno user</button></div>`;
  document.body.appendChild(newSheet);

  const infoSheet=document.createElement('div');
  infoSheet.className='sheetBack';infoSheet.id='chatInfoSheet';
  infoSheet.innerHTML=`<div class="sheet"><div class="q26handle"></div><div class="q26sheetHead"><h2>Chat info</h2><button class="q26sheetClose" id="closeChatInfo">×</button></div><div class="q26profile"><div class="q26avatar" id="infoAvatar">?</div><div><b id="infoName"></b><small id="infoPhone"></small></div></div><button class="q26sheetBtn" id="pinChatBtn">Pin chat</button><button class="q26sheetBtn" id="copyNumberBtn">Copy phone number</button><div class="small" style="margin:13px 4px 2px">Hold a message to copy it.</div></div>`;
  document.body.appendChild(infoSheet);

  const toast=document.createElement('div');toast.className='q26copyHint';toast.id='q26toast';document.body.appendChild(toast);
  function toastMsg(t){toast.textContent=t;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),1500)}
  function copyText(t){try{const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toastMsg('Copied');}catch(e){toastMsg('Could not copy')}}
  function applyPrefs(){D('compactToggle').classList.toggle('on',state.compact);D('motionToggle').classList.toggle('on',state.reduceMotion);document.body.classList.toggle('q26compact',state.compact);document.body.classList.toggle('q26nomotion',state.reduceMotion)}

  window.home=async function(){
    stopPolls();peer=null;show('homeScreen');
    D('hello').textContent=meName?`Hi, ${meName}`:'Welcome back';D('meAvatar').textContent=initials(meName||mePhone||'Q');
    D('findError').textContent='';state.filter='';D('chatSearch').value='';
    await window.loadConversations();checkServer(false);pollHome=setInterval(window.loadConversations,3500);
  };

  window.loadConversations=async function(){
    if(!token)return;
    const r=await api('/api/conversations');
    if(!r||!r.ok){if(r&&r.error==='unauthorized'){clearSession();auth()}return;}
    state.conversations=r.conversations||[];window.renderConversations(state.conversations);
  };

  window.renderConversations=function(list){
    const q=state.filter.trim().toLowerCase();
    let items=(list||[]).filter(u=>!q||String(u.display_name||'').toLowerCase().includes(q)||String(u.phone||'').toLowerCase().includes(q)||String(u.last_message||'').toLowerCase().includes(q));
    items.sort((a,b)=>(state.pins.has(b.phone)?1:0)-(state.pins.has(a.phone)?1:0)||Number(b.last_at||0)-Number(a.last_at||0));
    const box=D('people');box.innerHTML='';
    if(!items.length){
      box.innerHTML=`<div class="q26empty"><div class="q26emptyIcon">💬</div><b>${q?'No matching chats':'No chats yet'}</b><p>${q?'Try another search.':'Tap + to start a private chat using an exact phone number.'}</p></div>`;return;
    }
    const pinned=items.filter(u=>state.pins.has(u.phone)),normal=items.filter(u=>!state.pins.has(u.phone));
    const addGroup=(title,arr)=>{if(!arr.length)return;const label=document.createElement('div');label.className='q26section';label.innerHTML=`<span>${title}</span><span class="count">${arr.length}</span>`;box.appendChild(label);arr.forEach(addRow)};
    function addRow(u){
      const row=document.createElement('div');row.className='q26row';row.tabIndex=0;
      const name=u.display_name||u.phone||'Unknown';
      row.innerHTML=`<div class="q26avatar ${u.online?'online':''}">${esc2(initials(name))}</div><div class="q26info"><div class="q26nameLine"><div class="q26name">${esc2(name)}</div>${state.pins.has(u.phone)?'<span class="q26pinMark">◆</span>':''}</div><div class="q26preview">${esc2(u.last_message||u.phone||'')}</div></div><button class="q26pin ${state.pins.has(u.phone)?'active':''}" aria-label="Pin chat">◆</button><div class="q26right"><div class="q26time">${esc2(fmtTime(u.last_at))}</div>${u.unread?`<div class="q26badge">${Math.min(99,Number(u.unread)||0)}</div>`:''}</div>`;
      row.onclick=e=>{if(e.target.closest('.q26pin'))return;openChat(u.phone,name,!!u.online,true)};
      row.onkeydown=e=>{if(e.key==='Enter')openChat(u.phone,name,!!u.online,true)};
      row.querySelector('.q26pin').onclick=e=>{e.stopPropagation();togglePin(u.phone);};
      box.appendChild(row);
    }
    addGroup('Pinned',pinned);addGroup('Recent chats',normal);
  };

  function togglePin(phone){if(state.pins.has(phone))state.pins.delete(phone);else state.pins.add(phone);savePins();window.renderConversations(state.conversations);if(peer&&peer.phone===phone)updateInfoSheet();toastMsg(state.pins.has(phone)?'Chat pinned':'Chat unpinned')}

  const oldFind=window.findPerson;
  window.findPerson=async function(){
    const phone=normalizePhone(D('findPhone').value);D('findError').textContent='';
    if(!/^\+[1-9]\d{7,14}$/.test(phone)){D('findError').textContent='Enter the full international number, e.g. +49…';return;}
    D('findBtn').disabled=true;D('findBtn').textContent='Searching…';
    const r=await api('/api/find?phone='+encodeURIComponent(phone));
    D('findBtn').disabled=false;D('findBtn').textContent='Find Qevyno user';
    if(r&&r.ok){closeNewChat();openChat(r.user.phone,r.user.display_name||r.user.phone,!!r.user.online,true)}
    else{const map={not_found:'No Qevyno account exists for that number.',self:'That is your own number.',server_unreachable:'Qevyno server is unreachable.'};D('findError').textContent=map[r&&r.error]||(r&&r.error)||'Could not find that account.';}
  };

  window.openChat=function(phone,name,online,push){
    stopPolls();peer={phone,name};D('chatName').textContent=name;D('chatAvatar').textContent=initials(name);D('chatPresence').innerHTML=`<span class="q26phone">${esc2(phone)}</span> • <span class="${online?'online':''}">${online?'● Online':'Offline'}</span>`;D('messages').innerHTML='';lastRenderKey='';show('chatScreen');
    const draft=localStorage.getItem(draftKey(phone))||'';D('messageBox').value=draft;resizeMessageBox();updateCharCount();
    if(push)history.pushState({chat:phone},'','#chat');loadMessages();pollChat=setInterval(()=>{loadMessages();refreshPresence()},1500);
  };

  window.refreshPresence=async function(){if(!peer)return;const r=await api('/api/find?phone='+encodeURIComponent(peer.phone));if(r&&r.ok){peer.name=r.user.display_name||peer.name;D('chatName').textContent=peer.name;D('chatAvatar').textContent=initials(peer.name);D('chatPresence').innerHTML=`<span class="q26phone">${esc2(peer.phone)}</span> • <span class="${r.user.online?'online':''}">${r.user.online?'● Online':'Offline'}</span>`;}};

  window.renderMessages=function(arr){
    const key=arr.map(m=>[m.id,m.read_at].join(':')).join('|');if(key===lastRenderKey)return;lastRenderKey=key;
    const box=D('messages'),nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<140;box.innerHTML='';let lastDay='';
    arr.forEach(m=>{
      const dl=dayLabel(m.sent_at||0);if(dl!==lastDay){lastDay=dl;const day=document.createElement('div');day.className='q26day';day.textContent=dl;box.appendChild(day)}
      const mine=(m.sender_phone||'')===mePhone,row=document.createElement('div');row.className='bubbleRow'+(mine?' mine':'');const bubble=document.createElement('div');bubble.className='bubble';const text=document.createElement('div');text.className='btext';text.textContent=m.text||'';const meta=document.createElement('div');meta.className='meta';const time=new Date((m.sent_at||0)*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});meta.textContent=time+(mine?(m.read_at?'  ✓✓':'  ✓'):'');bubble.append(text,meta);row.appendChild(bubble);box.appendChild(row);
      let timer=null;bubble.addEventListener('pointerdown',()=>{timer=setTimeout(()=>copyText(m.text||''),550)});['pointerup','pointercancel','pointerleave'].forEach(ev=>bubble.addEventListener(ev,()=>{if(timer)clearTimeout(timer)}));bubble.addEventListener('contextmenu',e=>{e.preventDefault();copyText(m.text||'')});
    });
    if(nearBottom||!box.dataset.rendered){box.scrollTop=box.scrollHeight;box.dataset.rendered='1'}
  };

  const oldSend=window.send;
  window.send=async function(){
    const text=D('messageBox').value.trim();if(!text||!peer)return;D('messageBox').value='';localStorage.removeItem(draftKey(peer.phone));resizeMessageBox();updateCharCount();D('sendBtn').disabled=true;
    const r=await api('/api/send','POST',{to:peer.phone,text});D('sendBtn').disabled=false;
    if(!r||!r.ok){D('messageBox').value=text;localStorage.setItem(draftKey(peer.phone),text);resizeMessageBox();updateCharCount();toastMsg('Message could not be sent');return;}await loadMessages();
  };

  function openNewChat(){D('findPhone').value='';D('findError').textContent='';newSheet.classList.add('open');setTimeout(()=>D('findPhone').focus(),120)}
  function closeNewChat(){newSheet.classList.remove('open')}
  function updateInfoSheet(){if(!peer)return;D('infoAvatar').textContent=initials(peer.name);D('infoName').textContent=peer.name;D('infoPhone').textContent=peer.phone;D('pinChatBtn').textContent=state.pins.has(peer.phone)?'Unpin chat':'Pin chat'}
  function openChatInfo(){if(!peer)return;updateInfoSheet();infoSheet.classList.add('open')}
  function closeChatInfo(){infoSheet.classList.remove('open')}

  window.openSettings=function(){D('settingsName').textContent=meName||'Qevyno';D('accountInfo').textContent=mePhone||'';D('settingsAvatar').textContent=initials(meName||mePhone||'Q');oldSheet.classList.add('open');applyPrefs();checkServer(true)};
  window.closeSettings=function(){oldSheet.classList.remove('open')};
  async function checkServer(inSettings){
    const r=await api('/health?_='+Date.now(),'GET',null,false);const ok=!!(r&&r.ok);const chip=D('serverChip');if(chip){chip.classList.toggle('bad',!ok);chip.querySelector('span').textContent=ok?`Server online • v${r.version||'?'}`:'Server unavailable'}
    if(inSettings&&D('serverSettingText')){D('serverSettingText').textContent=ok?`Online • Qevyno ${r.version||''}`:'Server unavailable';D('serverSettingText').classList.toggle('q26statusGood',ok)}return ok;
  }

  function updateCharCount(){const n=D('messageBox').value.length;D('charCount').textContent=n;D('charCount').classList.toggle('show',n>=3500)}
  function bind(){
    D('chatSearch').oninput=e=>{state.filter=e.target.value;window.renderConversations(state.conversations)};
    D('newChatBtn').onclick=openNewChat;D('navNew').onclick=openNewChat;D('navSettings').onclick=openSettings;D('settingsBtn').onclick=openSettings;
    D('closeNewChat').onclick=closeNewChat;newSheet.onclick=e=>{if(e.target===newSheet)closeNewChat()};D('findBtn').onclick=window.findPerson;D('findPhone').onkeydown=e=>{if(e.key==='Enter')window.findPerson()};
    D('closeSheetBtn').onclick=closeSettings;oldSheet.onclick=e=>{if(e.target===oldSheet)closeSettings()};D('checkServerBtn').onclick=()=>checkServer(true);
    D('compactToggle').onclick=()=>{state.compact=!state.compact;localStorage.setItem('qevyno_compact',state.compact?'1':'0');applyPrefs()};D('motionToggle').onclick=()=>{state.reduceMotion=!state.reduceMotion;localStorage.setItem('qevyno_reduce_motion',state.reduceMotion?'1':'0');applyPrefs()};
    D('clearLocalBtn').onclick=()=>{[...state.pins].forEach(()=>{});state.pins.clear();savePins();Object.keys(localStorage).filter(k=>k.startsWith('qevyno_draft_')).forEach(k=>localStorage.removeItem(k));window.renderConversations(state.conversations);toastMsg('Local drafts and pins cleared')};D('logoutBtn').onclick=logout;
    D('backBtn').onclick=()=>history.back();D('sendBtn').onclick=window.send;D('messageBox').addEventListener('input',()=>{resizeMessageBox();updateCharCount();if(peer)localStorage.setItem(draftKey(peer.phone),D('messageBox').value)});D('messageBox').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();window.send()}});
    D('chatInfoBtn').onclick=openChatInfo;D('closeChatInfo').onclick=closeChatInfo;infoSheet.onclick=e=>{if(e.target===infoSheet)closeChatInfo()};D('pinChatBtn').onclick=()=>{if(peer)togglePin(peer.phone)};D('copyNumberBtn').onclick=()=>{if(peer)copyText(peer.phone)};
    D('scrollBottom').onclick=()=>{D('messages').scrollTop=D('messages').scrollHeight};D('messages').onscroll=()=>{const b=D('messages');D('scrollBottom').classList.toggle('show',b.scrollHeight-b.scrollTop-b.clientHeight>180)};
  }
  bind();applyPrefs();
  try{document.querySelector('.sheet .small:last-child');}catch(e){}
  if(token&&D('homeScreen').classList.contains('active'))home();
})();