from pathlib import Path
import py_compile

p = Path("Sliqadius.py")
s = p.read_text(encoding="utf-8")

if "SLIQADIUS_MODE_LANG_V1" not in s:
    raise RuntimeError("Expected mode/language version not found in Sliqadius.py")

MARKER = "SLIQADIUS_SMARTER_V2"
if MARKER in s:
    print("Smarter patch already present")
    py_compile.compile(str(p), doraise=True)
    raise SystemExit(0)


def replace_once(old, new, name):
    global s
    if old not in s:
        raise RuntimeError(f"Smarter patch marker not found: {name}")
    s = s.replace(old, new, 1)


replace_once(
    "# SLIQADIUS_MODE_LANG_V1\n",
    "# SLIQADIUS_MODE_LANG_V1\n# SLIQADIUS_SMARTER_V2\n",
    "smart marker",
)

replace_once(
    'reasoning_effort = "default" if self.ai_mode == "smart" else "none"',
    'reasoning_effort = "none" if self.ai_mode == "fast" else "default"',
    "vision reasoning",
)
replace_once(
    'max_tokens = {"fast": 450, "medium": 650, "smart": 900}.get(self.ai_mode, 650)',
    'max_tokens = {"fast": 650, "medium": 1600, "smart": 2400}.get(self.ai_mode, 1600)',
    "vision token budget",
)
replace_once(
    'max_tokens = 1400',
    'max_tokens = 1600',
    "fast token budget",
)
replace_once(
    'max_tokens = 2800',
    'max_tokens = 3000',
    "smart token budget",
)
replace_once(
    'max_tokens = 2200',
    'max_tokens = 2400',
    "medium token budget",
)

replace_once(
    '                "temperature": 0.6,\n                "max_completion_tokens": max_tokens,\n                "reasoning_effort": reasoning_effort,',
    '                "temperature": 0.7 if self.image_path else 0.45,\n                "top_p": 0.95,\n                "max_completion_tokens": max_tokens,\n                "reasoning_effort": reasoning_effort,',
    "sampling",
)

replace_once(
    '            "fast": "Priorisiere Geschwindigkeit. Antworte direkt und kompakt und nutze nur wenig internes Reasoning.",\n            "medium": "Nutze eine ausgewogene Mischung aus Geschwindigkeit, Genauigkeit und Reasoning.",\n            "smart": "Priorisiere Genauigkeit und gründliches Problemlösen. Bei schwierigen Aufgaben darfst du stärker intern reasonen.",',
    '            "fast": "Priorisiere Geschwindigkeit, aber prüfe die Antwort kurz auf offensichtliche Fehler. Antworte direkt und kompakt.",\n            "medium": "Nutze gründliches Reasoning. Zerlege schwierige Aufgaben intern in Teilschritte, prüfe wichtige Annahmen und kontrolliere das Ergebnis vor der Antwort.",\n            "smart": "Priorisiere maximale Genauigkeit. Analysiere komplexe Aufgaben gründlich, prüfe Alternativen, Rechenwege, Code und Randfälle intern und kontrolliere die finale Antwort, bevor du sie ausgibst.",',
    "mode intelligence instructions",
)

old_prompt = '''                f"Du bist Sliqadius, ein schneller, hilfreicher KI-Assistent. Die automatisch erkannte Systemsprache des Geräts ist {language_name}. Antworte standardmäßig in dieser Sprache, außer der Nutzer schreibt klar in einer anderen Sprache oder bittet um eine andere Sprache. {mode_instruction} "
                "Antworte verständlich, vollständig und in angemessener Tiefe. Bei Erklärungen, Fragen, Programmierung, Hausaufgaben oder komplexeren Themen sollst du normalerweise mehrere hilfreiche Absätze liefern, wichtige Zusammenhänge erklären, sinnvolle Schritte nennen und bei Bedarf Beispiele geben. Beantworte alle wichtigen Teile der Frage und höre nicht unnötig früh auf. Kurze Antworten sind nur bei wirklich einfachen Fragen oder wenn der Nutzer ausdrücklich eine kurze Antwort möchte. "
                "Strukturiere längere Antworten übersichtlich mit Absätzen und, wenn hilfreich, Aufzählungen oder klaren Schritten. Bei Codefragen liefere vollständigen, verwendbaren Code und erkläre die wichtigsten Teile. Wiederhole dich nicht künstlich und erfinde keine Informationen. Gib niemals internes Chain-of-Thought aus."
'''
new_prompt = '''                f"Du bist Sliqadius, ein sehr leistungsfähiger, präziser KI-Assistent. Die automatisch erkannte Systemsprache des Geräts ist {language_name}. Antworte standardmäßig in dieser Sprache, außer der Nutzer schreibt klar in einer anderen Sprache oder bittet um eine andere Sprache. {mode_instruction} "
                "Verstehe zuerst exakt, was der Nutzer erreichen will. Nutze den bisherigen Chatkontext konsequent und beachte alle genannten Einschränkungen. Bei mehrdeutigen Fragen wähle keine erfundene Annahme als Tatsache; nenne Unsicherheit knapp oder frage nur dann nach, wenn ohne Klärung keine sinnvolle Antwort möglich ist. "
                "Prüfe Fakten, Logik, Rechenwege, Einheiten und wichtige Schlussfolgerungen intern auf Konsistenz. Bei Mathematik rechne sorgfältig nach. Bei Programmierung liefere vollständigen, verwendbaren Code, achte auf Syntax, Abhängigkeiten, Randfälle und darauf, dass der Code zur beschriebenen Umgebung passt. Bei Fehlersuche leite die wahrscheinlichste Ursache aus den vorhandenen Informationen ab und nenne konkrete Schritte zur Behebung. "
                "Antworte verständlich, vollständig und in angemessener Tiefe. Beginne möglichst direkt mit der eigentlichen Antwort und erkläre danach nur die Details, die helfen. Wiederhole dich nicht künstlich, erfinde keine Informationen und gib niemals internes Chain-of-Thought aus."
'''
replace_once(old_prompt, new_prompt, "system intelligence prompt")

replace_once(
    '        for message in self.current_chat["messages"][-20:]:',
    '        for message in self.current_chat["messages"][-30:]:',
    "more chat context",
)

p.write_text(s, encoding="utf-8", newline="\n")
py_compile.compile(str(p), doraise=True)
print("Smarter desktop patch applied successfully")
