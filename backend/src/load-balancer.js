import http from "http";

const servers = [
  { host: "127.0.0.1", port: 4001 },
  { host: "127.0.0.1", port: 4002 }
];

// Simple IP hashing function to achieve sticky sessions
function getServerIndex(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ip.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % servers.length;
}

const proxy = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress || "127.0.0.1";
  const target = servers[getServerIndex(ip)];

  console.log(`[Load Balancer] Routing HTTP request: ${req.method} ${req.url} -> Server Port ${target.port}`);

  // Forward HTTP request to target server
  const proxyReq = http.request({
    host: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error(`[Load Balancer] HTTP Forwarding error: ${err.message}`);
    res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
});

// Forward WebSocket connection upgrade
proxy.on("upgrade", (req, socket, head) => {
  const ip = req.socket.remoteAddress || "127.0.0.1";
  const target = servers[getServerIndex(ip)];

  console.log(`[Load Balancer] Routing WebSocket Upgrade -> Server Port ${target.port}`);

  const proxyReq = http.request({
    host: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    // Write 101 Switching Protocols header back to client
    const headers = [];
    headers.push("HTTP/1.1 101 Switching Protocols");
    for (const key in proxyRes.headers) {
      headers.push(`${key}: ${proxyRes.headers[key]}`);
    }
    socket.write(headers.join("\r\n") + "\r\n\r\n");

    // Pipe socket data bidirectionally between client and target server
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on("error", (err) => {
    console.error(`[Load Balancer] WebSocket upgrade forwarding error: ${err.message}`);
    socket.end();
  });

  proxyReq.end();
});

const PORT = 8080;
proxy.listen(PORT, () => {
  console.log(`[Load Balancer] Running on port ${PORT}`);
  console.log(`[Load Balancer] Forwarding target servers:`, servers);
});
