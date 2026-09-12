(()=>{
  const D=id=>document.getElementById(id);
  const HELP_NUMBER='0000000000';
  const lang=()=>localStorage.getItem('qevyno_ui_lang')||'en';
  const T={
    en:{name:'Qevyno Help',preview:'Help with using Qevyno',intro:'Welcome to Qevyno Help. This is a built-in help contact.',start:'Start a chat: tap + and enter the other person’s phone number without a country code.',qr:'QR code: open + or Settings to show your QR code. Someone else can scan it to start a chat with you.',msg:'Messages: press and hold a message to add a reaction or delete it.',profile:'Profile: open the three-dot menu and Settings to change your profile picture. A purple check means the person is verified.',privacy:'Privacy: your chat history is stored on your device, not permanently on the Qevyno server.',blocked:'You cannot write to this number.'},
    de:{name:'Qevyno Hilfe',preview:'Hilfe zur Bedienung von Qevyno',intro:'Willkommen bei der Qevyno Hilfe. Dies ist ein integrierter Hilfe-Kontakt.',start:'Chat starten: Tippe auf + und gib die Telefonnummer der anderen Person ohne Ländervorwahl ein.',qr:'QR-Code: Öffne + oder die Einstellungen, um deinen QR-Code anzuzeigen. Andere können ihn scannen und direkt einen Chat mit dir starten.',msg:'Nachrichten: Halte eine Nachricht gedrückt, um eine Reaktion hinzuzufügen oder sie zu löschen.',profile:'Profil: Öffne das Drei-Punkte-Menü und die Einstellungen, um dein Profilbild zu ändern. Ein lila Haken bedeutet, dass die Person verifiziert ist.',privacy:'Privatsphäre: Dein Chatverlauf wird auf deinem Gerät gespeichert und nicht dauerhaft auf dem Qevyno-Server.',blocked:'Du kannst nicht mit dieser Nummer schreiben.'},
    es:{name:'Ayuda de Qevyno',preview:'Ayuda para usar Qevyno',intro:'Bienvenido a la ayuda de Qevyno. Este es un contacto de ayuda integrado.',start:'Iniciar un chat: pulsa + e introduce el número de la otra persona sin prefijo internacional.',qr:'Código QR: abre + o Ajustes para mostrar tu QR. Otra persona puede escanearlo para iniciar un chat contigo.',msg:'Mensajes: mantén pulsado un mensaje para añadir una reacción o eliminarlo.',profile:'Perfil: abre el menú de tres puntos y Ajustes para cambiar tu foto. Un check morado significa que la persona está verificada.',privacy:'Privacidad: tu historial se guarda en tu dispositivo y no de forma permanente en el servidor de Qevyno.',blocked:'No puedes escribir a este número.'},
    fr:{name:'Aide Qevyno',preview:'Aide pour utiliser Qevyno',intro:'Bienvenue dans l’aide Qevyno. Ceci est un contact d’aide intégré.',start:'Démarrer une discussion : appuie sur + et saisis le numéro de l’autre personne sans indicatif international.',qr:'Code QR : ouvre + ou les Paramètres pour afficher ton QR. Une autre personne peut le scanner pour démarrer une discussion avec toi.',msg:'Messages : maintiens un message appuyé pour ajouter une réaction ou le supprimer.',profile:'Profil : ouvre le menu à trois points puis Paramètres pour changer ta photo. Une coche violette signifie que la personne est vérifiée.',privacy:'Confidentialité : ton historique est stocké sur ton appareil et non en permanence sur le serveur Qevyno.',blocked:'Tu ne peux pas écrire à ce numéro.'},
    it:{name:'Aiuto Qevyno',preview:'Aiuto per usare Qevyno',intro:'Benvenuto nell’aiuto Qevyno. Questo è un contatto di assistenza integrato.',start:'Avvia una chat: tocca + e inserisci il numero dell’altra persona senza prefisso internazionale.',qr:'Codice QR: apri + o Impostazioni per mostrare il tuo QR. Un’altra persona può scansionarlo per avviare una chat con te.',msg:'Messaggi: tieni premuto un messaggio per aggiungere una reazione o eliminarlo.',profile:'Profilo: apri il menu con tre punti e Impostazioni per cambiare la foto. Una spunta viola indica che la persona è verificata.',privacy:'Privacy: la cronologia chat viene salvata sul dispositivo e non in modo permanente sul server Qevyno.',blocked:'Non puoi scrivere a questo numero.'},
    pt:{name:'Ajuda Qevyno',preview:'Ajuda para usar o Qevyno',intro:'Bem-vindo à ajuda do Qevyno. Este é um contacto de ajuda integrado.',start:'Iniciar conversa: toca em + e introduz o número da outra pessoa sem indicativo internacional.',qr:'Código QR: abre + ou Definições para mostrar o teu QR. Outra pessoa pode digitalizá-lo para iniciar uma conversa contigo.',msg:'Mensagens: mantém uma mensagem premida para adicionar uma reação ou apagá-la.',profile:'Perfil: abre o menu de três pontos e Definições para mudar a foto. Um visto roxo significa que a pessoa está verificada.',privacy:'Privacidade: o histórico fica guardado no teu dispositivo e não permanentemente no servidor Qevyno.',blocked:'Não podes escrever para este número.'},
    nl:{name:'Qevyno Help',preview:'Hulp bij het gebruik van Qevyno',intro:'Welkom bij Qevyno Help. Dit is een ingebouwd hulpcontact.',start:'Chat starten: tik op + en voer het telefoonnummer van de andere persoon in zonder landcode.',qr:'QR-code: open + of Instellingen om je QR-code te tonen. Iemand anders kan hem scannen om een chat met jou te starten.',msg:'Berichten: houd een bericht ingedrukt om een reactie toe te voegen of het te verwijderen.',profile:'Profiel: open het driepuntsmenu en Instellingen om je profielfoto te wijzigen. Een paars vinkje betekent dat de persoon geverifieerd is.',privacy:'Privacy: je chatgeschiedenis staat op je apparaat en niet permanent op de Qevyno-server.',blocked:'Je kunt niet naar dit nummer schrijven.'},
    pl:{name:'Pomoc Qevyno',preview:'Pomoc w obsłudze Qevyno',intro:'Witamy w pomocy Qevyno. To wbudowany kontakt pomocy.',start:'Rozpocznij czat: dotknij + i wpisz numer drugiej osoby bez prefiksu kraju.',qr:'Kod QR: otwórz + lub Ustawienia, aby pokazać swój kod QR. Inna osoba może go zeskanować i rozpocząć z Tobą czat.',msg:'Wiadomości: przytrzymaj wiadomość, aby dodać reakcję lub ją usunąć.',profile:'Profil: otwórz menu z trzema kropkami i Ustawienia, aby zmienić zdjęcie. Fioletowy znaczek oznacza, że osoba jest zweryfikowana.',privacy:'Prywatność: historia czatu jest zapisywana na urządzeniu, a nie na stałe na serwerze Qevyno.',blocked:'Nie możesz pisać na ten numer.'},
    tr:{name:'Qevyno Yardım',preview:'Qevyno kullanımı için yardım',intro:'Qevyno Yardım’a hoş geldin. Bu, uygulamaya yerleşik bir yardım kişisidir.',start:'Sohbet başlat: + düğmesine dokun ve diğer kişinin numarasını ülke kodu olmadan gir.',qr:'QR kodu: QR kodunu göstermek için + veya Ayarlar’ı aç. Başka biri kodu tarayarak seninle sohbet başlatabilir.',msg:'Mesajlar: tepki eklemek veya silmek için bir mesaja basılı tut.',profile:'Profil: profil resmini değiştirmek için üç nokta menüsünü ve Ayarlar’ı aç. Mor onay işareti kişinin doğrulandığını gösterir.',privacy:'Gizlilik: sohbet geçmişin cihazında saklanır, Qevyno sunucusunda kalıcı olarak tutulmaz.',blocked:'Bu numaraya mesaj gönderemezsin.'},
    uk:{name:'Допомога Qevyno',preview:'Допомога з використання Qevyno',intro:'Ласкаво просимо до довідки Qevyno. Це вбудований контакт допомоги.',start:'Почати чат: натисни + і введи номер іншої людини без коду країни.',qr:'QR-код: відкрий + або Налаштування, щоб показати свій QR. Інша людина може відсканувати його та почати чат з тобою.',msg:'Повідомлення: затисни повідомлення, щоб додати реакцію або видалити його.',profile:'Профіль: відкрий меню з трьома крапками та Налаштування, щоб змінити фото. Фіолетова позначка означає, що особу підтверджено.',privacy:'Приватність: історія чату зберігається на твоєму пристрої, а не постійно на сервері Qevyno.',blocked:'Ти не можеш писати на цей номер.'},
    ru:{name:'Помощь Qevyno',preview:'Помощь по использованию Qevyno',intro:'Добро пожаловать в помощь Qevyno. Это встроенный справочный контакт.',start:'Начать чат: нажмите + и введите номер другого человека без кода страны.',qr:'QR-код: откройте + или Настройки, чтобы показать свой QR. Другой человек может отсканировать его и начать чат с вами.',msg:'Сообщения: удерживайте сообщение, чтобы добавить реакцию или удалить его.',profile:'Профиль: откройте меню с тремя точками и Настройки, чтобы изменить фото. Фиолетовая галочка означает, что человек подтверждён.',privacy:'Конфиденциальность: история чата хранится на вашем устройстве, а не постоянно на сервере Qevyno.',blocked:'Вы не можете писать на этот номер.'},
    ja:{name:'Qevyno ヘルプ',preview:'Qevyno の使い方',intro:'Qevyno ヘルプへようこそ。これはアプリ内のヘルプ用連絡先です。',start:'チャットを開始するには、+ をタップして相手の電話番号を国番号なしで入力します。',qr:'QRコード: + または設定から自分のQRコードを表示できます。相手がスキャンするとあなたとのチャットを開始できます。',msg:'メッセージ: 長押しするとリアクションの追加や削除ができます。',profile:'プロフィール: 3点メニューから設定を開いてプロフィール画像を変更できます。紫のチェックは認証済みの相手を示します。',privacy:'プライバシー: チャット履歴は端末に保存され、Qevynoサーバーには永久保存されません。',blocked:'この番号にはメッセージを送信できません。'},
    ko:{name:'Qevyno 도움말',preview:'Qevyno 사용 도움말',intro:'Qevyno 도움말입니다. 앱에 기본으로 포함된 도움말 연락처입니다.',start:'채팅 시작: +를 누르고 상대방의 전화번호를 국가번호 없이 입력하세요.',qr:'QR 코드: + 또는 설정에서 내 QR 코드를 표시할 수 있습니다. 다른 사람이 스캔하면 나와 채팅을 시작할 수 있습니다.',msg:'메시지: 메시지를 길게 눌러 반응을 추가하거나 삭제할 수 있습니다.',profile:'프로필: 점 3개 메뉴의 설정에서 프로필 사진을 바꿀 수 있습니다. 보라색 체크는 인증된 사람을 뜻합니다.',privacy:'개인정보: 채팅 기록은 기기에 저장되며 Qevyno 서버에 영구 저장되지 않습니다.',blocked:'이 번호로는 메시지를 보낼 수 없습니다.'},
    zh:{name:'Qevyno 帮助',preview:'Qevyno 使用帮助',intro:'欢迎使用 Qevyno 帮助。这是应用内置的帮助联系人。',start:'开始聊天：点击 +，输入对方的电话号码，不需要国家区号。',qr:'二维码：打开 + 或设置即可显示你的二维码。其他人扫描后可直接与你开始聊天。',msg:'消息：长按消息可以添加表情反应或删除消息。',profile:'个人资料：打开三点菜单和设置即可更换头像。紫色勾表示该用户已验证。',privacy:'隐私：聊天记录保存在你的设备上，不会永久保存在 Qevyno 服务器。',blocked:'你不能向这个号码发送消息。'},
    ar:{name:'مساعدة Qevyno',preview:'مساعدة في استخدام Qevyno',intro:'مرحبًا بك في مساعدة Qevyno. هذا جهة اتصال مساعدة مدمجة في التطبيق.',start:'لبدء محادثة: اضغط + وأدخل رقم هاتف الشخص الآخر بدون رمز الدولة.',qr:'رمز QR: افتح + أو الإعدادات لعرض رمزك. يمكن لشخص آخر مسحه لبدء محادثة معك.',msg:'الرسائل: اضغط مطولًا على الرسالة لإضافة تفاعل أو حذفها.',profile:'الملف الشخصي: افتح قائمة النقاط الثلاث ثم الإعدادات لتغيير الصورة. علامة الصح البنفسجية تعني أن الشخص موثّق.',privacy:'الخصوصية: يتم حفظ سجل المحادثة على جهازك وليس بشكل دائم على خادم Qevyno.',blocked:'لا يمكنك الكتابة إلى هذا الرقم.'}
  };
  const tr=()=>T[lang()]||T.en;

  const style=document.createElement('style');
  style.id='qevyno299style';
  style.textContent=`
    .q299helpRow{cursor:pointer!important;background:#f8ffff!important}.q299helpRow .q26avatar{background:#20c6c9!important;color:#fff!important;font-weight:800!important}.q299helpRow .q26preview{color:#60747d!important}.q299helpRow .q299tag{font-size:10px;font-weight:700;color:#159fa3;background:#e4f8f8;border-radius:999px;padding:3px 6px;white-space:nowrap}
    .q299screen{position:fixed;inset:0;z-index:470;background:#edf4f5;display:flex;flex-direction:column;opacity:0;visibility:hidden;pointer-events:none;transform:translate3d(0,6px,0);transition:opacity 190ms ease,transform 240ms cubic-bezier(.22,1,.36,1),visibility 190ms ease}.q299screen.on{opacity:1;visibility:visible;pointer-events:auto;transform:none}
    .q299top{min-height:60px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;background:#fff;border-bottom:1px solid #dce5e9;display:flex;align-items:center;gap:10px}.q299back{width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:#60747d;font-size:28px;display:grid;place-items:center}.q299avatar{width:40px;height:40px;border-radius:50%;background:#20c6c9;color:#fff;font-weight:800;display:grid;place-items:center}.q299head{min-width:0}.q299name{font-size:15.5px;font-weight:700;color:#17212b}.q299num{font-size:11px;color:#82929a;margin-top:1px}.q299messages{flex:1;overflow:auto;padding:14px 11px 22px;display:flex;flex-direction:column;gap:7px}.q299bubble{max-width:88%;align-self:flex-start;background:#fff;border:1px solid #dce6e9;border-radius:12px;padding:10px 11px;color:#17212b;font-size:14.5px;line-height:1.42;box-shadow:0 1px 2px rgba(23,33,43,.04);animation:q299in 230ms cubic-bezier(.22,1,.36,1) both}.q299bubble:nth-child(2){animation-delay:25ms}.q299bubble:nth-child(3){animation-delay:50ms}.q299bubble:nth-child(4){animation-delay:75ms}.q299bubble:nth-child(5){animation-delay:100ms}.q299bubble:nth-child(6){animation-delay:125ms}@keyframes q299in{from{opacity:0;transform:translateY(7px) scale(.99)}to{opacity:1;transform:none}}
    .q299composer{display:flex;align-items:center;padding:8px 10px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #dce5e9}.q299composer input{width:100%;height:48px;border:1px solid #dde6e9;border-radius:24px;background:#f3f6f7;color:#7b8b93;padding:0 16px;font-size:13.5px;outline:none}.q299composer input:disabled{opacity:1;-webkit-text-fill-color:#7b8b93}
  `;
  document.head.appendChild(style);

  const screen=document.createElement('section');
  screen.className='q299screen';
  screen.setAttribute('aria-hidden','true');
  screen.innerHTML='<div class="q299top"><button class="q299back" aria-label="Back">‹</button><div class="q299avatar">Q</div><div class="q299head"><div class="q299name"></div><div class="q299num">'+HELP_NUMBER+'</div></div></div><div class="q299messages"></div><div class="q299composer"><input disabled></div>';
  document.body.appendChild(screen);

  function renderHelp(){
    const x=tr();
    screen.querySelector('.q299name').textContent=x.name;
    const box=screen.querySelector('.q299messages');
    box.innerHTML=[x.intro,x.start,x.qr,x.msg,x.profile,x.privacy].map(v=>'<div class="q299bubble"></div>').join('');
    [...box.children].forEach((el,i)=>el.textContent=[x.intro,x.start,x.qr,x.msg,x.profile,x.privacy][i]);
    screen.querySelector('.q299composer input').placeholder=x.blocked;
  }
  function closeNewSheet(){
    const s=D('newChatSheet');if(s)s.classList.remove('open');
    document.querySelectorAll('.sheetBack.open').forEach(el=>{if(el.id==='newChatSheet')el.classList.remove('open')});
  }
  function openHelp(){renderHelp();closeNewSheet();screen.classList.add('on');screen.setAttribute('aria-hidden','false');}
  function closeHelp(){screen.classList.remove('on');screen.setAttribute('aria-hidden','true');}
  screen.querySelector('.q299back').onclick=closeHelp;

  function helpRow(){
    const x=tr(),row=document.createElement('div');
    row.className='q26row q299helpRow';row.tabIndex=0;row.setAttribute('role','button');row.dataset.q299='1';
    row.innerHTML='<div class="q26avatar">Q</div><div class="q26info"><div class="q26nameLine"><div class="q26name"></div><span class="q299tag">'+HELP_NUMBER+'</span></div><div class="q26preview"></div></div><div class="q26right"></div>';
    row.querySelector('.q26name').textContent=x.name;row.querySelector('.q26preview').textContent=x.preview;
    row.onclick=openHelp;row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHelp();}};
    return row;
  }
  function ensureHelp(){
    const people=D('people');if(!people)return;
    let row=people.querySelector('.q299helpRow');
    if(!row){row=helpRow();people.prepend(row);}else{
      const x=tr();const n=row.querySelector('.q26name'),p=row.querySelector('.q26preview');if(n)n.textContent=x.name;if(p)p.textContent=x.preview;
    }
    people.querySelectorAll('.q26empty').forEach(el=>el.style.display='none');
  }
  function rawHelpInput(){const f=D('findPhone');return !!f&&String(f.value||'').replace(/\D/g,'')===HELP_NUMBER;}
  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('#findBtn');
    if(!b||!rawHelpInput())return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openHelp();
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&screen.classList.contains('on')){e.preventDefault();closeHelp();return;}
    if(e.key==='Enter'&&e.target===D('findPhone')&&rawHelpInput()){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openHelp();}
  },true);

  const obs=new MutationObserver(()=>requestAnimationFrame(ensureHelp));
  const people=D('people');if(people)obs.observe(people,{childList:true,subtree:false});
  ensureHelp();renderHelp();
  window.qevynoOpenHelp=()=>openHelp();
  setTimeout(()=>{ensureHelp();renderHelp();document.querySelectorAll('.small').forEach(el=>{if(/Qevyno\s+2\./i.test(el.textContent||''))el.textContent='Qevyno 2.9.9 • Android 8+';});},180);
})();