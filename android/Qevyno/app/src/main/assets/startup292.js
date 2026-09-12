(()=>{
  // Load the stable send queue first, then chat polish, sharing/previews and
  // finally the newest groups/conversation-list layer. The newest layer runs
  // last so older UI scripts cannot move badges or phone numbers back again.
  function load306(){
    try{
      if(document.getElementById('qevyno306loader'))return;
      const groups=document.createElement('script');
      groups.id='qevyno306loader';
      groups.src='file:///android_asset/features306.js';
      groups.async=false;
      document.head.appendChild(groups);
    }catch(e){}
  }
  function load305(){
    try{
      if(document.getElementById('qevyno305loader')){load306();return;}
      const newest=document.createElement('script');
      newest.id='qevyno305loader';
      newest.src='file:///android_asset/features305.js';
      newest.async=false;
      newest.onload=load306;
      document.head.appendChild(newest);
    }catch(e){load306()}
  }
  function load304(){
    try{
      if(document.getElementById('qevyno304loader')){load305();return;}
      const polish=document.createElement('script');
      polish.id='qevyno304loader';
      polish.src='file:///android_asset/features304.js';
      polish.async=false;
      polish.onload=load305;
      document.head.appendChild(polish);
    }catch(e){load305()}
  }
  try{
    if(!document.getElementById('qevyno303loader')){
      const finalFix=document.createElement('script');
      finalFix.id='qevyno303loader';
      finalFix.src='file:///android_asset/features303.js';
      finalFix.async=false;
      finalFix.onload=load304;
      document.head.appendChild(finalFix);
    }else load304();
  }catch(e){load304()}

  // Fast startup for users with an existing session.
  const hasSavedSession=!!localStorage.getItem('qevyno_token');
  if(!hasSavedSession)return;

  const blocker=document.createElement('style');
  blocker.id='qevynoStartupNoLoader';
  blocker.textContent='.q27load,.q27pill{display:none!important}';
  document.head.appendChild(blocker);

  try{
    if(typeof show==='function')show('homeScreen');
    const hello=document.getElementById('hello');
    const name=localStorage.getItem('qevyno_name')||'SliqChat';
    const phone=localStorage.getItem('qevyno_phone')||'';
    if(hello)hello.textContent=name+(phone?' • '+phone:'');
    const overlay=document.getElementById('q27load');
    if(overlay)overlay.classList.remove('on');
    const pill=document.getElementById('q27pill');
    if(pill)pill.classList.remove('on');
  }catch(e){}

  setTimeout(()=>{try{blocker.remove();}catch(e){}},1800);
})();