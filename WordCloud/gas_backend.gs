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
  // 原有社群與平台
  'LINE官方帳號': ['line官方', 'line oa', 'line帳號', 'line官方帳號', 'line@'],
  'LINE群組':     ['line群', 'line群組', 'line社群'],
  'LINE VOOM':    ['voom', 'line voom', 'line貼文'],
  'FB粉專':       ['fb粉專', '臉書粉專', 'facebook粉專', '粉絲專頁', '粉專', 'fb粉絲'],
  'FB社團':       ['fb社團', '臉書社團', 'facebook社團'],
  'Instagram':    ['ig', 'instagram', 'ig帳號', 'ig貼文'],
  'Threads':      ['threads', 'thread'],
  'Podcast':      ['podcast', '播客', '音頻節目', 'podcast節目'],
  'Discord':      ['discord', 'dc群'],
  'YouTube':      ['yt', 'youtube頻道', 'yt頻道', '訂閱頻道', 'youtube直播'],
  '短影音':       ['reels', 'shorts', 'tiktok', '抖音', '短視頻'],
  '社群媒體':     ['網路媒體', '數位媒體', '社群串聯', '各大平台'],
  '官網':         ['官方網站', '官網更新', '全新官網', '官網重作', '更好的官網', '網站', '網頁'],
  'APP':          ['應用程式', '手機應用', '懷恩堂app', '手機app', '手機程式'],
  
  // 聚會與崇拜
  '直播崇拜':     ['線上直播', '網路直播', '視訊崇拜', '線上崇拜', '線上禮拜', '崇拜直播'],
  '線上團契':     ['線上小組', '網路團契', '線上聚會', '線上團', '固定的線上'],
  '青年事工':     ['青少年', '年輕人', '青年崇拜', '青年聚會'],
  '兒童事工':     ['兒童主日學', '兒童聖經', '兒童課程', '兒童節目', '兒童崇拜', '兒童', '兒主'],
  '會議室系統':   ['視訊會議', '會議系統', '線上會議', '會議室', 'zoom', 'google meet'],
  '雲端佈道會':   ['線上佈道', '網路佈道', '線上福音聚會'],
  '跨國連線':     ['海外宣教', '海外會友', '全球連線'],
  '虛擬教會':     ['元宇宙', 'vr教會', 'vr聚會', '雲端教會'],
  
  // 牧養與內容
  '每日靈修':     ['靈修', '靈修材料', '每天靈修', '靈修內容', '靈修app', '靈修計畫', '默想'],
  '敬拜歌單':     ['數位詩歌', 'spotify', 'apple music', '詩歌清單', '敬拜詩歌'],
  '講道庫':       ['講道集', '講道錄影', '講道精華', '影音庫', '講道回放'],
  '見證集':       ['文字見證', '數位見證', '故事庫', '見證資料庫'],
  '圖卡':         ['圖卡', '金句圖', '長輩圖', '數位小卡', '經文圖'],
  '懶人包':       ['信仰知識', '圖解聖經', '圖文包'],
  '週報':         ['電子週報', '數位週報', '週刊', '電子報', '電子化週報', 'newsletter'],
  '讀經計畫':     ['一年讀經', '線上讀經', '讀經群組', '讀經打卡', '讀經app'],
  '線上裝備':     ['雲端神學院', '遠距教學', '線上上課', '線上課程'],
  '主日學教材':   ['數位兒主', '教案下載', '兒童素材', '家庭祭壇'],
  '數位門訓':     ['線上門訓', '一對一帶領', '線上帶領'],
  
  // 傳福音與關懷
  '電玩':         ['電玩主日', '遊戲宣教', '打機', '打電動', 'switch', 'ps5', '福音遊戲', '聖經遊戲'],
  '微電影':       ['見證短片', '福音短片', '信仰電影'],
  '慕道友專區':   ['新朋友', '初信造就', '認識信仰', '新朋友導覽'],
  '交友平台':     ['單身聯誼', '認識新朋友', '青年交友', '基督徒交友'],
  '線上探訪':     ['遠距關懷', '網路關懷', '視訊牧養'],
  '線上輔導':     ['心理諮商', '線上協談', '輔導信箱', '輔導室'],
  '長輩教學':     ['樂齡科技', '教老人', '消弭數位落差', '長者數位'],
  '屬靈同伴':     ['線上找同伴', '守望群組', '配對'],
  '禱告':         ['代禱', '禱告室', '禱告牆', '禱告鏈', '守望禱告', '連鎖禱告'],
  
  // 行政與系統
  '線上奉獻':     ['數位奉獻', '電子奉獻', '網路奉獻', '線上捐款', '奉獻收據', '報稅整合'],
  '報名系統':     ['營會報名', '課程報名', '活動報名', '線上報名'],
  '簽到系統':     ['點名系統', '線上簽到', '電子點名', 'qr code簽到'],
  '會友系統':     ['會籍資料', '通訊錄', '會友名單', '數位會籍'],
  '場地預約':     ['線上租借', '空間借用', '場地借用'],
  '社群':         ['社群', '網路社群', '社團', '交友平台'],
  '行事曆':       ['google calendar', '時間表', '聚會時間', '日曆整合'],
  '聊天機器人':   ['chatbot', '自動回覆', 'ai客服', '智能客服'],
  '信仰疑難雜症': ['信仰疑難雜症', '疑難雜症', '信仰問題', 'qa提問', '信仰問答', '線上解答'],
  '服事招募':     ['線上服事', '志工招募', '數位媒合', '人力招募'],
  '推播通知':     ['app推播', '聚會提醒', '重要通知'],
  '雲端硬碟':     ['資料共享', '同工資料', '教材存放'],
  '單一登入':     ['帳號統一', '整合平台', '系統整合'],
  '數據分析':     ['人數統計', '流量分析'],
  '資安防護':     ['個資保護', '隱私安全', '資料備份', '網路安全', '兒少上網'],
  
  // 視覺與優化
  '介面美化':     ['ui/ux', '排版好看', '視覺美感', '設計美學', '質感提升'],
  'SEO優化':      ['網頁搜尋', '讓別人搜到', '提高曝光', '搜尋引擎'],
  '多國語言':     ['即時字幕', '英文翻譯', 'ai翻譯', '雙語服務']
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
