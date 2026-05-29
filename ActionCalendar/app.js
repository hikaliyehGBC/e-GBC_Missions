let currentDay = 1;
let currentTab = 1;

// 初始化
function init() {
  // 自動判斷今天是不是六月
  const today = new Date();
  // 注意：JavaScript 的 getMonth() 是 0-indexed，5 代表六月
  if (today.getMonth() === 5 && today.getDate() >= 1 && today.getDate() <= 30) {
    currentDay = today.getDate();
  } else {
    currentDay = 1;
  }
  
  setupListeners();
  updateUI();
}

// 綁定事件
function setupListeners() {
  document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentDay > 1) {
      currentDay--;
      updateUI();
    }
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentDay < 30) {
      currentDay++;
      updateUI();
    }
  });

  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.currentTarget;
      
      // 更新 Tab 樣式
      tabs.forEach(t => t.classList.remove('active'));
      target.classList.add('active');
      
      // 更新 currentTab 變數
      currentTab = parseInt(target.getAttribute('data-tab'));
      
      updateUI(true); // 傳入 true 代表是切換 tab，可套用不同的過渡邏輯（這裡先復用）
    });
  });
}

function updateUI() {
  // 1. 更新日期數字顯示
  const dayDisplay = document.querySelector('#dateDisplay .day');
  dayDisplay.textContent = currentDay;
  
  // 2. 更新按鈕狀態 (首日/末日 禁用)
  document.getElementById('prevBtn').disabled = (currentDay === 1);
  document.getElementById('nextBtn').disabled = (currentDay === 30);

  // 3. 取得當日資料
  const dayStr = String(currentDay).padStart(2, '0');
  const dayData = calendarData[`06-${dayStr}`];
  const contentEl = document.getElementById('actionContent');
  
  if (!dayData) {
    contentEl.innerHTML = '尚無內容';
    return;
  }
  
  // 4. 重置動畫，讓切換時有浮現效果
  contentEl.style.animation = 'none';
  contentEl.offsetHeight; // 強制重繪 trigger reflow
  contentEl.style.animation = null;

  // 5. 填入內容
  if (currentTab === 1) {
    contentEl.innerHTML = dayData.action1;
  } else if (currentTab === 2) {
    contentEl.innerHTML = dayData.action2;
  } else if (currentTab === 3) {
    contentEl.innerHTML = dayData.action3;
  }
}

document.addEventListener('DOMContentLoaded', init);
