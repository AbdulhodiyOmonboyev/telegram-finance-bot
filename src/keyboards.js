const { Markup } = require('telegraf');

/**
 * Asosiy menyu klaviaturasi
 */
function getMainMenu() {
  return Markup.keyboard([
    ['➕ Kirim', '➖ Chiqim'],
    ['💰 Balans', '📊 Excel hisobot'],
    ['📜 So\'nggi amallar', '👤 Profilim'],
    ['ℹ️ Yordam']
  ]).resize();
}

/**
 * Telefon raqam so'rash klaviaturasi
 */
function getPhoneRequestMenu() {
  return Markup.keyboard([
    [Markup.button.contactRequest('📱 Telefon raqamni yuborish')],
    ['❌ Bekor qilish']
  ]).resize();
}

/**
 * Bekor qilish klaviaturasi
 */
function getCancelMenu() {
  return Markup.keyboard([
    ['❌ Bekor qilish']
  ]).resize();
}

/**
 * Chiqim uchun tezkor kategoriyalar (Inline)
 */
function getExpenseCategories() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🍔 Oziq-ovqat', 'cat_Oziq-ovqat'),
      Markup.button.callback('🚕 Transport', 'cat_Transport')
    ],
    [
      Markup.button.callback('🏠 Kommunal/Uy', 'cat_Kommunal/Uy'),
      Markup.button.callback('👕 Kiyim-kechak', 'cat_Kiyim-kechak')
    ],
    [
      Markup.button.callback('💊 Dorixona/Sog\'liq', 'cat_Dorixona/Sog\'liq'),
      Markup.button.callback('📱 Telefon/Internet', 'cat_Telefon/Internet')
    ],
    [
      Markup.button.callback('☕️ Kafe/Restoran', 'cat_Kafe/Restoran'),
      Markup.button.callback('🎉 Ko\'ngilochar', 'cat_Ko\'ngilochar')
    ],
    [
      Markup.button.callback('💡 Boshqa xarajat', 'cat_Boshqa')
    ],
    [
      Markup.button.callback('❌ Bekor qilish', 'action_cancel')
    ]
  ]);
}

/**
 * Kirim uchun tezkor kategoriyalar (Inline)
 */
function getIncomeCategories() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('💼 Oylik maosh', 'cat_Oylik maosh'),
      Markup.button.callback('📈 Biznes/Savdo', 'cat_Biznes/Savdo')
    ],
    [
      Markup.button.callback('🤝 Qarz qaytarish', 'cat_Qarz qaytarish'),
      Markup.button.callback('🎁 Sovg\'a/Mukofot', 'cat_Sovg\'a/Mukofot')
    ],
    [
      Markup.button.callback('💡 Boshqa daromad', 'cat_Boshqa')
    ],
    [
      Markup.button.callback('❌ Bekor qilish', 'action_cancel')
    ]
  ]);
}

/**
 * Excel hisoboti davrini tanlash klaviaturasi
 */
function getExcelPeriodMenu() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📅 1 haftalik hisobot (so\'nggi 7 kun)', 'excel_week')
    ],
    [
      Markup.button.callback('🗓 1 oylik hisobot (so\'nggi 30 kun)', 'excel_month')
    ],
    [
      Markup.button.callback('📆 Joriy oy hisoboti (oy boshidan)', 'excel_curmonth')
    ],
    [
      Markup.button.callback('📁 Barcha vaqt uchun hisobot', 'excel_all')
    ],
    [
      Markup.button.callback('❌ Bekor qilish', 'action_cancel')
    ]
  ]);
}

/**
 * Tranzaksiyani o'chirish uchun inline tugma
 */
function getDeleteTxButton(txId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🗑 Ushbu amalni o\'chirish', `deltx_${txId}`)]
  ]);
}

module.exports = {
  getMainMenu,
  getCancelMenu,
  getPhoneRequestMenu,
  getExpenseCategories,
  getIncomeCategories,
  getExcelPeriodMenu,
  getDeleteTxButton
};
