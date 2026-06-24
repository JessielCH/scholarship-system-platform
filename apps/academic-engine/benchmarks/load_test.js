import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del test: 25,000 peticiones en total usando 200 VUs concurrentes
export const options = {
    scenarios: {
        massive_load: {
            executor: 'shared-iterations',
            vus: 200,
            iterations: 25000,
            maxDuration: '5m',
        },
    },
    thresholds: {
        'http_req_duration{type:query}': ['p(95)<500'],   
        'http_req_duration{type:command}': ['p(95)<3000'], 
        http_req_failed: ['rate<0.01'],                    
    },
};

// Usa la IP pública si se provee (ej: k6 run -e EDGE_IP=54.12.34.56 load_test.js)
const edgeIp = __ENV.EDGE_IP || 'host.docker.internal:3000';
const BASE_URL = `http://${edgeIp}/api/v1`;

export function setup() {
    const seedRes = http.post(`${BASE_URL}/commands/academic/seed`, null, {
        headers: { 'X-User-Role': 'ADMIN' },
    });
    
    if (seedRes.status === 0) {
        console.log("Advertencia: No se pudo contactar al servidor. Asegúrate de pasar EDGE_IP o levantar Docker.");
    }

    http.post(`${BASE_URL}/commands/academic/process`, null, {
        headers: { 'X-User-Role': 'ADMIN' },
    });
}

export default function () {
    const isQuery = Math.random() > 0.05;

    if (isQuery) {
        const recordId = `UID-00${Math.floor(Math.random() * 9000) + 1000}`; 
        const queryRes = http.get(`${BASE_URL}/queries/academic/status?record_id=${recordId}`, {
            headers: { 'X-User-Role': 'STUDENT' },
            tags: { type: 'query' },
        });
        
        check(queryRes, {
            'query answered': (r) => r.status === 200 || r.status === 404,
        });
    } else {
        const processRes = http.post(`${BASE_URL}/commands/academic/process`, null, {
            headers: { 'X-User-Role': 'ADMIN' },
            tags: { type: 'command' },
        });
        
        check(processRes, {
            'process status is 200': (r) => r.status === 200,
        });
    }

    sleep(0.1); 
}
