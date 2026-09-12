(()=>{
  const D=id=>document.getElementById(id);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  const style=document.createElement('style');
  style.textContent=`
    .q27load{position:fixed;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(3,8,6,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:0;pointer-events:none;transition:opacity .22s ease}.q27load.on{opacity:1;pointer-events:auto}.q27card{width:min(330px,88vw);padding:28px 24px 24px;border-radius:30px;background:linear-gradient(160deg,rgba(17,35,27,.98),rgba(8,18,14,.98));border:1px solid rgba(78,238,154,.2);box-shadow:0 30px 90px rgba(0,0,0,.5);text-align:center}.q27logo{font-size:24px;font-weight:950;letter-spacing:-.8px;margin-bottom:20px}.q27logo b{color:var(--green)}.q27spinner{position:relative;width:64px;height:64px;margin:0 auto 20px}.q27spinner:before,.q27spinner:after,.q27spinner i{content:'';position:absolute;border-radius:50%;inset:0;border:4px solid transparent}.q27spinner:before{border-top-color:var(--green);border-right-color:rgba(57,229,140,.35);animation:q27spin 1s linear infinite}.q27spinner:after{inset:9px;border-left-color:#a1ffd0;border-bottom-color:rgba(161,255,208,.2);animation:q27spin .72s linear infinite reverse}.q27spinner i{inset:25px;background:var(--green);border:0;box-shadow:0 0 18px rgba(57,229,140,.55);animation:q27pulse 1.25s ease-in-out infinite}.q27title{font-size:18px;font-weight:900;letter-spacing:-.25px}.q27sub{margin-top:7px;color:var(--muted);font-size:13px;line-height:1.45;min-height:38px}.q27wait{display:flex;justify-content:center;gap:5px;margin-top:15px}.q27wait span{width:6px;height:6px;border-radius:99px;background:var(--green);opacity:.25;animation:q27dot 1.15s infinite}.q27wait span:nth-child(2){animation-delay:.15s}.q27wait span:nth-child(3){animation-delay:.3s}
    .q27pill{position:fixed;z-index:120;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translate(-50%,-15px);display:flex;align-items:center;gap:8px;background:rgba(15,31,24,.96);border:1px solid rgba(57,229,140,.2);box-shadow:0 12px 35px rgba(0,0,0,.3);padding:8px 12px;border-radius:999px;color:#dfffee;font-size:11.5px;font-weight:800;opacity:0;pointer-events:none;transition:.2s ease;white-space:nowrap}.q27pill.on{opacity:1;transform:translate(-50%,0)}.q27mini{width:13px;height:13px;border-radius:50%;border:2px solid rgba(57,229,140,.2);border-top-color:var(--green);animation:q27spin .75s linear infinite}.q27toast{position:fixed;z-index:170;left:50%;bottom:calc(86px + env(safe-area-inset-bottom));transform:translate(-50%,14px);max-width:min(420px,88vw);padding:11px 15px;border-radius:16px;background:#13241c;border:1px solid #28533c;color:#eafff3;font-size:12.5px;font-weight:750;box-shadow:0 18px 50px rgba(0,0,0,.36);opacity:0;pointer-events:none;transition:.22s ease}.q27toast.on{opacity:1;transform:translate(-50%,0)}
    @keyframes q27spin{to{transform:rotate(360deg)}}@keyframes q27pulse{0%,100%{transform:scale(.72);opacity:.65}50%{transform:scale(1);opacity:1}}@keyframes q27dot{0%,65%,100%{opacity:.2;transform:translateY(0)}35%{opacity:1;transform:translateY(-3px)}}
    body.q26-reduce .q27spinner:before,body.q26-reduce .q27spinner:after,body.q26-reduce .q27spinner i,body.q26-reduce .q27wait span,body.q26-reduce .q27mini{animation-duration:2.2s}
  `;
  document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.className='q27load';
  overlay.id='q27load';
  overlay.innerHTML='<div class="q27card"><div class="q27logo">Qevyno<b>.</b></div><div class="q27spinner"><i></i></div><div class="q27title" id="q27title">Connecting…</div><div class="q27sub" id="q27sub">Giving the server a moment to respond.</div><div class="q27wait"><span></span><span></span><span></span></div></div>';
  document.body.appendChild(overlay);

  const pill=document.createElement('div');
  pill.className='q27pill';pill.id='q27pill';
  pill.innerHTML='<span class="q27mini"></span><span id="q27pillText">Syncing…</span>';
  document.body.appendChild(pill);

  const toast=document.createElement('div');
  toast.className='q27toast';toast.id='q27toast';document.body.appendChild(toast);

  let active=0,showTimer=null,stageTimer1=null,stageTimer2=null,pillTimer=null,toastTimer=null;
  const textFor=(path,method)=>{
    if(path.startsWith('/api/account-status'))return ['Checking number…','Qevyno is checking whether this number already has an account.'];
    if(path==='/api/login')return ['Signing you in…','Waiting for the Qevyno server to confirm your account.'];
    if(path==='/api/register')return ['Creating your account…','Saving your Qevyno account securely.'];
    if(path==='/api/send')return ['Sending message…','Waiting for the server to accept your message.'];
    if(path.startsWith('/api/find'))return ['Finding account…','Searching for the exact Qevyno number.'];
    if(path==='/api/me')return ['Restoring session…','Checking your saved Qevyno login.'];
    if(path.startsWith('/health'))return ['Checking server…','Making sure the Qevyno server is online.'];
    if(path.startsWith('/api/conversations'))return ['Loading chats…','Syncing your recent conversations.'];
    if(path.startsWith('/api/messages'))return ['Loading messages…','Syncing the latest messages.'];
    return [method==='POST'?'Saving…':'Loading…','Giving the server a moment to respond.'];
  };
  const isCritical=(path,method)=>path.startsWith('/api/account-status')||path==='/api/login'||path==='/api/register'||path==='/api/send'||path.startsWith('/api/find')||path==='/api/me';

  function beginLoad(path,method){
    active++;
    const [title,sub]=textFor(path,method);
    if(isCritical(path,method)){
      clearTimeout(showTimer);clearTimeout(stageTimer1);clearTimeout(stageTimer2);
      showTimer=setTimeout(()=>{D('q27title').textContent=title;D('q27sub').textContent=sub;overlay.classList.add('on');},500);
      stageTimer1=setTimeout(()=>{if(active){D('q27sub').textContent='The server is taking a little longer. Qevyno is still trying…';}},6500);
      stageTimer2=setTimeout(()=>{if(active){D('q27sub').textContent='Still trying. No error will be shown until the retry finishes.';}},14500);
    }else{
      clearTimeout(pillTimer);
      pillTimer=setTimeout(()=>{D('q27pillText').textContent=title.replace('…','');pill.classList.add('on');},900);
    }
  }
  function endLoad(){
    active=Math.max(0,active-1);
    if(active===0){
      clearTimeout(showTimer);clearTimeout(stageTimer1);clearTimeout(stageTimer2);clearTimeout(pillTimer);
      overlay.classList.remove('on');pill.classList.remove('on');
    }
  }
  function note(msg){
    toast.textContent=msg;toast.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('on'),2400);
  }

  // Replace the original short 8-second request timeout with a patient retry policy.
  // Fast successful requests remain fast; only failures wait/retry before an error is returned.
  api=async function(path,method='GET',body=null,auth=true){
    const started=Date.now();
    const maxAttempts=2;
    beginLoad(path,method);
    try{
      for(let attempt=1;attempt<=maxAttempts;attempt++){
        const ctl=new AbortController();
        const timer=setTimeout(()=>ctl.abort(),12000);
        try{
          const h={'Accept':'application/json'};
          if(body)h['Content-Type']='application/json';
          if(auth&&token)h['Authorization']='Bearer '+token;
          const res=await fetch(server+path,{method,headers:h,body:body?JSON.stringify(body):undefined,signal:ctl.signal,cache:'no-store'});
          let d=null;
          try{d=await res.json();}catch(_){}

          // A real application response (including normal 4xx validation) should be returned immediately.
          if(res.status<500&&d){connectionBad(false);return d;}
          if(res.ok&&d){connectionBad(false);return d;}

          // 5xx / Cloudflare gateway errors get another chance.
          if(attempt<maxAttempts){
            D('q27sub').textContent='The server did not answer yet. Retrying automatically…';
            await sleep(2200);
            continue;
          }
          connectionBad(true);
        }catch(e){
          if(attempt<maxAttempts){
            D('q27sub').textContent='Connection is slow. Retrying automatically…';
            await sleep(2200);
            continue;
          }
          connectionBad(true);
        }finally{clearTimeout(timer);}
      }

      // Even immediate gateway failures do not become user-facing errors instantly.
      const elapsed=Date.now()-started;
      if(elapsed<9000)await sleep(9000-elapsed);
      return {ok:false,error:'server_unreachable'};
    }finally{endLoad();}
  };

  // Better feedback when the app comes back from the background.
  window.addEventListener('online',()=>{connectionBad(false);note('Internet connection restored. Qevyno will sync again.');});
  window.addEventListener('offline',()=>note('No internet connection. Qevyno will keep your screen open and retry later.'));

  // Keep the version label in the settings sheet current.
  setTimeout(()=>{
    document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.7 • Android 8+';});
  },100);
})();