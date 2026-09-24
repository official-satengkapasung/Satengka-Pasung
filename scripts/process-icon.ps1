Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\lenovo\.gemini\antigravity-ide\brain\a5d381a5-5cc3-4f11-93b7-75914f463be0\.user_uploaded\media_1790253221060.png"
if (-not (Test-Path $srcPath)) {
    Write-Host "Source image not found"
    exit 1
}

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image: $($bmp.Width) x $($bmp.Height)"

$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -lt 40 -and $p.G -lt 40 -and $p.B -lt 40) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Bounding box hitam: X: $minX..$maxX ($($maxX - $minX)), Y: $minY..$maxY ($($maxY - $minY))"

$boxW = $maxX - $minX + 1
$boxH = $maxY - $minY + 1

$rect = [System.Drawing.Rectangle]::new($minX, $minY, $boxW, $boxH)
$cropped = $bmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

function CreatePwaIcon($sourceBmp, $targetSize, $outputPath) {
    $targetBmp = New-Object System.Drawing.Bitmap ($targetSize, $targetSize)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    
    # Fill background hitam
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Black)
    $g.FillRectangle($brush, 0, 0, $targetSize, $targetSize)
    $brush.Dispose()
    
    # Berikan padding 8% agar pas dengan safe area maskable
    $padding = [int]($targetSize * 0.08)
    $drawW = $targetSize - (2 * $padding)
    $drawH = $targetSize - (2 * $padding)
    
    $destRect = [System.Drawing.Rectangle]::new($padding, $padding, $drawW, $drawH)
    $srcRect = [System.Drawing.Rectangle]::new(0, 0, $sourceBmp.Width, $sourceBmp.Height)
    $g.DrawImage($sourceBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
    Write-Host "Generated: $outputPath ($targetSize x $targetSize)"
}

$destDir = "C:\Users\lenovo\Documents\APP\satengkapasung\assets\icons"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

CreatePwaIcon $cropped 512 "$destDir\icon-512x512.png"
CreatePwaIcon $cropped 192 "$destDir\icon-192x192.png"
CreatePwaIcon $cropped 512 "$destDir\icon-maskable-512x512.png"
CreatePwaIcon $cropped 192 "$destDir\icon-maskable-192x192.png"

# Simpan juga master cropped logo
$cropped.Save("C:\Users\lenovo\Documents\APP\satengkapasung\assets\logo_dark_pwa.png", [System.Drawing.Imaging.ImageFormat]::Png)

$cropped.Dispose()
$bmp.Dispose()
Write-Host "Success processing PWA icons!"
