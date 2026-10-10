const ExcelJS = require('exceljs');
const { formatDate, formatMoney } = require('./utils');

/**
 * Excel hisobot faylini yaratish
 * @param {Array} transactions - Tranzaksiyalar ro'yxati
 * @param {Object} options - { periodTitle, userFullName, categoryStats }
 * @returns {Promise<Buffer>}
 */
async function generateExcelReport(transactions, options = {}) {
  const {
    periodTitle = "Barcha davr uchun",
    userFullName = "Foydalanuvchi",
    categoryExpenses = [],
    categoryIncomes = []
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Moliya Bot";
  workbook.created = new Date();

  // ==========================================
  // 1-VAROQ: BARCHA AMALLAR (HISOBOT)
  // ==========================================
  const sheet = workbook.addWorksheet('Amallar Tarixi', {
    views: [{ showGridLines: true }]
  });

  // Ustunlar kengligini belgilash
  sheet.columns = [
    { key: 'index', width: 8 },      // №
    { key: 'date', width: 22 },      // Sana va Vaqt
    { key: 'type', width: 16 },      // Turi
    { key: 'amount', width: 20 },    // Summa
    { key: 'category', width: 24 },  // Kategoriya
    { key: 'comment', width: 32 }    // Izoh
  ];

  // 1. Sarlavha (Title)
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'MOLIYA HISOBOTI (KIRIM VA CHIQIMLAR)';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' } // To'q ko'k
  };
  sheet.getRow(1).height = 36;

  // 2. Info satri (Davr, Sana)
  sheet.mergeCells('A2:F2');
  const infoCell = sheet.getCell('A2');
  infoCell.value = `Davr: ${periodTitle}  |  Eksport sanasi: ${formatDate(new Date())}  |  Foydalanuvchi: ${userFullName}`;
  infoCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF475569' } };
  infoCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(2).height = 24;

  // Bo'sh qator
  sheet.getRow(3).height = 10;

  // 3. JAMI STATISTIKA KARTALARI (A4:F6)
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'kirim') totalIncome += Number(t.amount);
    if (t.type === 'chiqim') totalExpense += Number(t.amount);
  });
  const balance = totalIncome - totalExpense;

  // Kirim kartasi (A4:B5)
  sheet.mergeCells('A4:B4');
  sheet.mergeCells('A5:B5');
  const incTitle = sheet.getCell('A4');
  incTitle.value = 'JAMI KIRIM (🟢)';
  incTitle.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  incTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  incTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };

  const incVal = sheet.getCell('A5');
  incVal.value = totalIncome;
  incVal.numFmt = '#,##0 "so\'m"';
  incVal.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF1B5E20' } };
  incVal.alignment = { horizontal: 'center', vertical: 'middle' };
  incVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };

  // Chiqim kartasi (C4:D4, C5:D5)
  sheet.mergeCells('C4:D4');
  sheet.mergeCells('C5:D5');
  const expTitle = sheet.getCell('C4');
  expTitle.value = 'JAMI CHIQIM (🔴)';
  expTitle.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  expTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  expTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };

  const expVal = sheet.getCell('C5');
  expVal.value = totalExpense;
  expVal.numFmt = '#,##0 "so\'m"';
  expVal.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFB71C1C' } };
  expVal.alignment = { horizontal: 'center', vertical: 'middle' };
  expVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };

  // Balans kartasi (E4:F4, E5:F5)
  sheet.mergeCells('E4:F4');
  sheet.mergeCells('E5:F5');
  const balTitle = sheet.getCell('E4');
  balTitle.value = 'SOF BALANS / QOLDIQ (💰)';
  balTitle.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  balTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  balTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };

  const balVal = sheet.getCell('E5');
  balVal.value = balance;
  balVal.numFmt = '#,##0 "so\'m"';
  balVal.font = { name: 'Calibri', size: 13, bold: true, color: { argb: balance >= 0 ? 'FF0D47A1' : 'FFB71C1C' } };
  balVal.alignment = { horizontal: 'center', vertical: 'middle' };
  balVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };

  // Kartalar chegaralari
  ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'A5', 'B5', 'C5', 'D5', 'E5', 'F5'].forEach(cellRef => {
    sheet.getCell(cellRef).border = {
      top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      bottom: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      right: { style: 'thin', color: { argb: 'FFB0BEC5' } }
    };
  });

  sheet.getRow(4).height = 20;
  sheet.getRow(5).height = 26;
  sheet.getRow(6).height = 12; // Bo'sh oraliq

  // 4. Jadval sarlavhalari (Row 7)
  const headerRowIndex = 7;
  const headers = ['№', 'Sana va Vaqt', 'Turi', 'Summa (so\'m)', 'Kategoriya', 'Izoh'];
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = headers;
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF263238' } // Qora-kulrang elegant sarlavha
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF9E9E9E' } },
      right: { style: 'thin', color: { argb: 'FF9E9E9E' } }
    };
  });

  // 5. Tranzaksiyalar satrlari
  let currentRowIndex = headerRowIndex + 1;

  if (transactions.length === 0) {
    sheet.mergeCells(`A${currentRowIndex}:F${currentRowIndex}`);
    const emptyCell = sheet.getCell(`A${currentRowIndex}`);
    emptyCell.value = "Ushbu davr uchun hech qanday ma'lumot kiritilmagan.";
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    emptyCell.font = { italic: true, color: { argb: 'FF757575' } };
    sheet.getRow(currentRowIndex).height = 25;
    currentRowIndex++;
  } else {
    transactions.forEach((tx, idx) => {
      const row = sheet.getRow(currentRowIndex);
      const isKirim = tx.type === 'kirim';
      
      row.values = [
        idx + 1,
        formatDate(tx.created_at),
        isKirim ? '➕ Kirim' : '➖ Chiqim',
        Number(tx.amount),
        tx.category || '-',
        tx.comment || '-'
      ];

      row.height = 22;

      // Hujayra stillari
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(4).numFmt = '#,##0 "so\'m"';
      row.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };

      // Rang berish
      const bgArgb = isKirim ? 'FFF1F8E9' : 'FFFFEBEE'; // Juda ochiq yashil yoki qizil
      const textArgb = isKirim ? 'FF2E7D32' : 'FFC62828';

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10.5 };
        if (colNumber === 3 || colNumber === 4) {
          cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: textArgb } };
        }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgArgb }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });

      currentRowIndex++;
    });

    // 6. Jami xulosalar satri (Footer)
    const summaryRow = sheet.getRow(currentRowIndex);
    sheet.mergeCells(`A${currentRowIndex}:C${currentRowIndex}`);
    const sumTitle = sheet.getCell(`A${currentRowIndex}`);
    sumTitle.value = 'JAMI (BALANS)';
    sumTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    sumTitle.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };

    const sumAmount = sheet.getCell(`D${currentRowIndex}`);
    sumAmount.value = balance;
    sumAmount.numFmt = '#,##0 "so\'m"';
    sumAmount.alignment = { horizontal: 'right', vertical: 'middle' };
    sumAmount.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };

    sheet.mergeCells(`E${currentRowIndex}:F${currentRowIndex}`);
    const sumNote = sheet.getCell(`E${currentRowIndex}`);
    sumNote.value = `Kirim: ${formatMoney(totalIncome)} | Chiqim: ${formatMoney(totalExpense)}`;
    sumNote.alignment = { horizontal: 'center', vertical: 'middle' };
    sumNote.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFFFFFFF' } };

    summaryRow.height = 26;
    summaryRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF37474F' }
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF78909C' } },
        right: { style: 'thin', color: { argb: 'FF78909C' } }
      };
    });
  }

  // ==========================================
  // 2-VAROQ: KATEGORIYALAR TAHLILI
  // ==========================================
  const catSheet = workbook.addWorksheet('Kategoriyalar Tahlili', {
    views: [{ showGridLines: true }]
  });

  catSheet.columns = [
    { key: 'cat', width: 26 },
    { key: 'count', width: 14 },
    { key: 'sum', width: 22 },
    { key: 'share', width: 14 }
  ];

  // Chiqimlar sarlavhasi
  catSheet.mergeCells('A1:D1');
  const expCatHeader = catSheet.getCell('A1');
  expCatHeader.value = 'CHIQIMLAR BO\'YICHA TAQSIMOT (XARAJATLAR)';
  expCatHeader.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  expCatHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  expCatHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC62828' } };
  catSheet.getRow(1).height = 28;

  catSheet.getRow(2).values = ['Kategoriya', 'Amallar soni', 'Jami Summa', 'Ulush (%)'];
  catSheet.getRow(2).height = 22;
  catSheet.getRow(2).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF455A64' } };
  });

  let catRowIdx = 3;
  if (categoryExpenses.length === 0) {
    catSheet.mergeCells(`A${catRowIdx}:D${catRowIdx}`);
    catSheet.getCell(`A${catRowIdx}`).value = "Chiqimlar mavjud emas";
    catSheet.getCell(`A${catRowIdx}`).alignment = { horizontal: 'center' };
    catRowIdx++;
  } else {
    categoryExpenses.forEach(item => {
      const row = catSheet.getRow(catRowIdx);
      const share = totalExpense > 0 ? (item.total_amount / totalExpense) : 0;
      row.values = [
        item.category,
        item.count,
        Number(item.total_amount),
        share
      ];
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(3).numFmt = '#,##0 "so\'m"';
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(4).numFmt = '0.0%';

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
      catRowIdx++;
    });
  }

  // Kirimlar sarlavhasi
  catRowIdx += 2;
  catSheet.mergeCells(`A${catRowIdx}:D${catRowIdx}`);
  const incCatHeader = catSheet.getCell(`A${catRowIdx}`);
  incCatHeader.value = 'KIRIMLAR BO\'YICHA TAQSIMOT (DAROMADLAR)';
  incCatHeader.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  incCatHeader.alignment = { horizontal: 'center', vertical: 'middle' };
  incCatHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
  catSheet.getRow(catRowIdx).height = 28;
  catRowIdx++;

  catSheet.getRow(catRowIdx).values = ['Kategoriya', 'Amallar soni', 'Jami Summa', 'Ulush (%)'];
  catSheet.getRow(catRowIdx).height = 22;
  catSheet.getRow(catRowIdx).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF455A64' } };
  });
  catRowIdx++;

  if (categoryIncomes.length === 0) {
    catSheet.mergeCells(`A${catRowIdx}:D${catRowIdx}`);
    catSheet.getCell(`A${catRowIdx}`).value = "Kirimlar mavjud emas";
    catSheet.getCell(`A${catRowIdx}`).alignment = { horizontal: 'center' };
    catRowIdx++;
  } else {
    categoryIncomes.forEach(item => {
      const row = catSheet.getRow(catRowIdx);
      const share = totalIncome > 0 ? (item.total_amount / totalIncome) : 0;
      row.values = [
        item.category,
        item.count,
        Number(item.total_amount),
        share
      ];
      row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(3).numFmt = '#,##0 "so\'m"';
      row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(4).numFmt = '0.0%';

      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
      catRowIdx++;
    });
  }

  // Faylni bufer sifatida qaytarish
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generateExcelReport
};
