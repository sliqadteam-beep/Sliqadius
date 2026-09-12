(()=>{
'use strict';
const VERSION='2.9.16';
const QUEUE_KEY='qevyno_send_queue_v1';
const MAX_QUEUE=250;
const HARD_ERRORS=new Set(['not_found','invalid_recipient','blocked','self_message','bad_request','message_too_long','unauthorized','invalid_token','invalid_login']);
const SUP=['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'];
const PREFIX=[['+380','uk'],['+351','pt'],['+966','ar'],['+971','ar'],['+49','de'],['+43','de'],['+41','de'],['+34','es'],['+33','fr'],['+39','it'],['+31','nl'],['+48','pl'],['+90','tr'],['+81','ja'],['+82','ko'],['+86','zh'],['+7','ru'],['+44','en'],['+1','en']];
const ISO={DE:'de',AT:'de',CH:'de',ES:'es',FR:'fr',IT:'it',PT:'pt',NL:'nl',PL:'pl',TR:'tr',UA:'uk',RU:'ru',JP:'ja',KR:'ko',CN:'zh',AE:'ar',SA:'ar',EG:'ar',GB:'en',US:'en',CA:'en',AU:'en',NZ:'en',IE:'en'};
const WAIT={en:'Waiting to send',de:'Wartet auf Senden',es:'Esperando para enviar',fr:'En attente d’envoi',it:'In attesa di invio',pt:'A aguardar envio',nl:'Wacht op verzenden',pl:'Oczekuje na wysłanie',tr:'Gönderilmeyi bekliyor',uk:'Очікує надсилання',ru:'Ожидает отправки',ja:'送信待ち',ko:'전송 대기 중',zh:'等待发送',ar:'في انتظار الإرسال'};
function norm(x){x=String(x||'').toLowerCase().split(/[-_]/)[0];if(x==='ua')x='uk';return SUP.includes(x)?x:''}
function detectLang(){let p='';try{p=String((typeof mePhone!=='undefined'&&mePhone)||localStorage.getItem('qevyno_phone')||'').replace(/[\s().-]/g,'')}catch(_){}for(const [pre,l] of PREFIX)if(p.startsWith(pre))return l;let iso='';try{iso=String(localStorage.getItem('qevyno_country')||'').toUpperCase()}catch(_){}if(!iso){try{if(window.QevynoDevice&&QevynoDevice.getCountryIso)iso=String(QevynoDevice.getCountryIso()||'').toUpperCase()}catch(_){}}if(ISO[iso])return ISO[iso];try{return norm((navigator.languages&&navigator.languages[0])||navigator.language)||'en'}catch(_){return'en'}}
const LANG=detectLang();
function applyLanguage(){try{localStorage.setItem('qevyno_ui_lang',LANG);document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';if(typeof window.qevynoApplyLanguage==='function')window.qevynoApplyLanguage();document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`Qevyno v${VERSION} • Android 8+`;});}catch(_){}}
window.qevynoSetLanguageForPhone=()=>applyLanguage();
[0,220,500,1000,1800].forEach(ms=>setTimeout(applyLanguage,ms));
window.addEventListener('focus',applyLanguage);document.addEventListener('visibilitychange',()=>{if(!document.hidden)applyLanguage()});

const style=document.createElement('style');style.id='qevyno303style';style.textContent=`
#homeScreen .q26row.q296rowIn,#chatScreen .bubbleRow.q296bubbleIn{animation:none!important}
.q303sendSpinner{display:inline-block;width:10px;height:10px;margin-left:5px;vertical-align:-1px;border:1.6px solid rgba(255,255,255,.38);border-top-color:rgba(255,255,255,.96);border-radius:50%;animation:q303spin .72s linear infinite}
.bubbleRow:not(.mine) .q303sendSpinner{border-color:rgba(70,88,96,.24);border-top-color:#62767e}
@keyframes q303spin{to{transform:rotate(360deg)}}
`;document.head.appendChild(style);

// Keep the built-in Help row attached while the old conversation renderer clears #people.
(function stableHelp(){const people=document.getElementById('people');if(!people||people.dataset.q303Guard==='1')return;const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!d||!d.get||!d.set)return;try{Object.defineProperty(people,'innerHTML',{configurable:true,get(){return d.get.call(this)},set(v){const help=this.querySelector('.q299helpRow');d.set.call(this,v);if(help&&!this.querySelector('.q299helpRow'))this.prepend(help);}});people.dataset.q303Guard='1';}catch(_){}})();

function loadQueue(){try{const q=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(q)?q.filter(x=>x&&x.id&&x.to):[]}catch(_){return[]}}
function saveQueue(q){try{localStorage.setItem(QUEUE_KEY,JSON.stringify(q))}catch(_){}}
function currentPhone(){try{return String((typeof mePhone!=='undefined'&&mePhone)||localStorage.getItem('qevyno_phone')||'')}catch(_){return''}}
function readChat(phone){try{if(window.QevynoDevice&&QevynoDevice.loadChat)return JSON.parse(QevynoDevice.loadChat(phone)||'[]')||[]}catch(_){}try{return JSON.parse(localStorage.getItem('qevyno_chat_'+phone)||'[]')||[]}catch(_){return[]}}
function writeChat(phone,arr){const raw=JSON.stringify(arr||[]);try{if(window.QevynoDevice&&QevynoDevice.saveChat&&QevynoDevice.saveChat(phone,raw))return true}catch(_){}try{localStorage.setItem('qevyno_chat_'+phone,raw);return true}catch(_){return false}}
function markFailed(item){try{const arr=readChat(item.to),m=arr.find(x=>x&&x.id===item.id);if(m){m.failed=true;writeChat(item.to,arr);if(typeof peer!=='undefined'&&peer&&peer.phone===item.to&&typeof window.renderMessages==='function')window.renderMessages(arr);}}catch(_){}}
function queueIds(){return new Set(loadQueue().map(x=>String(x.id)))}
function cleanMeta(meta){if(!meta)return;for(const n of [...meta.childNodes])if(n.nodeType===Node.TEXT_NODE)n.nodeValue=String(n.nodeValue||'').replace(/\s+(?:✓✓|✓|!)\s*$/,'')}
function decorateQueue(){const ids=queueIds();document.querySelectorAll('#messages .bubbleRow.mine[data-mid]').forEach(row=>{const id=String(row.dataset.mid||''),meta=row.querySelector('.meta');if(!meta)return;let sp=meta.querySelector('.q303sendSpinner');if(ids.has(id)){cleanMeta(meta);if(!sp){sp=document.createElement('span');sp.className='q303sendSpinner';sp.setAttribute('role','status');sp.setAttribute('aria-label',WAIT[LANG]||WAIT.en);sp.title=WAIT[LANG]||WAIT.en;meta.appendChild(sp)}row.dataset.q303queued='1';}else{if(sp)sp.remove();delete row.dataset.q303queued;}})}
function finishRow(id,ok){const row=document.querySelector(`#messages .bubbleRow.mine[data-mid="${CSS.escape(String(id))}"]`);if(!row)return;const meta=row.querySelector('.meta');if(!meta)return;const sp=meta.querySelector('.q303sendSpinner');if(sp)sp.remove();cleanMeta(meta);const text=(meta.textContent||'').trimEnd();meta.textContent=text+(ok?'  ✓':'  !');}
let decoPending=false;const messages=document.getElementById('messages');if(messages){new MutationObserver(()=>{if(decoPending)return;decoPending=true;requestAnimationFrame(()=>{decoPending=false;decorateQueue()})}).observe(messages,{subtree:true,childList:true});}

const waiters=new Map();let processing=false,retryTimer=0;
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function sendNow(item){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),8000);try{const h={'Accept':'application/json','Content-Type':'application/json'};if(typeof token!=='undefined'&&token)h.Authorization='Bearer '+token;const base=(typeof server!=='undefined'&&server)||'https://qevyno.sliqado.org';const res=await fetch(base+'/api/send',{method:'POST',headers:h,body:JSON.stringify({to:item.to,text:item.text,client_id:item.id,sent_at:item.sent_at}),signal:ctl.signal,cache:'no-store'});let data=null;try{data=await res.json()}catch(_){}try{if(typeof connectionBad==='function')connectionBad(false)}catch(_){}if(data)return data;return{ok:false,error:res.status>=500?'server_busy':'bad_response'};}catch(_){try{if(typeof connectionBad==='function')connectionBad(true)}catch(_){}return{ok:false,error:'server_unreachable'}}finally{clearTimeout(timer)}}
function removeItem(id){const q=loadQueue(),next=q.filter(x=>String(x.id)!==String(id));saveQueue(next);return next}
function settle(id,result){const w=waiters.get(String(id));if(w){waiters.delete(String(id));try{w(result)}catch(_){}}}
function retryLater(ms){clearTimeout(retryTimer);retryTimer=setTimeout(processQueue,Math.max(600,ms||1200))}
async function processQueue(){if(processing)return;processing=true;try{while(true){let q=loadQueue();if(!q.length)break;let item=q[0];const me=currentPhone();if(!me||!item.from){retryLater(1800);break}if(item.from!==me){removeItem(item.id);markFailed(item);settle(item.id,{ok:false,error:'account_changed'});continue}if(typeof navigator!=='undefined'&&navigator.onLine===false){retryLater(2500);break}const now=Date.now();if(Number(item.next_at||0)>now){retryLater(Number(item.next_at)-now);break}await sleep(90+Math.floor(Math.random()*190));const r=await sendNow(item);if(r&&r.ok){removeItem(item.id);finishRow(item.id,true);settle(item.id,r);decorateQueue();continue}const err=String(r&&r.error||'server_unreachable');if(HARD_ERRORS.has(err)){removeItem(item.id);markFailed(item);finishRow(item.id,false);settle(item.id,r||{ok:false,error:err});decorateQueue();continue}item.tries=Number(item.tries||0)+1;item.next_at=Date.now()+Math.min(15000,900*Math.pow(1.65,Math.min(item.tries,6)))+Math.floor(Math.random()*700);q[0]=item;saveQueue(q);decorateQueue();retryLater(item.next_at-Date.now());break}}finally{processing=false}}
function enqueue(body,auth){const id=String(body.client_id||'');if(!id)return Promise.resolve({ok:false,error:'missing_client_id'});let q=loadQueue();if(!q.some(x=>String(x.id)===id)){if(q.length>=MAX_QUEUE)return Promise.resolve({ok:false,error:'queue_full'});q.push({id,to:String(body.to||''),text:String(body.text||''),sent_at:Number(body.sent_at||Math.floor(Date.now()/1000)),from:currentPhone(),auth:auth!==false,tries:0,next_at:Date.now()});saveQueue(q);}decorateQueue();setTimeout(processQueue,0);return new Promise(resolve=>waiters.set(id,resolve))}
const originalApi=typeof api==='function'?api:null;if(originalApi){api=function(path,method='GET',body=null,auth=true){if(path==='/api/send'&&String(method).toUpperCase()==='POST'&&body&&body.client_id)return enqueue(body,auth);return originalApi(path,method,body,auth)}}
window.addEventListener('online',()=>{clearTimeout(retryTimer);processQueue()});document.addEventListener('visibilitychange',()=>{if(!document.hidden)processQueue()});
setTimeout(()=>{decorateQueue();processQueue();},120);
})();