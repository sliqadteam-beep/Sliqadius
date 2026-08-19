(function(){
'use strict';

if(window.__SLIQ_WEB_BOOTSTRAP_V19__)return;
window.__SLIQ_WEB_BOOTSTRAP_V19__=true;

const $=id=>document.getElementById(id);
let dismissedThisPage=false;

function getKey(){try{return localStorage.getItem('sliq-web-key')||''}catch(e){return''}}
function setKey(v){try{localStorage.setItem('sliq-web-key',v);return true}catch(e){return false}}
function language(){try{return String(localStorage.getItem('sliq-web-lang')||navigator.language||'de').slice(0,2).toLowerCase()}catch(e){return'de'}}

const REQUIRED={de:'Bitte füge deinen Groq API-Key ein.',en:'Please add your Groq API key.',fr:'Ajoutez votre clé API Groq.',es:'Añade tu clave API de Groq.',it:'Aggiungi la tua chiave API Groq.',nl:'Voeg je Groq API-key toe.',pl:'Dodaj klucz API Groq.',tr:'Groq API anahtarını ekle.',pt:'Adiciona a tua chave API Groq.',ru:'Добавьте API-ключ Groq.',ja:'Groq APIキーを追加してください。',ko:'Groq API 키를 추가하세요.',zh:'请添加 Groq API Key。'};
const INVALID={de:'Bitte gib einen gültigen Groq API-Key ein.',en:'Please enter a valid Groq API key.'};
const VOICE={de:'🎤 Spracheingabe',en:'🎤 Voice input',fr:'🎤 Saisie vocale',es:'🎤 Entrada de voz',it:'🎤 Input vocale',nl:'🎤 Spraakinvoer',pl:'🎤 Wprowadzanie głosowe',tr:'🎤 Sesli giriş',pt:'🎤 Entrada de voz',ru:'🎤 Голосовой ввод',ja:'🎤 音声入力',ko:'🎤 음성 입력',zh:'🎤 语音输入'};

function validKey(v){return /^gsk_\S{10,}$/.test(String(v||'').trim())}
function status(text){const s=$('keyStatus');if(s)s.textContent=text||''}
function setModal(open){const m=$('keyModal');if(m)m.classList.toggle('open',!!open)}
function focusKey(select){const i=$('keyInput');if(!i)return;requestAnimationFrame(()=>{i.focus();if(select)i.select()})}

function openKey(reason){
  if(reason==='missing'&&getKey())return;
  const modal=$('keyModal'),input=$('keyInput');if(!modal||!input)return;
  dismissedThisPage=false;
  if(reason==='change')input.value=getKey();
  else if(!input.value)input.value=getKey();
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

function bindKeyUi(){
  const modal=$('keyModal'),cancel=$('cancelKeyBtn'),save=$('saveKeyBtn'),input=$('keyInput');
  if(!modal||!cancel||!save||!input)return false;
  if(modal.dataset.sliqV19Bound==='1')return true;
  modal.dataset.sliqV19Bound='1';

  cancel.addEventListener('click',()=>closeKey(),true);

  save.addEventListener('click',function(e){
    const v=input.value.trim();
    if(!validKey(v)){
      e.preventDefault();
      e.stopImmediatePropagation();
      status(INVALID[language()]||INVALID.en);
      focusKey(true);
      return;
    }
    if(!setKey(v)){
      e.preventDefault();
      e.stopImmediatePropagation();
      status('API-Key konnte nicht lokal gespeichert werden.');
      return;
    }
    dismissedThisPage=true;
    setModal(false);
    status('');
  },true);

  input.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){
      e.preventDefault();
      e.stopPropagation();
      save.click();
    }else if(e.key==='Escape'){
      e.preventDefault();
      e.stopPropagation();
      cancel.click();
    }
  },true);

  const change=$('changeKeyBtn');if(change)change.addEventListener('click',()=>openKey('change'),true);
  const badge=$('apiBadge');if(badge)badge.addEventListener('click',()=>openKey('change'),true);
  return true;
}

function hideLightning(){
  const mic=$('micBtn');if(!mic)return;
  mic.hidden=true;mic.setAttribute('aria-hidden','true');mic.tabIndex=-1;mic.style.setProperty('display','none','important');
}

function addVoiceToPlusMenu(){
  const menu=$('attachMenu'),mic=$('micBtn');if(!menu||!mic)return;
  let b=$('sliqVoiceMenuBtn');
  if(!b){
    b=document.createElement('button');b.id='sliqVoiceMenuBtn';b.type='button';
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();menu.classList.remove('open');try{mic.click()}catch(err){}const input=$('messageInput');if(input)input.focus()});
    menu.appendChild(b);
  }
  b.textContent=VOICE[language()]||VOICE.en;
}

function install401Recovery(){
  if(window.__SLIQ_FETCH_V19__)return;
  const original=window.fetch;if(typeof original!=='function')return;
  window.__SLIQ_FETCH_V19__=true;
  window.fetch=function(){const args=arguments;return original.apply(this,args).then(resp=>{try{const url=String(args[0]&&args[0].url||args[0]||'');if(resp&&resp.status===401&&url.includes('api.groq.com'))queueMicrotask(()=>openKey('invalid'))}catch(e){}return resp})};
}

function autoPrompt(){if(!getKey()&&!dismissedThisPage)openKey('missing')}
function health(){
  const required=['messageInput','sendBtn','keyModal','keyInput','cancelKeyBtn','saveKeyBtn','changeKeyBtn','apiBadge'];
  const missing=required.filter(id=>!$(id));
  window.SliqadiusWebHealth={version:19,missing,keySaved:!!getKey(),keyModalBound:!!($('keyModal')&&$('keyModal').dataset.sliqV19Bound==='1'),mainRuntimeReady:!!($('sendBtn')&&typeof $('sendBtn').onclick==='function'),voiceMenuReady:!!$('sliqVoiceMenuBtn'),lightningRemoved:!$('micBtn')||$('micBtn').hidden||getComputedStyle($('micBtn')).display==='none',ok:missing.length===0,checkedAt:new Date().toISOString()};
}

function boot(){hideLightning();bindKeyUi();addVoiceToPlusMenu();install401Recovery();autoPrompt();health()}

/* web.html loads this after the DOM, so bind immediately. Never intercept message Enter here. */
boot();
})();
