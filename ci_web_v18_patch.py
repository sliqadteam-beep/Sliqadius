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
    s = re.sub(r'manifest\.webmanifest\?v=\d+', 'manifest.webmanifest?v=19', s)
    s = re.sub(r'logo\.png\?v=\d+', 'logo.png?v=19', s)
    s = s.replace(
        '<button class="roundbtn" id="micBtn" type="button" aria-label="Spracheingabe">⌁</button>',
        '<button class="roundbtn" id="micBtn" type="button" hidden aria-hidden="true" tabindex="-1"></button>',
    )
    scripts = '<script src="sliq-i18n-loader.js?v=19"></script>\n<script src="web-bootstrap-v18.js?v=19"></script>\n<script src="web-v15.js?v=19"></script>'
    s = re.sub(
        r'<script src="sliq-i18n-loader\.js\?v=\d+"></script>\s*<script src="(?:web-bootstrap-v18\.js\?v=\d+"></script>\s*)?<script src="web-v15\.js\?v=\d+"></script>',
        scripts,
        s,
        count=1,
    )
    if scripts not in s:
        raise RuntimeError('Missing web runtime script anchors')
    p.write_text(s, encoding='utf-8', newline='\n')


def patch_main_js():
    p = Path('web-v15.js')
    s = p.read_text(encoding='utf-8')

    old_open = "function openDb(){return new Promise(resolve=>{if(!indexedDB){resolve(null);return}const r=indexedDB.open('sliqadius-web-v15',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv')};r.onsuccess=()=>{DB=r.result;resolve(DB)};r.onerror=()=>resolve(null)})}"
    old_open_v18 = "function openDb(){return new Promise(resolve=>{try{if(!window.indexedDB){resolve(null);return}const r=window.indexedDB.open('sliqadius-web-v15',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv')};r.onsuccess=()=>{DB=r.result;resolve(DB)};r.onerror=()=>resolve(null)}catch(e){DB=null;resolve(null)}})}"
    new_open = "function openDb(){return new Promise(resolve=>{let done=false;const finish=v=>{if(done)return;done=true;resolve(v)};const timer=setTimeout(()=>finish(null),350);try{if(!window.indexedDB){clearTimeout(timer);finish(null);return}const r=window.indexedDB.open('sliqadius-web-v15',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('kv'))r.result.createObjectStore('kv')};r.onsuccess=()=>{DB=r.result;clearTimeout(timer);finish(DB)};r.onerror=()=>{clearTimeout(timer);finish(null)};r.onblocked=()=>{clearTimeout(timer);finish(null)}}catch(e){DB=null;clearTimeout(timer);finish(null)}})}"
    if old_open in s:
        s = s.replace(old_open, new_open, 1)
    elif old_open_v18 in s:
        s = s.replace(old_open_v18, new_open, 1)
    elif new_open not in s:
        raise RuntimeError('Missing patch anchor: nonblocking IndexedDB')

    old_state = "async function loadStateForKey(key){let saved=await dbGet(stateKey(key));if(!saved){try{saved=JSON.parse(lsGet('sliq-v15-'+hashKey(key||'guest'),''))}catch(e){saved=null}}if(!saved){let legacy=[];try{legacy=JSON.parse(lsGet('sliq-web-chats','[]'));if(!Array.isArray(legacy))legacy=[]}catch(e){}if(legacy.length)saved={version:15,chats:legacy,memories:[],usage:defaultState().usage,current:legacy[0].id};}return normalizeState(saved)}\nasync function switchApiKey(newKey,copyGuest){newKey=String(newKey||'').trim();if(state)await persistNow();const old=apiKey;apiKey=newKey;lsSet('sliq-web-key',apiKey);if(apiKey)await dbPut('api-key',apiKey);let existing=await dbGet(stateKey(apiKey));if(!existing){try{existing=JSON.parse(lsGet('sliq-v15-'+hashKey(apiKey||'guest'),''))}catch(e){existing=null}}if(!existing&&copyGuest&&!old&&state){state=normalizeState(clone(state));await dbPut(stateKey(apiKey),state)}else state=await loadStateForKey(apiKey);current=state.current;renderAll();persistNow();toast(ui.apiKeyChanged)}"
    new_state = "function loadStateLocalForKey(key){let saved=null;try{saved=JSON.parse(lsGet('sliq-v15-'+hashKey(key||'guest'),''))}catch(e){saved=null}if(!saved){let legacy=[];try{legacy=JSON.parse(lsGet('sliq-web-chats','[]'));if(!Array.isArray(legacy))legacy=[]}catch(e){}if(legacy.length)saved={version:15,chats:legacy,memories:[],usage:defaultState().usage,current:legacy[0].id}}return normalizeState(saved)}\nasync function loadStateForKey(key){let saved=null;if(DB)saved=await dbGet(stateKey(key));return saved?normalizeState(saved):loadStateLocalForKey(key)}\nfunction switchApiKey(newKey,copyGuest){newKey=String(newKey||'').trim();if(state)persistNow();const old=apiKey;apiKey=newKey;lsSet('sliq-web-key',apiKey);let existing=null;try{existing=JSON.parse(lsGet('sliq-v15-'+hashKey(apiKey||'guest'),''))}catch(e){existing=null}if(!existing&&copyGuest&&!old&&state)state=normalizeState(clone(state));else state=loadStateLocalForKey(apiKey);current=state.current;renderAll();persistNow();toast(ui.apiKeyChanged);if(apiKey)dbPut('api-key',apiKey);dbPut(stateKey(apiKey),clone(state))}"
    s = replace_once(s, old_state, new_state, 'fast local API-key switching')

    old_save = "async function saveKey(){const v=$('keyInput').value.trim();if(!/^gsk_[A-Za-z0-9_-]{12,}$/.test(v)){$('keyStatus').textContent=t('invalid');return}const copyGuest=!apiKey;closeModal('keyModal');await switchApiKey(v,copyGuest);if(retryAfterKey){retryAfterKey=false;setTimeout(()=>sendMessage(),80)}}"
    old_save_v18 = "async function saveKey(){const v=$('keyInput').value.trim();if(!/^gsk_\\S{10,}$/.test(v)){$('keyStatus').textContent=t('invalid');$('keyInput').focus();return}const copyGuest=!apiKey,btn=$('saveKeyBtn');if(btn)btn.disabled=true;$('keyStatus').textContent='';try{await switchApiKey(v,copyGuest);closeModal('keyModal');if(retryAfterKey){retryAfterKey=false;setTimeout(()=>sendMessage(),80)}}catch(e){console.error(e);$('keyStatus').textContent=t('error')}finally{if(btn)btn.disabled=false}}"
    new_save = "function saveKey(){const v=$('keyInput').value.trim();if(!/^gsk_\\S{10,}$/.test(v)){$('keyStatus').textContent=t('invalid');$('keyInput').focus();return}const copyGuest=!apiKey,retry=retryAfterKey;retryAfterKey=false;$('keyStatus').textContent='';closeModal('keyModal');switchApiKey(v,copyGuest);if(retry)setTimeout(()=>sendMessage(),0)}"
    if old_save in s:
        s = s.replace(old_save, new_save, 1)
    elif old_save_v18 in s:
        s = s.replace(old_save_v18, new_save, 1)
    elif new_save not in s:
        raise RuntimeError('Missing patch anchor: immediate API key save')

    old_start = "async function start(){\n  await openDb();if(!apiKey){const backup=await dbGet('api-key');if(backup){apiKey=String(backup);lsSet('sliq-web-key',apiKey)}}await loadUi(lang);state=await loadStateForKey(apiKey);current=state.current;applyTheme();wire();renderAll();persistNow();$('messageInput').focus();if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}\n}"
    old_start_v18 = "async function start(){\n  await openDb();await loadUi(lang);state=await loadStateForKey(apiKey);current=state.current;applyTheme();wire();renderAll();persistNow();if(!apiKey)setTimeout(()=>showKey(true,false),120);else $('messageInput').focus();if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}\n}"
    new_start = "function start(){\n  state=loadStateLocalForKey(apiKey);current=state.current;applyTheme();wire();renderAll();persistNow();if(!apiKey)showKey(true,false);else $('messageInput').focus();if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{})}openDb().then(()=>{if(DB){if(apiKey)dbPut('api-key',apiKey);dbPut(stateKey(apiKey),clone(state))}}).catch(()=>{});loadUi(lang).then(()=>{fillLanguages();applyText();renderAll()}).catch(()=>{})\n}"
    if old_start in s:
        s = s.replace(old_start, new_start, 1)
    elif old_start_v18 in s:
        s = s.replace(old_start_v18, new_start, 1)
    elif new_start not in s:
        raise RuntimeError('Missing patch anchor: immediate web start')

    p.write_text(s, encoding='utf-8', newline='\n')


