(function(){
'use strict';
var L=window.SliqI18nLoader;if(!L)return;
var N={de:'Deutsch',en:'English',fr:'Français',es:'Español',it:'Italiano',nl:'Nederlands',pl:'Polski',tr:'Türkçe',pt:'Português',ru:'Русский',ja:'日本語',ko:'한국어',zh:'中文'};
var active='en',data=null;
function q(id){return document.getElementById(id)}
function savedLang(){try{return L.norm(localStorage.getItem('sliqadius-lang')||navigator.language||'en')}catch(e){return'en'}}
function t(){return data&&data.site||{}}
async function setLangFull(k){
  k=L.norm(k);var d=await L.load(k);active=k;data=d;var x=d.site||{};document.documentElement.lang=k;
  if(q('langBtn'))q('langBtn').textContent=N[k]||N.en;
  document.querySelectorAll('[data-i18n]').forEach(function(el){var key=el.getAttribute('data-i18n');if(x[key]!=null)el.textContent=x[key]});
  try{localStorage.setItem('sliqadius-lang',k);localStorage.setItem('sliq-web-lang',k)}catch(e){}
  if(q('lang'))q('lang').classList.remove('open');updateGoogleButton();
}
window.setLang=function(k){setLangFull(k).catch(function(){})};

var style=document.createElement('style');style.textContent='.sliq-google-home{display:inline-flex;align-items:center;gap:8px}.sliq-google-home svg{width:17px;height:17px}.sliq-login-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,16px);opacity:0;pointer-events:none;z-index:250;max-width:min(560px,calc(100% - 28px));background:#151916;border:1px solid #364039;color:#eef3ef;border-radius:13px;padding:11px 14px;font-size:12px;line-height:1.45;box-shadow:0 22px 70px rgba(0,0,0,.55);transition:.18s}.sliq-login-toast.show{opacity:1;transform:translate(-50%,0)}';document.head.appendChild(style);
function googleSvg(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.34 2.98-7.38Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.39l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.93v-2.6H3.05A10 10 0 0 0 2 12c0 1.61.39 3.13 1.05 4.53l3.34-2.6Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.47l3.34 2.6C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>'}
var toast=document.createElement('div');toast.className='sliq-login-toast';toast.id='sliqLoginToast';document.body.appendChild(toast);
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){toast.classList.remove('show')},4200)}
function setupMessage(){
  var x=t();
  if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')return active==='de'?'Google-Anmeldung benötigt zuerst HTTPS auf sliqado.org.':active==='zh'?'Google 登录需要先为 sliqado.org 启用 HTTPS。':'Google sign-in needs HTTPS on sliqado.org first.';
  return x.googleNeedClient||x.needClient||(active==='de'?'Google-Anmeldung ist noch nicht vollständig eingerichtet. Es fehlt die einmalige Web-OAuth-Client-ID für sliqado.org.':'Google sign-in is not fully configured yet. The one-time Web OAuth Client ID for sliqado.org is still missing.');
}
var hero=document.querySelector('.heroactions');if(hero){var btn=document.createElement('button');btn.type='button';btn.className='action sliq-google-home';btn.id='sliqGoogleHomeBtn';btn.onclick=directGoogleLogin;hero.appendChild(btn)}
function updateGoogleButton(){var x=t(),p=window.SliqGoogle&&SliqGoogle.getProfile(),b=q('sliqGoogleHomeBtn');if(!b)return;b.innerHTML=googleSvg()+'<span></span>';b.querySelector('span').textContent=p?(x.googleConnected||'Google connected'):(x.google||'Sign in with Google')}
async function directGoogleLogin(){
  var x=t();
  if(window.SliqGoogle&&SliqGoogle.getProfile()){location.href='web.html#google';return}
  try{
    if(!window.SliqGoogle)throw new Error('NO_HELPER');
    if(!SliqGoogle.getClientId()){showToast(setupMessage());return}
    if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'){showToast(setupMessage());return}
    showToast(x.signing||'Google…');
    await SliqGoogle.signIn({selectAccount:true});
    updateGoogleButton();
    location.href='web.html#google';
  }catch(e){
    console.error(e);showToast(x.failed||'Google sign-in failed.');
  }
}
window.addEventListener('sliq-google-profile',updateGoogleButton);
setLangFull(savedLang()).catch(function(){setLangFull('en')});
})();
