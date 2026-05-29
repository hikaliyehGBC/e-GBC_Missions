let currentDay = 1;
let currentTab = 1;
let isHomeView = true;

const SCRIPTURES = {
  1: "以弗所書 6:18：「靠著聖靈，隨時多方禱告祈求；並要在此警醒不倦，為眾聖徒祈求。」",
  2: "哥林多前書 6:19：「豈不知你們的身子就是聖靈的殿嗎？這聖靈是從神而來，住在你們裡頭的。」",
  3: "馬太福音 5:13-16：「你們是世上的鹽...你們的光也當這樣照在人前，叫他們看見你們的好行為，便將榮耀歸給你們在天上的父。」"
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

  // 3. 更新經文副標題
  const scriptureBox = document.getElementById('scriptureBox');
  scriptureBox.textContent = SCRIPTURES[currentTab];

  // 4. 取得當日資料 (新版物件結構)
  const dayStr = String(currentDay).padStart(2, '0');
  const dayData = calendarData[`06-${dayStr}`];
  
  const contentEl = document.getElementById('actionContent');
  const weekdayEl = document.getElementById('cardWeekday');
  const topicEl = document.getElementById('cardTopic');
  
  if (!dayData) {
    weekdayEl.textContent = '';
    topicEl.textContent = '尚無內容';
    contentEl.innerHTML = '';
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

  if (currentActionData) {
    weekdayEl.textContent = currentActionData.weekday || '週？';
    topicEl.textContent = currentActionData.topic || '無標題';
    contentEl.innerHTML = currentActionData.content || '';
  }
}

document.addEventListener('DOMContentLoaded', init);
