# @Sliqad

Minimale Website unter https://sliqado.org/: sichtbar sind ausschließlich die Überschrift `@Sliqad` und zwei Buttons zu den vom Nutzer angegebenen Profilen:

- https://tiktok.com/@sliqad
- https://youtube.com/@sliqad

## Entwicklung

Im vorhandenen Checkout arbeiten; kein zusätzliches Git-Worktree erforderlich. Kein Build, Paketmanager, Datenbankdienst oder Zugangsschlüssel nötig.

```bash
cd /workspace/Sliqadius
python3 -m http.server 8001 --bind 127.0.0.1
```

Die Seite besteht aus `index.html` und `styles.css`. Die lokale Schrift mit Lizenz liegt in `assets/fonts/`.

## Hauptadresse und alte Links

Die kanonische Adresse bleibt `https://sliqado.org/`, ohne Zusatzparameter oder `/server/`. `server/index.html` ist eine bytegleiche Kopie von `index.html`. Das früh geladene `url.js` bereinigt alte Einstiegspfade und den früheren Parameter `clan`, ohne erneut zur eventuell zwischengespeicherten alten Startseite zu navigieren.

Nach HTML-Änderungen synchronisieren:

```bash
cp index.html server/index.html
```

## Prüfung und Veröffentlichung

Die Browserprüfung der Cloud-Umgebung liegt unter `/workspace/.onboarding/slqi/check_browser.py`. Sie prüft die exakt drei sichtbaren Texte, beide Profil-Links, Tastaturbedienung, responsive Darstellung und kanonische URLs.

GitHub Pages veröffentlicht `main` aus dem Repository-Stamm. Nach einem beauftragten Push den Lauf „pages build and deployment“ prüfen. `CNAME` enthält die Domain, `.nojekyll` aktiviert die direkte statische Auslieferung. Die Veröffentlichung der Cloud-Umgebung ist davon getrennt.

Sicherungen der ursprünglichen Checkouts liegen außerhalb der Website unter `/workspace/.onboarding/archives/`.
