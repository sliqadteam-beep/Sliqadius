$ErrorActionPreference='Stop'
Write-Host 'Sand:Box V3 Grafik-Update startet...' -ForegroundColor Cyan

function Find-GameView {
    $roots=@(
        "$env:USERPROFILE\AndroidStudioProjects",
        "$env:USERPROFILE\Documents",
        "$env:USERPROFILE\Desktop",
        "$env:USERPROFILE\Downloads",
        "$env:USERPROFILE\OneDrive",
        "$env:USERPROFILE\OneDrive\Documents",
        "$env:USERPROFILE\OneDrive\Desktop"
    ) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

    foreach($root in $roots){
        $g=Get-ChildItem $root -Filter GameView.kt -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match 'org\\sliqado\\sandbox' } |
            Select-Object -First 1
        if($g){ return $g }
    }

    Write-Host 'Projekt nicht in den Standardordnern gefunden. Suche im Benutzerordner...' -ForegroundColor Yellow
    $g=Get-ChildItem $env:USERPROFILE -Filter GameView.kt -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match 'org\\sliqado\\sandbox' -and $_.FullName -notmatch '\\AppData\\Local\\Temp\\' } |
        Select-Object -First 1
    return $g
}

$game=Find-GameView

if(-not $game){
    Write-Host 'Lokale Quelldateien wurden nicht gefunden.' -ForegroundColor Yellow
    Write-Host 'Ich lade das Sand:Box Android Projekt jetzt automatisch von GitHub herunter...' -ForegroundColor Cyan

    $projectRoot="$env:USERPROFILE\AndroidStudioProjects\SandBox"
    $tmpZip="$env:TEMP\Sliqadius-main.zip"
    $tmpDir="$env:TEMP\Sliqadius-main-extract"

    if(Test-Path $tmpZip){Remove-Item $tmpZip -Force}
    if(Test-Path $tmpDir){Remove-Item $tmpDir -Recurse -Force}
    New-Item -ItemType Directory -Force (Split-Path $projectRoot) | Out-Null

    Invoke-WebRequest -UseBasicParsing 'https://github.com/sliqadteam-beep/Sliqadius/archive/refs/heads/main.zip' -OutFile $tmpZip
    Expand-Archive $tmpZip -DestinationPath $tmpDir -Force

    $source=Join-Path $tmpDir 'Sliqadius-main\sandbox-android'
    if(-not (Test-Path $source)){
        throw 'Download war erfolgreich, aber sandbox-android wurde im ZIP nicht gefunden.'
    }

    if(Test-Path $projectRoot){
        $old="$projectRoot.backup_$(Get-Date -Format yyyyMMdd_HHmmss)"
        Move-Item $projectRoot $old
        Write-Host "Vorhandener Projektordner gesichert: $old" -ForegroundColor DarkGray
    }

    New-Item -ItemType Directory -Force $projectRoot | Out-Null
    Copy-Item (Join-Path $source '*') $projectRoot -Recurse -Force

    $game=Get-Item "$projectRoot\app\src\main\java\org\sliqado\sandbox\GameView.kt" -ErrorAction Stop
    Write-Host "Projekt heruntergeladen nach: $projectRoot" -ForegroundColor Green
}

$gamePath=$game.FullName
$dir=$game.Directory.FullName
$spritePath=Join-Path $dir 'PixelSprites.kt'
$backup="$gamePath.backup_v3_$(Get-Date -Format yyyyMMdd_HHmmss)"
Copy-Item $gamePath $backup -Force
Write-Host "Projekt: $gamePath" -ForegroundColor Green
Write-Host "Backup:  $backup" -ForegroundColor DarkGray

# Aktuelle PixelSprites direkt aus GitHub laden
$spriteUrl='https://raw.githubusercontent.com/sliqadteam-beep/Sliqadius/main/sandbox-android/app/src/main/java/org/sliqado/sandbox/PixelSprites.kt'
Invoke-WebRequest -UseBasicParsing $spriteUrl -OutFile $spritePath

$s=[IO.File]::ReadAllText($gamePath)

