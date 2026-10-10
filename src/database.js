const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'finance.db');
let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(dbPath);
    initDb();
  }
  return db;
}

function initDb() {
  const database = db || new DatabaseSync(dbPath);
  
  // Tranzaksiyalar jadvalini yaratish
  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('kirim', 'chiqim')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      comment TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_user_date ON transactions(user_id, created_at);
  `);
}

/**
 * Yangi kirim yoki chiqim qo'shish
 */
function addTransaction(userId, type, amount, category, comment = '') {
  const database = getDb();
  const createdAt = new Date().toISOString();
  
  const stmt = database.prepare(`
    INSERT INTO transactions (user_id, type, amount, category, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(userId, type, Number(amount), category.trim(), (comment || '').trim(), createdAt);
  return {
    id: result.lastInsertRowid,
    userId,
    type,
    amount: Number(amount),
    category: category.trim(),
    comment: (comment || '').trim(),
    created_at: createdAt
  };
}

/**
 * Balans va statistikalarni olish
 */
function getBalanceStats(userId) {
  const database = getDb();
  const now = new Date();
  
  // Bugungi kun boshlanishi
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  // Joriy oy boshlanishi
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthIso = monthStart.toISOString();

  // 1. Jami kirim va chiqim
  const totalStmt = database.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'kirim' THEN amount ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'chiqim' THEN amount ELSE 0 END), 0) AS total_expense,
      COUNT(*) AS total_count
    FROM transactions
    WHERE user_id = ?
  `);
  const totals = totalStmt.get(userId) || { total_income: 0, total_expense: 0, total_count: 0 };

  // 2. Bugungi statistika
  const todayStmt = database.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'kirim' THEN amount ELSE 0 END), 0) AS today_income,
      COALESCE(SUM(CASE WHEN type = 'chiqim' THEN amount ELSE 0 END), 0) AS today_expense
    FROM transactions
    WHERE user_id = ? AND created_at >= ?
  `);
  const today = todayStmt.get(userId, todayIso) || { today_income: 0, today_expense: 0 };

  // 3. Joriy oydagi statistika
  const monthStmt = database.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'kirim' THEN amount ELSE 0 END), 0) AS month_income,
      COALESCE(SUM(CASE WHEN type = 'chiqim' THEN amount ELSE 0 END), 0) AS month_expense
    FROM transactions
    WHERE user_id = ? AND created_at >= ?
  `);
  const month = monthStmt.get(userId, monthIso) || { month_income: 0, month_expense: 0 };

  const totalIncome = Number(totals.total_income);
  const totalExpense = Number(totals.total_expense);
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    totalCount: Number(totals.total_count),
    todayIncome: Number(today.today_income),
    todayExpense: Number(today.today_expense),
    monthIncome: Number(month.month_income),
    monthExpense: Number(month.month_expense)
  };
}

/**
 * Berilgan davr bo'yicha tranzaksiyalarni olish
 */
function getTransactions(userId, { startDate = null, endDate = null, limit = null, order = 'ASC' } = {}) {
  const database = getDb();
  let sql = `SELECT * FROM transactions WHERE user_id = ?`;
  const params = [userId];

  if (startDate) {
    sql += ` AND created_at >= ?`;
    params.push(startDate instanceof Date ? startDate.toISOString() : startDate);
  }

  if (endDate) {
    sql += ` AND created_at <= ?`;
    params.push(endDate instanceof Date ? endDate.toISOString() : endDate);
  }

  sql += ` ORDER BY created_at ${order === 'DESC' ? 'DESC' : 'ASC'}`;

  if (limit) {
    sql += ` LIMIT ?`;
    params.push(limit);
  }

  const stmt = database.prepare(sql);
  return stmt.all(...params);
}

/**
 * Kategoriyalar bo'yicha saralangan hisobot
 */
function getCategorySummary(userId, { startDate = null, endDate = null, type = 'chiqim' } = {}) {
  const database = getDb();
  let sql = `
    SELECT category, SUM(amount) AS total_amount, COUNT(*) AS count
    FROM transactions
    WHERE user_id = ? AND type = ?
  `;
  const params = [userId, type];

  if (startDate) {
    sql += ` AND created_at >= ?`;
    params.push(startDate instanceof Date ? startDate.toISOString() : startDate);
  }

  if (endDate) {
    sql += ` AND created_at <= ?`;
    params.push(endDate instanceof Date ? endDate.toISOString() : endDate);
  }

  sql += ` GROUP BY category ORDER BY total_amount DESC`;

  const stmt = database.prepare(sql);
  return stmt.all(...params);
}

/**
 * So'nggi amallarni olish
 */
function getRecentTransactions(userId, limit = 10) {
  return getTransactions(userId, { limit, order: 'DESC' });
}

/**
 * Amalni o'chirish
 */
function deleteTransaction(userId, id) {
  const database = getDb();
  const stmt = database.prepare(`DELETE FROM transactions WHERE id = ? AND user_id = ?`);
  const result = stmt.run(id, userId);
  return result.changes > 0;
}

/**
 * Barcha ma'lumotlarni tozalash (foydalanuvchi xohishiga ko'ra)
 */
function clearAllUserData(userId) {
  const database = getDb();
  const stmt = database.prepare(`DELETE FROM transactions WHERE user_id = ?`);
  const result = stmt.run(userId);
  return result.changes;
}

module.exports = {
  getDb,
  initDb,
  addTransaction,
  getBalanceStats,
  getTransactions,
  getCategorySummary,
  getRecentTransactions,
  deleteTransaction,
  clearAllUserData
};
