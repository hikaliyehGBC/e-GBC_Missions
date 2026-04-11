const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhqx91y_5EUqOsOnjAXCQ7YjuAXrMBj6mX0_-It4VEicShgdVASf7FYg1H5IChk1aaKtKDmvT2c7OL/pub?gid=0&single=true&output=csv',
    flipDuration: 800,
    driveImagePrefix: 'https://drive.google.com/thumbnail?id=',
    imageSuffix: '&sz=w1600'
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
const cardInner = document.getElementById('cardInner');
const cardWrapper = document.getElementById('cardWrapper');
const cardImg = document.getElementById('cardImg');
const randomBtn = document.getElementById('randomBtn');
const langToggle = document.getElementById('langToggle');
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
        console.error('播放初始化失敗:', err);
    }
}

// 嚴格進場動態序列 (Animation Timeline)
function startIntroSequence() {
    // Step 1: 1.0s 後卡片鑽入顯示背面
    setTimeout(() => {
        cardWrapper.classList.add('animate-in-card');
        cardInner.style.opacity = '1';
    }, 1000);

    // Step 2: 再過 0.5s (T=1.5s) 執行翻轉
    setTimeout(() => {
        if (flipSound) { flipSound.volume = 0.3; flipSound.play().catch(e => {}); }
        cardInner.style.transform = 'rotateY(0deg)'; // 翻至正面
    }, 1500);

    // Step 3: 再過 0.2s (T=1.7s) 所有按鈕淡入
    setTimeout(() => {
        document.querySelectorAll('.nav-btn, .bottom-controls, .extra-actions').forEach(el => {
            el.classList.add('animate-fade-in');
        });
    }, 1700);
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

    if (flipSound) { flipSound.currentTime = 0; flipSound.play().catch(e => {}); }
    cardInner.style.transform = 'rotateY(180deg)'; // 先轉向背面

    setTimeout(() => {
        cardImg.src = imgUrl;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
        // 預載
        const nextIdx = (state.currentIndex + 1) % state.total;
        new Image().src = state.lang === 'zh' ? state.cards[nextIdx].zh_img : state.cards[nextIdx].en_img;
    }, CONFIG.flipDuration / 2);

    setTimeout(() => {
        cardInner.style.transform = 'rotateY(0deg)';
        state.isAnimating = false;
    }, CONFIG.flipDuration + 200);
}

const changeCard = (dir) => {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex + dir + state.total) % state.total;
    updateDisplay();
};

// 綁定點擊與滑動
document.getElementById('pcPrev').onclick = () => changeCard(-1);
document.getElementById('pcNext').onclick = () => changeCard(1);
document.getElementById('touchPrev').onclick = () => changeCard(-1);
document.getElementById('touchNext').onclick = () => changeCard(1);

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

cardInner.addEventListener('touchstart', (e) => { state.touchX = e.changedTouches[0].screenX; }, { passive: true });
cardInner.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - state.touchX;
    if (Math.abs(diff) > 50) changeCard(diff > 0 ? -1 : 1);
}, { passive: true });

// 影片處理
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
        result.push(cur); return result;
    }).filter(row => row.length > 1);
}

init();
