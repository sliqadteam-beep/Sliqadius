# SLQI

Statische, deutschsprachige Clan-Website. HTML und CSS funktionieren ohne Build-Schritt, Paketmanager oder Datenbank.

## Entwicklung

Im vorhandenen Checkout arbeiten; kein zusätzliches Git-Worktree nötig.

```bash
cd /workspace/Sliqadius
python3 -m http.server 8001 --bind 127.0.0.1
```

Die Seite benötigt keine Zugangsdaten. Inhalte und Gestaltung stehen in `index.html` und `styles.css`. Den eigenen Discord-Link erst ergänzen, wenn die richtige Einladungsadresse vorliegt.

## Hosting

Die Dateien können von einem statischen Webserver ausgeliefert werden. Die bestehende Domain-Zuordnung in `CNAME` wurde beibehalten. Die Einrichtung veröffentlicht die Website nicht automatisch.

## Vorheriger Projektstand

Die früheren Anwendungen wurden auf Wunsch durch die Clan-Seite ersetzt. Vollständige Sicherungen der ursprünglichen Checkouts einschließlich Git-Metadaten liegen in dieser Cloud-Umgebung unter `/workspace/.onboarding/archives/`. Sie gehören nicht zur ausgelieferten Website.
