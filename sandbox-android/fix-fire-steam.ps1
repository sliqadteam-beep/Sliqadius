$ErrorActionPreference='Stop'
Write-Host 'Sand:Box fire/steam lifetime fix...' -ForegroundColor Cyan

$roots=@(
    "$env:USERPROFILE\AndroidStudioProjects",
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\OneDrive"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique

$game=$null
foreach($root in $roots){
    $game=Get-ChildItem $root -Filter GameView.kt -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match 'org\\sliqado\\sandbox' } |
        Select-Object -First 1
    if($game){break}
}
if(-not $game){
    $game=Get-ChildItem $env:USERPROFILE -Filter GameView.kt -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match 'org\\sliqado\\sandbox' -and $_.FullName -notmatch '\\AppData\\Local\\Temp\\' } |
        Select-Object -First 1
}
if(-not $game){ throw 'GameView.kt was not found.' }

$path=$game.FullName
$backup="$path.backup_lifetime_$(Get-Date -Format yyyyMMdd_HHmmss)"
Copy-Item $path $backup -Force
$s=[IO.File]::ReadAllText($path)

$oldGas=@'
            STEAM, SMOKE, GAS -> {
                life[i] = ((life[i].toInt() and 0xffff) + 1).coerceAtMost(32767).toShort()
                gas(x, y, 3)
                if ((life[i].toInt() and 0xffff) > 420 && t != GAS) clearCell(i)
            }
'@

$newGas=@'
            STEAM, SMOKE, GAS -> {
                val age = (life[i].toInt() and 0xffff) + 1
                life[i] = age.coerceAtMost(32767).toShort()
                val j = gas(x, y, 3)

                when (t) {
                    STEAM -> {
                        // Steam is temporary: it slowly cools and eventually condenses.
                        temp[j] -= .45f
                        if (age >= 180) {
                            type[j] = WATER.toByte()
                            life[j] = 0
                            temp[j] = min(temp[j], 82f)
                        }
                    }
                    SMOKE -> {
                        // Smoke fades away instead of floating forever.
                        if (age >= 260) clearCell(j)
                    }
                    GAS -> {
                        // Normal gas may persist; only steam/smoke need a strict lifetime.
                    }
                }
            }
'@

if(-not $s.Contains($oldGas)){
    throw "Steam block did not match the expected V3 source. Backup: $backup"
}
$s=$s.Replace($oldGas,$newGas)

$oldFire=@'
                val age = life[i].toInt() and 0xffff
                if (age > 80 + rnd.nextInt(100)) {
                    type[i] = if (rnd.nextFloat() < .55f) SMOKE.toByte() else ASH.toByte()
                    life[i] = 0
                    return
                }
                gas(x, y, 2)
'@

$newFire=@'
                val age = life[i].toInt() and 0xffff
                // A single fire particle has a hard maximum lifetime.
                if (age >= 110) {
                    if (rnd.nextFloat() < .68f) {
                        type[i] = SMOKE.toByte()
                        life[i] = 0
                        temp[i] = 170f
                    } else if (rnd.nextFloat() < .55f) {
                        type[i] = ASH.toByte()
                        life[i] = 0
                        temp[i] = 45f
                    } else {
                        clearCell(i)
                    }
                    return
                }
                gas(x, y, 2)
'@

if(-not $s.Contains($oldFire)){
    throw "Fire block did not match the expected V3 source. Backup: $backup"
}
$s=$s.Replace($oldFire,$newFire)

[IO.File]::WriteAllText($path,$s,[Text.UTF8Encoding]::new($false))
Write-Host ''
Write-Host 'DONE: Fire and steam now have finite lifetimes.' -ForegroundColor Green
Write-Host 'Fire: max ~110 simulation ticks, then smoke/ash/fade.' -ForegroundColor DarkGray
Write-Host 'Steam: ~180 simulation ticks, then condenses into water.' -ForegroundColor DarkGray
Write-Host 'Smoke: ~260 simulation ticks, then disappears.' -ForegroundColor DarkGray
Write-Host "Backup: $backup" -ForegroundColor Yellow
