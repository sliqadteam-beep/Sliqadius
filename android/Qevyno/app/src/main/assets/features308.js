(()=>{
'use strict';
const VERSION='2.9.20';
const SUP=['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'];
const T={
 en:{profile:'Profile',qr:'Your QR code',qrHint:'Others can scan this code to start a chat with you.',edit:'Edit profile',settings:'Settings',close:'Close'},
 de:{profile:'Profil',qr:'Dein QR-Code',qrHint:'Andere können diesen Code scannen, um direkt einen Chat mit dir zu starten.',edit:'Profil bearbeiten',settings:'Einstellungen',close:'Schließen'},
 es:{profile:'Perfil',qr:'Tu código QR',qrHint:'Otras personas pueden escanearlo para iniciar un chat contigo.',edit:'Editar perfil',settings:'Ajustes',close:'Cerrar'},
 fr:{profile:'Profil',qr:'Ton code QR',qrHint:'Les autres peuvent scanner ce code pour démarrer une discussion avec toi.',edit:'Modifier le profil',settings:'Paramètres',close:'Fermer'},
 it:{profile:'Profilo',qr:'Il tuo codice QR',qrHint:'Gli altri possono scansionarlo per iniziare una chat con te.',edit:'Modifica profilo',settings:'Impostazioni',close:'Chiudi'},
 pt:{profile:'Perfil',qr:'O teu código QR',qrHint:'Outras pessoas podem digitalizar este código para iniciar uma conversa contigo.',edit:'Editar perfil',settings:'Definições',close:'Fechar'},
 nl:{profile:'Profiel',qr:'Jouw QR-code',qrHint:'Anderen kunnen deze code scannen om een chat met je te starten.',edit:'Profiel bewerken',settings:'Instellingen',close:'Sluiten'},
 pl:{profile:'Profil',qr:'Twój kod QR',qrHint:'Inni mogą zeskanować ten kod, aby rozpocząć z Tobą czat.',edit:'Edytuj profil',settings:'Ustawienia',close:'Zamknij'},
 tr:{profile:'Profil',qr:'QR kodun',qrHint:'Başkaları bu kodu tarayarak seninle sohbet başlatabilir.',edit:'Profili düzenle',settings:'Ayarlar',close:'Kapat'},
 uk:{profile:'Профіль',qr:'Твій QR-код',qrHint:'Інші можуть відсканувати цей код, щоб почати чат із тобою.',edit:'Редагувати профіль',settings:'Налаштування',close:'Закрити'},
 ru:{profile:'Профиль',qr:'Ваш QR-код',qrHint:'Другие могут отсканировать этот код, чтобы начать чат с вами.',edit:'Редактировать профиль',settings:'Настройки',close:'Закрыть'},
 ja:{profile:'プロフィール',qr:'あなたのQRコード',qrHint:'相手がこのコードをスキャンすると、あなたとのチャットを開始できます。',edit:'プロフィールを編集',settings:'設定',close:'閉じる'},
 ko:{profile:'프로필',qr:'내 QR 코드',qrHint:'다른 사람이 이 코드를 스캔하면 나와 채팅을 시작할 수 있습니다.',edit:'프로필 편집',settings:'설정',close:'닫기'},
 zh:{profile:'个人资料',qr:'你的二维码',qrHint:'其他人扫描此二维码即可与你开始聊天。',edit:'编辑个人资料',settings:'设置',close:'关闭'},
 ar:{profile:'الملف الشخصي',qr:'رمز QR الخاص بك',qrHint:'يمكن للآخرين مسح هذا الرمز لبدء محادثة معك.',edit:'تعديل الملف الشخصي',settings:'الإعدادات',close:'إغلاق'}
};
function lang(){let l='en';try{l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0]}catch(_){}if(l==='ua')l='uk';return SUP.includes(l)?l:'en'}
function tx(k){return(T[lang()]||T.en)[k]||T.en[k]||k}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function myPhone(){try{return String((typeof mePhone!=='undefined'&&mePhone)||localStorage.getItem('qevyno_phone')||'')}catch(_){return''}}
function myName(){try{return String((typeof meName!=='undefined'&&meName)||localStorage.getItem('qevyno_name')||myPhone())}catch(_){return myPhone()}}
function absAvatar(u){if(!u)return'';try{return /^https?:/i.test(u)?u:String((typeof server!=='undefined'&&server)||'https://qevyno.sliqado.org')+u}catch(_){return u}}
function initials(s){const p=String(s||'?').trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'?')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase().slice(0,2)}

