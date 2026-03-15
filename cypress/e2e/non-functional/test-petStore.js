import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // Menit 1: Naik pelan dari 1 ke 50 user
        { duration: '1m', target: 100 }, // Menit 2-3: Naik lagi ke 100 user
        { duration: '1m', target: 200 }, // Menit 4-5: Hajar sampai 200 user (Stress Test)
        { duration: '30s', target: 0 },   // Menit terakhir: Turunkan beban ke 0
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'], // Tes akan dianggap gagal jika error > 1%
        http_req_duration: ['p(95)<2000'], // Tes akan dianggap gagal jika 95% respon > 2 detik
    },
};

export default function () {
    const baseUrl = 'https://testing-jaguars.jamkrindo.co.id/api/no-auth/security/login';
    const confirmUrl = 'https://testing-jaguars.jamkrindo.co.id/api/no-auth/security/login/2fa/confirm';

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // --- PERBAIKAN 1: Gunakan JSON.stringify ---
    const payload = JSON.stringify({
        "username": "testing1@gmail.com",
        "password": "Jakarta4!"
    });

    let response = http.post(baseUrl, payload, params);

    check(response, {
        'Status Login 200': (r) => r.status === 200
    });

    // AMBIL SESSION ID DARI BODY
    const bodyJson = response.json();
    const mySessionId = bodyJson.sessionId;
    console.log("Dapet Session ID nih: " + mySessionId);

    sleep(1);

    // --- PERBAIKAN 2: Gunakan JSON.stringify juga di sini ---
    const otpPayload = JSON.stringify({
        "sessionId": mySessionId,
        "token": "123456",
        "username": "testing1@gmail.com"
    });

    let confirm = http.post(confirmUrl, otpPayload, params);

    check(confirm, {
        'Status OTP 200': (r) => r.status === 200,
        'Respon cepat (<2s)': (r) => r.timings.duration < 2000,
    });

    // ... setelah let confirm (OTP) ...
    // console.log("Respon OTP: " + confirm.body);

    sleep(1);
}