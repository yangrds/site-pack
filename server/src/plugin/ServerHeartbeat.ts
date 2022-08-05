import got from 'got';


// 心跳检查
export function Heartbeat(port: string): Promise<{ status: boolean, msg: string }> {
    return new Promise(async (resolove) => {
        try {
            await got.post(`http://0.0.0.0:${port}/status`, {
                json: {},
                timeout: {
                    lookup: 100,
                    connect: 3000
                }
            }).json();
            resolove({ status: true, msg: '' })
        } catch (error) {
            resolove({ status: false, msg: error.message })
        }
    })

}
