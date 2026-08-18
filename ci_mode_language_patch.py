from pathlib import Path
import py_compile

p = Path("Sliqadius.py")
s = p.read_text(encoding="utf-8")

MARKER = "SLIQADIUS_MODE_LANG_V1"
if MARKER in s:
    print("Mode/language patch already present")
    raise SystemExit(0)


def replace_once(old, new, name):
    global s
    if old not in s:
        raise RuntimeError(f"Patch marker not found: {name}")
    s = s.replace(old, new, 1)


replace_once(
    "from PySide6.QtCore import Qt, QThread, Signal, QSize, QUrl, QTimer, QPropertyAnimation, QEasingCurve",
    "from PySide6.QtCore import Qt, QThread, Signal, QSize, QUrl, QTimer, QPropertyAnimation, QEasingCurve, QLocale",
    "QtCore import",
)
replace_once(
    "QMessageBox, QListWidget, QListWidgetItem, QSizePolicy, QGraphicsOpacityEffect\n)",
    "QMessageBox, QListWidget, QListWidgetItem, QSizePolicy, QGraphicsOpacityEffect, QComboBox\n)",
    "QComboBox import",
)

lang_block = r'''
# SLIQADIUS_MODE_LANG_V1
SYSTEM_LANG = (QLocale.system().name().split("_")[0] or "en").lower()
LANGUAGE_NAMES = {
    "de":"Deutsch", "en":"English", "fr":"Français", "es":"Español",
    "it":"Italiano", "nl":"Nederlands", "pl":"Polski", "tr":"Türkçe",
    "pt":"Português", "ru":"Русский", "ja":"日本語", "ko":"한국어", "zh":"中文",
}
_UI = {
    "de": {"new_chat":"Neuer Chat","change_key":"API-Key ändern","placeholder":"Nachricht an Sliqadius","warning":"Sliqadius kann Fehler machen. Wichtige Informationen bitte prüfen.","welcome":"Was kann ich für dich tun?","hint":"Schreib eine Nachricht oder füge mit + ein Bild hinzu.","thinking":"Sliqadius denkt","pick_image":"Bild auswählen","default_image":"Was ist auf diesem Bild zu sehen?","fast":"Schnell","medium":"Mittel","smart":"Schlau","key_subtitle":"Sliqadius benötigt einen Groq API Key.\nDer Key wird nur auf diesem Gerät gespeichert.","create_key":"API Key kostenlos erstellen","show_key":"Key anzeigen","cancel":"Abbrechen","save":"Speichern"},
    "en": {"new_chat":"New Chat","change_key":"Change API Key","placeholder":"Message Sliqadius","warning":"Sliqadius can make mistakes. Check important information.","welcome":"How can I help you?","hint":"Write a message or add an image with +.","thinking":"Sliqadius is thinking","pick_image":"Choose image","default_image":"What is shown in this image?","fast":"Fast","medium":"Medium","smart":"Smart","key_subtitle":"Sliqadius needs a Groq API Key.\nThe key is stored only on this device.","create_key":"Create free API Key","show_key":"Show key","cancel":"Cancel","save":"Save"},
    "fr": {"new_chat":"Nouveau chat","change_key":"Modifier la clé API","placeholder":"Message à Sliqadius","warning":"Sliqadius peut faire des erreurs. Vérifiez les informations importantes.","welcome":"Que puis-je faire pour vous ?","hint":"Écrivez un message ou ajoutez une image avec +.","thinking":"Sliqadius réfléchit","pick_image":"Choisir une image","default_image":"Que montre cette image ?","fast":"Rapide","medium":"Moyen","smart":"Intelligent"},
    "es": {"new_chat":"Nuevo chat","change_key":"Cambiar clave API","placeholder":"Mensaje para Sliqadius","warning":"Sliqadius puede cometer errores. Comprueba la información importante.","welcome":"¿En qué puedo ayudarte?","hint":"Escribe un mensaje o añade una imagen con +.","thinking":"Sliqadius está pensando","pick_image":"Elegir imagen","default_image":"¿Qué aparece en esta imagen?","fast":"Rápido","medium":"Medio","smart":"Inteligente"},
    "it": {"new_chat":"Nuova chat","change_key":"Cambia chiave API","placeholder":"Messaggio a Sliqadius","warning":"Sliqadius può commettere errori. Verifica le informazioni importanti.","welcome":"Come posso aiutarti?","hint":"Scrivi un messaggio o aggiungi un'immagine con +.","thinking":"Sliqadius sta pensando","pick_image":"Scegli immagine","default_image":"Cosa c'è in questa immagine?","fast":"Veloce","medium":"Medio","smart":"Intelligente"},
    "nl": {"new_chat":"Nieuwe chat","change_key":"API-sleutel wijzigen","placeholder":"Bericht aan Sliqadius","warning":"Sliqadius kan fouten maken. Controleer belangrijke informatie.","welcome":"Waarmee kan ik je helpen?","hint":"Schrijf een bericht of voeg met + een afbeelding toe.","thinking":"Sliqadius denkt","pick_image":"Afbeelding kiezen","default_image":"Wat staat er op deze afbeelding?","fast":"Snel","medium":"Gemiddeld","smart":"Slim"},
    "pl": {"new_chat":"Nowy czat","change_key":"Zmień klucz API","placeholder":"Wiadomość do Sliqadius","warning":"Sliqadius może popełniać błędy. Sprawdzaj ważne informacje.","welcome":"W czym mogę pomóc?","hint":"Napisz wiadomość lub dodaj obraz przyciskiem +.","thinking":"Sliqadius myśli","pick_image":"Wybierz obraz","default_image":"Co znajduje się na tym obrazie?","fast":"Szybki","medium":"Średni","smart":"Mądry"},
    "tr": {"new_chat":"Yeni sohbet","change_key":"API anahtarını değiştir","placeholder":"Sliqadius'a mesaj","warning":"Sliqadius hata yapabilir. Önemli bilgileri kontrol edin.","welcome":"Sana nasıl yardımcı olabilirim?","hint":"Bir mesaj yaz veya + ile görsel ekle.","thinking":"Sliqadius düşünüyor","pick_image":"Görsel seç","default_image":"Bu görselde ne var?","fast":"Hızlı","medium":"Orta","smart":"Akıllı"},
    "pt": {"new_chat":"Novo chat","change_key":"Alterar chave API","placeholder":"Mensagem para Sliqadius","warning":"Sliqadius pode cometer erros. Verifique informações importantes.","welcome":"Como posso ajudar?","hint":"Escreva uma mensagem ou adicione uma imagem com +.","thinking":"Sliqadius está pensando","pick_image":"Escolher imagem","default_image":"O que aparece nesta imagem?","fast":"Rápido","medium":"Médio","smart":"Inteligente"},
    "ru": {"new_chat":"Новый чат","change_key":"Изменить API-ключ","placeholder":"Сообщение Sliqadius","warning":"Sliqadius может ошибаться. Проверяйте важную информацию.","welcome":"Чем я могу помочь?","hint":"Напишите сообщение или добавьте изображение кнопкой +.","thinking":"Sliqadius думает","pick_image":"Выбрать изображение","default_image":"Что изображено на этой картинке?","fast":"Быстро","medium":"Средне","smart":"Умно"},
    "ja": {"new_chat":"新しいチャット","change_key":"APIキーを変更","placeholder":"Sliqadiusにメッセージ","warning":"Sliqadiusは間違えることがあります。重要な情報は確認してください。","welcome":"何をお手伝いできますか？","hint":"メッセージを書くか、+で画像を追加してください。","thinking":"Sliqadiusが考えています","pick_image":"画像を選択","default_image":"この画像には何が写っていますか？","fast":"高速","medium":"標準","smart":"賢い"},
    "ko": {"new_chat":"새 채팅","change_key":"API 키 변경","placeholder":"Sliqadius에게 메시지","warning":"Sliqadius는 실수할 수 있습니다. 중요한 정보는 확인하세요.","welcome":"무엇을 도와드릴까요?","hint":"메시지를 쓰거나 +로 이미지를 추가하세요.","thinking":"Sliqadius가 생각 중","pick_image":"이미지 선택","default_image":"이 이미지에 무엇이 있나요?","fast":"빠름","medium":"중간","smart":"스마트"},
    "zh": {"new_chat":"新聊天","change_key":"更改 API 密钥","placeholder":"给 Sliqadius 发消息","warning":"Sliqadius 可能会出错。请核实重要信息。","welcome":"我能帮你做什么？","hint":"输入消息或用 + 添加图片。","thinking":"Sliqadius 正在思考","pick_image":"选择图片","default_image":"这张图片里有什么？","fast":"快速","medium":"中等","smart":"聪明"},
}

def tr(key):
    base = _UI["en"]
    return _UI.get(SYSTEM_LANG, base).get(key, base.get(key, key))
'''
replace_once(
    'KEY_URL = "https://console.groq.com/keys"\n',
    'KEY_URL = "https://console.groq.com/keys"\n' + lang_block + '\n',
    "language block",
)

