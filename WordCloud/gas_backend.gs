/**
 * 部署指引：
 * 1. 在 Google Drive 建立一個新的 Google 試算表。
 * 2. 點擊選單「擴充功能」 > 「Apps Script」。
 * 3. 將本檔案的所有程式碼貼上並覆蓋預設程式碼。
 * 4. 點擊「部署」 > 「新增部署作業」 (⚠️ 每次修改程式碼，一定要選「新增」，不能只存檔！)。
 * 5. 類型選擇「網頁應用程式 (Web App)」。
 * 6. 「執行身分」設定為「我」。
 * 7. 「誰可以存取」設定為「所有人 (Anyone)」。
 * 8. 部署後，複製產生的「網頁應用程式 URL」，將其貼到 app.js 的 GAS_API_URL 變數中。
 */

const SPREADSHEET_ID = '1EqEO2DajtqKxqzOeJHL5nuhpSS26zqPLk9oAqZqT-MU';
const SHEET_NAME = 'wordcloud'; 

function setupSheet() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (sheet) {
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'UUID', 'Keyword', 'Status']);
    }
  }
}

// 為了徹底避開瀏覽器的 POST CORS 阻擋，我們將所有操作整合到 doGet，透過 URL 參數傳遞
function doGet(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet not found");

    const action = e.parameter.action;

    // 處理寫入或刪除操作
    if (action === 'add' || action === 'delete') {
      const uuid = e.parameter.uuid;
      const keyword = e.parameter.keyword;

      const lock = LockService.getScriptLock();
      if (!lock.tryLock(10000)) {
        return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'System busy' })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
      }

      try {
        if (action === 'add') {
          sheet.appendRow([new Date(), uuid, keyword, 'Active']);
        } else if (action === 'delete') {
          const data = sheet.getDataRange().getValues();
          for (let i = data.length - 1; i >= 1; i--) {
            if (data[i][1] === uuid && data[i][2] === keyword && data[i][3] === 'Active') {
              sheet.getRange(i + 1, 4).setValue('Deleted');
              break;
            }
          }
        }
        return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
      } finally {
        lock.releaseLock();
      }
    }

    // 若沒有 action，則為讀取資料操作
    const data = sheet.getDataRange().getValues();
    const wordCounts = {};
    for (let i = 1; i < data.length; i++) {
      if (data[i][3] === 'Active') {
        const keyword = data[i][2];
        wordCounts[keyword] = (wordCounts[keyword] || 0) + 1;
      }
    }

    const wordsArray = Object.keys(wordCounts).map(word => [word, wordCounts[word] * 10]);
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: wordsArray })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON).setHeaders(headers);
  }
}
