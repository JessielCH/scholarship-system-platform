import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del test: Ramp-up, sostener la carga, y ramp-down
export const options = {
    stages: [
        { duration: '10s', target: 50 },  // Rampa de subida a 50 Usuarios Virtuales (VUs)
        { duration: '20s', target: 50 },  // Mantener 50 VUs
        { duration: '10s', target: 0 },   // Rampa de bajada
    ],
    thresholds: {
        'http_req_duration{type:query}': ['p(95)<100'],   // 95% de las lecturas a Redis < 100ms
        'http_req_duration{type:command}': ['p(95)<2000'], // 95% de los procesamientos masivos < 2s
        http_req_failed: ['rate<0.01'],                    // Menos del 1% de errores en general
    },
};

const BASE_URL = 'http://host.docker.internal:8081/api/v1'; // Usamos host.docker.internal para alcanzar localhost desde Docker

export function setup() {
    // Siembra inicial de datos para tener con qué trabajar (10,000 registros)
    const seedRes = http.post(`${BASE_URL}/commands/academic/seed`, null, {
        headers: { 'X-User-Role': 'ADMIN' },
    });
    
    // Si falla el seed, es probable que el servidor no esté corriendo o host.docker.internal falle (ej en linux)
    // En ese caso, fallback a localhost
    if (seedRes.status === 0) {
        console.log("Advertencia: host.docker.internal falló, intente ejecutar con --network host y cambie BASE_URL a 127.0.0.1");
    }

    // Un procesamiento inicial para poblar Redis
    http.post(`${BASE_URL}/commands/academic/process`, null, {
        headers: { 'X-User-Role': 'ADMIN' },
    });
}

export default function () {
    // Probabilidad de 95% de ejecutar una lectura (Query - Redis)
    // Probabilidad de 5% de ejecutar una escritura/proceso masivo (Command - Goroutines)
    const isQuery = Math.random() > 0.05;

    if (isQuery) {
        // Escenario 1: Estudiante consultando estado (Lectura de Redis)
        // Usamos un ID pseudo-aleatorio que podría no existir, pero nos sirve para estresar Redis
        const recordId = `UID-00${Math.floor(Math.random() * 9000) + 1000}`; 
        const queryRes = http.get(`${BASE_URL}/queries/academic/status?record_id=${recordId}`, {
            headers: { 'X-User-Role': 'STUDENT' },
            tags: { type: 'query' },
        });
        
        // No nos importa si es 200 o 404, ambos son respuestas válidas del servidor para medir latencia
        check(queryRes, {
            'query answered': (r) => r.status === 200 || r.status === 404,
        });
    } else {
        // Escenario 2: Admin disparando un recálculo masivo (Estresa CPU y Goroutines)
        const processRes = http.post(`${BASE_URL}/commands/academic/process`, null, {
            headers: { 'X-User-Role': 'ADMIN' },
            tags: { type: 'command' },
        });
        
        check(processRes, {
            'process status is 200': (r) => r.status === 200,
        });
    }

    sleep(0.5); // Simula el tiempo de pensar del usuario (500ms)
}
