// ============================================================
// 宣教六法評估 — Google Apps Script
// 貼到 https://script.google.com 並部署為 Web App
// ============================================================

const SPREADSHEET_ID = '1BzGZlEjSI_M7b3GuAZnwkCkDdNyNOs3A6c-gCyDZRhY';
const SHEET_NAME = 'Sheet1'; // 若工作表名稱不同請修改

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    // 若第一列是空的，先寫標題列
    if (sheet.getLastRow() === 0) {
      const headers = [
        '時間戳記', '題目1(快速)', '題目2(快速)',
        '詳細Q1-學習', '詳細Q2-禱告', '詳細Q3-差派',
        '詳細Q4-歡迎', '詳細Q5-動員', '詳細Q6-學習',
        '詳細Q7-禱告', '詳細Q8-差派', '詳細Q9-歡迎',
        '詳細Q10-動員','詳細Q11-出去','詳細Q12-出去'
      ];
      sheet.appendRow(headers);
    }

    // 組合資料列
    const row = [
      data.timecode,
      data.q1 || '未作答',
      data.q2 || '未作答',
      ...( data.details || Array(12).fill('未作答') )
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 測試用（在 Apps Script 編輯器直接執行）
function testWrite() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        timecode: new Date().toLocaleString('zh-TW'),
        q1: 'A',
        q2: 'C',
        details: ['5','3','2','4','1','5','3','2','4','1','3','2']
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
