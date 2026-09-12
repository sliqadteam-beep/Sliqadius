(()=>{
  const D=id=>document.getElementById(id);
  const VERIFIED_PHONE='+4915229463681';
  const REACTIONS=['👍','❤️','😂','😮','😢','🎉'];
  const fallbackChatKey=p=>'qevyno_chat_'+p;
  const metaKey='qevyno_local_conversations_v2';
  let syncing=false, ownMeta={phone:mePhone||'',display_name:meName||'',verified:(mePhone===VERIFIED_PHONE),avatar_url:null};

  const tx=(()=>{
    const phone=()=>String(mePhone||localStorage.getItem('qevyno_phone')||'');
    const lang=()=>{const p=phone();if(p.startsWith('+49'))return'de';if(p.startsWith('+34'))return'es';if(p.startsWith('+33'))return'fr';if(p.startsWith('+39'))return'it';if(p.startsWith('+31'))return'nl';if(p.startsWith('+48'))return'pl';if(p.startsWith('+90'))return'tr';return'en'};
    const P={
      en:{photo:'Profile picture',photoSub:'Choose a photo. Maximum 1600 × 1600.',changePhoto:'Choose photo',removePhoto:'Remove photo',badPhoto:'Could not use that picture.',uploadPhoto:'Uploading profile picture…',savedPhoto:'Profile picture updated',menuTitle:'Message',delete:'Delete',deleteMine:'Delete for both devices',deleteLocal:'Delete from this device',react:'React',messagesDevice:'Messages are stored on your device, not in the server database.',offlineWarn:'Messages can only wait temporarily in server memory while the other device is offline.'},
      de:{photo:'Profilbild',photoSub:'Wähle ein Bild. Maximal 1600 × 1600.',changePhoto:'Bild auswählen',removePhoto:'Profilbild entfernen',badPhoto:'Dieses Bild konnte nicht verwendet werden.',uploadPhoto:'Profilbild wird hochgeladen…',savedPhoto:'Profilbild aktualisiert',menuTitle:'Nachricht',delete:'Löschen',deleteMine:'Für beide Geräte löschen',deleteLocal:'Von diesem Gerät löschen',react:'Reaktion',messagesDevice:'Nachrichten werden auf deinem Gerät gespeichert, nicht in der Server-Datenbank.',offlineWarn:'Wenn das andere Gerät offline ist, können Nachrichten nur vorübergehend im Arbeitsspeicher des Servers warten.'},
      es:{photo:'Foto de perfil',photoSub:'Elige una foto. Máximo 1600 × 1600.',changePhoto:'Elegir foto',removePhoto:'Quitar foto',badPhoto:'No se pudo usar esa imagen.',uploadPhoto:'Subiendo foto…',savedPhoto:'Foto actualizada',menuTitle:'Mensaje',delete:'Eliminar',deleteMine:'Eliminar en ambos dispositivos',deleteLocal:'Eliminar de este dispositivo',react:'Reaccionar',messagesDevice:'Los mensajes se guardan en tu dispositivo, no en la base de datos del servidor.',offlineWarn:'Si el otro dispositivo está desconectado, los mensajes solo esperan temporalmente en la memoria del servidor.'},
      fr:{photo:'Photo de profil',photoSub:'Choisis une photo. Maximum 1600 × 1600.',changePhoto:'Choisir une photo',removePhoto:'Supprimer la photo',badPhoto:'Impossible d’utiliser cette image.',uploadPhoto:'Envoi de la photo…',savedPhoto:'Photo mise à jour',menuTitle:'Message',delete:'Supprimer',deleteMine:'Supprimer sur les deux appareils',deleteLocal:'Supprimer de cet appareil',react:'Réagir',messagesDevice:'Les messages sont stockés sur ton appareil, pas dans la base du serveur.',offlineWarn:'Si l’autre appareil est hors ligne, les messages attendent seulement temporairement en mémoire du serveur.'}
    };
    return k=>(P[lang()]||P.en)[k]||P.en[k]||k;
  })();

  const style=document.createElement('style');style.id='qevyno295style';style.textContent=`
    .q295verified{display:inline-grid;place-items:center;width:17px;height:17px;margin-left:5px;border-radius:50%;background:#7c3aed;color:white;font-size:11px;font-weight:900;line-height:1;vertical-align:1px;flex:0 0 auto}
    .q295avatarPic{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;color:transparent!important}
    .q295reacts{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}.q295react{min-width:27px;height:24px;padding:0 7px;border-radius:999px;background:#eef4f5;border:1px solid #d9e6e8;font-size:14px;display:grid;place-items:center}
    .q295actionBack{position:fixed;inset:0;z-index:260;background:rgba(23,33,43,.40);display:none;align-items:flex-end;justify-content:center}.q295actionBack.on{display:flex}.q295action{width:min(520px,100%);background:#fff;border-radius:24px 24px 0 0;padding:12px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -18px 60px rgba(23,33,43,.15)}.q295grab{width:38px;height:4px;background:#d5e0e3;border-radius:99px;margin:0 auto 14px}.q295actionTitle{font-size:14px;font-weight:750;color:#17212b;margin-bottom:11px}.q295emojiRow{display:flex;justify-content:space-between;gap:6px;margin-bottom:12px}.q295emoji{width:47px;height:47px;border-radius:15px;background:#f4f8f9;border:1px solid #e1eaec;font-size:22px}.q295delete{width:100%;height:48px;border-radius:14px;background:#fff0f1;color:#c63745;font-size:14px;font-weight:750}
    .q295privacy{margin:12px 0 0;padding:12px 13px;border-radius:14px;background:#effafa;border:1px solid #d1eeee;color:#46646b;font-size:11.5px;line-height:1.45}.q295photoRow{margin-top:14px;padding:13px;background:#f7fafc;border:1px solid var(--line);border-radius:16px}.q295photoHead{display:flex;align-items:center;gap:12px}.q295photoHead .q295profilePreview{width:58px;height:58px;border-radius:50%;background:#dff6f6;color:#18888b;font-size:18px;font-weight:800;display:grid;place-items:center;background-size:cover;background-position:center}.q295photoText{flex:1}.q295photoText b{display:block;color:var(--text);font-size:14px}.q295photoText span{display:block;color:var(--muted);font-size:11px;line-height:1.4;margin-top:3px}.q295photoBtns{display:flex;gap:8px;margin-top:11px}.q295photoBtns button{flex:1;height:42px;border-radius:12px;background:#20c6c9;color:white;font-weight:700}.q295photoBtns .remove{background:#edf3f4;color:#53666d}
  `;document.head.appendChild(style);

  const actionBack=document.createElement('div');actionBack.className='q295actionBack';actionBack.innerHTML=`<div class="q295action"><div class="q295grab"></div><div class="q295actionTitle" id="q295actionTitle">Message</div><div class="q295emojiRow">${REACTIONS.map(x=>`<button class="q295emoji" data-e="${x}">${x}</button>`).join('')}</div><button class="q295delete" id="q295delete">Delete</button></div>`;document.body.appendChild(actionBack);
  let actionMessage=null;
  actionBack.onclick=e=>{if(e.target===actionBack)closeAction()};
  function closeAction(){actionBack.classList.remove('on');actionMessage=null}

  function absAvatar(u){if(!u)return'';return /^https?:/i.test(u)?u:(server||'https://qevyno.sliqado.org')+u}
  function verified(phone,v){return String(phone||'').replace(/[\s().-]/g,'')===VERIFIED_PHONE||v===true}
  function badge(phone,v){return verified(phone,v)?'<span class="q295verified" aria-label="Qevyno badge">✓</span>':''}
  function initials(s){const p=String(s||'?').trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'?')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase().slice(0,2)}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function uuid(){try{return crypto.randomUUID().replace(/-/g,'_')}catch(e){return 'm_'+Date.now()+'_'+Math.random().toString(36).slice(2,12)}}

  function loadMeta(){try{const x=JSON.parse(localStorage.getItem(metaKey)||'{}');return x&&typeof x==='object'?x:{}}catch(e){return{}}}
  function saveMeta(m){localStorage.setItem(metaKey,JSON.stringify(m))}
  function touchMeta(phone,patch){if(!phone)return;const all=loadMeta(),cur=all[phone]||{phone};all[phone]={...cur,...patch,phone};saveMeta(all);return all[phone]}
  function getMeta(phone){return loadMeta()[phone]||{phone,display_name:phone}}
  function removeMetaIfEmpty(phone){const arr=loadChat(phone);if(arr.length)return;const all=loadMeta();delete all[phone];saveMeta(all)}

  function loadChat(phone){
    try{if(window.QevynoDevice&&QevynoDevice.loadChat)return JSON.parse(QevynoDevice.loadChat(phone)||'[]')||[]}catch(e){}
    try{return JSON.parse(localStorage.getItem(fallbackChatKey(phone))||'[]')||[]}catch(e){return[]}
  }
  function saveChat(phone,arr){
    arr=(arr||[]).slice(-5000);
    const raw=JSON.stringify(arr);
    try{if(window.QevynoDevice&&QevynoDevice.saveChat&&QevynoDevice.saveChat(phone,raw))return true}catch(e){}
    try{localStorage.setItem(fallbackChatKey(phone),raw);return true}catch(e){return false}
  }
  function updatePreview(phone){
    const a=loadChat(phone),last=a[a.length-1];
    const base=getMeta(phone);
    touchMeta(phone,{last_message:last?last.text||'':'',last_at:last?last.sent_at||0:0,unread:Number(base.unread||0)});
    if(!a.length)removeMetaIfEmpty(phone);
  }

  function avatarHtml(u,cls='q26avatar'){
    const url=absAvatar(u.avatar_url);
    const pic=url?` style="background-image:url('${esc(url)}')" class="${cls} q295avatarPic${u.online?' online':''}"`:` class="${cls}${u.online?' online':''}"`;
    return `<div${pic}>${url?'':esc(initials(u.display_name||u.phone))}</div>`;
  }

  function renderLocalConversations(){
    const box=D('people');if(!box)return;
    const search=String(D('chatSearch')?.value||'').trim().toLowerCase();
    const all=Object.values(loadMeta()).filter(x=>x&&x.phone&&x.phone!==mePhone);
    const pins=new Set(JSON.parse(localStorage.getItem('qevyno_pins')||'[]'));
    let items=all.filter(u=>!search||String(u.display_name||'').toLowerCase().includes(search)||u.phone.includes(search)||String(u.last_message||'').toLowerCase().includes(search));
    items.sort((a,b)=>(pins.has(b.phone)?1:0)-(pins.has(a.phone)?1:0)||Number(b.last_at||0)-Number(a.last_at||0));
    box.innerHTML='';
    if(!items.length){box.innerHTML=`<div class="q26empty"><b>${search?'No matching chats':'No chats yet'}</b><p>${search?'Try another search.':'Tap + to start a private chat.'}</p></div>`;return;}
    const addGroup=(title,arr)=>{if(!arr.length)return;const l=document.createElement('div');l.className='q26section';l.innerHTML=`<span>${title}</span><span class="count">${arr.length}</span>`;box.appendChild(l);arr.forEach(addRow)};
    const addRow=u=>{const row=document.createElement('div');row.className='q26row';row.dataset.phone=u.phone;row.tabIndex=0;const name=u.display_name||u.phone;row.innerHTML=`${avatarHtml(u)}<div class="q26info"><div class="q26nameLine"><div class="q26name">${esc(name)}</div>${badge(u.phone,u.verified)}${pins.has(u.phone)?'<span class="q26pinMark">◆</span>':''}</div><div class="q26preview">${esc(u.last_message||u.phone)}</div></div><button class="q26pin ${pins.has(u.phone)?'active':''}" aria-label="Pin">◆</button><div class="q26right"><div class="q26time">${u.last_at?new Date(Number(u.last_at)*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''}</div>${u.unread?`<div class="q26badge">${Math.min(99,Number(u.unread)||0)}</div>`:''}</div>`;row.onclick=e=>{if(e.target.closest('.q26pin'))return;openChat(u.phone,name,!!u.online,true);setTimeout(()=>decorateChat(u),20)};row.querySelector('.q26pin').onclick=e=>{e.stopPropagation();pins.has(u.phone)?pins.delete(u.phone):pins.add(u.phone);localStorage.setItem('qevyno_pins',JSON.stringify([...pins]));renderLocalConversations()};box.appendChild(row)};
    addGroup('Pinned',items.filter(x=>pins.has(x.phone)));addGroup('Recent chats',items.filter(x=>!pins.has(x.phone)));
  }

  function decorateChat(u){
    if(!u&&peer)u=getMeta(peer.phone);if(!u)return;
    const name=D('chatName');if(name){name.textContent=u.display_name||u.phone;if(verified(u.phone,u.verified)){const b=document.createElement('span');b.className='q295verified';b.textContent='✓';name.appendChild(b)}}
    const av=D('chatAvatar');if(av){const url=absAvatar(u.avatar_url);av.textContent=url?'':initials(u.display_name||u.phone);av.classList.toggle('q295avatarPic',!!url);av.style.backgroundImage=url?`url("${url}")`:''}
    const infoName=D('infoName');if(infoName){infoName.textContent=u.display_name||u.phone;if(verified(u.phone,u.verified)){const b=document.createElement('span');b.className='q295verified';b.textContent='✓';infoName.appendChild(b)}}
    const infoAv=D('infoAvatar');if(infoAv){const url=absAvatar(u.avatar_url);infoAv.textContent=url?'':initials(u.display_name||u.phone);infoAv.classList.toggle('q295avatarPic',!!url);infoAv.style.backgroundImage=url?`url("${url}")`:''}
  }

  function reactionsHtml(m){const vals=Object.values(m.reactions||{}).filter(Boolean);return vals.length?`<div class="q295reacts">${vals.map(e=>`<span class="q295react">${esc(e)}</span>`).join('')}</div>`:''}
  function renderLocalMessages(arr){
    const box=D('messages');if(!box)return;const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<120;box.innerHTML='';let lastDay='';
    for(const m of arr){const day=new Date((m.sent_at||0)*1000).toDateString();if(day!==lastDay){lastDay=day;const d=document.createElement('div');d.className='q26day';d.textContent=new Date((m.sent_at||0)*1000).toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'});box.appendChild(d)}const mine=m.sender_phone===mePhone,row=document.createElement('div');row.className='bubbleRow'+(mine?' mine':'');row.dataset.mid=m.id;const bubble=document.createElement('div');bubble.className='bubble';const text=document.createElement('div');text.className='btext';text.textContent=m.text||'';const meta=document.createElement('div');meta.className='meta';meta.textContent=new Date((m.sent_at||0)*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+(mine?(m.failed?'  !':m.read_at?'  ✓✓':'  ✓'):'');bubble.append(text,meta);const rh=reactionsHtml(m);if(rh)bubble.insertAdjacentHTML('beforeend',rh);row.appendChild(bubble);bindLongPress(row,m);box.appendChild(row)}if(atBottom||arr.length<4)box.scrollTop=box.scrollHeight;
  }

  function bindLongPress(el,m){let t=null,sx=0,sy=0;const cancel=()=>{if(t){clearTimeout(t);t=null}};el.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;t=setTimeout(()=>openAction(m),480)});el.addEventListener('pointerup',cancel);el.addEventListener('pointercancel',cancel);el.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10)cancel()})}
  function openAction(m){actionMessage=m;D('q295actionTitle').textContent=tx('menuTitle');D('q295delete').textContent=m.sender_phone===mePhone?tx('deleteMine'):tx('deleteLocal');actionBack.classList.add('on')}

  async function reactMessage(emoji){const m=actionMessage;if(!m||!peer)return closeAction();const arr=loadChat(peer.phone),x=arr.find(z=>z.id===m.id);if(!x)return closeAction();x.reactions=x.reactions||{};x.reactions[mePhone]=emoji;saveChat(peer.phone,arr);renderLocalMessages(arr);closeAction();await api('/api/event','POST',{to:peer.phone,type:'reaction',message_id:m.id,emoji});}
  async function deleteMessage(){const m=actionMessage;if(!m||!peer)return closeAction();let arr=loadChat(peer.phone).filter(x=>x.id!==m.id);saveChat(peer.phone,arr);updatePreview(peer.phone);renderLocalMessages(arr);renderLocalConversations();closeAction();if(m.sender_phone===mePhone)await api('/api/event','POST',{to:peer.phone,type:'delete',message_id:m.id});}
  actionBack.querySelectorAll('.q295emoji').forEach(b=>b.onclick=()=>reactMessage(b.dataset.e));D('q295delete').onclick=deleteMessage;

  async function migrateLegacyIfNeeded(){
    if(!token||localStorage.getItem('qevyno_legacy_import_done')==='1')return;
    try{
      const h=await api('/health','GET',null,false);
      if(!h||!h.ok)return;
      if(String(h.version||'')==='2.1'){
        const c=await api('/api/conversations');
        if(!c||!c.ok||!Array.isArray(c.conversations))return;
        for(const u of c.conversations){
          if(!u||!u.phone)continue;
          const r=await api('/api/messages?with='+encodeURIComponent(u.phone));
          if(!r||!r.ok||!Array.isArray(r.messages))continue;
          const arr=r.messages.map(m=>({id:'legacy_'+String(m.id),sender_phone:m.sender_phone,recipient_phone:m.recipient_phone,text:m.text||'',sent_at:m.sent_at||0,read_at:m.read_at||null,reactions:{}}));
          saveChat(u.phone,arr);
          const last=arr[arr.length-1];
          touchMeta(u.phone,{display_name:u.display_name||u.phone,online:!!u.online,verified:verified(u.phone,u.verified),avatar_url:u.avatar_url||null,last_message:last?last.text:'',last_at:last?last.sent_at:0,unread:Number(u.unread||0)});
        }
      }
      localStorage.setItem('qevyno_legacy_import_done','1');
    }catch(e){}
  }

  async function syncEvents(){if(syncing||!token)return;syncing=true;try{const r=await api('/api/events');if(!r||!r.ok||!Array.isArray(r.events))return;const ack=[];for(const e of r.events){try{if(e.type==='message'){const phone=e.sender_phone;if(!phone||phone===mePhone){ack.push(e.id);continue}let arr=loadChat(phone);if(!arr.some(x=>x.id===e.id)){arr.push({id:e.id,sender_phone:phone,recipient_phone:mePhone,text:e.text||'',sent_at:e.sent_at||Math.floor(Date.now()/1000),read_at:null,reactions:{}});saveChat(phone,arr)}const open=peer&&peer.phone===phone&&D('chatScreen')?.classList.contains('active');touchMeta(phone,{display_name:e.display_name||getMeta(phone).display_name||phone,avatar_url:e.avatar_url||getMeta(phone).avatar_url||null,verified:verified(phone,e.verified),last_message:e.text||'',last_at:e.sent_at||0,unread:open?0:Number(getMeta(phone).unread||0)+1});if(open){api('/api/event','POST',{to:phone,type:'read',message_id:e.id});}}
      else if(e.type==='reaction'){const phone=e.sender_phone,arr=loadChat(phone),m=arr.find(x=>x.id===e.message_id);if(m){m.reactions=m.reactions||{};m.reactions[phone]=e.emoji;saveChat(phone,arr)}}
      else if(e.type==='delete'){const phone=e.sender_phone,arr=loadChat(phone).filter(x=>x.id!==e.message_id);saveChat(phone,arr);updatePreview(phone)}
      else if(e.type==='read'){const phone=e.sender_phone,arr=loadChat(phone),m=arr.find(x=>x.id===e.message_id);if(m){m.read_at=e.sent_at||Math.floor(Date.now()/1000);saveChat(phone,arr)}}ack.push(e.id)}catch(_){}}
      if(ack.length)await api('/api/ack','POST',{ids:ack});}finally{syncing=false}}

  window.loadConversations=async function(){if(!token)return;await migrateLegacyIfNeeded();await syncEvents();renderLocalConversations()};
  window.renderConversations=()=>renderLocalConversations();
  window.loadMessages=async function(){if(!peer)return;await migrateLegacyIfNeeded();await syncEvents();let arr=loadChat(peer.phone),changed=false;for(const m of arr){if(m.sender_phone===peer.phone&&!m.read_at){m.read_at=Math.floor(Date.now()/1000);changed=true;api('/api/event','POST',{to:peer.phone,type:'read',message_id:m.id})}}if(changed)saveChat(peer.phone,arr);touchMeta(peer.phone,{unread:0});renderLocalMessages(arr);decorateChat(getMeta(peer.phone))};
  window.renderMessages=arr=>renderLocalMessages(arr||[]);
  window.send=async function(){const box=D('messageBox'),text=String(box?.value||'').trim();if(!text||!peer)return;const id=uuid(),t=Math.floor(Date.now()/1000),m={id,sender_phone:mePhone,recipient_phone:peer.phone,text,sent_at:t,read_at:null,reactions:{}};let arr=loadChat(peer.phone);arr.push(m);saveChat(peer.phone,arr);touchMeta(peer.phone,{display_name:peer.name||getMeta(peer.phone).display_name||peer.phone,last_message:text,last_at:t,unread:0});box.value='';box.style.height='auto';renderLocalMessages(arr);renderLocalConversations();const r=await api('/api/send','POST',{to:peer.phone,text,client_id:id,sent_at:t});if(!r||!r.ok){arr=loadChat(peer.phone);const x=arr.find(z=>z.id===id);if(x)x.failed=true;saveChat(peer.phone,arr);renderLocalMessages(arr)}};

  const sendBtn=D('sendBtn');if(sendBtn)sendBtn.onclick=window.send;const msgBox=D('messageBox');if(msgBox)msgBox.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();window.send()}};
  const search=D('chatSearch');if(search)search.oninput=renderLocalConversations;

  const oldFind=window.findPerson;window.findPerson=async function(){const inp=D('findPhone');const phone=String(inp?.value||'').trim().replace(/[\s().-]/g,'').replace(/^00/,'+');if(!/^\+[1-9]\d{7,14}$/.test(phone)){if(D('findError'))D('findError').textContent='Enter the full international number.';return}const r=await api('/api/find?phone='+encodeURIComponent(phone));if(r&&r.ok&&r.user){const u=r.user;touchMeta(u.phone,{display_name:u.display_name||u.phone,online:!!u.online,verified:verified(u.phone,u.verified),avatar_url:u.avatar_url||null});openChat(u.phone,u.display_name||u.phone,!!u.online,true);setTimeout(()=>decorateChat(getMeta(u.phone)),20)}else if(typeof oldFind==='function')oldFind()};if(D('findBtn'))D('findBtn').onclick=window.findPerson;

  const oldRefresh=window.refreshPresence;window.refreshPresence=async function(){if(!peer)return;const r=await api('/api/find?phone='+encodeURIComponent(peer.phone));if(r&&r.ok){const u=r.user;peer.name=u.display_name||peer.name;touchMeta(u.phone,{display_name:u.display_name||u.phone,online:!!u.online,verified:verified(u.phone,u.verified),avatar_url:u.avatar_url||null});if(D('chatPresence'))D('chatPresence').textContent=u.phone+' • '+(u.online?'Online':'Offline');decorateChat(getMeta(u.phone))}else if(typeof oldRefresh==='function')return oldRefresh()};

  function ensureProfileSettings(){const sheet=document.querySelector('#sheetBack .sheet');if(!sheet||!mePhone)return;let sec=D('q295photo');if(!sec){sec=document.createElement('div');sec.id='q295photo';sec.className='q295photoRow';sec.innerHTML=`<div class="q295photoHead"><div class="q295profilePreview" id="q295profilePreview">${esc(initials(meName||mePhone))}</div><div class="q295photoText"><b>${tx('photo')}</b><span>${tx('photoSub')}</span></div></div><div class="q295photoBtns"><button id="q295pick">${tx('changePhoto')}</button><button class="remove" id="q295remove">${tx('removePhoto')}</button></div><div class="q295privacy">${tx('messagesDevice')}<br>${tx('offlineWarn')}</div>`;const profile=sheet.querySelector('.q26profile');if(profile)profile.after(sec);else sheet.prepend(sec);D('q295pick').onclick=()=>{try{QevynoDevice.pickProfilePicture()}catch(e){}};D('q295remove').onclick=async()=>{const r=await api('/api/profile-picture/delete','POST',{});if(r&&r.ok){ownMeta={...ownMeta,...r,avatar_url:null};applyOwnProfile();}}}applyOwnProfile()}
  function applyOwnProfile(){const url=absAvatar(ownMeta.avatar_url);const p=D('q295profilePreview');if(p){p.textContent=url?'':initials(meName||mePhone);p.style.backgroundImage=url?`url("${url}")`:''}const a=D('settingsAvatar');if(a){a.textContent=url?'':initials(meName||mePhone);a.classList.toggle('q295avatarPic',!!url);a.style.backgroundImage=url?`url("${url}")`:''}const n=D('settingsName');if(n){n.textContent=meName||'Qevyno';if(verified(mePhone,ownMeta.verified)){const b=document.createElement('span');b.className='q295verified';b.textContent='✓';n.appendChild(b)}}}
  window.qevynoProfilePicked=async function(dataUrl,w,h){if(w>1600||h>1600)return alert(tx('badPhoto'));const r=await api('/api/profile-picture','POST',{image:dataUrl});if(r&&r.ok){ownMeta={...ownMeta,...r};applyOwnProfile();}else alert(tx('badPhoto'))};window.qevynoProfilePickFailed=()=>alert(tx('badPhoto'));
  const oldOpenSettings=window.openSettings;if(typeof oldOpenSettings==='function')window.openSettings=function(){oldOpenSettings();setTimeout(ensureProfileSettings,30)};

  async function loadOwn(){if(!token)return;const r=await api('/api/me');if(r&&r.ok){ownMeta={...r,verified:verified(r.phone,r.verified)};meName=r.display_name||meName;localStorage.setItem('qevyno_name',meName);applyOwnProfile();}}
  const oldSave=window.saveSession;if(typeof oldSave==='function')window.saveSession=function(d){oldSave(d);ownMeta={...ownMeta,...d,verified:verified(d&&d.phone,d&&d.verified)};setTimeout(()=>{loadOwn();if(window.qevynoRefreshOwnQr)window.qevynoRefreshOwnQr()},150)};

  try{if(pollHome){clearInterval(pollHome);pollHome=setInterval(window.loadConversations,2500)}if(pollChat){clearInterval(pollChat);pollChat=setInterval(window.loadMessages,1500)}}catch(e){}
  setInterval(()=>{if(token)syncEvents().then(()=>{if(peer)renderLocalMessages(loadChat(peer.phone));else renderLocalConversations()})},2200);
  setTimeout(()=>{if(token){loadOwn();window.loadConversations()}document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.5 • Android 8+';});},350);
})();