def patch_loader():
    p = Path('sliq-i18n-loader.js')
    s = p.read_text(encoding='utf-8')
    s = re.sub(r"s\.src='i18n/'\+code\+'\.js\?v=\d+';", "s.src='i18n/'+code+'.js?v=19';", s)
    # Bootstrap is loaded exactly once and directly by web.html. No dynamic bootstrap injection here.
    s = re.sub(r"/\* Load the API-key and interaction fallback independently from the main runtime\. \*/.*?\nif\(document\.readyState.*?;\n", "/* web-bootstrap-v18.js is loaded explicitly by web.html before the main runtime. */\n", s, flags=re.S)
    p.write_text(s, encoding='utf-8', newline='\n')


def patch_service_worker():
    Path('sw.js').write_text(
        "const CACHE='sliqadius-web-v19';\n"
        "const CORE=['./web.html','./web-v15.js','./web-bootstrap-v18.js','./sliq-i18n-loader.js','./logo-approved.jpg','./logo.png','./manifest.webmanifest'];\n"
        "self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});\n"
        "self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});\n"
        "self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;event.respondWith((async()=>{try{const fresh=await fetch(req,{cache:'no-store'});if(fresh&&fresh.ok){const cache=await caches.open(CACHE);cache.put(req,fresh.clone())}return fresh}catch(e){const cached=await caches.match(req);if(cached)return cached;if(req.mode==='navigate')return caches.match('./web.html');throw e}})())});\n",
        encoding='utf-8',
        newline='\n',
    )


patch_html()
patch_main_js()
patch_loader()
patch_service_worker()
print('Sliqadius Web v19 immediate interaction repair applied')
