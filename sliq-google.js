(function(global){
'use strict';

// Public OAuth client id for Sliqadius. Once configured here (or through
// window.SLIQADIUS_GOOGLE_CLIENT_ID), every visitor gets the normal Google
// account chooser directly, without having to understand OAuth settings.
const DEFAULT_CLIENT_ID = String(global.SLIQADIUS_GOOGLE_CLIENT_ID || '').trim();
const K_CLIENT='sliq-google-client-id';
const K_PROFILE='sliq-google-profile';
const K_TOKEN='sliq-google-token';
const K_TOKEN_EXP='sliq-google-token-exp';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const SCOPES='openid email profile '+DRIVE_SCOPE;
const FILE_NAME='sliqadius-web-sync.json';

function safeGet(k,session){try{return (session?sessionStorage:localStorage).getItem(k)||''}catch(e){return ''}}
function safeSet(k,v,session){try{(session?sessionStorage:localStorage).setItem(k,v);return true}catch(e){return false}}
function safeRemove(k,session){try{(session?sessionStorage:localStorage).removeItem(k)}catch(e){}}
function getClientId(){return DEFAULT_CLIENT_ID||safeGet(K_CLIENT,false)}
function setClientId(v){
  v=String(v||'').trim();
  if(v&&!/^[0-9A-Za-z._-]+\.apps\.googleusercontent\.com$/.test(v))throw new Error('INVALID_CLIENT_ID');
  if(v)safeSet(K_CLIENT,v,false);else safeRemove(K_CLIENT,false);
  return v;
}
function getProfile(){try{return JSON.parse(safeGet(K_PROFILE,false)||'null')}catch(e){return null}}
function saveProfile(p){
  if(p)safeSet(K_PROFILE,JSON.stringify(p),false);else safeRemove(K_PROFILE,false);
  try{global.dispatchEvent(new CustomEvent('sliq-google-profile',{detail:p||null}))}catch(e){}
}
function getToken(){
  const t=safeGet(K_TOKEN,true),exp=Number(safeGet(K_TOKEN_EXP,true)||0);
  return t&&exp>Date.now()+30000?t:'';
}
function storeToken(t,expiresIn){
  safeSet(K_TOKEN,t,true);
  safeSet(K_TOKEN_EXP,String(Date.now()+Math.max(60,Number(expiresIn||3600)-30)*1000),true);
}

let loadPromise=null;
function load(){
  if(global.google&&global.google.accounts)return Promise.resolve();
  if(loadPromise)return loadPromise;
  loadPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-sliq-google]');
    if(existing){
      if(global.google&&global.google.accounts){resolve();return}
      existing.addEventListener('load',()=>resolve(),{once:true});
      existing.addEventListener('error',()=>reject(new Error('GOOGLE_LOAD_FAILED')),{once:true});
      const timer=setInterval(()=>{if(global.google&&global.google.accounts){clearInterval(timer);resolve()}},50);
      setTimeout(()=>clearInterval(timer),10000);
      return;
    }
    const s=document.createElement('script');
    s.src='https://accounts.google.com/gsi/client';
    s.async=true;s.defer=true;s.dataset.sliqGoogle='1';
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('GOOGLE_LOAD_FAILED'));
    document.head.appendChild(s);
  });
  return loadPromise;
}

async function userInfo(token){
  const r=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token}});
  if(!r.ok)throw new Error('GOOGLE_USERINFO_'+r.status);
  const p=await r.json();
  return{sub:p.sub||'',name:p.name||p.email||'Google',email:p.email||'',picture:p.picture||''};
}

// Opens Google's own account chooser / consent popup. This is the normal
// Google Identity Services UX. No Sliqadius password form is involved.
async function signIn(options){
  options=options||{};
  const clientId=getClientId();
  if(!clientId){const e=new Error('NO_CLIENT_ID');e.code='NO_CLIENT_ID';throw e}
  await load();
  return new Promise((resolve,reject)=>{
    let settled=false;
    let popupTimer=null;
    const finishError=(err)=>{if(settled)return;settled=true;if(popupTimer)clearTimeout(popupTimer);reject(err)};
    const client=global.google.accounts.oauth2.initTokenClient({
      client_id:clientId,
      scope:SCOPES,
      include_granted_scopes:true,
      prompt:'select_account',
      callback:async(resp)=>{
        if(settled)return;
        if(!resp||resp.error){finishError(new Error((resp&&resp.error)||'GOOGLE_AUTH_FAILED'));return}
        try{
          storeToken(resp.access_token,resp.expires_in);
          const p=await userInfo(resp.access_token);
          saveProfile(p);
          settled=true;if(popupTimer)clearTimeout(popupTimer);resolve(p);
        }catch(e){finishError(e)}
      },
      error_callback:(err)=>{
        const type=err&&err.type||'GOOGLE_POPUP_FAILED';
        finishError(new Error(type));
      }
    });
    try{
      client.requestAccessToken({prompt:options.prompt||'select_account'});
      popupTimer=setTimeout(()=>{if(!settled)finishError(new Error('GOOGLE_POPUP_TIMEOUT'))},120000);
    }catch(e){finishError(e)}
  });
}

