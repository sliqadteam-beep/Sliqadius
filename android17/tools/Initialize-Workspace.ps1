param(
    [string]$Root = "$env:USERPROFILE\Android 17 + Multiuser"
)

$ErrorActionPreference = 'Stop'

$dirs = @(
    'builds\incoming',
    'builds\verified',
    'releases',
    'checksums',
    'docs',
    'logs',
    'tools',
    'website-data',
    'source-config\overlay\frameworks\base\core\res\res\values'
)

foreach($d in $dirs){
    New-Item -ItemType Directory -Force (Join-Path $Root $d) | Out-Null
}

@'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <integer name="config_multiuserMaximumUsers">5</integer>
    <bool name="config_enableMultiUserUI">true</bool>
</resources>
'@ | Set-Content (Join-Path $Root 'source-config\overlay\frameworks\base\core\res\res\values\config.xml') -Encoding UTF8

@'
# Android 17 + Multiuser

## 0.1-dev
- Workspace initialized.
- Native multi-user target: 5 users.
- Release automation prepared.
- Compatibility remains unverified until explicitly tested.
'@ | Set-Content (Join-Path $Root 'CHANGELOG.md') -Encoding UTF8

@'
{
  "project": "Android 17 + Multiuser",
  "version": "0.1-dev",
  "status": "development",
  "available": false,
  "download_url": "",
  "file_name": "",
  "file_size": "",
  "sha256": "",
  "android_version": "17",
  "max_users": 5,
  "device": "Not released yet",
  "notes": "Development build not yet available for download."
}
'@ | Set-Content (Join-Path $Root 'website-data\release-template.json') -Encoding UTF8

@'
{
  "manufacturer": "Samsung",
  "name": "Galaxy A26 5G",
  "model": "SM-A266B/DS",
  "status": "unverified",
  "bootloader": "unknown / not yet checked",
  "treble": "not yet verified",
  "notes": "Do not flash until compatibility has been verified."
}
'@ | Set-Content (Join-Path $Root 'docs\compatibility.json') -Encoding UTF8

Write-Host "Android 17 + Multiuser workspace ready:" -ForegroundColor Green
Write-Host $Root -ForegroundColor Cyan
Write-Host "No phone changes were made." -ForegroundColor Yellow
