let currentDay = 1;
let currentTab = 1;
let isHomeView = true;
let currentLang = localStorage.getItem('action_lang') || 'zh';

const I18N = {
  zh: {
    'hero-title': '30日數位宣教行動',
    'hero-subtitle': '數位禾場：在指尖世界看見呼召',
    'hero-text': '你是否聽見在五光十色的數位世界背後<br>網友們對真實連結、心靈平靜的渴求？<br>人們的痛苦，就是福音的著陸點。<br>打破宣教時空藩籬，現在就為福音做出行動',
    'print-title': '📄 30日行動指南 A4列印版',
    'print-prayer': '🙏 禱告大軍',
    'print-sabbath': '🌿 數位安息',
    'print-light': '✨ 做光做鹽',
    'print-missionary': '💻 數位宣教士',
    'enter-calendar': '進入今日行動',
    'cloud-title': '數位事工禱告雲',
    'cloud-desc': '大家對懷恩堂數位事工的期待與禱告',
    'footer-link': '前往 2026 懷恩堂差傳年會官方網站',
    'footer-copy1': 'e-gbc 2026差傳年會 數位事工禱告互動頁面',
    'footer-copy2': '如有疑問或建議，請聯絡資訊同工 嘉惠：',
    'tab-prayer': '禱告大軍',
    'tab-sabbath': '數位安息',
    'tab-light': '做光做鹽',
    'tab-missionary': '數位宣教士',
    'nav-prev': '前一天',
    'nav-today': '返回今天',
    'nav-next': '後一天',
    'btn-cloud': '☁️ 前往數位事工禱告雲',
    'btn-tw': '🇹🇼 前往為台灣禱告',
    'btn-nations': '🌍 前往為萬國禱告',
    'no-content': '尚無內容',
    'no-title': '無標題',
    'weekday-fallback': '週？',
    scriptures: {
      1: { text: "「靠著聖靈，隨時多方禱告祈求；並要在此警醒不倦，為眾聖徒祈求。」", source: "以弗所書 6:18" },
      2: { text: "「豈不知你們的身子就是聖靈的殿嗎？這聖靈是從神而來，住在你們裡頭的。」", source: "哥林多前書 6:19" },
      3: { text: "「你們是世上的鹽...你們的光也當這樣照在人前，叫他們看見你們的好行為，便將榮耀歸給你們在天上的父。」", source: "馬太福音 5:13-16" },
      4: { text: "「各人要照所得的恩賜彼此服侍，做神百般恩賜的好管家。 若有講道的，要按著神的聖言講；若有服侍人的，要按著神所賜的力量服侍，叫神在凡事上因耶穌基督得榮耀」", source: "彼得前書 4:10-11" }
    }
  },
  en: {
    'hero-title': '30-Day Digital Missions Action',
    'hero-subtitle': 'Digital Harvest: Seeing the Call in a Fingertip World',
    'hero-text': 'Behind the dazzling digital world, do you hear<br>netizens thirsting for genuine connection and peace of mind?<br>People\'s pain is the landing zone of the gospel.<br>Break the boundaries of time and space, and take action for the gospel today!',
    'print-title': '📄 30-Day Action Guide (A4 Print)',
    'print-prayer': '🙏 Prayer Warriors',
    'print-sabbath': '🌿 Digital Sabbath',
    'print-light': '✨ Salt & Light',
    'print-missionary': '💻 Digital Missionary',
    'enter-calendar': 'Enter Today\'s Action',
    'cloud-title': 'Digital Ministry Prayer Cloud',
    'cloud-desc': 'Expectations and prayers for GBC digital ministries',
    'footer-link': 'Visit 2026 GBC Missions Conference Website',
    'footer-copy1': 'e-gbc 2026 Missions Conference Digital Ministry Interactive Page',
    'footer-copy2': 'For questions or suggestions, please contact IT coworker Jiahui: ',
    'tab-prayer': 'Prayer Warriors',
    'tab-sabbath': 'Digital Sabbath',
    'tab-light': 'Salt & Light',
    'tab-missionary': 'Digital Missionary',
    'nav-prev': 'Previous',
    'nav-today': 'Return to Today',
    'nav-next': 'Next',
    'btn-cloud': '☁️ Go to Digital Ministry Prayer Cloud',
    'btn-tw': '🇹🇼 Pray for Taiwan',
    'btn-nations': '🌍 Pray for Nations',
    'no-content': 'No Content',
    'no-title': 'No Title',
    'weekday-fallback': 'Day?',
    scriptures: {
      1: { text: '"And pray in the Spirit on all occasions with all kinds of prayers and requests. With this in mind, be alert and always keep on praying for all the Lord’s people."', source: "Ephesians 6:18" },
      2: { text: '"Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?"', source: "1 Corinthians 6:19" },
      3: { text: '"You are the salt of the earth... let your light shine before others, that they may see your good deeds and glorify your Father in heaven."', source: "Matthew 5:13-16" },
      4: { text: '"Each of you should use whatever gift you have received to serve others, as faithful stewards of God’s grace in its various forms."', source: "1 Peter 4:10" }
    }
  }
};

