const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;

// Helper to handle CORS
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const server = http.createServer((req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/proxy/tess') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const agentId = parsedBody.agentId || '37390';
                // Remove agentId from payload if it was added just for the proxy routing, 
                // but here we expect the full Tess payload in body + maybe headers from client.

                // Use the Authorization header from the incoming request
                const authHeader = req.headers['authorization'];

                console.log(`Proxying request to Tess Agent ${agentId}...`);

                const tessReq = https.request({
                    hostname: 'tess.pareto.io',
                    port: 443,
                    path: `/api/agents/${agentId}/execute`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                }, (tessRes) => {
                    res.writeHead(tessRes.statusCode, tessRes.headers);
                    tessRes.pipe(res);
                });

                tessReq.on('error', (e) => {
                    console.error('Tess API Error:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: e.message }));
                });

                tessReq.write(JSON.stringify(parsedBody));
                tessReq.end();

            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`
🚀 Tess Proxy Server running at http://localhost:${PORT}
👉 USE THIS URL IN ADMIN CHAT: http://localhost:${PORT}/proxy/tess
    `);
});
