(function(){
'use strict';

if(window.__SLIQ_WEB_REPAIR_V17__)return;
window.__SLIQ_WEB_REPAIR_V17__=true;

function $(id){return document.getElementById(id)}
function getKey(){try{return localStorage.getItem('sliq-web-key')||''}catch(e){return''}}
function lang(){try{return String(localStorage.getItem('sliq-web-lang')||navigator.language||'en').slice(0,2).toLowerCase()}catch(e){return'en'}}

var VOICE={de:'🎤 Spracheingabe',en:'🎤 Voice input',fr:'🎤 Saisie vocale',es:'🎤 Entrada de voz',it:'🎤 Input vocale',nl:'🎤 Spraakinvoer',pl:'🎤 Wprowadzanie głosowe',tr:'🎤 Sesli giriş',pt:'🎤 Entrada de voz',ru:'🎤 Голосовой ввод',ja:'🎤 音声入力',ko:'🎤 음성 입력',zh:'🎤 语音输入'};
var KEY_REQUIRED={de:'Bitte füge deinen Groq API-Key ein.',en:'Please add your Groq API key.',fr:'Ajoutez votre clé API Groq.',es:'Añade tu clave API de Groq.',it:'Aggiungi la tua chiave API Groq.',nl:'Voeg je Groq API-key toe.',pl:'Dodaj klucz API Groq.',tr:'Groq API anahtarını ekle.',pt:'Adiciona a tua chave API Groq.',ru:'Добавьте API-ключ Groq.',ja:'Groq APIキーを追加してください。',ko:'Groq API 키를 추가하세요.',zh:'请添加 Groq API Key。'};

function removeLightning(){
  var mic=$('micBtn');
  if(!mic)return;
  mic.hidden=true;
  mic.textContent='';
  mic.style.setProperty('display','none','important');
  mic.setAttribute('aria-hidden','true');
  mic.tabIndex=-1;
}

function addVoiceToPlusMenu(){
  var menu=$('attachMenu'),mic=$('micBtn');
  if(!menu||!mic||$('sliqVoiceMenuBtn'))return;
  var b=document.createElement('button');
  b.id='sliqVoiceMenuBtn';
  b.type='button';
  b.textContent=VOICE[lang()]||VOICE.en;
  b.onclick=function(e){
    e.preventDefault();
    e.stopPropagation();
    menu.classList.remove('open');
    try{mic.click()}catch(err){}
    var input=$('messageInput');
    if(input)input.focus();
  };
  menu.appendChild(b);
}

function hasPendingAttachment(){
  var box=$('attachmentChips');
  return !!(box&&box.children&&box.children.length);
}

function syncSendButton(){
  var send=$('sendBtn'),input=$('messageInput');
  if(!send||!input)return;
  if(send.classList.contains('stop')){
    send.disabled=false;
    return;
  }
  send.disabled=!(input.value.trim()||hasPendingAttachment());
}

function enforceEnterToSend(){
  document.addEventListener('keydown',function(e){
    var input=e.target;
    if(!input||input.id!=='messageInput')return;
    if(e.key!=='Enter'||e.shiftKey||e.isComposing)return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    syncSendButton();
    var send=$('sendBtn');
    if(send&&!send.disabled)send.click();
  },true);
  document.addEventListener('input',function(e){
    if(e.target&&e.target.id==='messageInput')setTimeout(syncSendButton,0);
  },true);
}

function ensureScrollableChat(){
  var box=$('messages');
  if(!box)return;
  box.style.minHeight='0';
  box.style.overflowY='auto';
  box.style.overflowX='hidden';
  box.style.webkitOverflowScrolling='touch';
  box.style.touchAction='pan-y';
}

function installAutoScrollSafety(){
  var box=$('messages');
  if(!box||box.dataset.sliqRepairScroll==='17')return;
  box.dataset.sliqRepairScroll='17';
  var nearBottom=true;
  box.addEventListener('scroll',function(){
    nearBottom=(box.scrollHeight-box.scrollTop-box.clientHeight)<180;
  },{passive:true});
  var timer=0;
  new MutationObserver(function(){
    clearTimeout(timer);
    timer=setTimeout(function(){
      syncSendButton();
      if(nearBottom){
        try{box.scrollTo({top:box.scrollHeight,behavior:'auto'})}
        catch(e){box.scrollTop=box.scrollHeight}
      }
    },12);
  }).observe(box,{childList:true,subtree:true,characterData:true});
}

function openKeyPrompt(reason){
  if(getKey()&&reason!=='invalid')return;
  var modal=$('keyModal');
  if(!modal)return;
  var badge=$('apiBadge');
  if(badge&&typeof badge.onclick==='function'){
    try{badge.click()}catch(e){modal.classList.add('open')}
  }else{
    modal.classList.add('open');
  }
  var status=$('keyStatus');
  if(status&&(!status.textContent.trim()||reason==='invalid')){
    status.textContent=KEY_REQUIRED[lang()]||KEY_REQUIRED.en;
  }
  setTimeout(function(){
    var input=$('keyInput');
    if(input){input.focus();if(reason==='invalid')input.select()}
  },40);
}

function installInvalidKeyRecovery(){
  if(window.__SLIQ_FETCH_REPAIR_V17__)return;
  window.__SLIQ_FETCH_REPAIR_V17__=true;
  var original=window.fetch;
  if(typeof original!=='function')return;
  window.fetch=function(){
    var args=arguments;
    return original.apply(this,args).then(function(resp){
      try{
        var url=String(args[0]&&args[0].url||args[0]||'');
        if(resp&&resp.status===401&&url.indexOf('api.groq.com')>=0){
          setTimeout(function(){openKeyPrompt('invalid')},80);
        }
      }catch(e){}
      return resp;
    });
  };
}

function modalEscapeSupport(){
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    var open=document.querySelector('.modalshade.open');
    if(!open)return;
    var cancel=open.querySelector('[id$="Cancel"],#cancelKeyBtn,#memoryClose,#appearanceClose,#usageClose');
    if(cancel)cancel.click();
  });
}

