const net = require('net');


export function JudgePort(port: string): Promise<{ port: string, status: boolean }> {
    return new Promise((resolve) => {
        let server = net.createServer().listen(port, '0.0.0.0');
        server.on('listening', function () {
            server.close();
            resolve({ port, status: true })
        });
        server.on('error', function (err: any) {
            if (err.code == 'EADDRINUSE') {
                resolve({ port, status: false })
            }
        });
    })
}

