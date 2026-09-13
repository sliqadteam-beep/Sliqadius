(()=>{
'use strict';
if(window.__skaysa315Installed)return;
window.__skaysa315Installed=true;

const VERSION='2.9.41';
const GROUPS_KEY='sliqchat_groups_v1';
const GROUP_MSG_PREFIX='sliqchat_group_messages_';
const DELETE_KEY='skaysa_deleted_chats_v1';
const REACTION_KEY='skaysa_reactions_v1';
const REACTION_PREFIX='[[SKAYSA_REACTION_V1:';
const REACTION_SUFFIX=']]';
const EMOJIS=['❤️','👍','😂','😮','😢'];

function lang(){
  try{
    let l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0];
    if(l==='ua')l='uk';
    return ['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'].includes(l)?l:'en';
  }catch(_){return'en'}
}
const T={
 en:{groupPhoto:'Group picture',groupPhotoSub:'Choose a picture for the group. You can skip this.',choosePhoto:'Choose picture',skip:'Skip',deleteTitle:'Delete chat?',deleteQ:'Do you really want to delete this chat?',delete:'Delete',cancel:'Cancel',react:'React to message',copy:'Copy',reacted:'Reaction',badImage:'This picture could not be used.'},
 de:{groupPhoto:'Gruppenbild',groupPhotoSub:'Wähle ein Bild für die Gruppe. Du kannst diesen Schritt überspringen.',choosePhoto:'Bild auswählen',skip:'Überspringen',deleteTitle:'Chat löschen?',deleteQ:'Möchtest du diesen Chat wirklich löschen?',delete:'Löschen',cancel:'Abbrechen',react:'Auf Nachricht reagieren',copy:'Kopieren',reacted:'Reaktion',badImage:'Dieses Bild konnte nicht verwendet werden.'},
 es:{groupPhoto:'Foto del grupo',groupPhotoSub:'Elige una foto para el grupo. Puedes omitir este paso.',choosePhoto:'Elegir foto',skip:'Omitir',deleteTitle:'¿Eliminar chat?',deleteQ:'¿Quieres eliminar este chat?',delete:'Eliminar',cancel:'Cancelar',react:'Reaccionar al mensaje',copy:'Copiar',reacted:'Reacción',badImage:'No se pudo usar esta imagen.'},
 fr:{groupPhoto:'Photo du groupe',groupPhotoSub:'Choisis une photo pour le groupe. Tu peux passer cette étape.',choosePhoto:'Choisir une photo',skip:'Passer',deleteTitle:'Supprimer la discussion ?',deleteQ:'Veux-tu vraiment supprimer cette discussion ?',delete:'Supprimer',cancel:'Annuler',react:'Réagir au message',copy:'Copier',reacted:'Réaction',badImage:'Cette image ne peut pas être utilisée.'},
 it:{groupPhoto:'Foto del gruppo',groupPhotoSub:'Scegli una foto per il gruppo. Puoi saltare questo passaggio.',choosePhoto:'Scegli foto',skip:'Salta',deleteTitle:'Eliminare la chat?',deleteQ:'Vuoi davvero eliminare questa chat?',delete:'Elimina',cancel:'Annulla',react:'Reagisci al messaggio',copy:'Copia',reacted:'Reazione',badImage:'Impossibile usare questa immagine.'},
 pt:{groupPhoto:'Imagem do grupo',groupPhotoSub:'Escolhe uma imagem para o grupo. Podes ignorar este passo.',choosePhoto:'Escolher imagem',skip:'Ignorar',deleteTitle:'Eliminar conversa?',deleteQ:'Queres mesmo eliminar esta conversa?',delete:'Eliminar',cancel:'Cancelar',react:'Reagir à mensagem',copy:'Copiar',reacted:'Reação',badImage:'Não foi possível usar esta imagem.'},
 nl:{groupPhoto:'Groepsfoto',groupPhotoSub:'Kies een foto voor de groep. Je kunt deze stap overslaan.',choosePhoto:'Foto kiezen',skip:'Overslaan',deleteTitle:'Chat verwijderen?',deleteQ:'Wil je deze chat echt verwijderen?',delete:'Verwijderen',cancel:'Annuleren',react:'Reageren op bericht',copy:'Kopiëren',reacted:'Reactie',badImage:'Deze afbeelding kon niet worden gebruikt.'},
 pl:{groupPhoto:'Zdjęcie grupy',groupPhotoSub:'Wybierz zdjęcie dla grupy. Możesz pominąć ten krok.',choosePhoto:'Wybierz zdjęcie',skip:'Pomiń',deleteTitle:'Usunąć czat?',deleteQ:'Czy na pewno chcesz usunąć ten czat?',delete:'Usuń',cancel:'Anuluj',react:'Zareaguj na wiadomość',copy:'Kopiuj',reacted:'Reakcja',badImage:'Nie można użyć tego zdjęcia.'},
 tr:{groupPhoto:'Grup resmi',groupPhotoSub:'Grup için bir resim seç. Bu adımı atlayabilirsin.',choosePhoto:'Resim seç',skip:'Atla',deleteTitle:'Sohbet silinsin mi?',deleteQ:'Bu sohbeti gerçekten silmek istiyor musun?',delete:'Sil',cancel:'İptal',react:'Mesaja tepki ver',copy:'Kopyala',reacted:'Tepki',badImage:'Bu resim kullanılamadı.'},
 uk:{groupPhoto:'Фото групи',groupPhotoSub:'Вибери фото для групи. Цей крок можна пропустити.',choosePhoto:'Вибрати фото',skip:'Пропустити',deleteTitle:'Видалити чат?',deleteQ:'Справді видалити цей чат?',delete:'Видалити',cancel:'Скасувати',react:'Відреагувати на повідомлення',copy:'Копіювати',reacted:'Реакція',badImage:'Не вдалося використати це зображення.'},
 ru:{groupPhoto:'Фото группы',groupPhotoSub:'Выберите фото для группы. Этот шаг можно пропустить.',choosePhoto:'Выбрать фото',skip:'Пропустить',deleteTitle:'Удалить чат?',deleteQ:'Вы действительно хотите удалить этот чат?',delete:'Удалить',cancel:'Отмена',react:'Отреагировать на сообщение',copy:'Копировать',reacted:'Реакция',badImage:'Не удалось использовать это изображение.'},
 ja:{groupPhoto:'グループ画像',groupPhotoSub:'グループの画像を選択します。この手順はスキップできます。',choosePhoto:'画像を選択',skip:'スキップ',deleteTitle:'チャットを削除しますか？',deleteQ:'このチャットを本当に削除しますか？',delete:'削除',cancel:'キャンセル',react:'メッセージにリアクション',copy:'コピー',reacted:'リアクション',badImage:'この画像は使用できません。'},
 ko:{groupPhoto:'그룹 사진',groupPhotoSub:'그룹 사진을 선택하세요. 이 단계는 건너뛸 수 있습니다.',choosePhoto:'사진 선택',skip:'건너뛰기',deleteTitle:'채팅을 삭제할까요?',deleteQ:'이 채팅을 정말 삭제할까요?',delete:'삭제',cancel:'취소',react:'메시지에 반응',copy:'복사',reacted:'반응',badImage:'이 사진을 사용할 수 없습니다.'},
 zh:{groupPhoto:'群组头像',groupPhotoSub:'为群组选择一张图片。你也可以跳过此步骤。',choosePhoto:'选择图片',skip:'跳过',deleteTitle:'删除聊天？',deleteQ:'确定要删除此聊天吗？',delete:'删除',cancel:'取消',react:'回应消息',copy:'复制',reacted:'回应',badImage:'无法使用此图片。'},
 ar:{groupPhoto:'صورة المجموعة',groupPhotoSub:'اختر صورة للمجموعة. يمكنك تخطي هذه الخطوة.',choosePhoto:'اختيار صورة',skip:'تخطي',deleteTitle:'حذف المحادثة؟',deleteQ:'هل تريد حقاً حذف هذه المحادثة؟',delete:'حذف',cancel:'إلغاء',react:'التفاعل مع الرسالة',copy:'نسخ',reacted:'تفاعل',badImage:'تعذر استخدام هذه الصورة.'}
};
function tx(k){const d=T[lang()]||T.en;return d[k]||T.en[k]||k}
const REMOVE_PHOTO={
 en:'Remove picture',de:'Bild entfernen',es:'Quitar imagen',fr:'Supprimer l’image',
 it:'Rimuovi immagine',pt:'Remover imagem',nl:'Afbeelding verwijderen',
 pl:'Usuń zdjęcie',tr:'Resmi kaldır',uk:'Видалити фото',ru:'Удалить фото',
 ja:'画像を削除',ko:'사진 삭제',zh:'移除图片',ar:'إزالة الصورة'
};
function removePhotoText(){return REMOVE_PHOTO[lang()]||REMOVE_PHOTO.en}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function norm(v){return String(v||'').trim().replace(/[\s().-]/g,'').replace(/^00/,'+')}
function now(){return Math.floor(Date.now()/1000)}
function readJson(k,f={}){try{const x=JSON.parse(localStorage.getItem(k)||'');return x&&typeof x==='object'?x:f}catch(_){return f}}
function writeJson(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
function b64urlEncode(s){try{return btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}catch(_){return''}}
function b64urlDecode(s){try{s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))}catch(_){return''}}
function reactionPacket(o){return REACTION_PREFIX+b64urlEncode(JSON.stringify(o))+REACTION_SUFFIX}
function parseReaction(text){
  text=String(text||'');
  if(!text.startsWith(REACTION_PREFIX)||!text.endsWith(REACTION_SUFFIX))return null;
  try{
    const o=JSON.parse(b64urlDecode(text.slice(REACTION_PREFIX.length,-REACTION_SUFFIX.length)));
    if(!o||Number(o.v)!==1||!o.target)return null;
    return{target:String(o.target),emoji:String(o.emoji||''),actor:norm(o.actor||''),ts:Number(o.ts||0)};
  }catch(_){return null}
}
function currentPhone(){return norm(document.querySelector('#chatPresence .q26phone')?.textContent||'')}
function messageKey(m,i=0){return String(m?.id||m?.client_id||('m_'+String(m?.sender_phone||'')+'_'+String(m?.sent_at||0)+'_'+String(m?.text||'')+'_'+i))}
function toSec(v){const n=Number(v||0);return n>100000000000?Math.floor(n/1000):n}

