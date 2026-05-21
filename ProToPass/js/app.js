/**
 * ProToPass - 專業人的宣教通行證
 * 互動邏輯、Canvas 通行證繪製與沉浸式滾動偵測
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 專業職能資料定義
    const PROF_DATA = {
        engineer: {
            name: "工程師",
            quote: "「讓技術成為跨越的橋樑。」",
            desc: "在數位的世界裡，每一行程式碼都是跨越地理限制的道路。你的技術可以為資源貧乏的宣教地區搭建連結、解決關鍵問題，甚至透過遠端科技成為未得之民的祝福。",
            icon: "💻"
        },
        artist: {
            name: "藝術創作者",
            quote: "「用故事和美感打開人心。」",
            desc: "美感是超越語言的第一媒介，故事能跨越理性的防衛。你的創作能觸摸受傷的心靈，在沒有傳統宣教士能進去的地方，透過藝術將福音的芬芳散播出去。",
            icon: "🎨"
        },
        medical: {
            name: "醫療與照護",
            quote: "「在痛苦之中帶來醫治。」",
            desc: "醫治是效法耶穌最直接的行動。不論是長期的公共衛生教育，還是短期的跨文化醫療義診，你的專業能切實減輕這世界的痛苦，讓人體驗神的愛與憐憫。",
            icon: "🩺"
        },
        consultant: {
            name: "心理諮商",
            quote: "「陪伴受傷的人重新被理解。」",
            desc: "全球化時代帶來了前所未有的心靈孤單與創傷。你的傾聽與同理專業，能陪伴那些活在破碎與迷惘中的人們，重建內在價值，引領他們尋見真正的平安。",
            icon: "🌱"
        },
        business: {
            name: "商業工作者",
            quote: "「用誠信與專業建立信任。」",
            desc: "營商宣教 (BAM) 是打破傳統藩籬的強大入口。你在商業上的誠信經營、產業鏈合作、甚至到海外創業，能為當地創造真實的價值與就業機會，在職場中樹立信仰典範。",
            icon: "💼"
        },
        creator: {
            name: "數位創作者",
            quote: "「把福音帶進人們每天生活。」",
            desc: "社群媒體與數位內容是當代最主要的溝通現場。你所創作的圖文、影音與社群推廣，能在每日碎片化的訊息中注入盼望，隨時隨地開啟跨文化的心靈對話。",
            icon: "📢"
        }
    };

    // 2. 專業職能點擊切換邏輯
    const cards = document.querySelectorAll('.profession-card');
    const details = document.querySelectorAll('.detail-card');
    const selectProfession = document.getElementById('selectProfession');

    // 初始化：預設點選第一個
    if (cards.length > 0) {
        selectProfession.value = cards[0].dataset.prof;
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const profKey = card.dataset.prof;
            setActiveProfession(profKey);
        });
    });

    selectProfession.addEventListener('change', (e) => {
        setActiveProfession(e.target.value);
    });

    function setActiveProfession(profKey) {
        // 更新卡片 active 狀態
        cards.forEach(c => {
            if (c.dataset.prof === profKey) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });

        // 更新詳細內容 active 狀態
        details.forEach(d => {
            if (d.id === `detail-${profKey}`) {
                d.classList.add('active');
            } else {
                d.classList.remove('active');
            }
        });

        // 連動下拉選單
        selectProfession.value = profKey;

        // 重新繪製通行證預覽
        drawPass();
    }

    // 3. 通行證 Canvas 繪製功能
    const canvas = document.getElementById('passCanvas');
    const ctx = canvas.getContext('2d');
    const userNameInput = document.getElementById('userName');
    const btnDownload = document.getElementById('btnDownload');

    // 監聽輸入框變更
    userNameInput.addEventListener('input', drawPass);

    function drawPass() {
        // 設定 Canvas 高畫質尺寸
        const width = 1000;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        const profKey = selectProfession.value;
        const profInfo = PROF_DATA[profKey] || PROF_DATA.engineer;
        
        let userName = userNameInput.value.trim();
        if (!userName) {
            userName = "專業宣教士"; // 預設柔性名稱
        }

        // --- 繪製背景 (森林綠到溫暖大地金漸層) ---
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0a140f'); // 深綠
        bgGrad.addColorStop(0.5, '#12251a'); // 森林綠
        bgGrad.addColorStop(1, '#2c2216'); // 暗褐
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // 繪製微光與徑向漸層，增加立體感
        const radialGrad = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 450);
        radialGrad.addColorStop(0, 'rgba(207, 161, 110, 0.05)');
        radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radialGrad;
        ctx.fillRect(0, 0, width, height);

        // --- 繪製邊框與裝飾細線 ---
        ctx.strokeStyle = 'rgba(207, 161, 110, 0.4)'; // 大地金
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, width - 60, height - 60);

        ctx.strokeStyle = 'rgba(207, 161, 110, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 40, width - 80, height - 80);

        // 四角裝飾點
        const dots = [
            [30, 30], [width - 30, 30],
            [30, height - 30], [width - 30, height - 30]
        ];
        ctx.fillStyle = '#e2c097';
        dots.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // --- 繪製上方 Header 資訊 ---
        ctx.fillStyle = '#b8c7bc';
        ctx.font = '13px "Noto Sans TC", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText("e-GBC MISSIONS  •  2026 PROTOPASS", 65, 80);

        // 通行證編號 (隨機或特定編碼格式)
        const hash = Array.from(userName).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9000 + 1000;
        const passID = `GBC-${2026}-${hash}`;
        ctx.fillStyle = 'rgba(207, 161, 110, 0.7)';
        ctx.fillText(`PASS ID: ${passID}`, width - 240, 80);

        // --- 繪製核心主標題 ---
        ctx.fillStyle = '#e6c594'; // 沙金
        ctx.font = '700 24px "Noto Serif TC", serif';
        ctx.letterSpacing = '5px';
        ctx.fillText("專業宣教通行證", 65, 140);

        ctx.strokeStyle = 'rgba(207, 161, 110, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(65, 165);
        ctx.lineTo(350, 165);
        ctx.stroke();

        // --- 繪製使用者名字與專業 ---
        ctx.fillStyle = '#f7f5f0'; // 象牙白
        ctx.font = '700 48px "Noto Serif TC", serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(userName, 65, 240);

        // 專業圖標與名稱
        ctx.fillStyle = '#e2c097';
        ctx.font = '28px "Noto Serif TC", serif';
        ctx.fillText(`${profInfo.icon} ${profInfo.name}`, 65, 300);

        // --- 繪製專屬使命宣言 ---
        ctx.fillStyle = '#f7f5f0';
        ctx.font = 'italic 500 22px "Noto Serif TC", serif';
        ctx.fillText(profInfo.quote, 65, 380);

        // 專業宣教文字內容 (折行繪製)
        ctx.fillStyle = '#b8c7bc';
        ctx.font = '16px "Noto Sans TC", sans-serif';
        ctx.letterSpacing = '1px';
        
        const lines = getLines(ctx, profInfo.desc, width - 450);
        let yOffset = 420;
        lines.forEach(line => {
            ctx.fillText(line, 65, yOffset);
            yOffset += 28;
        });

        // --- 繪製右半邊設計感裝飾「地球 / 福音圖誌」 ---
        drawGospelGlobe(ctx, width - 230, height/2 + 20, 120);

        // --- 繪製底端勉勵金句 (亮光) ---
        ctx.fillStyle = '#f7f5f0';
        ctx.font = '700 18px "Noto Serif TC", serif';
        ctx.letterSpacing = '3px';
        ctx.fillText("“ 你不需要離開台灣 才能開始宣教 ”", 65, 530);
    }

    // 輔助函數：將長文字進行折行
    function getLines(ctx, text, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
            let testLine = currentLine + words[n];
            let metrics = ctx.measureText(testLine);
            let testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(currentLine);
                currentLine = words[n];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    // 輔助函數：在右半邊繪製極具設計感的地球/福音幾何圖形
    function drawGospelGlobe(ctx, cx, cy, r) {
        ctx.save();
        ctx.translate(cx, cy);

        // 外圈光暈
        const haloGrad = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.2);
        haloGrad.addColorStop(0, 'rgba(207, 161, 110, 0.08)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // 圓形框
        ctx.strokeStyle = 'rgba(207, 161, 110, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        // 繪製幾何宣教經緯線
        ctx.strokeStyle = 'rgba(207, 161, 110, 0.15)';
        ctx.lineWidth = 1;
        
        // 橫緯線
        for (let i = -3; i <= 3; i++) {
            const y = (i / 4) * r;
            const rx = Math.sqrt(r*r - y*y);
            ctx.beginPath();
            ctx.moveTo(-rx, y);
            ctx.lineTo(rx, y);
            ctx.stroke();
        }

        // 豎經線 (橢圓弧線)
        for (let i = -2; i <= 2; i++) {
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(0, -r);
                ctx.lineTo(0, r);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.ellipse(0, 0, Math.abs(i/3)*r, r, 0, -Math.PI/2, Math.PI/2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(0, 0, Math.abs(i/3)*r, r, 0, Math.PI/2, Math.PI * 1.5);
                ctx.stroke();
            }
        }

        // 繪製十字架或宣教亮點 (精細十字發光)
        ctx.strokeStyle = '#e6c594';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(230, 197, 148, 0.5)';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        // 豎
        ctx.moveTo(0, -r * 0.45);
        ctx.lineTo(0, r * 0.45);
        // 橫
        ctx.moveTo(-r * 0.25, -r * 0.15);
        ctx.lineTo(r * 0.25, -r * 0.15);
        ctx.stroke();

        ctx.restore();
    }

    // 4. 下載功能實作
    btnDownload.addEventListener('click', () => {
        const userName = userNameInput.value.trim() || "Beloved_Disciple";
        const link = document.createElement('a');
        link.download = `ProToPass_${userName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // 5. 「思考」與「結語」沉浸式動畫觸發
    const reflectionCards = document.querySelectorAll('.question-card');
    const epilogue = document.querySelector('.epilogue-content');

    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 進入畫面時加入 show 類別，觸發漸入動畫
                entry.target.classList.add('show');
                
                // Stagger 動畫延遲效果 (如果是 reflection-card)
                if (entry.target.classList.contains('question-card')) {
                    const index = entry.target.dataset.index;
                    entry.target.style.transitionDelay = `${index * 0.6}s`;
                }
                
                // 解除觀察，只動態觸發一次
                animObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15 // 稍微進入視窗 15% 即觸發
    });

    reflectionCards.forEach(c => animObserver.observe(c));
    if (epilogue) {
        animObserver.observe(epilogue);
    }

    // 初始繪圖
    drawPass();
});
