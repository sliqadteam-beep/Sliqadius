(()=>{
  const style=document.createElement('style');
  style.id='qevyno296style';
  style.textContent=`
    :root{--qEase:cubic-bezier(.22,1,.36,1);--qFast:150ms;--qMed:260ms;--qSlow:420ms}
    html{scroll-behavior:smooth}
    body,.app,.screen,.topbar,.people,.messages,.composer,.sheet,.q293menu,.q293fullcard,.q295action,.q26row,.q26avatar,.q26chatAvatar,.q26new,.iconbtn,.send,.primary,.secondary,.q26sheetBtn,.q26setting,.q26switch,.field,.q293qrbox,.q293plusqr,.q295photoRow,.q295emoji,.q295delete,.q295verified,.q295react{backface-visibility:hidden;-webkit-font-smoothing:antialiased}

    .screen.active{animation:q296ScreenIn var(--qMed) var(--qEase) both}
    @keyframes q296ScreenIn{from{opacity:0;transform:translate3d(0,8px,0) scale(.997)}to{opacity:1;transform:none}}

    .authView.active{animation:q296AuthIn var(--qMed) var(--qEase) both}
    @keyframes q296AuthIn{from{opacity:0;transform:translate3d(12px,0,0)}to{opacity:1;transform:none}}

    .sheetBack{transition:opacity var(--qMed) var(--qEase),background-color var(--qMed) ease!important;opacity:0}
    .sheetBack.open{opacity:1}
    .sheet{transform:translate3d(0,28px,0) scale(.985);opacity:.72;transition:transform var(--qMed) var(--qEase),opacity var(--qMed) ease!important}
    .sheetBack.open .sheet{transform:none;opacity:1}

    .q293menu{transform-origin:top right;transform:translate3d(0,-6px,0) scale(.96);opacity:0;transition:transform var(--qFast) var(--qEase),opacity var(--qFast) ease!important;display:block!important;pointer-events:none;visibility:hidden}
    .q293menu.on{transform:none;opacity:1;pointer-events:auto;visibility:visible}

    .q293full{opacity:0;transition:opacity var(--qMed) ease!important;display:flex!important;pointer-events:none;visibility:hidden}
    .q293full.on{opacity:1;pointer-events:auto;visibility:visible}
    .q293fullcard{transform:scale(.92) translate3d(0,12px,0);opacity:0;transition:transform var(--qMed) var(--qEase),opacity var(--qMed) ease!important}
    .q293full.on .q293fullcard{transform:none;opacity:1}

    .q295actionBack{opacity:0;transition:opacity var(--qMed) ease!important;display:flex!important;pointer-events:none;visibility:hidden}
    .q295actionBack.on{opacity:1;pointer-events:auto;visibility:visible}
    .q295action{transform:translate3d(0,34px,0);opacity:.7;transition:transform var(--qMed) var(--qEase),opacity var(--qMed) ease!important}
    .q295actionBack.on .q295action{transform:none;opacity:1}

    button,.iconbtn,.q26new,.send,.primary,.secondary,.q26sheetBtn,.q293qrbox,.q293plusqr,.q295emoji,.q295delete{transition:transform var(--qFast) var(--qEase),box-shadow var(--qFast) ease,background-color var(--qFast) ease,color var(--qFast) ease,border-color var(--qFast) ease,opacity var(--qFast) ease!important;will-change:transform}
    button:active,.iconbtn:active,.q26new:active,.send:active,.primary:active,.secondary:active,.q26sheetBtn:active,.q293qrbox:active,.q293plusqr:active,.q295emoji:active,.q295delete:active{transform:scale(.965)!important}
    .q26new:hover,.send:hover,.primary:hover,.q26sheetBtn.primaryish:hover{transform:translate3d(0,-1px,0)}

    .field,.q26search,.q26composeBox{transition:border-color var(--qFast) ease,box-shadow var(--qFast) ease,background-color var(--qFast) ease,transform var(--qFast) var(--qEase)!important}
    .field:focus,.q26search:focus-within,.q26composeBox:focus-within{transform:translate3d(0,-1px,0);box-shadow:0 8px 24px rgba(32,198,201,.10)}

    .q26row{transition:transform var(--qFast) var(--qEase),background-color var(--qFast) ease,opacity var(--qFast) ease!important}
    .q26row:active{transform:scale(.985)!important}
    .q296rowIn{animation:q296RowIn var(--qMed) var(--qEase) both;animation-delay:var(--qDelay,0ms)}
    @keyframes q296RowIn{from{opacity:0;transform:translate3d(0,10px,0)}to{opacity:1;transform:none}}

    .bubbleRow.q296bubbleIn{animation:q296BubbleIn 190ms var(--qEase) both}
    .bubbleRow.mine.q296bubbleIn{transform-origin:bottom right}.bubbleRow:not(.mine).q296bubbleIn{transform-origin:bottom left}
    @keyframes q296BubbleIn{from{opacity:0;transform:translate3d(0,5px,0) scale(.985)}to{opacity:1;transform:none}}

    .q26avatar,.q26chatAvatar,.q295profilePreview,.q26me{transition:transform var(--qMed) var(--qEase),box-shadow var(--qMed) ease,background-image var(--qMed) ease!important}
    .q26row:active .q26avatar,.q293plusqr:active img,.q293qrbox:active img{transform:scale(.96)}
    .q295verified{animation:q296BadgeIn 280ms var(--qEase) both}
    @keyframes q296BadgeIn{from{opacity:0;transform:scale(.5) rotate(-18deg)}to{opacity:1;transform:none}}

    .q295react{animation:q296ReactIn 220ms var(--qEase) both}
    @keyframes q296ReactIn{from{opacity:0;transform:translate3d(0,5px,0) scale(.75)}to{opacity:1;transform:none}}
    .q295emoji{animation:q296EmojiIn 220ms var(--qEase) both}
    .q295emoji:nth-child(2){animation-delay:20ms}.q295emoji:nth-child(3){animation-delay:40ms}.q295emoji:nth-child(4){animation-delay:60ms}.q295emoji:nth-child(5){animation-delay:80ms}.q295emoji:nth-child(6){animation-delay:100ms}
    @keyframes q296EmojiIn{from{opacity:0;transform:translate3d(0,8px,0) scale(.85)}to{opacity:1;transform:none}}

    .q293qrbox img,.q293plusqr img,.q293fullcard img{transition:transform var(--qMed) var(--qEase),opacity var(--qMed) ease!important}
    .q293full.on .q293fullcard img{animation:q296QrIn var(--qSlow) var(--qEase) both}
    @keyframes q296QrIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}

    .q26switch:after{transition:transform var(--qMed) var(--qEase),background-color var(--qMed) ease!important}
    .q26pin,.q26badge,.q26scroll,.conn{transition:transform var(--qFast) var(--qEase),opacity var(--qFast) ease,background-color var(--qFast) ease!important}
    .conn.show{animation:q296ToastIn var(--qMed) var(--qEase) both}
    @keyframes q296ToastIn{from{opacity:0;transform:translate(-50%,-8px) scale(.97)}to{opacity:1;transform:translate(-50%,0) scale(1)}}

    .q27overlay,.q27busy,.q27spinner,.q27dots{transition:opacity var(--qMed) ease,transform var(--qMed) var(--qEase)!important}

    .q296profilePulse{animation:q296ProfilePulse 420ms var(--qEase) both}
    @keyframes q296ProfilePulse{0%{transform:scale(.9);opacity:.4}65%{transform:scale(1.035);opacity:1}100%{transform:scale(1)}}

    @media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
    body.q26nomotion *,body.q26nomotion *::before,body.q26nomotion *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
  `;
  document.head.appendChild(style);

  const markRows=root=>{
    const rows=(root||document).querySelectorAll?.('.q26row:not([data-q296])')||[];
    rows.forEach((el,i)=>{el.dataset.q296='1';el.style.setProperty('--qDelay',Math.min(i,7)*24+'ms');el.classList.add('q296rowIn');setTimeout(()=>el.classList.remove('q296rowIn'),650)});
  };
  const markBubbles=root=>{
    const rows=(root||document).querySelectorAll?.('.bubbleRow:not([data-q296])')||[];
    const start=Math.max(0,rows.length-3);
    rows.forEach((el,i)=>{el.dataset.q296='1';if(i>=start){el.classList.add('q296bubbleIn');setTimeout(()=>el.classList.remove('q296bubbleIn'),420)}});
  };

  const obs=new MutationObserver(list=>{
    let rows=false,bubbles=false,profile=false;
    for(const m of list){for(const n of m.addedNodes){if(!(n instanceof Element))continue;if(n.matches?.('.q26row')||n.querySelector?.('.q26row'))rows=true;if(n.matches?.('.bubbleRow')||n.querySelector?.('.bubbleRow'))bubbles=true;if(n.matches?.('.q295avatarPic,.q295profilePreview')||n.querySelector?.('.q295avatarPic,.q295profilePreview'))profile=true;}}
    if(rows)requestAnimationFrame(()=>markRows(document));
    if(bubbles)requestAnimationFrame(()=>markBubbles(document));
    if(profile)requestAnimationFrame(()=>document.querySelectorAll('.q295avatarPic,.q295profilePreview').forEach(el=>{el.classList.add('q296profilePulse');setTimeout(()=>el.classList.remove('q296profilePulse'),500)}));
  });
  obs.observe(document.body,{subtree:true,childList:true});

  markRows(document);markBubbles(document);
  setTimeout(()=>{document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.6 • Android 8+';});},120);
})();
