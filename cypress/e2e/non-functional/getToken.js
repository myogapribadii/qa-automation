import http, { get } from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    iterations: 1
}

export default function () {
    const host = 'https://testing-jaguars.jamkrindo.co.id';

    const payload = JSON.stringify({
        "username": "nisemo16@gmail.com",
        "password": "Jakarta4!"
    })

    let login = http.post(`${host}/api/no-auth/security/login`, payload, {
        headers: { 'content-type': 'application/json' }
    })
    const mySessionLogin = login.json().sessionId
    console.log('dapet gak nich tokennya ' + mySessionLogin)

    const myOtp = JSON.stringify({
        "username": "nisemo16@gmail.com",
        "token": "123456",
        "sessionId": mySessionLogin
    })

    let confirm = http.post(`${host}/api/no-auth/security/login/2fa/confirm`, myOtp, {
        headers: { 'content-type': 'application/json' }
    })

    check(confirm, {
        'status Loginnya harus 200': (r) => r.status === 200
    })

    const confirmData = confirm.json()
    const myToken = confirmData.jwtToken

    const param = {
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + myToken
        }
    }

    let getLob = http.get(`${host}/api/all-auth/master/lov/lob`, param)
    const getMetadata = getLob.json()
    const getLabel = getMetadata[4].label

    check(getLob, {
        'Status LOB harus 200': (r) => r.status === 200,
        'Nama LOB muncul': (r) => getMetadata.some(item => item.label.toUpperCase() === ("SURETYSHIP")),
        [`Cek lagi LOB nya menggunakan array: ${getLabel}`]: (r) => getLabel === ("Suretyship")
    })

    sleep(1)

}