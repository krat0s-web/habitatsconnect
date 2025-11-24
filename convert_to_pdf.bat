@echo off
echo Conversion des livrables Markdown vers PDF...
echo.

REM Créer le dossier de sortie
if not exist "PDF_Output" mkdir PDF_Output

REM Convertir tous les fichiers .md récursivement
for /r "Livrables" %%f in (*.md) do (
    echo Conversion de %%~nf.md...
    pandoc "%%f" -o "PDF_Output\%%~nf.pdf" --pdf-engine=pdflatex
)

echo.
echo Conversion terminée ! Les PDFs sont dans le dossier PDF_Output
pause