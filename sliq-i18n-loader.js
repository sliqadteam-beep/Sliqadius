(function(g){
'use strict';
var supported={de:1,en:1,fr:1,es:1,it:1,nl:1,pl:1,tr:1,pt:1,ru:1,ja:1,ko:1,zh:1};
var loading={};
g.SliqI18nLangs=g.SliqI18nLangs||{};

function norm(code){code=String(code||'').slice(0,2).toLowerCase();return supported[code]?code:'en'}
function load(code){
  code=norm(code);
  if(g.SliqI18nLangs[code])return Promise.resolve(g.SliqI18nLangs[code]);
  if(loading[code])return loading[code];
  loading[code]=new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src='i18n/'+code+'.js?v=17';
    s.async=true;
    s.onload=function(){var d=g.SliqI18nLangs[code];d?resolve(d):reject(new Error('I18N_EMPTY_'+code))};
    s.onerror=function(){reject(new Error('I18N_LOAD_'+code))};
    document.head.appendChild(s);
  }).catch(function(e){if(code!=='en')return load('en');throw e});
  return loading[code]
}

g.SliqI18nLoader={load:load,norm:norm,supported:Object.keys(supported)};

/* Compatibility guards used by the main web runtime. */
g.CSS=g.CSS||{};
if(!g.CSS.escape){g.CSS.escape=function(v){return String(v).replace(/[^a-zA-Z0-9_-]/g,function(ch){return'\\'+ch})}}
if(!('indexedDB' in g))g.indexedDB=null;

/* Keep voice input, but never show its old lightning-like control beside Send. */
function isWeb(){return /\/web\.html$/i.test(location.pathname)||!!document.getElementById('messageInput')}
if(/\/web\.html$/i.test(location.pathname)){
  var style=document.createElement('style');
  style.id='sliqWebComposerRepair17';
  style.textContent='#micBtn{display:none!important}';
  document.head.appendChild(style);
}

/* Keep local chat libraries separated by Groq API key. */
function hashKey(key){
  key=String(key||'guest');
  var h1=2166136261>>>0,h2=2246822519>>>0;
  for(var i=0;i<key.length;i++){
    var c=key.charCodeAt(i);
    h1^=c;h1=Math.imul(h1,16777619)>>>0;
    h2^=(c+i*31);h2=Math.imul(h2,3266489917)>>>0;
  }
  return h1.toString(36)+h2.toString(36)
}
function seedFreshKeyLibrary(){
  try{
    if(!isWeb())return;
    var input=document.getElementById('keyInput');
    if(!input)return;
    var next=String(input.value||'').trim();
    var old=localStorage.getItem('sliq-web-key')||'';
    if(!old||!next||old===next||!/^gsk_[A-Za-z0-9_-]{12,}$/.test(next))return;
    var storageKey='sliq-v15-'+hashKey(next);
    if(localStorage.getItem(storageKey)!==null)return;
    var blank={version:15,chats:[],memories:[],usage:{requests:0,totalTokens:0,inputTokens:0,outputTokens:0,estimated:true,lastModel:'',rate:{}},current:''};
    localStorage.setItem(storageKey,JSON.stringify(blank));
  }catch(e){}
}
document.addEventListener('click',function(e){
  var target=e.target&&e.target.closest?e.target.closest('#saveKeyBtn'):null;
  if(target)seedFreshKeyLibrary();
},true);
document.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&e.target&&e.target.id==='keyInput')seedFreshKeyLibrary();
},true);

/* Load v17 after the main runtime; v17 waits until the runtime handlers exist. */
function loadRepair(){
  if(!isWeb()||document.getElementById('sliqWebRepairV17Script'))return;
  var s=document.createElement('script');
  s.id='sliqWebRepairV17Script';
  s.src='web-repair-v17.js?v=17';
  s.async=false;
  document.body.appendChild(s);
}
if(document.readyState==='complete')setTimeout(loadRepair,0);else g.addEventListener('load',loadRepair,{once:true});

})(window);