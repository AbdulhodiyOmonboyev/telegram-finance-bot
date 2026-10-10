require('dotenv').config();
const { createBot } = require('./src/bot');
const { startWebServer, unsleep } = require('./src/server');

const token = process.env.BOT_TOKEN;

if (!token || token.trim() === '' || token.includes('BU_YERGA_TOKENINGIZNI_QOYING')) {
  console.log('\n' + '='.repeat(60));
  console.log(' [XATOLIK] BOT_TOKEN topilmadi!');
  console.log('='.repeat(60));
  console.log('Iltimos, .env faylini oching va bot tokeningizni kiriting:');
  console.log('BOT_TOKEN=8367906458:AAEPaHIz_yFN3vD5drljsYt_eGgV1hRBX00');
  console.log('\nBot token olish uchun Telegramda @BotFather ga kiring va /newbot buyrug\'ini bering.');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}

// 1. Web server va Unsleep tizimini ishga tushirish (Render uchun)
const PORT = process.env.PORT || 3000;
const server = startWebServer(PORT);

// 2. Telegram botini yaratish
const bot = createBot(token);

// Kutilmagan xatoliklar tufayli bot to'xtab qolmasligi uchun himoya
bot.catch((err, ctx) => {
  console.error(`[Bot Error ⚠️] Xatolik yuz berdi (${ctx?.updateType}):`, err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Process ⚠️] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process ⚠️] Uncaught Exception:', err.message);
});

// 3. Botni ishga tushirish (retry mexanizmi bilan)
function launchBot() {
  bot.launch()
    .then(() => {
      console.log('\n' + '='.repeat(50));
      console.log(' 🚀 Moliya Boti muvaffaqiyatli ishga tushdi!');
      console.log(` 🌐 Web server: http://localhost:${PORT}`);
      console.log(' ⚡️ Unsleep: Faol (Render har 2 minutda uyg\'otiladi)');
      console.log(' Telegramda botingizga /start bosing.');
      console.log('='.repeat(50) + '\n');
    })
    .catch((err) => {
      console.error('❌ Botni ishga tushirishda xatolik:', err.message);
      console.log('Qayta ulanishga harakat qilinmoqda (5 soniyadan so\'ng)...');
      setTimeout(launchBot, 5000);
    });
}

launchBot();

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\nTo'xtatilmoqda (${signal})...`);
  bot.stop(signal);
  server.close(() => {
    console.log('Web server yopildi.');
    process.exit(0);
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { unsleep };
