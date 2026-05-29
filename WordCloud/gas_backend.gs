/**
 * 懷恩堂差傳年會：即時字雲系統 v2
 * Google Apps Script 後端
 * - 支援主題詞典語意合併
 * - 支援按讚 / 取消讚
 * - 支援公開留言牆（依讚數排序）
 * - 所有通訊使用 GET + JSONP 繞過 Workspace CORS 限制
 */

const SPREADSHEET_ID = '1EqEO2DajtqKxqzOeJHL5nuhpSS26zqPLk9oAqZqT-MU';
const SHEET_NAME = 'wordcloud';

// ══════════════════════════════════════
//  主題詞典：將相似意圖合併為標準詞
// ══════════════════════════════════════
const THEME_DICT = {
  'LINE官方帳號': ['line官方', 'line oa', 'line帳號', 'line官方帳號', 'line@'],
  'LINE群組':     ['line群', 'line群組', 'line社群'],
  'LINE VOOM':    ['voom', 'line voom', 'line貼文'],
  'FB粉專':       ['fb粉專', '臉書粉專', 'facebook粉專', '粉絲專頁', '粉專', 'fb粉絲'],
  'FB社團':       ['fb社團', '臉書社團', 'facebook社團'],
  'Instagram':    ['ig', 'instagram', 'ig帳號', 'ig貼文'],
  'Threads':      ['threads', 'thread'],
  'Podcast':      ['podcast', '播客', '音頻節目', 'podcast節目'],
  'Discord':      ['discord', 'dc群'],
  '每日靈修':     ['靈修', '靈修材料', '每天靈修', '靈修內容', '靈修app', '靈修計畫'],
  '官網':         ['官方網站', '官網更新', '全新官網', '官網重作', '更好的官網', '網站', '網頁'],
  'APP':          ['應用程式', '手機應用', '懷恩堂app', '手機app', '手機程式'],
  '週報':         ['電子週報', '數位週報', '週刊', '電子報', '電子化週報'],
  '兒童事工':     ['兒童主日學', '兒童聖經', '兒童課程', '兒童節目', '兒童崇拜', '兒童'],
  '直播崇拜':     ['線上直播', '直播崇拜', '網路直播', '視訊崇拜', '線上崇拜', '線上禮拜'],
  '線上團契':     ['線上小組', '網路團契', '線上聚會', '固定的線上', '線上團'],
  '青年事工':     ['青少年', '年輕人', '青年崇拜', '青年事工'],
  '線上奉獻':     ['數位奉獻', '電子奉獻', '網路奉獻', '線上捐款', '線上奉'],
  '禱告':         ['代禱', '禱告室', '禱告牆', '禱告鏈', '守望禱告'],
  '社群媒體':     ['社群媒體', '網路媒體', '數位媒體'],
  '會議室系統':   ['視訊會議', '會議系統', '線上會議', '會議室'],
};

// ══════════════════════════════════════
//  停用詞：清除無意義的語助詞
// ══════════════════════════════════════
const STOP_WORDS = [
  '的', '了', '是', '在', '有', '和', '與', '或', '也', '都', '很', '更', '能', '讓',
  '要', '想', '可以', '希望', '能夠', '應該', '可能', '就是', '一個', '一些', '這樣',
  '那樣', '什麼', '如何', '謝謝', '感謝', '請問', '不知道', '覺得', '如果', '會',
  '做', '用', '給', '到', '說', '去', '來', '對', '把', '被', '為', '以', '因',
  '所', '但', '而', '就', '才', '又', '再', '還', '已', '啊', '呢', '嗎', '吧',
  '哦', '嗯', '沒有', '這個', '那個', '能有', '能讓', '希望能', '希望有',
  '希望可以', '固定的', '更好的', '全新的', '可以有', '可以讓', '聚會模式',
];

// ══════════════════════════════════════
//  關鍵詞擷取（無 AI，純規則）
// ══════════════════════════════════════
function extractKeywords(text) {
  if (!text || text.trim() === '') return [];

  const keywords = new Set();
  const norm = text.toLowerCase().replace(/\s+/g, '');

  // 第一層：主題詞典比對（優先）
  for (const theme in THEME_DICT) {
    if (norm.includes(theme.toLowerCase())) {
      keywords.add(theme);
      continue;
    }
    const synonyms = THEME_DICT[theme];
    for (let j = 0; j < synonyms.length; j++) {
      if (norm.includes(synonyms[j].toLowerCase())) {
        keywords.add(theme);
        break;
      }
    }
  }

  // 第二層：若詞典無命中，做停用詞移除後取剩餘片段
  if (keywords.size === 0) {
    let remaining = text;
    STOP_WORDS.forEach(function(sw) {
      remaining = remaining.split(sw).join('');
    });
    remaining = remaining.replace(/[，。！？、！\s]/g, '').trim();
    if (remaining.length >= 2) {
      keywords.add(remaining.substring(0, Math.min(remaining.length, 7)));
    }
  }

  return Array.from(keywords);
}

