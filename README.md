# Sliqad

Statische, deutschsprachige Infoseite für Sliqad, Minecraft-YouTuber.

- Website: https://sliqado.org/
- YouTube: https://youtube.com/@sliqad
- TikTok: https://tiktok.com/@sliqad

Die beiden Kanaladressen wurden vom Nutzer angegeben. Abonnentenzahlen, konkrete Videos oder Upload-Zeiten werden nicht erfunden oder automatisch abgefragt.

## Entwicklung

Im vorhandenen Checkout arbeiten; kein zusätzliches Git-Worktree erforderlich. Es gibt keinen Build-Schritt, Paketmanager oder Datenbankdienst.

```bash
cd /workspace/Sliqadius
python3 -m http.server 8001 --bind 127.0.0.1
```

Inhalte und Gestaltung stehen in `index.html`, `styles.css` und `app.js`. Die Schrift wird lokal aus `assets/fonts/` geladen; ihre Lizenz liegt dort in `OFL.txt`. Die Website benötigt keine Zugangsdaten.

## Hauptadresse und alte Links

Die kanonische Hauptadresse ist `https://sliqado.org/`, ohne Zusatzparameter und ohne `/server/`.

`server/index.html` enthält dieselbe Seite wie `index.html`. Das früh geladene `url.js` setzt bei alten `/server`-Aufrufen die sichtbare Adresse ohne erneute Navigation auf `/`. So können Browser mit einer zwischengespeicherten alten Startseite die aktuelle Seite laden. Der frühere Parameter `clan` wird ebenfalls aus der Adresse entfernt.

Nach Änderungen an `index.html` die kompatible Kopie aktualisieren:

```bash
cp index.html server/index.html
```

## Prüfung und Veröffentlichung

Die Browserprüfung liegt in dieser Cloud-Umgebung unter `/workspace/.onboarding/slqi/check_browser.py`. Sie prüft die sichtbaren Inhalte, die beiden Social-Links, mobile Navigation, Tastaturbedienung und alte Einstiegspfade.

GitHub Pages veröffentlicht `main` aus dem Repository-Stamm. Nach einem beauftragten Push den zugehörigen Lauf „pages build and deployment“ kontrollieren. `CNAME` enthält die Domain-Zuordnung; `.nojekyll` ermöglicht die direkte Auslieferung der Dateien.

Das Veröffentlichen der Cloud-Umgebung und das Aktualisieren der öffentlichen Website sind getrennte Vorgänge. Sicherungen der ursprünglichen Checkouts liegen außerhalb der ausgelieferten Website unter `/workspace/.onboarding/archives/`.
