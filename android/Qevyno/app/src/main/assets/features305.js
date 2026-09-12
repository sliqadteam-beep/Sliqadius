(()=>{
'use strict';
const VERSION='2.9.18';
const BRAND='SliqChat';
const META_KEY='qevyno_local_conversations_v2';
const PENDING_SHARE_KEY='qevyno_pending_share_v1';
const HELP_NUMBER='0000000000';

const T={
  en:{shareTo:'Share to',choose:'Choose a chat',newChat:'New chat',cancel:'Cancel',noChats:'No chats yet',shared:'Shared link',phone:'Phone number'},
  de:{shareTo:'Teilen an',choose:'Chat auswählen',newChat:'Neuer Chat',cancel:'Abbrechen',noChats:'Noch keine Chats',shared:'Geteilter Link',phone:'Telefonnummer'},
  es:{shareTo:'Compartir con',choose:'Elige un chat',newChat:'Nuevo chat',cancel:'Cancelar',noChats:'Aún no hay chats',shared:'Enlace compartido',phone:'Número de teléfono'},
  fr:{shareTo:'Partager avec',choose:'Choisis une discussion',newChat:'Nouvelle discussion',cancel:'Annuler',noChats:'Aucune discussion',shared:'Lien partagé',phone:'Numéro de téléphone'},
  it:{shareTo:'Condividi con',choose:'Scegli una chat',newChat:'Nuova chat',cancel:'Annulla',noChats:'Nessuna chat',shared:'Link condiviso',phone:'Numero di telefono'},
  pt:{shareTo:'Partilhar com',choose:'Escolhe uma conversa',newChat:'Nova conversa',cancel:'Cancelar',noChats:'Ainda não há conversas',shared:'Ligação partilhada',phone:'Número de telefone'},
  nl:{shareTo:'Delen met',choose:'Kies een chat',newChat:'Nieuwe chat',cancel:'Annuleren',noChats:'Nog geen chats',shared:'Gedeelde link',phone:'Telefoonnummer'},
  pl:{shareTo:'Udostępnij do',choose:'Wybierz czat',newChat:'Nowy czat',cancel:'Anuluj',noChats:'Brak czatów',shared:'Udostępniony link',phone:'Numer telefonu'},
  tr:{shareTo:'Şurada paylaş',choose:'Bir sohbet seç',newChat:'Yeni sohbet',cancel:'İptal',noChats:'Henüz sohbet yok',shared:'Paylaşılan bağlantı',phone:'Telefon numarası'},
  uk:{shareTo:'Поділитися з',choose:'Вибери чат',newChat:'Новий чат',cancel:'Скасувати',noChats:'Чатів ще немає',shared:'Спільне посилання',phone:'Номер телефону'},
  ru:{shareTo:'Поделиться с',choose:'Выберите чат',newChat:'Новый чат',cancel:'Отмена',noChats:'Чатов пока нет',shared:'Общая ссылка',phone:'Номер телефона'},
  ja:{shareTo:'共有先',choose:'チャットを選択',newChat:'新しいチャット',cancel:'キャンセル',noChats:'チャットはまだありません',shared:'共有リンク',phone:'電話番号'},
  ko:{shareTo:'공유 대상',choose:'채팅 선택',newChat:'새 채팅',cancel:'취소',noChats:'아직 채팅이 없습니다',shared:'공유 링크',phone:'전화번호'},
  zh:{shareTo:'分享到',choose:'选择聊天',newChat:'新聊天',cancel:'取消',noChats:'还没有聊天',shared:'分享的链接',phone:'电话号码'},
  ar:{shareTo:'مشاركة مع',choose:'اختر محادثة',newChat:'محادثة جديدة',cancel:'إلغاء',noChats:'لا توجد محادثات بعد',shared:'رابط مشترك',phone:'رقم الهاتف'}
};
function lang(){let l='en';try{l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}catch(_){}if(l==='ua')l='uk';return T[l]?l:'en'}
function tx(k){return (T[lang()]||T.en)[k]||T.en[k]||k}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function extractUrl(text){const m=String(text||'').match(/https?:\/\/[^\s<>"']+/i);return m?m[0].replace(/[),.;!?]+$/,''):''}
function displayTitle(text,url){let x=String(text||'').replace(url,'').replace(/\s+/g,' ').trim();if(!x||x.length<3)return'';return x.slice(0,120)}
function providerInfo(url,text=''){
  let u;try{u=new URL(url)}catch(_){return{site:'Link',title:tx('shared'),host:'',url,image:''}}
  const host=u.hostname.toLowerCase().replace(/^www\./,'');
  let site=host,title=displayTitle(text,url)||tx('shared'),image='';
  const path=u.pathname;
  if(host==='youtu.be'||host.endsWith('youtube.com')){
    site='YouTube';
    let id='';
    if(host==='youtu.be')id=path.split('/').filter(Boolean)[0]||'';
    else if(path.startsWith('/shorts/')){id=path.split('/')[2]||'';title=displayTitle(text,url)||'YouTube Short'}
    else id=u.searchParams.get('v')||'';
    if(!title||title===tx('shared'))title=path.startsWith('/shorts/')?'YouTube Short':'YouTube Video';
    if(/^[A-Za-z0-9_-]{6,20}$/.test(id))image='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
  }else if(host.endsWith('tiktok.com')){site='TikTok';title=displayTitle(text,url)||'TikTok Video'}
  else if(host.endsWith('instagram.com')){site='Instagram';title=displayTitle(text,url)||(path.includes('/reel/')?'Instagram Reel':'Instagram Post')}
  else if(host==='x.com'||host.endsWith('twitter.com')){site='X';title=displayTitle(text,url)||'Post on X'}
  else if(host.endsWith('facebook.com')||host==='fb.watch'){site='Facebook';title=displayTitle(text,url)||'Facebook Video'}
  else if(host.endsWith('twitch.tv')){site='Twitch';title=displayTitle(text,url)||'Twitch'}
  else if(host.endsWith('reddit.com')){site='Reddit';title=displayTitle(text,url)||'Reddit Post'}
  else if(host.endsWith('vimeo.com')){site='Vimeo';title=displayTitle(text,url)||'Vimeo Video'}
  else if(host.endsWith('snapchat.com')){site='Snapchat';title=displayTitle(text,url)||'Snapchat'}
  return{site,title,host,url,image};
}

const style=document.createElement('style');style.id='qevyno305style';style.textContent=`
.q305phone{font-size:11px;color:#82929a;margin-top:1px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.q299helpRow .q299tag{display:none!important}.q299helpRow .q305phone{color:#82929a}.q26row .q26preview{margin-top:3px!important}
.q305preview{margin:7px 0 2px;border:1px solid rgba(120,145,135,.28);border-radius:14px;overflow:hidden;background:rgba(255,255,255,.055);display:flex;min-height:70px;text-align:left;color:inherit;width:100%;padding:0}.q305preview:active{transform:scale(.99)}.q305previewImg{width:100px;min-width:100px;object-fit:cover;background:#0d1b15}.q305previewFallback{width:72px;min-width:72px;display:grid;place-items:center;background:linear-gradient(145deg,#1c5940,#143828);font-size:12px;font-weight:900;color:#caffdf;padding:8px;text-align:center}.q305previewText{min-width:0;padding:10px 11px;display:flex;flex-direction:column;justify-content:center}.q305previewSite{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#8ea79a;font-weight:850}.q305previewTitle{font-size:13px;font-weight:780;line-height:1.25;margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.q305previewHost{font-size:10px;color:#7d9187;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#q305composerPreview{padding:0 10px;background:transparent}#q305composerPreview:empty{display:none}#q305composerPreview .q305preview{max-width:560px;margin:6px auto 2px;background:#0e1d16}
.q305shareBack{position:fixed;inset:0;z-index:520;background:rgba(0,0,0,.58);display:flex;align-items:flex-end;opacity:0;visibility:hidden;pointer-events:none;transition:.18s}.q305shareBack.on{opacity:1;visibility:visible;pointer-events:auto}.q305shareSheet{width:100%;max-width:760px;margin:auto;background:#fff;border-radius:25px 25px 0 0;padding:12px 14px calc(18px + env(safe-area-inset-bottom));max-height:78vh;display:flex;flex-direction:column;color:#17212b}.q305handle{width:40px;height:4px;border-radius:99px;background:#d8e2e5;margin:2px auto 13px}.q305shareTitle{font-size:22px;font-weight:850}.q305shareSub{font-size:12px;color:#788a92;margin:3px 0 10px}.q305shareList{overflow:auto;min-height:80px}.q305shareRow{width:100%;display:flex;align-items:center;gap:11px;background:transparent;padding:10px 5px;border-bottom:1px solid #edf1f2;color:#17212b;text-align:left}.q305shareAvatar{width:44px;height:44px;border-radius:15px;background:#dff7f0;color:#18855e;display:grid;place-items:center;font-weight:900}.q305shareInfo{min-width:0;flex:1}.q305shareName{font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.q305sharePhone{font-size:11px;color:#84969d;margin-top:2px}.q305shareActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.q305shareActions button{height:46px;border-radius:14px;font-weight:800}.q305new{background:#20c6c9;color:#fff}.q305cancel{background:#eef3f5;color:#4e626a}
`;
document.head.appendChild(style);

function initials(s){const p=String(s||'?').trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'?')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase().slice(0,2)}
function fixConversationRows(){
  document.querySelectorAll('#people .q26row').forEach(row=>{
    const info=row.querySelector('.q26info'),line=row.querySelector('.q26nameLine');if(!info||!line)return;
    let phone=row.dataset.phone||'';
    if(row.classList.contains('q299helpRow'))phone=HELP_NUMBER;
    if(!phone){const tag=row.querySelector('.q299tag');if(tag)phone=(tag.textContent||'').trim()}
    if(!phone)return;
    let p=info.querySelector(':scope > .q305phone');if(!p){p=document.createElement('div');p.className='q305phone';line.insertAdjacentElement('afterend',p)}
    if(p.textContent!==phone)p.textContent=phone;
    const tag=row.querySelector('.q299tag');if(tag)tag.style.display='none';
  });
}

function brandify(root=document){
  try{document.title=BRAND}catch(_){}
  try{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while(n=walker.nextNode()){
      const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/i.test(p.tagName))continue;
      if((n.nodeValue||'').includes('Qevyno'))n.nodeValue=n.nodeValue.replace(/Qevyno/g,BRAND);
    }
    root.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(el=>['title','aria-label','placeholder'].forEach(a=>{const v=el.getAttribute(a);if(v&&v.includes('Qevyno'))el.setAttribute(a,v.replace(/Qevyno/g,BRAND))}));
  }catch(_){}
}

function openExternal(url){try{if(window.QevynoDevice&&QevynoDevice.openExternal){QevynoDevice.openExternal(url);return}}catch(_){}try{location.href=url}catch(_){} }
function makePreview(text){
  const url=extractUrl(text);if(!url)return null;const p=providerInfo(url,text);
  const b=document.createElement('button');b.type='button';b.className='q305preview';b.dataset.q305url=url;
  if(p.image){const img=document.createElement('img');img.className='q305previewImg';img.src=p.image;img.alt='';img.loading='lazy';img.onerror=()=>{const f=document.createElement('div');f.className='q305previewFallback';f.textContent=p.site;img.replaceWith(f)};b.appendChild(img)}else{const f=document.createElement('div');f.className='q305previewFallback';f.textContent=p.site;b.appendChild(f)}
  const t=document.createElement('div');t.className='q305previewText';t.innerHTML=`<div class="q305previewSite">${esc(p.site)}</div><div class="q305previewTitle">${esc(p.title)}</div><div class="q305previewHost">${esc(p.host)}</div>`;b.appendChild(t);b.onclick=e=>{e.preventDefault();e.stopPropagation();openExternal(url)};return b;
}
function decorateMessagePreviews(){document.querySelectorAll('#messages .bubbleRow .bubble:not([data-q305preview])').forEach(b=>{b.dataset.q305preview='1';const text=b.querySelector('.btext');if(!text)return;const card=makePreview(text.textContent||'');if(card)text.insertAdjacentElement('afterend',card)})}
let composerPreview=null;
function ensureComposerPreview(){if(composerPreview&&document.body.contains(composerPreview))return composerPreview;const composer=document.querySelector('#chatScreen .composer');if(!composer)return null;composerPreview=document.createElement('div');composerPreview.id='q305composerPreview';composer.insertAdjacentElement('beforebegin',composerPreview);return composerPreview}
function updateComposerPreview(){const box=document.getElementById('messageBox'),wrap=ensureComposerPreview();if(!box||!wrap)return;wrap.innerHTML='';const c=makePreview(box.value||'');if(c)wrap.appendChild(c)}
const messageBox=document.getElementById('messageBox');if(messageBox)messageBox.addEventListener('input',updateComposerPreview);

let pendingShare='';
const back=document.createElement('div');back.className='q305shareBack';back.innerHTML='<div class="q305shareSheet"><div class="q305handle"></div><div class="q305shareTitle"></div><div class="q305shareSub"></div><div class="q305shareList"></div><div class="q305shareActions"><button class="q305new"></button><button class="q305cancel"></button></div></div>';document.body.appendChild(back);
function metaItems(){try{const x=JSON.parse(localStorage.getItem(META_KEY)||'{}');return Object.values(x||{}).filter(v=>v&&v.phone&&v.phone!==localStorage.getItem('qevyno_phone')).sort((a,b)=>Number(b.last_at||0)-Number(a.last_at||0))}catch(_){return[]}}
function closePicker(clear=false){back.classList.remove('on');if(clear){pendingShare='';localStorage.removeItem(PENDING_SHARE_KEY)}}
function fillComposer(){if(!pendingShare)return;const box=document.getElementById('messageBox');if(!box)return;const before=String(box.value||'').trim();box.value=before?before+'\n'+pendingShare:pendingShare;box.dispatchEvent(new Event('input',{bubbles:true}));pendingShare='';localStorage.removeItem(PENDING_SHARE_KEY);setTimeout(()=>{box.focus();try{box.setSelectionRange(box.value.length,box.value.length)}catch(_){}},60)}
function openForShare(phone,name,online){try{if(typeof window.openChat==='function')window.openChat(phone,name||phone,!!online,true)}catch(_){}closePicker(false);setTimeout(fillComposer,120)}
function renderPicker(){
  back.querySelector('.q305shareTitle').textContent=tx('shareTo')+' '+BRAND;
  back.querySelector('.q305shareSub').textContent=tx('choose');
  back.querySelector('.q305new').textContent='+ '+tx('newChat');
  back.querySelector('.q305cancel').textContent=tx('cancel');
  const list=back.querySelector('.q305shareList');list.innerHTML='';const items=metaItems();
  if(!items.length){const e=document.createElement('div');e.style.cssText='padding:25px 8px;text-align:center;color:#82929a;font-size:13px';e.textContent=tx('noChats');list.appendChild(e)}
  for(const u of items){const row=document.createElement('button');row.type='button';row.className='q305shareRow';const name=String(u.display_name||u.phone);row.innerHTML=`<div class="q305shareAvatar">${esc(initials(name))}</div><div class="q305shareInfo"><div class="q305shareName">${esc(name)}</div><div class="q305sharePhone">${esc(u.phone)}</div></div>`;row.onclick=()=>openForShare(u.phone,name,!!u.online);list.appendChild(row)}
}
function showPicker(){if(!pendingShare)return;renderPicker();back.classList.add('on')}
back.addEventListener('click',e=>{if(e.target===back)closePicker(true)});back.querySelector('.q305cancel').onclick=()=>closePicker(true);back.querySelector('.q305new').onclick=()=>{closePicker(false);const b=document.getElementById('newChatBtn')||document.getElementById('navNew');if(b)b.click()};

window.qevynoReceiveNativeShare=text=>{text=String(text||'').trim();if(!text||!extractUrl(text))return;pendingShare=text;try{localStorage.setItem(PENDING_SHARE_KEY,text)}catch(_){}const tok=localStorage.getItem('qevyno_token')||'';if(tok)setTimeout(showPicker,80)};
const oldOpen=window.openChat;if(typeof oldOpen==='function'&&!window.q305OpenWrapped){window.q305OpenWrapped=true;window.openChat=function(){const r=oldOpen.apply(this,arguments);if(pendingShare)setTimeout(fillComposer,130);return r}}
function consumeNativeShare(){let s='';try{if(window.QevynoDevice&&QevynoDevice.consumePendingShareText)s=String(QevynoDevice.consumePendingShareText()||'')}catch(_){}if(!s){try{s=String(localStorage.getItem(PENDING_SHARE_KEY)||'')}catch(_){}}if(s)window.qevynoReceiveNativeShare(s)}

let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fixConversationRows();decorateMessagePreviews();brandify(document);updateComposerPreview()})});observer.observe(document.body,{subtree:true,childList:true,characterData:true});
function setVersion(){document.querySelectorAll('.small').forEach(el=>{if(/(?:Qevyno|SliqChat)\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`${BRAND} v${VERSION} • Android 8+`})}
[0,150,400,900,1600].forEach(ms=>setTimeout(()=>{fixConversationRows();decorateMessagePreviews();brandify(document);setVersion();if(ms===400)consumeNativeShare()},ms));
window.addEventListener('focus',()=>{fixConversationRows();decorateMessagePreviews();brandify(document);setVersion()});
})();
