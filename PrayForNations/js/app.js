const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhqx91y_5EUqOsOnjAXCQ7YjuAXrMBj6mX0_-It4VEicShgdVASf7FYg1H5IChk1aaKtKDmvT2c7OL/pub?gid=0&single=true&output=csv',
    flipDuration: 600,
    driveImagePrefix: 'https://drive.google.com/thumbnail?id=',
    imageSuffix: '&sz=w1200'
};

const state = {
    cards: [],
    currentIndex: 0,
    lang: 'zh', 
    total: 0,
    isAnimating: false
};

// DOM 元素
const cardElement = document.getElementById('prayerCard');
const cardImg = document.getElementById('cardImg');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const touchPrev = document.getElementById('touchPrev');
const touchNext = document.getElementById('touchNext');
const langToggle = document.getElementById('langToggle');
const randomBtn = document.getElementById('randomBtn');
const videoBtn = document.getElementById('videoBtn');

// 燈箱元素
const lightbox = document.getElementById('imageLightbox');
const fullImg = document.getElementById('fullImg');

async function init() {
    try {
        await loadFromGoogleSheets();
        if (state.cards.length === 0) return;
        state.total = state.cards.length;
        state.currentIndex = Math.floor(Math.random() * state.total);
        updateDisplay(true);
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
            zh_img: CONFIG.driveImagePrefix + obj.img_zh + CONFIG.imageSuffix,
            en_img: CONFIG.driveImagePrefix + obj.img_en + CONFIG.imageSuffix,
            video: obj.youtube_url || null,
            order: parseInt(obj.order) || 99
        };
    }).sort((a, b) => a.order - b.order);
}

function updateDisplay(isInitial = false) {
    if (state.total === 0 || state.isAnimating) return;
    
    const card = state.cards[state.currentIndex];
    const imgUrl = state.lang === 'zh' ? card.zh_img : card.en_img;

    if (isInitial) {
        cardImg.src = imgUrl;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
        return;
    }

    // 啟動翻轉動畫
    state.isAnimating = true;
    cardElement.classList.add('flipping');

    // 在動畫過半時更換圖片
    setTimeout(() => {
        cardImg.src = imgUrl;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
        
        // 預載下一張
        const nextIdx = (state.currentIndex + 1) % state.total;
        new Image().src = state.lang === 'zh' ? state.cards[nextIdx].zh_img : state.cards[nextIdx].en_img;
    }, CONFIG.flipDuration / 2);

    // 完成動畫
    setTimeout(() => {
        cardElement.classList.remove('flipping');
        state.isAnimating = false;
    }, CONFIG.flipDuration);
}

// 事件處理器
const handlePrev = () => {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex - 1 + state.total) % state.total;
    updateDisplay();
};

const handleNext = () => {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex + 1) % state.total;
    updateDisplay();
};

prevBtn.addEventListener('click', handlePrev);
nextBtn.addEventListener('click', handleNext);
touchPrev.addEventListener('click', (e) => { e.stopPropagation(); handlePrev(); });
touchNext.addEventListener('click', (e) => { e.stopPropagation(); handleNext(); });

langToggle.addEventListener('click', () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    updateDisplay();
});

randomBtn.addEventListener('click', () => {
    if (state.isAnimating) return;
    state.currentIndex = Math.floor(Math.random() * state.total);
    updateDisplay();
});

// 燈箱邏輯 (原圖放大)
cardImg.addEventListener('click', () => {
    fullImg.src = cardImg.src;
    lightbox.style.display = 'flex';
});

lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
    fullImg.src = '';
});

// YouTube 邏輯
const videoModal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');

videoBtn.addEventListener('click', () => {
    const videoUrl = state.cards[state.currentIndex].video;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoModal.style.display = 'flex';
    }
});

document.querySelector('.close-modal').onclick = () => {
    videoModal.style.display = 'none';
    player.src = '';
};

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

init();