function healthCheck(){
  var required=['newChatBtn','chatSearch','history','messageInput','sendBtn','changeKeyBtn','apiBadge','keyModal','keyInput','saveKeyBtn','messages','attachBtn','modeBtn'];
  var missing=required.filter(function(id){return !$(id)});
  var send=$('sendBtn'),input=$('messageInput'),mic=$('micBtn'),messages=$('messages');
  window.SliqadiusWebHealth={
    version:17,
    ok:missing.length===0&&!!send&&!!input&&typeof send.onclick==='function'&&typeof input.oninput==='function',
    missing:missing,
    sendHandler:!!(send&&typeof send.onclick==='function'),
    inputHandler:!!(input&&typeof input.oninput==='function'),
    enterToSend:true,
    keySaved:!!getKey(),
    keyPromptAvailable:!!($('keyModal')&&$('keyInput')&&$('saveKeyBtn')),
    lightningRemoved:!mic||mic.hidden||getComputedStyle(mic).display==='none',
    scrollable:!!(messages&&getComputedStyle(messages).overflowY!=='hidden'),
    checkedAt:new Date().toISOString()
  };
  return window.SliqadiusWebHealth;
}

function waitForRuntime(attempt){
  removeLightning();
  addVoiceToPlusMenu();
  ensureScrollableChat();
  syncSendButton();
  var send=$('sendBtn'),input=$('messageInput');
  var ready=!!(send&&input&&typeof send.onclick==='function'&&typeof input.oninput==='function');
  if(ready){
    if(!getKey())openKeyPrompt('missing');
    healthCheck();
    return;
  }
  if(attempt<40){
    setTimeout(function(){waitForRuntime(attempt+1)},100);
  }else{
    if(!getKey())openKeyPrompt('missing');
    healthCheck();
  }
}

function syncLanguage(){
  var b=$('sliqVoiceMenuBtn');
  if(b)b.textContent=VOICE[lang()]||VOICE.en;
}

function boot(){
  removeLightning();
  addVoiceToPlusMenu();
  ensureScrollableChat();
  installAutoScrollSafety();
  installInvalidKeyRecovery();
  modalEscapeSupport();
  syncSendButton();
  setTimeout(function(){waitForRuntime(0)},30);
  setTimeout(healthCheck,1600);
  setInterval(function(){
    removeLightning();
    syncLanguage();
    syncSendButton();
  },1500);
}

enforceEnterToSend();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
