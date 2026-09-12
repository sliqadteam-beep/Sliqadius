(()=>{
  const D=id=>document.getElementById(id);
  const COUNTRIES=[
    ['AE','United Arab Emirates','+971'],['AT','Austria','+43'],['AU','Australia','+61'],['BA','Bosnia & Herzegovina','+387'],['BE','Belgium','+32'],['BG','Bulgaria','+359'],['BR','Brazil','+55'],['CA','Canada','+1'],['CH','Switzerland','+41'],['CN','China','+86'],['CZ','Czechia','+420'],['DE','Germany','+49'],['DK','Denmark','+45'],['EE','Estonia','+372'],['EG','Egypt','+20'],['ES','Spain','+34'],['FI','Finland','+358'],['FR','France','+33'],['GB','United Kingdom','+44'],['GR','Greece','+30'],['HR','Croatia','+385'],['HU','Hungary','+36'],['IE','Ireland','+353'],['IN','India','+91'],['IT','Italy','+39'],['JP','Japan','+81'],['KR','South Korea','+82'],['LT','Lithuania','+370'],['LU','Luxembourg','+352'],['LV','Latvia','+371'],['MX','Mexico','+52'],['NL','Netherlands','+31'],['NO','Norway','+47'],['NZ','New Zealand','+64'],['PL','Poland','+48'],['PT','Portugal','+351'],['RO','Romania','+40'],['RS','Serbia','+381'],['RU','Russia','+7'],['SA','Saudi Arabia','+966'],['SE','Sweden','+46'],['SI','Slovenia','+386'],['SK','Slovakia','+421'],['TR','Türkiye','+90'],['UA','Ukraine','+380'],['US','United States','+1'],['ZA','South Africa','+27']
  ].sort((a,b)=>a[1].localeCompare(b[1],'en',{sensitivity:'base'}));

  let countryIso='DE';
  let pendingPhone='';
  const flag=iso=>String(iso).toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt()));
  const byIso=iso=>COUNTRIES.find(c=>c[0]===String(iso||'').toUpperCase())||COUNTRIES.find(c=>c[0]==='DE');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const style=document.createElement('style');
  style.textContent=`
    .qv{display:none}.qv.on{display:block}.qt{font-size:28px;font-weight:900;margin:0 0 8px}.qs{font-size:14px;color:var(--muted);line-height:1.5;margin-bottom:18px}
    .qr{display:grid;grid-template-columns:auto 1fr 56px;gap:8px;margin-top:16px}.qr .field{margin:0;height:58px}.qc{height:58px;padding:0 13px;border:1px solid var(--line);background:var(--panel);border-radius:17px;color:var(--text);font-weight:850;white-space:nowrap}.qa{width:56px;height:56px;border-radius:18px;background:var(--green);font-size:28px;font-weight:900}.qb{margin-top:17px;background:transparent;color:var(--muted);padding:8px 2px;font-weight:700}.qck{display:none;color:var(--muted);font-size:13px;margin-top:12px}.qck.on{display:block}
    .qbg{position:fixed;inset:0;background:#000b;display:none;align-items:flex-end;z-index:80}.qbg.on{display:flex}.qsh{width:100%;max-width:760px;margin:auto;background:#10161e;border:1px solid var(--line);border-radius:26px 26px 0 0;padding:16px 14px calc(18px + env(safe-area-inset-bottom));max-height:78vh;display:flex;flex-direction:column}.qh{display:flex;align-items:center;font-size:20px;font-weight:900}.qx{margin-left:auto;width:40px;height:40px;border-radius:13px;background:var(--panel2);color:var(--text);font-size:20px}.ql{overflow:auto}.qi{width:100%;min-height:50px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:8px;background:transparent;color:var(--text);border-bottom:1px solid #ffffff0c;text-align:left}.qd{color:var(--muted);font-weight:800}.dots{display:flex;gap:6px;margin-bottom:20px}.dotx{width:28px;height:4px;border-radius:99px;background:#263242}.dotx.on{background:var(--green)}
  `;
  document.head.appendChild(style);

  const box=document.querySelector('#authScreen .auth');
  if(!box)return;
  box.innerHTML=`<div style="width:100%;max-width:520px;margin:auto">
    <div class="logo">Qevyno<span class="dot">.</span></div><div class="tag">Private messaging through the Qevyno server.</div>
    <div class="qv on" id="vp"><div class="qt">Enter your phone number</div><div class="qs">Qevyno automatically detects whether you already have an account.</div><div class="qr"><button class="qc" id="cc"><span id="cf">🇩🇪</span> <span id="cd">+49</span> ▾</button><input class="field" id="pi" inputmode="tel" autocomplete="tel-national" placeholder="Enter phone number"><button class="qa" id="pn">→</button></div><div class="qck" id="ck">Checking number…</div><div class="error" id="pe"></div><div class="hint">Country code is selected automatically from your device/network region. Tap it to change it.</div></div>
    <div class="qv" id="vn"><div class="dots"><i class="dotx on"></i><i class="dotx on"></i><i class="dotx"></i></div><div class="qt">What's your name?</div><div class="qs">This is the name other Qevyno users will see.</div><input class="field" id="ni" maxlength="32" autocomplete="name" placeholder="Your name"><button class="primary" id="nn">Continue →</button><div class="error" id="ne"></div><button class="qb" id="nb">‹ Change phone number</button></div>
    <div class="qv" id="vc"><div class="dots"><i class="dotx on"></i><i class="dotx on"></i><i class="dotx on"></i></div><div class="qt">Create a password</div><div class="qs">Use at least 6 characters.</div><input class="field" id="np" type="password" autocomplete="new-password" placeholder="Password"><button class="primary" id="cr">Create account</button><div class="error" id="ce"></div><button class="qb" id="cb">‹ Back</button></div>
    <div class="qv" id="vl"><div class="qt">Welcome back</div><div class="qs" id="ll"></div><input class="field" id="lp" type="password" autocomplete="current-password" placeholder="Password"><button class="primary" id="li">Log in</button><div class="error" id="le"></div><button class="qb" id="lb">‹ Change phone number</button></div>
  </div>`;

  const picker=document.createElement('div');
  picker.className='qbg';
  picker.id='pk';
  picker.innerHTML='<div class="qsh"><div class="qh">Choose country<button class="qx" id="cx">×</button></div><input class="field" id="cs" placeholder="Search country or code"><div class="ql" id="cl"></div></div>';
  document.body.appendChild(picker);

  function view(id){
    ['vp','vn','vc','vl'].forEach(x=>D(x).classList.toggle('on',x===id));
    ['pe','ne','ce','le'].forEach(x=>D(x).textContent='');
  }

  function setCountry(iso){
    const c=byIso(iso);
    countryIso=c[0];
    D('cf').textContent=flag(c[0]);
    D('cd').textContent=c[2];
    localStorage.setItem('qevyno_country',c[0]);
  }

  function autoCountry(){
    let iso='';
    try{if(window.QevynoDevice&&QevynoDevice.getCountryIso)iso=QevynoDevice.getCountryIso()||'';}catch(e){}
    if(!iso){
      const lang=(navigator.languages&&navigator.languages[0])||navigator.language||'';
      const m=lang.match(/[-_]([A-Za-z]{2})$/);
      if(m)iso=m[1];
    }
    setCountry(iso||localStorage.getItem('qevyno_country')||'DE');
  }

  function fullPhone(raw){
    let p=(raw||'').trim();
    if(p.startsWith('+')||p.startsWith('00'))return normalizePhone(p);
    p=p.replace(/\D/g,'').replace(/^0+/,'');
    return p?byIso(countryIso)[2]+p:'';
  }

  function renderCountries(query=''){
    const q=query.trim().toLowerCase();
    D('cl').innerHTML='';
    COUNTRIES.filter(c=>!q||c[0].toLowerCase().includes(q)||c[1].toLowerCase().includes(q)||c[2].includes(q)).forEach(c=>{
      const row=document.createElement('button');
      row.className='qi';
      row.innerHTML=`<span>${flag(c[0])}</span><b>${esc(c[1])}</b><span class="qd">${c[2]}</span>`;
      row.onclick=()=>{setCountry(c[0]);picker.classList.remove('on');setTimeout(()=>D('pi').focus(),60);};
      D('cl').appendChild(row);
    });
  }

  function reset(){
    pendingPhone='';
    D('pi').value='';D('ni').value='';D('np').value='';D('lp').value='';
    view('vp');autoCountry();setTimeout(()=>D('pi').focus(),60);
  }

  async function nextPhone(){
    const phone=fullPhone(D('pi').value);
    D('pe').textContent='';
    if(!/^\+[1-9]\d{7,14}$/.test(phone)){D('pe').textContent='Enter a valid phone number.';return;}
    D('pn').disabled=true;D('ck').classList.add('on');
    let r=null;
    try{r=await api('/api/account-status?phone='+encodeURIComponent(phone)+'&_='+Date.now(),'GET',null,false);}catch(e){}
    D('pn').disabled=false;D('ck').classList.remove('on');
    if(!r||!r.ok){
      let health=null;
      try{health=await api('/health?_='+Date.now(),'GET',null,false);}catch(e){}
      if(health&&health.ok&&String(health.version)!=='2.1')D('pe').textContent='Qevyno server needs the account-check update.';
      else if(r&&r.error==='invalid_phone')D('pe').textContent='Enter a valid phone number.';
      else if(r&&r.error==='rate_limited')D('pe').textContent='Too many checks. Try again later.';
      else if(r&&r.error==='not_found')D('pe').textContent='Qevyno server needs the account-check update.';
      else D('pe').textContent='Could not check number. Please update/restart the Qevyno server.';
      return;
    }
    pendingPhone=phone;
    if(r.exists){
      D('ll').textContent=phone+' already has a Qevyno account. Enter your password.';
      view('vl');setTimeout(()=>D('lp').focus(),60);
    }else{
      view('vn');setTimeout(()=>D('ni').focus(),60);
    }
  }

  async function register(){
    const name=D('ni').value.trim();
    const password=D('np').value;
    D('ce').textContent='';
    if(name.length<2||name.length>32){D('ce').textContent='Name needs 2–32 characters.';return;}
    if(password.length<6){D('ce').textContent='Password needs at least 6 characters.';return;}
    const r=await api('/api/register','POST',{phone:pendingPhone,password,display_name:name},false);
    if(r&&r.ok){saveSession(r);home();return;}
    if(r&&r.error==='phone_taken'){
      D('ll').textContent=pendingPhone+' already has a Qevyno account. Enter your password.';
      view('vl');return;
    }
    D('ce').textContent=(r&&r.error)||'Could not create account.';
  }

  async function login(){
    const password=D('lp').value;
    D('le').textContent='';
    if(password.length<6){D('le').textContent='Password needs at least 6 characters.';return;}
    const r=await api('/api/login','POST',{phone:pendingPhone,password},false);
    if(r&&r.ok){saveSession(r);home();return;}
    D('le').textContent=r&&r.error==='invalid_login'?'Wrong password.':(r&&r.error)||'Could not log in.';
  }

  D('cc').onclick=()=>{renderCountries();picker.classList.add('on');};
  D('cx').onclick=()=>picker.classList.remove('on');
  picker.onclick=e=>{if(e.target===picker)picker.classList.remove('on');};
  D('cs').oninput=e=>renderCountries(e.target.value);
  D('pn').onclick=nextPhone;
  D('pi').onkeydown=e=>{if(e.key==='Enter')nextPhone();};
  D('nn').onclick=()=>{const n=D('ni').value.trim();if(n.length<2||n.length>32){D('ne').textContent='Name needs 2–32 characters.';return;}view('vc');D('np').focus();};
  D('nb').onclick=()=>view('vp');
  D('cr').onclick=register;
  D('np').onkeydown=e=>{if(e.key==='Enter')register();};
  D('cb').onclick=()=>view('vn');
  D('li').onclick=login;
  D('lp').onkeydown=e=>{if(e.key==='Enter')login();};
  D('lb').onclick=()=>view('vp');
  window.auth=()=>{stopPolls();peer=null;show('authScreen');reset();};
  try{document.querySelector('.sheet .small:last-child').textContent='Qevyno 2.5.1 • Android 8+';}catch(e){}
  if(!token&&D('authScreen').classList.contains('active'))reset();else autoCountry();
})();
