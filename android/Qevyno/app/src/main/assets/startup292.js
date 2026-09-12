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

  // Qevyno Help is created by features299.js. Previously the normal
  // conversation refresh removed that row every few seconds and the
  // MutationObserver created it again on the next frame. That looked like
  // the help message was constantly being sent and deleted. Preserve the
  // original help row while the real conversation list refreshes instead.
  try{
    const originalRender=window.renderConversations;
    if(typeof originalRender==='function'&&!window.qevynoHelpOnceFix){
      window.qevynoHelpOnceFix=true;
      window.renderConversations=function(list){
        const before=document.getElementById('people');
        const helpRow=before&&before.querySelector('.q299helpRow');
        originalRender(list);
        if(helpRow){
          const after=document.getElementById('people');
          if(after&&!after.contains(helpRow)){
            const label=after.querySelector('.sectionLabel');
            if(label)label.insertAdjacentElement('afterend',helpRow);
            else after.prepend(helpRow);
          }
        }
      };
    }
  }catch(e){}

  // Keep the visible version label correct after older feature scripts have
  // finished applying their UI text.
  setTimeout(()=>{
    try{
      document.querySelectorAll('.small').forEach(el=>{
        if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.12 • Android 8+';
      });
    }catch(e){}
  },900);

  // Keep only the startup loader hidden. Normal loaders for actions such as
  // login, number lookup and sending messages become available shortly after.
  setTimeout(()=>{
    try{blocker.remove();}catch(e){}
  },1800);
})();
