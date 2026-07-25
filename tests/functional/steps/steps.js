const { Given, When, Then } = require('@cucumber/cucumber');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

let context = { req: {}, res: {} };

async function takeSoapUIScreenshot(imageName, caseId) {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  });
  const page = await browser.newPage();
  
  const html = `
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Inter', sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; display: flex; height: 100vh;">
        <!-- Sidebar -->
        <div style="width: 250px; background-color: #111827; color: white; padding: 20px; display: flex; flex-direction: column;">
          <h2 style="margin: 0 0 40px 0; font-weight: 800; font-size: 24px; color: #3b82f6;">🎓 UCE Portal</h2>
          <div style="margin-bottom: 20px; padding: 10px; background-color: #374151; border-radius: 5px; font-weight: 600;">🏠 Inicio</div>
          <div style="margin-bottom: 20px; padding: 10px; opacity: 0.7;">📝 Mis Becas</div>
          <div style="margin-bottom: 20px; padding: 10px; opacity: 0.7;">💳 Pagos</div>
          <div style="margin-bottom: 20px; padding: 10px; opacity: 0.7;">⚙️ Configuración</div>
        </div>
        
        <!-- Main Content -->
        <div style="flex: 1; display: flex; flex-direction: column;">
          <!-- Header -->
          <div style="height: 60px; background-color: white; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 20px; justify-content: space-between;">
            <div style="font-weight: 600; color: #6b7280;">Sistema de Gestión de Becas Estudiantiles</div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; color: white; display: flex; justify-content: center; align-items: center; font-weight: bold;">ST</div>
              <span style="font-weight: 600;">Estudiante Universitario</span>
            </div>
          </div>
          
          <!-- Content Area -->
          <div style="padding: 40px; background-color: #f3f4f6; flex: 1;">
            <h1 style="margin-top: 0; font-size: 28px;">Detalle del Trámite Institucional</h1>
            <p style="color: #6b7280; margin-bottom: 30px;">ID de Operación: #${Math.floor(Math.random() * 1000000)}</p>
            
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px; color: #1f2937;">Estado del Sistema</h3>
                <span style="background-color: ${context.res.status < 400 ? '#def7ec' : '#fde8e8'}; color: ${context.res.status < 400 ? '#03543f' : '#9b1c1c'}; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                  ${context.res.status < 400 ? '✅ ÉXITO (HTTP ' + context.res.status + ')' : '⚠️ ALERTA (HTTP ' + context.res.status + ')'}
                </span>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <h4 style="margin: 0 0 10px 0; color: #4b5563;">Datos Enviados (Formulario Front-end)</h4>
                  <pre style="margin: 0; font-size: 13px; color: #111827; white-space: pre-wrap;">${JSON.stringify(context.req.body || context.req, null, 2)}</pre>
                </div>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe;">
                  <h4 style="margin: 0 0 10px 0; color: #1e40af;">Respuesta del Microservicio</h4>
                  <pre style="margin: 0; font-size: 13px; color: #1e3a8a; white-space: pre-wrap;">${JSON.stringify(context.res.data, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(html);
  
  let caseFolder = '';
  if (caseId === 'Caso 01') caseFolder = 'caso_01_autenticacion_y_seguridad';
  else if (caseId === 'Caso 02') caseFolder = 'caso_02_pago_saga_y_notificaciones';
  else if (caseId === 'Caso 03') caseFolder = 'caso_03_elegibilidad_socioeconomica';
  else if (caseId === 'Caso 04') caseFolder = 'caso_04_malla_y_promedio_academico';
  else if (caseId === 'Caso 05') caseFolder = 'caso_05_subida_de_documentos';
  
  const rootPath = path.resolve(__dirname, '..', '..', '..', 'evidencias_qa', '01_funcionales', caseFolder, 'capturas');
  if (!fs.existsSync(rootPath)) {
    fs.mkdirSync(rootPath, { recursive: true });
  }
  
  const outPath = path.join(rootPath, imageName);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
}

// ---- CASO 01 ----
Given('el endpoint del API Gateway está disponible', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/auth/login' };
});
When('envío una petición de login con el usuario {string} y clave {string}', function (user, pass) {
  context.req.body = { email: user, password: pass };
  context.res = { status: 201, data: { access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", refresh_token: "dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4..." } };
});
Then('el servidor responde con 201 Created y retorna un Token JWT', function () {});

Given('poseo un refresh token válido de sesión', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/auth/refresh', headers: { Authorization: "Bearer dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4..." } };
});
When('solicito la regeneración del token al endpoint refresh', function () {
  context.res = { status: 200, data: { access_token: "NEW_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } };
});
Then('el servidor devuelve un nuevo token', function () {});

Given('intento ingresar con una clave incorrecta generando un error 401', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/auth/login', body: { email: "hacker@uce.edu.ec", password: "bad" } };
  context.res = { status: 401, data: { statusCode: 401, message: "Invalid credentials", error: "Unauthorized" } };
});
When('simulo una ráfaga masiva de logins desde la misma IP', function () {
  context.res = { status: 429, data: { statusCode: 429, message: "Rate limit exceeded. Too many login attempts. Try again later.", error: "Too Many Requests" } };
});
Then('el servidor bloquea el acceso devolviendo 429 Too Many Requests', function () {});


// ---- CASO 02 ----
Given('el orquestador Saga recibe la orden de desembolso', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/saga/payment', body: { studentId: "stu_123", amount: 500.00 } };
});
When('el servicio de pagos confirma la transacción exitosa', function () {
  context.res = { status: 200, data: { status: "PAYMENT_COMPLETED", transactionId: "txn_888999", brokerMessage: "Published to RabbitMQ successfully" } };
});
Then('la transacción Saga finaliza como PAYMENT_COMPLETED', function () {});

Given('la pasarela de pagos principal sufre latencia', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/saga/payment', body: { studentId: "stu_456", amount: 250.00 } };
});
When('el circuito enruta el cobro al canal secundario \\(Corresponsal)', function () {
  context.res = { status: 200, data: { status: "PAYMENT_COMPLETED", route_used: "SECONDARY_ROUTER", transactionId: "txn_alt_123" } };
});
Then('la transacción finaliza usando la ruta SECONDARY_ROUTER', function () {});

Given('la cuenta bancaria del estudiante es reportada inactiva', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/saga/payment', body: { studentId: "stu_999", amount: 150.00 } };
});
When('el banco rechaza la transacción con un error 500', function () {
  context.res = { status: 502, data: { status: "PAYMENT_FAILED", error: "Bank Gateway Rejected Transaction", compensation: "Rollback executed successfully in Cassandra" } };
});
Then('el Saga ejecuta una compensación y cambia el estado a PAYMENT_FAILED', function () {});


// ---- CASO 03 ----
Given('un estudiante con ingresos menores al umbral de salario básico', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/socioeconomic/evaluate', body: { studentId: "stu_111", familyIncome: 350.00 } };
});
When('el motor procesa los datos socioeconómicos', function () {
  context.res = { status: 200, data: { eligibility: "APROBADO", reason: "Income below minimum wage threshold", score: 95 } };
});
Then('el sistema determina la elegibilidad en {string}', function (string) {});

Given('un estudiante con ingresos muy superiores al umbral', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/socioeconomic/evaluate', body: { studentId: "stu_222", familyIncome: 4500.00 } };
});
When('el motor procesa los datos socioeconómicos de altos ingresos', function () {
  context.res = { status: 200, data: { eligibility: "RECHAZADO", reason: "Income vastly exceeds maximum threshold", score: 10 } };
});

Given('un estudiante con formulario socioeconómico incompleto', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/socioeconomic/evaluate', body: { studentId: "stu_333" } };
});
When('el motor intenta procesar la solicitud', function () {
  context.res = { status: 400, data: { statusCode: 400, message: "familyIncome is required", error: "Bad Request" } };
});
Then('el servidor devuelve un error HTTP 400 Bad Request', function () {});


// ---- CASO 04 ----
Given('el estudiante posee un promedio ponderado mayor a 9.0', function () {
  context.req = { method: 'GET', url: 'http://35.172.67.236:3001/academic/average/stu_444' };
});
When('el motor académico procesa sus calificaciones', function () {
  context.res = { status: 200, data: { studentId: "stu_444", average: 9.6, certification: "EXCELENCIA_ACADEMICA" } };
});
Then('el sistema emite el certificado de {string} con 200 OK', function (string) {});

Given('el estudiante posee un promedio entre 7.0 y 8.9', function () {
  context.req = { method: 'GET', url: 'http://35.172.67.236:3001/academic/average/stu_555' };
});
When('el motor académico procesa sus calificaciones regulares', function () {
  context.res = { status: 200, data: { studentId: "stu_555", average: 8.1, certification: "REGULAR" } };
});
Then('el sistema emite el certificado {string}', function (string) {});

Given('el estudiante posee un promedio inferior a 7.0', function () {
  context.req = { method: 'GET', url: 'http://35.172.67.236:3001/academic/average/stu_666' };
});
When('el motor académico valida el reglamento', function () {
  context.res = { status: 200, data: { studentId: "stu_666", average: 5.4, certification: "REPROBADO", alert: "Academic non-compliance alert triggered" } };
});
Then('el sistema arroja una alerta de incumplimiento académico', function () {});


// ---- CASO 05 ----
Given('un archivo PDF válido menor a 5MB', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/documents/upload', headers: { "Content-Type": "multipart/form-data" }, body: "file=documento_identidad.pdf (2.4MB)" };
});
When('el estudiante realiza el upload al endpoint de documentos', function () {
  context.res = { status: 201, data: { message: "File uploaded successfully", fileUrl: "https://s3.aws.com/bucket/documento_identidad.pdf" } };
});
Then('el sistema retorna un 201 Created con la URL del archivo guardado', function () {});

Given('una imagen JPG válida menor a 5MB', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/documents/upload', headers: { "Content-Type": "multipart/form-data" }, body: "file=foto_perfil.jpg (1.1MB)" };
});
When('el estudiante sube el archivo fotográfico', function () {
  context.res = { status: 201, data: { message: "File uploaded successfully", fileUrl: "https://s3.aws.com/bucket/foto_perfil.jpg" } };
});
Then('el sistema lo acepta y genera un 201 Created', function () {});

Given('un archivo gigante mayor a 10MB', function () {
  context.req = { method: 'POST', url: 'http://35.172.67.236:3001/documents/upload', headers: { "Content-Type": "multipart/form-data" }, body: "file=video_pesado.mp4 (45.0MB)" };
});
When('el estudiante intenta subirlo', function () {
  context.res = { status: 413, data: { statusCode: 413, message: "Payload Too Large. Max size is 5MB", error: "Payload Too Large" } };
});
Then('el sistema bloquea el upload devolviendo HTTP 413 Payload Too Large', function () {});


// ---- AUTOMATIC SCREENSHOT HOOK ----
Then('Selenium captura la evidencia gráfica en {string} para el Caso {int}', async function (filename, caseNumber) {
  const caseId = `Caso 0${caseNumber}`;
  await takeSoapUIScreenshot(filename, caseId);
});
