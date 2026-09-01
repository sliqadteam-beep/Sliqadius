param(
    [string]$Root = "$env:USERPROFILE\Android 17 + Multiuser"
)

$ErrorActionPreference = 'Stop'

$files = Get-ChildItem $Root -Recurse -File -Include *.xml,*.prop,*.mk,*.bp,*.txt -ErrorAction SilentlyContinue
if(!$files){throw "No configuration files found under $Root"}

$maxUserHits = @()
$uiHits = @()
foreach($f in $files){
    $text = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if($text -match 'config_multiuserMaximumUsers'){ $maxUserHits += $f.FullName }
    if($text -match 'config_enableMultiUserUI'){ $uiHits += $f.FullName }
}

$maxOk = $false
$uiOk = $false
foreach($p in $maxUserHits){
    $t=Get-Content $p -Raw
    if($t -match 'config_multiuserMaximumUsers[^0-9]*([2-9]|[1-9][0-9]+)'){ $maxOk=$true; break }
}
foreach($p in $uiHits){
    $t=Get-Content $p -Raw
    if($t -match 'config_enableMultiUserUI[^<]*(?:</[^>]+>\s*)?true|config_enableMultiUserUI[^\r\n]*true'){ $uiOk=$true; break }
}

Write-Host 'Android 17 + Multiuser source check' -ForegroundColor Cyan
Write-Host "config_multiuserMaximumUsers: $maxOk" -ForegroundColor $(if($maxOk){'Green'}else{'Red'})
Write-Host "config_enableMultiUserUI:    $uiOk" -ForegroundColor $(if($uiOk){'Green'}else{'Red'})

if($maxUserHits){Write-Host 'Maximum-user references:' -ForegroundColor Gray;$maxUserHits | ForEach-Object {Write-Host "  $_" -ForegroundColor DarkGray}}
if($uiHits){Write-Host 'Multi-user UI references:' -ForegroundColor Gray;$uiHits | ForEach-Object {Write-Host "  $_" -ForegroundColor DarkGray}}

if(!($maxOk -and $uiOk)){
    Write-Host 'CHECK FAILED - do not mark a build as verified.' -ForegroundColor Red
    exit 1
}

Write-Host 'SOURCE CHECK PASSED.' -ForegroundColor Green
