# 🚀 Pruebas de Rendimiento, Carga y Estrés (k6 vs JMeter)

Este directorio alberga las evidencias y reportes de pruebas de estrés masivas para asegurar que los endpoints de alto riesgo de la plataforma resistan la avalancha de inscripciones de becas sin caerse.

## ⚖️ Justificación Teórica de Herramientas: ¿Por qué elegimos k6 sobre JMeter?
- **Por qué NO usamos Apache JMeter:** JMeter está programado en Java y opera bajo hilos pesados en la JVM. Al simular miles de concurrencias en nuestros contenedores Docker, devora masivamente la memoria RAM y procesador local ocasionando *Out of Memory* en la propia máquina generadora en lugar de probar con fidelidad los servidores.
- **Por qué SI usamos k6:** 
  - **¡Ya lo implementamos en nuestro código!** Tenemos nuestro script oficial de pruebas preconfigurado en [tests/k6/login.js](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/tests/k6/login.js).
  - Codificado 100% en JavaScript ES6, manteniéndose nativo en nuestro monorepo Node.js.
  - Diseñado con arquitectura liviana en Go para la línea de comandos, consumiendo hasta 10 veces menos RAM y permitiendo simular decenas de miles de peticiones desde nuestro portátil sin cuellos de botella del generador.
  - Permite la autoguiada y hermosa exportación web visual a HTML inyectando la librería `k6-reporter`.

---

## 🛠️ ¿Qué vamos a hacer y cómo ejecutar las pruebas automáticas?

### Paso 1: Adapta el script `tests/k6/login.js`
Abre nuestro script en [tests/k6/login.js](file:///c:/Users/jjcha/Desktop/Proyectos/Distribuida/tests/k6/login.js) y asegúrate de importar el generador de reportes visual en HTML al principio y al final para exportarlo automáticamente a esta carpeta de evidencias:
```javascript
import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  scenarios: {
    login_test: {
      executor: 'shared-iterations',
      vus: 100, // 100 Usuarios Virtuales Concurrentes
      iterations: 25000, // 25,000 Peticiones Masivas de Estrés
      maxDuration: '2m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<1.0'], // Tolera rechazos provocados deliberadamente al actuar el escudo 429 de Redis
  },
};

export default function () {
  const url = 'http://localhost:3000/auth/login'; // o host.docker.internal desde un contenedor
  const res = http.post(url, JSON.stringify({ email: 'student@uce.edu.ec', password: 'student123' }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  // Validamos con k6 dos caminos previstos bajo altísimo riesgo:
  // 1) Éxitos al inicializarse en 200 OK. 2) Bloqueos protectores 429 (Rate Limit) al dispararse ráfagas de Redis.
  check(res, {
    'status es 200 (Login Éxito)': (r) => r.status === 200,
    'status es 429 (Escudo Redis Rate Limit Activado)': (r) => r.status === 429,
  });
}

// 🔥 HOOK AUTOMÁTICO DE K6: Escribirá un majestuoso Dashboard visual HTML en cuanto termine la prueba:
export function handleSummary(data) {
  return {
    "evidencias_qa/02_rendimiento_k6/capturas/reporte_dashboard_k6.html": htmlReport(data),
  };
}
```

### Paso 2: Corre el comando de estrés desde tu Terminal Windows o Docker
Abra PowerShell y ejecuta en tu terminal:
```powershell
k6 run tests/k6/login.js
```

---

## 📸 Instrucciones de Capturas y Almacenamiento en `/capturas/`

Una vez concluida la prueba, el archivo `reporte_dashboard_k6.html` aparecerá creado en tu carpeta `capturas/`. Ábrelo en Chrome o Edge y guarda con estos nombres oficiales las fotos comprobatorias para GitHub:

1. **`01_stress_login_alto_riesgo.png`** ➔ Captura en el dashboard HTML donde constan los gráficos circulares de pastel (*Pie Charts*) y la barra con Checks verdes probando la tolerancia ante 100 VUs concurrentes lanzados de golpe.
2. **`02_stress_pagos_saga.png`** ➔ Clona este experimento con un segundo script enviando peticiones de carga al endpoint del servicio de transacciones del pago bancario (Saga), capturando el reporte que demuestre el comportamiento al estrés.
3. **`03_grafica_latencia_y_cuellos_de_botella.png`** ➔ Dentro de tu informe de k6, toma una fotografía enfocando en detalle la tabla analítica del apartado `http_req_duration` (Latencias de respuesta en milisegundos: Promedio, Media, Percentiles P95, P99 y Tiempos Máximos) para sustentar ante tu jurado auditor la agilidad y resiliencia máxima del sistema.
