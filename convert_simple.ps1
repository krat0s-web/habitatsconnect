# Script simple pour convertir les fichiers Markdown
Write-Host "=== Conversion Livrables Markdown vers PDF ===" -ForegroundColor Green

# Créer le dossier de sortie
if (!(Test-Path "PDF_Output")) {
    New-Item -ItemType Directory -Path "PDF_Output" | Out-Null
}

# Lister les fichiers
$files = Get-ChildItem -Path "Livrables" -Filter "*.md" -Recurse
Write-Host "Fichiers trouvés: $($files.Count)" -ForegroundColor Blue

# Instructions pour l'utilisateur
Write-Host ""
Write-Host "Pour convertir chaque fichier:" -ForegroundColor Yellow
Write-Host "1. Ouvrez le fichier .md dans VS Code" -ForegroundColor Cyan
Write-Host "2. Clic droit sur le fichier" -ForegroundColor Cyan
Write-Host "3. Sélectionnez 'Markdown PDF: Export (pdf)'" -ForegroundColor Cyan
Write-Host "4. Le PDF sera créé automatiquement" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les diagrammes Mermaid seront rendus visuellement !" -ForegroundColor Magenta
Write-Host ""

# Lister les fichiers à convertir
foreach ($file in $files) {
    Write-Host "À convertir: $($file.Name)" -ForegroundColor White
}