const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhqx91y_5EUqOsOnjAXCQ7YjuAXrMBj6mX0_-It4VEicShgdVASf7FYg1H5IChk1aaKtKDmvT2c7OL/pub?gid=0&single=true&output=csv',
    transitionSpeed: 500,
    // 優化方案 1: 使用縮圖 API 並限制寬度為 1200px (畫質與速度的平衡)
    driveImagePrefix: 'https://drive.google.com/thumbnail?id=',
    imageSuffix: '&sz=w1200'
};

const state = {
    cards: [],
    currentIndex: 0,
    lang: 'zh', 
    total: 0,
    isAnimating: false,
    preloadedImages: new Set()
};

const cardImg = document.getElementById('cardImg');
const currentIndexEl = document.getElementById('currentIndex');
const totalCardsEl = document.getElementById('totalCards');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const langToggle = document.getElementById('langToggle');
const randomBtn = document.getElementById('randomBtn');
const videoBtn = document.getElementById('videoBtn');

async function init() {
    try {
        await loadFromGoogleSheets();
        if (state.cards.length === 0) return;

        state.total = state.cards.length;
        totalCardsEl.innerText = state.total;
        
        state.currentIndex = Math.floor(Math.random() * state.total);
        updateDisplay(true);
        
        // 初始載入後，開始預載鄰近圖片
        preloadAdjacent();
    } catch (err) {
        console.error('初始化失敗:', err);
    }
}

async function loadFromGoogleSheets() {
    const response = await fetch(CONFIG.csvUrl);
    const csvData = await response.text();
    const rows = parseCSV(csvData);
    const headers = rows[0].map(h => h.trim().toLowerCase());
    
    state.cards = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = row[i] ? row[i].trim() : '';
        });
        return {
            id: obj.id,
            // 組合成優化後的 URL
            zh_img: CONFIG.driveImagePrefix + obj.img_zh + CONFIG.imageSuffix,
            en_img: CONFIG.driveImagePrefix + obj.img_en + CONFIG.imageSuffix,
            video: obj.youtube_url || null,
            order: parseInt(obj.order) || 99
        };
    }).sort((a, b) => a.order - b.order);
}

// 預載機制：預載目前索引的前一張與後一張 (中英版本皆載)
function preloadAdjacent() {
    const prev = (state.currentIndex - 1 + state.total) % state.total;
    const next = (state.currentIndex + 1) % state.total;
    
    [prev, next].forEach(idx => {
        const card = state.cards[idx];
        [card.zh_img, card.en_img].forEach(url => {
            if (!state.preloadedImages.has(url)) {
                const img = new Image();
                img.src = url;
                state.preloadedImages.add(url);
            }
        });
    });
}

function updateDisplay(isInitial = false) {
    if (state.total === 0 || state.isAnimating) return;
    
    state.isAnimating = true;
    const card = state.cards[state.currentIndex];
    const imgUrl = state.lang === 'zh' ? card.zh_img : card.en_img;
    
    // UI 反饋：切換時稍微變淡
    if (!isInitial) {
        cardImg.parentElement.style.opacity = '0.4';
    }

    const tempImg = new Image();
    tempImg.src = imgUrl;
    tempImg.onload = () => {
        cardImg.src = imgUrl;
        currentIndexEl.innerText = state.currentIndex + 1;
        videoBtn.style.display = (card.video && card.video !== '') ? 'inline-block' : 'none';
        
        setTimeout(() => {
            cardImg.parentElement.style.opacity = '1';
            state.isAnimating = false;
            // 每次顯示新卡片後，自動預載接下來的卡片
            preloadAdjacent();
        }, 50);
    };
}

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

// YouTube Modal
const modal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');

videoBtn.addEventListener('click', () => {
    const videoUrl = state.cards[state.currentIndex].video;
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

init();
