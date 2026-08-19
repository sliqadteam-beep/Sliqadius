(function(){
'use strict';

var API_KEY_STORAGE='sliq-web-key';
var ACTIVE_CHATS_STORAGE='sliq-web-chats';
var BUCKET_PREFIX='sliq-web-chats-key-';
var DB_NAME='sliqadius-web-local-v2';
var STORE_NAME='kv';
var currentApiKey='';
var lastChats='';

function lsGet(k){try{return localStorage.getItem(k)||''}catch(e){return''}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function ssGet(k){try{return sessionStorage.getItem(k)||''}catch(e){return''}}
function ssSet(k,v){try{sessionStorage.setItem(k,v);return true}catch(e){return false}}
function ssDel(k){try{sessionStorage.removeItem(k)}catch(e){}}
function cleanChats(raw){try{var x=JSON.parse(raw||'[]');return Array.isArray(x)?JSON.stringify(x):'[]'}catch(e){return'[]'}}
function hashKey(key){key=String(key||'');var h1=2166136261>>>0,h2=2246822519>>>0;for(var i=0;i<key.length;i++){var c=key.charCodeAt(i);h1^=c;h1=Math.imul(h1,16777619)>>>0;h2^=(c+i*31);h2=Math.imul(h2,3266489917)>>>0}return h1.toString(36)+h2.toString(36)}
function bucketName(key){return BUCKET_PREFIX+hashKey(key)}

function openDb(){return new Promise(function(resolve,reject){if(!window.indexedDB){reject(new Error('NO_IDB'));return}var r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=function(){var db=r.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME)};r.onsuccess=function(){resolve(r.result)};r.onerror=function(){reject(r.error||new Error('IDB_OPEN'))}})}
async function idbGet(k){try{var db=await openDb();return await new Promise(function(resolve,reject){var tx=db.transaction(STORE_NAME,'readonly'),r=tx.objectStore(STORE_NAME).get(k);r.onsuccess=function(){resolve(r.result==null?'':String(r.result))};r.onerror=function(){reject(r.error)}})}catch(e){return''}}
async function idbSet(k,v){try{var db=await openDb();return await new Promise(function(resolve,reject){var tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put(String(v),k);tx.oncomplete=function(){resolve(true)};tx.onerror=function(){reject(tx.error)}})}catch(e){return false}}

function saveChatsForKey(key,raw){if(!key)return;var c=cleanChats(raw);lsSet(bucketName(key),c);idbSet('chats:'+hashKey(key),c)}
async function loadChatsForKey(key){if(!key)return'';var local=lsGet(bucketName(key));if(local)return cleanChats(local);var backup=await idbGet('chats:'+hashKey(key));if(backup){var c=cleanChats(backup);lsSet(bucketName(key),c);return c}return''}

async function restoreApiKey(){var key=lsGet(API_KEY_STORAGE);if(key){idbSet('api-key',key);return key}var backup=await idbGet('api-key');if(backup){lsSet(API_KEY_STORAGE,backup);if(ssGet('sliq-api-key-restored')!=='1'){ssSet('sliq-api-key-restored','1');location.reload()}return backup}return''}

async function initStorage(){
  var key=await restoreApiKey();
  currentApiKey=key;
  var active=cleanChats(lsGet(ACTIVE_CHATS_STORAGE)||'[]');
  if(key){
    var saved=await loadChatsForKey(key);
    if(!saved){saveChatsForKey(key,active)}
    else if(saved!==active){lsSet(ACTIVE_CHATS_STORAGE,saved);if(ssGet('sliq-chat-restored')!=='1'){ssSet('sliq-chat-restored','1');location.reload();return}}
  }
  ssDel('sliq-chat-restored');
  lastChats=cleanChats(lsGet(ACTIVE_CHATS_STORAGE)||'[]');
  if(key)saveChatsForKey(key,lastChats);
}

async function switchApiKey(newKey){
  newKey=String(newKey||'');
  var oldKey=currentApiKey;
  var active=cleanChats(lsGet(ACTIVE_CHATS_STORAGE)||'[]');
  if(oldKey)saveChatsForKey(oldKey,active);
  currentApiKey=newKey;
  if(newKey)idbSet('api-key',newKey);
  if(!newKey)return;
  var saved=await loadChatsForKey(newKey);
  if(!saved){saved=oldKey?'[]':active;saveChatsForKey(newKey,saved)}
  lsSet(ACTIVE_CHATS_STORAGE,saved);
  lastChats=saved;
  if(ssGet('sliq-key-switch')!=='1'){ssSet('sliq-key-switch','1');location.reload()}
}

function watchStorage(){
  setInterval(function(){
    var key=lsGet(API_KEY_STORAGE);
    if(key!==currentApiKey){ssDel('sliq-key-switch');switchApiKey(key);return}
    var chats=cleanChats(lsGet(ACTIVE_CHATS_STORAGE)||'[]');
    if(chats!==lastChats){lastChats=chats;if(currentApiKey)saveChatsForKey(currentApiKey,chats)}
    if(key)idbSet('api-key',key);
  },700);
  window.addEventListener('beforeunload',function(){var key=lsGet(API_KEY_STORAGE);if(key)lsSet(bucketName(key),cleanChats(lsGet(ACTIVE_CHATS_STORAGE)||'[]'))});
}

function removeOldGoogleUi(){['sliqGoogleHomeBtn','sliqGoogleBtn','sliqGoogleShade','sliqGoogleWarn','sliqLoginToast','sliqGTitle','sliqGProfile'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()});document.querySelectorAll('.sliq-google-home,.sliq-gbtn,.sliq-gshade,.sliq-google-warn,.sliq-login-toast').forEach(function(e){e.remove()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeOldGoogleUi);else removeOldGoogleUi();
new MutationObserver(removeOldGoogleUi).observe(document.documentElement,{childList:true,subtree:true});
try{delete window.SliqGoogle}catch(e){window.SliqGoogle=undefined}

initStorage().then(watchStorage).catch(watchStorage);
})();