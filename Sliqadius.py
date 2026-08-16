import sys,os,json,re,requests,datetime,ast,operator,subprocess,time,base64,mimetypes,base64,base64
from PySide6.QtWidgets import *
from PySide6.QtCore import *
from PySide6.QtGui import *

def start_ollama():
    try:
        requests.get("http://127.0.0.1:11434/api/tags",timeout=1)
        return
    except:
        pass
    try:
        subprocess.Popen(["ollama","serve"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=subprocess.CREATE_NO_WINDOW)
        for _ in range(30):
            time.sleep(.25)
            try:
                requests.get("http://127.0.0.1:11434/api/tags",timeout=1)
                return
            except:
                pass
    except:
        pass

start_ollama()

BASE=os.path.dirname(os.path.abspath(__file__))
DATA=os.path.join(BASE,"ai.data")
os.makedirs(DATA,exist_ok=True)

MEMORY=os.path.join(DATA,"memory.json")
HISTORY=os.path.join(DATA,"history.json")
FEEDBACK=os.path.join(DATA,"feedback.json")
CHATS=os.path.join(DATA,"chats.json")

def load(path,default):
    try:
        with open(path,"r",encoding="utf-8") as f:
            return json.load(f)
    except:
        return default

memory=load(MEMORY,[])
history=load(HISTORY,[])
feedback=load(FEEDBACK,[])
chats=load(CHATS,[])

def save():
    for path,data in [(MEMORY,memory),(HISTORY,history),(FEEDBACK,feedback),(CHATS,chats)]:
        try:
            with open(path,"w",encoding="utf-8") as f:
                json.dump(data,f,ensure_ascii=False,indent=2)
        except:
            pass

OPS={
    ast.Add:operator.add,
    ast.Sub:operator.sub,
    ast.Mult:operator.mul,
    ast.Div:operator.truediv,
    ast.Mod:operator.mod,
    ast.Pow:operator.pow,
    ast.USub:operator.neg,
    ast.UAdd:operator.pos
}

CAPITALS={
"deutschland":"Berlin","frankreich":"Paris","italien":"Rom",
"spanien":"Madrid","portugal":"Lissabon","österreich":"Wien",
"schweiz":"Bern","polen":"Warschau","niederlande":"Amsterdam",
"belgien":"Brüssel","dänemark":"Kopenhagen","schweden":"Stockholm",
"norwegen":"Oslo","finnland":"Helsinki","japan":"Tokio",
"china":"Peking","indien":"Neu-Delhi","usa":"Washington, D.C.",
"kanada":"Ottawa","brasilien":"Brasília","argentinien":"Buenos Aires",
"mexiko":"Mexiko-Stadt","australien":"Canberra","neuseeland":"Wellington",
"russland":"Moskau","ukraine":"Kyjiw","griechenland":"Athen",
"türkei":"Ankara","ägypten":"Kairo","marokko":"Rabat",
"südafrika":"Pretoria","nigeria":"Abuja","kenia":"Nairobi",
"israel":"Jerusalem","thailand":"Bangkok","vietnam":"Hanoi",
"indonesien":"Jakarta","singapur":"Singapur","südkorea":"Seoul",
"irland":"Dublin","tschechien":"Prag","ungarn":"Budapest",
"rumänien":"Bukarest","bulgarien":"Sofia","kroatien":"Zagreb",
"serbien":"Belgrad","slowakei":"Bratislava","slowenien":"Ljubljana",
"albanien":"Tirana","chile":"Santiago","peru":"Lima",
"kolumbien":"Bogotá"
}

def safe_math(exp):
    try:
        tree=ast.parse(exp,mode="eval")
        def ev(n):
            if isinstance(n,ast.Expression):
                return ev(n.body)
            if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)):
                return n.value
            if isinstance(n,ast.BinOp) and type(n.op) in OPS:
                a=ev(n.left)
                b=ev(n.right)
                if isinstance(n.op,ast.Pow) and abs(b)>50:
                    raise ValueError
                return OPS[type(n.op)](a,b)
            if isinstance(n,ast.UnaryOp) and type(n.op) in OPS:
                return OPS[type(n.op)](ev(n.operand))
            raise ValueError
        return ev(tree)
    except:
        return None

def memory_command(q):
    global memory
    text=q.strip()
    low=text.lower()

    patterns=[
        r"^merke dir[, ]+(.+)$",
        r"^merk dir[, ]+(.+)$",
        r"^merke[, ]+(.+)$",
        r"^speichere[, ]+(.+)$",
        r"^vergiss nicht[, ]+(.+)$"
    ]

    for pattern in patterns:
        m=re.match(pattern,text,re.IGNORECASE)
        if m:
            info=m.group(1).strip()
            if info:
                if info not in memory:
                    memory.append(info)
                    save()
                return "🧠 Alles klar! Ich werde mir merken: **"+info+"**"

    if low in ["vergiss alles","vergiss alles was du weißt","lösche alle erinnerungen","lösche meine erinnerungen"]:
        memory.clear()
        save()
        return "🧠 Alle gespeicherten Erinnerungen wurden gelöscht."

    patterns=[
        r"^vergiss[, ]+(.+)$",
        r"^vergiss dass[, ]+(.+)$"
    ]

    for pattern in patterns:
        m=re.match(pattern,text,re.IGNORECASE)
        if m:
            target=m.group(1).strip().lower()
            removed=False
            for item in list(memory):
                if target in str(item).lower():
                    memory.remove(item)
                    removed=True
            save()
            if removed:
                return "🧠 Vergessen! Ich habe diese Information aus meiner Memory gelöscht."
            return "🧠 Diese Information war nicht in meiner Memory gespeichert."

    if low in ["was weißt du über mich","was weisst du über mich","was weißt du noch über mich","was hast du dir gemerkt","was hast du dir gemerkt?","zeige meine erinnerungen","zeige die erinnerungen"]:
        if not memory:
            return "🧠 Ich habe momentan noch keine gespeicherten Erinnerungen."
        result="🧠 **Das habe ich mir gemerkt:**\n\n"
        for i,item in enumerate(memory,1):
            result+=str(i)+". "+str(item)+"\n"
        return result.strip()

    return None


