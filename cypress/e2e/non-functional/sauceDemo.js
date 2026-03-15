import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    vus: 1,
    interations: 1

    // stages: [
    //     { duration: "5s", target: 10 },
    //     { duration: "10s", target: 50 },
    //     { duration: "10s", target: 100 },
    //     { duration: "5s", target: 0 }
    // ]
}

export default function () {
    const baseUrl = "https://www.saucedemo.com/"

    let response = http.get(baseUrl)

    check(response,
        {
            'status harus 200': (r) => r.status === 200,
            'harus ada kalimat': (r) => r.body.includes("Swag Labs")
        }
    )

    if (response) {
        console.log(' keluar nich Swag Labs nya ')
    } else {
        console.log(' waduh tidak ada nich ')
    }

    sleep(1)
}
