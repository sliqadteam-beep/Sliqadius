(()=>{
  const D=id=>document.getElementById(id);
  const DIALS={US:'+1',CA:'+1',DE:'+49',AT:'+43',CH:'+41',GB:'+44',FR:'+33',ES:'+34',IT:'+39',NL:'+31',BE:'+32',PL:'+48',PT:'+351',TR:'+90',UA:'+380',CZ:'+420',SK:'+421',DK:'+45',SE:'+46',NO:'+47',FI:'+358',IE:'+353',AU:'+61',NZ:'+64',BR:'+55',MX:'+52',IN:'+91',JP:'+81',KR:'+82',CN:'+86',AE:'+971',SA:'+966',ZA:'+27',RO:'+40',BG:'+359',HR:'+385',SI:'+386',RS:'+381',BA:'+387',GR:'+30',HU:'+36',EE:'+372',LV:'+371',LT:'+370',LU:'+352',EG:'+20',RU:'+7'};
  const iso=()=>localStorage.getItem('qevyno_country')||'US';
  const dial=()=>DIALS[iso()]||'+1';
  const localNumber=full=>{
    let p=String(full||'').trim().replace(/[\s().-]/g,'');
    if(p.startsWith('00'))p='+'+p.slice(2);
    const d=dial();
    if(p.startsWith(d))p=p.slice(d.length);
    else if(p.startsWith('+')){
      const codes=[...new Set(Object.values(DIALS))].sort((a,b)=>b.length-a.length);
      const hit=codes.find(x=>p.startsWith(x));
      p=hit?p.slice(hit.length):p.slice(1);
    }
    return p.replace(/^0+/,'');
  };
  const fullNumber=raw=>{
    let p=String(raw||'').trim();
    if(p.startsWith('+')||p.startsWith('00'))return typeof normalizePhone==='function'?normalizePhone(p):p.replace(/^00/,'+').replace(/[\s().-]/g,'');
    p=p.replace(/\D/g,'').replace(/^0+/,'');
    return p?dial()+p:'';
  };
  window.qevynoLocalPhone=localNumber;
  window.qevynoFullPhone=fullNumber;

  const style=document.createElement('style');
  style.id='qevyno297style';
  style.textContent=`
    #homeScreen{background:#fff!important}
    #homeScreen .topbar{position:relative!important;z-index:20!important;padding:calc(10px + env(safe-area-inset-top)) 15px 7px!important;border-bottom:0!important}
    #homeScreen .brand{font-size:22px!important;font-weight:760!important;letter-spacing:-.55px!important}
    #homeScreen .q26hero{padding:5px 16px 9px!important;background:#fff!important}
    #homeScreen .q26headline{font-size:30px!important;font-weight:760!important;letter-spacing:-1px!important}
    #homeScreen .q26searchWrap{padding:5px 14px 11px!important;background:#fff!important}
    #homeScreen .q26search{height:44px!important;border:0!important;background:#f0f4f5!important;box-shadow:none!important;border-radius:13px!important}
    #homeScreen .q26search:focus-within{background:#edf3f4!important;box-shadow:0 0 0 2px rgba(32,198,201,.12)!important}
    #homeScreen .people.q26people{padding:0 0 92px!important;background:#fff!important}
    #homeScreen .q26section{height:32px!important;padding:10px 16px 5px!important;background:#fff!important;color:#7b8a91!important;font-size:11.5px!important;font-weight:650!important}
    #homeScreen .q26row{min-height:72px!important;padding:10px 14px!important;background:#fff!important;gap:12px!important}
    #homeScreen .q26row:after{left:76px!important;right:14px!important;background:#edf1f2!important}
    #homeScreen .q26row:active{background:#f5f9f9!important;transform:scale(.994)!important}
    #homeScreen .q26avatar{width:51px!important;height:51px!important;min-width:51px!important;border-radius:50%!important;background:#dff3f3!important;color:#147e82!important;font-weight:720!important}
    #homeScreen .q26nameLine{gap:5px!important;align-items:center!important}
    #homeScreen .q26name{font-size:15.7px!important;font-weight:650!important;line-height:1.2!important}
    #homeScreen .q26preview{margin-top:4px!important;font-size:13.2px!important;line-height:1.25!important;max-width:100%!important}
    #homeScreen .q26right{align-self:stretch!important;justify-content:center!important;gap:6px!important;min-width:48px!important}
    #homeScreen .q26time{font-size:10.8px!important}
    #homeScreen .q26badge{align-self:flex-end!important;min-width:20px!important;height:20px!important;padding:0 6px!important}
    #homeScreen .q26new{right:18px!important;bottom:calc(18px + env(safe-area-inset-bottom))!important;width:56px!important;height:56px!important;border-radius:18px!important;box-shadow:0 9px 24px rgba(32,198,201,.26)!important}
    #homeScreen .q26empty{margin-top:80px!important}
    #homeScreen .q26empty b{font-size:18px!important;font-weight:670!important}
    #homeScreen .q26empty p{max-width:270px!important;margin:7px auto 0!important;line-height:1.45!important}
    .q297localPhone{font-variant-numeric:tabular-nums}
    #newChatSheet #findPhone{letter-spacing:.1px}
    @media(max-width:380px){#homeScreen .q26headline{font-size:28px!important}#homeScreen .q26row{padding-left:12px!important;padding-right:12px!important}}
  `;
  document.head.appendChild(style);

  function replaceExactPhone(el){
    if(!el)return;
    const raw=(el.textContent||'').trim();
    if(/^\+\d[\d\s().-]{6,}$/.test(raw)){
      const next=localNumber(raw);
      if(next&&next!==raw)el.textContent=next;
      el.classList.add('q297localPhone');
    }
  }

  function fixVisiblePhones(root=document){
    ['accountInfo','infoPhone','q293qrphone','q293fullphone'].forEach(id=>replaceExactPhone(D(id)));
    root.querySelectorAll?.('.q26profile small,.q26preview,.q26phone').forEach(replaceExactPhone);
  }

  function fixOverview(){
    const headline=document.querySelector('#homeScreen .q26headline');
    if(headline&&headline.textContent!=='Chats')headline.textContent='Chats';
    const search=D('chatSearch');if(search&&search.placeholder!=='Search chats')search.placeholder='Search chats';
    document.querySelectorAll('#homeScreen .q26section span:first-child').forEach(x=>{
      if(/Recent chats/i.test(x.textContent||''))x.textContent='Chats';
    });
    const empty=document.querySelector('#homeScreen .q26empty p');
    if(empty&&/Tap \+/i.test(empty.textContent||'')&&empty.textContent!=='Tap + to start a new chat.')empty.textContent='Tap + to start a new chat.';
    fixVisiblePhones(document);
  }

  function patchNewChat(){
    const input=D('findPhone'),btn=D('findBtn');
    if(input){
      if(input.placeholder!=='Phone number')input.placeholder='Phone number';
      input.setAttribute('inputmode','tel');
    }
    const desc=document.querySelector('#newChatSheet .q26newChatDesc');
    if(desc&&desc.textContent!=='Enter the phone number. No country prefix is needed.')desc.textContent='Enter the phone number. No country prefix is needed.';
    if(btn&&!btn.dataset.q297Patched){
      btn.dataset.q297Patched='1';
      const old=btn.onclick;
      btn.onclick=e=>{
        if(!input)return old&&old.call(btn,e);
        const shown=input.value;
        input.value=fullNumber(shown);
        let out;
        try{out=old&&old.call(btn,e)}finally{setTimeout(()=>{if(document.body.contains(input)&&input.value.startsWith('+'))input.value=shown;},180)}
        return out;
      };
    }
    if(input&&!input.dataset.q297Enter){
      input.dataset.q297Enter='1';
      input.addEventListener('keydown',e=>{
        if(e.key!=='Enter')return;
        const shown=input.value;
        input.value=fullNumber(shown);
        setTimeout(()=>{if(document.body.contains(input)&&input.value.startsWith('+'))input.value=shown;},180);
      },true);
    }
  }

  let scheduled=false;
  const refresh=()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;fixOverview();patchNewChat();});
  };
  const observer=new MutationObserver(ms=>{
    if(ms.some(m=>m.addedNodes&&m.addedNodes.length))refresh();
  });
  observer.observe(document.body,{subtree:true,childList:true});

  fixOverview();patchNewChat();
  setTimeout(()=>{
    fixOverview();patchNewChat();
    document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||'')&&el.textContent!=='Qevyno 2.9.7 • Android 8+')el.textContent='Qevyno 2.9.7 • Android 8+';});
  },180);
})();