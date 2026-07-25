Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "🚀 INICIANDO BATERÍA DE PRUEBAS DE ESTRÉS K6 (AWS CLOUD)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] 💥 Atacando el Login (25,000 peticiones)..." -ForegroundColor Yellow
k6 run tests/k6/login.js
Write-Host "✅ Reporte HTML del Login generado con éxito." -ForegroundColor Green

Write-Host "`n[2/2] 💸 Atacando el Payment Saga (15,000 peticiones)..." -ForegroundColor Yellow
k6 run tests/k6/payment.js
Write-Host "✅ Reporte HTML de Pagos generado con éxito." -ForegroundColor Green

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "🏆 PRUEBAS FINALIZADAS." -ForegroundColor Green
Write-Host "Los reportes interactivos se guardaron en: evidencias_qa/02_rendimiento_k6/capturas/" -ForegroundColor Cyan
Write-Host "💡 PARA CONVERTIRLOS A PDF: Abre cada HTML en Chrome y presiona Ctrl + P -> 'Guardar como PDF'." -ForegroundColor Yellow
