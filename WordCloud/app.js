// ══════════════════════════════════════
//  字雲社群回饋系統 v18 前端邏輯 (支援雙語)
//  - JSONP 通訊（繞過 Google Workspace CORS）
//  - 字雲點擊篩選留言
//  - 按讚 / 取消讚（樂觀更新）
//  - 30 秒輪詢
// ══════════════════════════════════════

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbz5m04F8XoCj58iJheuF9e3HniHmMuwPymnAQEYDexZuxR5Kv7fntCJVG5lrovLPzR8fA/exec';
const VERSION = 'v18';

// ── 多語系設定 ─────────────────────────
let currentLang = localStorage.getItem('action_lang') || 'zh';

const I18N = {
  zh: {
    'title': '你對懷恩堂數位事工的期待',
    'subtitle': '輸入簡短文字，為每份期盼作成新事工禱告',
    'cloud-empty': '還沒有期許，趕快發送第一個吧！',
    'feed-title': '💬 大家的期待',
    'submit-btn': '發送',
    'clear-filter': '✕ 清除篩選',
    'rotate-btn': '↻ 重整版面',
    'footer-copy1': 'e-gbc 2026差傳年會 數位事工禱告互動頁面',
    'footer-copy2': '如有疑問或建議，請聯絡資訊同工 嘉惠：',
    'feed-meta-all': '共 {total} 則',
    'feed-meta-filter': '{shown} 則相關 / 共 {total} 則',
    'feed-empty': '還沒有期許，趕快發送第一個吧！',
    'feed-empty-filter': '這個關鍵字目前還沒有相關期許',
    'btn-prev': '上一頁',
    'btn-next': '下一頁',
    'btn-delete': '刪除',
    'mine-badge': '⭐ 我的期許',
    'like-text': ' 讚',
    'confirm-delete': '確定要刪除這則期許嗎？',
    'toast-success': '✅ 已送出！擷取關鍵詞：',
    'toast-fail': '⚠️ 送出失敗：',
    'toast-error': '⚠️ 連線異常：',
    'toast-del-fail': '⚠️ 刪除失敗：',
    'btn-submitting': '發送中...',
    'input-placeholder': '輸入對數位事工的期許...'
  },
  en: {
    'title': 'Expectations for GBC Digital Ministry',
    'subtitle': 'Enter a short text to turn each expectation into a prayer',
    'cloud-empty': 'No expectations yet. Be the first to share!',
    'feed-title': '💬 Everyone\'s Expectations',
    'submit-btn': 'Send',
    'clear-filter': '✕ Clear Filter',
    'rotate-btn': '↻ Reload Layout',
    'footer-copy1': 'e-gbc 2026 Missions Conference Digital Ministry Interactive Page',
    'footer-copy2': 'For questions or suggestions, please contact IT coworker Jiahui: ',
    'feed-meta-all': 'Total {total}',
    'feed-meta-filter': '{shown} matches / Total {total}',
    'feed-empty': 'No expectations yet. Be the first to share!',
    'feed-empty-filter': 'No expectations found for this keyword.',
    'btn-prev': 'Prev',
    'btn-next': 'Next',
    'btn-delete': 'Delete',
    'mine-badge': '⭐ My Expectation',
    'like-text': ' Likes',
    'confirm-delete': 'Are you sure you want to delete this expectation?',
    'toast-success': '✅ Sent! Extracted keywords: ',
    'toast-fail': '⚠️ Send failed: ',
    'toast-error': '⚠️ Connection error: ',
    'toast-del-fail': '⚠️ Delete failed: ',
    'btn-submitting': 'Sending...',
    'input-placeholder': 'Enter your expectations...'
  }
};

function applyLanguage() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-TW' : 'en';
  
  const langBtn = document.getElementById('langToggleBtn');
  if(langBtn) langBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[currentLang][key]) {
      el.innerHTML = I18N[currentLang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (I18N[currentLang][key]) {
      el.setAttribute('placeholder', I18N[currentLang][key]);
    }
  });

  // 重新渲染依賴語言的動態組件
  if (allSubmissions.length > 0 || currentCloudData.length > 0) {
    renderFeed();
  }
}

