(function(global){
'use strict';

const K_CLIENT='sliq-google-client-id';
const K_PROFILE='sliq-google-profile';
const K_TOKEN='sliq-google-token';
const K_TOKEN_EXP='sliq-google-token-exp';
const K_SCOPE='sliq-google-scope';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const SCOPES='openid email profile '+DRIVE_SCOPE;
const FILE_NAME='sliqadius-web-sync.json';
const CONFIG_URL='google-config.js?v=12';

function safeGet(k,session){try{return(session?sessionStorage:localStorage).getItem(k)||''}catch(e){return''}}
function safeSet(k,v,session){try{(session?sessionStorage:localStorage).setItem(k,v);return true}catch(e){return false}}
function safeRemove(k,session){try{(session?sessionStorage:localStorage).removeItem(k)}catch(e){}}
function publicClientId(){return String(global.SLIQADIUS_GOOGLE_CLIENT_ID||'').trim()}
function getClientId(){return publicClientId()||safeGet(K_CLIENT,false)}
function setClientId(v){v=String(v||'').trim();if(v&&!/^[0-9A-Za-z._-]+\.apps\.googleusercontent\.com$/.test(v))throw new Error('INVALID_CLIENT_ID');if(v)safeSet(K_CLIENT,v,false);else safeRemove(K_CLIENT,false);return v}
function getProfile(){try{return JSON.parse(safeGet(K_PROFILE,false)||'null')}catch(e){return null}}
function saveProfile(p){if(p)safeSet(K_PROFILE,JSON.stringify(p),false);else safeRemove(K_PROFILE,false);try{global.dispatchEvent(new CustomEvent('sliq-google-profile',{detail:p||null}))}catch(e){}}
function getToken(){const t=safeGet(K_TOKEN,true),exp=Number(safeGet(K_TOKEN_EXP,true)||0);return t&&exp>Date.now()+30000?t:''}
function grantedScopes(){return safeGet(K_SCOPE,true).split(/\s+/).filter(Boolean)}
function hasDriveScope(){return grantedScopes().indexOf(DRIVE_SCOPE)>=0}
function storeToken(t,expiresIn,scopeText){safeSet(K_TOKEN,t,true);safeSet(K_TOKEN_EXP,String(Date.now()+Math.max(60,Number(expiresIn||3600)-30)*1000),true);safeSet(K_SCOPE,String(scopeText||SCOPES),true)}
function secureEnough(){return global.isSecureContext||location.hostname==='localhost'||location.hostname==='127.0.0.1'}

if(!document.querySelector('meta[name="referrer"]')){const m=document.createElement('meta');m.name='referrer';m.content='strict-origin-when-cross-origin';document.head.appendChild(m)}

let configPromise=null;
function loadConfig(){
  if(publicClientId())return Promise.resolve(publicClientId());
  if(configPromise)return configPromise;
  configPromise=new Promise(resolve=>{
    const existing=document.querySelector('script[data-sliq-google-config]');
    if(existing){if(publicClientId()){resolve(publicClientId());return}existing.addEventListener('load',()=>resolve(getClientId()),{once:true});existing.addEventListener('error',()=>resolve(getClientId()),{once:true});setTimeout(()=>resolve(getClientId()),1500);return}
    const s=document.createElement('script');s.src=CONFIG_URL;s.async=false;s.dataset.sliqGoogleConfig='1';s.onload=()=>resolve(getClientId());s.onerror=()=>resolve(getClientId());document.head.appendChild(s)
  });
  return configPromise
}

let loadPromise=null;
async function load(){
  await loadConfig();
  if(global.google&&global.google.accounts)return;
  if(loadPromise)return loadPromise;
  loadPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-sliq-google]');
    if(existing){if(global.google&&global.google.accounts){resolve();return}existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',()=>reject(new Error('GOOGLE_LOAD_FAILED')),{once:true});setTimeout(()=>{if(global.google&&global.google.accounts)resolve();else reject(new Error('GOOGLE_LOAD_TIMEOUT'))},12000);return}
    const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;s.referrerPolicy='strict-origin-when-cross-origin';s.dataset.sliqGoogle='1';s.onload=resolve;s.onerror=()=>reject(new Error('GOOGLE_LOAD_FAILED'));document.head.appendChild(s)
  });
  return loadPromise
}

async function userInfo(token){const r=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(!r.ok)throw new Error('GOOGLE_USERINFO_'+r.status);const p=await r.json();return{sub:p.sub||'',name:p.name||p.email||'Google',email:p.email||'',picture:p.picture||''}}