replace_once(
    '    def __init__(self, key, messages, image_path=None):\n        super().__init__()\n        self.key = key\n        self.messages = messages\n        self.image_path = image_path\n',
    '    def __init__(self, key, messages, image_path=None, ai_mode="medium"):\n        super().__init__()\n        self.key = key\n        self.messages = messages\n        self.image_path = image_path\n        self.ai_mode = ai_mode\n',
    "ApiWorker init",
)

old_payload = '''            payload = {
                "model": model,
                "messages": payload_messages,
                "temperature": 0.6,
                "max_completion_tokens": 900 if self.image_path else 2800,
            }
'''
new_payload = '''            if self.image_path:
                reasoning_effort = "default" if self.ai_mode == "smart" else "none"
                max_tokens = {"fast": 450, "medium": 650, "smart": 900}.get(self.ai_mode, 650)
            elif self.ai_mode == "fast":
                model = "openai/gpt-oss-20b"
                reasoning_effort = "low"
                max_tokens = 1400
            elif self.ai_mode == "smart":
                model = "openai/gpt-oss-120b"
                reasoning_effort = "high"
                max_tokens = 2800
            else:
                model = "openai/gpt-oss-120b"
                reasoning_effort = "medium"
                max_tokens = 2200

            payload = {
                "model": model,
                "messages": payload_messages,
                "temperature": 0.6,
                "max_completion_tokens": max_tokens,
                "reasoning_effort": reasoning_effort,
                "reasoning_format": "hidden",
            }
'''
replace_once(old_payload, new_payload, "mode payload")