const style=document.createElement('style');
style.id='skaysa315style';
style.textContent=`
.q315groupPhotoField{margin:12px 0 4px;padding:12px;border:1px solid #dce6ee;border-radius:18px;background:#f8fbfd;display:flex;align-items:center;gap:12px}
.q315groupPhotoPreview{width:72px;height:72px;min-width:72px;border-radius:24px;background:#dcecff;color:#47739c;display:grid;place-items:center;font-size:26px;font-weight:900;background-size:cover;background-position:center;overflow:hidden;border:2px solid #fff;box-shadow:0 5px 16px rgba(36,73,108,.12)}
.q315groupPhotoInfo{min-width:0;flex:1}.q315groupPhotoTitle{font-size:13px;font-weight:900;color:#17212b}.q315groupPhotoSub{font-size:10.5px;line-height:1.4;color:#7b8d97;margin-top:3px}
.q315groupPhotoActions{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.q315groupPhotoActions button{height:34px;padding:0 10px;border-radius:11px;font-size:10.5px;font-weight:850}
.q315choose{background:#8ABFF4;color:#102335}.q315skip{background:#edf2f5;color:#667982}.q315skip.remove{background:#fff0f1;color:#bd4e58}
.q306groupAvatar,.q306headAvatar{background-size:cover!important;background-position:center!important;overflow:hidden!important}
.q315confirmBack,.q315reactionBack{position:fixed;inset:0;z-index:2500;background:rgba(23,33,43,.48);display:flex;align-items:flex-end;opacity:0;visibility:hidden;pointer-events:none;transition:.15s}
.q315confirmBack.on,.q315reactionBack.on{opacity:1;visibility:visible;pointer-events:auto}
.q315sheet{width:100%;max-width:560px;margin:auto;background:#fff;color:#17212b;border-radius:25px 25px 0 0;padding:12px 16px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -18px 55px rgba(23,33,43,.18)}
.q315handle{width:40px;height:4px;background:#d7e1e7;border-radius:99px;margin:1px auto 15px}.q315title{font-size:19px;font-weight:950}.q315text{font-size:12px;color:#71838d;line-height:1.5;margin:7px 0 14px}
.q315actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.q315actions button{height:48px;border-radius:15px;font-weight:900}.q315cancel{background:#eef3f5;color:#51646b}.q315delete{background:#ef5d67;color:#fff}
.q315emojiRow{display:flex;justify-content:space-between;gap:5px;margin:12px 0}.q315emoji{flex:1;height:50px;border-radius:15px;background:#f3f7f9;font-size:24px;transition:.13s}.q315emoji.active{background:#e2f0ff;outline:2px solid #8ABFF4;transform:scale(1.05)}.q315copy{width:100%;height:44px;border-radius:13px;background:#edf3f6;color:#536870;font-weight:850}
.q315reactionLine{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}.q315reactionPill{display:inline-flex;align-items:center;gap:3px;padding:3px 7px;border:1px solid #d9e5ec;background:#f7fbfd;border-radius:999px;font-size:12px;line-height:1;cursor:pointer}.q315holding{transform:scale(.985)!important;filter:brightness(.985)}
.mine .q315reactionPill,.q306msg.mine .q315reactionPill{background:#edf7ff;border-color:#cfe4f7}
`;
document.head.appendChild(style);

