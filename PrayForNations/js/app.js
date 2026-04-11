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
    touchStart: 0,
    touchEnd: 0
};

// DOM 元素
const cardElement = document.getElementById('prayerCard');
const cardImg = document.getElementById('cardImg');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const langToggle = document.getElementById('langToggle');
const randomBtn = document.getElementById('randomBtn');
const videoBtn = document.getElementById('videoBtn');
const flipSound = document.getElementById('flipSound');

// 進場動畫元素
const introElems = document.querySelectorAll('.intro-hidden');
const cardWrap = document.getElementById('mainCardWrap');

async function init() {
    try {
        await loadFromGoogleSheets();
        if (state.cards.length === 0) return;
        state.total = state.cards.length;
        state.currentIndex = Math.floor(Math.random() * state.total);
        
        // 設定初始圖片
        const card = state.cards[state.currentIndex];
        cardImg.src = state.lang === 'zh' ? card.zh_img : card.en_img;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';

        startIntroSequence();
    } catch (err) {
        console.error('初始化失敗:', err);
    }
}

// 劇院級進場動畫序幕
function startIntroSequence() {
    // 1. 0.5s 後顯示卡片背面
    setTimeout(() => {
        cardWrap.classList.add('intro-show');
    }, 500);

    // 2. 1.2s 後翻面至正面
    setTimeout(() => {
        playFlipSound();
        cardElement.classList.remove('initial-flip');
    }, 1200);

    // 3. 2.0s 後顯示所有介面
    setTimeout(() => {
        introElems.forEach(el => el.classList.add('intro-show'));
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

    playFlipSound();
    cardElement.classList.add('flipped');

    setTimeout(() => {
        cardImg.src = imgUrl;
        videoBtn.style.display = card.video ? 'inline-block' : 'none';
    }, CONFIG.flipDuration / 2);

    setTimeout(() => {
        cardElement.classList.remove('flipped');
        state.isAnimating = false;
    }, CONFIG.flipDuration + 100);
}

function playFlipSound() {
    if (flipSound) {
        flipSound.volume = 0.3; // 控制音量不要太大
        flipSound.currentTime = 0;
        flipSound.play().catch(e => console.log('音效播放受限'));
    }
}

// 事件
prevBtn.onclick = () => changeCard(-1);
nextBtn.onclick = () => changeCard(1);

function changeCard(dir) {
    if (state.isAnimating) return;
    state.currentIndex = (state.currentIndex + dir + state.total) % state.total;
    updateDisplay();
}

randomBtn.onclick = () => {
    if (state.isAnimating) return;
    // 排除目前序號
    let nextIdx;
    do {
        nextIdx = Math.floor(Math.random() * state.total);
    } while (nextIdx === state.currentIndex && state.total > 1);
    
    state.currentIndex = nextIdx;
    updateDisplay();
};

langToggle.onclick = () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    updateDisplay();
};

// 滑動支援 (Swipe)
cardElement.addEventListener('touchstart', (e) => {
    state.touchStart = e.changedTouches[0].screenX;
}, { passive: true });

cardElement.addEventListener('touchend', (e) => {
    state.touchEnd = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const threshold = 50;
    if (state.touchEnd < state.touchStart - threshold) {
        changeCard(1); // 向左滑 -> 下一張
    } else if (state.touchEnd > state.touchStart + threshold) {
        changeCard(-1); // 向右滑 -> 上一張
    }
}

// 其他原有的燈箱與 YouTube 邏輯...
const lightbox = document.getElementById('imageLightbox');
const fullImg = document.getElementById('fullImg');
cardImg.onclick = () => { fullImg.src = cardImg.src; lightbox.style.display = 'flex'; };
lightbox.onclick = () => { lightbox.style.display = 'none'; fullImg.src = ''; };

const videoModal = document.getElementById('videoModal');
const player = document.getElementById('youtubePlayer');
videoBtn.onclick = () => {
    const videoUrl = state.cards[state.currentIndex].video;
    const videoId = extractVideoID(videoUrl);
    if (videoId) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoModal.style.display = 'flex';
    }
};
document.getElementById('closeVideo').onclick = () => {
    videoModal.style.display = 'none';
    player.src = '';
};

function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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

init();