// ── 裝置 UUID ──────────────────────────
let deviceUUID = localStorage.getItem('device_uuid');
if (!deviceUUID) {
  deviceUUID = 'uuid_' + Math.random().toString(36).substr(2, 12);
  localStorage.setItem('device_uuid', deviceUUID);
}

// ── 狀態 ───────────────────────────────
let allSubmissions   = [];   
let currentCloudData = [];   
let activeFilter     = null; 
let currentPage      = 1;
const ITEMS_PER_PAGE = 20;

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
  applyLanguage();
  
  // 語言切換按鈕事件
  const langToggleBtn = document.getElementById('langToggleBtn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // 阻止 header 的點擊重整
      currentLang = currentLang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('action_lang', currentLang);
      applyLanguage();
    });
  }
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
    let timer;

    window[cbName] = function(data) {
      clearTimeout(timer);
      delete window[cbName];
      if (script && script.parentNode) script.parentNode.removeChild(script);
      resolve(data);
    };

    timer = setTimeout(function() {
      delete window[cbName];
      if (script && script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('Timeout'));
    }, 15000);

    const u = new URL(url);
    u.searchParams.set('callback', cbName);

    script = document.createElement('script');
    script.src = u.toString();
    script.onerror = function() {
      delete window[cbName];
      if (script && script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('Network error'));
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
  submitBtn.textContent = I18N[currentLang]['btn-submitting'];

  try {
    const res = await apiCall({ action: 'add', text: text });
    if (res.status === 'success') {
      inputEl.value = '';
      const kws = (res.keywords || []).join('、');
      showToast(I18N[currentLang]['toast-success'] + (kws || text));
      await fetchData(); 
    } else {
      showToast(I18N[currentLang]['toast-fail'] + res.message);
    }
  } catch (e) {
    showToast(I18N[currentLang]['toast-error'] + e.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = I18N[currentLang]['submit-btn'];
  }
}

// ══════════════════════════════════════
//  按讚 / 取消讚
// ══════════════════════════════════════
async function toggleLike(rowId) {
  const sub = allSubmissions.find(function(s) { return s.rowId === rowId; });
  if (!sub) return;

  const wasLiked = sub.isLiked;
  sub.isLiked = !wasLiked;
  sub.likeCount = wasLiked ? Math.max(0, sub.likeCount - 1) : sub.likeCount + 1;
  updateCardUI(rowId, sub.isLiked, sub.likeCount);

  try {
    const res = await apiCall({ action: 'like', rowId: rowId });
    if (res.status !== 'success') {
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
  if (!confirm(I18N[currentLang]['confirm-delete'])) return;
  try {
    const res = await apiCall({ action: 'delete', rowId: rowId });
    if (res.status === 'success') {
      allSubmissions = allSubmissions.filter(function(s) { return s.rowId !== rowId; });
      renderFeed();
      renderWordCloud();
    } else {
      showToast(I18N[currentLang]['toast-del-fail'] + res.message);
    }
  } catch (e) {
    showToast(I18N[currentLang]['toast-error'] + e.message);
  }
}

// ══════════════════════════════════════
//  取得資料並刷新
// ══════════════════════════════════════
async function fetchData() {
  try {
    const res = await apiCall({});
    if (res.status === 'success') {
      allSubmissions = res.submissions || [];
      const newCloudData = res.cloudData || [];
      
      if (JSON.stringify(newCloudData) !== JSON.stringify(currentCloudData)) {
        currentCloudData = newCloudData;
        renderWordCloud();
      }
      renderFeed();
    }
  } catch (e) {
    console.warn('fetch error:', e.message);
  }
}

// ══════════════════════════════════════
//  渲染：留言牆
// ══════════════════════════════════════
function renderFeed() {
  const sorted = allSubmissions.slice().sort(function(a, b) {
    return b.likeCount - a.likeCount;
  });

  let filtered = sorted;
  if (activeFilter) {
    filtered = sorted.filter(function(s) {
      return s.keywords && s.keywords.indexOf(activeFilter) !== -1;
    });
  }

  const total = allSubmissions.length;
  const shown = filtered.length;
  
  if (activeFilter) {
    feedMeta.textContent = I18N[currentLang]['feed-meta-filter'].replace('{shown}', shown).replace('{total}', total);
  } else {
    feedMeta.textContent = I18N[currentLang]['feed-meta-all'].replace('{total}', total);
  }

  if (filtered.length === 0) {
    const emptyText = activeFilter ? I18N[currentLang]['feed-empty-filter'] : I18N[currentLang]['feed-empty'];
    feedList.innerHTML = '<div class="feed-empty">' + emptyText + '</div>';
    document.getElementById('feed-pagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  feedList.innerHTML = pageItems.map(function(sub) {
    return renderCard(sub);
  }).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('feed-pagination');
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  
  container.innerHTML = 
    '<button class="page-btn" ' + prevDisabled + ' onclick="changePage(-1)">' + I18N[currentLang]['btn-prev'] + '</button>' +
    '<span class="page-info">' + currentPage + ' / ' + totalPages + '</span>' +
    '<button class="page-btn" ' + nextDisabled + ' onclick="changePage(1)">' + I18N[currentLang]['btn-next'] + '</button>';
}

window.changePage = function(delta) {
  currentPage += delta;
  renderFeed();
  document.getElementById('feed-section').scrollIntoView({ behavior: 'smooth' });
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
    ? '<button class="delete-card-btn" onclick="deleteSubmission(\'' + sub.rowId + '\')">' + I18N[currentLang]['btn-delete'] + '</button>'
    : '';

  const mineBadge = sub.isMine ? '<span class="is-mine-badge">' + I18N[currentLang]['mine-badge'] + '</span>' : '';

  return '<div class="feed-card ' + mineClass + '" data-rowid="' + sub.rowId + '">' +
    '<div class="card-main">' +
      '<p class="card-text">' + escapeHtml(sub.text) + mineBadge + '</p>' +
      (tagsHtml ? '<div class="card-tags">' + tagsHtml + '</div>' : '') +
    '</div>' +
    '<div class="card-side">' +
      '<button class="like-btn ' + likedClass + '" onclick="toggleLike(\'' + sub.rowId + '\')">' +
        '<span class="like-icon">' + likeIcon + '</span>' +
        '<span class="like-count">' + sub.likeCount + '</span>' +
        '<span>' + I18N[currentLang]['like-text'] + '</span>' +
      '</button>' +
      deleteBtn +
    '</div>' +
  '</div>';
}

// ══════════════════════════════════════
//  渲染：字雲
// ══════════════════════════════════════
function renderWordCloud() {
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

  const maxScore = currentCloudData.reduce(function(m, d) { return Math.max(m, d[1]); }, 1);
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
      if (activeFilter && word === activeFilter) return '#e74c3c';
      const palette = ['#2C3E50', '#2980B9', '#16A085', '#8E44AD', '#E67E22'];
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = word.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
    },
    rotateRatio: isMobile ? 0 : 0.1, 
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
  currentPage = 1;
  filterLabel.textContent = kw;
  filterBadge.classList.add('active');
  renderFeed();
  document.getElementById('feed-section').scrollIntoView({ behavior: 'smooth' });
}

window.clearFilter = function() {
  activeFilter = null;
  currentPage = 1;
  filterBadge.classList.remove('active');
  renderFeed();
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
let currentOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    if (newOrientation !== currentOrientation) {
      currentOrientation = newOrientation;
      const btn = document.getElementById('rotate-reload-btn');
      if (btn) btn.style.display = 'block';
    }
  }, 300);
});

const urlParams = new URLSearchParams(window.location.search);
const isStatic = urlParams.get('static') === 'true';

fetchData();
if (!isStatic) {
  setInterval(fetchData, 30000);
}
