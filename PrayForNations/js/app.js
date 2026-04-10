const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhqx91y_5EUqOsOnjAXCQ7YjuAXrMBj6mX0_-It4VEicShgdVASf7FYg1H5IChk1aaKtKDmvT2c7OL/pub?gid=0&single=true&output=csv',
    transitionSpeed: 500, // 中速 500ms
    driveImagePrefix: 'https://lh3.googleusercontent.com/d/'
};

const state = {
    cards: [],
    currentIndex: 0,
    lang: 'zh', 
    total: 0,
    isAnimating: false
};

// DOM 元素
const cardImg = document.getElementById('cardImg');
const currentIndexEl = document.getElementById('currentIndex');
const totalCardsEl = document.getElementById('totalCards');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const langToggle = document.getElementById('langToggle');
const randomBtn = document.getElementById('randomBtn');
const videoBtn = document.getElementById('videoBtn');
const cardLoader = document.querySelector('.card-loader');

// 初始化
async function init() {
    try {
        await loadFromGoogleSheets();
        if (state.cards.length === 0) throw new Error('No data found');

        state.total = state.cards.length;
        totalCardsEl.innerText = state.total;
        
        // 隨機決定起始
        state.currentIndex = Math.floor(Math.random() * state.total);
        updateDisplay(true); // 首次載入不需要滑動動畫
    } catch (err) {
        console.error('初始化失敗:', err);
        document.querySelector('.card-loader').innerText = '資料載入失敗，請檢查網路或試算表設定';
    }
}

// 讀取 CSV
async function loadFromGoogleSheets() {
    const response = await fetch(CONFIG.csvUrl);
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    
    // 假設 CSV 標題為 id, title_zh, title_en, img_zh, img_en, youtube_url, order
    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    state.cards = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i] ? row[i].trim() : '';
        });
        return {
            id: obj.id,
            zh_img: CONFIG.driveImagePrefix + obj.img_zh,
            en_img: CONFIG.driveImagePrefix + obj.img_en,
            video: obj.youtube_url || null,
            order: parseInt(obj.order) || 99
        };
    }).sort((a, b) => a.order - b.order);
}

// 簡易 CSV 解析器 (處理逗號與引號)
function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    return lines.map(line => {
        const result = [];
        let cur = '', inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuote = !inQuote;
            else if (char === ',' && !inQuote) {
                result.push(cur);
                cur = '';
            } else cur += char;
        }
        result.push(cur);
        return result;
    }).filter(row => row.length > 1);
}

function updateDisplay(isInitial = false) {
    if (state.total === 0 || state.isAnimating) return;
    
    state.isAnimating = true;
    const card = state.cards[state.currentIndex];
    const imgUrl = state.lang === 'zh' ? card.zh_img : card.en_img;
    
    // 動畫效果
    if (!isInitial) {
        cardImg.parentElement.style.opacity = '0';
        cardImg.parentElement.style.transform = 'scale(0.95)';
    }

    // 預載圖片
    const tempImg = new Image();
    tempImg.src = imgUrl;
    tempImg.onload = () => {
        cardImg.src = imgUrl;
        currentIndexEl.innerText = state.currentIndex + 1;
        
        // 影片按鈕
        videoBtn.style.display = (card.video && card.video !== '') ? 'inline-block' : 'none';
        
        setTimeout(() => {
            cardImg.parentElement.style.opacity = '1';
            cardImg.parentElement.style.transform = 'scale(1)';
            state.isAnimating = false;
        }, 50);
    };
}

// 事件
prevBtn.addEventListener('click', () => {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex - 1 + state.total) % state.total;
    updateDisplay();
});

nextBtn.addEventListener('click', () => {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex + 1) % state.total;
    updateDisplay();
});

langToggle.addEventListener('click', () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    updateDisplay();
});

randomBtn.addEventListener('click', () => {
    if (state.isAnimating) return;
    state.currentIndex = Math.floor(Math.random() * state.total);
    updateDisplay();
});

// YouTube Modal 邏輯
const modal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');

videoBtn.addEventListener('click', () => {
    const videoUrl = state.cards[state.currentIndex].video;
    // 轉換為 embed URL
    const videoId = extractVideoID(videoUrl);
    if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        modal.style.display = 'flex';
    }
});

document.querySelector('.close-modal').onclick = () => {
    modal.style.display = 'none';
    player.src = '';
};

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 啟動
init();
