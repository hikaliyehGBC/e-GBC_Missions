// 請在此處填寫您部署 Google Apps Script 後取得的 Web App URL
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbyGO3OWxQPMTFBPqdKdiq40Q9VSq9jFjkO6ALGyULxS9uSamhm2C1hSKNsAPxkI9j_kEA/exec';

// 取得或產生裝置 UUID
let deviceUUID = localStorage.getItem('device_uuid');
if (!deviceUUID) {
    deviceUUID = 'uuid_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_uuid', deviceUUID);
}

// 取得本地歷史紀錄
let historyList = JSON.parse(localStorage.getItem('historyList') || '[]');

const inputEl = document.getElementById('keyword-input');
const submitBtn = document.getElementById('submit-btn');
const historyUl = document.getElementById('history-list');
const canvas = document.getElementById('word-cloud');
const cloudContainer = document.getElementById('cloud-container');
const loadingEl = document.getElementById('loading');

let wordCloudData = [];

// 初始化
function init() {
    renderHistory();
    fetchWordCloudData();
    // 設定每 10 秒自動更新一次字雲，減少伺服器壓力
    setInterval(fetchWordCloudData, 10000);

    // 監聽螢幕旋轉或視窗大小改變，重新繪製字雲
    window.addEventListener('resize', () => {
        if (wordCloudData.length > 0) {
            renderWordCloud();
        }
    });
    
    // 顯示版本更新確認碼
    setTimeout(() => {
        const title = document.querySelector('h1');
        if (title) title.innerHTML += ' <span style="font-size: 0.5em; color: #ffeb3b;">(v7)</span>';
    }, 500);
}

// 渲染歷史紀錄列表
function renderHistory() {
    historyUl.innerHTML = '';
    historyList.forEach((keyword, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const textSpan = document.createElement('span');
        textSpan.textContent = keyword;

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '刪除';
        delBtn.onclick = () => deleteKeyword(keyword, index);

        li.appendChild(textSpan);
        li.appendChild(delBtn);
        historyUl.appendChild(li);
    });
}

// 核心 JSONP 通訊函數 (破解 CORS)
function fetchJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        
        // 綁定全域回呼函數
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };
        
        // 將 callback 參數附加到網址
        const finalUrl = new URL(url);
        finalUrl.searchParams.append('callback', callbackName);

        // 建立並插入 script 標籤
        const script = document.createElement('script');
        script.src = finalUrl.toString();
        script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP 載入失敗'));
        };
        document.body.appendChild(script);
    });
}

// 新增關鍵字
async function addKeyword() {
    const keyword = inputEl.value.trim();
    if (!keyword) return;

    // 鎖定按鈕避免重複提交
    submitBtn.disabled = true;
    submitBtn.textContent = '發送中...';

    try {
        if (GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
            alert('請先在 app.js 中設定 GAS_API_URL');
            resetSubmitBtn();
            return;
        }

        const url = new URL(GAS_API_URL);
        url.searchParams.append('action', 'add');
        url.searchParams.append('uuid', deviceUUID);
        url.searchParams.append('keyword', keyword);

        const result = await fetchJSONP(url.toString());

        if (result.status === 'success') {
            // 寫入本地歷史紀錄
            historyList.unshift(keyword); // 插在最前面
            localStorage.setItem('historyList', JSON.stringify(historyList));

            inputEl.value = '';
            renderHistory();
            fetchWordCloudData(); // 立即刷新字雲
        } else {
            alert('發送失敗：' + result.message);
        }
    } catch (error) {
        console.error('Error adding keyword:', error);
        alert('連線異常：' + error.message);
    } finally {
        resetSubmitBtn();
    }
}

// 刪除關鍵字
async function deleteKeyword(keyword, index) {
    if (!confirm(`確定要刪除「${keyword}」嗎？`)) return;

    try {
        const url = new URL(GAS_API_URL);
        url.searchParams.append('action', 'delete');
        url.searchParams.append('uuid', deviceUUID);
        url.searchParams.append('keyword', keyword);

        const result = await fetchJSONP(url.toString());

        if (result.status === 'success') {
            // 從本地移除
            historyList.splice(index, 1);
            localStorage.setItem('historyList', JSON.stringify(historyList));

            renderHistory();
            fetchWordCloudData(); // 立即刷新字雲
        } else {
            alert('刪除失敗：' + result.message);
        }
    } catch (error) {
        console.error('Error deleting keyword:', error);
        alert('連線異常：' + error.message);
    }
}

// 重置送出按鈕
function resetSubmitBtn() {
    submitBtn.disabled = false;
    submitBtn.textContent = '發送';
}

// 取得字雲資料
async function fetchWordCloudData() {
    if (GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') return;

    loadingEl.style.display = 'block';
    try {
        const url = new URL(GAS_API_URL);
        const result = await fetchJSONP(url.toString());

        if (result.status === 'success') {
            wordCloudData = result.data; // [['keyword', weight], ...]
            renderWordCloud();
        }
    } catch (error) {
        console.error('Error fetching word cloud data:', error);
    } finally {
        loadingEl.style.display = 'none';
    }
}

// 渲染字雲
function renderWordCloud() {
    // 確保 canvas 尺寸正確對應容器 (這對 resize 適應很重要)
    const rect = cloudContainer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    if (wordCloudData.length === 0) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Noto Sans TC';
        ctx.fillStyle = '#aaaaaa';
        ctx.textAlign = 'center';
        ctx.fillText('目前還沒有期許，趕快發送第一個吧！', canvas.width / 2, canvas.height / 2);
        return;
    }

    WordCloud(canvas, {
        list: wordCloudData,
        fontFamily: 'Noto Sans TC, sans-serif',
        weightFactor: function (size) {
            // 調整大小倍率，避免太大超出畫面或太小看不見
            return size * 3;
        },
        color: function () {
            // 隨機產生質感的深灰色系
            const grays = ['#333333', '#555555', '#777777', '#222222', '#444444'];
            return grays[Math.floor(Math.random() * grays.length)];
        },
        rotateRatio: 0, // 全部橫向排版較好閱讀
        backgroundColor: 'transparent',
        drawOutOfBound: false,
        shrinkToFit: true
    });
}

// 事件綁定
submitBtn.addEventListener('click', addKeyword);
inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addKeyword();
    }
});

// 啟動應用
init();