/* ---------------- Group picture ---------------- */
let groupPhotoPicking=false;
let groupPhotoBusy=false;
let priorPicked=typeof window.qevynoProfilePicked==='function'?window.qevynoProfilePicked:null;
let priorPickFailed=typeof window.qevynoProfilePickFailed==='function'?window.qevynoProfilePickFailed:null;

function imageFromData(data){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=data})}
async function compactGroupImage(data){
  try{
    const img=await imageFromData(data);
    let size=64,quality=.68,out='';
    for(let n=0;n<7;n++){
      const c=document.createElement('canvas');c.width=size;c.height=size;
      const x=c.getContext('2d');
      x.fillStyle='#ffffff';x.fillRect(0,0,size,size);
      const scale=Math.max(size/img.naturalWidth,size/img.naturalHeight);
      const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
      x.drawImage(img,(size-w)/2,(size-h)/2,w,h);
      out=c.toDataURL('image/jpeg',quality);
      if(out.length<=1200)return out;
      size=Math.max(42,Math.floor(size*.84));quality=Math.max(.38,quality-.07);
    }
    return out.length<=1800?out:'';
  }catch(_){return''}
}
function updateGroupPhotoUi(){
  const box=document.querySelector('.q315groupPhotoField');if(!box)return;
  const img=String(window.__skaysaPendingGroupImage||'');
  const p=box.querySelector('.q315groupPhotoPreview'),skip=box.querySelector('.q315skip');if(!p)return;
  if(p.dataset.q315src!==img){
    p.dataset.q315src=img;
    if(img){if(p.textContent)p.textContent='';p.style.backgroundImage=`url("${img.replace(/"/g,'%22')}")`}
    else{p.style.backgroundImage='';if(p.textContent!=='👥')p.textContent='👥'}
  }
  if(skip){
    const wanted=img?removePhotoText():tx('skip');
    if(skip.textContent!==wanted)skip.textContent=wanted;
    skip.classList.toggle('remove',!!img);
  }
}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.q306group')){window.__skaysaPendingGroupImage='';setTimeout(()=>{ensureGroupPhoto();updateGroupPhotoUi()},30)}},true);
let creatorWasOpen=false;
function syncGroupCreatorLifecycle(){
  const input=document.querySelector('.q306groupName'),back=input?.closest('.q306back');
  const open=!!back?.classList.contains('on');
  if(open&&!creatorWasOpen){window.__skaysaPendingGroupImage='';setTimeout(updateGroupPhotoUi,0)}
  if(!open&&creatorWasOpen){window.__skaysaPendingGroupImage=''}
  creatorWasOpen=open;
}
function ensureGroupPhoto(){
  const input=document.querySelector('.q306groupName');
  const back=input?.closest('.q306back');
  const field=input?.closest('.q306field');
  if(!input||!back||!field)return;
  let box=back.querySelector('.q315groupPhotoField');
  if(!box){
    box=document.createElement('div');box.className='q315groupPhotoField';
    box.innerHTML=`<div class="q315groupPhotoPreview">👥</div><div class="q315groupPhotoInfo"><div class="q315groupPhotoTitle">${esc(tx('groupPhoto'))}</div><div class="q315groupPhotoSub">${esc(tx('groupPhotoSub'))}</div><div class="q315groupPhotoActions"><button type="button" class="q315choose">${esc(tx('choosePhoto'))}</button><button type="button" class="q315skip">${esc(tx('skip'))}</button></div></div>`;
    field.insertAdjacentElement('beforebegin',box);
    box.querySelector('.q315choose').onclick=()=>{
      if(groupPhotoBusy)return;
      groupPhotoPicking=true;
      try{QevynoDevice.pickProfilePicture()}catch(_){groupPhotoPicking=false;alert(tx('badImage'))}
    };
    box.querySelector('.q315skip').onclick=()=>{window.__skaysaPendingGroupImage='';updateGroupPhotoUi()};
  }else{
    const title=box.querySelector('.q315groupPhotoTitle'),sub=box.querySelector('.q315groupPhotoSub'),choose=box.querySelector('.q315choose'),skip=box.querySelector('.q315skip');
    if(title&&title.textContent!==tx('groupPhoto'))title.textContent=tx('groupPhoto');
    if(sub&&sub.textContent!==tx('groupPhotoSub'))sub.textContent=tx('groupPhotoSub');
    if(choose&&choose.textContent!==tx('choosePhoto'))choose.textContent=tx('choosePhoto');
    if(skip&&skip.textContent!==tx('skip'))skip.textContent=tx('skip');
  }
  updateGroupPhotoUi();
}
window.qevynoProfilePicked=function(dataUrl,w,h){
  if(groupPhotoPicking){
    groupPhotoPicking=false;groupPhotoBusy=true;
    compactGroupImage(String(dataUrl||'')).then(img=>{
      groupPhotoBusy=false;
      if(!img){alert(tx('badImage'));return}
      window.__skaysaPendingGroupImage=img;updateGroupPhotoUi();
    });
    return;
  }
  if(priorPicked)return priorPicked.apply(this,arguments);
};
window.qevynoProfilePickFailed=function(){
  if(groupPhotoPicking){groupPhotoPicking=false;groupPhotoBusy=false;return}
  if(priorPickFailed)return priorPickFailed.apply(this,arguments);
};