const QLOGO=`<svg viewBox="0 0 108 108" aria-hidden="true" focusable="false"><defs><linearGradient id="q308lg" x1="10" y1="6" x2="98" y2="104" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#31E4DE"/><stop offset=".52" stop-color="#11BEC1"/><stop offset="1" stop-color="#08727C"/></linearGradient></defs><path fill="url(#q308lg)" d="M16 4h76a12 12 0 0 1 12 12v76a12 12 0 0 1-12 12H16A12 12 0 0 1 4 92V16A12 12 0 0 1 16 4Z"/><path fill="#ffffff35" d="M4 16A12 12 0 0 1 16 4h27C34 23 21 37 4 46Z"/><path fill="#fff" fill-rule="evenodd" d="M54 20a34 34 0 1 0 0 68 34 34 0 1 0 0-68m0 12a22 22 0 1 1 0 44 22 22 0 1 1 0-44"/><path fill="#fff" d="m30 70-10 16c-1 2 1 4 3 3l19-7Zm32-2c7 0 13 4 18 10l14 14c2 2 2 5 0 7s-5 2-7 0L73 85c-5-5-8-7-13-7Z"/><circle fill="#fff" cx="42" cy="54" r="4"/><circle fill="#fff" cx="54" cy="54" r="4"/><circle fill="#fff" cx="66" cy="54" r="4"/></svg>`;

