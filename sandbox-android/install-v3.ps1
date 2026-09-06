$ErrorActionPreference='Stop'
$Ref='563b4fa486f5bc623688ddf4c7a543b12fd7d5e7'
Write-Host 'Sand:Box V3 Update startet...' -ForegroundColor Cyan

function Find-GameView {
    $roots=@(
        "$env:USERPROFILE\AndroidStudioProjects",
        "$env:USERPROFILE\Documents",
        "$env:USERPROFILE\Desktop",
        "$env:USERPROFILE\Downloads",
        "$env:USERPROFILE\OneDrive"
    ) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

    foreach($root in $roots){
        $g=Get-ChildItem $root -Filter GameView.kt -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match 'org\\sliqado\\sandbox' } |
            Select-Object -First 1
        if($g){ return $g }
    }
    return $null
}

$game=Find-GameView

if(-not $game){
    Write-Host 'Lokales Projekt nicht gefunden. Lade die verifizierte V3 automatisch herunter...' -ForegroundColor Yellow
    $projectRoot="$env:USERPROFILE\AndroidStudioProjects\SandBox"
    $zip="$env:TEMP\SandBoxV3.zip"
    $extract="$env:TEMP\SandBoxV3Extract"

    Remove-Item $zip -Force -ErrorAction SilentlyContinue
    Remove-Item $extract -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force (Split-Path $projectRoot) | Out-Null

    Invoke-WebRequest -UseBasicParsing "https://github.com/sliqadteam-beep/Sliqadius/archive/$Ref.zip" -OutFile $zip
    Expand-Archive $zip -DestinationPath $extract -Force

    $source=Get-ChildItem $extract -Directory | Select-Object -First 1
    $source=Join-Path $source.FullName 'sandbox-android'
    if(-not (Test-Path $source)){ throw 'sandbox-android wurde im Download nicht gefunden.' }

    if(Test-Path $projectRoot){
        $old="$projectRoot.backup_$(Get-Date -Format yyyyMMdd_HHmmss)"
        Move-Item $projectRoot $old
        Write-Host "Altes Projekt gesichert: $old" -ForegroundColor DarkGray
    }

    New-Item -ItemType Directory -Force $projectRoot | Out-Null
    Copy-Item (Join-Path $source '*') $projectRoot -Recurse -Force
    $game=Get-Item "$projectRoot\app\src\main\java\org\sliqado\sandbox\GameView.kt"
}

$gamePath=$game.FullName
$javaDir=$game.Directory.FullName
$project=$gamePath
while($project -and -not (Test-Path (Join-Path $project 'settings.gradle.kts'))){
    $project=Split-Path $project -Parent
}
if(-not $project){ throw 'Projektwurzel wurde nicht gefunden.' }

$stamp=Get-Date -Format yyyyMMdd_HHmmss
$backupDir=Join-Path $project "backup_v3_$stamp"
New-Item -ItemType Directory -Force $backupDir | Out-Null

Copy-Item $gamePath (Join-Path $backupDir 'GameView.kt') -Force
if(Test-Path (Join-Path $javaDir 'PixelSprites.kt')){
    Copy-Item (Join-Path $javaDir 'PixelSprites.kt') (Join-Path $backupDir 'PixelSprites.kt') -Force
}
if(Test-Path (Join-Path $project 'app\build.gradle.kts')){
    Copy-Item (Join-Path $project 'app\build.gradle.kts') (Join-Path $backupDir 'build.gradle.kts') -Force
}

$raw="https://raw.githubusercontent.com/sliqadteam-beep/Sliqadius/$Ref/sandbox-android"
Invoke-WebRequest -UseBasicParsing "$raw/app/src/main/java/org/sliqado/sandbox/GameView.kt" -OutFile $gamePath
Invoke-WebRequest -UseBasicParsing "$raw/app/src/main/java/org/sliqado/sandbox/PixelSprites.kt" -OutFile (Join-Path $javaDir 'PixelSprites.kt')
Invoke-WebRequest -UseBasicParsing "$raw/app/build.gradle.kts" -OutFile (Join-Path $project 'app\build.gradle.kts')

Write-Host ''
Write-Host 'FERTIG: Sand:Box V3 wurde installiert.' -ForegroundColor Green
Write-Host 'Neu: + / - Brush Size, horizontales Material-Scrolling, neue Pixel-Icons, bessere Physik und neues UI.' -ForegroundColor Cyan
Write-Host "Projekt: $project" -ForegroundColor Gray
Write-Host "Backup:  $backupDir" -ForegroundColor DarkGray

$studio=@(
    "$env:ProgramFiles\Android\Android Studio\bin\studio64.exe",
    "${env:ProgramFiles(x86)}\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if($studio){
    Start-Process $studio -ArgumentList "`"$project`""
    Write-Host 'Android Studio wurde geoeffnet. Gradle Sync abwarten, dann Run.' -ForegroundColor Green
}else{
    Write-Host 'Oeffne den Projektordner in Android Studio, warte auf Gradle Sync und druecke Run.' -ForegroundColor Yellow
}
