import http from 'k6/http';

export default function () {
  const url = __ENV.API_URL || 'http://localhost:3000';
  http.get(`${url}/health`);
}