// 初始化
function init() {
  const today = new Date();
  if (today.getMonth() === 5 && today.getDate() >= 1 && today.getDate() <= 30) {
    currentDay = today.getDate();
    isHomeView = false; 
  } else {
    currentDay = 1;
    isHomeView = true;  
  }
  
  setupListeners();
  applyLanguage();
  renderView();
}

function applyLanguage() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-TW' : 'en';
  
  // 更新語言按鈕樣式
  const langBtn = document.getElementById('langToggleBtn');
  langBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
  
  // 更新靜態文字
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[currentLang][key]) {
      el.innerHTML = I18N[currentLang][key];
    }
  });

  // 更新列印連結
  document.getElementById('btn-print-prayer').href = currentLang === 'zh' ? 'print_prayer.html' : 'print_prayer_en.html';
  document.getElementById('btn-print-sabbath').href = currentLang === 'zh' ? 'print_sabbath.html' : 'print_sabbath_en.html';
  document.getElementById('btn-print-light').href = currentLang === 'zh' ? 'print_light.html' : 'print_light_en.html';
  document.getElementById('btn-print-missionary').href = currentLang === 'zh' ? 'print_missionary.html' : 'print_missionary_en.html';
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
  // 語言切換
  document.getElementById('langToggleBtn').addEventListener('click', () => {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('action_lang', currentLang);
    applyLanguage();
    if (!isHomeView) {
      updateCalendarUI();
    }
  });

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
  document.getElementById('cardDay').textContent = currentDay;
  
  document.getElementById('prevBtn').disabled = (currentDay === 1);
  document.getElementById('nextBtn').disabled = (currentDay === 30);
  
  const today = new Date();
  const todayBtn = document.getElementById('todayBtn');
  if (today.getMonth() === 5 && today.getDate() >= 1 && today.getDate() <= 30) {
    if (currentDay !== today.getDate()) {
      todayBtn.style.display = 'block';
    } else {
      todayBtn.style.display = 'none';
    }
  } else {
    todayBtn.style.display = 'none';
  }

  // 經文副標題
  const scripData = I18N[currentLang].scriptures[currentTab];
  document.getElementById('scriptureText').textContent = scripData.text;
  document.getElementById('scriptureSource').textContent = scripData.source;

  const dayStr = String(currentDay).padStart(2, '0');
  
  // 使用 currentLang 選擇資料夾結構 calendarData[lang]['06-01']
  let dayData;
  if (typeof calendarData[currentLang] !== 'undefined') {
    dayData = calendarData[currentLang][`06-${dayStr}`];
  }
  
  const contentEl = document.getElementById('actionContent');
  const weekdayEl = document.getElementById('cardWeekday');
  const topicEl = document.getElementById('cardTopic');
  const extraContentEl = document.getElementById('extraContent');
  
  if (!dayData) {
    weekdayEl.textContent = '';
    topicEl.textContent = I18N[currentLang]['no-content'];
    contentEl.innerHTML = '';
    extraContentEl.innerHTML = '';
    return;
  }
  
  contentEl.style.animation = 'none';
  contentEl.offsetHeight; 
  contentEl.style.animation = null;

  let currentActionData;
  if (currentTab === 1) currentActionData = dayData.action1;
  else if (currentTab === 2) currentActionData = dayData.action2;
  else if (currentTab === 3) currentActionData = dayData.action3;
  else if (currentTab === 4) currentActionData = dayData.action4;

  extraContentEl.innerHTML = ''; 

  if (currentActionData) {
    weekdayEl.textContent = currentActionData.weekday || I18N[currentLang]['weekday-fallback'];
    topicEl.textContent = currentActionData.topic || I18N[currentLang]['no-title'];
    contentEl.innerHTML = currentActionData.content || '';
    
    if (currentTab === 1) {
      if (currentActionData.weekday === '週一' || currentActionData.weekday === 'Mon') {
        extraContentEl.innerHTML = `<a href="../WordCloud/index.html" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">${I18N[currentLang]['btn-cloud']}</a>`;
      } else if (currentActionData.weekday === '週二' || currentActionData.weekday === 'Tue') {
        const weekNum = Math.ceil(currentDay / 7);
        if (weekNum === 1 || weekNum === 3) {
          extraContentEl.innerHTML = `<a href="https://www.gbc.org.tw/missions/prayfortaiwan/" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">${I18N[currentLang]['btn-tw']}</a>`;
        } else if (weekNum === 2 || weekNum === 4) {
          extraContentEl.innerHTML = `<a href="https://www.gbc.org.tw/missions/prayfornations/" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">${I18N[currentLang]['btn-nations']}</a>`;
        }
      }
    } else if (currentTab === 4) {
      if (currentDay === 6) {
        extraContentEl.innerHTML = `<a href="../WordCloud/index.html" target="_blank" class="btn-outline" style="display:inline-block; margin-top:15px; width:100%; text-align:center;">${I18N[currentLang]['btn-cloud']}</a>`;
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
