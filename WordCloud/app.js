// ══════════════════════════════════════
//  字雲社群回饋系統 v8 前端邏輯
//  - JSONP 通訊（繞過 Google Workspace CORS）
//  - 字雲點擊篩選留言
//  - 按讚 / 取消讚（樂觀更新）
//  - 30 秒輪詢
// ══════════════════════════════════════

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz5m04F8XoCj58iJheuF9e3HniHmMuwPymnAQEYDexZuxR5Kv7fntCJVG5lrovLPzR8fA/exec';
const VERSION = 'v10';

// ── 裝置 UUID ──────────────────────────
let deviceUUID = localStorage.getItem('device_uuid');
if (!deviceUUID) {
  deviceUUID = 'uuid_' + Math.random().toString(36).substr(2, 12);
  localStorage.setItem('device_uuid', deviceUUID);
}

// ── 狀態 ───────────────────────────────
let allSubmissions   = [];   // 完整留言列表
let currentCloudData = [];   // 字雲資料
let activeFilter     = null; // 目前篩選的關鍵字

// ── DOM 參照 ───────────────────────────
const inputEl      = document.getElementById('keyword-input');
const submitBtn    = document.getElementById('submit-btn');
const feedList     = document.getElementById('feed-list');
const feedMeta     = document.getElementById('feed-meta');
const filterBadge  = document.getElementById('filter-badge');
const filterLabel  = document.getElementById('filter-label');
const canvas       = document.getElementById('word-cloud');
const cloudContainer = document.getElementById('cloud-container');
const cloudEmpty   = document.getElementById('cloud-empty');

// ── 版本標記 ───────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  createToast();
});

function createToast() {
  const t = document.createElement('div');
  t.id = 'toast';
  document.body.appendChild(t);
}

// ══════════════════════════════════════
//  JSONP 通訊核心
// ══════════════════════════════════════
function fetchJSONP(url) {
  return new Promise(function(resolve, reject) {
    const cbName = 'jsonp_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
    let script;

    window[cbName] = function(data) {
      delete window[cbName];
      if (script && script.parentNode) script.parentNode.removeChild(script);
      resolve(data);
    };

    const u = new URL(url);
    u.searchParams.set('callback', cbName);

    script = document.createElement('script');
    script.src = u.toString();
    script.onerror = function() {
      delete window[cbName];
      if (script && script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('JSONP 載入失敗'));
    };
    document.body.appendChild(script);
  });
}

// ══════════════════════════════════════
//  API 呼叫封裝
// ══════════════════════════════════════
function apiCall(params) {
  const u = new URL(GAS_API_URL);
  u.searchParams.set('uuid', deviceUUID);
  Object.keys(params).forEach(function(k) { u.searchParams.set(k, params[k]); });
  return fetchJSONP(u.toString());
}

