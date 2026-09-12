(()=>{
  // Load feature layers in order. Newer layers run last so older patches cannot
  // overwrite chat-list, media, profile or visual-polish changes.
  function load310(){
    try{
      if(document.getElementById('qevyno310loader'))return;
      const s=document.createElement('script');s.id='qevyno310loader';s.src='file:///android_asset/features310.js';s.async=false;document.head.appendChild(s);
    }catch(e){}
  }
  function load309(){
    try{
      if(document.getElementById('qevyno309loader')){load310();return;}
      const s=document.createElement('script');s.id='qevyno309loader';s.src='file:///android_asset/features309.js';s.async=false;s.onload=load310;document.head.appendChild(s);
    }catch(e){load310()}
  }
  function load308(){
    try{
      if(document.getElementById('qevyno308loader')){load309();return;}
      const s=document.createElement('script');s.id='qevyno308loader';s.src='file:///android_asset/features308.js';s.async=false;s.onload=load309;document.head.appendChild(s);
    }catch(e){load309()}
  }
  function load307(){
    try{
      if(document.getElementById('qevyno307loader')){load308();return;}
      const s=document.createElement('script');s.id='qevyno307loader';s.src='file:///android_asset/features307.js';s.async=false;s.onload=load308;document.head.appendChild(s);
    }catch(e){load308()}
  }
  function load306(){
    try{
      if(document.getElementById('qevyno306loader')){load307();return;}
      const s=document.createElement('script');s.id='qevyno306loader';s.src='file:///android_asset/features306.js';s.async=false;s.onload=load307;document.head.appendChild(s);
    }catch(e){load307()}
  }
  function load305(){
    try{
      if(document.getElementById('qevyno305loader')){load306();return;}
      const s=document.createElement('script');s.id='qevyno305loader';s.src='file:///android_asset/features305.js';s.async=false;s.onload=load306;document.head.appendChild(s);
    }catch(e){load306()}
  }
  function load304(){
    try{
      if(document.getElementById('qevyno304loader')){load305();return;}
      const s=document.createElement('script');s.id='qevyno304loader';s.src='file:///android_asset/features304.js';s.async=false;s.onload=load305;document.head.appendChild(s);
    }catch(e){load305()}
  }
  try{
    if(!document.getElementById('qevyno303loader')){
      const s=document.createElement('script');s.id='qevyno303loader';s.src='file:///android_asset/features303.js';s.async=false;s.onload=load304;document.head.appendChild(s);
    }else load304();
  }catch(e){load304()}

  // Fast startup for users with an existing session.
  const hasSavedSession=!!localStorage.getItem('qevyno_token');
  if(!hasSavedSession)return;
  const blocker=document.createElement('style');blocker.id='qevynoStartupNoLoader';blocker.textContent='.q27load,.q27pill{display:none!important}';document.head.appendChild(blocker);
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
