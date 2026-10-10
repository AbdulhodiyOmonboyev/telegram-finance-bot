/**
 * Yordamchi funksiyalar (Utils)
 */

// Pul miqdorini chiroyli formatda chiqarish (masalan: 1 500 000 so'm)
function formatMoney(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 so'm";
  const num = Math.round(Number(amount));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

// Foydalanuvchi kiritgan summani songa aylantirish
function parseMoney(text) {
  if (!text) return null;
  
  let str = text.trim()
    .replace(/\s+/g, '')
    .replace(/so['`]?m/gi, '');

  // Agar minglik ajratgich sifatida nuqta yoki vergul ishlatilgan bo'lsa (masalan: 25,000 yoki 1,500,000 yoki 25.000)
  // Masalan: 25,500 -> 25500
  if (/^\d{1,3}([,.]\d{3})+$/.test(str)) {
    str = str.replace(/[,.]/g, '');
  } else {
    // Agar o'nlik kasr bo'lsa (masalan: 25,5 yoki 50000.5)
    str = str.replace(/,/g, '.');
  }

  const num = parseFloat(str);
  if (isNaN(num) || num <= 0) {
    return null;
  }
  return num;
}

// Sanani formatlash (DD.MM.YYYY HH:mm)
function formatDate(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Faqat kun sanasi (DD.MM.YYYY)
function formatDateOnly(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

// Turli davrlar bo'yicha sanalar chegarasini hisoblash
function getDateRanges() {
  const now = new Date();

  // 1 hafta (so'nggi 7 kun)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // 1 oy (so'nggi 30 kun)
  const monthStart = new Date(now);
  monthStart.setDate(now.getDate() - 30);
  monthStart.setHours(0, 0, 0, 0);

  // Joriy oy boshi (1-kunidan boshlab)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  // Bugungi kun boshi
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  return {
    now,
    weekStart,
    monthStart,
    currentMonthStart,
    todayStart
  };
}

module.exports = {
  formatMoney,
  parseMoney,
  formatDate,
  formatDateOnly,
  getDateRanges
};
