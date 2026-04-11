const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhqx91y_5EUqOsOnjAXCQ7YjuAXrMBj6mX0_-It4VEicShgdVASf7FYg1H5IChk1aaKtKDmvT2c7OL/pub?gid=0&single=true&output=csv',
    flipDuration: 800,
    driveImagePrefix: 'https://drive.google.com/thumbnail?id=',
    imageSuffix: '&sz=w1200'
};

const state = {
    cards: [],
    currentIndex: 0,
    lang: 'zh', 
    total: 0,
    isAnimating: false,
    touchX: 0
};

// DOM 元素
const cardElement = document.getElementById('prayerCard');
const cardImg = document.getElementById('cardImg');
const pcPrev = document.getElementById('pcPrev');
const pcNext = document.getElementById('pcNext');
const touchPrev = document.getElementById('touchPrev');
const touchNext = document.getElementById('touchNext');
const langToggle = document.getElementById('langToggle');
const randomBtn = document.getElementById('randomBtn');
const videoBtn = document.getElementById('videoBtn');
const flipSound = document.getElementById('flipSound');

async function init() {
    try {
        await loadFromGoogleSheets();
        if (state.cards.length === 0) return;
        state.total = state.cards.length;
        state.currentIndex = Math.floor(Math.random() * state.total);
        
        const card = state.cards[state.currentIndex];
        cardImg.src = state.lang === 'zh' ? card.zh_img : card.en_img;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';

        startIntroSequence();
    } catch (err) {
        console.error('初始化失敗:', err);
    }
}

function startIntroSequence() {
    const cardWrap = document.getElementById('mainCardWrap');
    const footerControls = document.querySelector('.card-footer-controls');
    const extraActions = document.querySelector('.extra-actions');

    // 1. 0.5s 顯示卡片背面
    setTimeout(() => { cardWrap.classList.add('intro-show'); }, 500);
    // 2. 1.2s 自動翻轉
    setTimeout(() => { 
        if (flipSound) { flipSound.volume = 0.3; flipSound.play(); }
        cardElement.classList.remove('initial-flip'); 
    }, 1200);
    // 3. 2.0s 介面鑽入
    setTimeout(() => { 
        footerControls.classList.add('intro-show');
        extraActions.classList.add('intro-show');
    }, 2000);
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

function updateDisplay() {
    if (state.total === 0 || state.isAnimating) return;
    state.isAnimating = true;
    const card = state.cards[state.currentIndex];
    const imgUrl = state.lang === 'zh' ? card.zh_img : card.en_img;

    if (flipSound) { flipSound.currentTime = 0; flipSound.play(); }
    cardElement.classList.add('flipped');

    setTimeout(() => {
        cardImg.src = imgUrl;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
        // 預載下一張
        const nextIdx = (state.currentIndex + 1) % state.total;
        new Image().src = state.lang === 'zh' ? state.cards[nextIdx].zh_img : state.cards[nextIdx].en_img;
    }, CONFIG.flipDuration / 2);

    setTimeout(() => {
        cardElement.classList.remove('flipped');
        state.isAnimating = false;
    }, CONFIG.flipDuration + 100);
}

// 統一變更機制
const changeCard = (dir) => {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex + dir + state.total) % state.total;
    updateDisplay();
};

// 綁定所有導航按鈕 (PC 版與 隱形觸控區)
[pcPrev, touchPrev].forEach(el => { el.onclick = (e) => { e.stopPropagation(); changeCard(-1); }; });
[pcNext, touchNext].forEach(el => { el.onclick = (e) => { e.stopPropagation(); changeCard(1); }; });

randomBtn.onclick = () => {
    if (state.isAnimating) return;
    let nextIdx;
    do { nextIdx = Math.floor(Math.random() * state.total); } while (nextIdx === state.currentIndex && state.total > 1);
    state.currentIndex = nextIdx;
    updateDisplay();
};

langToggle.onclick = () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    updateDisplay();
};

// 手機滑動支援 (Swipe)
cardElement.addEventListener('touchstart', (e) => { state.touchX = e.changedTouches[0].screenX; }, { passive: true });
cardElement.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - state.touchX;
    if (Math.abs(diff) > 50) changeCard(diff > 0 ? -1 : 1);
}, { passive: true });

// YouTube 影片
const videoModal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');
videoBtn.onclick = () => {
    const videoUrl = state.cards[state.currentIndex].video;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoModal.style.display = 'flex';
    }
};
document.getElementById('closeVideo').onclick = () => {
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
            else if (char === ',' && !inQuote) { result.push(cur); cur = ''; } else cur += char;
        }
        result.push(cur);
        return result;
    }).filter(row => row.length > 1);
}

init();
