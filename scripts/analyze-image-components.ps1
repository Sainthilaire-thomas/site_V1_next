# analyze-image-components.ps1
# Script d'analyse des composants images - Performance
# Date: 05 novembre 2025

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔍 Analyse Performance Images - Blanche Renaudin" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_PATH = "C:\Users\thoma\OneDrive\SONEAR_2025\site_v1_next"

# Vérifier que le projet existe
if (-Not (Test-Path $PROJECT_PATH)) {
    Write-Host "❌ Erreur: Projet introuvable à $PROJECT_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projet trouvé" -ForegroundColor Green
Write-Host ""

# Étape 1: Analyser ProductImage.tsx
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 ÉTAPE 1: Analyse de ProductImage.tsx" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$productImagePath = "$PROJECT_PATH\src\components\products\ProductImage.tsx"

if (Test-Path $productImagePath) {
    Write-Host "✅ Fichier trouvé: ProductImage.tsx" -ForegroundColor Green
    Write-Host ""
    
    # Lire le contenu
    $content = Get-Content $productImagePath -Raw
    
    # Analyser les tailles d'images
    Write-Host "🔍 Recherche des définitions de tailles..." -ForegroundColor Cyan
    if ($content -match "const\s+IMAGE_SIZES\s*=\s*\{([^}]+)\}") {
        Write-Host "   ✅ Trouvé IMAGE_SIZES:" -ForegroundColor Green
        Write-Host $matches[1] -ForegroundColor White
    } else {
        Write-Host "   ⚠️  IMAGE_SIZES non trouvé (pourrait être défini différemment)" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Rechercher les variantes de formats
    Write-Host "🔍 Recherche des formats supportés..." -ForegroundColor Cyan
    if ($content -match "AVIF|WebP|JPEG") {
        Write-Host "   ✅ Formats trouvés dans le code" -ForegroundColor Green
        
        # Compter les occurrences
        $avifCount = ([regex]::Matches($content, "avif", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        $webpCount = ([regex]::Matches($content, "webp", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        $jpegCount = ([regex]::Matches($content, "jpeg|jpg", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        
        Write-Host "   - AVIF: $avifCount références" -ForegroundColor White
        Write-Host "   - WebP: $webpCount références" -ForegroundColor White
        Write-Host "   - JPEG/JPG: $jpegCount références" -ForegroundColor White
    }
    Write-Host ""
    
    # Rechercher la gestion du loading/blur
    Write-Host "🔍 Analyse du loading/blur placeholder..." -ForegroundColor Cyan
    if ($content -match "blur|loading|skeleton") {
        Write-Host "   ✅ Système de loading détecté" -ForegroundColor Green
        
        # Chercher les transitions
        if ($content -match "transition|duration|animate") {
            Write-Host "   ✅ Animations/transitions trouvées" -ForegroundColor Green
        }
    }
    Write-Host ""
    
    # Afficher les premières lignes importantes
    Write-Host "📄 Aperçu du fichier (50 premières lignes):" -ForegroundColor Cyan
    Get-Content $productImagePath -TotalCount 50 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    Write-Host ""
    
} else {
    Write-Host "❌ ProductImage.tsx introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 ÉTAPE 2: Analyse de ProductDetailClient.tsx" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

$productDetailPath = "$PROJECT_PATH\src\app\product\[id]\ProductDetailClient.tsx"

if (Test-Path $productDetailPath) {
    Write-Host "✅ Fichier trouvé: ProductDetailClient.tsx" -ForegroundColor Green
    Write-Host ""
    
    $content = Get-Content $productDetailPath -Raw
    
    # Rechercher l'utilisation de ProductImage
    Write-Host "🔍 Recherche de l'utilisation de ProductImage..." -ForegroundColor Cyan
    $productImageMatches = [regex]::Matches($content, "<ProductImage[^>]*>", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    
    if ($productImageMatches.Count -gt 0) {
        Write-Host "   ✅ Trouvé $($productImageMatches.Count) utilisations de <ProductImage>" -ForegroundColor Green
        Write-Host ""
        Write-Host "   📌 Première utilisation:" -ForegroundColor Cyan
        Write-Host "   $($productImageMatches[0].Value.Substring(0, [Math]::Min(200, $productImageMatches[0].Value.Length)))" -ForegroundColor White
    }
    Write-Host ""
    
    # Vérifier priority
    Write-Host "🔍 Vérification de la prop 'priority'..." -ForegroundColor Cyan
    if ($content -match "priority=\{([^}]+)\}") {
        Write-Host "   ✅ Priority trouvé: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Priority non détecté ou non utilisé" -ForegroundColor Yellow
    }
    Write-Host ""
    
} else {
    Write-Host "❌ ProductDetailClient.tsx introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 ÉTAPE 3: Statistiques Globales" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# Compter les fichiers image dans le projet
Write-Host "📊 Fichiers images dans public/:" -ForegroundColor Cyan
$publicPath = "$PROJECT_PATH\public"
if (Test-Path $publicPath) {
    $svgCount = (Get-ChildItem -Path $publicPath -Filter "*.svg" -Recurse).Count
    $pngCount = (Get-ChildItem -Path $publicPath -Filter "*.png" -Recurse).Count
    $jpgCount = (Get-ChildItem -Path $publicPath -Filter "*.jpg" -Recurse).Count
    $webpCount = (Get-ChildItem -Path $publicPath -Filter "*.webp" -Recurse).Count
    
    Write-Host "   - SVG: $svgCount fichiers" -ForegroundColor White
    Write-Host "   - PNG: $pngCount fichiers" -ForegroundColor White
    Write-Host "   - JPG: $jpgCount fichiers" -ForegroundColor White
    Write-Host "   - WebP: $webpCount fichiers" -ForegroundColor White
}
Write-Host ""

# Rechercher tous les composants qui utilisent ProductImage
Write-Host "🔍 Composants utilisant ProductImage:" -ForegroundColor Cyan
$componentsPath = "$PROJECT_PATH\src"
$filesUsingProductImage = Get-ChildItem -Path $componentsPath -Filter "*.tsx" -Recurse | 
    Where-Object { (Get-Content $_.FullName -Raw) -match "ProductImage|ResponsiveProductImage" } |
    Select-Object -ExpandProperty Name

if ($filesUsingProductImage.Count -gt 0) {
    Write-Host "   ✅ Trouvé dans $($filesUsingProductImage.Count) fichiers:" -ForegroundColor Green
    $filesUsingProductImage | ForEach-Object { Write-Host "      - $_" -ForegroundColor White }
} else {
    Write-Host "   ⚠️  Aucun fichier trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ Analyse Terminée" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Examiner le contenu de ProductImage.tsx en détail" -ForegroundColor White
Write-Host "   2. Vérifier les tailles d'images optimales" -ForegroundColor White
Write-Host "   3. Tester le loading/blur sur différents devices" -ForegroundColor White
Write-Host "   4. Optimiser si nécessaire" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
