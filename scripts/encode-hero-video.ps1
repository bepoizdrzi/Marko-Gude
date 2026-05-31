$ErrorActionPreference = 'Stop'

$ffmpegRoot = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin"
$ffmpeg = Join-Path $ffmpegRoot 'ffmpeg.exe'
if (-not (Test-Path $ffmpeg)) {
  $ffmpeg = 'ffmpeg'
}

$src = 'c:\Users\bepop\Downloads\WhatsApp Video 2026-05-31 at 15.07.13.mp4'
if (-not (Test-Path $src)) {
  $src = Join-Path $PSScriptRoot '..\videos\hero-bg-source.mp4'
}

$outDir = Join-Path $PSScriptRoot '..\videos'
$mp4 = Join-Path $outDir 'hero-bg.mp4'
$webm = Join-Path $outDir 'hero-bg.webm'
$poster = Join-Path $outDir 'hero-poster.jpg'

$vf = 'fps=30,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,unsharp=5:5:0.55:5:5:0.0'

& $ffmpeg -y -i $src -an -vf $vf `
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.1 -pix_fmt yuv420p `
  -movflags +faststart $mp4

& $ffmpeg -y -i $src -an -vf $vf `
  -c:v libvpx-vp9 -crf 20 -b:v 0 -row-mt 1 -cpu-used 2 `
  $webm

& $ffmpeg -y -i $src -ss 00:00:00.5 -vframes 1 -an `
  -vf 'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080' `
  -q:v 2 $poster

Get-ChildItem $mp4, $webm, $poster | Select-Object Name, @{ N='MB'; E={[math]::Round($_.Length/1MB, 2)} }