const style=document.createElement('style');style.id='sliqchat308style';style.textContent=`
/* Subtle outlines: enough separation without making the UI busy. */
#chatSearch,#findPhone,#messageBox,.q306input,.q306groupScreen textarea{outline:1px solid #dce7ea!important;outline-offset:-1px!important}
#chatSearch:focus,#findPhone:focus,#messageBox:focus,.q306input:focus,.q306groupScreen textarea:focus{outline:2px solid rgba(32,198,201,.38)!important;outline-offset:-2px!important}
#people .q26row,.q306groupRow{border:1px solid rgba(210,224,228,.72)!important;box-shadow:0 2px 9px rgba(23,33,43,.025)}
.q307media,.q307draft,.q305preview,.q295photoRow,.q306choice{outline:1px solid rgba(206,222,226,.8);outline-offset:-1px}
.q307attach,.q306inviteBtn,.iconbtn{border:1px solid rgba(202,218,223,.9)!important}
.q306unread{outline:2px solid #fff;outline-offset:1px}

#homeScreen .topbar{gap:8px}.q308profileChip{height:48px;max-width:194px;min-width:0;padding:5px 8px 5px 5px;border-radius:17px;background:#f7fafb;border:1px solid #dbe6e9;display:flex;align-items:center;gap:8px;color:#17212b;box-shadow:0 3px 12px rgba(23,33,43,.045)}
.q308profileChip:active{transform:scale(.985)}.q308miniAvatar{width:36px;height:36px;min-width:36px;border-radius:12px;background:#dff6f6;color:#168d91;display:grid;place-items:center;font-size:12px;font-weight:900;background-size:cover;background-position:center;overflow:hidden}.q308miniInfo{min-width:0;text-align:left}.q308miniName{font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.q308miniPhone{font-size:9.5px;color:#82939a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
#homeScreen #settingsBtn{display:none!important}
.q308back{position:fixed;inset:0;z-index:980;background:rgba(23,33,43,.46);display:flex;align-items:flex-end;opacity:0;visibility:hidden;pointer-events:none;transition:.18s}.q308back.on{opacity:1;visibility:visible;pointer-events:auto}.q308sheet{width:100%;max-width:620px;margin:auto;background:#fff;border-radius:28px 28px 0 0;padding:12px 18px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -22px 65px rgba(23,33,43,.18);border:1px solid #dbe6e9}.q308handle{width:42px;height:4px;background:#d6e2e5;border-radius:99px;margin:1px auto 15px}.q308head{display:flex;align-items:center;gap:13px}.q308bigAvatar{width:70px;height:70px;min-width:70px;border-radius:22px;background:#dff6f6;color:#168d91;display:grid;place-items:center;font-size:22px;font-weight:950;background-size:cover;background-position:center;overflow:hidden;border:1px solid #cfe3e6}.q308headText{min-width:0;flex:1}.q308title{font-size:22px;font-weight:950;color:#17212b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.q308phone{font-size:12px;color:#73868e;margin-top:4px;user-select:text}.q308qrBox{margin-top:18px;padding:16px;border:1px solid #dce7ea;border-radius:20px;background:#f8fbfb;text-align:center}.q308qrLabel{font-size:13px;font-weight:900;color:#263940}.q308qr{display:block;width:min(230px,72vw);height:auto;aspect-ratio:1;margin:12px auto 8px;border-radius:17px;background:#fff;border:1px solid #dde8ea;padding:8px}.q308qrHint{font-size:10.5px;color:#7b8d94;line-height:1.45;max-width:330px;margin:auto}.q308actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.q308actions button{height:46px;border-radius:14px;font-weight:850;border:1px solid #dbe6e9}.q308edit{background:#20c6c9;color:#fff;border-color:#20c6c9!important}.q308close{background:#f0f5f6;color:#52666e}
.q308helpLogo{display:grid!important;place-items:center!important;background:none!important;overflow:hidden!important;color:transparent!important;padding:0!important;border-radius:18px!important}.q308helpLogo svg{width:100%;height:100%;display:block}.q299helpRow .q308helpLogo{box-shadow:0 4px 14px rgba(17,190,193,.18)}
@media(max-width:410px){.q308profileChip{max-width:170px}.q308miniInfo{max-width:112px}.q308miniPhone{font-size:8.8px}}
@media(max-width:350px){.q308profileChip{max-width:130px}.q308miniPhone{display:none}}
`;document.head.appendChild(style);

let own={phone:myPhone(),name:myName(),avatar:''};
function applyAvatar(el){if(!el)return;const u=own.avatar;if(u){el.textContent='';el.style.backgroundImage=`url("${u.replace(/"/g,'%22')}")`}else{el.style.backgroundImage='';el.textContent=initials(own.name)}}
function refreshChip(){const chip=document.querySelector('.q308profileChip');if(!chip)return;chip.querySelector('.q308miniName').textContent=own.name||own.phone;chip.querySelector('.q308miniPhone').textContent=own.phone;applyAvatar(chip.querySelector('.q308miniAvatar'))}
async function refreshOwn(){own.phone=myPhone();own.name=myName();try{const cached=localStorage.getItem('sliqchat_own_avatar')||'';if(cached)own.avatar=cached}catch(_){}refreshChip();try{if(typeof window.api==='function'&&own.phone){const d=await window.api('/api/me');if(d&&d.ok){own.name=String(d.display_name||own.name);own.phone=String(d.phone||own.phone);own.avatar=absAvatar(d.avatar_url||'');try{localStorage.setItem('qevyno_name',own.name);localStorage.setItem('sliqchat_own_avatar',own.avatar)}catch(_){}refreshChip();refreshSheet()}}}catch(_){}}
function ensureChip(){const bar=document.querySelector('#homeScreen .topbar');if(!bar||bar.querySelector('.q308profileChip'))return;const chip=document.createElement('button');chip.type='button';chip.className='q308profileChip';chip.setAttribute('aria-label',tx('profile'));chip.innerHTML='<span class="q308miniAvatar"></span><span class="q308miniInfo"><span class="q308miniName"></span><span class="q308miniPhone"></span></span>';const settings=bar.querySelector('#settingsBtn');if(settings)bar.insertBefore(chip,settings);else bar.appendChild(chip);chip.onclick=openProfile;refreshChip()}

