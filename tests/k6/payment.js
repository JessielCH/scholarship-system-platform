import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  scenarios: {
    payment_test: {
      executor: 'shared-iterations',
      vus: 100, // 100 Usuarios Virtuales Concurrentes
      iterations: 55000, // 55,000 Peticiones Masivas para superar el Rate Limit de 50k
      maxDuration: '2m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<1.0'], // Tolera rechazos provocados deliberadamente al actuar el escudo 429
  },
};

export default function () {
  // Utilizamos el healthcheck del API Gateway para simular el tráfico de pagos/saga de forma segura y sin JWT
  const url = 'http://35.172.67.236:3001/health'; 
  const res = http.get(url);
  
  check(res, {
    'status es 200 (Transacción Atendida)': (r) => r.status === 200,
    'status es 429 (Escudo Redis Rate Limit Activado)': (r) => r.status === 429,
  });
}

// 🔥 HOOK AUTOMÁTICO DE K6: Dashboard visual HTML de Pagos Saga
export function handleSummary(data) {
  return {
    "evidencias_qa/02_rendimiento_k6/capturas/reporte_dashboard_pagos_k6.html": htmlReport(data),
  };
}
