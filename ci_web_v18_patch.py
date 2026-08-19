from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old == new:
        return text
    if old not in text:
        if new in text:
            return text
        raise RuntimeError(f"Missing patch anchor: {label}")
    return text.replace(old, new, 1)


def patch_html():
    p = Path('web.html')
    s = p.read_text(encoding='utf-8')
    s = s.replace('manifest.webmanifest?v=15', 'manifest.webmanifest?v=18')
    s = s.replace('logo.png?v=15', 'logo.png?v=18')
    s = replace_once(
        s,
        '<button class="roundbtn" id="micBtn" type="button" aria-label="Spracheingabe">⌁</button>',
        '<button class="roundbtn" id="micBtn" type="button" hidden aria-hidden="true" tabindex="-1"></button>',
        'hidden voice button',
    )
    old_scripts = '<script src="sliq-i18n-loader.js?v=15"></script>\n<script src="web-v15.js?v=15"></script>'
    new_scripts = '<script src="sliq-i18n-loader.js?v=18"></script>\n<script src="web-bootstrap-v18.js?v=18"></script>\n<script src="web-v15.js?v=18"></script>'
    if old_scripts in s:
        s = s.replace(old_scripts, new_scripts, 1)
    else:
        s = re.sub(r'<script src="sliq-i18n-loader\.js\?v=\d+"></script>\s*<script src="(?:web-bootstrap-v18\.js\?v=\d+"></script>\s*)?<script src="web-v15\.js\?v=\d+"></script>', new_scripts, s, count=1)
        if new_scripts not in s:
            raise RuntimeError('Missing web runtime script anchors')
    p.write_text(s, encoding='utf-8', newline='\n')


def patch_main_js():
    p = Path('web-v15.js')
    s = p.read_text(encoding='utf-8')

    old_open = "function openDb(){return new Promise(resolve=>{if(!indexedDB){resolve(null);return}const r=indexedDB.open('sliqadius-web-v15',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv')};r.onsuccess=()=>{DB=r.result;resolve(DB)};r.onerror=()=>resolve(null)})}"
    new_open = "function openDb(){return new Promise(resolve=>{try{if(!window.indexedDB){resolve(null);return}const r=window.indexedDB.open('sliqadius-web-v15',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv')};r.onsuccess=()=>{DB=r.result;resolve(DB)};r.onerror=()=>resolve(null)}catch(e){DB=null;resolve(null)}})}"
    s = replace_once(s, old_open, new_open, 'robust IndexedDB startup')

    old_save = "async function saveKey(){const v=$('keyInput').value.trim();if(!/^gsk_[A-Za-z0-9_-]{12,}$/.test(v)){$('keyStatus').textContent=t('invalid');return}const copyGuest=!apiKey;closeModal('keyModal');await switchApiKey(v,copyGuest);if(retryAfterKey){retryAfterKey=false;setTimeout(()=>sendMessage(),80)}}"
    new_save = "async function saveKey(){const v=$('keyInput').value.trim();if(!/^gsk_\\S{10,}$/.test(v)){$('keyStatus').textContent=t('invalid');$('keyInput').focus();return}const copyGuest=!apiKey,btn=$('saveKeyBtn');if(btn)btn.disabled=true;$('keyStatus').textContent='';try{await switchApiKey(v,copyGuest);closeModal('keyModal');if(retryAfterKey){retryAfterKey=false;setTimeout(()=>sendMessage(),80)}}catch(e){console.error(e);$('keyStatus').textContent=t('error')}finally{if(btn)btn.disabled=false}}"
    s = replace_once(s, old_save, new_save, 'API key save flow')

    old_start = "  await openDb();if(!apiKey){const backup=await dbGet('api-key');if(backup){apiKey=String(backup);lsSet('sliq-web-key',apiKey)}}await loadUi(lang);state=await loadStateForKey(apiKey);current=state.current;applyTheme();wire();renderAll();persistNow();$('messageInput').focus();if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}"
    new_start = "  await openDb();await loadUi(lang);state=await loadStateForKey(apiKey);current=state.current;applyTheme();wire();renderAll();persistNow();if(!apiKey)setTimeout(()=>showKey(true,false),120);else $('messageInput').focus();if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}"
    s = replace_once(s, old_start, new_start, 'automatic missing-key prompt')

    p.write_text(s, encoding='utf-8', newline='\n')


def patch_loader():
    p = Path('sliq-i18n-loader.js')
    s = p.read_text(encoding='utf-8')
    s = re.sub(r"i18n/'\+code\+'\.js\?v=\d+'", "i18n/'+code+'.js?v=18'", s)
    s = s.replace("s.src='i18n/'+code+'.js?v=17';", "s.src='i18n/'+code+'.js?v=18';")
    s = s.replace("s.src='i18n/'+code+'.js?v=16';", "s.src='i18n/'+code+'.js?v=18';")
    s = re.sub(
        r"/\* Load v17 after the main runtime; v17 waits until the runtime handlers exist\. \*/.*?if\(document\.readyState==='complete'\).*?;\n",
        "/* API-key and interaction fallback is loaded directly by web.html as web-bootstrap-v18.js. */\n",
        s,
        flags=re.S,
    )
    s = re.sub(
        r"/\* Load the repair/quality layer only on Sliqadius Web, after the main runtime\. \*/.*?if\(document\.readyState==='complete'\).*?;\n",
        "/* API-key and interaction fallback is loaded directly by web.html as web-bootstrap-v18.js. */\n",
        s,
        flags=re.S,
    )
    p.write_text(s, encoding='utf-8', newline='\n')


def patch_service_worker():
    Path('sw.js').write_text(
        "const CACHE='sliqadius-web-v18';\n"
        "const CORE=['./web.html','./web-v15.js','./web-bootstrap-v18.js','./sliq-i18n-loader.js','./logo-approved.jpg','./logo.png','./manifest.webmanifest'];\n"
        "self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});\n"
        "self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});\n"
        "self.addEventListener('fetch',event=>{\n"
        "  const req=event.request;\n"
        "  if(req.method!=='GET')return;\n"
        "  const url=new URL(req.url);\n"
        "  if(url.origin!==self.location.origin)return;\n"
        "  event.respondWith((async()=>{\n"
        "    try{\n"
        "      const fresh=await fetch(req,{cache:'no-store'});\n"
        "      if(fresh&&fresh.ok){const cache=await caches.open(CACHE);cache.put(req,fresh.clone())}\n"
        "      return fresh;\n"
        "    }catch(e){\n"
        "      const cached=await caches.match(req);\n"
        "      if(cached)return cached;\n"
        "      if(req.mode==='navigate')return caches.match('./web.html');\n"
        "      throw e;\n"
        "    }\n"
        "  })());\n"
        "});\n",
        encoding='utf-8',
        newline='\n',
    )


patch_html()
patch_main_js()
patch_loader()
patch_service_worker()
print('Sliqadius Web v18 repair patch applied')
