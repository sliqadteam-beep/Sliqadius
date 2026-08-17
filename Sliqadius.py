import base64
import json
import os
import sys
import requests
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import QApplication, QCheckBox, QDialog, QFileDialog, QFrame, QHBoxLayout, QLabel, QLineEdit, QMessageBox, QPushButton, QTextEdit, QVBoxLayout, QWidget

APP_NAME='Sliqadius'
BASE=os.path.dirname(os.path.abspath(__file__))
DATA=os.path.join(BASE,'ai.data')
os.makedirs(DATA,exist_ok=True)
API_FILE=os.path.join(DATA,'groq_api_key.json')
HISTORY_FILE=os.path.join(DATA,'history.json')
TEXT_MODEL='openai/gpt-oss-120b'
VISION_MODEL='meta-llama/llama-4-scout-17b-16e-instruct'
GROQ_URL='https://api.groq.com/openai/v1/chat/completions'

def load_api_key():
    try:
        with open(API_FILE,'r',encoding='utf-8') as f:return json.load(f).get('key','').strip()
    except:return ''

def save_api_key(key):
    try:
        with open(API_FILE,'w',encoding='utf-8') as f:json.dump({'key':key},f,ensure_ascii=False,indent=2)
        return True
    except:return False

def load_history():
    try:
        with open(HISTORY_FILE,'r',encoding='utf-8') as f:
            x=json.load(f);return x if isinstance(x,list) else []
    except:return []

def save_history(history):
    try:
        with open(HISTORY_FILE,'w',encoding='utf-8') as f:json.dump(history[-40:],f,ensure_ascii=False,indent=2)
    except:pass

class ApiKeyDialog(QDialog):
    def __init__(self,parent=None):
        super().__init__(parent);self.setWindowTitle('Sliqadius – Groq API Key');self.setFixedSize(520,290);self.setModal(True)
        layout=QVBoxLayout(self);layout.setContentsMargins(28,26,28,26);layout.setSpacing(13)
        title=QLabel('Groq API Key');title.setObjectName('dialogTitle');layout.addWidget(title)
        text=QLabel('Sliqadius benötigt einen Groq API Key, um die KI zu verwenden.\nDer Key wird nur lokal auf diesem PC gespeichert.');text.setWordWrap(True);text.setObjectName('dialogText');layout.addWidget(text)
        link=QLabel('<a href="https://console.groq.com/keys">Groq API Key erstellen</a>');link.setOpenExternalLinks(True);link.setObjectName('link');layout.addWidget(link)
        self.edit=QLineEdit();self.edit.setPlaceholderText('gsk_...');self.edit.setEchoMode(QLineEdit.Password);layout.addWidget(self.edit)
        show=QCheckBox('API Key anzeigen');show.toggled.connect(lambda checked:self.edit.setEchoMode(QLineEdit.Normal if checked else QLineEdit.Password));layout.addWidget(show)
        buttons=QHBoxLayout();buttons.addStretch();cancel=QPushButton('Beenden');save=QPushButton('Speichern');save.setObjectName('primaryButton');buttons.addWidget(cancel);buttons.addWidget(save);layout.addLayout(buttons)
        cancel.clicked.connect(self.reject);save.clicked.connect(self.save);self.edit.returnPressed.connect(self.save);self.edit.setFocus()
    def save(self):
        key=self.edit.text().strip()
        if not key:return QMessageBox.warning(self,'API Key fehlt','Bitte gib deinen Groq API Key ein.')
        if not key.startswith('gsk_'):return QMessageBox.warning(self,'API Key prüfen','Ein Groq API Key beginnt normalerweise mit gsk_.')
        if save_api_key(key):self.accept()
        else:QMessageBox.critical(self,'Fehler','Der API Key konnte nicht gespeichert werden.')

