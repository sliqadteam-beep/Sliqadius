(()=>{
'use strict';
const VERSION='2.9.29';
const SUP=['en','de','es','fr','it','pt','nl','pl','tr','uk','ru','ja','ko','zh','ar'];
function lang(){try{let l=String(localStorage.getItem('qevyno_ui_lang')||document.documentElement.lang||navigator.language||'en').toLowerCase().split(/[-_]/)[0];if(l==='ua')l='uk';return SUP.includes(l)?l:'en'}catch(_){return'en'}}
const T={
 en:{title:'Choose a profile picture',sub:'Add a photo so people can recognize you. You can change it later.',choose:'Choose picture',next:'Continue',skip:'Skip',bad:'This picture could not be used.'},
 de:{title:'Wähle ein Profilbild',sub:'Füge ein Bild hinzu, damit andere dich erkennen. Du kannst es später ändern.',choose:'Bild auswählen',next:'Weiter',skip:'Überspringen',bad:'Dieses Bild konnte nicht verwendet werden.'},
 es:{title:'Elige una foto de perfil',sub:'Añade una foto para que otros puedan reconocerte. Puedes cambiarla después.',choose:'Elegir foto',next:'Continuar',skip:'Omitir',bad:'No se pudo usar esta imagen.'},
 fr:{title:'Choisis une photo de profil',sub:'Ajoute une photo pour que les autres puissent te reconnaître. Tu pourras la changer plus tard.',choose:'Choisir une photo',next:'Continuer',skip:'Passer',bad:'Cette image ne peut pas être utilisée.'},
 it:{title:'Scegli una foto profilo',sub:'Aggiungi una foto per farti riconoscere. Potrai cambiarla in seguito.',choose:'Scegli foto',next:'Continua',skip:'Salta',bad:'Impossibile usare questa immagine.'},
 pt:{title:'Escolhe uma foto de perfil',sub:'Adiciona uma foto para que te reconheçam. Podes alterá-la mais tarde.',choose:'Escolher foto',next:'Continuar',skip:'Ignorar',bad:'Não foi possível usar esta imagem.'},
 nl:{title:'Kies een profielfoto',sub:'Voeg een foto toe zodat anderen je herkennen. Je kunt hem later wijzigen.',choose:'Foto kiezen',next:'Doorgaan',skip:'Overslaan',bad:'Deze afbeelding kon niet worden gebruikt.'},
 pl:{title:'Wybierz zdjęcie profilowe',sub:'Dodaj zdjęcie, aby inni mogli Cię rozpoznać. Możesz je później zmienić.',choose:'Wybierz zdjęcie',next:'Dalej',skip:'Pomiń',bad:'Nie można użyć tego zdjęcia.'},
 tr:{title:'Profil resmi seç',sub:'Başkalarının seni tanıyabilmesi için bir fotoğraf ekle. Daha sonra değiştirebilirsin.',choose:'Fotoğraf seç',next:'Devam',skip:'Atla',bad:'Bu resim kullanılamadı.'},
 uk:{title:'Вибери фото профілю',sub:'Додай фото, щоб інші могли тебе впізнати. Його можна змінити пізніше.',choose:'Вибрати фото',next:'Далі',skip:'Пропустити',bad:'Не вдалося використати це зображення.'},
 ru:{title:'Выберите фото профиля',sub:'Добавьте фото, чтобы вас могли узнать. Его можно изменить позже.',choose:'Выбрать фото',next:'Продолжить',skip:'Пропустить',bad:'Не удалось использовать это изображение.'},
 ja:{title:'プロフィール画像を選択',sub:'他の人があなたを見分けられるように写真を追加します。後で変更できます。',choose:'画像を選択',next:'続ける',skip:'スキップ',bad:'この画像は使用できません。'},
 ko:{title:'프로필 사진 선택',sub:'다른 사람이 알아볼 수 있도록 사진을 추가하세요. 나중에 변경할 수 있습니다.',choose:'사진 선택',next:'계속',skip:'건너뛰기',bad:'이 사진을 사용할 수 없습니다.'},
 zh:{title:'选择头像',sub:'添加照片以便他人认出你。之后仍可更改。',choose:'选择图片',next:'继续',skip:'跳过',bad:'无法使用此图片。'},
 ar:{title:'اختر صورة الملف الشخصي',sub:'أضف صورة حتى يتمكن الآخرون من التعرف عليك. يمكنك تغييرها لاحقاً.',choose:'اختيار صورة',next:'متابعة',skip:'تخطي',bad:'تعذر استخدام هذه الصورة.'}
};
function tx(k){const d=T[lang()]||T.en;return d[k]||T.en[k]||k}
let pendingImage='';
let pendingName='';
let active=false;
let oldPicked=null,oldFailed=null,oldSave=null;

function initials(s){const p=String(s||'?').trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'?')+(p.length>1?(p[p.length-1]?.[0]||''):'')).toUpperCase().slice(0,2)}
function showPassword(){
  active=false;
  document.getElementById('va')?.classList.remove('on');
  document.getElementById('vc')?.classList.add('on');
  setTimeout(()=>document.getElementById('np')?.focus(),60);
}
function ensureStep(){
  const vn=document.getElementById('vn');
  const vc=document.getElementById('vc');
  if(!vn||!vc||document.getElementById('va'))return;
  const va=document.createElement('div');
  va.className='qv';
  va.id='va';
  va.innerHTML=`<div class="dots"><i class="dotx on"></i><i class="dotx on"></i><i class="dotx on"></i><i class="dotx"></i></div>
    <div class="qt">${tx('title')}</div>
    <div class="qs">${tx('sub')}</div>
    <div class="q314avatar" id="q314avatar">?</div>
    <button class="primary" id="q314choose">${tx('choose')}</button>
    <button class="primary q314next" id="q314next">${tx('next')}</button>
    <button class="qb" id="q314skip">${tx('skip')}</button>`;
  vc.parentNode.insertBefore(va,vc);
  const st=document.createElement('style');
  st.id='q314style';
  st.textContent=`.q314avatar{width:116px;height:116px;border-radius:34px;margin:8px auto 18px;background:#e8f3fb;color:#5e86a8;display:grid;place-items:center;font-size:32px;font-weight:950;background-size:cover;background-position:center;border:1px solid #d7e7f2}.q314next{display:none!important}.q314next.on{display:block!important}#q314choose{background:#8ABFF4;color:#102335}#q314skip{text-align:center;width:100%}`;
  document.head.appendChild(st);

  document.getElementById('q314choose').onclick=()=>{try{QevynoDevice.pickProfilePicture()}catch(_){}};
  document.getElementById('q314next').onclick=showPassword;
  document.getElementById('q314skip').onclick=()=>{pendingImage='';showPassword()};
}
function openStep(){
  ensureStep();
  const n=document.getElementById('ni')?.value.trim()||'';
  if(n.length<2||n.length>32){
    const e=document.getElementById('ne');if(e)e.textContent='Name needs 2–32 characters.';
    return;
  }
  pendingName=n;
  ['vp','vn','vc','vl'].forEach(id=>document.getElementById(id)?.classList.remove('on'));
  const va=document.getElementById('va');if(va){va.classList.add('on');active=true}
  const av=document.getElementById('q314avatar');
  if(av&&!pendingImage){av.style.backgroundImage='';av.textContent=initials(n)}
}
function install(){
  ensureStep();
  const nn=document.getElementById('nn');
  if(nn&&!nn.dataset.q314){
    nn.dataset.q314='1';
    nn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openStep()},true);
  }

  if(!oldPicked && typeof window.qevynoProfilePicked==='function'){
    oldPicked=window.qevynoProfilePicked;
    window.qevynoProfilePicked=function(dataUrl,w,h){
      if(active){
        if(!dataUrl||w>1600||h>1600){alert(tx('bad'));return}
        pendingImage=dataUrl;
        const av=document.getElementById('q314avatar');
        if(av){av.textContent='';av.style.backgroundImage=`url("${String(dataUrl).replace(/"/g,'%22')}")`}
        document.getElementById('q314next')?.classList.add('on');
        return;
      }
      return oldPicked.apply(this,arguments);
    };
  }
  if(!oldFailed && typeof window.qevynoProfilePickFailed==='function'){
    oldFailed=window.qevynoProfilePickFailed;
    window.qevynoProfilePickFailed=function(){
      if(active){alert(tx('bad'));return}
      return oldFailed.apply(this,arguments);
    };
  }

  if(!oldSave && typeof window.saveSession==='function'){
    oldSave=window.saveSession;
    window.saveSession=function(d){
      const r=oldSave.apply(this,arguments);
      const img=pendingImage;
      pendingImage='';
      if(img)window.__skaysaOwnAvatarPreview=img;
      if(img){
        setTimeout(async()=>{try{await api('/api/profile-picture','POST',{image:img});window.dispatchEvent(new Event('focus'))}catch(_){}},120);
      }
      return r;
    };
  }

  const cb=document.getElementById('cb');
  if(cb&&!cb.dataset.q314){
    cb.dataset.q314='1';
    cb.addEventListener('click',e=>{
      if(document.getElementById('vc')?.classList.contains('on')){
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
        document.getElementById('vc').classList.remove('on');
        document.getElementById('va')?.classList.add('on');
        active=true;
      }
    },true);
  }
}
new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true});
[0,120,400,900,1600].forEach(ms=>setTimeout(install,ms));
})();