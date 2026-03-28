import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Simulate ramp-up to 20 users over 30 seconds
        { duration: '1m', target: 20 },  // Sustained load with 20 users for 1 minute
        { duration: '30s', target: 0 },  // Ramp-down to 0 users over 30 seconds
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    },
};

export default function () {
    const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
    
    // Testing health check
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health status is 200': (r) => r.status === 200,
    });
    
    // Testing API endpoint (assuming it's available)
    const payload = JSON.stringify({
        data: 'Sample data for inference'
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sample-token'
        },
    };
    const apiRes = http.post(`${BASE_URL}/api/predict`, payload, params);
    check(apiRes, {
        'API status is 200 or 401 (if no auth provided)': (r) => r.status === 200 || r.status === 401,
    });

    sleep(1);
}
