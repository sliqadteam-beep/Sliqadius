(function(){
'use strict';
var L=window.SliqI18nLoader;if(!L)return;var active='en',data=null;
function $(id){return document.getElementById(id)}
function getLang(){try{return L.norm(localStorage.getItem('sliq-web-lang')||localStorage.getItem('sliqadius-lang')||navigator.language||'en')}catch(e){return'en'}}
function tr(){return data&&data.web||{}}
function setText(id,v){var e=$(id);if(e&&v!=null&&e.textContent!==String(v))e.textContent=v}
async function loadLang(code){active=L.norm(code);data=await L.load(active);applyFullTranslation()}
function removeLegacyGoogleUi(){
  ['sliqGoogleBtn','sliqGoogleShade','sliqGoogleWarn','sliqLoginToast','sliqGoogleHomeBtn'].forEach(function(id){var e=$(id);if(e)e.remove()});
  document.querySelectorAll('.sliq-gbtn,.sliq-gshade,.sliq-google-warn,.sliq-login-toast,.sliq-google-home').forEach(function(e){e.remove()});
}
function injectLegalLinks(){
  var side=document.querySelector('.sidefoot');if(!side)return;
  if(!$('sliqPrivacySide')){var p=document.createElement('a');p.id='sliqPrivacySide';p.className='sbtn';p.href='privacy.html';p.textContent='Datenschutz / Privacy';side.appendChild(p)}
  if(!$('sliqTermsSide')){var t=document.createElement('a');t.id='sliqTermsSide';t.className='sbtn';t.href='terms.html';t.textContent='Nutzungsbedingungen / Terms';side.appendChild(t)}
}
function applyFullTranslation(){
  if(!data)return;var t=tr();document.documentElement.lang=active;
  setText('newChatBtn',t.newChat);setText('changeKeyBtn',t.changeKey);if($('messageInput'))$('messageInput').placeholder=t.placeholder||'';setText('langLabel',t.language);setText('installLink',t.install);setText('backLink',t.back);setText('note',t.note);setText('keyText',t.keyText);setText('keyHint',t.keyHint);setText('cancelKeyBtn',t.cancel);setText('saveKeyBtn',t.save);setText('getKeyLink',t.getKey);setText('exportBtn',t.backup);setText('importBtn',t.restore);setText('saveHint',t.saved);setText('renameTitle',t.renameTitle);setText('renameCancel',t.cancel);setText('renameSave',t.save);
  var mode='medium';try{mode=localStorage.getItem('sliq-web-mode')||'medium'}catch(e){}setText('modeBtn',(mode==='fast'?t.fast:mode==='smart'?t.smart:t.medium)+'⌄');var mb=$('modeMenu')&&$('modeMenu').querySelectorAll('[data-mode]');if(mb&&mb.length>=3){mb[0].textContent=t.fast;mb[1].textContent=t.medium;mb[2].textContent=t.smart}
  var key='';try{key=localStorage.getItem('sliq-web-key')||''}catch(e){}setText('apiBadge',key?t.apiReady:t.apiMissing);
  document.querySelectorAll('.chattools .iconbtn').forEach(function(b){b.title=b.textContent==='×'?(t.del||'Delete'):(t.rename||'Rename')});document.querySelectorAll('.msgtools button').forEach(function(b){b.textContent=t.copy||'Copy'});
  var empty=$('messages')&&$('messages').querySelector('.empty');if(empty){var h=empty.querySelector('h1'),p=empty.querySelector('p'),ss=empty.querySelectorAll('.suggestion');if(h)h.textContent=t.welcome||'';if(p)p.textContent=t.hint||'';if(ss[0])ss[0].textContent=t.suggest1||'';if(ss[1])ss[1].textContent=t.suggest2||'';if(ss[2])ss[2].textContent=t.suggest3||''}
  if($('sliqSearchInput'))$('sliqSearchInput').placeholder=t.search||'Search chats';
  removeLegacyGoogleUi();injectLegalLinks();
}
var css=document.createElement('style');css.textContent='.sliq-search{padding:0 2px 4px}.sliq-search input{width:100%;background:#141815;color:#e9ede9;border:1px solid #283029;border-radius:10px;padding:9px 10px;outline:0;font-size:12px}.sliq-search input:focus{border-color:#465249}';document.head.appendChild(css);
var history=$('history');if(history&&history.parentNode&&!$('sliqSearchInput')){var sw=document.createElement('div');sw.className='sliq-search';sw.innerHTML='<input id="sliqSearchInput" type="search" autocomplete="off">';history.parentNode.insertBefore(sw,history);$('sliqSearchInput').oninput=function(){var q=this.value.trim().toLowerCase();document.querySelectorAll('.chatrow').forEach(function(r){var b=r.querySelector('.chat'),txt=(b&&b.textContent||'').toLowerCase();r.style.display=!q||txt.indexOf(q)>=0?'':'none'})}}
['langSide','langTop'].forEach(function(id){var s=$(id);if(s)s.addEventListener('change',function(){var code=this.value;setTimeout(function(){loadLang(code)},0)})});
var obs=new MutationObserver(function(){clearTimeout(obs._t);obs._t=setTimeout(function(){removeLegacyGoogleUi();applyFullTranslation()},20)});if($('messages'))obs.observe($('messages'),{childList:true,subtree:true});if($('history'))obs.observe($('history'),{childList:true,subtree:true});obs.observe(document.documentElement,{childList:true,subtree:true});
removeLegacyGoogleUi();injectLegalLinks();loadLang(getLang()).catch(function(){});
})();
