const http = require('http');

/**
 * Render uchun Web Server va Anti-Sleep tizimi
 */

function startWebServer(port = process.env.PORT || 3000) {
  const server = http.createServer((req, res) => {
    const url = req.url || '/';

    if (url === '/' || url === '/ping' || url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'online',
        service: 'Telegram Finance Bot',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  server.listen(port, () => {
    console.log(`🌐 Web server ishga tushdi: port ${port}`);
  });

  // Anti-Sleep funksiyasini ishga tushirish (har 2 minutda o'ziga o'zi so'rov yuborish)
  startAntiSleep(port);

  return server;
}

/**
 * Serverni uxlatmaslik uchun har 2 minutda o'ziga o'zi so'rov yuborish
 */
function startAntiSleep(port) {
  // 2 minut = 120 000 millisekund
  const INTERVAL_MS = 2 * 60 * 1000;

  const pingServer = async () => {
    // Render tashqi URL beradi (RENDER_EXTERNAL_URL), yoki .env dagi SERVER_URL, yoki localhost
    const rawUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || `http://localhost:${port}`;
    const targetUrl = rawUrl.replace(/\/+$/, '') + '/ping';

    try {
      const response = await fetch(targetUrl);
      const data = await response.json().catch(() => ({}));
      console.log(`[Anti-Sleep ⏰] Muvaffaqiyatli so'rov yuborildi: ${targetUrl} (Status: ${response.status})`);
    } catch (err) {
      console.warn(`[Anti-Sleep ⚠️] So'rovda ogohlantirish: ${err.message}`);
    }
  };

  // Birinchi so'rovni 10 soniyadan so'ng yuborish
  setTimeout(pingServer, 10 * 1000);

  // Keyin har 2 minutda takrorlash
  const intervalId = setInterval(pingServer, INTERVAL_MS);

  // Jarayon to'xtaganda intervalni tozalash
  return intervalId;
}

module.exports = {
  startWebServer,
  startAntiSleep
};
