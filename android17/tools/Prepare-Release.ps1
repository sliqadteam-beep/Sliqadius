param(
    [Parameter(Mandatory=$true)][string]$InputFile,
    [string]$Version = '0.1-dev',
    [string]$Device = 'Unverified',
    [string]$DownloadUrl = '',
    [switch]$MarkAvailable,
    [string]$Root = "$env:USERPROFILE\Android 17 + Multiuser"
)

$ErrorActionPreference = 'Stop'

if(!(Test-Path $InputFile -PathType Leaf)){
    throw "Input file not found: $InputFile"
}

if($MarkAvailable -and [string]::IsNullOrWhiteSpace($DownloadUrl)){
    throw 'MarkAvailable requires a DownloadUrl.'
}

$releaseDir = Join-Path $Root 'releases'
$checksumDir = Join-Path $Root 'checksums'
$webDir = Join-Path $Root 'website-data'
$logDir = Join-Path $Root 'logs'
foreach($d in @($releaseDir,$checksumDir,$webDir,$logDir)){New-Item -ItemType Directory -Force $d | Out-Null}

$source = Get-Item $InputFile
$ext = $source.Extension
$safeVersion = ($Version -replace '[^0-9A-Za-z._-]','-')
$fileName = "android17-multiuser-$safeVersion$ext"
$dest = Join-Path $releaseDir $fileName
Copy-Item $source.FullName $dest -Force

$hash = (Get-FileHash $dest -Algorithm SHA256).Hash.ToLowerInvariant()
$bytes = (Get-Item $dest).Length
if($bytes -ge 1GB){$size = ('{0:N2} GB' -f ($bytes/1GB))}
elseif($bytes -ge 1MB){$size = ('{0:N1} MB' -f ($bytes/1MB))}
else{$size = ('{0:N1} KB' -f ($bytes/1KB))}

"$hash  $fileName" | Set-Content (Join-Path $checksumDir "$fileName.sha256") -Encoding ASCII

$release = [ordered]@{
    project = 'Android 17 + Multiuser'
    version = $Version
    status = $(if($MarkAvailable){'release'}else{'prepared'})
    available = [bool]$MarkAvailable
    download_url = $(if($MarkAvailable){$DownloadUrl}else{''})
    file_name = $fileName
    file_size = $size
    sha256 = $hash
    android_version = '17'
    max_users = 5
    device = $Device
    notes = $(if($MarkAvailable){'Release metadata generated.'}else{'Build prepared locally; not publicly available yet.'})
}

$release | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $webDir 'release.json') -Encoding UTF8
$release | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $releaseDir "$fileName.manifest.json") -Encoding UTF8

@"
Android 17 + Multiuser
Version: $Version
File: $fileName
Size: $size
SHA-256: $hash
Device: $Device
Available: $([bool]$MarkAvailable)
"@ | Set-Content (Join-Path $logDir 'latest-release.txt') -Encoding UTF8

Write-Host ''
Write-Host 'Release package prepared.' -ForegroundColor Green
Write-Host "File: $dest" -ForegroundColor Cyan
Write-Host "SHA-256: $hash" -ForegroundColor Cyan
Write-Host "Website metadata: $(Join-Path $webDir 'release.json')" -ForegroundColor Cyan
if(!$MarkAvailable){Write-Host 'Public download remains disabled.' -ForegroundColor Yellow}
