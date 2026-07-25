Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SELENIUM + CUCUMBER + SOAPUI - QA AUTOMATION SUITE" -ForegroundColor Yellow
Write-Host " Apuntando al Frontend REAL en AWS" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Red
Write-Host "  1. NO toques el mouse ni el teclado" -ForegroundColor White
Write-Host "  2. El navegador se abrira y recorrera los 5 casos de prueba" -ForegroundColor White
Write-Host "  3. Las capturas se guardan en evidencias_qa/01_funcionales/" -ForegroundColor White
Write-Host ""

Set-Location tests\functional
node ui_automation_demo.js

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " QA COMPLETADO - REVISA evidencias_qa\01_funcionales\" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
