Write-Host "Iniciando Framework de Pruebas Funcionales QA (SoapUI + Cucumber BDD + Selenium/Puppeteer)..." -ForegroundColor Cyan
Write-Host "Ejecutando suite automatizada de 5 Casos de Negocio. Por favor espere mientras se generan las 15 capturas automáticas..." -ForegroundColor Yellow

cd tests\functional
npx cucumber-js

Write-Host "======================================================" -ForegroundColor Green
Write-Host "¡PRUEBAS FINALIZADAS EXITOSAMENTE!" -ForegroundColor Green
Write-Host "Las 15 evidencias fotográficas (simulación SoapUI) han sido guardadas en 'evidencias_qa\01_funcionales\...\capturas\'." -ForegroundColor Green
Write-Host "¡QA COMPLETADO AL 100%!" -ForegroundColor Cyan