const back=document.createElement('div');back.className='q308back';back.innerHTML=`<div class="q308sheet"><div class="q308handle"></div><div class="q308head"><div class="q308bigAvatar"></div><div class="q308headText"><div class="q308title"></div><div class="q308phone"></div></div></div><div class="q308qrBox"><div class="q308qrLabel"></div><img class="q308qr" alt="QR"><div class="q308qrHint"></div></div><div class="q308actions"><button class="q308edit"></button><button class="q308close"></button></div></div>`;document.body.appendChild(back);
back.onclick=e=>{if(e.target===back)closeProfile()};back.querySelector('.q308close').onclick=closeProfile;back.querySelector('.q308edit').onclick=()=>{closeProfile();const b=document.getElementById('settingsBtn');if(b){b.style.display='';b.click();setTimeout(()=>{b.style.display=''},50)}};
function qrForPhone(p){if(!p)return'';try{if(window.QevynoDevice?.getOrCreateQr){const q=String(QevynoDevice.getOrCreateQr(p)||'');if(q)return q}}catch(_){}try{if(window.QevynoDevice?.makeQr)return String(QevynoDevice.makeQr('https://sliqado.org/Qevyno/add/?phone='+encodeURIComponent(p))||'')}catch(_){}return''}
function refreshSheet(){back.querySelector('.q308title').textContent=own.name||own.phone;back.querySelector('.q308phone').textContent=own.phone;applyAvatar(back.querySelector('.q308bigAvatar'));back.querySelector('.q308qrLabel').textContent=tx('qr');back.querySelector('.q308qrHint').textContent=tx('qrHint');back.querySelector('.q308edit').textContent=tx('edit');back.querySelector('.q308close').textContent=tx('close');const q=qrForPhone(own.phone);if(q)back.querySelector('.q308qr').src=q}
function openProfile(){refreshSheet();back.classList.add('on');refreshOwn()}
function closeProfile(){back.classList.remove('on')}

function decorateHelp(){document.querySelectorAll('.q299helpRow').forEach(row=>{const a=row.querySelector('.q26avatar,.q299avatar,[class*="avatar"]');if(!a||a.classList.contains('q308helpLogo'))return;a.classList.add('q308helpLogo');a.style.backgroundImage='none';a.innerHTML=QLOGO;});}
function decorateGifLabels(){document.querySelectorAll('.q307draft').forEach(d=>{const img=d.querySelector('img[src]'),name=d.querySelector('.q307draftName')?.textContent||'';if(img&&/\.gif(?:$|\?)/i.test(name)){const s=d.querySelector('.q307draftSize');if(s)s.textContent=s.textContent.replace(/^(Bild|Photo|Foto|Zdjęcie|图片|写真|사진|صورة)/i,'GIF')}})}
function setVersion(){document.querySelectorAll('.small').forEach(el=>{if(/(?:Qevyno|SliqChat)\s+(?:v)?2\./i.test(el.textContent||''))el.textContent=`SliqChat v${VERSION} • Android 8+`})}
let scheduled=false;function decorate(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;ensureChip();decorateHelp();decorateGifLabels();refreshChip();setVersion()})}
new MutationObserver(decorate).observe(document.body,{subtree:true,childList:true});
[0,160,420,900,1800].forEach(ms=>setTimeout(()=>{decorate();if(ms===420)refreshOwn()},ms));window.addEventListener('focus',()=>{decorate();refreshOwn()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){decorate();refreshOwn()}});
})();