// ══════════════════════════════════════
//  主流程：送出留言
// ══════════════════════════════════════
async function submitKeyword() {
  const text = inputEl.value.trim();
  if (!text) return;

  submitBtn.disabled = true;
  submitBtn.textContent = '發送中...';

  try {
    const res = await apiCall({ action: 'add', text: text });
    if (res.status === 'success') {
      inputEl.value = '';
      const kws = (res.keywords || []).join('、');
      showToast('✅ 已送出！擷取關鍵詞：' + (kws || text));
      await fetchData(); // 立即重整
    } else {
      showToast('⚠️ 送出失敗：' + res.message);
    }
  } catch (e) {
    showToast('⚠️ 連線異常：' + e.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '發送';
  }
}

// ══════════════════════════════════════
//  按讚 / 取消讚
// ══════════════════════════════════════
async function toggleLike(rowId) {
  // 找到對應留言做樂觀更新
  const sub = allSubmissions.find(function(s) { return s.rowId === rowId; });
  if (!sub) return;

  const wasLiked = sub.isLiked;
  sub.isLiked = !wasLiked;
  sub.likeCount = wasLiked ? Math.max(0, sub.likeCount - 1) : sub.likeCount + 1;
  updateCardUI(rowId, sub.isLiked, sub.likeCount);

  try {
    const res = await apiCall({ action: 'like', rowId: rowId });
    if (res.status !== 'success') {
      // 還原樂觀更新
      sub.isLiked = wasLiked;
      sub.likeCount = wasLiked ? sub.likeCount + 1 : Math.max(0, sub.likeCount - 1);
      updateCardUI(rowId, sub.isLiked, sub.likeCount);
    }
  } catch (e) {
    sub.isLiked = wasLiked;
    sub.likeCount = wasLiked ? sub.likeCount + 1 : Math.max(0, sub.likeCount - 1);
    updateCardUI(rowId, sub.isLiked, sub.likeCount);
  }
}

function updateCardUI(rowId, isLiked, likeCount) {
  const btn = document.querySelector('[data-rowid="' + rowId + '"] .like-btn');
  if (!btn) return;
  btn.classList.toggle('liked', isLiked);
  btn.querySelector('.like-count').textContent = likeCount;
  btn.querySelector('.like-icon').textContent = isLiked ? '❤️' : '🤍';
}

// ══════════════════════════════════════
//  刪除留言
// ══════════════════════════════════════
async function deleteSubmission(rowId) {
  if (!confirm('確定要刪除這則期許嗎？')) return;
  try {
    const res = await apiCall({ action: 'delete', rowId: rowId });
    if (res.status === 'success') {
      allSubmissions = allSubmissions.filter(function(s) { return s.rowId !== rowId; });
      renderFeed();
      renderWordCloud();
    } else {
      showToast('⚠️ 刪除失敗：' + res.message);
    }
  } catch (e) {
    showToast('⚠️ 連線異常：' + e.message);
  }
}

// ══════════════════════════════════════
//  取得資料並刷新
// ══════════════════════════════════════
async function fetchData() {
  try {
    const res = await apiCall({});
    if (res.status === 'success') {
      allSubmissions   = res.submissions || [];
      currentCloudData = res.cloudData   || [];
      renderFeed();
      renderWordCloud();
    }
  } catch (e) {
    // 靜默失敗，等下次輪詢
    console.warn('fetch error:', e.message);
  }
}

// ══════════════════════════════════════
//  渲染：留言牆
// ══════════════════════════════════════
function renderFeed() {
  // 依讚數排序（本地）
  const sorted = allSubmissions.slice().sort(function(a, b) {
    return b.likeCount - a.likeCount;
  });

  let filtered = sorted;
  if (activeFilter) {
    filtered = sorted.filter(function(s) {
      return s.keywords && s.keywords.indexOf(activeFilter) !== -1;
    });
  }

  // 更新 meta
  const total = allSubmissions.length;
  const shown = filtered.length;
  feedMeta.textContent = activeFilter
    ? shown + ' 則相關 / 共 ' + total + ' 則'
    : '共 ' + total + ' 則';

  if (filtered.length === 0) {
    feedList.innerHTML = '<div class="feed-empty">' +
      (activeFilter ? '這個關鍵字目前還沒有相關期許' : '還沒有期許，趕快發送第一個吧！') +
      '</div>';
    return;
  }

  feedList.innerHTML = filtered.map(function(sub) {
    return renderCard(sub);
  }).join('');
}

function renderCard(sub) {
  const tagsHtml = (sub.keywords || []).map(function(kw) {
    return '<span class="card-tag" onclick="filterByKeyword(\'' +
      escapeAttr(kw) + '\')">' + escapeHtml(kw) + '</span>';
  }).join('');

  const likeIcon   = sub.isLiked ? '❤️' : '🤍';
  const likedClass = sub.isLiked ? 'liked' : '';
  const mineClass  = sub.isMine  ? 'is-mine' : '';

  const deleteBtn = sub.isMine
    ? '<button class="delete-card-btn" onclick="deleteSubmission(\'' + sub.rowId + '\')">刪除</button>'
    : '';

  const mineBadge = sub.isMine ? '<span class="is-mine-badge">⭐ 我的期許</span>' : '';

  return '<div class="feed-card ' + mineClass + '" data-rowid="' + sub.rowId + '">' +
    '<div class="card-main">' +
      '<p class="card-text">' + escapeHtml(sub.text) + mineBadge + '</p>' +
      (tagsHtml ? '<div class="card-tags">' + tagsHtml + '</div>' : '') +
    '</div>' +
    '<div class="card-side">' +
      '<button class="like-btn ' + likedClass + '" onclick="toggleLike(\'' + sub.rowId + '\')">' +
        '<span class="like-icon">' + likeIcon + '</span>' +
        '<span class="like-count">' + sub.likeCount + '</span>' +
        '<span> 讚</span>' +
      '</button>' +
      deleteBtn +
    '</div>' +
  '</div>';
}

// ══════════════════════════════════════
//  渲染：字雲
// ══════════════════════════════════════
function renderWordCloud() {
  // 先將 canvas 縮到最小，避免舊尺寸撐開父容器，影響測量
  canvas.width = 1;
  canvas.height = 1;
  
  const rect = cloudContainer.getBoundingClientRect();
  canvas.width  = rect.width  || 600;
  canvas.height = rect.height || 260;

  if (!currentCloudData || currentCloudData.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cloudEmpty.style.display = 'block';
    return;
  }
  cloudEmpty.style.display = 'none';

  // 計算最大分數以便正規化
  const maxScore = currentCloudData.reduce(function(m, d) { return Math.max(m, d[1]); }, 1);

  // 根據螢幕寬度自適應
  const isMobile = canvas.width < 500;
  const baseWeight = isMobile ? 15 : 30;
  const multiplier = isMobile ? 60 : 100;
  const grid = Math.round((isMobile ? 5 : 8) * canvas.width / 600);

  WordCloud(canvas, {
    list: currentCloudData,
    fontFamily: 'Noto Sans TC, sans-serif',
    weightFactor: function(size) {
      return baseWeight + (size / maxScore) * multiplier;
    },
    color: function(word) {
      // 篩選中的關鍵字高亮
      if (activeFilter && word === activeFilter) return '#e74c3c';
      const palette = ['#2C3E50', '#2980B9', '#16A085', '#8E44AD', '#E67E22'];
      // 使用字串 Hash 決定固定顏色，避免重繪時變色
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = word.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
    },
    rotateRatio: isMobile ? 0 : 0.1, // 手機完全不旋轉以節省空間
    backgroundColor: 'transparent',
    drawOutOfBound: false,
    shrinkToFit: true,
    gridSize: grid,
    click: function(item) {
      filterByKeyword(item[0]);
    },
    hover: function(item) {
      canvas.style.cursor = item ? 'pointer' : 'default';
    }
  });
}

// ══════════════════════════════════════
//  篩選功能
// ══════════════════════════════════════
function filterByKeyword(kw) {
  activeFilter = kw;
  filterLabel.textContent = kw;
  filterBadge.classList.add('active');
  renderFeed();
  renderWordCloud(); // 重繪以高亮選中詞
  // 滾動到留言牆
  document.getElementById('feed-section').scrollIntoView({ behavior: 'smooth' });
}

function clearFilter() {
  activeFilter = null;
  filterBadge.classList.remove('active');
  renderFeed();
  renderWordCloud();
}

// ══════════════════════════════════════
//  工具函數
// ══════════════════════════════════════
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { createToast(); t = document.getElementById('toast'); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 3500);
}

// ══════════════════════════════════════
//  事件綁定 & 初始化
// ══════════════════════════════════════
submitBtn.addEventListener('click', submitKeyword);
inputEl.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') submitKeyword();
});

let resizeTimeout;
let lastWidth = window.innerWidth;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    if (Math.abs(window.innerWidth - lastWidth) > 30) {
      lastWidth = window.innerWidth;
      if (currentCloudData.length > 0) renderWordCloud();
    }
  }, 300);
});

// 初始載入
fetchData();

// 30 秒輪詢
setInterval(fetchData, 30000);
