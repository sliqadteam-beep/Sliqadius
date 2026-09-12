(()=>{
'use strict';
const VERSION='2.9.20';
const MAX_MEDIA_BYTES=120*1024*1024;
const MEDIA_PREFIX='[[SLIQCHAT_MEDIA_V1:';
const MEDIA_SUFFIX=']]';
const META_KEY='qevyno_local_conversations_v2';
const GROUPS_KEY='sliqchat_groups_v1';
const GROUP_MSG_PREFIX='sliqchat_group_messages_';

const T={
 en:{attach:'Photo or video',image:'Photo',video:'Video',tooLarge:'This file is larger than 120 MB.',unsupported:'Only photos and videos are supported.',preparing:'Preparing…',uploading:'Uploading',remove:'Remove',failed:'Could not send media.',downloadFailed:'Could not load media.',expired:'This media is no longer available.',captionImage:'Add a message to the photo (optional)',captionVideo:'Add a message to the video (optional)',media:'Media',retry:'Try again',you:'You'},
 de:{attach:'Bild oder Video',image:'Bild',video:'Video',tooLarge:'Diese Datei ist größer als 120 MB.',unsupported:'Es werden nur Bilder und Videos unterstützt.',preparing:'Wird vorbereitet…',uploading:'Wird hochgeladen',remove:'Entfernen',failed:'Medium konnte nicht gesendet werden.',downloadFailed:'Medium konnte nicht geladen werden.',expired:'Dieses Medium ist nicht mehr verfügbar.',captionImage:'Nachricht zum Bild hinzufügen (optional)',captionVideo:'Nachricht zum Video hinzufügen (optional)',media:'Medium',retry:'Erneut versuchen',you:'Du'},
 es:{attach:'Foto o vídeo',image:'Foto',video:'Vídeo',tooLarge:'Este archivo supera los 120 MB.',unsupported:'Solo se admiten fotos y vídeos.',preparing:'Preparando…',uploading:'Subiendo',remove:'Quitar',failed:'No se pudo enviar el archivo.',downloadFailed:'No se pudo cargar el archivo.',expired:'Este archivo ya no está disponible.',captionImage:'Añade un mensaje a la foto (opcional)',captionVideo:'Añade un mensaje al vídeo (opcional)',media:'Multimedia',retry:'Reintentar',you:'Tú'},
 fr:{attach:'Photo ou vidéo',image:'Photo',video:'Vidéo',tooLarge:'Ce fichier dépasse 120 Mo.',unsupported:'Seules les photos et vidéos sont prises en charge.',preparing:'Préparation…',uploading:'Envoi',remove:'Supprimer',failed:'Impossible d’envoyer le média.',downloadFailed:'Impossible de charger le média.',expired:'Ce média n’est plus disponible.',captionImage:'Ajouter un message à la photo (facultatif)',captionVideo:'Ajouter un message à la vidéo (facultatif)',media:'Média',retry:'Réessayer',you:'Toi'},
 it:{attach:'Foto o video',image:'Foto',video:'Video',tooLarge:'Questo file supera 120 MB.',unsupported:'Sono supportati solo foto e video.',preparing:'Preparazione…',uploading:'Caricamento',remove:'Rimuovi',failed:'Impossibile inviare il contenuto.',downloadFailed:'Impossibile caricare il contenuto.',expired:'Questo contenuto non è più disponibile.',captionImage:'Aggiungi un messaggio alla foto (facoltativo)',captionVideo:'Aggiungi un messaggio al video (facoltativo)',media:'Media',retry:'Riprova',you:'Tu'},
 pt:{attach:'Foto ou vídeo',image:'Foto',video:'Vídeo',tooLarge:'Este ficheiro tem mais de 120 MB.',unsupported:'Apenas fotos e vídeos são suportados.',preparing:'A preparar…',uploading:'A enviar',remove:'Remover',failed:'Não foi possível enviar o ficheiro.',downloadFailed:'Não foi possível carregar o ficheiro.',expired:'Este ficheiro já não está disponível.',captionImage:'Adicionar mensagem à foto (opcional)',captionVideo:'Adicionar mensagem ao vídeo (opcional)',media:'Multimédia',retry:'Tentar novamente',you:'Tu'},
 nl:{attach:'Foto of video',image:'Foto',video:'Video',tooLarge:'Dit bestand is groter dan 120 MB.',unsupported:'Alleen foto’s en video’s worden ondersteund.',preparing:'Voorbereiden…',uploading:'Uploaden',remove:'Verwijderen',failed:'Media kon niet worden verzonden.',downloadFailed:'Media kon niet worden geladen.',expired:'Deze media is niet meer beschikbaar.',captionImage:'Voeg een bericht toe aan de foto (optioneel)',captionVideo:'Voeg een bericht toe aan de video (optioneel)',media:'Media',retry:'Opnieuw proberen',you:'Jij'},
 pl:{attach:'Zdjęcie lub film',image:'Zdjęcie',video:'Film',tooLarge:'Ten plik ma więcej niż 120 MB.',unsupported:'Obsługiwane są tylko zdjęcia i filmy.',preparing:'Przygotowywanie…',uploading:'Wysyłanie',remove:'Usuń',failed:'Nie udało się wysłać multimediów.',downloadFailed:'Nie udało się wczytać multimediów.',expired:'Te multimedia nie są już dostępne.',captionImage:'Dodaj wiadomość do zdjęcia (opcjonalnie)',captionVideo:'Dodaj wiadomość do filmu (opcjonalnie)',media:'Multimedia',retry:'Spróbuj ponownie',you:'Ty'},
 tr:{attach:'Fotoğraf veya video',image:'Fotoğraf',video:'Video',tooLarge:'Bu dosya 120 MB’den büyük.',unsupported:'Yalnızca fotoğraf ve videolar desteklenir.',preparing:'Hazırlanıyor…',uploading:'Yükleniyor',remove:'Kaldır',failed:'Medya gönderilemedi.',downloadFailed:'Medya yüklenemedi.',expired:'Bu medya artık kullanılamıyor.',captionImage:'Fotoğrafa mesaj ekle (isteğe bağlı)',captionVideo:'Videoya mesaj ekle (isteğe bağlı)',media:'Medya',retry:'Tekrar dene',you:'Sen'},
 uk:{attach:'Фото або відео',image:'Фото',video:'Відео',tooLarge:'Цей файл більший за 120 МБ.',unsupported:'Підтримуються лише фото та відео.',preparing:'Підготовка…',uploading:'Надсилання',remove:'Видалити',failed:'Не вдалося надіслати медіа.',downloadFailed:'Не вдалося завантажити медіа.',expired:'Це медіа більше недоступне.',captionImage:'Додати повідомлення до фото (необов’язково)',captionVideo:'Додати повідомлення до відео (необов’язково)',media:'Медіа',retry:'Спробувати ще',you:'Ти'},
 ru:{attach:'Фото или видео',image:'Фото',video:'Видео',tooLarge:'Этот файл больше 120 МБ.',unsupported:'Поддерживаются только фото и видео.',preparing:'Подготовка…',uploading:'Отправка',remove:'Удалить',failed:'Не удалось отправить медиа.',downloadFailed:'Не удалось загрузить медиа.',expired:'Это медиа больше недоступно.',captionImage:'Добавить сообщение к фото (необязательно)',captionVideo:'Добавить сообщение к видео (необязательно)',media:'Медиа',retry:'Повторить',you:'Вы'},
 ja:{attach:'写真または動画',image:'写真',video:'動画',tooLarge:'このファイルは120MBを超えています。',unsupported:'写真と動画のみ対応しています。',preparing:'準備中…',uploading:'アップロード中',remove:'削除',failed:'メディアを送信できませんでした。',downloadFailed:'メディアを読み込めませんでした。',expired:'このメディアは利用できなくなりました。',captionImage:'写真にメッセージを追加（任意）',captionVideo:'動画にメッセージを追加（任意）',media:'メディア',retry:'再試行',you:'あなた'},
 ko:{attach:'사진 또는 동영상',image:'사진',video:'동영상',tooLarge:'이 파일은 120MB보다 큽니다.',unsupported:'사진과 동영상만 지원됩니다.',preparing:'준비 중…',uploading:'업로드 중',remove:'삭제',failed:'미디어를 보낼 수 없습니다.',downloadFailed:'미디어를 불러올 수 없습니다.',expired:'이 미디어는 더 이상 사용할 수 없습니다.',captionImage:'사진에 메시지 추가(선택)',captionVideo:'동영상에 메시지 추가(선택)',media:'미디어',retry:'다시 시도',you:'나'},
 zh:{attach:'图片或视频',image:'图片',video:'视频',tooLarge:'此文件超过 120 MB。',unsupported:'仅支持图片和视频。',preparing:'正在准备…',uploading:'正在上传',remove:'移除',failed:'无法发送媒体。',downloadFailed:'无法加载媒体。',expired:'此媒体已不可用。',captionImage:'给图片添加消息（可选）',captionVideo:'给视频添加消息（可选）',media:'媒体',retry:'重试',you:'你'},
 ar:{attach:'صورة أو فيديو',image:'صورة',video:'فيديو',tooLarge:'حجم هذا الملف أكبر من 120 ميغابايت.',unsupported:'يتم دعم الصور ومقاطع الفيديو فقط.',preparing:'جارٍ التحضير…',uploading:'جارٍ الرفع',remove:'إزالة',failed:'تعذر إرسال الوسائط.',downloadFailed:'تعذر تحميل الوسائط.',expired:'لم تعد هذه الوسائط متاحة.',captionImage:'أضف رسالة إلى الصورة (اختياري)',captionVideo:'أضف رسالة إلى الفيديو (اختياري)',media:'وسائط',retry:'حاول مرة أخرى',you:'أنت'}
};
function lang(){let l='en';try{l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}catch(_){}if(l==='ua')l='uk';return T[l]?l:'en'}
function tx(k){return (T[lang()]||T.en)[k]||T.en[k]||k}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function uuid(){try{return crypto.randomUUID().replace(/-/g,'_')}catch(_){return 'm_'+Date.now()+'_'+Math.random().toString(36).slice(2,12)}}
function now(){return Math.floor(Date.now()/1000)}
function myPhone(){try{return String((typeof mePhone!=='undefined'&&mePhone)||localStorage.getItem('qevyno_phone')||'')}catch(_){return''}}
function myName(){try{return String((typeof meName!=='undefined'&&meName)||localStorage.getItem('qevyno_name')||myPhone())}catch(_){return myPhone()}}
function authToken(){try{return String((typeof token!=='undefined'&&token)||localStorage.getItem('qevyno_token')||'')}catch(_){return''}}
function b64urlDecode(s){try{s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}catch(_){return''}}
function parseMarker(text){
  text=String(text||'');
  if(!text.startsWith(MEDIA_PREFIX)||!text.endsWith(MEDIA_SUFFIX))return null;
  try{
    const o=JSON.parse(b64urlDecode(text.slice(MEDIA_PREFIX.length,-MEDIA_SUFFIX.length)));
    if(!o||o.v!==1||!o.token||!['image','video'].includes(o.kind))return null;
    const size=Number(o.size||0);if(size<1||size>MAX_MEDIA_BYTES)return null;
    return{token:String(o.token),kind:o.kind,mime:String(o.mime||''),size,name:String(o.name||'media'),caption:String(o.caption||''),sha256:String(o.sha256||''),context:o.context&&typeof o.context==='object'?o.context:{}};
  }catch(_){return null}
}
function humanSize(n){n=Number(n||0);if(n>=1024*1024)return (n/(1024*1024)).toFixed(n>=10*1024*1024?0:1)+' MB';if(n>=1024)return Math.round(n/1024)+' KB';return n+' B'}
function friendly(info){if(!info)return tx('media');const p=info.kind==='video'?'🎬 '+tx('video'):'📷 '+tx('image');return info.caption?`${p} · ${info.caption}`:p}
function loadMeta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch(_){return{}}}
function saveMeta(x){try{localStorage.setItem(META_KEY,JSON.stringify(x||{}))}catch(_){}}
function readChat(phone){try{if(window.QevynoDevice&&QevynoDevice.loadChat)return JSON.parse(QevynoDevice.loadChat(phone)||'[]')||[]}catch(_){}try{return JSON.parse(localStorage.getItem('qevyno_chat_'+phone)||'[]')||[]}catch(_){return[]}}
function writeChat(phone,a){const raw=JSON.stringify((a||[]).slice(-5000));try{if(window.QevynoDevice&&QevynoDevice.saveChat&&QevynoDevice.saveChat(phone,raw))return true}catch(_){}try{localStorage.setItem('qevyno_chat_'+phone,raw);return true}catch(_){return false}}
function loadGroups(){try{return JSON.parse(localStorage.getItem(GROUPS_KEY)||'{}')||{}}catch(_){return{}}}
function saveGroups(g){try{localStorage.setItem(GROUPS_KEY,JSON.stringify(g||{}))}catch(_){}}
function loadGroupMessages(id){try{const a=JSON.parse(localStorage.getItem(GROUP_MSG_PREFIX+id)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function saveGroupMessages(id,a){try{localStorage.setItem(GROUP_MSG_PREFIX+id,JSON.stringify((a||[]).slice(-3000)))}catch(_){}}

const style=document.createElement('style');style.id='sliqchat307style';style.textContent=`
.q307attach{width:44px;height:44px;min-width:44px;border-radius:15px;background:#eef4f5;color:#536970;display:grid;place-items:center;font-size:20px;font-weight:800;align-self:center}
#chatScreen .composer .q307attach{margin-bottom:2px}.q306composer .q307attach{background:#edf4f5;color:#52666e}
.q307draft{margin:0 10px 6px;border:1px solid #dbe7ea;background:#fff;border-radius:17px;padding:9px;display:flex;align-items:center;gap:10px;box-shadow:0 5px 18px rgba(23,33,43,.06)}
.q307draftMedia{width:76px;height:64px;border-radius:12px;object-fit:cover;background:#eaf1f3}.q307draftInfo{min-width:0;flex:1}.q307draftName{font-size:12px;font-weight:800;color:#263940;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.q307draftSize{font-size:10.5px;color:#82949b;margin-top:3px}.q307draftRemove{width:36px;height:36px;border-radius:12px;background:#f1f5f6;color:#65777e;font-size:18px}
.q307media{position:relative;margin:2px 0 6px;border-radius:14px;overflow:hidden;background:#0c1612;min-width:170px}.q307media img,.q307media video{display:block;width:100%;max-width:420px;max-height:420px;object-fit:contain;background:#07100c}.q307media video{min-height:120px}
.q307mediaStatus{min-height:130px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;padding:22px;color:#9db0a7;font-size:11px;text-align:center}.q307spin{width:22px;height:22px;border:2px solid rgba(138,191,244,.25);border-top-color:#8ABFF4;border-radius:50%;animation:q307spin .7s linear infinite}@keyframes q307spin{to{transform:rotate(360deg)}}
.q307progress{position:absolute;left:10px;right:10px;bottom:10px;height:5px;background:rgba(0,0,0,.35);border-radius:99px;overflow:hidden;backdrop-filter:blur(4px)}.q307progress i{display:block;height:100%;background:#8ABFF4;width:0%;transition:width .18s}
.q307filebar{display:flex;align-items:center;gap:8px;padding:6px 2px 1px;color:#8fa39a;font-size:9.5px}.q307filebar b{color:#b7c9c0;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
.q307toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom));transform:translate(-50%,12px);opacity:0;pointer-events:none;z-index:900;background:#17252a;color:#fff;padding:10px 13px;border-radius:13px;font-size:12px;max-width:calc(100% - 36px);text-align:center;box-shadow:0 12px 35px rgba(0,0,0,.2);transition:.18s}.q307toast.on{opacity:1;transform:translate(-50%,0)}
.q307viewer{position:fixed;inset:0;z-index:950;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;padding:48px 12px calc(30px + env(safe-area-inset-bottom))}.q307viewer.on{display:flex}.q307viewer img,.q307viewer video{max-width:100%;max-height:100%;object-fit:contain}.q307viewerClose{position:absolute;top:calc(12px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.13);color:#fff;font-size:24px}
`;
document.head.appendChild(style);

const toast=document.createElement('div');toast.className='q307toast';document.body.appendChild(toast);let toastTimer=0;
function showToast(t){toast.textContent=t;toast.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('on'),2600)}
const viewer=document.createElement('div');viewer.className='q307viewer';viewer.innerHTML='<button class="q307viewerClose">×</button><div class="q307viewerBody"></div>';document.body.appendChild(viewer);
viewer.querySelector('.q307viewerClose').onclick=()=>{viewer.classList.remove('on');viewer.querySelector('.q307viewerBody').innerHTML=''};viewer.onclick=e=>{if(e.target===viewer)viewer.querySelector('.q307viewerClose').click()};
function openViewer(uri,kind){if(!uri)return;const body=viewer.querySelector('.q307viewerBody');body.innerHTML='';const el=document.createElement(kind==='video'?'video':'img');el.src=uri;if(kind==='video'){el.controls=true;el.autoplay=true;el.playsInline=true}body.appendChild(el);viewer.classList.add('on')}

let selected=null;
let pickContext=null;
let lastGroupId='';
const pendingSends=new Map();
const downloadLoc=new Map();
const requestedDownloads=new Set();

function groupScreen(){return document.querySelector('.q306groupScreen')}
function currentGroupId(){
  try{if(typeof window.sliqchatActiveGroupId==='function'){const x=String(window.sliqchatActiveGroupId()||'');if(x)return x}}catch(_){}
  const gs=groupScreen();if(!gs||!gs.classList.contains('on'))return'';
  const groups=loadGroups();
  const name=String(gs.querySelector('.q306headName')?.textContent||'').trim();
  if(lastGroupId&&groups[lastGroupId]&&(!name||String(groups[lastGroupId].name||'')===name))return lastGroupId;
  const cand=Object.values(groups).filter(g=>g&&g.id&&String(g.name||'')===name).sort((a,b)=>Number(b.updated_at||0)-Number(a.updated_at||0));
  if(cand[0]){lastGroupId=String(cand[0].id);return lastGroupId}
  return'';
}
document.addEventListener('click',e=>{const r=e.target.closest?.('.q306groupRow[data-group-id]');if(r)lastGroupId=String(r.dataset.groupId||'')},true);

function currentPrivatePhone(){try{return String((typeof peer!=='undefined'&&peer&&peer.phone)||'')}catch(_){return''}}
function contextInfo(type){
  if(type==='group'){
    const id=currentGroupId(),g=loadGroups()[id];if(!id||!g)return null;
    const recipients=(g.members||[]).map(m=>String(m.phone||m)).filter(p=>p&&p!==myPhone());
    if(!recipients.length)return null;
    return{type:'group',id,recipients,group:{id:g.id,name:g.name,owner:g.owner,members:(g.members||[]).map(m=>({phone:String(m.phone||m),name:String(m.name||m.phone||m)}))}};
  }
  const phone=currentPrivatePhone();if(!phone)return null;
  return{type:'private',phone,recipients:[phone]};
}
function composerFor(type){return type==='group'?document.querySelector('.q306groupScreen.on .q306composer'):document.querySelector('#chatScreen .composer')}
function textBoxFor(type){return type==='group'?document.querySelector('.q306groupScreen.on .q306composer textarea'):document.getElementById('messageBox')}

function ensureAttachButtons(){
  const normal=document.querySelector('#chatScreen .composer');
  if(normal&&!normal.querySelector('.q307attach')){
    const b=document.createElement('button');b.type='button';b.className='q307attach';b.textContent='＋';b.title=tx('attach');b.setAttribute('aria-label',tx('attach'));b.onclick=()=>pick('private');normal.insertBefore(b,normal.firstChild);
  }
  const gc=document.querySelector('.q306groupScreen .q306composer');
  if(gc&&!gc.querySelector('.q307attach')){
    const b=document.createElement('button');b.type='button';b.className='q307attach';b.textContent='＋';b.title=tx('attach');b.setAttribute('aria-label',tx('attach'));b.onclick=()=>pick('group');gc.insertBefore(b,gc.firstChild);
    const ta=gc.querySelector('textarea');if(ta)ta.maxLength=4000;
  }
}
function pick(type){
  const c=contextInfo(type);if(!c)return;
  if(selected){try{window.SliqChatMedia?.cancelSelected(selected.id)}catch(_){}selected=null}
  pickContext=c;
  try{window.SliqChatMedia?.pickMedia()}catch(_){showToast(tx('unsupported'))}
}
function draftHost(type){
  const c=composerFor(type);if(!c)return null;
  let d=(type==='group'?groupScreen():document.getElementById('chatScreen'))?.querySelector(':scope > .q307draft');
  if(!d){d=document.createElement('div');d.className='q307draft';c.insertAdjacentElement('beforebegin',d)}
  return d;
}
function restorePlaceholder(type){
  const box=textBoxFor(type);if(!box)return;
  const old=box.dataset.q307oldPlaceholder;if(old!==undefined){box.placeholder=old;delete box.dataset.q307oldPlaceholder}
}
function clearDraft(cancelNative=false){
  if(selected&&cancelNative){try{window.SliqChatMedia?.cancelSelected(selected.id)}catch(_){}}
  if(selected)restorePlaceholder(selected.context?.type||'private');
  selected=null;pickContext=null;
  document.querySelectorAll('.q307draft').forEach(x=>x.remove());
}
function renderDraft(){
  document.querySelectorAll('.q307draft').forEach(x=>x.remove());
  if(!selected)return;
  const type=selected.context.type,host=draftHost(type);if(!host)return;
  const media=document.createElement(selected.kind==='video'?'video':'img');media.className='q307draftMedia';media.src=selected.uri;if(selected.kind==='video'){media.muted=true;media.playsInline=true;media.preload='metadata'}
  const info=document.createElement('div');info.className='q307draftInfo';info.innerHTML=`<div class="q307draftName">${esc(selected.name)}</div><div class="q307draftSize">${esc(selected.kind==='video'?tx('video'):tx('image'))} · ${humanSize(selected.size)} / 120 MB</div>`;
  const rm=document.createElement('button');rm.className='q307draftRemove';rm.type='button';rm.textContent='×';rm.title=tx('remove');rm.onclick=()=>clearDraft(true);
  host.append(media,info,rm);
  const box=textBoxFor(type);if(box){if(box.dataset.q307oldPlaceholder===undefined)box.dataset.q307oldPlaceholder=box.placeholder||'';box.placeholder=selected.kind==='video'?tx('captionVideo'):tx('captionImage');}
}
window.sliqchatMediaSelected=(id,uri,mime,size,name)=>{
  size=Number(size||0);mime=String(mime||'');
  if(size<1||size>MAX_MEDIA_BYTES){showToast(tx('tooLarge'));return}
  const kind=mime.startsWith('video/')?'video':mime.startsWith('image/')?'image':'';
  if(!kind){showToast(tx('unsupported'));return}
  const c=pickContext;if(!c)return;
  selected={id:String(id),uri:String(uri),mime,size,name:String(name||tx('media')),kind,context:c};
  renderDraft();
};
window.sliqchatMediaSelectionError=(id,error)=>{showToast(String(error)==='too_large'?tx('tooLarge'):String(error)==='unsupported_media'?tx('unsupported'):tx('failed'))};

function localPendingMedia(sel,caption){return{pending:true,kind:sel.kind,mime:sel.mime,size:sel.size,name:sel.name,caption,local_uri:sel.uri,progress:0}}
function setMetaPreview(phone,text,t){
  const all=loadMeta(),m=all[phone]||{phone,display_name:phone};all[phone]={...m,last_message:text,last_at:t,unread:0};saveMeta(all);
}
function appendGroupPending(id,m){
  const box=document.querySelector('.q306groupScreen.on .q306msgs');if(!box)return;
  box.querySelector('.q306empty')?.remove();
  const r=document.createElement('div');r.className='q306msg mine';r.dataset.mid=m.id;
  const b=document.createElement('div');b.className='q306bubble';b.innerHTML=`<div class="q306text">${esc(m.text||'')}</div><div class="q306time">${new Date(m.sent_at*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>`;r.appendChild(b);box.appendChild(r);box.scrollTop=box.scrollHeight;
}
function beginSend(type){
  if(!selected||selected.context.type!==type)return false;
  const sel=selected,c=sel.context;
  const box=textBoxFor(type),caption=String(box?.value||'').trim().slice(0,4000);
  const cid='media_'+uuid().slice(0,70),t=now();
  const label=friendly({kind:sel.kind,caption});
  if(type==='private'){
    const phone=c.phone,m={id:cid,sender_phone:myPhone(),recipient_phone:phone,text:caption||label,sent_at:t,read_at:null,reactions:{},media:localPendingMedia(sel,caption)};
    const a=readChat(phone);a.push(m);writeChat(phone,a);setMetaPreview(phone,label,t);
    if(box){box.value='';box.style.height='auto';box.dispatchEvent(new Event('input',{bubbles:true}))}
    try{window.renderMessages?.(a);window.renderConversations?.()}catch(_){}
    pendingSends.set(cid,{type:'private',phone});
  }else{
    const id=c.id,g=loadGroups()[id];if(!g)return false;
    const m={id:cid,sender_phone:myPhone(),sender_name:myName(),text:caption||label,sent_at:t,media:localPendingMedia(sel,caption)};
    const a=loadGroupMessages(id);a.push(m);saveGroupMessages(id,a);g.updated_at=t;saveGroups({...loadGroups(),[id]:g});
    if(box){box.value=''}
    appendGroupPending(id,m);pendingSends.set(cid,{type:'group',id});
  }
  const context=type==='group'?{type:'group',group:c.group}:{type:'private'};
  const recipients=JSON.stringify(c.recipients);
  const selectionId=sel.id;
  selected=null;pickContext=null;document.querySelectorAll('.q307draft').forEach(x=>x.remove());restorePlaceholder(type);
  setTimeout(()=>{decorateAll();patchListPreviews()},20);
  try{window.SliqChatMedia?.sendSelected(selectionId,recipients,caption,cid,authToken(),JSON.stringify(context));}
  catch(_){window.sliqchatMediaUploadError(cid,'upload_failed')}
  return true;
}

document.addEventListener('click',e=>{
  if(!selected)return;
  if(e.target.closest?.('#sendBtn')&&selected.context.type==='private'){e.preventDefault();e.stopImmediatePropagation();beginSend('private');return}
  if(e.target.closest?.('.q306groupScreen.on .q306send')&&selected.context.type==='group'){e.preventDefault();e.stopImmediatePropagation();beginSend('group');}
},true);
document.addEventListener('keydown',e=>{
  if(!selected||e.key!=='Enter'||e.shiftKey)return;
  const privateBox=document.getElementById('messageBox'),groupBox=document.querySelector('.q306groupScreen.on .q306composer textarea');
  if(e.target===privateBox&&selected.context.type==='private'){e.preventDefault();e.stopImmediatePropagation();beginSend('private')}
  else if(e.target===groupBox&&selected.context.type==='group'){e.preventDefault();e.stopImmediatePropagation();beginSend('group')}
},true);

function findMessage(loc,id){
  if(!loc)return null;
  if(loc.type==='private'){const a=readChat(loc.phone);return{arr:a,m:a.find(x=>String(x.id)===String(id)),save:()=>writeChat(loc.phone,a)}}
  const a=loadGroupMessages(loc.id);return{arr:a,m:a.find(x=>String(x.id)===String(id)),save:()=>saveGroupMessages(loc.id,a)}
}
function locForCurrentPrivateMessage(id){
  const phone=currentPrivatePhone();if(!phone)return null;const a=readChat(phone);return a.some(x=>String(x.id)===String(id))?{type:'private',phone}:null;
}
function locateMessageEverywhere(id){
  const p=locForCurrentPrivateMessage(id);if(p)return p;
  const metas=loadMeta();for(const phone of Object.keys(metas)){const a=readChat(phone);if(a.some(x=>String(x.id)===String(id)))return{type:'private',phone}}
  const groups=loadGroups();for(const gid of Object.keys(groups)){const a=loadGroupMessages(gid);if(a.some(x=>String(x.id)===String(id)))return{type:'group',id:gid}}
  return null;
}
window.sliqchatMediaUploadProgress=(id,percent)=>{
  const loc=pendingSends.get(String(id));if(!loc)return;const f=findMessage(loc,id);if(f?.m){f.m.media=f.m.media||{};f.m.media.progress=Math.max(0,Math.min(100,Number(percent||0)));f.save();updateProgressDom(id,f.m.media.progress)}
};
window.sliqchatMediaUploadComplete=(id,marker,localUri,mediaToken)=>{
  id=String(id);const loc=pendingSends.get(id)||locateMessageEverywhere(id);pendingSends.delete(id);const info=parseMarker(marker);
  if(loc){const f=findMessage(loc,id);if(f?.m&&info){f.m.text=String(marker);f.m.media={...info,pending:false,local_uri:String(localUri||''),progress:100};delete f.m.failed;f.save();if(loc.type==='private')setMetaPreview(loc.phone,friendly(info),Number(f.m.sent_at||now()));}}
  decorateAll();patchListPreviews();try{window.renderConversations?.()}catch(_){}
};
window.sliqchatMediaUploadError=(id,error)=>{
  id=String(id);const loc=pendingSends.get(id)||locateMessageEverywhere(id);pendingSends.delete(id);if(loc){const f=findMessage(loc,id);if(f?.m){f.m.failed=true;f.m.media=f.m.media||{};f.m.media.pending=false;f.m.media.error=String(error||'upload_failed');f.save()}}
  showToast(String(error)==='too_large'||String(error)==='media_too_large'?tx('tooLarge'):tx('failed'));decorateAll();
};
function updateProgressDom(id,p){
  document.querySelectorAll('[data-mid]').forEach(r=>{if(String(r.dataset.mid)===String(id)){const bar=r.querySelector('.q307progress i');if(bar)bar.style.width=Math.max(0,Math.min(100,p))+'%'}})
}

function requestDownload(loc,m,info){
  if(!info?.token||!m?.id||requestedDownloads.has(info.token))return;
  let local='';try{local=String(window.SliqChatMedia?.localMedia(info.token,info.mime,info.name)||'')}catch(_){}
  if(local){m.media={...info,local_uri:local,pending:false};const f=findMessage(loc,m.id);if(f?.m){f.m.media=m.media;f.save()}return}
  requestedDownloads.add(info.token);downloadLoc.set(String(m.id),loc);
  try{window.SliqChatMedia?.downloadMedia(info.token,authToken(),String(m.id),info.mime,info.name,info.sha256,Number(info.size||0))}
  catch(_){requestedDownloads.delete(info.token)}
}
window.sliqchatMediaReady=(messageId,mediaToken,localUri)=>{
  const loc=downloadLoc.get(String(messageId))||locateMessageEverywhere(messageId);downloadLoc.delete(String(messageId));requestedDownloads.delete(String(mediaToken));
  if(loc){const f=findMessage(loc,messageId);if(f?.m){const info=parseMarker(f.m.text)||f.m.media||{};f.m.media={...info,local_uri:String(localUri||''),pending:false};f.save()}}
  decorateAll();
};
window.sliqchatMediaDownloadError=(messageId,mediaToken,error)=>{requestedDownloads.delete(String(mediaToken));const loc=downloadLoc.get(String(messageId));downloadLoc.delete(String(messageId));if(loc){const f=findMessage(loc,messageId);if(f?.m){f.m.media=f.m.media||parseMarker(f.m.text)||{};f.m.media.download_error=String(error||'download_failed');f.save()}}decorateAll()};

function mediaInfoForMessage(m){return m?.media||parseMarker(m?.text||'')}
function makeMediaCard(row,m,loc,info){
  const bubble=row.querySelector('.bubble,.q306bubble');if(!bubble||!info)return;
  let card=bubble.querySelector('.q307media');if(card)card.remove();
  const textEl=bubble.querySelector('.btext,.q306text'),timeEl=bubble.querySelector('.meta,.q306time');
  const caption=String((info.caption??m.media?.caption) || '');
  if(textEl){textEl.textContent=caption;textEl.style.display=caption?'':'none'}
  card=document.createElement('div');card.className='q307media';
  let uri=String(info.local_uri||m.media?.local_uri||'');
  if(!uri&&info.token){try{uri=String(window.SliqChatMedia?.localMedia(info.token,info.mime,info.name)||'')}catch(_){}if(uri){m.media={...info,local_uri:uri,pending:false};const f=findMessage(loc,m.id);if(f?.m){f.m.media=m.media;f.save()}}}
  if(uri){
    const el=document.createElement(info.kind==='video'?'video':'img');el.src=uri;
    if(info.kind==='video'){el.controls=true;el.preload='metadata';el.playsInline=true}else{el.alt=info.name||tx('image');el.loading='lazy';el.onclick=()=>openViewer(uri,'image')}
    card.appendChild(el);
  }else if(info.error||m.failed||info.download_error){
    const st=document.createElement('div');st.className='q307mediaStatus';st.textContent=info.download_error==='media_expired'?tx('expired'):tx('downloadFailed');card.appendChild(st);
  }else{
    const st=document.createElement('div');st.className='q307mediaStatus';st.innerHTML='<span class="q307spin"></span><span></span>';st.querySelector('span:last-child').textContent=info.pending?tx('uploading')+'…':tx('preparing');card.appendChild(st);
    if(!info.pending&&info.token)requestDownload(loc,m,info);
  }
  const fb=document.createElement('div');fb.className='q307filebar';fb.innerHTML=`<span>${info.kind==='video'?'🎬':'📷'}</span><b>${esc(info.name||tx(info.kind==='video'?'video':'image'))}</b><span>${humanSize(info.size)}</span>`;card.appendChild(fb);
  if(info.pending){
    const pr=document.createElement('div');pr.className='q307progress';pr.innerHTML='<i></i>';pr.querySelector('i').style.width=Math.max(0,Math.min(100,Number(info.progress||0)))+'%';card.appendChild(pr);
  }
  if(timeEl)bubble.insertBefore(card,timeEl);else bubble.appendChild(card);
  if(textEl&&caption){if(timeEl)bubble.insertBefore(textEl,timeEl);else bubble.appendChild(textEl)}
  row.dataset.q307media='1';
}
function decoratePrivate(){
  const phone=currentPrivatePhone();if(!phone)return;const map=new Map(readChat(phone).map(m=>[String(m.id),m]));
  document.querySelectorAll('#messages .bubbleRow[data-mid]').forEach(row=>{const m=map.get(String(row.dataset.mid||''));if(!m)return;const info=mediaInfoForMessage(m);if(info)makeMediaCard(row,m,{type:'private',phone},info)});
}
function decorateGroup(){
  const gs=groupScreen();if(!gs||!gs.classList.contains('on'))return;const gid=currentGroupId();if(!gid)return;const a=loadGroupMessages(gid),rows=[...gs.querySelectorAll('.q306msgs .q306msg')];
  rows.forEach((row,i)=>{const m=a[i];if(!m)return;row.dataset.mid=m.id||'';const info=mediaInfoForMessage(m);if(info)makeMediaCard(row,m,{type:'group',id:gid},info)});
}
function decorateAll(){ensureAttachButtons();renderDraft();decoratePrivate();decorateGroup();patchListPreviews();setVersion()}

function patchListPreviews(){
  const all=loadMeta();
  document.querySelectorAll('#people .q26row[data-phone]').forEach(row=>{
    if(row.classList.contains('q299helpRow'))return;const p=String(row.dataset.phone||''),prev=row.querySelector('.q26preview');if(!prev)return;
    const raw=String(all[p]?.last_message||'');const info=parseMarker(raw);if(info)prev.textContent=friendly(info);
  });
  const groups=loadGroups();
  document.querySelectorAll('#people .q306groupRow[data-group-id]').forEach(row=>{
    const gid=String(row.dataset.groupId||''),a=loadGroupMessages(gid),last=a[a.length-1],el=row.querySelector('.q306groupLast');if(!last||!el)return;
    const info=mediaInfoForMessage(last);if(info){const sender=last.sender_phone===myPhone()?tx('you'):(last.sender_name||'');el.textContent=(sender?sender+': ':'')+friendly(info)}
  });
}

function processGroupMedia(info,event){
  const g=info?.context?.group;if(!g||!g.id)return false;
  const own=myPhone(),members=Array.isArray(g.members)?g.members:[];if(!members.some(m=>String(m.phone||m)===own))return true;
  const groups=loadGroups(),old=groups[g.id]||{},active=currentGroupId()===String(g.id)&&groupScreen()?.classList.contains('on');
  groups[g.id]={...old,...g,members,unread:active?0:Number(old.unread||0)+1,updated_at:Number(event?.sent_at||now())};saveGroups(groups);
  const a=loadGroupMessages(g.id),mid=String(event?.id||uuid());if(!a.some(m=>String(m.id)===mid)){a.push({id:mid,sender_phone:String(event?.sender_phone||''),sender_name:String(event?.display_name||''),text:String(event?.text||''),sent_at:Number(event?.sent_at||now())});saveGroupMessages(g.id,a)}
  if(active){lastGroupId=String(g.id);appendIncomingGroupRow(a[a.length-1]);setTimeout(decorateGroup,0)}
  return true;
}
function appendIncomingGroupRow(m){
  const box=document.querySelector('.q306groupScreen.on .q306msgs');if(!box||box.querySelector(`[data-mid="${String(m.id).replace(/"/g,'')}"]`))return;box.querySelector('.q306empty')?.remove();
  const r=document.createElement('div');r.className='q306msg';r.dataset.mid=m.id;const s=document.createElement('div');s.className='q306sender';s.textContent=m.sender_name||m.sender_phone;r.appendChild(s);const b=document.createElement('div');b.className='q306bubble';b.innerHTML=`<div class="q306text"></div><div class="q306time">${new Date(Number(m.sent_at||0)*1000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>`;r.appendChild(b);box.appendChild(r);box.scrollTop=box.scrollHeight;
}

const priorApi=window.api;
if(typeof priorApi==='function')window.api=async function(path,method='GET',body=null,auth=true){
  const r=await priorApi(path,method,body,auth);
  if(path==='/api/events'&&r&&r.ok&&Array.isArray(r.events)){
    const keep=[],ack=[];
    for(const e of r.events){const info=e&&e.type==='message'?parseMarker(e.text):null;if(info&&info.context?.type==='group'&&processGroupMedia(info,e)){if(e.id)ack.push(e.id)}else keep.push(e)}
    if(ack.length)priorApi('/api/ack','POST',{ids:ack}).catch(()=>{});
    return{...r,events:keep};
  }
  return r;
};

let obsPending=false;const observer=new MutationObserver(()=>{if(obsPending)return;obsPending=true;requestAnimationFrame(()=>{obsPending=false;decorateAll()})});observer.observe(document.body,{subtree:true,childList:true});
function setVersion(){document.querySelectorAll('.small').forEach(el=>{if(/(?:Qevyno|SliqChat)\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`SliqChat v${VERSION} • Android 8+`})}
[0,180,450,900,1700].forEach(ms=>setTimeout(decorateAll,ms));
window.addEventListener('focus',decorateAll);document.addEventListener('visibilitychange',()=>{if(!document.hidden)decorateAll()});
})();