class ChatWorker(QThread):
    finished_text=Signal(str);failed=Signal(str)
    def __init__(self,key,messages,image_data=None):super().__init__();self.key=key;self.messages=messages;self.image_data=image_data
    def run(self):
        try:
            model=VISION_MODEL if self.image_data else TEXT_MODEL;payload_messages=list(self.messages)
            if self.image_data:
                last=payload_messages[-1];payload_messages[-1]={'role':'user','content':[{'type':'text','text':last['content']},{'type':'image_url','image_url':{'url':self.image_data}}]}
            r=requests.post(GROQ_URL,headers={'Authorization':f'Bearer {self.key}','Content-Type':'application/json'},json={'model':model,'messages':payload_messages,'temperature':0.7,'max_tokens':2048},timeout=120)
            r.raise_for_status();answer=r.json()['choices'][0]['message']['content'].strip();self.finished_text.emit(answer or 'Keine Antwort erhalten.')
        except requests.HTTPError as exc:
            try:detail=exc.response.json().get('error',{}).get('message',str(exc))
            except:detail=str(exc)
            self.failed.emit(f'Groq-Fehler: {detail}')
        except Exception as exc:self.failed.emit(f'Verbindungsfehler: {exc}')

class Sliqadius(QWidget):
    def __init__(self):
        super().__init__();self.api_key=load_api_key();self.history=load_history();self.messages=[];self.image_data=None;self.worker=None;self.setup_ui();self.restore_history()
    def setup_ui(self):
        self.setWindowTitle('Sliqadius');self.resize(980,700);self.setMinimumSize(700,520)
        root=QVBoxLayout(self);root.setContentsMargins(22,18,22,20);root.setSpacing(12)
        top=QHBoxLayout();logo=QLabel('Sliqadius');logo.setObjectName('logo');top.addWidget(logo);top.addStretch();settings=QPushButton('API Key');settings.setObjectName('subtleButton');settings.clicked.connect(self.change_key);top.addWidget(settings);root.addLayout(top)
        self.chat=QTextEdit();self.chat.setReadOnly(True);self.chat.setObjectName('chat');root.addWidget(self.chat,1)
        self.image_preview=QLabel();self.image_preview.setObjectName('imagePreview');self.image_preview.setAlignment(Qt.AlignCenter);self.image_preview.hide();root.addWidget(self.image_preview)
        composer=QFrame();composer.setObjectName('composer');row=QHBoxLayout(composer);row.setContentsMargins(8,8,8,8);row.setSpacing(8)
        plus=QPushButton('+');plus.setObjectName('plusButton');plus.setFixedSize(42,42);plus.clicked.connect(self.select_image);row.addWidget(plus)
        self.input=QLineEdit();self.input.setPlaceholderText('Nachricht an Sliqadius …');self.input.returnPressed.connect(self.send);row.addWidget(self.input,1)
        self.send_button=QPushButton('Senden');self.send_button.setObjectName('primaryButton');self.send_button.clicked.connect(self.send);row.addWidget(self.send_button);root.addWidget(composer)
        self.setStyleSheet('''QWidget{background:#080808;color:#f2f2f2;font-family:Arial,sans-serif}#logo{font-size:22px;font-weight:700;padding:4px 2px}#chat{background:#0d0d0d;border:1px solid #202020;border-radius:16px;padding:18px;font-size:15px}#composer{background:#111;border:1px solid #252525;border-radius:16px}QLineEdit{background:#151515;color:#fff;border:1px solid #252525;border-radius:11px;padding:11px 13px;font-size:14px}QLineEdit:focus{border:1px solid #3a3a3a}QPushButton{border:none;border-radius:10px;padding:10px 15px;color:#ddd;background:#1a1a1a}QPushButton:hover{background:#242424}#primaryButton{background:#10a37f;color:white;font-weight:600;padding:10px 18px}#primaryButton:hover{background:#12b886}#plusButton{font-size:23px;padding:0;background:#1a1a1a}#subtleButton{background:#111;border:1px solid #252525;font-size:12px;padding:8px 12px}#imagePreview{background:#101010;border:1px solid #242424;border-radius:12px;min-height:72px;max-height:140px}#dialogTitle{font-size:22px;font-weight:600}#dialogText{color:#aaa;font-size:13px}#link{color:#10a37f;font-size:13px}QCheckBox{color:#aaa;font-size:12px}''')
    def restore_history(self):
        if not self.history:self.append_message('Sliqadius','Bereit zum Chatten.\n\nSchreib deine erste Nachricht.');return
        for item in self.history[-20:]:
            if item.get('role')=='user':self.append_message('Du',item.get('content',''))
            elif item.get('role')=='assistant':self.append_message('Sliqadius',item.get('content',''))
        self.messages=[{'role':x['role'],'content':x['content']} for x in self.history[-20:] if x.get('role') in ('user','assistant')]
    def append_message(self,who,text):
        safe=text.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;');self.chat.append(f'<p style="margin:12px 0 4px;color:#777;font-size:11px;font-weight:600">{who}</p>');self.chat.append(f'<p style="margin:0 0 12px;line-height:1.55">{safe}</p>');self.chat.verticalScrollBar().setValue(self.chat.verticalScrollBar().maximum())
    def change_key(self):
        d=ApiKeyDialog(self)
        if d.exec()==QDialog.Accepted:self.api_key=load_api_key()
    def select_image(self):
        path,_=QFileDialog.getOpenFileName(self,'Bild auswählen','','Bilder (*.png *.jpg *.jpeg *.webp *.gif)')
        if not path:return
        try:
            with open(path,'rb') as f:raw=f.read()
            mime='image/png';low=path.lower()
            if low.endswith(('.jpg','.jpeg')):mime='image/jpeg'
            elif low.endswith('.webp'):mime='image/webp'
            elif low.endswith('.gif'):mime='image/gif'
            self.image_data=f'data:{mime};base64,{base64.b64encode(raw).decode("ascii")}'
            pix=QPixmap(path)
            if not pix.isNull():self.image_preview.setPixmap(pix.scaled(130,110,Qt.KeepAspectRatio,Qt.SmoothTransformation));self.image_preview.show()
        except Exception as exc:QMessageBox.critical(self,'Bildfehler',str(exc))
    def send(self):
        text=self.input.text().strip()
        if not text and not self.image_data:return
        if not self.api_key:
            d=ApiKeyDialog(self)
            if d.exec()!=QDialog.Accepted:return
            self.api_key=load_api_key()
        if not text:text='Analysiere dieses Bild und beschreibe, was du erkennst.'
        self.append_message('Du',text);self.messages.append({'role':'user','content':text});self.history.append({'role':'user','content':text});save_history(self.history);self.input.clear();self.send_button.setEnabled(False);self.send_button.setText('…')
        self.worker=ChatWorker(self.api_key,self.messages[-20:],self.image_data);self.worker.finished_text.connect(self.receive);self.worker.failed.connect(self.error);self.worker.finished.connect(self.worker.deleteLater);self.worker.start();self.image_data=None;self.image_preview.clear();self.image_preview.hide()
    def receive(self,answer):
        self.append_message('Sliqadius',answer);self.messages.append({'role':'assistant','content':answer});self.history.append({'role':'assistant','content':answer});save_history(self.history);self.send_button.setEnabled(True);self.send_button.setText('Senden');self.input.setFocus()
    def error(self,message):self.append_message('Sliqadius',message);self.send_button.setEnabled(True);self.send_button.setText('Senden');self.input.setFocus()

def main():
    app=QApplication(sys.argv);window=Sliqadius();window.show()
    if not window.api_key:
        d=ApiKeyDialog(window)
        if d.exec()!=QDialog.Accepted:window.close();return 0
        window.api_key=load_api_key()
    return app.exec()

if __name__=='__main__':raise SystemExit(main())
