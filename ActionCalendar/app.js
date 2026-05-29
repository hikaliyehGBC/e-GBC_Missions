let currentDay = 1;
let currentTab = 1;
let isHomeView = true;

const SCRIPTURES = {
  1: { text: "「靠著聖靈，隨時多方禱告祈求；並要在此警醒不倦，為眾聖徒祈求。」", source: "以弗所書 6:18" },
  2: { text: "「豈不知你們的身子就是聖靈的殿嗎？這聖靈是從神而來，住在你們裡頭的。」", source: "哥林多前書 6:19" },
  3: { text: "「你們是世上的鹽...你們的光也當這樣照在人前，叫他們看見你們的好行為，便將榮耀歸給你們在天上的父。」", source: "馬太福音 5:13-16" }
};

// 初始化
function init() {
  // 自動判斷今天是不是六月 (getMonth() 5 代表六月)
  const today = new Date();
  if (today.getMonth() === 5 && today.getDate() >= 1 && today.getDate() <= 30) {
    currentDay = today.getDate();
    isHomeView = false; // 六月期間直接進入月曆
  } else {
    currentDay = 1;
    isHomeView = true;  // 非六月期間進入首頁
  }
  
  setupListeners();
  renderView();
}

// 視圖切換
function renderView() {
  const homeView = document.getElementById('home-view');
  const calendarView = document.getElementById('calendar-view');
  
  if (isHomeView) {
    homeView.classList.add('active');
    calendarView.classList.remove('active');
  } else {
    homeView.classList.remove('active');
    calendarView.classList.add('active');
    updateCalendarUI();
  }
}

// 綁定事件
function setupListeners() {
  // 回首頁
  document.getElementById('mainHeader').addEventListener('click', () => {
    isHomeView = true;
    renderView();
  });
  
  // 從首頁進入月曆
  document.getElementById('enterCalendarBtn').addEventListener('click', () => {
    isHomeView = false;
    renderView();
  });

  // 日期切換 (左右按鈕)
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentDay > 1) {
      currentDay--;
      updateCalendarUI();
    }
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentDay < 30) {
      currentDay++;
      updateCalendarUI();
    }
  });
  
  // 返回今天
  document.getElementById('todayBtn').addEventListener('click', () => {
    const today = new Date();
    if (today.getMonth() === 5 && today.getDate() >= 1 && today.getDate() <= 30) {
      currentDay = today.getDate();
      updateCalendarUI();
    }
  });

  // 頁籤切換
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.currentTarget;
      tabs.forEach(t => t.classList.remove('active'));
      target.classList.add('active');
      currentTab = parseInt(target.getAttribute('data-tab'));
      updateCalendarUI();
    });
  });
}

// 更新月曆介面
function updateCalendarUI() {
  // 1. 更新日期顯示 (大數字)
  document.getElementById('cardDay').textContent = currentDay;
  
  // 2. 更新底部導航按鈕狀態
  document.getElementById('prevBtn').disabled = (currentDay === 1);
  document.getElementById('nextBtn').disabled = (currentDay === 30);
  
  // 判斷是否顯示返回今天按鈕
  const today = new Date();
  const todayBtn = document.getElementById('todayBtn');
  if (today.getMonth() === 5 && today.getDate() >= 1 && today.getDate() <= 30) {
    // 是六月，但如果 currentDay 不是今天，就顯示
    if (currentDay !== today.getDate()) {
      todayBtn.style.display = 'block';
    } else {
      todayBtn.style.display = 'none';
    }
  } else {
    // 非六月，隱藏
    todayBtn.style.display = 'none';
  }

  // 3. 更新經文副標題
  const scripData = SCRIPTURES[currentTab];
  document.getElementById('scriptureText').textContent = scripData.text;
  document.getElementById('scriptureSource').textContent = scripData.source;

  // 4. 取得當日資料 (新版物件結構)
  const dayStr = String(currentDay).padStart(2, '0');
  const dayData = calendarData[`06-${dayStr}`];
  
  const contentEl = document.getElementById('actionContent');
  const weekdayEl = document.getElementById('cardWeekday');
  const topicEl = document.getElementById('cardTopic');
  const extraContentEl = document.getElementById('extraContent');
  
  if (!dayData) {
    weekdayEl.textContent = '';
    topicEl.textContent = '尚無內容';
    contentEl.innerHTML = '';
    extraContentEl.innerHTML = '';
    return;
  }
  
  // 觸發動畫
  contentEl.style.animation = 'none';
  contentEl.offsetHeight; 
  contentEl.style.animation = null;

  // 根據 currentTab 提取資料
  let currentActionData;
  if (currentTab === 1) currentActionData = dayData.action1;
  else if (currentTab === 2) currentActionData = dayData.action2;
  else if (currentTab === 3) currentActionData = dayData.action3;

  extraContentEl.innerHTML = ''; // 清空預設外加內容

  if (currentActionData) {
    weekdayEl.textContent = currentActionData.weekday || '週？';
    topicEl.textContent = currentActionData.topic || '無標題';
    contentEl.innerHTML = currentActionData.content || '';
    
    // 禱告大軍 (Tab 1) 專屬動態按鈕
    if (currentTab === 1) {
      if (currentActionData.weekday === '週一') {
        extraContentEl.innerHTML = `<a href="../WordCloud/index.html" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">☁️ 前往數位事工禱告雲</a>`;
      } else if (currentActionData.weekday === '週二') {
        const weekNum = Math.ceil(currentDay / 7);
        if (weekNum === 1 || weekNum === 3) {
          extraContentEl.innerHTML = `<a href="https://www.gbc.org.tw/missions/prayfortaiwan/" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">🇹🇼 前往為台灣禱告</a>`;
        } else if (weekNum === 2 || weekNum === 4) {
          extraContentEl.innerHTML = `<a href="https://www.gbc.org.tw/missions/prayfornations/" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">🌍 前往為萬國禱告</a>`;
        }
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
