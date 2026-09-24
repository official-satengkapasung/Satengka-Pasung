Add-Type -AssemblyName System.Drawing

$bgPath = "C:\Users\lenovo\Documents\APP\satengkapasung\assets\background.PNG"
$logoPath = "C:\Users\lenovo\Documents\APP\satengkapasung\assets\logo_opt.png"

if (-not (Test-Path $bgPath)) {
    Write-Host "Background not found"
    exit 1
}
if (-not (Test-Path $logoPath)) {
    Write-Host "Logo not found"
    exit 1
}

$bgBmp = [System.Drawing.Bitmap]::FromFile($bgPath)
$logoBmp = [System.Drawing.Bitmap]::FromFile($logoPath)

Write-Host "Background loaded: $($bgBmp.Width) x $($bgBmp.Height)"
Write-Host "Logo loaded: $($logoBmp.Width) x $($logoBmp.Height)"

function GenerateTealPwaIcon($targetSize, $outputPath) {
    $targetBmp = New-Object System.Drawing.Bitmap ($targetSize, $targetSize)
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    
    # 1. Gambar latar belakang toska bermotif batik (crop tengah agar proporsional)
    # Background asli berukuran besar, kita ambil potongan persegi dari bagian tengah
    $minDim = [Math]::Min($bgBmp.Width, $bgBmp.Height)
    $srcX = [int](($bgBmp.Width - $minDim) / 2)
    $srcY = [int](($bgBmp.Height - $minDim) / 2)
    $srcRect = [System.Drawing.Rectangle]::new($srcX, $srcY, $minDim, $minDim)
    $destRect = [System.Drawing.Rectangle]::new(0, 0, $targetSize, $targetSize)
    
    $g.DrawImage($bgBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # 2. Gambar overlay toska lembut agar kontras logo dan teks putih semakin tegas
    $overlayColor = [System.Drawing.Color]::FromArgb(40, 20, 88, 97)
    $overlayBrush = New-Object System.Drawing.SolidBrush ($overlayColor)
    $g.FillRectangle($overlayBrush, 0, 0, $targetSize, $targetSize)
    $overlayBrush.Dispose()
    
    # 3. Gambar logo dengan safe-area padding maskable (~10% padding)
    # Ini memastikan seluruh elemen logo (sirine merah, rumah 3D, dan teks putih lengkung) terlihat utuh sempurna
    $padding = [int]($targetSize * 0.08)
    $drawW = $targetSize - (2 * $padding)
    $drawH = $targetSize - (2 * $padding)
    
    $logoDestRect = [System.Drawing.Rectangle]::new($padding, $padding, $drawW, $drawH)
    $logoSrcRect = [System.Drawing.Rectangle]::new(0, 0, $logoBmp.Width, $logoBmp.Height)
    
    $g.DrawImage($logoBmp, $logoDestRect, $logoSrcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
    Write-Host "Generated: $outputPath ($targetSize x $targetSize)"
}

$destDir = "C:\Users\lenovo\Documents\APP\satengkapasung\assets\icons"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

GenerateTealPwaIcon 512 "$destDir\icon-512x512.png"
GenerateTealPwaIcon 192 "$destDir\icon-192x192.png"
GenerateTealPwaIcon 512 "$destDir\icon-maskable-512x512.png"
GenerateTealPwaIcon 192 "$destDir\icon-maskable-192x192.png"

$bgBmp.Dispose()
$logoBmp.Dispose()
Write-Host "Success generating official teal batik PWA icons!"
