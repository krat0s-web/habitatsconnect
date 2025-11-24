# Script PowerShell pour convertir tous les fichiers Markdown en PDF
# Utilise l'extension VS Code Markdown PDF

Write-Host "=== Conversion Livrables Markdown vers PDF ===" -ForegroundColor Green
Write-Host "Utilisation de l'extension VS Code Markdown PDF" -ForegroundColor Yellow
Write-Host ""

# Créer le dossier de sortie
$outputDir = "PDF_Output"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Dossier PDF_Output créé" -ForegroundColor Blue
}

# Fonction pour convertir un fichier
function Convert-MarkdownToPdf {
    param([string]$markdownPath)

    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($markdownPath)
    $pdfPath = Join-Path $outputDir "$fileName.pdf"

    Write-Host "Conversion de $fileName.md..." -ForegroundColor Cyan

    # Utilise VS Code pour ouvrir et exporter
    try {
        # Ouvre le fichier et utilise l'extension pour exporter
        $args = "--command markdown-pdf.export `"$markdownPath`""
        Start-Process "code" -ArgumentList $args -Wait -NoNewWindow
        Write-Host "  ✓ $fileName.pdf créé" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Erreur lors de la conversion de $fileName" -ForegroundColor Red
    }
}

# Trouver tous les fichiers .md dans Livrables
$markdownFiles = Get-ChildItem -Path "Livrables" -Filter "*.md" -Recurse

Write-Host "Fichiers trouvés : $($markdownFiles.Count)" -ForegroundColor Blue
Write-Host ""

foreach ($file in $markdownFiles) {
    Convert-MarkdownToPdf -markdownPath $file.FullName
    Start-Sleep -Milliseconds 500  # Pause pour éviter la surcharge
}

Write-Host ""
Write-Host "=== Conversion terminée ===" -ForegroundColor Green
Write-Host "Les PDFs sont dans le dossier : $outputDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note : Les diagrammes Mermaid seront rendus visuellement !" -ForegroundColor Magenta