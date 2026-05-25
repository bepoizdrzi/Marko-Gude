param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Dst
)
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile($Src)
$out = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $bmp.Height; $y++) {
  for ($x = 0; $x -lt $bmp.Width; $x++) {
    $p = $bmp.GetPixel($x, $y)
    $r = $p.R; $g = $p.G; $b = $p.B
    $min = [Math]::Min($r, [Math]::Min($g, $b))
    if ($r -gt 240 -and $g -gt 240 -and $b -gt 240) {
      $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      continue
    }
    if ($r -gt 200 -and $g -gt 200 -and $b -gt 200) {
      $t = [Math]::Min(1.0, ($min - 200) / 45.0)
      $a = [int](255 * (1 - $t))
      if ($a -lt 8) {
        $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      } else {
        $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, $r, $g, $b))
      }
      continue
    }
    $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
  }
}
$out.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $out.Dispose()
Write-Host "Saved: $Dst"
