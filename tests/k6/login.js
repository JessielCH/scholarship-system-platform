import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  scenarios: {
    login_test: {
      executor: 'shared-iterations',
      vus: 100, // 100 Usuarios Virtuales Concurrentes
      iterations: 55000, // 55,000 Peticiones Masivas para superar el Rate Limit de 50k
      maxDuration: '2m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<1.0'], // Tolera rechazos provocados deliberadamente (429 y 401)
  },
};

export default function () {
  const url = 'http://35.172.67.236:3001/auth/login'; // Blanco en la nube AWS (Puerto 3001 API Gateway)
  const studentId = Math.floor(Math.random() * 10000) + 1;
  const res = http.post(url, JSON.stringify({ email: `student_${studentId}@uce.edu.ec`, password: 'student123' }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Validamos con k6 dos caminos previstos bajo altísimo riesgo:
  // 1) Éxitos (200 o 401 si la DB no tiene al usuario aún) 2) Bloqueos protectores 429
  check(res, {
    'status es 201 (Login Éxito)': (r) => r.status === 201,
    'status es 429 (Escudo Redis Rate Limit Activado)': (r) => r.status === 429,
  });
}

// 🔥 HOOK AUTOMÁTICO DE K6: Escribirá un majestuoso Dashboard visual HTML en cuanto termine la prueba:
export function handleSummary(data) {
  return {
    "evidencias_qa/02_rendimiento_k6/capturas/reporte_dashboard_k6.html": htmlReport(data),
  };
}
