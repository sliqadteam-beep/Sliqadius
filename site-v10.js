(function(){
'use strict';
var L=window.SliqI18nLoader;if(!L)return;
var N={de:'Deutsch',en:'English',fr:'Français',es:'Español',it:'Italiano',nl:'Nederlands',pl:'Polski',tr:'Türkçe',pt:'Português',ru:'Русский',ja:'日本語',ko:'한국어',zh:'中文'};
function q(id){return document.getElementById(id)}
function savedLang(){try{return L.norm(localStorage.getItem('sliqadius-lang')||navigator.language||'en')}catch(e){return'en'}}
async function setLangFull(k){
  k=L.norm(k);var d=await L.load(k),x=d.site||{};
  document.documentElement.lang=k;
  if(q('langBtn'))q('langBtn').textContent=N[k]||N.en;
  document.querySelectorAll('[data-i18n]').forEach(function(el){var key=el.getAttribute('data-i18n');if(x[key]!=null)el.textContent=x[key]});
  try{localStorage.setItem('sliqadius-lang',k);localStorage.setItem('sliq-web-lang',k)}catch(e){}
  if(q('lang'))q('lang').classList.remove('open');
}
window.setLang=function(k){setLangFull(k).catch(function(){})};
function removeLegacyGoogleUi(){
  ['sliqGoogleHomeBtn','sliqGoogleShade','sliqLoginToast'].forEach(function(id){var e=q(id);if(e)e.remove()});
  document.querySelectorAll('.sliq-google-home,.sliq-gshade,.sliq-login-toast').forEach(function(e){e.remove()});
}
removeLegacyGoogleUi();
new MutationObserver(removeLegacyGoogleUi).observe(document.documentElement,{childList:true,subtree:true});
setLangFull(savedLang()).catch(function(){setLangFull('en')});
})();
