# SLQI

Statische, deutschsprachige Clan-Website. HTML, CSS und JavaScript funktionieren ohne Build-Schritt, Paketmanager oder Datenbank.

## Entwicklung

Im vorhandenen Checkout arbeiten; kein zusätzliches Git-Worktree nötig.

```bash
cd /workspace/Sliqadius
python3 -m http.server 8001 --bind 127.0.0.1
```

Die Seite benötigt keine Zugangsdaten. Inhalte und Gestaltung stehen in `index.html`, `styles.css` und `app.js`. Den eigenen Discord-Link erst ergänzen, wenn die richtige Einladungsadresse vorliegt.

## Hosting

GitHub Pages veröffentlicht den Branch `main` aus dem Repository-Stamm unter `https://sliqado.org/`. Nach einem Push den Lauf „pages build and deployment“ kontrollieren. Die Domain-Zuordnung steht in `CNAME`; `.nojekyll` ermöglicht die direkte Auslieferung der statischen Dateien. Das Veröffentlichen einer Cloud-Umgebung ist ein separater Vorgang und aktualisiert die öffentliche Website nicht.

## Hauptadresse und alte Links

Die Hauptadresse ist `https://sliqado.org/`. Im Dokument ist diese Adresse als kanonische URL hinterlegt.

`server/index.html` enthält dieselbe Seite wie `index.html`. `url.js` setzt bei alten `/server`-Aufrufen die sichtbare Adresse ohne erneuten Seitenaufruf auf `/`. Dadurch können auch Browser mit einer alten Startseite, die noch nach `/server/` weiterleitet, die Clan-Seite laden. Der alte Parameter `clan` wird ebenfalls aus der Adresse entfernt.

Nach Änderungen an `index.html` die kompatible Kopie aktualisieren:

```bash
cp index.html server/index.html
```

## Vorheriger Projektstand

Die früheren Anwendungen wurden auf Wunsch durch die Clan-Seite ersetzt. Vollständige Sicherungen der ursprünglichen Checkouts einschließlich Git-Metadaten liegen in dieser Cloud-Umgebung unter `/workspace/.onboarding/archives/`. Sie gehören nicht zur ausgelieferten Website.