function applyGroupAvatars(){
  const groups=readJson(GROUPS_KEY,{});
  document.querySelectorAll('.q306groupRow[data-group-id]').forEach(row=>{
    const g=groups[row.dataset.groupId],av=row.querySelector('.q306groupAvatar');if(!g||!av)return;
    if(g.image){av.style.backgroundImage=`url("${String(g.image).replace(/"/g,'%22')}")`;av.textContent=''}
    else{av.style.backgroundImage='';if(!av.textContent)av.textContent=String(g.name||'?').trim().split(/\s+/).map(x=>x[0]||'').join('').slice(0,2).toUpperCase()}
  });
  const screen=document.querySelector('.q306groupScreen'),gid=screen?.dataset.groupId||'',g=groups[gid],head=screen?.querySelector('.q306headAvatar');
  if(head&&g){if(g.image){head.style.backgroundImage=`url("${String(g.image).replace(/"/g,'%22')}")`;head.textContent=''}else{head.style.backgroundImage='';if(!head.textContent)head.textContent=String(g.name||'?').trim().split(/\s+/).map(x=>x[0]||'').join('').slice(0,2).toUpperCase()}}
}

/* ---------------- Delete chat by long press ---------------- */
const confirmBack=document.createElement('div');
confirmBack.className='q315confirmBack';
confirmBack.innerHTML=`<div class="q315sheet"><div class="q315handle"></div><div class="q315title"></div><div class="q315text"></div><div class="q315actions"><button class="q315cancel"></button><button class="q315delete"></button></div></div>`;
document.body.appendChild(confirmBack);
let deleteTarget=null;
function closeDelete(){confirmBack.classList.remove('on');deleteTarget=null}
function openDelete(row){
  const gid=String(row.dataset.groupId||'');
  const phone=norm(row.dataset.phone||row.querySelector('.q305phone')?.textContent||'');
  if(!gid&&!phone)return;
  let name=String(row.querySelector('.q26name')?.textContent||'').trim();
  if(gid&&!name){name=String(readJson(GROUPS_KEY,{})[gid]?.name||'').trim()}
  deleteTarget=gid?{kind:'group',id:gid,name}:{kind:'direct',id:phone,name};
  confirmBack.querySelector('.q315title').textContent=name||tx('deleteTitle');
  confirmBack.querySelector('.q315text').textContent=tx('deleteQ');
  confirmBack.querySelector('.q315cancel').textContent=tx('cancel');
  confirmBack.querySelector('.q315delete').textContent=tx('delete');
  confirmBack.classList.add('on');
}
confirmBack.onclick=e=>{if(e.target===confirmBack)closeDelete()};
confirmBack.querySelector('.q315cancel').onclick=closeDelete;
confirmBack.querySelector('.q315delete').onclick=()=>{
  if(!deleteTarget)return;
  if(deleteTarget.kind==='group'){
    const groups=readJson(GROUPS_KEY,{});
    delete groups[deleteTarget.id];writeJson(GROUPS_KEY,groups);
    localStorage.removeItem(GROUP_MSG_PREFIX+deleteTarget.id);
  }else{
    const phone=deleteTarget.id;
    const deleted=readJson(DELETE_KEY,{});
    deleted[phone]=now();writeJson(DELETE_KEY,deleted);
    try{localStorage.removeItem('qevyno_chat_'+phone)}catch(_){}
    try{if(window.QevynoDevice&&QevynoDevice.saveChat)QevynoDevice.saveChat(phone,'[]')}catch(_){}
    const pins=new Set(readJson('qevyno_pins',[]));pins.delete(phone);writeJson('qevyno_pins',[...pins]);
    const rx=readJson(REACTION_KEY,{});delete rx[phone];writeJson(REACTION_KEY,rx);
  }
  closeDelete();
  setTimeout(()=>{try{window.loadConversations&&window.loadConversations()}catch(_){}},40);
};

