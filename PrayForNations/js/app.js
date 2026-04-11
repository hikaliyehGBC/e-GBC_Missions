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

// 燈箱與影片
const lightbox = document.getElementById('imageLightbox');
const fullImg = document.getElementById('fullImg');
const videoModal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');

async function init() {
    try {
        // 強制隱藏所有彈窗
        lightbox.style.display = 'none';
        videoModal.style.display = 'none';

        await loadFromGoogleSheets();
        if (state.cards.length === 0) return;
        state.total = state.cards.length;
        state.currentIndex = Math.floor(Math.random() * state.total);
        
        // 初始狀態
        const card = state.cards[state.currentIndex];
        cardImg.src = state.lang === 'zh' ? card.zh_img : card.en_img;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
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

// 翻牌切換邏輯
function updateDisplay() {
    if (state.total === 0 || state.isAnimating) return;
    
    state.isAnimating = true;
    const card = state.cards[state.currentIndex];
    const imgUrl = state.lang === 'zh' ? card.zh_img : card.en_img;

    // 1. 先翻向背面
    cardElement.classList.add('flipped');

    // 2. 在背面時更換圖片與狀態
    setTimeout(() => {
        cardImg.src = imgUrl;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
    }, CONFIG.flipDuration / 2);

    // 3. 翻回正面
    setTimeout(() => {
        cardElement.classList.remove('flipped');
        state.isAnimating = false;
        
        // 預載鄰近圖片
        const nextIdx = (state.currentIndex + 1) % state.total;
        new Image().src = state.lang === 'zh' ? state.cards[nextIdx].zh_img : state.cards[nextIdx].en_img;
    }, CONFIG.flipDuration + 100);
}

// 事件綁定
prevBtn.onclick = () => { changeCard(-1); };
nextBtn.onclick = () => { changeCard(1); };
touchPrev.onclick = (e) => { e.stopPropagation(); changeCard(-1); };
touchNext.onclick = (e) => { e.stopPropagation(); changeCard(1); };

function changeCard(dir) {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex + dir + state.total) % state.total;
    updateDisplay();
}

randomBtn.onclick = () => {
    if (state.isAnimating) return;
    state.currentIndex = Math.floor(Math.random() * state.total);
    updateDisplay();
};

langToggle.onclick = () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    updateDisplay();
};

// 燈箱控制
cardImg.onclick = () => {
    fullImg.src = cardImg.src;
    lightbox.style.display = 'flex';
};

lightbox.onclick = () => {
    lightbox.style.display = 'none';
    fullImg.src = '';
};

// 影片控制
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
