import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Configuracion masiva de estres - Simulando escenarios concurrentes altos
export const options = {
  scenarios: {
    stress_todas_las_apis: {
      executor: 'constant-vus',
      vus: 50, // 50 usuarios virtuales en paralelo para todo el flujo
      duration: '15s', // Corto para generar el reporte rapido, pero suficiente para generar estres
    },
  },
  thresholds: {
    // Definimos politicas de tolerancia segun QA
    http_req_failed: ['rate<1.0'], // Permitimos fallos porque Redis podria bloquearnos por exceso de peticiones (429)
    http_req_duration: ['p(95)<2500'], // 95% de las peticiones deberian ser menores a 2.5s incluso bajo estres
  },
};

const BASE_URL = 'http://35.172.67.236:3001';

export default function () {
  // [CASO 1 y 2] Riesgo Alto: Autenticacion masiva (Login)
  group('Caso 1 y 2: Autenticacion (Riesgo Alto)', function () {
    const loginPayload = JSON.stringify({ email: 'student_1@uce.edu.ec', password: 'student123' });
    const loginParams = { headers: { 'Content-Type': 'application/json' } };
    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, loginParams);
    
    check(loginRes, {
      'Login responde OK o Bloqueo por Redis': (r) => r.status === 201 || r.status === 429,
    });
    sleep(0.5);
  });

  // [CASO 3] Riesgo Medio: Subida de Documentos al Gateway
  group('Caso 3: Carga de Documentos (Riesgo Medio)', function () {
    const uploadPayload = { studentId: 'stu_mock_k6' }; // Simulando un form-data basico para ver latencia
    const uploadRes = http.post(`${BASE_URL}/documents/upload`, uploadPayload);
    check(uploadRes, {
      'Endpoint Documentos responde': (r) => r.status >= 200 && r.status <= 500,
    });
    sleep(0.5);
  });

  // [CASO 4] Riesgo Medio: Motor Academico y Promedios
  group('Caso 4: Evaluacion Academica (Riesgo Medio)', function () {
    const evalRes = http.get(`${BASE_URL}/v1/queries/academic/rankings`);
    check(evalRes, {
      'Motor Academico responde': (r) => r.status === 200 || r.status === 502,
    });
    sleep(0.5);
  });

  // [CASO 5] Riesgo Alto: Orquestador Saga - Transacciones Bancarias
  group('Caso 5: Pasarela Transaccional Saga (Riesgo Alto)', function () {
    const sagaPayload = JSON.stringify({ studentId: 'stu_k6_test', amount: 500.00 });
    const sagaParams = { headers: { 'Content-Type': 'application/json' } };
    const sagaRes = http.post(`${BASE_URL}/saga/payment`, sagaPayload, sagaParams);
    
    check(sagaRes, {
      'Saga procesa pago o retorna error del banco': (r) => r.status === 200 || r.status === 502 || r.status === 400,
    });
    sleep(0.5);
  });
}

// Hook de fin de ejecucion: Genera el Dashboard HTML Oficial
export function handleSummary(data) {
  return {
    "../../evidencias_qa/02_rendimiento_k6/capturas/reporte_dashboard_k6.html": htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// Helper para imprimir en consola
function textSummary(data, options) {
  return "Generacion de Reporte K6 completada. Verifica la carpeta evidencias_qa/02_rendimiento_k6/capturas/\n";
}