def get_vision_model():
    try:
        installed=get_models()

        preferred=[
            "llama3.2-vision:11b",
            "llama3.2-vision:90b",
            "llava:7b",
            "llava:13b",
            "llava:latest",
            "gemma3:4b",
            "gemma3:12b",
            "qwen2.5vl:7b",
            "qwen2.5vl:3b"
        ]

        for model in preferred:
            if model in installed:
                return model

        for model in installed:
            low=model.lower()

            if (
                "vision" in low
                or "llava" in low
                or "vl" in low
            ):
                return model

    except:
        pass

    return None


def analyze_image(image_path,question,normal_model,callback=None):

    vision_model=get_vision_model()

    if not vision_model:
        return (
            "❌ Kein Vision-Modell gefunden.\n\n"
            "Installiere einmalig z.B.:\n"
            "ollama pull llama3.2-vision:11b"
        )

    try:

        if not os.path.isfile(image_path):
            return "❌ Das Bild wurde nicht gefunden."

        size=os.path.getsize(image_path)

        if size>500*1024*1024:
            return "❌ Das Bild ist größer als 500 MB."

        if callback:
            callback("🖼️ Bild wird analysiert …")

        with open(image_path,"rb") as f:
            image_data=base64.b64encode(f.read()).decode("utf-8")

        ext=os.path.splitext(image_path)[1].lower()

        mime={
            ".jpg":"image/jpeg",
            ".jpeg":"image/jpeg",
            ".png":"image/png",
            ".webp":"image/webp",
            ".gif":"image/gif",
            ".bmp":"image/bmp"
        }.get(ext,"image/png")

        prompt=question.strip()

        if not prompt:
            prompt=(
                "Analysiere dieses Bild. Beschreibe kurz und verständlich, "
                "was darauf zu sehen ist. Wenn Text sichtbar ist, lies ihn "
                "ebenfalls aus."
            )

        payload={
            "model":vision_model,
            "messages":[
                {
                    "role":"user",
                    "content":prompt,
                    "images":[image_data]
                }
            ],
            "stream":True,
            "options":{
                "temperature":0.2,
                "num_predict":500,
                "top_p":0.9
            },
            "keep_alive":0
        }

        response=requests.post(
            "http://127.0.0.1:11434/api/chat",
            json=payload,
            stream=True,
            timeout=180
        )

        if response.status_code!=200:
            return "❌ Das Vision-Modell konnte das Bild nicht analysieren."

        answer=""

        for line in response.iter_lines():

            if not line:
                continue

            try:

                data=json.loads(line.decode("utf-8"))

                part=data.get("message",{}).get("content","")

                if part:
                    answer+=part

                    if callback:
                        callback(answer)

                if data.get("done"):
                    break

            except:
                continue

        return answer.strip() or "Ich konnte das Bild nicht analysieren."

    except requests.exceptions.ConnectionError:
        return "❌ Ollama ist nicht gestartet."

    except Exception as e:
        return "❌ Fehler bei der Bildanalyse: "+str(e)


def quick_answer(q):
    x=re.sub(r"[!?.,]","",q.lower().strip())

    answers={
        "hi":"Hi! 👋 Wie kann ich dir helfen?",
        "hallo":"Hallo! 👋 Wie kann ich dir helfen?",
        "hey":"Hey! 👋 Was möchtest du machen?",
        "moin":"Moin! 👋",
        "guten morgen":"Guten Morgen! ☀️",
        "guten tag":"Guten Tag! 👋",
        "guten abend":"Guten Abend! 🌙",
        "gute nacht":"Gute Nacht! 🌙 Schlaf gut!",
        "danke":"Sehr gerne! 😊",
        "danke dir":"Sehr gerne! 😊",
        "vielen dank":"Sehr gerne! 😊",
        "bitte":"Gerne! 😊",
        "ok":"👍 Alles klar!",
        "okay":"👍 Alles klar!",
        "alles klar":"Alles klar! 👍",
        "cool":"😎",
        "nice":"😎👍",
        "ping":"Pong! 🏓",
        "test":"Test erfolgreich! ✅",
        "wer bist du":"Ich bin Sliqadius, dein KI-Assistent. 🤖",
        "wie heißt du":"Ich heiße Sliqadius. 🤖",
        "wie heisst du":"Ich heiße Sliqadius. 🤖",
        "wie gehts":"Mir geht's gut! 😎 Wie geht's dir?",
        "wie gehts dir":"Mir geht's gut! 😎 Wie geht's dir?",
        "wie geht's":"Mir geht's gut! 😎 Wie geht's dir?",
        "wie geht's dir":"Mir geht's gut! 😎 Wie geht's dir?",
        "wie geht es":"Mir geht's gut! 😎 Wie geht's dir?",
        "wie geht es dir":"Mir geht's gut! 😎 Wie geht's dir?",
        "bist du eine ki":"Ja. 🤖 Ich bin eine künstliche Intelligenz.",
        "bist du ein mensch":"Nein. Ich bin eine KI. 🤖",
        "kannst du programmieren":"Ja! 💻 Ich kann programmieren und dir beim Coden helfen.",
        "kannst du coden":"Ja! 💻 Sag mir, was du programmieren möchtest.",
        "hilfe":"Klar! 🛠️ Wobei brauchst du Hilfe?",
        "ich brauche hilfe":"Klar! 😊 Was ist passiert?",
        "ich habe eine frage":"Stell sie mir! 👀",
        "hausaufgaben":"Klar! 📚 Schick mir die Aufgabe.",
        "tschüss":"Tschüss! 👋 Bis später!",
        "tschuss":"Tschüss! 👋 Bis später!",
        "bye":"Bye! 👋",
        "funktionierst du":"Ja! 😎",
        "was ist ki":"KI bedeutet künstliche Intelligenz. 🤖",
        "was ist python":"Python ist eine vielseitige Programmiersprache. 🐍",
        "was ist html":"HTML beschreibt die Struktur von Webseiten. 🌐",
        "was ist css":"CSS wird verwendet, um Webseiten zu gestalten. 🎨",
        "was ist roblox":"Roblox ist eine Plattform zum Erstellen und Spielen von Spielen. 🎮",
        "was ist minecraft":"Minecraft ist ein Sandbox-Spiel. ⛏️",
        "was ist discord":"Discord ist eine Kommunikationsplattform. 💬"
    }

    if x in answers:
        return answers[x]

    m=re.search(r"hauptstadt\s+(?:von|des|der)\s+(.+)",x)
    if m:
        country=m.group(1).strip()
        if country in CAPITALS:
            return "🌍 Die Hauptstadt von "+country.title()+" ist "+CAPITALS[country]+"."

    m=re.search(r"(?:was ist|wie viel ist|rechne)\s+(.+)",x)
    if m:
        exp=m.group(1).strip()
        if re.fullmatch(r"[0-9\s+\-*/().%]+",exp):
            result=safe_math(exp)
            if result is not None:
                return "🧮 "+str(result)

    now=datetime.datetime.now()

    if x in ["welches datum ist heute","welcher tag ist heute","heutiges datum"]:
        return "📅 Heute ist der "+now.strftime("%d.%m.%Y")+"."

    if x in ["wie spät ist es","wie spaet ist es","wie viel uhr ist es","uhrzeit"]:
        return "🕐 Es ist "+now.strftime("%H:%M")+" Uhr."

    return None

