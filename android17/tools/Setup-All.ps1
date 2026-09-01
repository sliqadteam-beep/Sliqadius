param(
    [string]$Root = "$env:USERPROFILE\Android 17 + Multiuser"
)

$ErrorActionPreference='Stop'
$toolDir=Join-Path $Root 'tools'
New-Item -ItemType Directory -Force $toolDir | Out-Null
$base='https://raw.githubusercontent.com/sliqadteam-beep/Sliqadius/main/android17/tools'
$names=@('Initialize-Workspace.ps1','Prepare-Release.ps1','Verify-Multiuser-Source.ps1','Verify-Running-System.ps1','README.md')
foreach($name in $names){
    Invoke-WebRequest "$base/$name" -OutFile (Join-Path $toolDir $name)
}
& (Join-Path $toolDir 'Initialize-Workspace.ps1') -Root $Root
Write-Host ''
Write-Host 'All preparation tools downloaded and workspace initialized.' -ForegroundColor Green
Write-Host "Tools: $toolDir" -ForegroundColor Cyan
Write-Host 'No phone changes were made.' -ForegroundColor Yellow
