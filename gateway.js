const http = require('http');

function createProxy(port) {
  const server = http.createServer((clientReq, clientRes) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: clientReq.url,
      method: clientReq.method,
      headers: { ...clientReq.headers, host: 'localhost:3000' },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes, { end: true });
    });

    proxyReq.on('error', () => {
      clientRes.writeHead(200, { 'Content-Type': 'text/html' });
      clientRes.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="2">
          <title>GoalMind AI — Starting</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white; text-align: center; }
            .spinner { width: 44px; height: 44px; border: 4px solid #334155; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s infinite linear; margin: 0 auto 18px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            h2 { font-weight: 700; margin-bottom: 8px; }
            p { color: #94a3b8; font-size: 14px; max-width: 380px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div>
            <div class="spinner"></div>
            <h2>GoalMind AI is launching...</h2>
            <p>Initializing services and models. This page will connect automatically in 2 seconds.</p>
          </div>
        </body>
        </html>
      `);
    });

    clientReq.pipe(proxyReq, { end: true });
  });

  server.on('upgrade', (req, socket, head) => {
    // Forward WebSocket for Vite HMR
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options);
    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n\r\n');
      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });
    proxyReq.end();
  });

  server.on('error', (err) => {
    console.warn(`[Gateway Notice] Port ${port} could not be bound (${err.message}). Application remains accessible via other active ports.`);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Universal Gateway active on http://localhost:${port} -> proxying to port 3000`);
  });

  return server;
}

try { createProxy(80); } catch (e) { console.error('Port 80 error:', e.message); }
try { createProxy(5173); } catch (e) { console.error('Port 5173 error:', e.message); }
