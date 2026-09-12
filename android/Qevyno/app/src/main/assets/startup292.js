(()=>{
  // Run the final stability/queue layer after the concatenated UI bundle has
  // completed, then load the chat-polish layer after it. This keeps the send
  // queue authoritative while allowing the newest visual fixes to run last.
  function load304(){
    try{
      if(document.getElementById('qevyno304loader'))return;
      const polish=document.createElement('script');
      polish.id='qevyno304loader';
      polish.src='file:///android_asset/features304.js';
      polish.async=false;
      document.head.appendChild(polish);
    }catch(e){}
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
    const name=localStorage.getItem('qevyno_name')||'Qevyno';
    const phone=localStorage.getItem('qevyno_phone')||'';
    if(hello)hello.textContent=name+(phone?' • '+phone:'');
    const overlay=document.getElementById('q27load');
    if(overlay)overlay.classList.remove('on');
    const pill=document.getElementById('q27pill');
    if(pill)pill.classList.remove('on');
  }catch(e){}

  setTimeout(()=>{try{blocker.remove();}catch(e){}},1800);
})();