async function signIn(options){
  options=options||{};await loadConfig();const clientId=getClientId();
  if(!clientId){const e=new Error('NO_CLIENT_ID');e.code='NO_CLIENT_ID';throw e}
  if(!secureEnough()){const e=new Error('HTTPS_REQUIRED');e.code='HTTPS_REQUIRED';throw e}
  await load();
  return new Promise((resolve,reject)=>{
    let settled=false,timer=null;const fail=err=>{if(settled)return;settled=true;if(timer)clearTimeout(timer);reject(err)};
    const client=global.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:SCOPES,include_granted_scopes:true,prompt:'select_account',callback:async resp=>{if(settled)return;if(!resp||resp.error){fail(new Error(resp&&resp.error||'GOOGLE_AUTH_FAILED'));return}try{storeToken(resp.access_token,resp.expires_in,resp.scope||SCOPES);const p=await userInfo(resp.access_token);saveProfile(p);settled=true;if(timer)clearTimeout(timer);resolve(p)}catch(e){fail(e)}},error_callback:err=>fail(new Error(err&&err.type||'GOOGLE_POPUP_FAILED'))});
    try{client.requestAccessToken({prompt:options.prompt||'select_account'});timer=setTimeout(()=>fail(new Error('GOOGLE_POPUP_TIMEOUT')),120000)}catch(e){fail(e)}
  })
}

function signOut(){const token=getToken();if(token&&global.google&&global.google.accounts&&global.google.accounts.oauth2){try{global.google.accounts.oauth2.revoke(token,()=>{})}catch(e){}}safeRemove(K_TOKEN,true);safeRemove(K_TOKEN_EXP,true);safeRemove(K_SCOPE,true);saveProfile(null)}