# Localize API key dialog essentials.
s = s.replace('subtitle = QLabel(\n            "Sliqadius benötigt einen Groq API Key.\\n"\n            "Der Key wird nur auf diesem PC gespeichert."\n        )', 'subtitle = QLabel(tr("key_subtitle"))', 1)
s = s.replace('link = QPushButton("API Key kostenlos erstellen")', 'link = QPushButton(tr("create_key"))', 1)
s = s.replace('show = QPushButton("Key anzeigen")', 'show = QPushButton(tr("show_key"))', 1)
s = s.replace('cancel = QPushButton("Abbrechen")', 'cancel = QPushButton(tr("cancel"))', 1)
s = s.replace('save = QPushButton("Speichern")', 'save = QPushButton(tr("save"))', 1)

replace_once('        self.label = QLabel("Sliqadius denkt")', '        self.label = QLabel(tr("thinking"))', "thinking label")
replace_once('        self.label.setText("Sliqadius denkt" + "." * self.step)', '        self.label.setText(tr("thinking") + "." * self.step)', "thinking tick")

replace_once('        self.animations = []\n\n        self.build_ui()', '        self.animations = []\n        self.ai_mode = "medium"\n\n        self.build_ui()', "default mode")

replace_once('        new_btn = QPushButton("+  Neuer Chat")', '        new_btn = QPushButton("+  " + tr("new_chat"))', "new chat text")
replace_once('        api_btn = QPushButton("API-Key ändern")', '        api_btn = QPushButton(tr("change_key"))', "api button")
replace_once('                border-radius:25px; padding:14px 58px 14px 52px; font-size:14px;', '                border-radius:25px; padding:14px 150px 14px 52px; font-size:14px;', "composer padding")
replace_once('        self.input.setPlaceholderText("Nachricht an Sliqadius")', '        self.input.setPlaceholderText(tr("placeholder"))', "placeholder")

