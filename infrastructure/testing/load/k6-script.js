import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  const url = __ENV.API_URL || 'http://localhost:3000';
  http.get(`${url}/auth/health`);
  sleep(1);
}
