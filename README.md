# 💰 Shaxsiy Moliya va Kirim-Chiqim Telegram Boti

Ushbu Telegram boti shaxsiy xarajatlar va daromadlarni kunlik qayd etib borish, balansni kuzatish hamda **1 haftalik**, **1 oylik** yoki barcha davr uchun batafsil hisobotni **chiroyli formatlangan Excel (.xlsx)** faylida yuklab berish uchun maxsus yaratilgan.

---

## 🌟 Asosiy imkoniyatlari

- ➕ **Kirim qo'shish**: Maosh, savdo, sovg'a yoki boshqa daromadlarni kiritish.
- ➖ **Chiqim qo'shish**: Kundalik xarajatlarni toifalari (Oziq-ovqat, Transport, Kommunal, Kiyim, Dorixona va h.k.) yoki erkin izoh bilan kiritish.
- 💰 **Balans va statistika**:
  - Joriy sof balans (Kirim - Chiqim)
  - Jami kirim va jami chiqim
  - Bugungi kundagi hisob-kitob
  - Ushbu oydagi xarajatlar va eng ko'p pul ketgan toifalar
- 📊 **Excel hisobot (.xlsx)**:
  - 📅 **1 haftalik hisobot** (so'nggi 7 kun)
  - 🗓 **1 oylik hisobot** (so'nggi 30 kun)
  - 📆 **Joriy oy hisoboti** (shu oyning 1-sanasidan boshlab)
  - 📁 **Barcha vaqt uchun hisobot**
  - **Excel fayli xususiyatlari**: 
    - 1-varoq: Sana, turi (🟢 Kirim / 🔴 Chiqim), summa, kategoriya, izoh va pastida jami balans xulosasi.
    - 2-varoq: Kategoriyalar bo'yicha tahlil (qaysi sohadagi xarajatlar qancha foizni tashkil etgani).
- 📜 **So'nggi amallar**: Oxirgi 6 ta operatsiyani ko'rish va xato kiritilgan bo'lsa bitta tugma orqali o'chirish.
- 💾 **Ma'lumotlar bazasi**: Node.js 24 ning o'rnatilgan tezkor va xavfsiz SQLite bazasi (`node:sqlite`). Tashqi drayver talab qilmaydi.

---

## 🚀 Ishga tushirish bo'yicha qadam-baqadam qo'llanma

### 1-qadam: Telegramdan Bot Token olish
1. Telegramda [@BotFather](https://t.me/BotFather) botiga kiring.
2. `/newbot` buyrug'ini yuboring.
3. Botingiz uchun nom (masalan: `Mening Moliya Botim`) va username (masalan: `mening_moliya_bot`) kiriting.
4. `@BotFather` sizga bergan **HTTP API Token**ni nusxalab (copy) oling.

### 2-qadam: Tokenni sozlash
Loyihadagi `.env` faylini oching va tokenni yozing:

```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

*(Eslatma: agar `.env` fayli bo'lmasa, `.env.example` dan nusxa oling)*

### 3-qadam: Botni ishga tushirish
Sizda 2 xil usul bor:

#### 1-usul: Sichqoncha orqali (eng osoni)
Papka ichidagi **`run.bat`** faylini ikki marta bosing. Bot darhol ishga tushadi!

#### 2-usul: Terminal orqali
Papka ichida terminal ochib quyidagi buyruqni bering:
```bash
npm start
```
yoki:
```bash
node index.js
```

---

## 📁 Loyiha tuzilishi

```
telegram-finance-bot/
├── src/
│   ├── bot.js         # Telegram bot mantiqi va xabarlarni boshqarish
│   ├── database.js    # SQLite ma'lumotlar bazasi (kirim/chiqim amallari)
│   ├── excel.js       # Excel (.xlsx) chiroyli hisobot generatori
│   ├── keyboards.js   # Menyu va tugmalar dizayni
│   └── utils.js       # Raqamlarni formatlash va sanalar filtrlari
├── .env               # Telegram bot tokeni saqlanadigan fayl
├── .env.example       # Namunaviy env fayli
├── index.js           # Botni ishga tushiruvchi asosiy fayl
├── package.json       # Loyiha kutubxonalari
├── run.bat            # Windows uchun 1-bosishda ishga tushirish fayli
└── README.md          # Qo'llanma
```