combo_block = '''        self.mode_combo = QComboBox(self.composer_box)
        self.mode_combo.setFixedSize(88, 34)
        self.mode_combo.addItem(tr("fast"), "fast")
        self.mode_combo.addItem(tr("medium"), "medium")
        self.mode_combo.addItem(tr("smart"), "smart")
        self.mode_combo.setCurrentIndex(1)
        self.mode_combo.setStyleSheet("""
            QComboBox {
                background:transparent; color:#bfc0c5; border:none;
                border-radius:10px; padding:5px 20px 5px 7px; font-size:12px;
            }
            QComboBox:hover { background:#35373c; color:#ffffff; }
            QComboBox::drop-down { border:none; width:18px; }
            QComboBox QAbstractItemView {
                background:#292a2e; color:#eeeeee; border:1px solid #3d3f44;
                selection-background-color:#3a3c42; padding:4px;
            }
        """)
        self.mode_combo.currentIndexChanged.connect(self._mode_changed)

'''
replace_once('        self.send_btn = QPushButton("↑", self.composer_box)\n', combo_block + '        self.send_btn = QPushButton("↑", self.composer_box)\n', "mode combo")
replace_once('        note = QLabel("Sliqadius kann Fehler machen. Wichtige Informationen bitte prüfen.")', '        note = QLabel(tr("warning"))', "warning")

replace_once(
    '            self.plus_btn.move(8, 8)\n            self.send_btn.move(width - 44, 8)',
    '            self.plus_btn.move(8, 8)\n            self.mode_combo.move(width - 138, 9)\n            self.send_btn.move(width - 44, 8)',
    "mode combo geometry",
)

method_block = '''    def _mode_changed(self, index):
        try:
            self.ai_mode = self.mode_combo.itemData(index) or "medium"
        except Exception:
            self.ai_mode = "medium"

'''
replace_once('    def showEvent(self, event):\n', method_block + '    def showEvent(self, event):\n', "mode method")

replace_once('        title = QLabel("Was kann ich für dich tun?")', '        title = QLabel(tr("welcome"))', "welcome")
replace_once('        hint = QLabel("Schreib eine Nachricht oder füge mit + ein Bild hinzu.")', '        hint = QLabel(tr("hint"))', "welcome hint")
replace_once('        self.current_chat = {"title": "Neuer Chat", "messages": []}', '        self.current_chat = {"title": tr("new_chat"), "messages": []}', "new chat object")
replace_once('            "Bild auswählen",', '            tr("pick_image"),', "pick image")
replace_once('        display_text = text if text else "Was ist auf diesem Bild zu sehen?"', '        display_text = text if text else tr("default_image")', "default image text")
replace_once('        if self.current_chat.get("title") in ("", "Neuer Chat"):', '        if self.current_chat.get("title") in ("", "Neuer Chat", tr("new_chat")):', "title check")

replace_once(
    '        api_messages = [{\n',
    '        language_name = LANGUAGE_NAMES.get(SYSTEM_LANG, SYSTEM_LANG)\n        mode_instruction = {\n            "fast": "Priorisiere Geschwindigkeit. Antworte direkt und kompakt und nutze nur wenig internes Reasoning.",\n            "medium": "Nutze eine ausgewogene Mischung aus Geschwindigkeit, Genauigkeit und Reasoning.",\n            "smart": "Priorisiere Genauigkeit und gründliches Problemlösen. Bei schwierigen Aufgaben darfst du stärker intern reasonen.",\n        }.get(self.ai_mode, "Nutze eine ausgewogene Mischung aus Geschwindigkeit und Genauigkeit.")\n\n        api_messages = [{\n',
    "language prompt variables",
)
replace_once(
    '                "Du bist Sliqadius, ein schneller, hilfreicher KI-Assistent. "',
    '                f"Du bist Sliqadius, ein schneller, hilfreicher KI-Assistent. Die automatisch erkannte Systemsprache des Geräts ist {language_name}. Antworte standardmäßig in dieser Sprache, außer der Nutzer schreibt klar in einer anderen Sprache oder bittet um eine andere Sprache. {mode_instruction} "',
    "system language prompt",
)
replace_once(
    'Kurze Antworten sind nur bei wirklich einfachen Fragen oder wenn der Nutzer ausdrücklich eine kurze Antwort möchte. Antworte auf Deutsch, wenn der Nutzer Deutsch schreibt. "',
    'Kurze Antworten sind nur bei wirklich einfachen Fragen oder wenn der Nutzer ausdrücklich eine kurze Antwort möchte. "',
    "remove forced German",
)
replace_once('        self.worker = ApiWorker(key, api_messages, image_path)', '        self.worker = ApiWorker(key, api_messages, image_path, self.ai_mode)', "worker mode")

p.write_text(s, encoding="utf-8", newline="\n")
py_compile.compile(str(p), doraise=True)
print("Applied SLIQADIUS_MODE_LANG_V1 successfully")
