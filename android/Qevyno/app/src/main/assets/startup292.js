(()=>{
  // Cover the legacy base UI before Android makes the WebView visible.
  try{
    if(!document.getElementById('skaysaBoot')){
      const style=document.createElement('style');
      style.id='skaysaBootStyle';
      style.textContent=`
#skaysaBoot{position:fixed;inset:0;z-index:2147483647;background:#fff;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity .18s ease;pointer-events:all}
#skaysaBoot.hide{opacity:0;pointer-events:none}
#skaysaBoot .skaysaBootInner{display:flex;flex-direction:column;align-items:center;gap:16px;color:#17212b;font:600 14px/1.3 Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
#skaysaBoot .skaysaBootSpinner{width:34px;height:34px;border-radius:50%;border:4px solid #e7f1f9;border-top-color:#8ABFF4;animation:skaysaSpin .72s linear infinite}
#skaysaBoot .skaysaBootText{color:#71828d;font-size:13px;letter-spacing:.01em}
@keyframes skaysaSpin{to{transform:rotate(360deg)}}
`;
      document.head.appendChild(style);
      const boot=document.createElement('div');
      boot.id='skaysaBoot';
      const isDe=String(navigator.language||'').toLowerCase().startsWith('de');
      boot.innerHTML='<div class="skaysaBootInner"><div class="skaysaBootSpinner" aria-hidden="true"></div><div class="skaysaBootText">'+(isDe?'Skaysa wird geladen…':'Loading Skaysa…')+'</div></div>';
      document.body.appendChild(boot);
      window.skaysaHideBoot=()=>{
        const b=document.getElementById('skaysaBoot');
        if(!b)return;
        b.classList.add('hide');
        setTimeout(()=>{try{b.remove();document.getElementById('skaysaBootStyle')?.remove()}catch(_){ }},220);
      };
      setTimeout(()=>{try{window.skaysaHideBoot&&window.skaysaHideBoot()}catch(_){ }},2600);
    }
  }catch(e){}

  function load313(){
    try{
      if(document.getElementById('qevyno313loader'))return;
      const s=document.createElement('script');
      s.id='qevyno313loader';
      s.src='file:///android_asset/features313.js';
      s.async=false;
      document.head.appendChild(s);
    }catch(e){}
  }
  function load312(){
    try{
      if(document.getElementById('qevyno312loader')){load313();return;}
      const s=document.createElement('script');
      s.id='qevyno312loader';
      s.src='file:///android_asset/features312.js';
      s.async=false;
      s.onload=load313;
      s.onerror=load313;
      document.head.appendChild(s);
    }catch(e){load313()}
  }
  function load311(){
    try{
      if(document.getElementById('qevyno311loader')){load312();return;}
      const s=document.createElement('script');s.id='qevyno311loader';s.src='file:///android_asset/features311.js';s.async=false;s.onload=load312;s.onerror=load312;document.head.appendChild(s);
    }catch(e){load312()}
  }
  function load310(){
    try{
      if(document.getElementById('qevyno310loader')){load311();return;}
      const s=document.createElement('script');s.id='qevyno310loader';s.src='file:///android_asset/features310.js';s.async=false;s.onload=load311;s.onerror=load311;document.head.appendChild(s);
    }catch(e){load311()}
  }
  function load309(){
    try{
      if(document.getElementById('qevyno309loader')){load310();return;}
      const s=document.createElement('script');s.id='qevyno309loader';s.src='file:///android_asset/features309.js';s.async=false;s.onload=load310;s.onerror=load310;document.head.appendChild(s);
    }catch(e){load310()}
  }
  function load308(){
    try{
      if(document.getElementById('qevyno308loader')){load309();return;}
      const s=document.createElement('script');s.id='qevyno308loader';s.src='file:///android_asset/features308.js';s.async=false;s.onload=load309;s.onerror=load309;document.head.appendChild(s);
    }catch(e){load309()}
  }
  function load307(){
    try{
      if(document.getElementById('qevyno307loader')){load308();return;}
      const s=document.createElement('script');s.id='qevyno307loader';s.src='file:///android_asset/features307.js';s.async=false;s.onload=load308;s.onerror=load308;document.head.appendChild(s);
    }catch(e){load308()}
  }
  function load306(){
    try{
      if(document.getElementById('qevyno306loader')){load307();return;}
      const s=document.createElement('script');s.id='qevyno306loader';s.src='file:///android_asset/features306.js';s.async=false;s.onload=load307;s.onerror=load307;document.head.appendChild(s);
    }catch(e){load307()}
  }
  function load305(){
    try{
      if(document.getElementById('qevyno305loader')){load306();return;}
      const s=document.createElement('script');s.id='qevyno305loader';s.src='file:///android_asset/features305.js';s.async=false;s.onload=load306;s.onerror=load306;document.head.appendChild(s);
    }catch(e){load306()}
  }
  function load304(){
    try{
      if(document.getElementById('qevyno304loader')){load305();return;}
      const s=document.createElement('script');s.id='qevyno304loader';s.src='file:///android_asset/features304.js';s.async=false;s.onload=load305;s.onerror=load305;document.head.appendChild(s);
    }catch(e){load305()}
  }
  try{
    if(!document.getElementById('qevyno303loader')){
      const s=document.createElement('script');s.id='qevyno303loader';s.src='file:///android_asset/features303.js';s.async=false;s.onload=load304;s.onerror=load304;document.head.appendChild(s);
    }else load304();
  }catch(e){load304()}

  const hasSavedSession=!!localStorage.getItem('qevyno_token');
  if(!hasSavedSession)return;
  const blocker=document.createElement('style');
  blocker.id='qevynoStartupNoLoader';
  blocker.textContent='.q27load,.q27pill{display:none!important}';
  document.head.appendChild(blocker);
  try{
    if(typeof show==='function')show('homeScreen');
    const hello=document.getElementById('hello');
    const name=localStorage.getItem('qevyno_name')||'Skaysa';
    const phone=localStorage.getItem('qevyno_phone')||'';
    if(hello)hello.textContent=name+(phone?' • '+phone:'');
    document.getElementById('q27load')?.classList.remove('on');
    document.getElementById('q27pill')?.classList.remove('on');
  }catch(e){}
  setTimeout(()=>{try{blocker.remove()}catch(e){}},1800);
})();