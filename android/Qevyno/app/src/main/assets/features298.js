(()=>{
  const D=id=>document.getElementById(id);

  const supported=['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'];
  let rawLang='';
  try{rawLang=(navigator.languages&&navigator.languages[0])||navigator.language||'';}catch(e){}
  let lang=String(rawLang||'en').toLowerCase().split(/[-_]/)[0];
  if(lang==='ua')lang='uk';
  if(!supported.includes(lang))lang='en';
  localStorage.setItem('qevyno_ui_lang',lang);
  document.documentElement.lang=lang;

  const languageProbe={en:'+12025550123',de:'+4915112345678',es:'+34600123456',fr:'+33612345678',it:'+393331234567',pt:'+351912345678',nl:'+31612345678',pl:'+48500123456',tr:'+905321234567',uk:'+380501234567',ru:'+79161234567',ja:'+819012345678',ko:'+821012345678',zh:'+8613812345678',ar:'+966501234567'};
  const originalLanguageSetter=window.qevynoSetLanguageForPhone;
  function applyPhoneLanguage(){
    localStorage.setItem('qevyno_ui_lang',lang);
    try{if(typeof originalLanguageSetter==='function')originalLanguageSetter(languageProbe[lang]||languageProbe.en);}catch(e){}
  }
  window.qevynoSetLanguageForPhone=()=>applyPhoneLanguage();

  const words={
    en:{verified:'Verified',verifiedText:'This person is verified.',ok:'OK',phone:'Phone number',normal:'Enter your normal phone number.'},
    de:{verified:'Verifiziert',verifiedText:'Diese Person ist verifiziert.',ok:'OK',phone:'Telefonnummer',normal:'Gib deine normale Telefonnummer ein.'},
    es:{verified:'Verificado',verifiedText:'Esta persona está verificada.',ok:'Aceptar',phone:'Número de teléfono',normal:'Introduce tu número de teléfono normal.'},
    fr:{verified:'Vérifié',verifiedText:'Cette personne est vérifiée.',ok:'OK',phone:'Numéro de téléphone',normal:'Saisis ton numéro de téléphone habituel.'},
    it:{verified:'Verificato',verifiedText:'Questa persona è verificata.',ok:'OK',phone:'Numero di telefono',normal:'Inserisci il tuo normale numero di telefono.'},
    pt:{verified:'Verificado',verifiedText:'Esta pessoa é verificada.',ok:'OK',phone:'Número de telefone',normal:'Introduz o teu número de telefone normal.'},
    nl:{verified:'Geverifieerd',verifiedText:'Deze persoon is geverifieerd.',ok:'OK',phone:'Telefoonnummer',normal:'Voer je normale telefoonnummer in.'},
    pl:{verified:'Zweryfikowany',verifiedText:'Ta osoba jest zweryfikowana.',ok:'OK',phone:'Numer telefonu',normal:'Wpisz swój zwykły numer telefonu.'},
    tr:{verified:'Doğrulandı',verifiedText:'Bu kişi doğrulandı.',ok:'Tamam',phone:'Telefon numarası',normal:'Normal telefon numaranı gir.'},
    uk:{verified:'Підтверджено',verifiedText:'Ця особа підтверджена.',ok:'OK',phone:'Номер телефону',normal:'Введи свій звичайний номер телефону.'},
    ru:{verified:'Подтверждено',verifiedText:'Этот человек подтверждён.',ok:'OK',phone:'Номер телефона',normal:'Введите обычный номер телефона.'},
    ja:{verified:'認証済み',verifiedText:'この人は認証済みです。',ok:'OK',phone:'電話番号',normal:'通常の電話番号を入力してください。'},
    ko:{verified:'인증됨',verifiedText:'이 사용자는 인증되었습니다.',ok:'확인',phone:'전화번호',normal:'일반 전화번호를 입력하세요.'},
    zh:{verified:'已验证',verifiedText:'此用户已通过验证。',ok:'确定',phone:'电话号码',normal:'请输入你的普通电话号码。'},
    ar:{verified:'موثّق',verifiedText:'هذا الشخص موثّق.',ok:'حسنًا',phone:'رقم الهاتف',normal:'أدخل رقم هاتفك العادي.'}
  };
  const t=words[lang]||words.en;

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

  const style=document.createElement('style');
  style.id='qevyno298style';
  style.textContent=`
    #vp .qr{grid-template-columns:1fr 56px!important}#vp .qc{display:none!important}#vp .hint{margin-top:8px!important}
    #homeScreen .q26section{display:none!important}#homeScreen .people.q26people{padding:3px 0 92px!important;background:#fff!important}
    #homeScreen .q26row{min-height:77px!important;padding:10px 15px!important;gap:13px!important;border-radius:0!important;background:#fff!important;overflow:hidden}
    #homeScreen .q26row:after{left:82px!important;right:15px!important;background:#edf2f3!important}#homeScreen .q26row:active{background:#f5fafa!important;transform:scale(.995)!important}
    #homeScreen .q26avatar{width:54px!important;height:54px!important;min-width:54px!important;border-radius:50%!important;font-size:16px!important}
    #homeScreen .q26info{min-width:0!important;align-self:center!important}#homeScreen .q26nameLine{min-width:0!important;gap:5px!important}
    #homeScreen .q26name{font-size:16px!important;font-weight:660!important;line-height:1.2!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    #homeScreen .q26preview{font-size:13.3px!important;line-height:1.25!important;margin-top:4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #homeScreen .q26right{min-width:51px!important;align-self:stretch!important;justify-content:flex-start!important;padding-top:7px!important;gap:7px!important}
    #homeScreen .q26time{font-size:10.8px!important}#homeScreen .q26badge{align-self:flex-end!important;background:#20c6c9!important;color:#fff!important;box-shadow:none!important}
    #homeScreen .q298unread{background:#f8fdfd!important}#homeScreen .q298unread .q26name{font-weight:770!important}#homeScreen .q298unread .q26preview{color:#40545b!important;font-weight:560!important}#homeScreen .q298unread .q26time{color:#159fa3!important;font-weight:680!important}
    #homeScreen .q26searchWrap{padding:5px 14px 13px!important}#homeScreen .q26search{height:46px!important;border-radius:15px!important}#homeScreen .q26empty{margin:90px 28px 0!important}
    .q295verified{cursor:pointer!important;position:relative!important;z-index:3!important;transition:transform 150ms cubic-bezier(.22,1,.36,1)!important}.q295verified:active{transform:scale(.88)!important}
    .q298verifyBack{position:fixed;inset:0;z-index:390;background:rgba(23,33,43,.28);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;visibility:hidden;transition:opacity 180ms ease,visibility 180ms ease}.q298verifyBack.on{opacity:1;pointer-events:auto;visibility:visible}
    .q298verifyCard{width:min(330px,92vw);background:#fff;border:1px solid #e4ebed;border-radius:22px;padding:21px 20px 16px;box-shadow:0 20px 65px rgba(23,33,43,.17);transform:translateY(8px) scale(.97);transition:transform 220ms cubic-bezier(.22,1,.36,1);text-align:left}.q298verifyBack.on .q298verifyCard{transform:none}
    .q298verifyMark{width:34px;height:34px;border-radius:50%;background:#7c3aed;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:900;margin-bottom:13px}.q298verifyTitle{font-size:18px;font-weight:760;color:#17212b}.q298verifyText{font-size:13.5px;line-height:1.48;color:#647780;margin-top:5px}.q298verifyOk{width:100%;height:44px;border-radius:12px;background:#20c6c9;color:#fff;font-weight:700;margin-top:17px}
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
    if(!badge)return;e.preventDefault();e.stopPropagation();verifyBack.classList.add('on');
  },true);
  document.addEventListener('keydown',e=>{
    if((e.key==='Enter'||e.key===' ')&&e.target.classList?.contains('q295verified')){e.preventDefault();verifyBack.classList.add('on')}
    if(e.key==='Escape'&&verifyBack.classList.contains('on'))closeVerify();
  });

  function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
  function localizePhoneUi(){
    const pi=D('pi');if(pi){pi.placeholder=t.phone;pi.setAttribute('autocomplete','tel-national');}
    setText(document.querySelector('#vp .hint'),t.normal);
    const find=D('findPhone');if(find){find.placeholder=t.phone;find.setAttribute('autocomplete','tel-national');}
    setText(document.querySelector('#newChatSheet .q26newChatDesc'),t.normal);
  }
  function keepInputLocal(input){
    if(!input||input.dataset.q298Local==='1')return;input.dataset.q298Local='1';
    input.addEventListener('input',()=>{if(/^\s*(?:\+|00)/.test(input.value||'')){const local=displayPhone(input.value);if(local)input.value=local;}});
  }
  function fixPhoneElement(el){
    if(!el)return;const raw=(el.textContent||'').trim();
    if(/^\+\d[\d\s().-]{6,}$/.test(raw)){const local=displayPhone(raw);if(local&&local!==raw)el.textContent=local;}
  }
  function refreshUi(){
    localizePhoneUi();keepInputLocal(D('pi'));keepInputLocal(D('findPhone'));
    ['accountInfo','infoPhone','q293qrphone','q293fullphone'].forEach(id=>fixPhoneElement(D(id)));
    document.querySelectorAll('.q26profile small,.q26preview,.q26phone,.q26name').forEach(fixPhoneElement);
    document.querySelectorAll('#homeScreen .q26row').forEach(row=>row.classList.toggle('q298unread',!!row.querySelector('.q26badge')));
    document.querySelectorAll('.q295verified').forEach(b=>{b.tabIndex=0;b.setAttribute('role','button');b.setAttribute('aria-label',t.verified)});
    document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||'')&&el.textContent!=='Qevyno 2.9.8 • Android 8+')el.textContent='Qevyno 2.9.8 • Android 8+';});
  }

  applyPhoneLanguage();refreshUi();
  const observer=new MutationObserver(list=>{
    if(!list.some(m=>m.addedNodes&&m.addedNodes.length))return;
    requestAnimationFrame(refreshUi);
  });
  observer.observe(document.body,{subtree:true,childList:true});
  setTimeout(()=>{applyPhoneLanguage();refreshUi();},180);
})();
