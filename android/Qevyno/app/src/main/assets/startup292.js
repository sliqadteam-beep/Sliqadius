(()=>{
  // Fast startup for users with an existing session.
  // The saved session is shown immediately while the normal server validation
  // continues in the background. This avoids a visible startup/loading flash.
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

  // Keep only the startup loader hidden. Normal loaders for actions such as
  // login, number lookup and sending messages become available shortly after.
  setTimeout(()=>{
    try{blocker.remove();}catch(e){}
  },1800);
})();
