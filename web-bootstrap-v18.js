(function(){
'use strict';

if(window.__SLIQ_WEB_BOOTSTRAP_V18__)return;
window.__SLIQ_WEB_BOOTSTRAP_V18__=true;

const $=id=>document.getElementById(id);
let dismissedThisPage=false;
let reloadScheduled=false;

function getKey(){try{return localStorage.getItem('sliq-web-key')||''}catch(e){return''}}
function setKey(v){try{localStorage.setItem('sliq-web-key',v);return true}catch(e){return false}}
function language(){try{return String(localStorage.getItem('sliq-web-lang')||navigator.language||'de').slice(0,2).toLowerCase()}catch(e){return'de'}}

const REQUIRED={
  de:'Bitte füge deinen Groq API-Key ein.',en:'Please add your Groq API key.',fr:'Ajoutez votre clé API Groq.',es:'Añade tu clave API de Groq.',it:'Aggiungi la tua chiave API Groq.',nl:'Voeg je Groq API-key toe.',pl:'Dodaj klucz API Groq.',tr:'Groq API anahtarını ekle.',pt:'Adiciona a tua chave API Groq.',ru:'Добавьте API-ключ Groq.',ja:'Groq APIキーを追加してください。',ko:'Groq API 키를 추가하세요.',zh:'请添加 Groq API Key。'
};
const INVALID={de:'Bitte gib einen gültigen Groq API-Key ein.',en:'Please enter a valid Groq API key.'};
const VOICE={de:'🎤 Spracheingabe',en:'🎤 Voice input',fr:'🎤 Saisie vocale',es:'🎤 Entrada de voz',it:'🎤 Input vocale',nl:'🎤 Spraakinvoer',pl:'🎤 Wprowadzanie głosowe',tr:'🎤 Sesli giriş',pt:'🎤 Entrada de voz',ru:'🎤 Голосовой ввод',ja:'🎤 音声入力',ko:'🎤 음성 입력',zh:'🎤 语音输入'};

function validKey(v){return /^gsk_\S{10,}$/.test(String(v||'').trim())}
function setModal(open){const m=$('keyModal');if(!m)return;m.classList.toggle('open',!!open)}
function status(text){const s=$('keyStatus');if(s)s.textContent=text||''}
function focusKey(select){setTimeout(()=>{const i=$('keyInput');if(i){i.focus();if(select)i.select()}},30)}

function openKey(reason){
  const m=$('keyModal');if(!m)return;
  if(reason==='missing'&&getKey())return;
  dismissedThisPage=false;
  const i=$('keyInput');
  if(i){
    if(reason==='change')i.value=getKey();
    else if(!i.value)i.value=getKey();
  }
  setModal(true);
  status(reason==='invalid'?(INVALID[language()]||INVALID.en):(reason==='missing'?(REQUIRED[language()]||REQUIRED.en):''));
  focusKey(reason==='invalid'||reason==='change');
}

function closeKey(){
  dismissedThisPage=true;
  setModal(false);
  status('');
  const input=$('messageInput');if(input)input.focus();
}

function fallbackSave(){
  const input=$('keyInput');if(!input)return false;
  const v=input.value.trim();
  if(!validKey(v)){status(INVALID[language()]||INVALID.en);focusKey(true);return false}
  if(!setKey(v)){status('API-Key konnte nicht lokal gespeichert werden.');return false}
  dismissedThisPage=true;
  setModal(false);
  status('');
  return true;
}

function scheduleReloadIfRuntimeMissing(){
  if(reloadScheduled)return;
  reloadScheduled=true;
  setTimeout(()=>{
    reloadScheduled=false;
    const save=$('saveKeyBtn');
    const runtimeReady=!!(save&&typeof save.onclick==='function'&&$('sendBtn')&&typeof $('sendBtn').onclick==='function');
    if(!runtimeReady&&getKey())location.reload();
  },350);
}

function bindKeyUi(){
  const modal=$('keyModal'),cancel=$('cancelKeyBtn'),save=$('saveKeyBtn'),input=$('keyInput');
  if(!modal||!cancel||!save||!input)return false;
  if(modal.dataset.sliqV18Bound==='1')return true;
  modal.dataset.sliqV18Bound='1';

  cancel.addEventListener('click',function(){closeKey()},true);

  save.addEventListener('click',function(e){
    const v=input.value.trim();
    if(!validKey(v)){
      e.preventDefault();
      e.stopImmediatePropagation();
      status(INVALID[language()]||INVALID.en);
      focusKey(true);
      return;
    }
    setKey(v);
    const runtimeHandler=typeof save.onclick==='function';
    const mainRegexCompatible=/^gsk_[A-Za-z0-9_-]{12,}$/.test(v);
    if(!runtimeHandler||!mainRegexCompatible){
      e.preventDefault();
      e.stopImmediatePropagation();
      fallbackSave();
      scheduleReloadIfRuntimeMissing();
    }else{
      setTimeout(()=>{
        if(modal.classList.contains('open')&&getKey()===v){
          fallbackSave();
          scheduleReloadIfRuntimeMissing();
        }
      },500);
    }
  },true);

  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){
      e.preventDefault();
      e.stopImmediatePropagation();
      save.click();
    }else if(e.key==='Escape'){
      e.preventDefault();
      e.stopImmediatePropagation();
      cancel.click();
    }
  },true);

  const change=$('changeKeyBtn');if(change)change.addEventListener('click',()=>openKey('change'));
  const badge=$('apiBadge');if(badge)badge.addEventListener('click',()=>openKey('change'));
  return true;
}

