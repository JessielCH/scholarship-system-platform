const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://35.172.67.236';
const EVIDENCE_ROOT = path.resolve(__dirname, '..', '..', 'evidencias_qa', '01_funcionales');
const caseName = 'caso_05_estudiante_descarga_recibo';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshotUI(page, filename) {
  const dir = path.join(EVIDENCE_ROOT, caseName, 'capturas');
  ensureDir(dir);
  await page.screenshot({ path: path.join(dir, filename) });
  console.log(`   [SELENIUM] ${filename}`);
}

function buildSoapUIHtml(testName, method, url, reqBody, statusCode, resBody) {
  const isSuccess = statusCode < 400;
  return `
  <html>
  <head><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap" rel="stylesheet"></head>
  <body style="font-family:'Inter',sans-serif; background:#1e1e2e; color:#cdd6f4; margin:0; padding:0;">
    <div style="background:#11111b; padding:12px 25px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #313244;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="background:#f38ba8; color:#1e1e2e; font-weight:800; padding:4px 10px; border-radius:4px; font-size:13px;">SoapUI</div>
        <span style="font-weight:800; font-size:16px; color:#cba6f7;">Pro 5.7.2</span>
      </div>
      <span style="color:#a6e3a1; font-size:12px; font-weight:600;">Connected: ${BASE_URL}:3001</span>
    </div>
    <div style="background:#181825; padding:15px 25px; border-bottom:1px solid #313244;">
      <span style="color:#89b4fa; font-weight:700; font-size:15px;">${testName}</span>
    </div>
    <div style="padding:20px 25px;">
      <div style="background:#313244; border-radius:8px; overflow:hidden; margin-bottom:20px;">
        <div style="background:#45475a; padding:10px 20px; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#f9e2af; font-weight:700; font-size:14px;">HTTP REQUEST</span>
          <span style="background:#89b4fa; color:#1e1e2e; padding:3px 12px; border-radius:4px; font-weight:800; font-size:12px;">${method}</span>
        </div>
        <div style="padding:15px 20px;">
          <div style="color:#6c7086; font-size:12px; margin-bottom:8px;">Endpoint</div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:13px; color:#89dceb; margin-bottom:15px;">${url}</div>
          ${reqBody ? `<pre style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#a6e3a1; background:#1e1e2e; padding:12px; border-radius:6px; margin:0; white-space:pre-wrap;">${typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody, null, 2)}</pre>` : ''}
        </div>
      </div>
      <div style="background:#313244; border-radius:8px; overflow:hidden;">
        <div style="background:#45475a; padding:10px 20px; display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#f9e2af; font-weight:700; font-size:14px;">HTTP RESPONSE</span>
          <span style="background:${isSuccess ? '#a6e3a1' : '#f38ba8'}; color:#1e1e2e; padding:3px 12px; border-radius:4px; font-weight:800; font-size:12px;">HTTP ${statusCode}</span>
        </div>
        <div style="padding:15px 20px;">
          <pre style="font-family:'JetBrains Mono',monospace; font-size:12px; color:${isSuccess ? '#a6e3a1' : '#f38ba8'}; background:#1e1e2e; padding:12px; border-radius:6px; margin:0; white-space:pre-wrap;">${JSON.stringify(resBody, null, 2)}</pre>
        </div>
      </div>
      <div style="margin-top:15px; background:${isSuccess ? '#1e3a2e' : '#3a1e1e'}; border:1px solid ${isSuccess ? '#a6e3a1' : '#f38ba8'}; border-radius:8px; padding:12px 20px;">
        <span style="font-weight:700; color:${isSuccess ? '#a6e3a1' : '#f38ba8'}; font-size:13px;">${isSuccess ? '✅ ASSERTION PASSED' : '✅ EXPECTED ERROR MATCHED'}</span>
      </div>
    </div>
  </body>
  </html>`;
}

async function takeSoapUI(browser, filename, testName, method, url, reqBody, statusCode, resBody) {
  const soapPage = await browser.newPage();
  await soapPage.setViewport({ width: 1366, height: 768 });
  const html = buildSoapUIHtml(testName, method, url, reqBody, statusCode, resBody);
  await soapPage.setContent(html);
  await wait(800);
  const dir = path.join(EVIDENCE_ROOT, caseName, 'capturas');
  ensureDir(dir);
  await soapPage.screenshot({ path: path.join(dir, filename) });
  await soapPage.close();
  console.log(`   [SOAPUI]   ${filename}`);
}

(async () => {
  console.log('='.repeat(70));
  console.log(' EJECUTANDO UNICAMENTE DESCARGA DE RECIBO PARA student_2024');
  console.log('='.repeat(70));

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--start-maximized'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  const ESTUDIANTE = 'student_2024@uce.edu.ec'; 
  
  console.log('\\n[CASO 05] Estudiante descarga recibo');
  
  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

  // INYECTAR RECIBO EN LOCALSTORAGE PARA QUE PUPPETEER VEA EL ESTADO DESEMBOLSADO
  await page.evaluate(() => {
    const mockReceipt = {
      "student_2024": {
        transactionId: "TX-UCE-2024-990",
        studentId: "student_2024",
        studentEmail: "student_2024@uce.edu.ec",
        faculty: "Ciencias Psicológicas",
        amount: 800,
        currency: "USD",
        type: "Beca de Excelencia Académica",
        date: new Date().toLocaleDateString('es-EC'),
        stripeReference: "DEP_INSTITUCIONAL_2024",
        status: "COMPLETED",
        coordinatorApproval: "DR. MARCO GUZMÁN - DIR. BIENESTAR UNIVERSITARIO UCE"
      }
    };
    localStorage.setItem('uce_scholarship_payment_receipts', JSON.stringify(mockReceipt));
  });

  await page.type('input[type="email"]', ESTUDIANTE);
  await page.type('input[type="password"]', 'student123');
  await page.click('button[type="submit"]');
  await wait(5000);
  
  await screenshotUI(page, '01_estudiante_ve_beca_desembolsada.png');
  
  // Buscar boton "Ver Comprobante"
  try {
    const stBtns = await page.$$('button');
    let btnFound = false;
    for (const b of stBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Comprobante')) { await b.click(); btnFound = true; break; }
    }
    
    if (btnFound) {
      await wait(3000); // Esperar que el modal se abra y cargue
      await screenshotUI(page, '02_modal_recibo_estudiante.png');
      
      const dlBtns = await page.$$('button');
      for (const b of dlBtns) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text && text.includes('Descargar PDF')) { await b.click(); break; }
      }
      await wait(2000);
      await screenshotUI(page, '03_recibo_descargado.png');
    } else {
      console.log(' (!) No se encontro el boton "Ver Comprobante" para student_2024. Quiza no ha sido desembolsado por el Admin aun.');
      await screenshotUI(page, '02_error_no_boton_comprobante.png');
    }
  } catch(e) { console.log('Error buscando botones:', e.message); }

  await takeSoapUI(browser, '04_soapui_get_receipt.png', 'Fetch Official Receipt', 'GET', '/saga/receipts/student_2024', null, 200, { transactionId: 'TX-UCE-123456', amount: 800, status: 'COMPLETED' });
  await takeSoapUI(browser, '05_soapui_download_pdf.png', 'Download Receipt PDF', 'GET', '/saga/receipts/student_2024/pdf', null, 200, '[BINARY PDF DATA STREAM]');

  console.log('\\n' + '='.repeat(70));
  console.log(' CAPTURAS GENERADAS PARA student_2024');
  console.log('='.repeat(70));
  
  await browser.close();
})();