let holdTimer=0,holdRow=null,holdX=0,holdY=0,suppressUntil=0;
document.addEventListener('pointerdown',e=>{
  const row=e.target.closest&&e.target.closest('#people .q26row');
  if(!row||row.classList.contains('q299helpRow')||e.target.closest('.q26pin'))return;
  holdRow=row;holdX=e.clientX;holdY=e.clientY;
  clearTimeout(holdTimer);
  row.classList.add('q315holding');
  holdTimer=setTimeout(()=>{
    suppressUntil=Date.now()+900;
    try{navigator.vibrate&&navigator.vibrate(24)}catch(_){}
    row.classList.remove('q315holding');
    openDelete(row)
  },540);
},true);
document.addEventListener('pointermove',e=>{if(holdRow&&Math.hypot(e.clientX-holdX,e.clientY-holdY)>12){clearTimeout(holdTimer);holdRow.classList.remove('q315holding');holdRow=null}},true);
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>{clearTimeout(holdTimer);if(holdRow)holdRow.classList.remove('q315holding');holdRow=null},true));
document.addEventListener('click',e=>{if(Date.now()<suppressUntil&&e.target.closest&&e.target.closest('#people .q26row')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}},true);

/* ---------------- Reactions ---------------- */
function loadReactions(){return readJson(REACTION_KEY,{})}
function saveReactions(x){writeJson(REACTION_KEY,x)}
function reactionSummary(obj){
  const counts={};Object.values(obj||{}).filter(Boolean).forEach(e=>counts[e]=(counts[e]||0)+1);
  return Object.entries(counts);
}
function setDirectReactionLocal(phone,target,actor,emoji){
  phone=norm(phone);actor=norm(actor);if(!phone||!target||!actor)return;
  const all=loadReactions();all[phone]=all[phone]||{};all[phone][target]=all[phone][target]||{};
  const old=all[phone][target][actor]||'';
  if(old===emoji)return;
  if(emoji)all[phone][target][actor]=emoji;else delete all[phone][target][actor];
  saveReactions(all);
}
function getDirectReactions(phone,target){return loadReactions()[norm(phone)]?.[target]||{}}
function addReactionLine(bubble,reactions){
  const list=reactionSummary(reactions),sig=JSON.stringify(list);
  let line=bubble.querySelector(':scope > .q315reactionLine');
  if(!list.length){if(line)line.remove();return}
  if(line&&line.dataset.q315sig===sig)return;
  if(!line){line=document.createElement('div');line.className='q315reactionLine';bubble.appendChild(line)}
  line.dataset.q315sig=sig;line.innerHTML='';
  for(const [emoji,count] of list){const p=document.createElement('span');p.className='q315reactionPill';p.textContent=emoji+(count>1?' '+count:'');line.appendChild(p)}
}
function copyText315(text){
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(String(text||''));return}
  }catch(_){}
  try{const a=document.createElement('textarea');a.value=String(text||'');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}catch(_){}
}
const reactionBack=document.createElement('div');
reactionBack.className='q315reactionBack';
reactionBack.innerHTML=`<div class="q315sheet"><div class="q315handle"></div><div class="q315title"></div><div class="q315emojiRow"></div><button class="q315copy"></button></div>`;
document.body.appendChild(reactionBack);
let reactionContext=null;
function closeReactions(){reactionBack.classList.remove('on');reactionContext=null}
reactionBack.onclick=e=>{if(e.target===reactionBack)closeReactions()};
function openReactions(ctx){
  reactionContext=ctx;
  reactionBack.querySelector('.q315title').textContent=tx('react');
  reactionBack.querySelector('.q315copy').textContent=tx('copy');
  const active=String((ctx&&typeof ctx.current==='function'?ctx.current():'')||'');
  const row=reactionBack.querySelector('.q315emojiRow');row.innerHTML='';
  EMOJIS.forEach(emoji=>{
    const b=document.createElement('button');b.className='q315emoji'+(active===emoji?' active':'');b.textContent=emoji;
    b.onclick=()=>{const c=reactionContext;closeReactions();if(c)c.react(emoji)};
    row.appendChild(b)
  });
  reactionBack.querySelector('.q315copy').onclick=()=>{const c=reactionContext;closeReactions();if(c)copyText315(c.text||'')};
  reactionBack.classList.add('on');
}
function bindLongReaction(bubble,ctxFactory){
  if(!bubble||bubble.dataset.q315bound)return;bubble.dataset.q315bound='1';
  let timer=0,x=0,y=0;
  bubble.addEventListener('pointerdown',e=>{
    e.stopImmediatePropagation();
    x=e.clientX;y=e.clientY;clearTimeout(timer);
    timer=setTimeout(()=>openReactions(ctxFactory()),500);
  },true);
  bubble.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-x,e.clientY-y)>10)clearTimeout(timer)},true);
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>bubble.addEventListener(ev,()=>clearTimeout(timer),true));
  bubble.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();openReactions(ctxFactory())},true);
  bubble.addEventListener('click',e=>{
    if(e.target.closest&&e.target.closest('.q315reactionPill')){
      e.preventDefault();e.stopPropagation();openReactions(ctxFactory())
    }
  },true);
}
async function sendDirectReaction(phone,target,emoji){
  const me=norm(localStorage.getItem('qevyno_phone')||'');if(!phone||!target||!me)return;
  const current=getDirectReactions(phone,target)[me]||'';
  const next=current===emoji?'':emoji;
  setDirectReactionLocal(phone,target,me,next);
  decorateDirectMessages(window.__skaysa315LastDirect||[],phone);
  try{
    const text=reactionPacket({v:1,target,emoji:next,actor:me,ts:now()});
    await window.api('/api/send','POST',{to:phone,text});
  }catch(_){}
}
function processDirectReactions(arr,phone){
  const keep=[];
  for(const m of (Array.isArray(arr)?arr:[])){
    const r=parseReaction(m?.text);
    if(r){setDirectReactionLocal(phone,r.target,norm(m.sender_phone||r.actor),r.emoji);continue}
    keep.push(m);
  }
  return keep;
}
function decorateDirectMessages(arr,phone){
  window.__skaysa315LastDirect=arr;
  const rows=[...document.querySelectorAll('#messages .bubbleRow')];
  rows.forEach((row,i)=>{
    const m=arr[i];if(!m)return;
    const id=messageKey(m,i),bubble=row.querySelector('.bubble');if(!bubble)return;
    row.dataset.messageId=id;
    addReactionLine(bubble,getDirectReactions(phone,id));
    bindLongReaction(bubble,()=>({text:String(m.text||''),current:()=>getDirectReactions(phone,id)[norm(localStorage.getItem('qevyno_phone')||'')]||'',react:emoji=>sendDirectReaction(phone,id,emoji)}));
  });
}
function installDirectWrappers(){
  if(typeof window.renderMessages==='function'&&!window.renderMessages.__q315){
    const prior=window.renderMessages;
    const wrapped=function(arr){
      const phone=currentPhone(),deleted=readJson(DELETE_KEY,{}),cut=Number(deleted[phone]||0);
      let keep=processDirectReactions(arr,phone);
      if(cut)keep=keep.filter(m=>toSec(m.sent_at)>cut);
      const r=prior.call(this,keep);
      requestAnimationFrame(()=>decorateDirectMessages(keep,phone));
      return r;
    };
    wrapped.__q315=true;window.renderMessages=wrapped;
  }
  if(typeof window.renderConversations==='function'&&!window.renderConversations.__q315){
    const prior=window.renderConversations;
    const wrapped=function(list){
      const deleted=readJson(DELETE_KEY,{}),changed={v:false};
      const clean=(Array.isArray(list)?list:[]).filter(u=>{
        const phone=norm(u.phone||''),cut=Number(deleted[phone]||0);if(!cut)return true;
        if(toSec(u.last_at)>cut){delete deleted[phone];changed.v=true;return true}
        return false;
      }).map(u=>{
        const r=parseReaction(u.last_message);
        return r?{...u,last_message:(r.emoji?`${r.emoji} `:'')+tx('reacted')}:u;
      });
      if(changed.v)writeJson(DELETE_KEY,deleted);
      return prior.call(this,clean);
    };
    wrapped.__q315=true;window.renderConversations=wrapped;
  }
}

