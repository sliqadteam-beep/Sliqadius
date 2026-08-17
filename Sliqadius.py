import sys, os, json, base64, mimetypes, requests
from PySide6.QtCore import Qt, QThread, Signal, QSize, QUrl, QTimer, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QFont, QPixmap, QDesktopServices
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QLineEdit, QFileDialog, QScrollArea, QFrame, QDialog,
    QMessageBox, QListWidget, QListWidgetItem, QSizePolicy, QGraphicsOpacityEffect
)

APP_NAME = "Sliqadius"
TEXT_MODEL = "openai/gpt-oss-120b"
VISION_MODEL = "qwen/qwen3.6-27b"
API_URL = "https://api.groq.com/openai/v1/chat/completions"
KEY_URL = "https://console.groq.com/keys"

DATA_DIR = os.path.join(os.path.expanduser("~"), ".sliqadius")
KEY_FILE = os.path.join(DATA_DIR, "groq_key.txt")
CHATS_FILE = os.path.join(DATA_DIR, "chats.json")
os.makedirs(DATA_DIR, exist_ok=True)


def read_key():
    try:
        with open(KEY_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    except Exception:
        return ""


def write_key(key):
    with open(KEY_FILE, "w", encoding="utf-8") as f:
        f.write(key.strip())


def load_chats():
    try:
        with open(CHATS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def save_chats(chats):
    try:
        with open(CHATS_FILE, "w", encoding="utf-8") as f:
            json.dump(chats, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


class ApiWorker(QThread):
    done = Signal(str)
    failed = Signal(str)

    def __init__(self, key, messages, image_path=None):
        super().__init__()
        self.key = key
        self.messages = messages
        self.image_path = image_path

    def run(self):
        try:
            headers = {
                "Authorization": f"Bearer {self.key}",
                "Content-Type": "application/json",
            }
            model = TEXT_MODEL
            payload_messages = list(self.messages)

            if self.image_path:
                model = VISION_MODEL
                if not os.path.isfile(self.image_path):
                    raise RuntimeError("Das ausgewählte Bild wurde nicht gefunden.")

                with open(self.image_path, "rb") as f:
                    raw = f.read()

                if len(raw) > 3_000_000:
                    raise RuntimeError("Das Bild ist zu groß. Bitte wähle ein Bild unter etwa 3 MB.")

                mime = mimetypes.guess_type(self.image_path)[0] or "image/jpeg"
                encoded = base64.b64encode(raw).decode("ascii")

                last_text = "Beschreibe und analysiere dieses Bild."
                if payload_messages and payload_messages[-1].get("role") == "user":
                    last_text = payload_messages[-1].get("content") or last_text
                    payload_messages = payload_messages[:-1]

                payload_messages.append({
                    "role": "user",
                    "content": [
                        {"type": "text", "text": last_text},
                        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{encoded}"}},
                    ],
                })

            payload = {
                "model": model,
                "messages": payload_messages,
                "temperature": 0.6,
                "max_completion_tokens": 2048,
            }

            response = requests.post(API_URL, headers=headers, json=payload, timeout=120)

            if response.status_code != 200:
                try:
                    detail = response.json().get("error", {}).get("message", response.text)
                except Exception:
                    detail = response.text
                raise RuntimeError(detail[:1000])

            answer = response.json()["choices"][0]["message"]["content"]
            self.done.emit((answer or "").strip())

        except Exception as exc:
            self.failed.emit(str(exc))


class KeyDialog(QDialog):
    def __init__(self, parent=None, required=True):
        super().__init__(parent)
        self.required = required
        self.setWindowTitle("Groq API Key")
        self.setFixedSize(510, 320)
        self.setModal(True)
        self.setStyleSheet("""
            QDialog { background:#202123; color:#f4f4f4; }
            QLabel { color:#f4f4f4; background:transparent; }
            QLineEdit {
                background:#2b2c2f; color:#fff; border:1px solid #3b3d42;
                border-radius:13px; padding:12px 14px; font-size:14px;
            }
            QLineEdit:focus { border:1px solid #686b73; }
            QPushButton {
                background:#2c2d30; color:#e8e8e8; border:1px solid #3b3d42;
                border-radius:10px; padding:10px 15px; font-weight:600;
            }
            QPushButton:hover { background:#35363a; }
            QPushButton#primary { background:#f4f4f4; color:#171717; border:none; }
            QPushButton#primary:hover { background:#ffffff; }
            QPushButton#link {
                background:transparent; border:none; color:#9fc4ff;
                padding:0; text-align:left; font-weight:500;
            }
        """)

        root = QVBoxLayout(self)
        root.setContentsMargins(30, 27, 30, 24)
        root.setSpacing(13)

        title = QLabel("Groq API Key")
        title.setStyleSheet("font-size:24px;font-weight:700;")
        root.addWidget(title)

        subtitle = QLabel(
            "Sliqadius benötigt einen Groq API Key.\n"
            "Der Key wird nur auf diesem PC gespeichert."
        )
        subtitle.setWordWrap(True)
        subtitle.setStyleSheet("color:#a6a7ac;font-size:13px;")
        root.addWidget(subtitle)

        link = QPushButton("API Key kostenlos erstellen")
        link.setObjectName("link")
        link.clicked.connect(lambda: QDesktopServices.openUrl(QUrl(KEY_URL)))
        root.addWidget(link)

        self.edit = QLineEdit()
        self.edit.setPlaceholderText("gsk_...")
        self.edit.setEchoMode(QLineEdit.Password)
        old = read_key()
        if old:
            self.edit.setText(old)
        root.addWidget(self.edit)

        row2 = QHBoxLayout()
        show = QPushButton("Key anzeigen")
        show.setCheckable(True)
        show.setFixedWidth(118)
        show.toggled.connect(
            lambda on: self.edit.setEchoMode(QLineEdit.Normal if on else QLineEdit.Password)
        )
        row2.addWidget(show)
        row2.addStretch()
        root.addLayout(row2)

        root.addStretch()

        row = QHBoxLayout()
        row.addStretch()

        if not required:
            cancel = QPushButton("Abbrechen")
            cancel.clicked.connect(self.reject)
            row.addWidget(cancel)

        save = QPushButton("Speichern")
        save.setObjectName("primary")
        save.clicked.connect(self.save_and_close)
        row.addWidget(save)
        root.addLayout(row)

        self.edit.returnPressed.connect(self.save_and_close)

    def save_and_close(self):
        key = self.edit.text().strip()
        if not key:
            QMessageBox.warning(self, "API Key fehlt", "Bitte gib deinen Groq API Key ein.")
            return
        try:
            write_key(key)
            self.accept()
        except Exception as exc:
            QMessageBox.critical(
                self, "Fehler", f"Der API Key konnte nicht gespeichert werden:\n{exc}"
            )


class MessageBubble(QFrame):
    def __init__(self, role, text, image_path=None):
        super().__init__()
        self.role = role
        is_user = role == "user"
        self.setObjectName("userBubble" if is_user else "assistantBubble")
        self.setMaximumWidth(760)
        self.setSizePolicy(QSizePolicy.Maximum, QSizePolicy.Minimum)

        if is_user:
            self.setStyleSheet("""
                QFrame#userBubble {
                    background:#303030;
                    border:1px solid #3a3a3a;
                    border-radius:18px;
                }
                QLabel { color:#f1f1f1; background:transparent; }
            """)
        else:
            self.setStyleSheet("""
                QFrame#assistantBubble {
                    background:transparent;
                    border:none;
                }
                QLabel { color:#ededed; background:transparent; }
            """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(17 if is_user else 5, 12, 17 if is_user else 5, 12)
        layout.setSpacing(9)

        if image_path and os.path.isfile(image_path):
            pixmap = QPixmap(image_path)
            if not pixmap.isNull():
                pixmap = pixmap.scaled(340, 240, Qt.KeepAspectRatio, Qt.SmoothTransformation)
                image = QLabel()
                image.setPixmap(pixmap)
                image.setStyleSheet("border-radius:12px;background:transparent;")
                layout.addWidget(image)

        label = QLabel()
        label.setTextFormat(Qt.PlainText)
        label.setText(text or "")
        label.setWordWrap(True)
        label.setTextInteractionFlags(Qt.TextSelectableByMouse)
        label.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Minimum)
        label.setMaximumWidth(720)
        label.setStyleSheet(
            "font-size:14px;line-height:1.35;background:transparent;padding:0;margin:0;"
        )
        layout.addWidget(label)


class ThinkingWidget(QWidget):
    def __init__(self):
        super().__init__()
        row = QHBoxLayout(self)
        row.setContentsMargins(5, 2, 0, 2)

        self.label = QLabel("Sliqadius denkt")
        self.label.setStyleSheet("color:#98999f;font-size:13px;background:transparent;")
        row.addWidget(self.label)
        row.addStretch()

        self.step = 0
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.tick)
        self.timer.start(360)

    def tick(self):
        self.step = (self.step + 1) % 4
        self.label.setText("Sliqadius denkt" + "." * self.step)

    def stop(self):
        self.timer.stop()


class ChatWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle(APP_NAME)
        self.resize(1180, 780)
        self.setMinimumSize(860, 580)

        self.chats = load_chats()
        self.current_chat = None
        self.image_path = None
        self.worker = None
        self.animations = []

        self.build_ui()
        self.refresh_chat_list()
        self.new_chat(initial=True)

    def build_ui(self):
        self.setStyleSheet("""
            QMainWindow { background:#212121; color:#ececec; }
            QWidget { font-family:"Segoe UI"; font-size:13px; }
            QWidget#root, QWidget#content, QWidget#messagesHost, QWidget#bottomArea {
                background:#212121;
            }
            QFrame#sidebar {
                background:#171717;
                border:none;
                border-right:1px solid #242424;
            }
            QLabel#brand { font-size:18px; font-weight:700; color:#f4f4f4; }
            QLabel#welcome { font-size:30px; font-weight:650; color:#f2f2f2; }
            QLabel#hint { font-size:13px; color:#8f9095; }
            QPushButton {
                background:transparent; color:#d9d9d9; border:none;
                border-radius:10px; padding:9px 11px; text-align:left;
            }
            QPushButton:hover { background:#242424; }
            QPushButton#newChat {
                background:#202020; border:1px solid #2e2e2e; font-weight:600;
            }
            QPushButton#newChat:hover { background:#292929; border:1px solid #393939; }
            QListWidget {
                background:transparent; border:none; color:#babcc1;
                outline:none; padding:0;
            }
            QListWidget::item {
                padding:9px 10px; border-radius:8px; margin:1px 0;
            }
            QListWidget::item:selected { background:#292929; color:white; }
            QListWidget::item:hover { background:#222222; }
            QScrollArea {
                background:#212121; border:none;
            }
            QScrollBar:vertical {
                background:transparent; width:9px; margin:4px 1px 4px 0;
            }
            QScrollBar::handle:vertical {
                background:#444; min-height:30px; border-radius:4px;
            }
            QScrollBar::handle:vertical:hover { background:#555; }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height:0; background:none;
            }
            QLineEdit#composer {
                background:#2f2f2f; color:#f4f4f4; border:1px solid #3c3c3c;
                border-radius:25px; padding:14px 58px 14px 52px; font-size:14px;
            }
            QLineEdit#composer:focus { border:1px solid #55565b; }
            QPushButton#round {
                background:#3a3a3a; color:#ededed; border:none; border-radius:18px;
                padding:0; text-align:center; font-size:21px; font-weight:400;
            }
            QPushButton#round:hover { background:#484848; }
            QPushButton#send {
                background:#f2f2f2; color:#171717; border:none; border-radius:18px;
                padding:0; text-align:center; font-size:17px; font-weight:700;
            }
            QPushButton#send:hover { background:#ffffff; }
            QPushButton#send:disabled { background:#464646; color:#777; }
            QFrame#imageChip {
                background:#292929; border:1px solid #3a3a3a; border-radius:12px;
            }
        """)

        root = QWidget()
        root.setObjectName("root")
        self.setCentralWidget(root)

        main = QHBoxLayout(root)
        main.setContentsMargins(0, 0, 0, 0)
        main.setSpacing(0)

        sidebar = QFrame()
        sidebar.setObjectName("sidebar")
        sidebar.setFixedWidth(230)

        side = QVBoxLayout(sidebar)
        side.setContentsMargins(12, 15, 12, 14)
        side.setSpacing(9)

        brand = QLabel("Sliqadius")
        brand.setObjectName("brand")
        brand.setContentsMargins(7, 1, 0, 5)
        side.addWidget(brand)

        new_btn = QPushButton("+  Neuer Chat")
        new_btn.setObjectName("newChat")
        new_btn.clicked.connect(self.new_chat)
        side.addWidget(new_btn)

        self.chat_list = QListWidget()
        self.chat_list.itemClicked.connect(self.open_chat_from_item)
        side.addWidget(self.chat_list, 1)

        api_btn = QPushButton("API-Key ändern")
        api_btn.clicked.connect(self.change_key)
        side.addWidget(api_btn)

        main.addWidget(sidebar)

        content = QWidget()
        content.setObjectName("content")
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(0)

        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.scroll.setVerticalScrollBarPolicy(Qt.ScrollBarAsNeeded)
        self.scroll.setFrameShape(QFrame.NoFrame)
        self.scroll.viewport().setStyleSheet("background:#212121;border:none;")

        self.messages_host = QWidget()
        self.messages_host.setObjectName("messagesHost")
        self.messages_layout = QVBoxLayout(self.messages_host)
        self.messages_layout.setContentsMargins(76, 42, 76, 28)
        self.messages_layout.setSpacing(17)
        self.messages_layout.addStretch(1)

        self.scroll.setWidget(self.messages_host)
        content_layout.addWidget(self.scroll, 1)

        bottom_area = QWidget()
        bottom_area.setObjectName("bottomArea")
        bottom_outer = QVBoxLayout(bottom_area)
        bottom_outer.setContentsMargins(22, 6, 22, 16)
        bottom_outer.setSpacing(7)

        center_row = QHBoxLayout()
        center_row.setContentsMargins(0, 0, 0, 0)
        center_row.addStretch()

        composer_panel = QWidget()
        composer_panel.setMaximumWidth(820)
        composer_layout = QVBoxLayout(composer_panel)
        composer_layout.setContentsMargins(0, 0, 0, 0)
        composer_layout.setSpacing(7)

        self.image_chip = QFrame()
        self.image_chip.setObjectName("imageChip")
        self.image_chip.hide()
        chip = QHBoxLayout(self.image_chip)
        chip.setContentsMargins(11, 7, 8, 7)

        self.image_name = QLabel()
        self.image_name.setStyleSheet("color:#c7c7ca;font-size:12px;background:transparent;")
        remove = QPushButton("×")
        remove.setFixedSize(25, 25)
        remove.setStyleSheet(
            "font-size:17px;padding:0;text-align:center;background:transparent;border:none;"
        )
        remove.clicked.connect(self.clear_image)

        chip.addWidget(self.image_name)
        chip.addStretch()
        chip.addWidget(remove)
        composer_layout.addWidget(self.image_chip)

        self.composer_box = QWidget()
        self.composer_box.setFixedHeight(52)

        self.input = QLineEdit(self.composer_box)
        self.input.setObjectName("composer")
        self.input.setPlaceholderText("Nachricht an Sliqadius")
        self.input.returnPressed.connect(self.send_message)
        self.input.textChanged.connect(self.update_send_enabled)

        self.plus_btn = QPushButton("+", self.composer_box)
        self.plus_btn.setObjectName("round")
        self.plus_btn.setFixedSize(36, 36)
        self.plus_btn.clicked.connect(self.pick_image)

        self.send_btn = QPushButton("↑", self.composer_box)
        self.send_btn.setObjectName("send")
        self.send_btn.setFixedSize(36, 36)
        self.send_btn.clicked.connect(self.send_message)

        composer_layout.addWidget(self.composer_box)

        note = QLabel("Sliqadius kann Fehler machen. Wichtige Informationen bitte prüfen.")
        note.setAlignment(Qt.AlignCenter)
        note.setStyleSheet("color:#6f7075;font-size:10px;background:transparent;")
        composer_layout.addWidget(note)

        center_row.addWidget(composer_panel, 1)
        center_row.addStretch()

        bottom_outer.addLayout(center_row)
        content_layout.addWidget(bottom_area)

        main.addWidget(content, 1)

        self.update_send_enabled()

    def showEvent(self, event):
        super().showEvent(event)
        if not hasattr(self, "_window_faded"):
            self._window_faded = True
            self.setWindowOpacity(0.0)
            animation = QPropertyAnimation(self, b"windowOpacity", self)
            animation.setDuration(260)
            animation.setStartValue(0.0)
            animation.setEndValue(1.0)
            animation.setEasingCurve(QEasingCurve.OutCubic)
            animation.start()
            self.animations.append(animation)
            animation.finished.connect(lambda: self._release_animation(animation))

    def _release_animation(self, animation):
        if animation in self.animations:
            self.animations.remove(animation)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        try:
            width = self.composer_box.width()
            self.input.setGeometry(0, 0, width, 52)
            self.plus_btn.move(8, 8)
            self.send_btn.move(width - 44, 8)

            viewport_width = max(500, self.scroll.viewport().width())
            margins = max(34, min(105, int((viewport_width - 820) / 2)))
            self.messages_layout.setContentsMargins(margins, 42, margins, 28)
        except Exception:
            pass

    def update_send_enabled(self):
        busy = bool(self.worker and self.worker.isRunning())
        self.send_btn.setEnabled(
            bool(self.input.text().strip() or self.image_path) and not busy
        )

    def clear_messages(self):
        while self.messages_layout.count() > 1:
            item = self.messages_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

    def scroll_to_bottom(self, target=None):
        def apply_scroll():
            try:
                if target is not None:
                    self.scroll.ensureWidgetVisible(target, 0, 32)
                bar = self.scroll.verticalScrollBar()
                bar.setValue(bar.maximum())
            except Exception:
                pass

        QTimer.singleShot(0, apply_scroll)
        QTimer.singleShot(40, apply_scroll)
        QTimer.singleShot(120, apply_scroll)

    def fade_in_widget(self, widget, duration=180):
        effect = QGraphicsOpacityEffect(widget)
        effect.setOpacity(0.0)
        widget.setGraphicsEffect(effect)

        animation = QPropertyAnimation(effect, b"opacity", self)
        animation.setDuration(duration)
        animation.setStartValue(0.0)
        animation.setEndValue(1.0)
        animation.setEasingCurve(QEasingCurve.OutCubic)

        self.animations.append(animation)

        def finish():
            try:
                widget.setGraphicsEffect(None)
                effect.deleteLater()
            except Exception:
                pass
            self._release_animation(animation)
            self.scroll_to_bottom(widget)

        animation.finished.connect(finish)
        animation.start()

    def add_bubble(self, role, text, image_path=None, animate=True):
        row = QWidget()
        row.setStyleSheet("background:transparent;")
        row.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Minimum)

        row_layout = QHBoxLayout(row)
        row_layout.setContentsMargins(0, 0, 0, 0)
        row_layout.setSpacing(0)

        bubble = MessageBubble(role, text, image_path)

        if role == "user":
            row_layout.addStretch(1)
            row_layout.addWidget(bubble, 0)
        else:
            row_layout.addWidget(bubble, 0)
            row_layout.addStretch(1)

        self.messages_layout.insertWidget(self.messages_layout.count() - 1, row)
        row.adjustSize()
        self.messages_host.adjustSize()

        if animate:
            self.fade_in_widget(row)
        else:
            self.scroll_to_bottom(row)

        return row

    def show_welcome(self):
        card = QWidget()
        card.setStyleSheet("background:transparent;")
        card.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)

        layout = QVBoxLayout(card)
        layout.setAlignment(Qt.AlignCenter)
        layout.setSpacing(8)

        layout.addStretch()

        title = QLabel("Was kann ich für dich tun?")
        title.setObjectName("welcome")
        title.setAlignment(Qt.AlignCenter)

        hint = QLabel("Schreib eine Nachricht oder füge mit + ein Bild hinzu.")
        hint.setObjectName("hint")
        hint.setAlignment(Qt.AlignCenter)

        layout.addWidget(title)
        layout.addWidget(hint)
        layout.addStretch()

        self.messages_layout.insertWidget(0, card, 1)
        self.fade_in_widget(card, 240)

    def new_chat(self, checked=False, initial=False):
        self.current_chat = {"title": "Neuer Chat", "messages": []}

        if not initial:
            self.chats.insert(0, self.current_chat)
            save_chats(self.chats)
            self.refresh_chat_list()

        self.clear_messages()
        self.show_welcome()
        self.input.clear()
        self.clear_image()
        self.input.setEnabled(True)
        self.input.setFocus()
        self.scroll_to_bottom()

    def ensure_current_saved(self):
        if self.current_chat not in self.chats:
            self.chats.insert(0, self.current_chat)

    def refresh_chat_list(self):
        self.chat_list.clear()
        for index, chat in enumerate(self.chats):
            title = chat.get("title") or "Chat"
            item = QListWidgetItem(title[:34])
            item.setData(Qt.UserRole, index)
            self.chat_list.addItem(item)

    def open_chat_from_item(self, item):
        index = item.data(Qt.UserRole)
        if not isinstance(index, int) or index < 0 or index >= len(self.chats):
            return

        self.current_chat = self.chats[index]
        self.clear_messages()

        messages = self.current_chat.get("messages", [])
        if not messages:
            self.show_welcome()
        else:
            for message in messages:
                self.add_bubble(
                    message.get("role", "assistant"),
                    message.get("content", ""),
                    message.get("image_path"),
                    animate=False,
                )

        self.clear_image()
        self.scroll_to_bottom()

    def pick_image(self):
        path, _ = QFileDialog.getOpenFileName(
            self,
            "Bild auswählen",
            "",
            "Bilder (*.png *.jpg *.jpeg *.webp *.bmp)",
        )
        if path:
            self.image_path = path
            self.image_name.setText(os.path.basename(path))
            self.image_chip.show()
            self.fade_in_widget(self.image_chip, 140)
            self.update_send_enabled()

    def clear_image(self):
        self.image_path = None
        self.image_chip.hide()
        self.image_name.setText("")
        self.update_send_enabled()

    def change_key(self):
        KeyDialog(self, required=False).exec()

    def send_message(self):
        if self.worker and self.worker.isRunning():
            return

        text = self.input.text().strip()
        image_path = self.image_path

        if not text and not image_path:
            return

        key = read_key()
        if not key:
            dialog = KeyDialog(self, required=True)
            if dialog.exec() != QDialog.Accepted:
                return
            key = read_key()

        if self.current_chat is None:
            self.current_chat = {"title": "Neuer Chat", "messages": []}

        if not self.current_chat.get("messages"):
            self.clear_messages()

        display_text = text if text else "Was ist auf diesem Bild zu sehen?"

        self.add_bubble("user", display_text, image_path)

        user_entry = {
            "role": "user",
            "content": display_text,
        }
        if image_path:
            user_entry["image_path"] = image_path

        self.current_chat.setdefault("messages", []).append(user_entry)

        if self.current_chat.get("title") in ("", "Neuer Chat"):
            self.current_chat["title"] = (
                display_text[:34] + ("…" if len(display_text) > 34 else "")
            )

        self.ensure_current_saved()
        save_chats(self.chats)
        self.refresh_chat_list()

        self.input.clear()
        self.clear_image()
        self.input.setEnabled(False)
        self.plus_btn.setEnabled(False)
        self.send_btn.setEnabled(False)

        thinking = ThinkingWidget()
        self.messages_layout.insertWidget(self.messages_layout.count() - 1, thinking)
        self.fade_in_widget(thinking, 130)
        self.scroll_to_bottom(thinking)

        api_messages = [{
            "role": "system",
            "content": (
                "Du bist Sliqadius, ein schneller, hilfreicher KI-Assistent. "
                "Antworte klar und direkt. Antworte auf Deutsch, wenn der Nutzer Deutsch schreibt. "
                "Gib niemals internes Chain-of-Thought aus."
            ),
        }]

        for message in self.current_chat["messages"][-20:]:
            api_messages.append({
                "role": message.get("role", "user"),
                "content": message.get("content", ""),
            })

        self.worker = ApiWorker(key, api_messages, image_path)
        self.worker.done.connect(
            lambda answer: self.finish_answer(answer, thinking)
        )
        self.worker.failed.connect(
            lambda error: self.finish_error(error, thinking)
        )
        self.worker.start()

    def finish_answer(self, answer, thinking):
        thinking.stop()
        thinking.deleteLater()

        answer = answer or "Keine Antwort erhalten."
        self.add_bubble("assistant", answer)

        self.current_chat["messages"].append({
            "role": "assistant",
            "content": answer,
        })

        save_chats(self.chats)

        self.input.setEnabled(True)
        self.plus_btn.setEnabled(True)
        self.worker = None
        self.update_send_enabled()
        self.input.setFocus()
        self.scroll_to_bottom()

    def finish_error(self, error, thinking):
        thinking.stop()
        thinking.deleteLater()

        self.add_bubble("assistant", "Fehler: " + error)

        self.input.setEnabled(True)
        self.plus_btn.setEnabled(True)
        self.worker = None
        self.update_send_enabled()
        self.input.setFocus()
        self.scroll_to_bottom()


def main():
    app = QApplication(sys.argv)
    app.setApplicationName(APP_NAME)
    app.setFont(QFont("Segoe UI", 10))

    if not read_key():
        dialog = KeyDialog(None, required=True)
        if dialog.exec() != QDialog.Accepted:
            return 0

    window = ChatWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
