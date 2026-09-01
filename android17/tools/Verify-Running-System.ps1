param(
    [string]$Adb = "$env:USERPROFILE\Android 17 + Multiuser\platform-tools\platform-tools\adb.exe"
)

$ErrorActionPreference = 'Stop'
if(!(Test-Path $Adb)){throw "adb.exe not found: $Adb"}

& $Adb start-server | Out-Null
$devices = & $Adb devices
if($devices -notmatch '\tdevice'){throw 'No authorized Android device or emulator is connected.'}

$maxUsers = (& $Adb shell getprop fw.max_users 2>$null).Trim()
$showUi = (& $Adb shell getprop fw.show_multiuserui 2>$null).Trim()
$users = & $Adb shell pm list users 2>$null

Write-Host 'Android 17 + Multiuser running-system check' -ForegroundColor Cyan
Write-Host "fw.max_users:       $maxUsers"
Write-Host "fw.show_multiuserui: $showUi"
Write-Host ''
Write-Host 'Android users:' -ForegroundColor Gray
$users | ForEach-Object {Write-Host $_}

$maxOk = $false
[int]$n=0
if([int]::TryParse($maxUsers,[ref]$n) -and $n -ge 2){$maxOk=$true}
$uiOk = $showUi -match '^(1|true)$'

if($maxOk){Write-Host 'Multi-user maximum: PASS' -ForegroundColor Green}else{Write-Host 'Multi-user maximum: NOT CONFIRMED' -ForegroundColor Yellow}
if($uiOk){Write-Host 'Multi-user UI property: PASS' -ForegroundColor Green}else{Write-Host 'Multi-user UI property: NOT CONFIRMED by property (resource configuration may still control it).' -ForegroundColor Yellow}

Write-Host 'This script only reads system state. It does not modify the connected device.' -ForegroundColor Gray
