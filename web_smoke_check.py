from html.parser import HTMLParser
from pathlib import Path
import re


class IdParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if 'id' in d:
            self.ids.append(d['id'])


html = Path('web.html').read_text(encoding='utf-8')
main = Path('web-v15.js').read_text(encoding='utf-8')
boot = Path('web-bootstrap-v18.js').read_text(encoding='utf-8')
loader = Path('sliq-i18n-loader.js').read_text(encoding='utf-8')
sw = Path('sw.js').read_text(encoding='utf-8')

required_ids = [
    'newChatBtn','chatSearch','history','messageInput','sendBtn','attachBtn','modeBtn',
    'changeKeyBtn','apiBadge','keyModal','keyInput','cancelKeyBtn','saveKeyBtn','messages',
    'memoryBtn','themeBtn','exportBtn','importBtn','installAppBtn','usageBtn'
]
for item in required_ids:
    assert f'id="{item}"' in html, f'missing HTML id: {item}'

p = IdParser(); p.feed(html)
duplicates = sorted({x for x in p.ids if p.ids.count(x) > 1})
assert not duplicates, f'duplicate HTML ids: {duplicates}'

loader_pos = html.index('sliq-i18n-loader.js?v=19')
boot_pos = html.index('web-bootstrap-v18.js?v=19')
main_pos = html.index('web-v15.js?v=19')
assert loader_pos < boot_pos < main_pos, 'runtime script order is wrong'
assert 'web-repair-v17.js' not in html
assert 'web-repair-v17.js' not in loader
assert 'id="micBtn"' in html and 'hidden' in html[html.index('id="micBtn"')-100:html.index('id="micBtn"')+160]

# Main runtime is the one and only owner of message sending.
assert "$('sendBtn').onclick=sendMessage" in main
assert "e.key==='Enter'&&!e.shiftKey&&!e.isComposing" in main
assert "if(!apiKey){showKey(true,true);return}" in main
assert "$('cancelKeyBtn').onclick=()=>{closeModal('keyModal');retryAfterKey=false}" in main
assert "$('saveKeyBtn').onclick=saveKey" in main
assert 'function start(){' in main
assert 'state=loadStateLocalForKey(apiKey)' in main
assert 'applyTheme();wire();renderAll();persistNow()' in main
assert 'openDb().then(' in main
assert 'setTimeout(()=>finish(null),350)' in main
assert 'function switchApiKey(newKey,copyGuest)' in main
assert "await dbPut('api-key'" not in main
assert "$('newChatBtn').onclick=newChat" in main
assert "$('memoryBtn').onclick" in main
assert "$('themeBtn').onclick" in main
assert "$('exportBtn').onclick=exportData" in main
assert "$('importBtn').onclick" in main

# Bootstrap may make the key dialog reliable, but must never intercept chat Enter.
assert 'cancel.addEventListener' in boot
assert 'save.addEventListener' in boot
assert "if(reason==='missing'&&getKey())return" in boot
assert "openKey('change')" in boot
assert 'autoPrompt()' in boot
assert 'install401Recovery()' in boot
assert 'function enterToSend' not in boot
assert "e.target.id!=='messageInput'" not in boot
assert 'Never intercept message Enter' in boot
assert "^gsk_\\S{10,}$" in boot
assert 'setTimeout(()=>{' not in boot

assert 'web-bootstrap-v18.js' in sw
assert "sliqadius-web-v19" in sw
assert "?v=19" in loader
assert 'web-repair-v17.js' not in loader

for src in re.findall(r'<script src="([^"?]+)', html):
    if src.startswith(('http://','https://')):
        continue
    assert Path(src).exists(), f'missing local script: {src}'

print('Sliqadius Web v19 smoke checks passed')