// ══════════════════════════════════════
//  主要 API 路由
// ══════════════════════════════════════
function doGet(e) {
  let result;
  try {
    const action = e.parameter.action;
    if (action === 'add')    result = handleAdd(e.parameter);
    else if (action === 'delete') result = handleDelete(e.parameter);
    else if (action === 'like')   result = handleLike(e.parameter);
    else                          result = handleFetch(e.parameter.uuid || '');
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }

  const cb = e.parameter.callback;
  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + JSON.stringify(result) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── 新增留言 ──────────────────────────
function handleAdd(params) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const uuid = params.uuid;
    const text = params.text;
    if (!uuid || !text) throw new Error('Missing uuid or text');

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found');

    const keywords = extractKeywords(text);
    const rowId = Date.now().toString();

    // 欄位：Timestamp | UUID | RowID | OriginalText | Keywords | Status | LikeCount | LikedByUUIDs
    sheet.appendRow([new Date(), uuid, rowId, text, keywords.join(','), 'Active', 0, '']);

    return { status: 'success', keywords: keywords, rowId: rowId };
  } finally {
    lock.releaseLock();
  }
}

// ── 刪除留言 ──────────────────────────
function handleDelete(params) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const uuid = params.uuid;
    const rowId = params.rowId;
    if (!uuid || !rowId) throw new Error('Missing uuid or rowId');

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][2]) === String(rowId) && data[i][1] === uuid && data[i][5] === 'Active') {
        sheet.getRange(i + 1, 6).setValue('Deleted');
        return { status: 'success' };
      }
    }
    return { status: 'error', message: 'Not found or unauthorized' };
  } finally {
    lock.releaseLock();
  }
}

// ── 按讚 / 取消讚 ──────────────────────
function handleLike(params) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const uuid = params.uuid;
    const rowId = params.rowId;
    if (!uuid || !rowId) throw new Error('Missing uuid or rowId');

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][2]) === String(rowId) && data[i][5] === 'Active') {
        const likedByStr = data[i][7] || '';
        const likedBy = likedByStr ? likedByStr.split(',') : [];
        const alreadyLiked = likedBy.indexOf(uuid) !== -1;

        let newLikedBy, newLikeCount;
        if (alreadyLiked) {
          newLikedBy = likedBy.filter(function(id) { return id !== uuid; });
          newLikeCount = Math.max(0, (Number(data[i][6]) || 0) - 1);
        } else {
          likedBy.push(uuid);
          newLikedBy = likedBy;
          newLikeCount = (Number(data[i][6]) || 0) + 1;
        }

        sheet.getRange(i + 1, 7).setValue(newLikeCount);
        sheet.getRange(i + 1, 8).setValue(newLikedBy.join(','));

        return { status: 'success', liked: !alreadyLiked, likeCount: newLikeCount };
      }
    }
    return { status: 'error', message: 'Submission not found' };
  } finally {
    lock.releaseLock();
  }
}

// ── 取得全部留言 + 字雲資料 ────────────
function handleFetch(myUuid) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet not found');

  const data = sheet.getDataRange().getValues();
  const submissions = [];
  const keywordScores = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[5] !== 'Active') continue;

    const likedByStr = row[7] || '';
    const likedBy = likedByStr ? likedByStr.split(',') : [];
    const likeCount = Number(row[6]) || 0;
    const keywordsRaw = row[4] || '';
    const keywords = keywordsRaw ? keywordsRaw.split(',') : [];

    submissions.push({
      rowId:    String(row[2]),
      text:     row[3],
      keywords: keywords,
      likeCount: likeCount,
      isMine:   row[1] === myUuid,
      isLiked:  likedBy.indexOf(myUuid) !== -1
    });

    // 字雲大小 = 出現次數 + 讚數（確保有出現就可見）
    keywords.forEach(function(kw) {
      if (kw) {
        keywordScores[kw] = (keywordScores[kw] || 0) + 1 + likeCount;
      }
    });
  }

  // 依讚數由高到低排序
  submissions.sort(function(a, b) { return b.likeCount - a.likeCount; });

  // 字雲資料格式：[[keyword, score], ...]
  const cloudData = Object.keys(keywordScores).map(function(k) {
    return [k, keywordScores[k]];
  });
  cloudData.sort(function(a, b) { return b[1] - a[1]; });

  return { status: 'success', submissions: submissions, cloudData: cloudData };
}

// ── 阻擋 POST ──────────────────────────
function doPost(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'error', message: '請使用 GET + JSONP 通訊' }))
    .setMimeType(ContentService.MimeType.JSON);
}
