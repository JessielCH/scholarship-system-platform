import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    login_test: {
      executor: 'shared-iterations',
      vus: 100, // 100 concurrent users
      iterations: 25000, // 25,000 total requests
      maxDuration: '2m', // timeout at 2 minutes
    },
  },
  thresholds: {
    http_req_failed: ['rate<1.0'], // Allow fails (we expect 429 Rate Limit from Redis!)
  },
};

export default function () {
  // Using host.docker.internal to hit the host machine's port 3000 from inside the k6 Docker container
  const url = 'http://host.docker.internal:3000/auth/login';
  const payload = JSON.stringify({
    email: 'student@uce.edu.ec',
    password: 'student123',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  // We expect either 200 (Login Success) or 429 (Too Many Requests due to Redis Rate Limiting)
  check(res, {
    'status is 200 (Success)': (r) => r.status === 200,
    'status is 429 (Rate Limited)': (r) => r.status === 429,
  });
}
