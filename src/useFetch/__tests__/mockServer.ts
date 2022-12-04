import http from 'http'

export const server = http.createServer((req, res) => {
    const delay = getMockDelay(req)
    if (!delay) {
        return handler(req, res)
    } else {
        setTimeout(() => handler(req, res), delay)
    }
})

const handler: http.RequestListener = (req, res) => {
    switch (req.url) {
        // mock json todo object route
        case '/todos/1':
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(
                JSON.stringify({ id: 1, title: 'todo title', completed: false })
            )
            break

        // Mock HTML webpage
        case '/mock-page':
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(/* html */ `
                <!DOCTYPE html>
                <html>
                    <head><title>Mock Page</title></head>
                    <body><h1>Mock Page</h1></body>
                </html>`)

            break

        // Mock text response
        case '/data.txt':
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end('Hello World')
            break

        case '/error': {
            const accepts = req.headers['accept'] || ''
            if (!accepts || accepts.includes('application/json')) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Internal Server Error' }))
            } else if (accepts.includes('text/html')) {
                res.writeHead(500, { 'Content-Type': 'text/html' })
                res.end(/* html */ `
                    <!DOCTYPE html>
                    <html>
                        <head><title>Internal Server Error</title></head>
                        <body><h1>Internal Server Error</h1></body>
                    </html>`)
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' })
                res.end('Internal Server Error')
            }
            break
        }

        default:
            res.writeHead(404)
    }
}

function getMockDelay(req: http.IncomingMessage): number {
    const defaultDelay = 100

    const testSpecifiedDelay = req.headers['x-mock-delay']
    if (!testSpecifiedDelay || Array.isArray(testSpecifiedDelay)) {
        return defaultDelay
    }

    const parsedDelay = parseInt(testSpecifiedDelay, 10)
    if (parsedDelay <= 0 || isNaN(parsedDelay)) {
        return 0
    }

    return parsedDelay
}
