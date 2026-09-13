(()=>{
'use strict';
const VERSION='2.9.31';

function lang(){
  try{
    let l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0];
    if(l==='ua')l='uk';
    return ['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'].includes(l)?l:'en';
  }catch(_){return'en'}
}
const LATE={
 en:{search:'Search chats, numbers and groups',none:'No results',noneSub:'Try another name, number or message.',chats:'Chats',verified:'Verified',verifiedText:'This account was verified by Skaysa.',contacts:'Already added contacts',emptyContacts:'No contacts yet. First add someone with + → New contact.',add:'Add',added:'Added',adding:'Adding…',loading:'Loading Skaysa…'},
 de:{search:'Chats, Nummern und Gruppen suchen',none:'Keine Treffer',noneSub:'Versuche einen anderen Namen, eine Nummer oder eine Nachricht.',chats:'Chats',verified:'Verifiziert',verifiedText:'Dieser Account wurde von Skaysa bestätigt.',contacts:'Bereits hinzugefügte Kontakte',emptyContacts:'Noch keine Kontakte. Füge zuerst über + → Neuer Kontakt jemanden hinzu.',add:'Hinzufügen',added:'Hinzugefügt',adding:'Wird hinzugefügt…',loading:'Skaysa wird geladen…'},
 es:{search:'Buscar chats, números y grupos',none:'Sin resultados',noneSub:'Prueba otro nombre, número o mensaje.',chats:'Chats',verified:'Verificado',verifiedText:'Esta cuenta ha sido verificada por Skaysa.',contacts:'Contactos ya añadidos',emptyContacts:'Aún no hay contactos. Añade primero a alguien con + → Nuevo contacto.',add:'Añadir',added:'Añadido',adding:'Añadiendo…',loading:'Cargando Skaysa…'},
 fr:{search:'Rechercher chats, numéros et groupes',none:'Aucun résultat',noneSub:'Essaie un autre nom, numéro ou message.',chats:'Discussions',verified:'Vérifié',verifiedText:'Ce compte a été vérifié par Skaysa.',contacts:'Contacts déjà ajoutés',emptyContacts:'Aucun contact. Ajoute d’abord quelqu’un avec + → Nouveau contact.',add:'Ajouter',added:'Ajouté',adding:'Ajout…',loading:'Chargement de Skaysa…'},
 it:{search:'Cerca chat, numeri e gruppi',none:'Nessun risultato',noneSub:'Prova un altro nome, numero o messaggio.',chats:'Chat',verified:'Verificato',verifiedText:'Questo account è stato verificato da Skaysa.',contacts:'Contatti già aggiunti',emptyContacts:'Nessun contatto. Aggiungi prima qualcuno con + → Nuovo contatto.',add:'Aggiungi',added:'Aggiunto',adding:'Aggiunta…',loading:'Caricamento di Skaysa…'},
 pt:{search:'Pesquisar chats, números e grupos',none:'Sem resultados',noneSub:'Tenta outro nome, número ou mensagem.',chats:'Conversas',verified:'Verificado',verifiedText:'Esta conta foi verificada pela Skaysa.',contacts:'Contactos já adicionados',emptyContacts:'Ainda não há contactos. Adiciona primeiro alguém em + → Novo contacto.',add:'Adicionar',added:'Adicionado',adding:'A adicionar…',loading:'A carregar Skaysa…'},
 nl:{search:'Zoek chats, nummers en groepen',none:'Geen resultaten',noneSub:'Probeer een andere naam, nummer of bericht.',chats:'Chats',verified:'Geverifieerd',verifiedText:'Dit account is door Skaysa geverifieerd.',contacts:'Al toegevoegde contacten',emptyContacts:'Nog geen contacten. Voeg eerst iemand toe via + → Nieuw contact.',add:'Toevoegen',added:'Toegevoegd',adding:'Toevoegen…',loading:'Skaysa wordt geladen…'},
 pl:{search:'Szukaj czatów, numerów i grup',none:'Brak wyników',noneSub:'Spróbuj innej nazwy, numeru lub wiadomości.',chats:'Czaty',verified:'Zweryfikowano',verifiedText:'To konto zostało zweryfikowane przez Skaysa.',contacts:'Dodane kontakty',emptyContacts:'Brak kontaktów. Najpierw dodaj kogoś przez + → Nowy kontakt.',add:'Dodaj',added:'Dodano',adding:'Dodawanie…',loading:'Ładowanie Skaysa…'},
 tr:{search:'Sohbet, numara ve grup ara',none:'Sonuç yok',noneSub:'Başka bir ad, numara veya mesaj dene.',chats:'Sohbetler',verified:'Doğrulandı',verifiedText:'Bu hesap Skaysa tarafından doğrulandı.',contacts:'Eklenmiş kişiler',emptyContacts:'Henüz kişi yok. Önce + → Yeni kişi ile birini ekle.',add:'Ekle',added:'Eklendi',adding:'Ekleniyor…',loading:'Skaysa yükleniyor…'},
 uk:{search:'Пошук чатів, номерів і груп',none:'Нічого не знайдено',noneSub:'Спробуй інше ім’я, номер або повідомлення.',chats:'Чати',verified:'Підтверджено',verifiedText:'Цей обліковий запис підтверджено Skaysa.',contacts:'Вже додані контакти',emptyContacts:'Контактів ще немає. Спочатку додай когось через + → Новий контакт.',add:'Додати',added:'Додано',adding:'Додається…',loading:'Skaysa завантажується…'},
 ru:{search:'Поиск чатов, номеров и групп',none:'Ничего не найдено',noneSub:'Попробуйте другое имя, номер или сообщение.',chats:'Чаты',verified:'Подтверждено',verifiedText:'Этот аккаунт подтверждён Skaysa.',contacts:'Уже добавленные контакты',emptyContacts:'Контактов пока нет. Сначала добавьте кого-нибудь через + → Новый контакт.',add:'Добавить',added:'Добавлено',adding:'Добавление…',loading:'Загрузка Skaysa…'},
 ja:{search:'チャット・番号・グループを検索',none:'結果がありません',noneSub:'別の名前、番号、メッセージを試してください。',chats:'チャット',verified:'認証済み',verifiedText:'このアカウントはSkaysaによって認証されています。',contacts:'追加済みの連絡先',emptyContacts:'連絡先がありません。まず + → 新しい連絡先 から追加してください。',add:'追加',added:'追加済み',adding:'追加中…',loading:'Skaysaを読み込み中…'},
 ko:{search:'채팅, 번호 및 그룹 검색',none:'검색 결과 없음',noneSub:'다른 이름, 번호 또는 메시지를 사용해 보세요.',chats:'채팅',verified:'인증됨',verifiedText:'이 계정은 Skaysa에서 인증되었습니다.',contacts:'이미 추가된 연락처',emptyContacts:'아직 연락처가 없습니다. 먼저 + → 새 연락처에서 추가하세요.',add:'추가',added:'추가됨',adding:'추가 중…',loading:'Skaysa 불러오는 중…'},
 zh:{search:'搜索聊天、号码和群组',none:'没有结果',noneSub:'请尝试其他姓名、号码或消息。',chats:'聊天',verified:'已验证',verifiedText:'此账号已由 Skaysa 验证。',contacts:'已添加的联系人',emptyContacts:'还没有联系人。请先通过 + → 新联系人 添加。',add:'添加',added:'已添加',adding:'正在添加…',loading:'正在加载 Skaysa…'},
 ar:{search:'البحث في الدردشات والأرقام والمجموعات',none:'لا توجد نتائج',noneSub:'جرّب اسماً أو رقماً أو رسالة أخرى.',chats:'الدردشات',verified:'تم التحقق',verifiedText:'تم التحقق من هذا الحساب بواسطة Skaysa.',contacts:'جهات الاتصال المضافة',emptyContacts:'لا توجد جهات اتصال بعد. أضف شخصاً أولاً عبر + ← جهة اتصال جديدة.',add:'إضافة',added:'تمت الإضافة',adding:'جارٍ الإضافة…',loading:'جارٍ تحميل Skaysa…'}
};
function lt(k){const d=LATE[lang()]||LATE.en;return d[k]||LATE.en[k]||k}
function searchPlaceholder(){return lt('search')}

function ensureStyle(){
  if(document.getElementById('q313style')) return;
  const s=document.createElement('style');
  s.id='q313style';
  s.textContent=`
html,body{overflow-x:hidden!important;background:#fff!important}
body,#app,#root,#homeScreen,.screen,.page,.page-wrap,.app-shell{max-width:none!important;width:100%!important;margin:0!important;min-width:0!important}
#homeScreen,.homeScreen,.chats-page{padding-left:0!important;padding-right:0!important}
#homeScreen .topbar,.topbar{padding:10px 16px 0!important}
#homeScreen .topbar .brand,.topbar .brand,.topbar .logo,.app-brand,.appLogo,.appWordmark{display:none!important}
#homeScreen .q26hero{padding:8px 18px 10px!important}
#homeScreen .q26headline{font-size:38px!important;line-height:1.02!important;letter-spacing:-1.7px!important;margin:0!important}

/* Search behavior belongs ONLY to features312. This layer is visual-only. */
#homeScreen .q26searchWrap{padding:6px 16px 14px!important;gap:10px!important}
#homeScreen .q26search{height:58px!important;border-radius:22px!important;background:#f7fafc!important;border:1px solid #dbe6ee!important;box-shadow:none!important;padding:0 15px!important;display:flex!important;align-items:center!important;overflow:hidden!important}
#homeScreen .q26search:focus-within{background:#fff!important;border-color:#8ABFF4!important;box-shadow:0 0 0 4px rgba(138,191,244,.16)!important}
#homeScreen .q26search>span:first-child{width:25px!important;height:25px!important;min-width:25px!important;margin-right:11px!important;display:grid!important;place-items:center!important;color:#718797!important}
#homeScreen .q26search>span:first-child svg{width:21px!important;height:21px!important}
#homeScreen #chatSearch{height:100%!important;min-height:0!important;width:100%!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;outline:none!important;font-size:16px!important;line-height:1.2!important;color:#17212b!important;appearance:none!important;-webkit-appearance:none!important}
#homeScreen #chatSearch::placeholder{color:#95a4ae!important;opacity:1!important}
#homeScreen .q312clear{flex:0 0 34px!important}
.q313searchIcon,.q313clear,.q313emptyState{display:none!important}
.q313hidden{display:revert!important}
#homeScreen .q26new{width:58px!important;height:58px!important;border-radius:21px!important;box-shadow:0 10px 24px rgba(83,137,193,.16)!important}

.q308profileChip,.q308profileCard,.q308miniProfile,.profileChip{border:1px solid #e3ebf1!important;border-radius:22px!important;box-shadow:0 6px 18px rgba(18,33,53,.045)!important;background:#fbfdff!important}
.q308profileChip{padding:8px 10px!important}
#people{width:100%!important;max-width:none!important;padding:4px 16px 120px!important;box-sizing:border-box!important;overflow-anchor:none!important}
#people>.q299helpRow,#people>.q306groupRow,#people>.q26row,#people>.q304row,#people>.q308chatRow,#people>.chatRow,#people>.conversation{margin:0 0 10px!important;border:1px solid #e5edf3!important;border-radius:22px!important;background:#fff!important;box-shadow:0 5px 17px rgba(18,33,53,.035)!important;transform:none!important}
#people>.q299helpRow:active,#people>.q306groupRow:active,#people>.q26row:active{background:#f5f9fc!important;transform:none!important}
.fab,.qfab,#fab,.composeFab,.newChatFab{box-shadow:0 14px 28px rgba(67,152,228,.24)!important;border-radius:27px!important}
button,input,textarea,select{-webkit-tap-highlight-color:transparent}
@media(max-width:380px){#homeScreen .q26headline{font-size:34px!important}#homeScreen .q26searchWrap{padding-left:12px!important;padding-right:12px!important}}
`;
  document.head.appendChild(s);
}

let observedInput=null;
let placeholderObserver=null;
function stabilizeSearch(){
  const input=document.getElementById('chatSearch');
  if(!input) return;
  const desired=searchPlaceholder();
  if(input.placeholder!==desired) input.placeholder=desired;

  document.querySelectorAll('.q313searchIcon,.q313clear,.q313emptyState').forEach(el=>el.remove());
  document.querySelectorAll('.q313hidden').forEach(el=>el.classList.remove('q313hidden'));

  if(observedInput===input) return;
  observedInput=input;
  try{placeholderObserver?.disconnect()}catch(_){}
  placeholderObserver=new MutationObserver(()=>{
    const wanted=searchPlaceholder();
    if(input.placeholder!==wanted) input.placeholder=wanted;
  });
  placeholderObserver.observe(input,{attributes:true,attributeFilter:['placeholder']});
  input.addEventListener('focus',()=>{const wanted=searchPlaceholder();if(input.placeholder!==wanted)input.placeholder=wanted},true);
  input.addEventListener('blur',()=>{const wanted=searchPlaceholder();if(input.placeholder!==wanted)input.placeholder=wanted},true);
}


const ADD_WORDS=new Set(['Add','Hinzufügen','Añadir','Ajouter','Aggiungi','Adicionar','Toevoegen','Dodaj','Ekle']);
const ADDED_WORDS=new Set(['Added','Hinzugefügt','Añadido','Ajouté','Aggiunto','Adicionado','Toegevoegd','Dodano','Eklendi']);
const ADDING_WORDS=new Set(['Adding…','Wird hinzugefügt…','Añadiendo…','Ajout…','Aggiunta…','A adicionar…','Toevoegen…','Dodawanie…','Ekleniyor…']);

function translateLateUi(){
  try{
    document.documentElement.lang=lang();
    const title=document.querySelector('.q311verifyTitle');
    if(title)title.textContent=lt('verified');
    const vtext=document.querySelector('.q311verifyText');
    if(vtext)vtext.textContent=lt('verifiedText');

    document.querySelectorAll('.q295verified,.q308verified,.q309verified,.q311verified').forEach(b=>{
      b.setAttribute('aria-label',lt('verified')); b.setAttribute('title',lt('verified'));
    });

    const creator=document.querySelector('.q311creatorSheet');
    if(creator){
      const label=creator.querySelector('.q306field .q306label');
      if(label)label.textContent=lt('contacts');
      const empty=creator.querySelector('.q311empty');
      if(empty)empty.textContent=lt('emptyContacts');
      creator.querySelectorAll('.q311add').forEach(btn=>{
        const cur=String(btn.textContent||'').trim();
        if(ADDING_WORDS.has(cur))btn.textContent=lt('adding');
        else if(ADDED_WORDS.has(cur))btn.textContent=lt('added');
        else if(ADD_WORDS.has(cur))btn.textContent=lt('add');
      });
    }

    const se=document.querySelector('.q312searchEmpty');
    if(se){
      const b=se.querySelector('b'),sp=se.querySelector('span');
      if(b)b.textContent=lt('none');
      if(sp)sp.textContent=lt('noneSub');
    }
    const h=document.querySelector('#homeScreen .q26headline');
    if(h)h.textContent=lt('chats');

    // Replace legacy product name in visible text without touching phone numbers or user messages.
    document.querySelectorAll('.brand,.logo,.q27logo,.small,#sheetBack h2,#sheetBack p,.q308qrHint,.q308edit,.q308settings,.q299helpRow .q26preview').forEach(el=>{
      if(el.childElementCount===0 && el.textContent)el.textContent=el.textContent.replace(/\bQevyno\b/g,'Skaysa').replace(/\bSliqChat\b/g,'Skaysa');
    });
  }catch(_){}
}

function ready(){
  ensureStyle();
  stabilizeSearch();
  translateLateUi();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    setTimeout(()=>{
      stabilizeSearch();
      translateLateUi();
      window.__skaysaReady=true;
      try{window.skaysaHideBoot&&window.skaysaHideBoot()}catch(_){}
      try{window.dispatchEvent(new Event('skaysa-ready'))}catch(_){}
    },120);
  }));
}

let q313RefreshQueued=false;
let q313Watching=false;
function q313Observe(){
  try{
    mo.disconnect();
    mo.observe(document.documentElement,{subtree:true,childList:true});
    q313Watching=true;
  }catch(_){}
}
function q313Refresh(){
  if(q313RefreshQueued)return;
  q313RefreshQueued=true;
  requestAnimationFrame(()=>{
    q313RefreshQueued=false;
    try{mo.disconnect()}catch(_){}
    q313Watching=false;
    try{
      ensureStyle();
      stabilizeSearch();
      translateLateUi();
    }catch(_){}
    q313Observe();
  });
}
const mo=new MutationObserver(q313Refresh);
q313Observe();
[0,80,220,500,1000,1800].forEach(ms=>setTimeout(ready,ms));
window.addEventListener('focus',ready);
window.addEventListener('pageshow',ready);
})();