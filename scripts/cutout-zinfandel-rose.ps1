Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\bepop\.cursor\projects\c-Users-bepop-Downloads-Marko-Gude\assets\c__Users_bepop_AppData_Roaming_Cursor_User_workspaceStorage_13ce21bd201ef62f783ae493ec8d0ad5_images_WhatsApp_Image_2026-05-27_at_19.36.47__1_-30d1094c-2f1b-4395-a853-f5ed59b2006f.png'
$dst = Join-Path $PSScriptRoot '..\images\zinfandel-rose-bottle-cutout.png'

function New-Cutout($bitmap) {
  $out = New-Object System.Drawing.Bitmap($bitmap.Width, $bitmap.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $p = $bitmap.GetPixel($x, $y)
      $r = $p.R; $g = $p.G; $b = $p.B
      $min = [Math]::Min($r, [Math]::Min($g, $b))
      if ($r -gt 242 -and $g -gt 242 -and $b -gt 242) {
        $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        continue
      }
      if ($r -gt 228 -and $g -gt 225 -and $b -gt 218) {
        $t = [Math]::Min(1.0, ($min - 218) / 32.0)
        $a = [int](255 * (1 - $t))
        if ($a -lt 6) {
          $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
          $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $r, $g, $b))
        }
        continue
      }
      $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
  }
  return $out
}

function Get-AlphaBounds($bitmap) {
  $minX = $bitmap.Width; $minY = $bitmap.Height; $maxX = 0; $maxY = 0
  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      if ($bitmap.GetPixel($x, $y).A -gt 24) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  return @{ MinX = $minX; MinY = $minY; MaxX = $maxX; MaxY = $maxY }
}

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$cut = New-Cutout $bmp
$bmp.Dispose()

$bounds = Get-AlphaBounds $cut
$pad = 6
$cropX = [Math]::Max(0, $bounds.MinX - $pad)
$cropY = [Math]::Max(0, $bounds.MinY - $pad)
$cropW = [Math]::Min($cut.Width - $cropX, $bounds.MaxX - $bounds.MinX + ($pad * 2))
$cropH = [Math]::Min($cut.Height - $cropY, $bounds.MaxY - $bounds.MinY + ($pad * 2))
$trimmed = New-Object System.Drawing.Bitmap($cropW, $cropH)
$tg = [System.Drawing.Graphics]::FromImage($trimmed)
$tg.DrawImage($cut, 0, 0, (New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)), [System.Drawing.GraphicsUnit]::Pixel)
$tg.Dispose(); $cut.Dispose()

$canvas = 300
$scaled = New-Object System.Drawing.Bitmap($canvas, $canvas, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($scaled)
$g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$scale = [Math]::Min(($canvas - 24) / $trimmed.Width, ($canvas - 16) / $trimmed.Height)
$newW = [int]($trimmed.Width * $scale)
$newH = [int]($trimmed.Height * $scale)
$posX = [int](($canvas - $newW) / 2)
$posY = $canvas - $newH - 8
$g.DrawImage($trimmed, $posX, $posY, $newW, $newH)
$g.Dispose(); $trimmed.Dispose()

$scaled.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$scaled.Dispose()
Write-Host "Saved: $dst ($canvas x $canvas)"