def get_models():
    try:
        r=requests.get("http://127.0.0.1:11434/api/tags",timeout=3)
        return [m.get("name","") for m in r.json().get("models",[])]
    except:
        return []

def choose_model():
    installed=get_models()
    preferred=[
        "qwen3:4b",
        "qwen3:4b",
        "qwen3:4b",
        "qwen2.5:1.5b",
        "gemma3:4b",
        "phi4-mini",
        "mistral"
    ]
    for model in preferred:
        if model in installed:
            return model
    return installed[0] if installed else "qwen3:4b"

MODEL=choose_model()

def find_vision_model():
    installed=get_models()
    preferred=[
        "llama3.2-vision:11b",
        "llava:7b",
        "llava:latest",
        "gemma3:4b"
    ]
    for model in preferred:
        if model in installed:
            return model
    return None


# ============================================================
# SLIQADIUS WEB SEARCH
# ============================================================
def web_search(query):
    try:
        import requests,re,urllib.parse
        url="https://html.duckduckgo.com/html/?q="+urllib.parse.quote(query)
        r=requests.get(url,headers={"User-Agent":"Mozilla/5.0"},timeout=8)
        r.raise_for_status()
        results=[]
        for m in re.finditer(r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>',r.text,re.S):
            link=re.sub("<.*?>","",m.group(1))
            title=re.sub("<.*?>","",m.group(2))
            title=title.replace("&amp;","&").replace("&quot;","\"")
            if title and link:
                results.append({"title":title,"url":link})
            if len(results)>=5:
                break
        return results
    except Exception as e:
        return []

def web_context(query):
    results=web_search(query)
    if not results:
        return ""
    text="INTERNET-SUCHERGEBNISSE:\n"
    for i,x in enumerate(results,1):
        text+=f"{i}. {x['title']}\nURL: {x['url']}\n"
    return text
def ask(question,model,history_data,callback=None,image_path=None):

    quick=quick_answer(question) if not image_path else None

    if quick:
        if callback:
            callback(quick)
        return quick

    conversation=""

    for item in history_data[-18:]:
        role=item.get("role","")
        content=item.get("content","")
        if role in ["user","assistant"]:
            conversation+=role+": "+content+"\n"

    memories="\n".join("• "+str(x) for x in memory[-15:])

    if image_path:
        system=f"""Du bist Sliqadius, ein intelligenter, schneller und freundlicher KI-Assistent.

Du analysierst gerade ein vom Benutzer hochgeladenes Bild.

Regeln:
- Beschreibe das Bild verständlich und präzise.
- Beantworte die Frage des Benutzers anhand des Bildes.
- Wenn der Benutzer keine konkrete Frage stellt, beschreibe die wichtigsten sichtbaren Inhalte.
- Erfinde keine Details, die du nicht erkennen kannst.
- Wenn Deutsch geschrieben wird, antworte Deutsch.
- Wenn Englisch geschrieben wird, antworte Englisch.
- Halte normale Antworten möglichst kurz und direkt.
- Gib keine internen Gedankengänge aus.

Gespeicherte Informationen:
{memories}

Bisheriger Chat:
{conversation}
"""
    else:
        system=f"""Du bist Sliqadius, ein intelligenter, schneller und freundlicher KI-Assistent.

Regeln:
- Beantworte die aktuelle Frage direkt.
- Bei einfachen Nachrichten wie Hallo, Danke, Ja, Nein oder kurzen Fragen antworte kurz und natürlich.
- Schreibe keine langen Einleitungen.
- Wiederhole nicht die Geschichte des Gesprächs, wenn das nicht nötig ist.
- Halte normale Antworten möglichst kurz und direkt.
- Gespeicherte Informationen aus der Memory dürfen für spätere Antworten verwendet werden.
- Wenn eine gespeicherte Information zur aktuellen Frage passt, berücksichtige sie.
- Behaupte niemals, etwas gespeichert zu haben, wenn es nicht tatsächlich in der Memory steht.
- Gib niemals interne Gedankengänge aus.
- Wenn Deutsch geschrieben wird, antworte Deutsch.
- Wenn Englisch geschrieben wird, antworte Englisch.
- Bei Hausaufgaben erkläre den Lösungsweg verständlich.
- Bei Programmierfragen gib funktionierenden Code.
- Nutze den bisherigen Chat sinnvoll.
- Wiederhole dich nicht unnötig.
- Sei präzise.
- Wenn du etwas nicht sicher weißt, sage das ehrlich.

Gespeicherte Informationen:
{memories}

Bisheriger Chat:
{conversation}
"""

    messages=[{"role":"system","content":system}]

    for item in history_data[-14:]:
        if item.get("role") in ["user","assistant"]:
            messages.append({
                "role":item["role"],
                "content":item.get("content","")
            })

    user_message={
        "role":"user",
        "content":question
    }

    if image_path:
        try:
            with open(image_path,"rb") as f:
                image_data=base64.b64encode(f.read()).decode("utf-8")
            user_message["images"]=[image_data]
        except Exception as e:
            return "❌ Das Bild konnte nicht gelesen werden."

    messages.append(user_message)

    try:
        response=requests.post(
            "http://127.0.0.1:11434/api/chat",
            json={
                "model":model,
                "messages":messages,
                "stream":True,
                "options":{
                    "temperature":0.2,
                    "num_ctx":4096,
                    "num_predict":350,
                    "top_p":0.9
                },
                "keep_alive":-1
            },
            stream=True,
            timeout=180
        )

        if response.status_code!=200:
            try:
                error=response.text[:300]
            except:
                error=""
            return "❌ Ollama konnte keine Antwort erzeugen.\n"+error

        answer=""

        for line in response.iter_lines():
            if not line:
                continue
            try:
                data=json.loads(line.decode("utf-8"))
                part=data.get("message",{}).get("content","")
                if part:
                    answer+=part
                    if callback:
                        callback(answer)
                if data.get("done"):
                    break
            except:
                continue

        return answer.strip() or "Ich konnte gerade keine Antwort erzeugen."

    except requests.exceptions.ConnectionError:
        return "❌ Ollama ist nicht gestartet."
    except Exception as e:
        return "❌ Die lokale KI konnte gerade nicht antworten."


def ask_image(image_path,question,callback=None):
    try:
        with open(image_path,"rb") as f:
            image_data=base64.b64encode(f.read()).decode("utf-8")

        mime=mimetypes.guess_type(image_path)[0] or "image/jpeg"

        prompt=question.strip() if question.strip() else "Analysiere dieses Bild und beschreibe kurz und verständlich, was darauf zu sehen ist."

        response=requests.post(
            "http://127.0.0.1:11434/api/chat",
            json={
                "model":"llama3.2-vision:11b",
                "messages":[
                    {
                        "role":"user",
                        "content":prompt,
                        "images":[image_data]
                    }
                ],
                "stream":True,
                "options":{
                    "temperature":0.2,
                    "num_ctx":4096,
                    "num_predict":350,
                    "top_p":0.9
                },
                "keep_alive":-1
            },
            stream=True,
            timeout=180
        )

        if response.status_code!=200:
            return "❌ Das Vision-Modell konnte keine Antwort erzeugen."

        answer=""

        for line in response.iter_lines():
            if not line:
                continue

            try:
                data=json.loads(line.decode("utf-8"))

                part=data.get("message",{}).get("content","")

                if part:
                    answer+=part

                    if callback:
                        callback(answer)

                if data.get("done"):
                    break

            except Exception:
                continue

        return answer.strip() or "Ich konnte das Bild gerade nicht analysieren."

    except FileNotFoundError:
        return "❌ Das Bild konnte nicht geöffnet werden."

    except requests.exceptions.ConnectionError:
        return "❌ Ollama ist nicht gestartet."

    except Exception as e:
        return "❌ Fehler bei der Bildanalyse: "+str(e)

def animate_widget(widget,duration=180):
    effect=QGraphicsOpacityEffect(widget)
    widget.setGraphicsEffect(effect)
    anim=QPropertyAnimation(effect,b"opacity")
    anim.setDuration(duration)
    anim.setStartValue(0.0)
    anim.setEndValue(1.0)
    anim.setEasingCurve(QEasingCurve.OutCubic)
    widget._animation=anim
    anim.start(QAbstractAnimation.DeleteWhenStopped)

def click_animation(button):
    original=button.geometry()
    anim=QPropertyAnimation(button,b"geometry")
    anim.setDuration(110)
    smaller=QRect(original.x()+2,original.y()+2,max(1,original.width()-4),max(1,original.height()-4))
    anim.setStartValue(original)
    anim.setKeyValueAt(0.45,smaller)
    anim.setEndValue(original)
    anim.setEasingCurve(QEasingCurve.OutBack)
    button._click_animation=anim
    anim.start(QAbstractAnimation.DeleteWhenStopped)

class Worker(QThread):
    token=Signal(str)
    finished=Signal(str)

    def __init__(self,question,model,history_data,image_path=None):
        super().__init__()
        self.question=question
        self.model=model
        self.history_data=history_data
        self.image_path=image_path

    def run(self):
        def stream(text):
            self.token.emit(text)

        answer=ask(
            self.question,
            self.model,
            self.history_data,
            stream,
            self.image_path
        )

        self.finished.emit(answer)


class VisionWorker(QThread):
    token=Signal(str)
    finished=Signal(str)

    def __init__(self,image_path,question):
        super().__init__()
        self.image_path=image_path
        self.question=question

    def run(self):
        def stream(text):
            self.token.emit(text)

        answer=ask_image(
            self.image_path,
            self.question,
            stream
        )

        self.finished.emit(answer)

class MessageWidget(QFrame):

    def __init__(self,text,assistant=True,parent=None,window=None):
        super().__init__(parent)

        self.text=text
        self.assistant=assistant
        self.window=window
        self.rated=False
        self.timestamp_value=datetime.datetime.now().strftime("%H:%M")

        layout=QHBoxLayout(self)
        layout.setContentsMargins(0,8,0,8)
        layout.setSpacing(12)

        if assistant:
            avatar=QLabel("✦")
            avatar.setFixedSize(34,34)
            avatar.setAlignment(Qt.AlignCenter)
            avatar.setStyleSheet("""
                QLabel {
                    background:#10a37f;
                    color:white;
                    border-radius:17px;
                    font-size:18px;
                    font-weight:bold;
                }
            """)
            layout.addWidget(avatar,0,Qt.AlignTop)

            text_layout=QVBoxLayout()
            text_layout.setContentsMargins(0,0,0,0)

            name=QLabel("Sliqadius")
            name.setStyleSheet("""
                QLabel {
                    color:#ececec;
                    font-weight:600;
                    font-size:13px;
                }
            """)
            text_layout.addWidget(name)

            self.body=QLabel(text)
            self.body.setWordWrap(True)
            self.body.setTextInteractionFlags(Qt.TextSelectableByMouse|Qt.TextSelectableByKeyboard)
            self.body.setStyleSheet("""
                QLabel {
                    color:#ececec;
                    font-size:14px;
                    padding-top:5px;
                }
            """)
            text_layout.addWidget(self.body)

            actions=QHBoxLayout()
            actions.setSpacing(3)

            self.time_label=QLabel(self.timestamp_value)
            self.time_label.setStyleSheet("""
                QLabel {
                    color:#666666;
                    font-size:9px;
                    padding-right:3px;
                }
            """)
            actions.addWidget(self.time_label)

            self.like_button=QPushButton("👍")
            self.like_button.setFixedSize(34,30)
            self.like_button.setCursor(Qt.PointingHandCursor)
            self.like_button.setStyleSheet("""
                QPushButton {
                    color:#888888;
                    background:transparent;
                    border-radius:8px;
                    font-size:13px;
                }
                QPushButton:hover {
                    background:#303030;
                    color:white;
                }
            """)
            self.like_button.clicked.connect(self.like_clicked)
            actions.addWidget(self.like_button)

            self.dislike_button=QPushButton("👎")
            self.dislike_button.setFixedSize(34,30)
            self.dislike_button.setCursor(Qt.PointingHandCursor)
            self.dislike_button.setStyleSheet("""
                QPushButton {
                    color:#888888;
                    background:transparent;
                    border-radius:8px;
                    font-size:13px;
                }
                QPushButton:hover {
                    background:#303030;
                    color:white;
                }
            """)
            self.dislike_button.clicked.connect(self.dislike_clicked)
            actions.addWidget(self.dislike_button)

            self.copy_button=QPushButton("⧉")
            self.copy_button.setFixedSize(34,30)
            self.copy_button.setCursor(Qt.PointingHandCursor)
            self.copy_button.setStyleSheet("""
                QPushButton {
                    color:#888888;
                    background:transparent;
                    border-radius:8px;
                    font-size:13px;
                }
                QPushButton:hover {
                    background:#303030;
                    color:white;
                }
            """)
            self.copy_button.clicked.connect(self.copy)
            actions.addWidget(self.copy_button)

            actions.addStretch()
            text_layout.addLayout(actions)
            layout.addLayout(text_layout,1)

        else:
            layout.addStretch()

            bubble_container=QVBoxLayout()
            bubble_container.setContentsMargins(0,0,0,0)

            bubble=QFrame()
            bubble.setObjectName("UserBubble")

            bubble_layout=QVBoxLayout(bubble)
            bubble_layout.setContentsMargins(15,11,15,11)

            label=QLabel(text)
            label.setWordWrap(True)
            label.setTextInteractionFlags(Qt.TextSelectableByMouse)
            label.setStyleSheet("""
                QLabel {
                    color:#ececec;
                    font-size:14px;
                }
            """)
            bubble_layout.addWidget(label)
            bubble_container.addWidget(bubble)

            self.user_time=QLabel(self.timestamp_value)
            self.user_time.setAlignment(Qt.AlignRight)
            self.user_time.setStyleSheet("""
                QLabel {
                    color:#666666;
                    font-size:9px;
                    padding-top:2px;
                    padding-right:4px;
                }
            """)
            bubble_container.addWidget(self.user_time)

            layout.addLayout(bubble_container,0)
            layout.setContentsMargins(90,8,0,8)

        animate_widget(self,180)

    def set_image_preview(self,image_path):

        try:

            pixmap=QPixmap(image_path)

            if pixmap.isNull():
                return

            preview=QLabel()
            preview.setPixmap(
                pixmap.scaled(
                    500,
                    350,
                    Qt.KeepAspectRatio,
                    Qt.SmoothTransformation
                )
            )

            preview.setStyleSheet("""
                QLabel {
                    border-radius:12px;
                    margin-top:6px;
                }
            """)

            if hasattr(self,"body"):

                parent_layout=self.body.parentWidget().layout()

                if parent_layout:
                    parent_layout.insertWidget(
                        parent_layout.indexOf(self.body)+1,
                        preview
                    )

        except:
            pass

    def like_clicked(self):
        if not self.rated:
            self.rate("like")

    def dislike_clicked(self):
        if not self.rated:
            self.rate("dislike")

    def rate(self,rating):
        if self.rated:
            return

        self.rated=True
        self.like_button.setEnabled(False)
        self.dislike_button.setEnabled(False)

        feedback.append({
            "answer":self.text,
            "rating":rating,
            "time":datetime.datetime.now().isoformat()
        })
        save()

        if rating=="like":
            self.like_button.setStyleSheet("""
                QPushButton {
                    color:#555555;
                    background:#303030;
                    border-radius:8px;
                    font-size:13px;
                }
            """)
            self.dislike_button.setStyleSheet("""
                QPushButton {
                    color:#444444;
                    background:transparent;
                    border-radius:8px;
                    font-size:13px;
                }
            """)
        else:
            self.dislike_button.setStyleSheet("""
                QPushButton {
                    color:#555555;
                    background:#303030;
                    border-radius:8px;
                    font-size:13px;
                }
            """)
            self.like_button.setStyleSheet("""
                QPushButton {
                    color:#444444;
                    background:transparent;
                    border-radius:8px;
                    font-size:13px;
                }
            """)

        if self.window:
            self.window.show_status("Feedback gespeichert ✓")

    def copy(self):
        QApplication.clipboard().setText(self.text)
        if self.window:
            self.window.show_status("Kopiert ✓")

STYLE="""
QMainWindow,QWidget {
    background:#212121;
    color:#ececec;
    font-family:"Segoe UI";
}
QFrame#Sidebar {
    background:#171717;
}
QScrollArea {
    border:none;
    background:#212121;
}
QScrollBar:vertical {
    background:transparent;
    width:8px;
}
QScrollBar::handle:vertical {
    background:#555555;
    border-radius:4px;
    min-height:45px;
}
QScrollBar::add-line:vertical,
QScrollBar::sub-line:vertical {
    height:0px;
}
QFrame#Composer {
    background:#2f2f2f;
    border:1px solid #454545;
    border-radius:25px;
}
QFrame#UserBubble {
    background:#303030;
    border-radius:18px;
}
QPushButton#SendButton {
    background:#ffffff;
    color:#111111;
    border-radius:19px;
    font-size:17px;
    font-weight:bold;
}
QPushButton#SendButton:hover {
    background:#dedede;
}
QPushButton#SendButton:disabled {
    background:#666666;
    color:#333333;
}
QPushButton#SidebarNew {
    background:transparent;
    color:#eeeeee;
    border:1px solid #444444;
    border-radius:9px;
    text-align:left;
    padding:10px 13px;
}
QPushButton#SidebarNew:hover {
    background:#2a2a2a;
}
QPushButton#SideItem {
    background:transparent;
    color:#bcbcbc;
    border-radius:8px;
    text-align:left;
    padding:9px 12px;
}
QPushButton#SideItem:hover {
    background:#2a2a2a;
}
QMenu {
    background:#2b2b2b;
    color:#eeeeee;
    border:1px solid #444444;
    border-radius:10px;
    padding:5px;
}
QMenu::item {
    padding:9px 25px 9px 12px;
    border-radius:6px;
}
QMenu::item:selected {
    background:#3a3a3a;
}
"""

class ChatWindow(QMainWindow):

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Sliqadius")
        self.resize(1200,800)
        self.setMinimumSize(900,600)
        self.setStyleSheet(STYLE)

        self.worker=None
        self.current_model=MODEL
        self.current_history=[]
        self.current_chat_id=None

        self.pending_image=None
        self.pending_image_name=None

        central=QWidget()
        self.setCentralWidget(central)

        main=QHBoxLayout(central)
        main.setContentsMargins(0,0,0,0)
        main.setSpacing(0)

        self.create_sidebar(main)
        self.create_main(main)
        self.show_welcome()

    def create_sidebar(self,main):
        sidebar=QFrame()
        sidebar.setObjectName("Sidebar")
        sidebar.setFixedWidth(255)

        side=QVBoxLayout(sidebar)
        side.setContentsMargins(12,14,12,14)
        side.setSpacing(5)

        top=QHBoxLayout()

        logo=QLabel("✦")
        logo.setStyleSheet("""
            QLabel {
                color:#10a37f;
                font-size:24px;
                font-weight:bold;
            }
        """)

        title=QLabel("Sliqadius")
        title.setStyleSheet("""
            QLabel {
                color:white;
                font-size:17px;
                font-weight:600;
            }
        """)

        top.addWidget(logo)
        top.addWidget(title)
        top.addStretch()
        side.addLayout(top)

        self.delete_button=QPushButton("⌫   Chat löschen")
        self.delete_button.setObjectName("SidebarNew")
        self.delete_button.setCursor(Qt.PointingHandCursor)
        self.delete_button.clicked.connect(self.delete_current_chat)
        side.addWidget(self.delete_button)

        side.addSpacing(10)

        recent=QLabel("Chats")
        recent.setStyleSheet("""
            QLabel {
                color:#777777;
                font-size:11px;
                font-weight:bold;
                padding:7px;
            }
        """)
        side.addWidget(recent)

        self.chat_list=QListWidget()
        self.chat_list.setStyleSheet("""
            QListWidget {
                background:transparent;
                border:none;
                color:#bcbcbc;
                outline:none;
            }
            QListWidget::item {
                padding:10px;
                border-radius:8px;
            }
            QListWidget::item:hover {
                background:#2a2a2a;
            }
            QListWidget::item:selected {
                background:#303030;
                color:white;
            }
        """)
        self.chat_list.itemClicked.connect(self.load_chat)
        side.addWidget(self.chat_list,1)

        model_label=QLabel("LOKALES MODELL")
        model_label.setStyleSheet("""
            QLabel {
                color:#666666;
                font-size:9px;
                font-weight:bold;
                padding:7px;
            }
        """)
        side.addWidget(model_label)

        self.model_name=QLabel(self.current_model)
        self.model_name.setStyleSheet("""
            QLabel {
                color:#888888;
                font-size:10px;
                padding:5px;
            }
        """)
        side.addWidget(self.model_name)

        main.addWidget(sidebar)
        self.refresh_chat_list()

    def create_main(self,main):
        content=QWidget()
        content_layout=QVBoxLayout(content)
        content_layout.setContentsMargins(0,0,0,0)
        content_layout.setSpacing(0)

        header=QFrame()
        header.setFixedHeight(60)

        header_layout=QHBoxLayout(header)
        header_layout.setContentsMargins(25,0,25,0)

        self.model_button=QPushButton("Sliqadius  ▾")
        self.model_button.setCursor(Qt.PointingHandCursor)
        self.model_button.setStyleSheet("""
            QPushButton {
                color:#eeeeee;
                background:transparent;
                font-size:14px;
                font-weight:600;
                padding:8px;
                border-radius:8px;
            }
            QPushButton:hover {
                background:#2a2a2a;
            }
        """)
        self.model_button.clicked.connect(self.model_menu)
        header_layout.addWidget(self.model_button)
        header_layout.addStretch()

        self.status=QLabel("● Lokal")
        self.status.setStyleSheet("""
            QLabel {
                color:#55c97b;
                font-size:11px;
            }
        """)
        header_layout.addWidget(self.status)
        content_layout.addWidget(header)

        self.scroll=QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)

        self.chat_container=QWidget()
        self.chat_layout=QVBoxLayout(self.chat_container)
        self.chat_layout.setContentsMargins(0,15,0,20)
        self.chat_layout.setSpacing(0)
        self.chat_layout.addStretch()

        self.scroll.setWidget(self.chat_container)
        content_layout.addWidget(self.scroll,1)

        composer_area=QFrame()
        composer_layout=QVBoxLayout(composer_area)
        composer_layout.setContentsMargins(110,8,110,12)

        composer=QFrame()
        composer.setObjectName("Composer")

        inner=QHBoxLayout(composer)
        inner.setContentsMargins(8,7,8,7)
        inner.setSpacing(8)

        self.plus_button=QPushButton("＋")
        self.plus_button.setFixedSize(38,38)
        self.plus_button.setCursor(Qt.PointingHandCursor)
        self.plus_button.setStyleSheet("""
            QPushButton {
                color:#bdbdbd;
                background:transparent;
                border-radius:19px;
                font-size:21px;
            }
            QPushButton:hover {
                background:#444444;
                color:white;
            }
        """)
        self.plus_button.clicked.connect(self.plus_menu)
        inner.addWidget(self.plus_button)

        self.input=QTextEdit()
        self.input.setPlaceholderText("Nachricht an Sliqadius")
        self.input.setFixedHeight(54)
        self.input.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.input.setStyleSheet("""
            QTextEdit {
                color:#eeeeee;
                font-size:14px;
                background:transparent;
                border:none;
                padding:8px 2px;
            }
        """)
        inner.addWidget(self.input,1)

        self.send=QPushButton("↑")
        self.send.setObjectName("SendButton")
        self.send.setFixedSize(38,38)
        self.send.setCursor(Qt.PointingHandCursor)
        self.send.clicked.connect(self.send_message)
        inner.addWidget(self.send)

        composer_layout.addWidget(composer)

        hint=QLabel("Enter zum Senden · Shift + Enter für eine neue Zeile")
        hint.setAlignment(Qt.AlignCenter)
        hint.setStyleSheet("""
            QLabel {
                color:#666666;
                font-size:10px;
            }
        """)
        composer_layout.addWidget(hint)

        content_layout.addWidget(composer_area)
        main.addWidget(content,1)

        self.input.installEventFilter(self)

    def eventFilter(self,obj,event):
        if obj==self.input and event.type()==QEvent.KeyPress:
            if event.key()==Qt.Key_Return:
                if event.modifiers() & Qt.ShiftModifier:
                    return False
                self.send_message()
                return True
        return super().eventFilter(obj,event)

    def show_welcome(self):
        self.add_message("Hallo! 👋\n\nIch bin Sliqadius. Wie kann ich dir helfen?",True)

    def add_message(self,text,assistant):
        widget=MessageWidget(text,assistant,window=self)
        self.chat_layout.insertWidget(self.chat_layout.count()-1,widget)
        QTimer.singleShot(80,self.scroll_bottom)
        return widget

    def scroll_bottom(self):
        bar=self.scroll.verticalScrollBar()
        bar.setValue(bar.maximum())

    def show_status(self,text):
        self.status.setText(text)
        if text.startswith("🖼️"):
            self.status.setStyleSheet("QLabel { color:#e0a84b; font-size:11px; }")
        elif text.startswith("❌"):
            self.status.setStyleSheet("QLabel { color:#e05b5b; font-size:11px; }")
        else:
            self.status.setStyleSheet("QLabel { color:#55c97b; font-size:11px; }")

        QTimer.singleShot(2000,lambda:self.status.setText("● Lokal"))


    def send_image(self,path):
        if self.worker and self.worker.isRunning():
            return

        if not os.path.exists(path):
            self.show_status("❌ Bild nicht gefunden")
            return

        size=os.path.getsize(path)

        if size>500*1024*1024:
            QMessageBox.warning(
                self,
                "Datei zu groß",
                "Die maximale Dateigröße beträgt 500 MB."
            )
            return

        filename=os.path.basename(path)

        self.input.clear()

        self.add_message(
            "🖼️ "+filename,
            False
        )

        self.current_history.append({
            "role":"user",
            "content":"[Bild: "+filename+"]"
        })

        history.clear()
        history.extend(self.current_history)
        save()

        self.input.setEnabled(False)
        self.send.setEnabled(False)
        self.plus_button.setEnabled(False)

        self.show_status("● Bild wird analysiert ...")

        self.answer_widget=self.add_message(
            "🖼️ Bild wird analysiert ...",
            True
        )

        self.vision_worker=VisionWorker(
            path,
            "Analysiere dieses Bild. Beschreibe verständlich, was darauf zu sehen ist. Wenn Text im Bild erkennbar ist, lies ihn ebenfalls aus."
        )

        self.vision_worker.token.connect(
            self.update_answer
        )

        self.vision_worker.finished.connect(
            self.finish_image
        )

        self.vision_worker.start()

    def send_message(self):

        if self.worker and self.worker.isRunning():
            return

        text=self.input.toPlainText().strip()

        image_path=self.pending_image

        if not text and not image_path:
            return

        click_animation(self.send)

        self.input.clear()

        if image_path:

            display_text="🖼️ "+os.path.basename(image_path)

            if text and not text.startswith("🖼️ "):
                display_text+="\n"+text

            self.add_message(
                display_text,
                False,
                image_path
            )

            question=text

        else:

            self.add_message(
                text,
                False
            )

            question=text

        self.current_history.append({
            "role":"user",
            "content":question
        })

        history.clear()
        history.extend(self.current_history)
        save()

        self.input.setEnabled(False)
        self.send.setEnabled(False)
        self.plus_button.setEnabled(False)

        if image_path:

            self.show_status(
                "🖼️ Bild wird analysiert …"
            )

            self.answer_widget=self.add_message(
                "🖼️ Bild wird analysiert …",
                True
            )

        else:

            self.show_status(
                "● Sliqadius arbeitet ..."
            )

            self.answer_widget=self.add_message(
                "Sliqadius denkt ...",
                True
            )

        self.worker=Worker(
            question,
            self.current_model,
            list(self.current_history),
            image_path
        )

        self.worker.token.connect(
            self.update_answer
        )

        self.worker.finished.connect(
            self.finish_answer
        )

        self.pending_image=None

        self.worker.start()

    def update_answer(self,text):
        if hasattr(self,"answer_widget"):
            self.answer_widget.text=text
            self.answer_widget.body.setText(text)
            self.scroll_bottom()


    def finish_image(self,answer):
        self.current_history.append({
            "role":"assistant",
            "content":answer
        })

        history.clear()
        history.extend(self.current_history)
        save()

        if hasattr(self,"answer_widget"):
            self.answer_widget.text=answer
            self.answer_widget.body.setText(answer)

        self.input.setEnabled(True)
        self.send.setEnabled(True)
        self.plus_button.setEnabled(True)

        self.input.setFocus()

        self.show_status("● Lokal")

        self.save_chat()
        self.scroll_bottom()

    def finish_answer(self,answer):

        self.current_history.append({
            "role":"assistant",
            "content":answer
        })

        history.clear()
        history.extend(self.current_history)
        save()

        if hasattr(self,"answer_widget"):
            self.answer_widget.text=answer
            self.answer_widget.body.setText(answer)

        self.input.setEnabled(True)
        self.send.setEnabled(True)
        self.plus_button.setEnabled(True)

        self.current_model=MODEL
        self.model_name.setText(MODEL)

        self.input.setFocus()
        self.show_status("● Lokal")
        self.save_chat()
        self.scroll_bottom()

    def save_chat(self):
        if not self.current_history:
            return

        title="Chat"

        for item in self.current_history:
            if item.get("role")=="user":
                title=item.get("content","Chat")[:35]
                break

        if self.current_chat_id is None:
            chat_id=str(datetime.datetime.now().timestamp())
            chats.append({
                "id":chat_id,
                "title":title,
                "messages":list(self.current_history)
            })
            self.current_chat_id=chat_id
        else:
            for chat in chats:
                if chat.get("id")==self.current_chat_id:
                    chat["title"]=title
                    chat["messages"]=list(self.current_history)

        save()
        self.refresh_chat_list()

    def refresh_chat_list(self):
        if not hasattr(self,"chat_list"):
            return

        self.chat_list.blockSignals(True)
        self.chat_list.clear()

        for chat in reversed(chats[-30:]):
            item=QListWidgetItem("●  "+chat.get("title","Chat"))
            item.setData(Qt.UserRole,chat.get("id"))
            self.chat_list.addItem(item)

        self.chat_list.blockSignals(False)

    def load_chat(self,item):

        chat_id=item.data(Qt.UserRole)
        selected=None

        for chat in chats:
            if chat.get("id")==chat_id:
                selected=chat
                break

        if not selected:
            return

        self.current_chat_id=chat_id
        self.current_history=list(selected.get("messages",[]))

        history.clear()
        history.extend(self.current_history)

        while self.chat_layout.count()>1:
            widget=self.chat_layout.takeAt(0)
            if widget.widget():
                widget.widget().deleteLater()

        for message in self.current_history:
            self.add_message(
                message.get("content",""),
                message.get("role")=="assistant"
            )

        self.show_status("Chat geladen ✓")
        self.scroll_bottom()

    def delete_current_chat(self):

        if not self.current_chat_id:
            self.show_status("Kein Chat ausgewählt")
            return

        click_animation(self.delete_button)

        chats[:]=[
            c for c in chats
            if c.get("id")!=self.current_chat_id
        ]

        save()

        self.current_chat_id=None
        self.current_history=[]
        history.clear()

        while self.chat_layout.count()>1:
            item=self.chat_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        self.show_welcome()
        self.refresh_chat_list()
        self.show_status("Chat gelöscht ✓")

    def model_menu(self):

        menu=QMenu(self)
        models=get_models()

        if not models:
            action=menu.addAction("Keine Ollama-Modelle gefunden")
            action.setEnabled(False)
        else:
            for model in models:
                action=menu.addAction(model)
                action.setCheckable(True)
                action.setChecked(model==self.current_model)
                action.triggered.connect(
                    lambda checked=False,m=model:self.change_model(m)
                )

        menu.exec(
            self.model_button.mapToGlobal(
                QPoint(0,self.model_button.height())
            )
        )

    def change_model(self,model):
        self.current_model=model
        self.model_name.setText(model)
        self.model_button.setText("Sliqadius  ▾")
        self.show_status("Modell: "+model)
    def plus_menu(self):
        click_animation(self.plus_button)
        menu=QMenu(self)
        clear=menu.addAction("🗑  Chat leeren")
        clear.triggered.connect(self.clear_messages)
        menu.addSeparator()
        about=menu.addAction("ℹ  Über Sliqadius")
        about.triggered.connect(self.about)
        menu.exec(self.plus_button.mapToGlobal(QPoint(0,-menu.sizeHint().height())))


    def clear_messages(self):

        self.current_history=[]
        history.clear()
        save()

        while self.chat_layout.count()>1:
            item=self.chat_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        self.show_welcome()
        self.show_status("Chat geleert ✓")

    def about(self):
        QMessageBox.information(
            self,
            "Sliqadius",
            "Sliqadius\n\n"
            "Lokaler KI-Assistent\n"
            "Powered by Ollama + PySide6"
        )

    def closeEvent(self,event):
        self.save_chat()
        save()
        event.accept()

def show_requirements():
    import urllib.request
    import time

    box=QMessageBox()
    box.setWindowTitle("Sliqadius – Systemanforderungen")
    box.setIcon(QMessageBox.Information)
    box.setText("Willkommen bei Sliqadius! 🤖")
    box.setInformativeText(
        "Damit Sliqadius optimal funktioniert, werden folgende Mindestanforderungen empfohlen:\n\n"
        "• 16 GB RAM\n"
        "• DDR3 – DDR6\n"
        "• Intel HD Graphics 4600 oder besser\n"
        "• Internetverbindung: mindestens 50–100 Mbit/s empfohlen\n\n"
        "Diese Angaben sind Empfehlungen für eine flüssige Nutzung."
    )
    box.setStandardButtons(QMessageBox.Ok)
    box.exec()
if __name__=="__main__":

    app=QApplication(sys.argv)

    show_requirements()
    app.setApplicationName("Sliqadius")

    window=ChatWindow()
    window.show()

    sys.exit(app.exec())










