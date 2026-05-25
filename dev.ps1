# Pokreće dev server (zaobilazi PowerShell execution policy na npm.ps1)
$nodeDir = "C:\Program Files\nodejs"
if (-not (Test-Path "$nodeDir\npm.cmd")) {
  Write-Host "Node.js nije pronaden. Instalirajte: winget install OpenJS.NodeJS.LTS" -ForegroundColor Red
  exit 1
}
$env:Path = "$nodeDir;" + $env:Path
Set-Location $PSScriptRoot
& "$nodeDir\npm.cmd" run dev
