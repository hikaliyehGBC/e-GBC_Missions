/**
 * 部署指引：
 * 1. 在 Google Drive 建立一個新的 Google 試算表。
 * 2. 點擊選單「擴充功能」 > 「Apps Script」。
 * 3. 將本檔案的所有程式碼貼上並覆蓋預設程式碼。
 * 4. 點擊「部署」 > 「新增部署作業」。
 * 5. 類型選擇「網頁應用程式 (Web App)」。
 * 6. 「執行身分」設定為「我」。
 * 7. 「誰可以存取」設定為「所有人 (Anyone)」。
 * 8. 部署後，複製產生的「網頁應用程式 URL」，將其貼到 app.js 的 GAS_API_URL 變數中。
 */

const SHEET_NAME = 'Sheet1';

function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (sheet) {
    // 初始化標題
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'UUID', 'Keyword', 'Status']);
    }
  }
}

function doPost(e) {
  // 建立跨域回應標頭
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action; // 'add' or 'delete'
    const uuid = payload.uuid;
    const keyword = payload.keyword;

    // 取得鎖定，處理並行 200 人的請求
    const lock = LockService.getScriptLock();
    // 等待最多 10 秒
    if (!lock.tryLock(10000)) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'System busy, please try again.' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }

    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error("Sheet not found");

      if (action === 'add') {
        sheet.appendRow([new Date(), uuid, keyword, 'Active']);
      } else if (action === 'delete') {
        // 從下往上找，找到最新的一筆相符資料標記為 Deleted
        const data = sheet.getDataRange().getValues();
        for (let i = data.length - 1; i >= 1; i--) { // i=0 是標題列
          if (data[i][1] === uuid && data[i][2] === keyword && data[i][3] === 'Active') {
            sheet.getRange(i + 1, 4).setValue('Deleted');
            break; // 每次只刪除一筆
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);

    } finally {
      // 無論如何都要釋放鎖定
      lock.releaseLock();
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

function doGet(e) {
  // 處理 GET 請求，回傳字頻統計
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet not found");

    const data = sheet.getDataRange().getValues();
    const wordCounts = {};

    // 統計 Active 的關鍵字
    for (let i = 1; i < data.length; i++) {
      const status = data[i][3];
      if (status === 'Active') {
        const keyword = data[i][2];
        if (wordCounts[keyword]) {
          wordCounts[keyword]++;
        } else {
          wordCounts[keyword] = 1;
        }
      }
    }

    // 轉換為 wordcloud2.js 需要的格式: [['word', weight], ...]
    const wordsArray = Object.keys(wordCounts).map(word => [word, wordCounts[word] * 10]); // 放大權重，讓字夠大

    return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: wordsArray }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// 處理 CORS 預檢請求
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}
