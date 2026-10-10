const assert = require('assert');
const fs = require('fs');
const path = require('path');
const db = require('./src/database');
const { generateExcelReport } = require('./src/excel');
const { parseMoney, formatMoney, getDateRanges } = require('./src/utils');

async function testAll() {
  console.log('--- 1. Testing Utils ---');
  assert.strictEqual(parseMoney('50000'), 50000);
  assert.strictEqual(parseMoney('1 500 000 so\'m'), 1500000);
  assert.strictEqual(parseMoney('25,500'), 25500);
  assert.strictEqual(parseMoney('abc'), null);
  assert.strictEqual(formatMoney(1500000), "1 500 000 so'm");
  console.log('✅ Utils test passed!');

  console.log('--- 2. Testing Database ---');
  db.initDb();
  const testUserId = 99999999;
  db.clearAllUserData(testUserId);

  // Add income
  const inc1 = db.addTransaction(testUserId, 'kirim', 5000000, 'Oylik maosh', 'Oktabr oyligi');
  assert(inc1.id > 0);

  // Add expenses
  const exp1 = db.addTransaction(testUserId, 'chiqim', 150000, 'Oziq-ovqat', 'Bozorlik');
  const exp2 = db.addTransaction(testUserId, 'chiqim', 45000, 'Transport', 'Taksi');
  const exp3 = db.addTransaction(testUserId, 'chiqim', 120000, 'Kommunal/Uy', 'Elektr toki');

  const stats = db.getBalanceStats(testUserId);
  console.log('Stats:', stats);
  assert.strictEqual(stats.totalIncome, 5000000);
  assert.strictEqual(stats.totalExpense, 315000);
  assert.strictEqual(stats.balance, 4685000);
  assert.strictEqual(stats.totalCount, 4);

  const txs = db.getTransactions(testUserId);
  assert.strictEqual(txs.length, 4);

  const catExp = db.getCategorySummary(testUserId, { type: 'chiqim' });
  console.log('Category expenses:', catExp);
  assert.strictEqual(catExp.length, 3);

  console.log('✅ Database test passed!');

  console.log('--- 3. Testing Excel Generation ---');
  const ranges = getDateRanges();
  const buffer = await generateExcelReport(txs, {
    periodTitle: '1 haftalik hisobot (so\'nggi 7 kun)',
    userFullName: 'Test Foydalanuvchi',
    categoryExpenses: catExp,
    categoryIncomes: db.getCategorySummary(testUserId, { type: 'kirim' })
  });

  assert(Buffer.isBuffer(buffer) || buffer instanceof Uint8Array);
  assert(buffer.length > 1000);
  console.log(`✅ Excel generation passed! Generated size: ${buffer.length} bytes`);

  const testFilePath = path.join(__dirname, 'test_output.xlsx');
  fs.writeFileSync(testFilePath, buffer);
  console.log(`Saved sample test report to ${testFilePath}`);

  // Test delete
  db.deleteTransaction(testUserId, exp3.id);
  const updatedStats = db.getBalanceStats(testUserId);
  assert.strictEqual(updatedStats.totalExpense, 195000);
  console.log('✅ Delete transaction test passed!');

  // Cleanup test user
  db.clearAllUserData(testUserId);
  console.log('\n🎉 ALL BOT BACKEND TESTS PASSED SUCCESSFULLY!\n');
}

testAll().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
