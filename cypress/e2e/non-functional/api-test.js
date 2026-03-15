import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    // stages: [
    //     { duration: '10s', target: 5 },
    //     { duration: '20s', target: 10 },
    //     { duration: '20s', target: 50 },
    //     { duration: '10s', target: 0 }
    // ]
    vus: 1,
    iterations: 1
}

export default function () {
    const baseUrl = 'https://testing-jaguars.jamkrindo.co.id/api/no-auth/security/login';
    const confirmUrl = 'https://testing-jaguars.jamkrindo.co.id/api/no-auth/security/login/2fa/confirm';

    const param = {
        headers: {
            'Content-Type': 'application/json',
        }
    }

    const payload = JSON.stringify({
        "username": "stafrm1@dummy.com",
        "password": "Jakarta4!"
    })

    let response = http.post(baseUrl, payload, param)

    check(response, {
        'status harus 200': (r) => r.status === 200,
    })

    const bodyJson = response.json()
    const mySessionId = bodyJson.sessionId
    console.log("dapet nich session id nya " + mySessionId)

    sleep(1)

    const myOtp = JSON.stringify({
        "username": "stafrm1@dummy.com",
        "token": "123456",
        "sessionId": mySessionId
    })

    let confirm = http.post(confirmUrl, myOtp, param)

    const bodyConfirm = confirm.json()

    if (bodyConfirm.user) {
        const roles = bodyConfirm.user.roleCodes
        console.log("role nya nich: " + roles[2])
    } else {
        console.log("role tidak ada")
    }

    check(confirm, {
        'status harus 200': (r) => r.status === 200,
        'role harus Staf Bisnis Cabang': (r) => bodyConfirm.user.roleCodes.includes("Staf Bisnis Cabang")
    })

    sleep(1)

}