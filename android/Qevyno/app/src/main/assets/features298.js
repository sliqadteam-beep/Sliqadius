(()=>{
  const D=id=>document.getElementById(id);

  // Language is based on the phone/WebView language, not the phone number.
  // This runs on every app start while the WebView is still being prepared.
  const supported=['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'];
  function phoneLanguage(){
    let raw='';
    try{raw=(navigator.languages&&navigator.languages[0])||navigator.language||'';}catch(e){}
    let l=String(raw||'en').toLowerCase().split(/[-_]/)[0];
    if(l==='ua')l='uk';
    return supported.includes(l)?l:'en';
  }
  const lang=phoneLanguage();
  localStorage.setItem('qevyno_ui_lang',lang);
  document.documentElement.lang=lang;

  // Reuse Qevyno's existing translations by locking its language selector to
  // a harmless example number for the device language. Phone-number changes
  // can therefore no longer change the app language.
  const languageProbe={en:'+12025550123',de:'+4915112345678',es:'+34600123456',fr:'+33612345678',it:'+393331234567',pt:'+351912345678',nl:'+31612345678',pl:'+48500123456',tr:'+905321234567',uk:'+380501234567',ru:'+79161234567',ja:'+819012345678',ko:'+821012345678',zh:'+8613812345678',ar:'+966501234567'};
  const oldLanguageSetter=window.qevynoSetLanguageForPhone;
  function applyPhoneLanguage(){
    localStorage.setItem('qevyno_ui_lang',lang);
    try{if(typeof oldLanguageSetter==='function')oldLanguageSetter(languageProbe[lang]||languageProbe.en);}catch(e){}
    translate298();
  }
  window.qevynoSetLanguageForPhone=()=>applyPhoneLanguage();

  const V={
    en:{verified:'Verified',verifiedText:'This person is verified.',ok:'OK',phone:'Phone number',normal:'Enter your normal phone number.',search:'Search chats',noChats:'No chats yet',start:'Tap + to start a new chat.',you:'You'},
    de:{verified:'Verifiziert',verifiedText:'Diese Person ist verifiziert.',ok:'OK',phone:'Telefonnummer',normal:'Gib deine normale Telefonnummer ein.',search:'Chats suchen',noChats:'Noch keine Chats',start:'Tippe auf +, um einen neuen Chat zu starten.',you:'Du'},
    es:{verified:'Verificado',verifiedText:'Esta persona está verificada.',ok:'Aceptar',phone:'Número de teléfono',normal:'Introduce tu número de teléfono normal.',search:'Buscar chats',noChats:'Aún no hay chats',start:'Pulsa + para iniciar un chat.',you:'Tú'},
    fr:{verified:'Vérifié',verifiedText:'Cette personne est vérifiée.',ok:'OK',phone:'Numéro de téléphone',normal:'Saisis ton numéro de téléphone habituel.',search:'Rechercher',noChats:'Aucune discussion',start:'Appuie sur + pour démarrer une discussion.',you:'Vous'},
    it:{verified:'Verificato',verifiedText:'Questa persona è verificata.',ok:'OK',phone:'Numero di telefono',normal:'Inserisci il tuo normale numero di telefono.',search:'Cerca chat',noChats:'Nessuna chat',start:'Tocca + per avviare una chat.',you:'Tu'},
    pt:{verified:'Verificado',verifiedText:'Esta pessoa é verificada.',ok:'OK',phone:'Número de telefone',normal:'Introduz o teu número de telefone normal.',search:'Pesquisar conversas',noChats:'Ainda não há conversas',start:'Toca em + para iniciar uma conversa.',you:'Tu'},
    nl:{verified:'Geverifieerd',verifiedText:'Deze persoon is geverifieerd.',ok:'OK',phone:'Telefoonnummer',normal:'Voer je normale telefoonnummer in.',search:'Chats zoeken',noChats:'Nog geen chats',start:'Tik op + om een chat te starten.',you:'Jij'},
    pl:{verified:'Zweryfikowany',verifiedText:'Ta osoba jest zweryfikowana.',ok:'OK',phone:'Numer telefonu',normal:'Wpisz swój zwykły numer telefonu.',search:'Szukaj czatów',noChats:'Brak czatów',start:'Dotknij +, aby rozpocząć czat.',you:'Ty'},
    tr:{verified:'Doğrulandı',verifiedText:'Bu kişi doğrulandı.',ok:'Tamam',phone:'Telefon numarası',normal:'Normal telefon numaranı gir.',search:'Sohbet ara',noChats:'Henüz sohbet yok',start:'+ ile yeni bir sohbet başlat.',you:'Sen'},
    uk:{verified:'Підтверджено',verifiedText:'Ця особа підтверджена.',ok:'OK',phone:'Номер телефону',normal:'Введи свій звичайний номер телефону.',search:'Пошук чатів',noChats:'Чатів ще немає',start:'Натисни +, щоб почати чат.',you:'Ви'},
    ru:{verified:'Подтверждено',verifiedText:'Этот человек подтверждён.',ok:'OK',phone:'Номер телефона',normal:'Введите обычный номер телефона.',search:'Поиск чатов',noChats:'Чатов пока нет',start:'Нажмите +, чтобы начать чат.',you:'Вы'},
    ja:{verified:'認証済み',verifiedText:'この人は認証済みです。',ok:'OK',phone:'電話番号',normal:'通常の電話番号を入力してください。',search:'チャットを検索',noChats:'チャットはまだありません',start:'＋をタップしてチャットを開始します。',you:'あなた'},
    ko:{verified:'인증됨',verifiedText:'이 사용자는 인증되었습니다.',ok:'확인',phone:'전화번호',normal:'일반 전화번호를 입력하세요.',search:'채팅 검색',noChats:'아직 채팅이 없습니다',start:'+를 눌러 채팅을 시작하세요.',you:'나'},
    zh:{verified:'已验证',verifiedText:'此用户已通过验证。',ok:'确定',phone:'电话号码',normal:'请输入你的普通电话号码。',search:'搜索聊天',noChats:'暂无聊天',start:'点击 + 开始聊天。',you:'你'},
    ar:{verified:'موثّق',verifiedText:'هذا الشخص موثّق.',ok:'حسنًا',phone:'رقم الهاتف',normal:'أدخل رقم هاتفك العادي.',search:'بحث في الدردشات',noChats:'لا توجد دردشات بعد',start:'اضغط + لبدء دردشة جديدة.',you:'أنت'}
  };
  const t=V[lang]||V.en;

  // User-facing phone numbers never show an international country prefix.
  const prefixes=[
    ['+971',false],['+966',false],['+420',false],['+421',false],['+387',true],['+385',true],['+380',true],['+372',false],['+371',false],['+370',false],['+359',true],['+353',true],['+351',false],['+386',true],['+381',true],
    ['+49',true],['+43',true],['+41',true],['+44',true],['+33',true],['+34',false],['+39',false],['+31',true],['+32',true],['+48',false],['+45',false],['+46',true],['+47',false],['+358',true],['+90',true],['+61',true],['+64',true],['+55',true],['+52',false],['+91',true],['+81',true],['+82',true],['+86',false],['+27',true],['+40',true],['+30',false],['+36',true],['+20',true],['+7',false],['+1',false]
  ].sort((a,b)=>b[0].length-a[0].length);
  function displayPhone(value){
    let p=String(value||'').trim().replace(/[\s().-]/g,'');
    if(p.startsWith('00'))p='+'+p.slice(2);
    if(!p.startsWith('+'))return p.replace(/\D/g,'');
    const hit=prefixes.find(x=>p.startsWith(x[0]));
    if(!hit)return p.replace(/^\+/,'');
    let rest=p.slice(hit[0].length).replace(/\D/g,'');
    if(hit[1]&&rest&&!rest.startsWith('0'))rest='0'+rest;
    return rest;
  }
  window.qevynoDisplayPhone=displayPhone;

  // Hide country-code controls. Internally Qevyno still resolves the country
  // from the device/region so existing accounts and routing remain unambiguous.
  const style=document.createElement('style');
  style.id='qevyno298style';
  style.textContent=`
    #vp .qr{grid-template-columns:1fr 56px!important}#vp .qc{display:none!important}#vp .hint{margin-top:8px!important}
    #homeScreen .q26section{display:none!important}
    #homeScreen .people.q26people{padding-top:3px!important}
    #homeScreen .q26row{min-height:76px!important;padding:10px 15px!important;gap:13px!important;border-radius:0!important;overflow:hidden}
    #homeScreen .q26row:after{left:82px!important;right:15px!important;background:#edf2f3!important}
    #homeScreen .q26avatar{width:54px!important;height:54px!important;min-width:54px!important;font-size:16px!important}
    #homeScreen .q26info{align-self:center!important}.q26nameLine{min-width:0!important}.q26name{font-size:16px!important;font-weight:660!important;letter-spacing:-.1px!important}
    #homeScreen .q26preview{font-size:13.3px!important;margin-top:4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #homeScreen .q26right{min-width:51px!important;justify-content:flex-start!important;padding-top:7px!important;gap:7px!important}.q26time{font-size:10.8px!important}
    #homeScreen .q298unread{background:#f8fdfd!important}#homeScreen .q298unread .q26name{font-weight:760!important}#homeScreen .q298unread .q26preview{color:#40545b!important;font-weight:560!important}#homeScreen .q298unread .q26time{color:#159fa3!important;font-weight:680!important}
    #homeScreen .q26badge{background:#20c6c9!important;box-shadow:none!important}
    #homeScreen .q26searchWrap{padding-bottom:13px!important}#homeScreen .q26search{height:46px!important;border-radius:15px!important}
    #homeScreen .q26empty{margin:90px 28px 0!important}
    .q295verified{cursor:pointer!important;position:relative!important;z-index:3!important;transition:transform 150ms cubic-bezier(.22,1,.36,1),box-shadow 150ms ease!important}.q295verified:active{transform:scale(.88)!important}
    .q298verifyBack{position:fixed;inset:0;z-index:390;background:rgba(23,33,43,.28);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;visibility:hidden;transition:opacity 180ms ease,visibility 180ms ease}.q298verifyBack.on{opacity:1;pointer-events:auto;visibility:visible}
    .q298verifyCard{width:min(330px,92vw);background:#fff;border:1px solid #e4ebed;border-radius:22px;padding:21px 20px 16px;box-shadow:0 20px 65px rgba(23,33,43,.17);transform:translateY(8px) scale(.97);transition:transform 220ms cubic-bezier(.22,1,.36,1);text-align:left}.q298verifyBack.on .q298verifyCard{transform:none}
    .q298verifyMark{width:34px;height:34px;border-radius:50%;background:#7c3aed;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:900;margin-bottom:13px}.q298verifyTitle{font-size:18px;font-weight:760;color:#17212b}.q298verifyText{font-size:13.5px;line-height:1.48;color:#647780;margin-top:5px}.q298verifyOk{width:100%;height:44px;border-radius:12px;background:#20c6c9;color:#fff;font-weight:700;margin-top:17px}
    @media(max-width:380px){#homeScreen .q26row{padding-left:12px!important;padding-right:12px!important}#homeScreen .q26row:after{right:12px!important}}
  `;
  document.head.appendChild(style);

  const verifyBack=document.createElement('div');
  verifyBack.className='q298verifyBack';
  verifyBack.innerHTML=`<div class="q298verifyCard" role="dialog" aria-modal="true"><div class="q298verifyMark">✓</div><div class="q298verifyTitle">${t.verified}</div><div class="q298verifyText">${t.verifiedText}</div><button class="q298verifyOk">${t.ok}</button></div>`;
  document.body.appendChild(verifyBack);
  const closeVerify=()=>verifyBack.classList.remove('on');
  verifyBack.querySelector('.q298verifyOk').onclick=closeVerify;
  verifyBack.onclick=e=>{if(e.target===verifyBack)closeVerify()};

  document.addEventListener('click',e=>{
    const badge=e.target.closest&&e.target.closest('.q295verified');
    if(!badge)return;
    e.preventDefault();e.stopPropagation();
    verifyBack.classList.add('on');
  },true);
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target.classList?.contains('q295verified')){e.preventDefault();verifyBack.classList.add('on')}
    if(e.key==='Escape'&&verifyBack.classList.contains('on'))closeVerify();
  });

  function localizePhoneInputs(){
    const pi=D('pi');
    if(pi){pi.placeholder=t.phone;pi.setAttribute('autocomplete','tel-national');}
    const hint=document.querySelector('#vp .hint');if(hint)hint.textContent=t.normal;
    const find=D('findPhone');if(find){find.placeholder=t.phone;find.setAttribute('autocomplete','tel-national');}
    const desc=document.querySelector('#newChatSheet .q26newChatDesc');if(desc)desc.textContent=t.normal;
    const search=D('chatSearch');if(search)search.placeholder=t.search;
  }

  function keepInputLocal(input){
    if(!input||input.dataset.q298Local==='1')return;
    input.dataset.q298Local='1';
    input.addEventListener('input',()=>{
      const v=input.value;
      if(/^\s*(?:\+|00)/.test(v)){
        const d=displayPhone(v);if(d)input.value=d;
      }
    });
  }

  function fixVisiblePhones(root=document){
    const ids=['accountInfo','infoPhone','q293qrphone','q293fullphone'];
    ids.forEach(id=>{
      const el=D(id);if(!el)return;const raw=(el.textContent||'').trim();
      if(/^\+\d[\d\s().-]{6,}$/.test(raw)){const v=displayPhone(raw);if(v&&v!==raw)el.textContent=v;}
    });
    root.querySelectorAll?.('.q26profile small,.q26preview,.q26phone,.q26name').forEach(el=>{
      const raw=(el.textContent||'').trim();
      if(/^\+\d[\d\s().-]{6,}$/.test(raw)){const v=displayPhone(raw);if(v&&v!==raw)el.textContent=v;}
    });
  }

  function improveOverview(){
    const headline=document.querySelector('#homeScreen .q26headline');if(headline)headline.textContent=(lang==='de'?'Chats':(t.search.includes('聊天')?'聊天':'Chats'));
    document.querySelectorAll('#homeScreen .q26row').forEach(row=>{
      row.classList.toggle('q298unread',!!row.querySelector('.q26badge'));
      const badge=row.querySelector('.q295verified');if(badge){badge.tabIndex=0;badge.setAttribute('role','button');badge.setAttribute('aria-label',t.verified);}
    });
    const empty=document.querySelector('#homeScreen .q26empty');
    if(empty){const b=empty.querySelector('b'),p=empty.querySelector('p');if(b&&!D('chatSearch')?.value)b.textContent=t.noChats;if(p&&!D('chatSearch')?.value)p.textContent=t.start;}
    fixVisiblePhones(document);
  }

  function translate298(){
    localizePhoneInputs();
    improveOverview();
    document.querySelectorAll('.q295verified').forEach(b=>{b.tabIndex=0;b.setAttribute('role','button');b.setAttribute('aria-label',t.verified)});
    document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.8 • Android 8+';});
  }

  keepInputLocal(D('pi'));keepInputLocal(D('findPhone'));
  applyPhoneLanguage();

  const observer=new MutationObserver(list=>{
    let changed=false;
    for(const m of list){if(m.addedNodes.length||m.type==='characterData'){changed=true;break}}
    if(changed)requestAnimationFrame(()=>{localizePhoneInputs();keepInputLocal(D('pi'));keepInputLocal(D('findPhone'));improveOverview();});
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});

  setTimeout(()=>{applyPhoneLanguage();translate298();},180);
})();