if($s -notmatch 'PixelSprites\.textureColor'){
$render=@'
    private fun materialColor(i:Int,t:Int,x:Int,y:Int):Int{
        if(t==AIR)return 0xff000018.toInt()
        var c=defs[t]?.color?:Color.MAGENTA
        c=PixelSprites.textureColor(t,x,y,c)
        if(t==SEED&&(life[i].toInt() and 0xffff)>45)c=PixelSprites.textureColor(t,x,y,0xff59b95f.toInt())
        if(t==LAMP&&volt[i]>8f)c=blend(c,Color.WHITE,.55f)
        val tt=temp[i]
        if(tt>80f)c=blend(c,if(tt>900f)Color.WHITE else 0xffff5a22.toInt(),min(1f,(tt-80f)/900f))
        else if(tt<0f)c=blend(c,0xff62c8ff.toInt(),min(.75f,-tt/200f))
        return c
    }
    private fun renderBitmap(){
        for(y in 0 until GH)for(x in 0 until GW){
            val i=id(x,y);val t=type[i].toInt() and 255
            pixels[i]=when(viewMode){
                ViewMode.MATERIAL->materialColor(i,t,x,y)
                ViewMode.HEAT->if(t==AIR)0xff05051a.toInt()else heatColor(temp[i])
                ViewMode.ELECTRIC->if(t==AIR)0xff030315.toInt()else if(volt[i]>1f)blend(0xff423300.toInt(),0xffffff68.toInt(),min(1f,volt[i]/100f))else blend(materialColor(i,t,x,y),0xff0b1020.toInt(),.72f)
            }
        }
        bitmap.setPixels(pixels,0,GW,0,0,GW,GH)
    }
    override fun onDraw
'@
    $pat='(?s)    private fun materialColor\(i:Int,t:Int\):Int\{.*?    override fun onDraw'
    $n=[regex]::Replace($s,$pat,$render,1)
    if($n -eq $s){Copy-Item $backup $gamePath -Force;throw 'Rendering-Patch konnte nicht eingesetzt werden. Original wurde wiederhergestellt.'}
    $s=$n
}

if($s -notmatch 'private fun elementTile\('){
$menu=@'
    private fun elementTile(c:Canvas,col:Int,rowTop:Float,bg:Int,d:Def,active:Boolean){
        val l=col*tileW;val r=l+tileW
        p.style=Paint.Style.FILL;p.color=if(active)blend(bg,Color.WHITE,.22f)else bg
        c.drawRect(l,rowTop,r,rowTop+tileH,p)
        thin.color=if(active)Color.WHITE else 0xff303030.toInt();thin.strokeWidth=if(active)max(3f,width/350f)else max(2f,width/500f)
        c.drawRect(l,rowTop,r,rowTop+tileH,thin)
        val iconSize=min(tileW,tileH)*.42f
        PixelSprites.drawIcon(c,d.id,l+(tileW-iconSize)/2f,rowTop+tileH*.07f,iconSize,d.color,p)
        text.color=Color.BLACK;text.typeface=android.graphics.Typeface.DEFAULT_BOLD;text.textSize=tileH*.19f
        c.drawText(d.short,l+tileW/2f,rowTop+tileH*.68f,text)
        text.textSize=tileH*.085f;c.drawText(d.name,l+tileW/2f,rowTop+tileH*.86f,text)
    }
    private fun drawElements(c:Canvas){
        val top=simBottom+tileH;val visibleH=height-top;val rows=ceil(list.size/6.0).toInt();val maxScroll=max(0f,rows*tileH-visibleH)
        elementScroll=elementScroll.coerceIn(0f,maxScroll)
        for(n in list.indices){
            val row=n/6;val col=n%6;val y=top+row*tileH-elementScroll
            if(y+tileH<top||y>height)continue
            val d=list[n];elementTile(c,col,y,categoryColor(d),d,d.id==selected&&!erasing)
        }
    }
    override fun onTouchEvent
'@
    $pat2='(?s)    private fun drawElements\(c:Canvas\)\{.*?    override fun onTouchEvent'
    $n=[regex]::Replace($s,$pat2,$menu,1)
    if($n -eq $s){Copy-Item $backup $gamePath -Force;throw 'Menue-Patch konnte nicht eingesetzt werden. Original wurde wiederhergestellt.'}
    $s=$n
}

[IO.File]::WriteAllText($gamePath,$s,[Text.UTF8Encoding]::new($false))

# Projektwurzel finden und optional Android Studio oeffnen
$project=$gamePath
while($project -and -not (Test-Path (Join-Path $project 'settings.gradle.kts'))){
    $project=Split-Path $project -Parent
}

Write-Host ''
Write-Host 'FERTIG: Sand:Box V3 Pixel-Grafik wurde eingebaut.' -ForegroundColor Green
Write-Host "Projektordner: $project" -ForegroundColor Cyan
Write-Host "Backup: $backup" -ForegroundColor DarkGray
Write-Host ''

$studio=@(
    "$env:ProgramFiles\Android\Android Studio\bin\studio64.exe",
    "${env:ProgramFiles(x86)}\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if($studio -and $project){
    Start-Process $studio -ArgumentList "`"$project`""
    Write-Host 'Android Studio wurde geoeffnet. Warte auf Gradle Sync und druecke dann Run.' -ForegroundColor Green
}else{
    Write-Host 'Oeffne den Projektordner in Android Studio, warte auf Gradle Sync und druecke dann Run.' -ForegroundColor Yellow
}
