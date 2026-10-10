# 💰 Shaxsiy Moliya va Kirim-Chiqim Telegram Boti (@Hisob_kitob2_bot)

Ushbu Telegram boti shaxsiy xarajatlar va daromadlarni kunlik qayd etib borish, balansni kuzatish hamda **1 haftalik**, **1 oylik** yoki barcha davr uchun batafsil hisobotni **chiroyli formatlangan Excel (.xlsx)** faylida tashlab berish uchun maxsus yaratilgan.

Botingiz: **[@Hisob_kitob2_bot](https://t.me/Hisob_kitob2_bot)**

---

## 🌟 Asosiy imkoniyatlari

- ➕ **Kirim qo'shish**: Maosh, savdo, sovg'a yoki boshqa daromadlarni kiritish.
- ➖ **Chiqim qo'shish**: Kundalik xarajatlarni toifalari (*Oziq-ovqat, Transport, Kommunal, Kiyim, Dorixona, Kafe va h.k.*) yoki erkin izoh bilan kiritish.
- 💰 **Balans va statistika**:
  - Joriy sof balans (Kirim - Chiqim)
  - Jami kirim va jami chiqim
  - Bugungi kundagi hisob-kitob
  - Ushbu oydagi umumiy xarajatlar va asosiy sarflangan toifalar
- 📊 **Excel hisobot (.xlsx)**:
  - 📅 **1 haftalik hisobot** (so'nggi 7 kun)
  - 🗓 **1 oylik hisobot** (so'nggi 30 kun)
  - 📆 **Joriy oy hisoboti** (oy boshidan)
  - 📁 **Barcha vaqt uchun hisobot**
  - **Excel fayli tuzilishi**:
    - **1-varoq (Amallar Tarixi)**: Har bir amalning sanasi, turi (🟢 Kirim / 🔴 Chiqim), summasi, kategoriyasi, izohi va pastida umumiy balans xulosasi.
    - **2-varoq (Kategoriyalar Tahlili)**: Qaysi yo'nalishga qancha pul ketganligi va foizdagi ulushi (Ulush %).
- 📜 **So'nggi amallar**: Oxirgi 6 ta operatsiyani ko'rish va xato kiritilgan bo'lsa bitta tugma orqali o'chirish.
- ⏰ **Anti-Sleep funksiyasi**: Render bepul tarifida 15 minutdan so'ng server uxlab qolmasligi uchun har 2 minutda o'ziga o'zi HTTP GET so'rov yuborib turadi (24/7 doimiy faol rejim).
- 🌐 **Web Healthcheck server**: Render uchun HTTP web server (`/ping`, `/health`).
- 💾 **Ma'lumotlar bazasi**: Node.js 24 ning o'rnatilgan tezkor va xavfsiz SQLite bazasi (`node:sqlite`).

---

## 🚀 Render.com da 1-Klik orqali Deploy qilish

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AbdulhodiyOmonboyev/telegram-finance-bot)

### Renderda sozlash qadamlari:
1. [Render.com](https://render.com) saytiga kiring (yoki GitHub orqali ro'yxatdan o'ting).
2. Yuqoridagi **"New +"** tugmasini bosing va **"Web Service"** ni tanlang.
3. GitHub reponi ulang: `AbdulhodiyOmonboyev/telegram-finance-bot`.
4. Quyidagi sozlamalarni tekshiring:
   - **Name**: `telegram-finance-bot`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. **Environment Variables** (Muhit o'zgaruvchilari) bo'limiga kiring va qo'shing:
   - `BOT_TOKEN`: `8367906458:AAEPaHIz_yFN3vD5drljsYt_eGgV1hRBX00`
   - *(Ixtiyoriy)* `SERVER_URL`: Render sizga bergan URL manzil (masalan: `https://telegram-finance-bot.onrender.com`)
6. **"Deploy Web Service"** tugmasini bosing!

---

## 💻 Kompyuterda lokal ishga tushirish

1. Ushbu papkadagi [`run.bat`](run.bat) faylini ikki marta bosing.
2. Yoki terminalda:
   ```bash
   npm start
   ```

---

## 📁 Loyiha tuzilishi

```
telegram-finance-bot/
├── src/
│   ├── bot.js         # Telegram bot logikasi va komandalar
│   ├── database.js    # SQLite ma'lumotlar bazasi
│   ├── excel.js       # Excel (.xlsx) chiroyli hisobot generatori
│   ├── keyboards.js   # Menyu va inline tugmalar
│   ├── server.js      # HTTP server va 2 minutlik Anti-Sleep tizimi
│   └── utils.js       # Pul va sanalarni formatlash
├── .env               # Telegram bot tokeni (lokal uchun)
├── .env.example       # Namunaviy env fayli
├── render.yaml        # Render avtomatlashtirilgan sozlamasi
├── index.js           # Asosiy ishga tushiruvchi fayl
├── package.json       # Loyiha kutubxonalari
├── run.bat            # Windows uchun 1-bosishda ishga tushirish fayli
└── README.md          # Loyiha hujjati
```
