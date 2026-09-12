(()=>{
'use strict';
const SUP=['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'];
const PREFIX=[['+380','uk'],['+351','pt'],['+966','ar'],['+971','ar'],['+49','de'],['+43','de'],['+41','de'],['+34','es'],['+33','fr'],['+39','it'],['+31','nl'],['+48','pl'],['+90','tr'],['+81','ja'],['+82','ko'],['+86','zh'],['+7','ru'],['+44','en'],['+1','en']];
const ISO={DE:'de',AT:'de',ES:'es',FR:'fr',IT:'it',PT:'pt',NL:'nl',PL:'pl',TR:'tr',UA:'uk',RU:'ru',JP:'ja',KR:'ko',CN:'zh',AE:'ar',SA:'ar',EG:'ar',GB:'en',US:'en',CA:'en',AU:'en',NZ:'en',IE:'en'};
function normal(x){x=String(x||'').toLowerCase().split(/[-_]/)[0];if(x==='ua')x='uk';return SUP.includes(x)?x:''}
function detect(){
 let phone='';try{phone=String((typeof mePhone!=='undefined'&&mePhone)||localStorage.getItem('qevyno_phone')||'').replace(/[\s().-]/g,'')}catch(_){}
 for(const [pre,l] of PREFIX)if(phone.startsWith(pre))return l;
 let iso='';try{iso=String(localStorage.getItem('qevyno_country')||'').toUpperCase()}catch(_){}
 if(!iso){try{if(window.QevynoDevice&&QevynoDevice.getCountryIso)iso=String(QevynoDevice.getCountryIso()||'').toUpperCase()}catch(_){}}
 if(ISO[iso])return ISO[iso];
 try{return normal((navigator.languages&&navigator.languages[0])||navigator.language)||'en'}catch(_){return'en'}
}
const LANG=detect();
const VERIFY={en:['Verified','This person is verified.','OK'],de:['Verifiziert','Diese Person ist verifiziert.','OK'],es:['Verificado','Esta persona está verificada.','Aceptar'],fr:['Vérifié','Cette personne est vérifiée.','OK'],it:['Verificato','Questa persona è verificata.','OK'],pt:['Verificado','Esta pessoa é verificada.','OK'],nl:['Geverifieerd','Deze persoon is geverifieerd.','OK'],pl:['Zweryfikowany','Ta osoba jest zweryfikowana.','OK'],tr:['Doğrulandı','Bu kişi doğrulandı.','Tamam'],uk:['Підтверджено','Ця особа підтверджена.','OK'],ru:['Подтверждено','Этот человек подтверждён.','OK'],ja:['認証済み','この人は認証済みです。','OK'],ko:['인증됨','이 사용자는 인증되었습니다.','확인'],zh:['已验证','此用户已通过验证。','确定'],ar:['موثّق','هذا الشخص موثّق.','حسنًا']};
const DEL={en:'Delete account',de:'Account löschen',es:'Eliminar cuenta',fr:'Supprimer le compte',it:'Elimina account',pt:'Eliminar conta',nl:'Account verwijderen',pl:'Usuń konto',tr:'Hesabı sil',uk:'Видалити акаунт',ru:'Удалить аккаунт',ja:'アカウントを削除',ko:'계정 삭제',zh:'删除账户',ar:'حذف الحساب'};
let busy=false,timer=0;
function extra(){
 const v=VERIFY[LANG]||VERIFY.en;
 const a=document.querySelector('.q298verifyTitle'),b=document.querySelector('.q298verifyText'),c=document.querySelector('.q298verifyOk');
 if(a)a.textContent=v[0];if(b)b.textContent=v[1];if(c)c.textContent=v[2];
 const d=document.getElementById('deleteAccountBtn');if(d)d.textContent=DEL[LANG]||DEL.en;
 document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.15 • Android 8+';});
}
function apply(){if(busy)return;busy=true;try{localStorage.setItem('qevyno_ui_lang',LANG);document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';if(typeof window.qevynoApplyLanguage==='function')window.qevynoApplyLanguage();extra();}catch(_){}finally{busy=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(apply,20)}
window.qevynoSetLanguageForPhone=()=>schedule();
const ob=new MutationObserver(list=>{if(!busy&&list.some(m=>m.type==='childList'||m.type==='characterData'||m.type==='attributes'))schedule()});
ob.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
apply();[220,400,800,1500,2600].forEach(ms=>setTimeout(apply,ms));
window.addEventListener('focus',apply);document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply()});
})();
