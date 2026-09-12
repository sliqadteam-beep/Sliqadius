(()=>{
  const D=id=>document.getElementById(id);
  const lang=()=>localStorage.getItem('qevyno_ui_lang')||'en';
  const T={
    en:{button:'Delete account',title:'Delete account',text:'Enter your password to permanently delete your Qevyno account.',password:'Password',cancel:'Cancel',confirm:'Delete account',deleting:'Deleting…',wrong:'Wrong password.',rate:'Too many attempts. Try again later.',server:'Account deletion is not available on the server yet.',failed:'Could not delete the account.'},
    de:{button:'Account löschen',title:'Account löschen',text:'Gib dein Passwort ein, um deinen Qevyno-Account dauerhaft zu löschen.',password:'Passwort',cancel:'Abbrechen',confirm:'Account löschen',deleting:'Wird gelöscht…',wrong:'Falsches Passwort.',rate:'Zu viele Versuche. Versuche es später erneut.',server:'Account-Löschen ist auf dem Server noch nicht verfügbar.',failed:'Der Account konnte nicht gelöscht werden.'},
    es:{button:'Eliminar cuenta',title:'Eliminar cuenta',text:'Introduce tu contraseña para eliminar permanentemente tu cuenta de Qevyno.',password:'Contraseña',cancel:'Cancelar',confirm:'Eliminar cuenta',deleting:'Eliminando…',wrong:'Contraseña incorrecta.',rate:'Demasiados intentos. Inténtalo más tarde.',server:'La eliminación de cuentas aún no está disponible en el servidor.',failed:'No se pudo eliminar la cuenta.'},
    fr:{button:'Supprimer le compte',title:'Supprimer le compte',text:'Saisis ton mot de passe pour supprimer définitivement ton compte Qevyno.',password:'Mot de passe',cancel:'Annuler',confirm:'Supprimer le compte',deleting:'Suppression…',wrong:'Mot de passe incorrect.',rate:'Trop de tentatives. Réessaie plus tard.',server:'La suppression du compte n’est pas encore disponible sur le serveur.',failed:'Impossible de supprimer le compte.'},
    it:{button:'Elimina account',title:'Elimina account',text:'Inserisci la password per eliminare definitivamente il tuo account Qevyno.',password:'Password',cancel:'Annulla',confirm:'Elimina account',deleting:'Eliminazione…',wrong:'Password errata.',rate:'Troppi tentativi. Riprova più tardi.',server:'L’eliminazione dell’account non è ancora disponibile sul server.',failed:'Impossibile eliminare l’account.'},
    pt:{button:'Eliminar conta',title:'Eliminar conta',text:'Introduz a tua palavra-passe para eliminar permanentemente a tua conta Qevyno.',password:'Palavra-passe',cancel:'Cancelar',confirm:'Eliminar conta',deleting:'A eliminar…',wrong:'Palavra-passe incorreta.',rate:'Demasiadas tentativas. Tenta mais tarde.',server:'A eliminação da conta ainda não está disponível no servidor.',failed:'Não foi possível eliminar a conta.'},
    nl:{button:'Account verwijderen',title:'Account verwijderen',text:'Voer je wachtwoord in om je Qevyno-account permanent te verwijderen.',password:'Wachtwoord',cancel:'Annuleren',confirm:'Account verwijderen',deleting:'Verwijderen…',wrong:'Onjuist wachtwoord.',rate:'Te veel pogingen. Probeer het later opnieuw.',server:'Account verwijderen is nog niet beschikbaar op de server.',failed:'Account kon niet worden verwijderd.'},
    pl:{button:'Usuń konto',title:'Usuń konto',text:'Wpisz hasło, aby trwale usunąć konto Qevyno.',password:'Hasło',cancel:'Anuluj',confirm:'Usuń konto',deleting:'Usuwanie…',wrong:'Nieprawidłowe hasło.',rate:'Zbyt wiele prób. Spróbuj później.',server:'Usuwanie kont nie jest jeszcze dostępne na serwerze.',failed:'Nie udało się usunąć konta.'},
    tr:{button:'Hesabı sil',title:'Hesabı sil',text:'Qevyno hesabını kalıcı olarak silmek için şifreni gir.',password:'Şifre',cancel:'İptal',confirm:'Hesabı sil',deleting:'Siliniyor…',wrong:'Yanlış şifre.',rate:'Çok fazla deneme. Daha sonra tekrar dene.',server:'Hesap silme henüz sunucuda kullanılabilir değil.',failed:'Hesap silinemedi.'},
    uk:{button:'Видалити акаунт',title:'Видалити акаунт',text:'Введи пароль, щоб назавжди видалити свій акаунт Qevyno.',password:'Пароль',cancel:'Скасувати',confirm:'Видалити акаунт',deleting:'Видалення…',wrong:'Неправильний пароль.',rate:'Забагато спроб. Спробуй пізніше.',server:'Видалення акаунта ще недоступне на сервері.',failed:'Не вдалося видалити акаунт.'},
    ru:{button:'Удалить аккаунт',title:'Удалить аккаунт',text:'Введите пароль, чтобы навсегда удалить аккаунт Qevyno.',password:'Пароль',cancel:'Отмена',confirm:'Удалить аккаунт',deleting:'Удаление…',wrong:'Неверный пароль.',rate:'Слишком много попыток. Попробуйте позже.',server:'Удаление аккаунта пока недоступно на сервере.',failed:'Не удалось удалить аккаунт.'},
    ja:{button:'アカウントを削除',title:'アカウントを削除',text:'Qevyno アカウントを完全に削除するにはパスワードを入力してください。',password:'パスワード',cancel:'キャンセル',confirm:'アカウントを削除',deleting:'削除中…',wrong:'パスワードが違います。',rate:'試行回数が多すぎます。後でもう一度お試しください。',server:'サーバーではまだアカウント削除を利用できません。',failed:'アカウントを削除できませんでした。'},
    ko:{button:'계정 삭제',title:'계정 삭제',text:'Qevyno 계정을 영구 삭제하려면 비밀번호를 입력하세요.',password:'비밀번호',cancel:'취소',confirm:'계정 삭제',deleting:'삭제 중…',wrong:'비밀번호가 올바르지 않습니다.',rate:'시도 횟수가 너무 많습니다. 나중에 다시 시도하세요.',server:'서버에서 아직 계정 삭제를 사용할 수 없습니다.',failed:'계정을 삭제하지 못했습니다.'},
    zh:{button:'删除账户',title:'删除账户',text:'输入密码以永久删除你的 Qevyno 账户。',password:'密码',cancel:'取消',confirm:'删除账户',deleting:'正在删除…',wrong:'密码错误。',rate:'尝试次数过多，请稍后再试。',server:'服务器暂不支持删除账户。',failed:'无法删除账户。'},
    ar:{button:'حذف الحساب',title:'حذف الحساب',text:'أدخل كلمة المرور لحذف حساب Qevyno نهائيًا.',password:'كلمة المرور',cancel:'إلغاء',confirm:'حذف الحساب',deleting:'جارٍ الحذف…',wrong:'كلمة المرور غير صحيحة.',rate:'محاولات كثيرة جدًا. حاول لاحقًا.',server:'حذف الحساب غير متاح على الخادم بعد.',failed:'تعذر حذف الحساب.'}
  };
  const t=()=>T[lang()]||T.en;

  const logout=D('logoutBtn');
  if(!logout)return;
  let btn=D('deleteAccountBtn');
  if(!btn){btn=document.createElement('button');btn.id='deleteAccountBtn';btn.className='q26sheetBtn q300deleteBtn';logout.insertAdjacentElement('afterend',btn);}

  const style=document.createElement('style');style.id='qevyno300style';style.textContent=`
    .q300deleteBtn{background:#fff!important;color:#d8394c!important;border:1px solid #f1cfd4!important;margin-top:8px!important}
    .q300back{position:fixed;inset:0;z-index:430;background:rgba(23,33,43,.32);display:flex;align-items:center;justify-content:center;padding:22px;opacity:0;pointer-events:none;visibility:hidden;transition:opacity .18s ease,visibility .18s ease}.q300back.on{opacity:1;pointer-events:auto;visibility:visible}
    .q300card{width:min(350px,94vw);background:#fff;border:1px solid #e2eaed;border-radius:22px;padding:21px;box-shadow:0 24px 70px rgba(23,33,43,.18);transform:translateY(8px) scale(.98);transition:transform .22s cubic-bezier(.22,1,.36,1)}.q300back.on .q300card{transform:none}
    .q300title{font-size:20px;font-weight:800;color:#17212b}.q300text{font-size:13.5px;line-height:1.5;color:#647780;margin:6px 0 13px}.q300input{width:100%;height:50px;border:1px solid #dbe5e8;border-radius:14px;background:#f8fbfc;color:#17212b;padding:0 14px;outline:none;font-size:15px}.q300input:focus{border-color:#20c6c9;box-shadow:0 0 0 3px rgba(32,198,201,.10)}
    .q300error{min-height:19px;font-size:12px;color:#d8394c;margin-top:7px}.q300actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:7px}.q300actions button{height:45px;border-radius:13px;font-weight:750}.q300cancel{background:#eef3f5;color:#40545b}.q300confirm{background:#e3505f;color:#fff}.q300confirm:disabled{opacity:.55}
  `;document.head.appendChild(style);

  const back=document.createElement('div');back.className='q300back';back.innerHTML=`<div class="q300card" role="dialog" aria-modal="true"><div class="q300title" id="q300title"></div><div class="q300text" id="q300text"></div><input class="q300input" id="q300password" type="password" autocomplete="current-password"><div class="q300error" id="q300error"></div><div class="q300actions"><button class="q300cancel" id="q300cancel"></button><button class="q300confirm" id="q300confirm"></button></div></div>`;document.body.appendChild(back);
  const pw=D('q300password'),err=D('q300error'),confirm=D('q300confirm');
  function localize(){const x=t();btn.textContent=x.button;D('q300title').textContent=x.title;D('q300text').textContent=x.text;pw.placeholder=x.password;D('q300cancel').textContent=x.cancel;if(!confirm.disabled)confirm.textContent=x.confirm;document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.10 • Android 8+';});}
  function open(){localize();pw.value='';err.textContent='';confirm.disabled=false;confirm.textContent=t().confirm;back.classList.add('on');setTimeout(()=>pw.focus(),120)}
  function close(){back.classList.remove('on');pw.value='';err.textContent=''}
  btn.onclick=open;D('q300cancel').onclick=close;back.onclick=e=>{if(e.target===back)close()};

  function clearLocalAccountData(){
    try{const meta=JSON.parse(localStorage.getItem('qevyno_local_conversations_v2')||'{}');if(window.QevynoDevice&&QevynoDevice.saveChat)Object.keys(meta||{}).forEach(p=>{try{QevynoDevice.saveChat(p,'[]')}catch(_){}})}catch(_){}
    try{Object.keys(localStorage).filter(k=>k.startsWith('qevyno_')&&k!=='qevyno_ui_lang').forEach(k=>localStorage.removeItem(k));}catch(_){}
    try{clearSession()}catch(_){token='';mePhone='';meName='';}
  }

  async function removeAccount(){
    const password=pw.value||'';err.textContent='';
    if(password.length<6){err.textContent=t().wrong;return;}
    confirm.disabled=true;confirm.textContent=t().deleting;
    let r=null;try{r=await api('/api/delete-account','POST',{password},true)}catch(_){r=null}
    if(r&&r.ok){clearLocalAccountData();close();try{closeSettings()}catch(_){};try{auth()}catch(_){location.reload()};return;}
    confirm.disabled=false;confirm.textContent=t().confirm;
    const e=r&&r.error;if(e==='wrong_password'||e==='invalid_password'||e==='invalid_login')err.textContent=t().wrong;else if(e==='rate_limited')err.textContent=t().rate;else if(e==='not_found'||e==='bad_response')err.textContent=t().server;else err.textContent=t().failed;
  }
  confirm.onclick=removeAccount;pw.addEventListener('keydown',e=>{if(e.key==='Enter'&&!confirm.disabled)removeAccount()});
  localize();
})();