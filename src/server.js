const http = require('http');

/**
 * Render uchun Web Server va kuchaytirilgan Unsleep tizimi
 */

function startWebServer(port = process.env.PORT || 3000) {
  const server = http.createServer((req, res) => {
    const rawUrl = req.url || '/';
    const pathname = rawUrl.split('?')[0];

    // Barcha so'rovlar uchun keshni butunlay o'chirish (Cloudflare/Render keshlab olmasligi uchun)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (pathname === '/' || pathname === '/unsleep' || pathname === '/ping' || pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'online',
        service: 'Telegram Finance Bot',
        mode: 'unsleep-active',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  server.listen(port, () => {
    console.log(`🌐 Web server ishga tushdi: port ${port}`);
  });

  // Kuchaytirilgan Unsleep funksiyasini ishga tushirish (har 2 minutda)
  unsleep(port, 2);

  return server;
}

/**
 * Serverni Renderda uxlab qolishdan (har 5-15 minutda o'chib qolishdan) saqlovchi Unsleep funksiyasi
 * @param {number|string} port - Server porti
 * @param {number} intervalMinutes - Necha minutda bir so'rov yuborilishi (standart: 2 minut)
 */
function unsleep(port = process.env.PORT || 3000, intervalMinutes = 2) {
  const INTERVAL_MS = intervalMinutes * 60 * 1000;

  const performUnsleepPing = async () => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || `http://localhost:${port}`;
    const cleanUrl = baseUrl.replace(/\/+$/, '');
    const timestamp = Date.now();
    const targetUrl = `${cleanUrl}/unsleep?t=${timestamp}`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // 1. To'g'ridan-to'g'ri so'rov (Direct HTTP Ping)
    try {
      const directRes = await fetch(targetUrl, { headers });
      console.log(`[Unsleep ⚡️] To'g'ridan-to'g'ri so'rov yuborildi: ${targetUrl} (Status: ${directRes.status})`);
    } catch (err) {
      console.warn(`[Unsleep ⚠️] To'g'ridan-to'g'ri so'rov ogohlantirishi: ${err.message}`);
    }

    // 2. Tashqi proksi orqali so'rov (External Inbound Ping)
    // Bu Renderga tashqi IP manzildan haqiqiy tashrif sifatida ko'rinadi va Renderni 100% uyg'oq ushlab turadi!
    if (cleanUrl.startsWith('https://')) {
      try {
        const externalProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        const proxyRes = await fetch(externalProxyUrl, { headers });
        console.log(`[Unsleep 🌐] Tashqi proksi orqali Renderga kirish amalga oshirildi (Status: ${proxyRes.status})`);
      } catch (proxyErr) {
        // Agar proksi vaqtincha javob bermasa, to'g'ridan-to'g'ri ping ishlagan bo'ladi
        console.warn(`[Unsleep ℹ️] Tashqi proksi ogohlantirishi: ${proxyErr.message}`);
      }
    }
  };

  // Server ishga tushishi bilan 5 soniyadan so'ng dastlabki unsleep chaqiruvi
  setTimeout(performUnsleepPing, 5 * 1000);

  // Keyin har 2 minutda muntazam davom etadi
  const intervalId = setInterval(performUnsleepPing, INTERVAL_MS);

  console.log(`⏰ [Unsleep] Tizim faollashtirildi: Har ${intervalMinutes} minutda uzluksiz so'rov yuboriladi.`);
  return intervalId;
}

module.exports = {
  startWebServer,
  unsleep
};
