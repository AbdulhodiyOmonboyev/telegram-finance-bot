const { Telegraf } = require('telegraf');
const db = require('./database');
const { generateExcelReport } = require('./excel');
const {
  formatMoney,
  parseMoney,
  formatDate,
  getDateRanges
} = require('./utils');
const {
  getMainMenu,
  getCancelMenu,
  getExpenseCategories,
  getIncomeCategories,
  getExcelPeriodMenu,
  getDeleteTxButton
} = require('./keyboards');

// Foydalanuvchilar holatini saqlash (in-memory FSM)
const userStates = new Map();

function createBot(token) {
  const bot = new Telegraf(token);

  // Ma'lumotlar bazasini initsializatsiya qilish
  db.initDb();

  // /start buyrug'i
  bot.command('start', async (ctx) => {
    userStates.delete(ctx.from.id);
    const firstName = ctx.from.first_name || 'Foydalanuvchi';
    
    await ctx.reply(
      `Assalomu alaykum, <b>${firstName}</b>! 👋\n\n` +
      `Men sizning shaxsiy moliyaviy hisob-kitob (kirim va chiqim) botingizman.\n\n` +
      `Har bir xarajat va daromadingizni kiritib boring, men sizga aniq hisob-kitob qilib, <b>1 haftalik</b> yoki <b>1 oylik</b> to'liq hisobotni <b>Excel (.xlsx)</b> faylida tayyorlab beraman.\n\n` +
      `Boshlash uchun quyidagi tugmalardan birini tanlang:`,
      {
        parse_mode: 'HTML',
        ...getMainMenu()
      }
    );
  });

  // /help va "ℹ️ Yordam" tugmasi
  const sendHelp = async (ctx) => {
    userStates.delete(ctx.from.id);
    await ctx.reply(
      `📌 <b>Botdan foydalanish yo'riqnomasi:</b>\n\n` +
      `➕ <b>Kirim</b> — Daromad qo'shish (oylik, savdo, qarz qaytishi va h.k.)\n` +
      `➖ <b>Chiqim</b> — Kundalik xarajatlarni yozib borish (ovqat, transport, kommunal va h.k.)\n` +
      `💰 <b>Balans</b> — Umumiy qoldiq, bugungi va ushbu oydagi xarajatlar statistikasi\n` +
      `📊 <b>Excel hisobot</b> — 1 haftalik yoki 1 oylik chiroyli va qulay Excel jadvalini yuklab olish\n` +
      `📜 <b>So'nggi amallar</b> — Oxirgi kiritilgan yozuvlarni ko'rish va xato kiritilgan bo'lsa o'chirish\n\n` +
      `<i>Har qanday amalni to'xtatish uchun "❌ Bekor qilish" tugmasini bosing.</i>`,
      {
        parse_mode: 'HTML',
        ...getMainMenu()
      }
    );
  };

  bot.command('help', sendHelp);
  bot.hears('ℹ️ Yordam', sendHelp);

  // "❌ Bekor qilish"
  const handleCancel = async (ctx) => {
    userStates.delete(ctx.from.id);
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery('Amal bekor qilindi');
      try {
        await ctx.deleteMessage();
      } catch (e) {}
    }
    await ctx.reply('❌ Amal bekor qilindi. Asosiy menyudasiz.', getMainMenu());
  };

  bot.hears('❌ Bekor qilish', handleCancel);
  bot.action('action_cancel', handleCancel);

  // "➕ Kirim" bosilganda
  bot.hears('➕ Kirim', async (ctx) => {
    userStates.set(ctx.from.id, { step: 'waiting_amount', type: 'kirim' });
    await ctx.reply(
      `➕ <b>KIRIM (DAROMAD) QO'SHISH</b>\n\n` +
      `Iltimos, summani kiriting:\n` +
      `<i>(Masalan: 50000 yoki 1 500 000)</i>`,
      {
        parse_mode: 'HTML',
        ...getCancelMenu()
      }
    );
  });

  // "➖ Chiqim" bosilganda
  bot.hears('➖ Chiqim', async (ctx) => {
    userStates.set(ctx.from.id, { step: 'waiting_amount', type: 'chiqim' });
    await ctx.reply(
      `➖ <b>CHIQIM (XARAJAT) QO'SHISH</b>\n\n` +
      `Iltimos, sarflangan summani kiriting:\n` +
      `<i>(Masalan: 25000 yoki 120 000)</i>`,
      {
        parse_mode: 'HTML',
        ...getCancelMenu()
      }
    );
  });

  // "💰 Balans" bosilganda
  const handleBalance = async (ctx) => {
    userStates.delete(ctx.from.id);
    const userId = ctx.from.id;
    const stats = db.getBalanceStats(userId);

    const balanceColor = stats.balance >= 0 ? '🟢' : '🔴';

    let msg = `💰 <b>SIZNING MOLIAVIY BALANSINGIZ:</b>\n\n` +
      `${balanceColor} <b>Hozirgi qoldiq:</b> <code>${formatMoney(stats.balance)}</code>\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 <b>Barcha vaqt bo'yicha:</b>\n` +
      `🟢 Jami kirim: <code>${formatMoney(stats.totalIncome)}</code>\n` +
      `🔴 Jami chiqim: <code>${formatMoney(stats.totalExpense)}</code>\n` +
      `🔢 Amallar soni: <b>${stats.totalCount} ta</b>\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 <b>Bugungi kun:</b>\n` +
      `➕ Kirim: <code>${formatMoney(stats.todayIncome)}</code>\n` +
      `➖ Chiqim: <code>${formatMoney(stats.todayExpense)}</code>\n\n` +
      `🗓 <b>Shu oy boshidan beri:</b>\n` +
      `➕ Kirim: <code>${formatMoney(stats.monthIncome)}</code>\n` +
      `➖ Chiqim: <code>${formatMoney(stats.monthExpense)}</code>`;

    // Ushbu oydagi asosiy chiqim kategoriyalari
    const { currentMonthStart } = getDateRanges();
    const topExpenses = db.getCategorySummary(userId, { startDate: currentMonthStart, type: 'chiqim' }).slice(0, 3);
    if (topExpenses.length > 0) {
      msg += `\n\n🏷 <b>Shu oyning asosiy xarajatlari:</b>\n`;
      topExpenses.forEach(exp => {
        msg += `• ${exp.category}: <code>${formatMoney(exp.total_amount)}</code>\n`;
      });
    }

    await ctx.reply(msg, {
      parse_mode: 'HTML',
      ...getMainMenu()
    });
  };

  bot.hears('💰 Balans', handleBalance);
  bot.command('balance', handleBalance);

  // "📊 Excel hisobot" bosilganda
  bot.hears('📊 Excel hisobot', async (ctx) => {
    userStates.delete(ctx.from.id);
    await ctx.reply(
      `📊 <b>EXCEL HISOBOTINI YUKLAB OLISH</b>\n\n` +
      `Kerakli davrni tanlang, bot barcha hisob-kitoblarni chiroyli formatlangan <b>.xlsx</b> faylga aylantirib yuboradi:`,
      {
        parse_mode: 'HTML',
        ...getExcelPeriodMenu()
      }
    );
  });

  // "📜 So'nggi amallar"
  bot.hears('📜 So\'nggi amallar', async (ctx) => {
    userStates.delete(ctx.from.id);
    const userId = ctx.from.id;
    const recent = db.getRecentTransactions(userId, 6);

    if (recent.length === 0) {
      return ctx.reply("Sizda hali hech qanday amallar mavjud emas.", getMainMenu());
    }

    await ctx.reply('📜 <b>So\'nggi 6 ta amal:</b>', { parse_mode: 'HTML' });

    for (const item of recent) {
      const isKirim = item.type === 'kirim';
      const icon = isKirim ? '🟢 ➕ Kirim' : '🔴 ➖ Chiqim';
      const text = `${icon}\n` +
        `💰 Summa: <b>${formatMoney(item.amount)}</b>\n` +
        `🏷 Kategoriya: <b>${item.category}</b>\n` +
        (item.comment ? `📝 Izoh: <i>${item.comment}</i>\n` : '') +
        `📅 Sana: ${formatDate(item.created_at)}`;

      await ctx.reply(text, {
        parse_mode: 'HTML',
        ...getDeleteTxButton(item.id)
      });
    }
  });

  // Amalni o'chirish (deltx_ID)
  bot.action(/^deltx_(\d+)$/, async (ctx) => {
    const txId = parseInt(ctx.match[1]);
    const userId = ctx.from.id;
    const deleted = db.deleteTransaction(userId, txId);

    if (deleted) {
      await ctx.answerCbQuery('Amal muvaffaqiyatli o\'chirildi!');
      try {
        await ctx.editMessageText('🗑 <b>Ushbu amal o\'chirildi.</b>', { parse_mode: 'HTML' });
      } catch (e) {}
    } else {
      await ctx.answerCbQuery('Amal topilmadi yoki avvalroq o\'chirilgan.');
    }
  });

  // Excel hisobot callbacklari
  bot.action(/^excel_(week|month|curmonth|all)$/, async (ctx) => {
    const periodType = ctx.match[1];
    const userId = ctx.from.id;
    const ranges = getDateRanges();
    const userFullName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim() || 'Foydalanuvchi';

    let startDate = null;
    let periodTitle = "Barcha vaqt uchun";
    let fileSuffix = "barcha_vaqt";

    if (periodType === 'week') {
      startDate = ranges.weekStart;
      periodTitle = "1 haftalik hisobot (so'nggi 7 kun)";
      fileSuffix = "1_haftalik";
    } else if (periodType === 'month') {
      startDate = ranges.monthStart;
      periodTitle = "1 oylik hisobot (so'nggi 30 kun)";
      fileSuffix = "1_oylik";
    } else if (periodType === 'curmonth') {
      startDate = ranges.currentMonthStart;
      periodTitle = "Joriy oy hisoboti (oy boshidan)";
      fileSuffix = "joriy_oy";
    }

    await ctx.answerCbQuery('Excel fayl tayyorlanmoqda...');
    const waitMsg = await ctx.reply('⏳ Excel hisobot tayyorlanmoqda, iltimos kuting...');

    try {
      const transactions = db.getTransactions(userId, { startDate });
      
      if (transactions.length === 0) {
        await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
        return ctx.reply(`⚠️ ${periodTitle} bo'yicha hech qanday ma'lumot topilmadi. Avval kirim yoki chiqim qo'shing.`, getMainMenu());
      }

      const categoryExpenses = db.getCategorySummary(userId, { startDate, type: 'chiqim' });
      const categoryIncomes = db.getCategorySummary(userId, { startDate, type: 'kirim' });

      const excelBuffer = await generateExcelReport(transactions, {
        periodTitle,
        userFullName,
        categoryExpenses,
        categoryIncomes
      });

      // Statistika hisobi
      let incSum = 0;
      let expSum = 0;
      transactions.forEach(t => {
        if (t.type === 'kirim') incSum += Number(t.amount);
        if (t.type === 'chiqim') expSum += Number(t.amount);
      });
      const bal = incSum - expSum;

      const fileName = `Moliya_${fileSuffix}_${Date.now()}.xlsx`;

      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});

      await ctx.replyWithDocument(
        {
          source: excelBuffer,
          filename: fileName
        },
        {
          caption:
            `📊 <b>Sizning Excel hisobotingiz tayyor!</b>\n\n` +
            `🗓 <b>Davr:</b> ${periodTitle}\n` +
            `🟢 <b>Jami kirim:</b> <code>${formatMoney(incSum)}</code>\n` +
            `🔴 <b>Jami chiqim:</b> <code>${formatMoney(expSum)}</code>\n` +
            `💰 <b>Sof qoldiq:</b> <code>${formatMoney(bal)}</code>\n` +
            `🔢 <b>Amallar soni:</b> ${transactions.length} ta\n\n` +
            `<i>Faylni ochib barcha amallar va kategoriyalar tahlilini ko'rishingiz mumkin.</i>`,
          parse_mode: 'HTML',
          ...getMainMenu()
        }
      );
    } catch (err) {
      console.error('Excel yaratishda xatolik:', err);
      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
      await ctx.reply('❌ Excel hisobot yaratishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.', getMainMenu());
    }
  });

  // Kategoriya tugmalari bosilganda (cat_*)
  bot.action(/^cat_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    const userId = ctx.from.id;
    const state = userStates.get(userId);

    if (!state || state.step !== 'waiting_category') {
      await ctx.answerCbQuery('Amal muddati o\'tgan. Qaytadan boshlang.');
      try {
        await ctx.deleteMessage();
      } catch (e) {}
      return;
    }

    const { type, amount } = state;
    userStates.delete(userId);

    // Bazaga saqlash
    const saved = db.addTransaction(userId, type, amount, category, '');
    const stats = db.getBalanceStats(userId);

    await ctx.answerCbQuery('Muvaffaqiyatli saqlandi!');
    try {
      await ctx.deleteMessage();
    } catch (e) {}

    const isKirim = type === 'kirim';
    const typeLabel = isKirim ? '🟢 Kirim' : '🔴 Chiqim';

    await ctx.reply(
      `✅ <b>Muvaffaqiyatli saqlandi!</b>\n\n` +
      `🔹 <b>Turi:</b> ${typeLabel}\n` +
      `💰 <b>Summa:</b> <code>${formatMoney(amount)}</code>\n` +
      `🏷 <b>Kategoriya:</b> <b>${category}</b>\n` +
      `📅 <b>Sana:</b> ${formatDate(saved.created_at)}\n\n` +
      `💵 <b>Joriy balans:</b> <code>${formatMoney(stats.balance)}</code>`,
      {
        parse_mode: 'HTML',
        ...getMainMenu()
      }
    );
  });

  // Matnli xabarlarni qayta ishlash
  bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const state = userStates.get(userId);

    // Agar hech qanday bosqichda bo'lmasa va menyu tugmasi bo'lmasa
    if (!state) {
      return;
    }

    // 1-BOSQICH: Summa kiritish
    if (state.step === 'waiting_amount') {
      const amount = parseMoney(text);
      if (!amount) {
        return ctx.reply(
          `⚠️ Iltimos, summani to'g'ri raqam bilan kiriting!\n` +
          `Masalan: <code>45000</code> yoki <code>150 000</code>\n\n` +
          `Bekor qilish uchun "❌ Bekor qilish" tugmasini bosing.`,
          { parse_mode: 'HTML', ...getCancelMenu() }
        );
      }

      // Summa qabul qilindi, endi kategoriya bosqichi
      userStates.set(userId, {
        step: 'waiting_category',
        type: state.type,
        amount: amount
      });

      const keyboard = state.type === 'kirim' ? getIncomeCategories() : getExpenseCategories();

      return ctx.reply(
        `Summa qabul qilindi: <b>${formatMoney(amount)}</b>\n\n` +
        `Endi quyidagi tayyor kategoriyalardan birini tanlang yoki o'zingiz izoh yozib yuboring (masalan: <i>Tushlik, Benzin, Bozorlik...</i>):`,
        {
          parse_mode: 'HTML',
          ...keyboard
        }
      );
    }

    // 2-BOSQICH: O'z qo'li bilan kategoriya yoki izoh yozgan bo'lsa
    if (state.step === 'waiting_category') {
      const { type, amount } = state;
      userStates.delete(userId);

      const category = text.length > 30 ? text.substring(0, 30) : text;
      const comment = text.length > 30 ? text : '';

      const saved = db.addTransaction(userId, type, amount, category, comment);
      const stats = db.getBalanceStats(userId);

      const isKirim = type === 'kirim';
      const typeLabel = isKirim ? '🟢 Kirim' : '🔴 Chiqim';

      return ctx.reply(
        `✅ <b>Muvaffaqiyatli saqlandi!</b>\n\n` +
        `🔹 <b>Turi:</b> ${typeLabel}\n` +
        `💰 <b>Summa:</b> <code>${formatMoney(amount)}</code>\n` +
        `🏷 <b>Kategoriya/Izoh:</b> <b>${category}</b>\n` +
        `📅 <b>Sana:</b> ${formatDate(saved.created_at)}\n\n` +
        `💵 <b>Joriy balans:</b> <code>${formatMoney(stats.balance)}</code>`,
        {
          parse_mode: 'HTML',
          ...getMainMenu()
        }
      );
    }
  });

  return bot;
}

module.exports = {
  createBot
};
