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
    'changeKeyBtn','apiBadge','keyModal','keyInput','cancelKeyBtn','saveKeyBtn','messages'
]
for item in required_ids:
    assert f'id="{item}"' in html, f'missing HTML id: {item}'

p = IdParser(); p.feed(html)
duplicates = sorted({x for x in p.ids if p.ids.count(x) > 1})
assert not duplicates, f'duplicate HTML ids: {duplicates}'

loader_pos = html.index('sliq-i18n-loader.js?v=18')
boot_pos = html.index('web-bootstrap-v18.js?v=18')
main_pos = html.index('web-v15.js?v=18')
assert loader_pos < boot_pos < main_pos, 'runtime script order is wrong'
assert 'web-repair-v17.js' not in html
assert 'web-repair-v17.js' not in loader

assert "$('cancelKeyBtn').onclick=()=>{closeModal('keyModal');retryAfterKey=false}" in main
assert "$('saveKeyBtn').onclick=saveKey" in main
assert "if(!apiKey)setTimeout(()=>showKey(true,false),120)" in main
assert "if(!apiKey){showKey(true,true);return}" in main
assert "e.key==='Enter'&&!e.shiftKey&&!e.isComposing" in main
assert "^gsk_\\S{10,}$" in main
assert "window.indexedDB" in main
assert "dbGet('api-key')" not in re.search(r'async function start\(\)\{.*?\n\}', main, re.S).group(0)

assert 'cancel.addEventListener' in boot
assert 'save.addEventListener' in boot
assert 'autoPrompt()' in boot
assert 'install401Recovery()' in boot
assert 'enterToSend()' in boot
assert 'web-bootstrap-v18.js' in sw
assert "sliqadius-web-v18" in sw
assert "?v=18" in loader

for src in re.findall(r'<script src="([^"?]+)', html):
    if src.startswith(('http://','https://')):
        continue
    assert Path(src).exists(), f'missing local script: {src}'

print('Sliqadius Web smoke checks passed')