function hideLightning(){
  const mic=$('micBtn');if(!mic)return;
  mic.hidden=true;
  mic.setAttribute('aria-hidden','true');
  mic.tabIndex=-1;
  mic.style.setProperty('display','none','important');
}

function addVoiceToPlusMenu(){
  const menu=$('attachMenu'),mic=$('micBtn');
  if(!menu||!mic)return;
  let b=$('sliqVoiceMenuBtn');
  if(!b){
    b=document.createElement('button');
    b.id='sliqVoiceMenuBtn';
    b.type='button';
    b.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      menu.classList.remove('open');
      try{mic.click()}catch(err){}
      const input=$('messageInput');if(input)input.focus();
    });
    menu.appendChild(b);
  }
  b.textContent=VOICE[language()]||VOICE.en;
}

function enterToSend(){
  document.addEventListener('keydown',function(e){
    if(!e.target||e.target.id!=='messageInput')return;
    if(e.key!=='Enter'||e.shiftKey||e.isComposing)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const send=$('sendBtn');
    const input=$('messageInput');
    if(send&&send.disabled&&input&&input.value.trim())send.disabled=false;
    if(send&&!send.disabled)send.click();
  },true);
}

function install401Recovery(){
  if(window.__SLIQ_FETCH_V18__)return;
  window.__SLIQ_FETCH_V18__=true;
  const original=window.fetch;
  if(typeof original!=='function')return;
  window.fetch=function(){
    const args=arguments;
    return original.apply(this,args).then(resp=>{
      try{
        const url=String(args[0]&&args[0].url||args[0]||'');
        if(resp&&resp.status===401&&url.includes('api.groq.com'))setTimeout(()=>openKey('invalid'),60);
      }catch(e){}
      return resp;
    });
  };
}

function health(){
  const required=['newChatBtn','chatSearch','history','messageInput','sendBtn','changeKeyBtn','apiBadge','keyModal','keyInput','cancelKeyBtn','saveKeyBtn','messages','attachBtn','modeBtn'];
  const missing=required.filter(id=>!$(id));
  const keyModalBound=!!($('keyModal')&&$('keyModal').dataset.sliqV18Bound==='1');
  const mainRuntimeReady=!!($('sendBtn')&&typeof $('sendBtn').onclick==='function');
  window.SliqadiusWebHealth={
    version:18,
    missing,
    keySaved:!!getKey(),
    keyModalBound,
    cancelBound:keyModalBound&&!!$('cancelKeyBtn'),
    saveBound:keyModalBound&&!!$('saveKeyBtn'),
    mainRuntimeReady,
    enterToSend:true,
    voiceMenuReady:!!$('sliqVoiceMenuBtn'),
    lightningRemoved:!$('micBtn')||$('micBtn').hidden||getComputedStyle($('micBtn')).display==='none',
    ok:missing.length===0&&keyModalBound,
    checkedAt:new Date().toISOString()
  };
  return window.SliqadiusWebHealth;
}

function autoPrompt(){if(!getKey()&&!dismissedThisPage)openKey('missing')}

function boot(){
  hideLightning();
  bindKeyUi();
  addVoiceToPlusMenu();
  install401Recovery();
  autoPrompt();
  [120,400,900,1800].forEach(ms=>setTimeout(()=>{hideLightning();bindKeyUi();addVoiceToPlusMenu();autoPrompt();health()},ms));
}

enterToSend();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
