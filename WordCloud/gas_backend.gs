/**
 * 懷恩堂差傳年會：即時字雲系統 (Google Apps Script 後端) - JSONP 最終突破版
 * 
 * 部署指引：
 * 1. 在 Google Drive 建立一個新的 Google 試算表。
 * 2. 點擊選單「擴充功能」 > 「Apps Script」。
 * 3. 將本檔案的所有程式碼貼上並覆蓋預設程式碼。
 * 4. 點擊「部署」 > 「新增部署作業」。
 * 5. 類型選擇「網頁應用程式」。
 * 6. 執行身分選擇「我」。
 * 7. 誰可以存取選擇「所有人」。
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

function doGet(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); 

  let result = {
    status: 'error',
    message: 'Unknown error',
    data: null
  };

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet not found");

    const action = e.parameter.action;
    
    if (action === 'add') {
      const uuid = e.parameter.uuid;
      const keyword = e.parameter.keyword;
      if (!uuid || !keyword) throw new Error("Missing uuid or keyword");

      sheet.appendRow([new Date(), uuid, keyword, 'Active']);
      result = { status: 'success', message: 'Keyword added' };
      
    } else if (action === 'delete') {
      const uuid = e.parameter.uuid;
      const keyword = e.parameter.keyword;
      if (!uuid || !keyword) throw new Error("Missing uuid or keyword");

      const data = sheet.getDataRange().getValues();
      let deleted = false;
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][1] === uuid && data[i][2] === keyword && data[i][3] === 'Active') {
          sheet.getRange(i + 1, 4).setValue('Deleted');
          deleted = true;
          break; 
        }
      }
      
      if (deleted) {
        result = { status: 'success', message: 'Keyword deleted' };
      } else {
        result = { status: 'error', message: 'Keyword not found or unauthorized' };
      }

    } else {
      const data = sheet.getDataRange().getValues();
      const wordCounts = {};

      for (let i = 1; i < data.length; i++) {
        if (data[i][3] === 'Active') {
          const keyword = data[i][2];
          wordCounts[keyword] = (wordCounts[keyword] || 0) + 1;
        }
      }

      const formattedData = Object.keys(wordCounts).map(key => [key, wordCounts[key]]);
      result = { status: 'success', data: formattedData };
    }

  } catch (error) {
    result = { status: 'error', message: error.toString() };
  } finally {
    lock.releaseLock();
  }

  // 支援 JSONP 輸出以徹底繞過 CORS
  const callback = e.parameter.callback;
  if (callback) {
    return ContentService.createTextOutput(`${callback}(${JSON.stringify(result)})`)
                         .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// 阻擋 POST 請求，提示改用 GET
function doPost(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: '本系統為避免 CORS 阻擋，已全面改為 GET 與 JSONP 通訊，請勿發送 POST 請求。'
  })).setMimeType(ContentService.MimeType.JSON);
}
