import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  // Test target URL. In QA, this points to the deployed API Gateway.
  http.get('http://localhost:3000/auth/health');
  sleep(1);
}