function signOut(){
  const token=getToken();
  if(token&&global.google&&global.google.accounts&&global.google.accounts.oauth2){
    try{global.google.accounts.oauth2.revoke(token,()=>{})}catch(e){}
  }
  safeRemove(K_TOKEN,true);safeRemove(K_TOKEN_EXP,true);saveProfile(null);
}

async function driveFetch(url,opts){
  const token=getToken();
  if(!token){const e=new Error('GOOGLE_TOKEN_REQUIRED');e.code='GOOGLE_TOKEN_REQUIRED';throw e}
  opts=opts||{};opts.headers=Object.assign({},opts.headers||{},{Authorization:'Bearer '+token});
  const r=await fetch(url,opts);
  if(r.status===401){safeRemove(K_TOKEN,true);safeRemove(K_TOKEN_EXP,true)}
  return r;
}
async function findFile(){
  const q=encodeURIComponent("name='"+FILE_NAME.replace(/'/g,"\\'")+"' and trashed=false");
  const r=await driveFetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&pageSize=10&fields=files(id,name,modifiedTime)&q='+q);
  if(!r.ok)throw new Error('DRIVE_LIST_'+r.status);
  const j=await r.json();return j.files&&j.files[0]||null;
}
async function readAppData(){
  const f=await findFile();if(!f)return null;
  const r=await driveFetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(f.id)+'?alt=media');
  if(!r.ok)throw new Error('DRIVE_READ_'+r.status);
  try{return await r.json()}catch(e){throw new Error('DRIVE_BAD_JSON')}
}
function multipartBody(meta,data,boundary){
  return '--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+
    '\r\n--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(data)+
    '\r\n--'+boundary+'--';
}
async function writeAppData(data){
  const existing=await findFile();
  const boundary='sliq_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
  const meta=existing?{name:FILE_NAME}:{name:FILE_NAME,parents:['appDataFolder']};
  const body=multipartBody(meta,data,boundary);
  const url=existing?
    'https://www.googleapis.com/upload/drive/v3/files/'+encodeURIComponent(existing.id)+'?uploadType=multipart':
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const r=await driveFetch(url,{method:existing?'PATCH':'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:body});
  if(!r.ok){let t='';try{t=await r.text()}catch(e){}throw new Error('DRIVE_WRITE_'+r.status+' '+t.slice(0,200))}
  return await r.json();
}

// If the Sliqadius OAuth client id is already configured, clicking the normal
// "Sign in with Google" buttons immediately opens Google's popup instead of
// first showing the technical Client-ID dialog. Existing account-management
// dialogs are still available after sign-in.
function installSimpleGoogleClickFlow(){
  document.addEventListener('click',async function(e){
    const btn=e.target&&e.target.closest?e.target.closest('#sliqGoogleHomeBtn,#sliqGoogleBtn'):null;
    if(!btn)return;
    if(getProfile())return;
    if(!getClientId())return; // owner setup fallback stays available until configured
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(btn.dataset.sliqGoogleBusy==='1')return;
    btn.dataset.sliqGoogleBusy='1';btn.setAttribute('aria-busy','true');
    try{
      await signIn({prompt:'select_account'});
      try{global.dispatchEvent(new CustomEvent('sliq-google-direct-signin'))}catch(_e){}
      if(location.pathname.toLowerCase().endsWith('/web.html')){
        setTimeout(()=>{try{btn.click()}catch(_e){}},80);
      }
    }catch(err){
      console.error('Sliqadius Google sign-in:',err);
      try{global.dispatchEvent(new CustomEvent('sliq-google-error',{detail:{message:String(err&&err.message||err)}}))}catch(_e){}
    }finally{
      btn.dataset.sliqGoogleBusy='0';btn.removeAttribute('aria-busy');
    }
  },true);
}
installSimpleGoogleClickFlow();

global.SliqGoogle={
  getClientId,setClientId,getProfile,getToken,load,signIn,signOut,readAppData,writeAppData,
  isReady:function(){return!!getClientId()},
  hasSession:function(){return!!getToken()}
};
})(window);