/* Group reaction lines + long press. features306 owns network sync. */
function decorateGroupMessages(){
  const screen=document.querySelector('.q306groupScreen'),gid=String(screen?.dataset.groupId||'');if(!gid)return;
  let msgs=[];try{msgs=JSON.parse(localStorage.getItem(GROUP_MSG_PREFIX+gid)||'[]')||[]}catch(_){}
  const byId=new Map(msgs.map(m=>[String(m.id||''),m]));
  screen.querySelectorAll('.q306msg[data-message-id]').forEach(row=>{
    const m=byId.get(String(row.dataset.messageId||'')),bubble=row.querySelector('.q306bubble');if(!m||!bubble)return;
    addReactionLine(bubble,m.reactions||{});
    bindLongReaction(bubble,()=>({text:String(m.text||''),current:()=>String((m.reactions||{})[norm(localStorage.getItem('qevyno_phone')||'')]||''),react:emoji=>{try{window.skaysaReactGroupMessage&&window.skaysaReactGroupMessage(String(m.id||''),emoji)}catch(_){}}}));
  });
}

/* Dynamic auth errors that older i18n layers did not translate. */
const ERROR_MAP={
 'Enter a valid phone number.':{de:'Gib eine gültige Telefonnummer ein.',es:'Introduce un número de teléfono válido.',fr:'Saisis un numéro de téléphone valide.',it:'Inserisci un numero di telefono valido.',pt:'Introduz um número de telefone válido.',nl:'Voer een geldig telefoonnummer in.',pl:'Wpisz prawidłowy numer telefonu.',tr:'Geçerli bir telefon numarası gir.',uk:'Введи правильний номер телефону.',ru:'Введите корректный номер телефона.',ja:'有効な電話番号を入力してください。',ko:'올바른 전화번호를 입력하세요.',zh:'请输入有效的电话号码。',ar:'أدخل رقم هاتف صالحاً.'},
 'Too many checks. Try again later.':{de:'Zu viele Versuche. Versuche es später erneut.',es:'Demasiados intentos. Inténtalo más tarde.',fr:'Trop de tentatives. Réessaie plus tard.',it:'Troppi tentativi. Riprova più tardi.',pt:'Demasiadas tentativas. Tenta mais tarde.',nl:'Te veel pogingen. Probeer het later opnieuw.',pl:'Zbyt wiele prób. Spróbuj później.',tr:'Çok fazla deneme. Daha sonra tekrar dene.',uk:'Забагато спроб. Спробуй пізніше.',ru:'Слишком много попыток. Попробуйте позже.',ja:'試行回数が多すぎます。後でもう一度お試しください。',ko:'시도가 너무 많습니다. 나중에 다시 시도하세요.',zh:'尝试次数过多，请稍后再试。',ar:'محاولات كثيرة جداً. حاول لاحقاً.'},
 'Could not check number. Please try again.':{de:'Nummer konnte nicht geprüft werden. Versuche es erneut.',es:'No se pudo comprobar el número. Inténtalo de nuevo.',fr:'Impossible de vérifier le numéro. Réessaie.',it:'Impossibile verificare il numero. Riprova.',pt:'Não foi possível verificar o número. Tenta novamente.',nl:'Nummer kon niet worden gecontroleerd. Probeer opnieuw.',pl:'Nie udało się sprawdzić numeru. Spróbuj ponownie.',tr:'Numara kontrol edilemedi. Tekrar dene.',uk:'Не вдалося перевірити номер. Спробуй ще раз.',ru:'Не удалось проверить номер. Попробуйте снова.',ja:'番号を確認できませんでした。もう一度お試しください。',ko:'번호를 확인할 수 없습니다. 다시 시도하세요.',zh:'无法检查号码，请重试。',ar:'تعذر التحقق من الرقم. حاول مرة أخرى.'},
 'Name needs 2–32 characters.':{de:'Der Name muss 2–32 Zeichen lang sein.',es:'El nombre debe tener entre 2 y 32 caracteres.',fr:'Le nom doit contenir de 2 à 32 caractères.',it:'Il nome deve contenere 2–32 caratteri.',pt:'O nome deve ter 2–32 caracteres.',nl:'De naam moet 2–32 tekens lang zijn.',pl:'Nazwa musi mieć 2–32 znaki.',tr:'Ad 2–32 karakter olmalı.',uk:'Ім’я має містити 2–32 символи.',ru:'Имя должно содержать 2–32 символа.',ja:'名前は2～32文字にしてください。',ko:'이름은 2~32자여야 합니다.',zh:'名称长度必须为 2–32 个字符。',ar:'يجب أن يتكون الاسم من 2 إلى 32 حرفاً.'},
 'Password needs at least 6 characters.':{de:'Das Passwort braucht mindestens 6 Zeichen.',es:'La contraseña necesita al menos 6 caracteres.',fr:'Le mot de passe doit contenir au moins 6 caractères.',it:'La password deve avere almeno 6 caratteri.',pt:'A palavra-passe precisa de pelo menos 6 caracteres.',nl:'Het wachtwoord moet minstens 6 tekens hebben.',pl:'Hasło musi mieć co najmniej 6 znaków.',tr:'Şifre en az 6 karakter olmalı.',uk:'Пароль має містити щонайменше 6 символів.',ru:'Пароль должен содержать не менее 6 символов.',ja:'パスワードは6文字以上必要です。',ko:'비밀번호는 6자 이상이어야 합니다.',zh:'密码至少需要 6 个字符。',ar:'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'},
 'Wrong password.':{de:'Falsches Passwort.',es:'Contraseña incorrecta.',fr:'Mot de passe incorrect.',it:'Password errata.',pt:'Palavra-passe incorreta.',nl:'Onjuist wachtwoord.',pl:'Nieprawidłowe hasło.',tr:'Yanlış şifre.',uk:'Неправильний пароль.',ru:'Неверный пароль.',ja:'パスワードが違います。',ko:'비밀번호가 올바르지 않습니다.',zh:'密码错误。',ar:'كلمة المرور غير صحيحة.'}
};
function brandifyVisible(root=document){
  try{
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
    while((n=walker.nextNode())){
      const p=n.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT)$/i.test(p.tagName))continue;
      const old=n.nodeValue||'',next=old.replace(/Qevyno|SliqChat/g,'Skaysa');
      if(next!==old)n.nodeValue=next;
    }
    root.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(el=>{
      ['title','aria-label','placeholder'].forEach(a=>{
        const old=el.getAttribute(a);if(!old)return;
        const next=old.replace(/Qevyno|SliqChat/g,'Skaysa');if(next!==old)el.setAttribute(a,next)
      })
    });
  }catch(_){}
}
function translateDynamicErrors(){
  const l=lang();if(l==='en')return;
  document.querySelectorAll('#authScreen .error').forEach(el=>{
    const raw=String(el.textContent||'').trim(),m=ERROR_MAP[raw];if(m&&m[l])el.textContent=m[l];
  });
}
let refreshQueued=false;
function refresh315(){
  if(refreshQueued)return;refreshQueued=true;
  requestAnimationFrame(()=>{
    refreshQueued=false;
    syncGroupCreatorLifecycle();ensureGroupPhoto();applyGroupAvatars();installDirectWrappers();decorateGroupMessages();translateDynamicErrors();brandifyVisible();
  });
}
new MutationObserver(refresh315).observe(document.body,{subtree:true,childList:true});
[0,120,350,700,1300,2200].forEach(ms=>setTimeout(refresh315,ms));
window.addEventListener('focus',refresh315);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh315()});
})();