async function driveFetch(url,opts){const token=getToken();if(!token){const e=new Error('GOOGLE_TOKEN_REQUIRED');e.code='GOOGLE_TOKEN_REQUIRED';throw e}if(!hasDriveScope()){const e=new Error('GOOGLE_DRIVE_SCOPE_REQUIRED');e.code='GOOGLE_DRIVE_SCOPE_REQUIRED';throw e}opts=opts||{};opts.headers=Object.assign({},opts.headers||{},{Authorization:'Bearer '+token});opts.cache='no-store';const r=await fetch(url,opts);if(r.status===401){safeRemove(K_TOKEN,true);safeRemove(K_TOKEN_EXP,true);safeRemove(K_SCOPE,true)}return r}
async function findFile(){const q=encodeURIComponent("name='"+FILE_NAME.replace(/'/g,"\\'")+"' and trashed=false");const r=await driveFetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=10&fields=files(id,name,modifiedTime)&q='+q);if(!r.ok)throw new Error('DRIVE_LIST_'+r.status);const j=await r.json();return j.files&&j.files[0]||null}
async function readAppData(){const f=await findFile();if(!f)return null;const r=await driveFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media');if(!r.ok)throw new Error('DRIVE_READ_'+r.status);try{return await r.json()}catch(e){throw new Error('DRIVE_BAD_JSON')}}
function multipartBody(meta,data,boundary){return'--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(data)+'\r\n--'+boundary+'--'}
async function writeAppData(data){const existing=await findFile(),boundary='sliq_'+Math.random().toString(36).slice(2)+Date.now().toString(36),meta=existing?{name:FILE_NAME}:{name:FILE_NAME,parents:['appDataFolder']},url=existing?'https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(existing.id)+'?uploadType=multipart':'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';const r=await driveFetch(url,{method:existing?'PATCH':'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:multipartBody(meta,data,boundary)});if(!r.ok){let t='';try{t=await r.text()}catch(e){}throw new Error('DRIVE_WRITE_'+r.status+' '+t.slice(0,200))}return await r.json()}

let toastEl=null;
function toast(msg){if(!toastEl){toastEl=document.createElement('div');toastEl.style.cssText='position:fixed;left:50%;bottom:28px;transform:translate(-50%,14px);opacity:0;z-index:9999;max-width:min(560px,calc(100% - 28px));padding:11px 14px;border-radius:13px;background:#171b18;border:1px solid #3a443c;color:#eef2ee;font:12px/1.45 system-ui;box-shadow:0 22px 70px rgba(0,0,0,.55);transition:.18s;pointer-events:none';document.body.appendChild(toastEl)}toastEl.textContent=msg;toastEl.style.opacity='1';toastEl.style.transform='translate(-50%,0)';clearTimeout(toastEl._t);toastEl._t=setTimeout(()=>{toastEl.style.opacity='0';toastEl.style.transform='translate(-50%,14px)'},4200)}
function langCode(){try{return String(localStorage.getItem('sliq-web-lang')||localStorage.getItem('sliqadius-lang')||navigator.language||'en').slice(0,2).toLowerCase()}catch(e){return'en'}}
function setupMessage(code){const de=langCode()==='de';if(code.indexOf('HTTPS_REQUIRED')>=0)return de?'Google-Anmeldung braucht HTTPS. Aktiviere zuerst „Enforce HTTPS“ für sliqado.org.':'Google sign-in requires HTTPS first.';if(code.indexOf('NO_CLIENT_ID')>=0)return de?'Google-Anmeldung ist fast fertig. Die Google Web-Client-ID muss noch einmalig für sliqado.org eingetragen werden.':'Google sign-in is almost ready. The Google Web Client ID still needs to be configured once.';if(code.indexOf('GOOGLE_DRIVE_SCOPE_REQUIRED')>=0)return de?'Für die Chat-Synchronisierung muss der Zugriff auf die privaten Sliqadius-App-Daten in Google Drive erlaubt werden.':'Google Drive app-data access is required for chat sync.';return de?'Google-Anmeldung konnte nicht geöffnet werden. Bitte Pop-ups erlauben und erneut versuchen.':'Google sign-in could not open. Allow pop-ups and try again.'}

function hideTechnicalOAuthUi(){const input=document.getElementById('sliqGClient');if(input){input.value=getClientId()||'';input.style.display='none'}const setup=document.getElementById('sliqGSetup');if(setup){const p=setup.closest('p');if(p)p.style.display='none';else setup.style.display='none'}}
function injectLegalLinks(){const footer=document.querySelector('.footerin');if(footer&&!document.getElementById('sliqPrivacyFooter')){const p=document.createElement('a');p.id='sliqPrivacyFooter';p.href='privacy.html';p.textContent='Datenschutz / Privacy';const t=document.createElement('a');t.id='sliqTermsFooter';t.href='terms.html';t.textContent='Nutzungsbedingungen / Terms';footer.appendChild(p);footer.appendChild(t)}const side=document.querySelector('.sidefoot');if(side&&!document.getElementById('sliqPrivacySide')){const p=document.createElement('a');p.id='sliqPrivacySide';p.className='sbtn';p.href='privacy.html';p.textContent='Datenschutz / Privacy';const t=document.createElement('a');t.id='sliqTermsSide';t.className='sbtn';t.href='terms.html';t.textContent='Nutzungsbedingungen / Terms';side.appendChild(p);side.appendChild(t)}}
function maintainUi(){hideTechnicalOAuthUi();injectLegalLinks()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',maintainUi);else maintainUi();new MutationObserver(maintainUi).observe(document.documentElement,{childList:true,subtree:true});

function installDirectFlow(){document.addEventListener('click',async function(e){const btn=e.target&&e.target.closest?e.target.closest('#sliqGoogleHomeBtn,#sliqGoogleBtn'):null;if(!btn||getProfile())return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(btn.dataset.sliqGoogleBusy==='1')return;btn.dataset.sliqGoogleBusy='1';btn.setAttribute('aria-busy','true');try{await loadConfig();if(!getClientId())throw new Error('NO_CLIENT_ID');if(!secureEnough())throw new Error('HTTPS_REQUIRED');await signIn({prompt:'select_account'});try{global.dispatchEvent(new CustomEvent('sliq-google-direct-signin'))}catch(_e){}if(btn.id==='sliqGoogleHomeBtn'){location.href='web.html#google'}else{setTimeout(()=>{try{btn.click()}catch(_e){}},80);setTimeout(()=>{const s=document.getElementById('sliqGSync');if(s&&s.offsetParent!==null)s.click()},350)}}catch(err){console.error('Sliqadius Google sign-in:',err);toast(setupMessage(String(err&&err.message||err)))}finally{btn.dataset.sliqGoogleBusy='0';btn.removeAttribute('aria-busy')}},true)}
installDirectFlow();loadConfig().then(maintainUi).catch(()=>{});

global.SliqGoogle={getClientId,setClientId,getProfile,getToken,grantedScopes,hasDriveScope,loadConfig,load,signIn,signOut,readAppData,writeAppData,isReady:function(){return!!getClientId()},hasSession:function(){return!!getToken()}};
})(window);
