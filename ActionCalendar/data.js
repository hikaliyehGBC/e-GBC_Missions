// 宣教行動月曆 6月1日 - 6月30日資料
const calendarData = {
  "06-01": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週一・事工守望</strong><br><br>為懷恩堂差傳年會剛結束、數位事工異象的萌芽求神保守，讓會眾的心不冷卻。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週一・通知斷食</strong><br><br>關閉手機上所有非人際通訊 App 的通知（如：購物、遊戲、新聞的按讚或推播通知）。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週一・指尖防守</strong><br><br>看到聳動、挑起對立的新聞或 Threads 廢文時，手指絕不點開，直接滑過去。"
  },
  "06-02": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週二・萬國台灣</strong><br><br>掃描差傳年會QRCode，抽取 1 個國家/地區，觀看其文宣影片，為當地的福音需要默默代禱。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週二・滑後五分</strong><br><br>今天每一次放下手機，強制將視線移開，注視綠色植物、陽台盆栽或看著窗外天空 3 分鐘。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週二・垃圾清理</strong><br><br>隱藏或取消追蹤 1 個經常發布負能量、酸民言論的粉專或帳號。"
  },
  "06-03": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週三・世代心靈</strong><br><br>為自己滑社群時的「FOMO 比較焦慮」禱告，求神賞賜免除定罪的真平安。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週三・實體單工</strong><br><br>在今天工作或讀書的其中一個時段（如 30 分鐘），將手機翻面朝下，放在你拿不到的包包或抽屜中。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週三・正面點讚</strong><br><br>主動為你河道上 1 則帶有溫暖、歡樂、或正能量的好友貼文點讚，給他最直接的支持。"
  },
  "06-04": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週四・環境媒體</strong><br><br>為你今天所滑過的三大平台（FB, LINE, Threads）的網路環境禱告，求神保守你的心不隨怒火起舞。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週四・餐桌安息</strong><br><br>今天的午餐時間，將手機設定為靜音並放入包包，專注享受食物的滋味。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週四・溫暖留言</strong><br><br>在 1 位好朋友分享日常生活的貼文下，留下真誠、簡單的問候（如：「看到你的分享，今天心情也變好了！」）。"
  },
  "06-05": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週五・數位宣教士</strong><br><br>為剛成立的「數位宣教士 Discord 實戰群組」禱告，求神預備同工的心志。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週五・夜間斷電</strong><br><br>睡前最後 15 分鐘關閉手機與電視。閉上眼睛做幾次深呼吸，安靜入睡。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週五・感恩發送</strong><br><br>在社群上（或 LINE 動態）分享 1 件你今天遇到、感到很感恩的小確幸，傳遞正面微光。"
  },
  "06-06": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週六・指尖悔改</strong><br><br>閉眼 1 分鐘，回顧這週的手機使用，求神洗淨我們因被動點閱沒營養八卦所累積的煩躁。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週六・無網散步</strong><br><br>安排 20 分鐘的無手機散步，不戴耳機，專注觀察鄰居的院子、路邊的花草。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週六・真實生活</strong><br><br>分享一張你散步時拍下的美麗自然景物照片，不加濾鏡，寫下一句感謝上帝創造的心聲。"
  },
  "06-07": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週日・主日安息</strong><br><br>崇拜開始前 10 分鐘，將手機關機或靜音放入包包，安靜為身旁正要一起崇拜的會眾能得著安息禱告。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週日・實體聖經</strong><br><br>「今天的主日靈修，拿起實體聖經讀經，不要使用手機 App 看經文。」 體驗手指翻閱紙張的專注溫度。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週日・小卡轉發</strong><br><br>挑選 1 張教會製作的安慰小卡，傳給 1 位最近工作辛苦、好久不見的 LINE 朋友，送出真誠祝福。"
  },
  "06-08": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週一・事工守望</strong><br><br>特別為懷恩堂年會上大家期待的「數位禱告牆」事工的籌備、技術與同工預備禱告。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週一・通知斷食</strong><br><br>將手機主畫面上的社群 App（FB, IG, Threads）移入第二頁的資料夾中，打破「手賤解鎖即點開」的肌肉記憶。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週一・指尖防守</strong><br><br>遇到別人在 Threads 或臉書留言區大肆爭吵、公審時，堅持不留下任何冷嘲熱諷的隻字片語。"
  },
  "06-09": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週二・萬國台灣</strong><br><br>再次掃碼抽取另一個不同的國家/地區，花 3 分鐘為當地的差傳需要與宣教士家庭的平安守望。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週二・滑後五分</strong><br><br>每次連續滑手機超過 15 分鐘，放下手機後，立刻走向陽台或庭院，做 5 分鐘的植物觸摸或觀察天空。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週二・垃圾清理</strong><br><br>主動退出 1 個經常傳播政治八卦、陰謀論或情緒罵戰的 LINE 垃圾群組。"
  },
  "06-10": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週三・世代心靈</strong><br><br>特別為 30 歲以下、深受 IG 與短影音完美濾鏡綁架的青少年心靈禱告，求神賜下無條件被愛與接納的安全感。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週三・實體單工</strong><br><br>在今天看一本書、或是寫一份報告的 45 分鐘內，挑戰「單一任務」，絕不一邊滑手機一邊做別的事。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週三・正面點讚</strong><br><br>主動為你河道上 3 則帶有正能量、有價值或具備專業知識的良善內容按讚投票。"
  },
  "06-11": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週四・環境媒體</strong><br><br>為在數位平台尋找信仰答案的「隱形慕道友」禱告，求神的真光藉著網路內容引導他們。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週四・餐桌安息</strong><br><br>今天的晚餐時間，與家人或室友用餐時，大家一起將手機收在餐桌旁的籃子裡，專注面對面聊天。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週四・溫暖留言</strong><br><br>在 1 位弟兄姊妹的發文下，留下具體且造就人的鼓勵（如：「謝謝你的分享，這段話今天對我非常有啟發！」）。"
  },
  "06-12": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週五・數位宣教士</strong><br><br>為正在學習使用 AI 工具、準備將差傳年會單張轉化為網頁的同工們禱告，賜下聰明智慧。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週五・夜間斷電</strong><br><br>睡前最後 30 分鐘關閉發光螢幕。用閱讀實體書、手寫日記或拉伸代替滑手機。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週五・感恩發送</strong><br><br>分享一段你最近從實體書、或是靈修中讀到的有智慧的金句，配上你的一句話心得。"
  },
  "06-13": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週六・指尖悔改</strong><br><br>為自己這週在 LINE 群組中，是否有順手轉發未經證實的假訊息或八卦進行反思與求神赦免。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週六・無網散步</strong><br><br>進行 30 分鐘無手機慢跑或快走，讓心率維持在能輕鬆說話的 Zone 2 範圍，享受靈魂的放空。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週六・真實生活</strong><br><br>分享一張你與朋友/家人聚餐、大家面對面大笑的溫馨照片，宣告「沒有演算法的實體陪伴最快乐」。"
  },
  "06-14": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週日・主日安息</strong><br><br>在主日崇拜中，為講員的口舌與所有會眾的聽道心田禱告，求神的話語成為大家面對週一挑戰的盾牌。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週日・實體聖經</strong><br><br>「拿起實體聖經，深度讀完一章經文。」 不使用手機，若需要筆記，用紙筆寫下來。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週日・小卡轉發</strong><br><br>將教會製作的心靈安息小卡，分享到你的家長群組或工作群組，配上一句：「今晚，送給這週辛苦奮鬥的大家。」"
  },
  "06-15": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週一・事工守望</strong><br><br>為懷恩堂數位禱告牆的推廣禱告，求神讓這面牆成為無數軟弱弟兄姊妹得著安慰的避風港。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週一・通知斷食</strong><br><br>檢查手機系統的「螢幕使用時間」，並在系統中為最常滑的社群 App 設定嚴格的「每日限時 45 分鐘」。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週一・指尖防守</strong><br><br>收到群組傳來未經證實的八卦或假消息時，拒絕順手轉發，用你的冷靜阻斷謠言的傳播。"
  },
  "06-16": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週二・萬國台灣</strong><br><br>掃碼抽取 1 個正面臨戰爭、貧窮或信仰逼迫的地區，為當地的教會能在患難中做光做鹽迫切代求。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週二・滑後五分</strong><br><br>今天滑完手機後，與家中的寵物互動、去公園看松鼠與飛鳥、或赤腳踩踩草地 5 分鐘，重建大腦與真實世界的感官連結。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週二・垃圾清理</strong><br><br>看到純粹挑起對立的廣告或假帳號，不留言爭論，直接按下「檢舉並封鎖」，主動做數位環境清潔。"
  },
  "06-17": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週三・世代心靈</strong><br><br>特別為 40 歲以上、每天被海量 LINE 群組訊息與對立輿論轟炸得精神疲憊的成人求神賞賜平靜。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週三・實體單工</strong><br><br>挑戰在看一場電影或看一場 1 小時線上講座時，將手機關機或放置在另一個房間，拒絕被動雙螢幕。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週三・正面點讚</strong><br><br>主動為 3 位很少受到關注、但一直在努力分享日常或服事的好友按讚，成為他們的默默支持者。"
  },
  "06-18": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週四・環境媒體</strong><br><br>為在網路上發揮影響力的基督教媒體 KOL 與影音創作者禱告，求神保護他們的靈命與家庭。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週四・餐桌安息</strong><br><br>與朋友或同工相約聚餐，餐桌上挑戰「手機疊疊樂」，誰先碰手機誰買單，享受完全沒有干擾的面對面傾聽與大笑。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週四・溫暖留言</strong><br><br>主動在社群上傳私訊給 1 位最近面臨工作、功課或服事重壓的同工，向他表達你誠摯的讚賞與關懷。"
  },
  "06-19": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週五・數位宣教士</strong><br><br>為本週進入「AI Agent 網頁實戰」的同工小組守望，求神賜下合一與突破技術 Bug 的耐心。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週五・夜間斷電</strong><br><br>嘗試「睡前 45 分鐘斷電」。將手機充電器徹底移出臥室，改用實體鬧鐘，享受高質量的安穩睡眠。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週五・感恩發送</strong><br><br>分享一首能為你心靈帶來平靜、安息的優質音樂或詩歌連結，並手寫寫下它如何陪伴了你度過低谷。"
  },
  "06-20": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週六・指尖悔改</strong><br><br>面對這週可能因網路輿論、群組爭論產生的血氣與論斷，在禱告中求耶穌的溫柔重置（Reset）我們。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週六・無網散步</strong><br><br>安排一個下午，給自己 1 小時的完全無手機公園漫遊，感受微風與自然光線，累積實體生活資本。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週六・真實生活</strong><br><br>分享一張最真實、沒有濾鏡的實體生活工作照（如：雖然今天加班很累、但有一杯好咖啡），傳遞真實的平安。"
  },
  "06-21": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週日・主日安息</strong><br><br>禱告求神保守我們在主日能徹底放下工作的 LINE 訊息，享受與神、與弟兄姊妹面對面相處的聖日安息。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週日・實體聖經</strong><br><br>「今天主日，從崇拜到小組查經，全程使用實體聖經，完全不打開手機的經文 App。」 專注於上帝話語的直接同在。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週日・小卡轉發</strong><br><br>轉發教會精心製作的信仰安慰圖文小卡，配上你真誠的祝福，定向傳送給 1 位正處於人生低谷的朋友。"
  },
  "06-22": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週一・事工守望</strong><br><br>為懷恩堂未來與實體牧養相結合的「線上心靈關懷事工」守望，宣告線上羊群將被帶回實體牧場。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週一・通知斷食</strong><br><br>享受沒有垃圾推送的第四週，感受自己對訊息的「焦慮感」與「漏接恐懼（FOMO）」是否已大幅降低。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週一・指尖防守</strong><br><br>享受關閉非人際推送的第四週。面對敏感的社會爭議議題時，若要發言，堅持只寫下促進和睦與理解的字眼。"
  },
  "06-23": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週二・萬國台灣</strong><br><br>掃碼抽取 1 個宣教士極少、福音未得之民比例極高的地區，宣告神的王權要在該地彰顯。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週二・滑後五分</strong><br><br>滑完手機後進行 5 分鐘自然接觸已成為肌肉記憶。感受自己在大腦 Reset 後，專注力與心靈平靜度的顯著提升。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週二・垃圾清理</strong><br><br>協助你的孩子、家人或身邊長輩，教導他們如何封鎖詐騙與隱藏垃圾廢文，當他們數位環境的管家。"
  },
  "06-24": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週三・世代心靈</strong><br><br>為台灣在 Threads 上集體傾倒焦慮與空虛的年輕世代禱告，求神興起更多能陪伴他們的年輕信徒。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週三・實體單工</strong><br><br>在工作或讀書時，主動帶頭將手機收起來，在實體環境中營造一個高度專注、尊重當下的氛圍。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週三・正面點讚</strong><br><br>主動為你所看到的優質基督教媒體、福音創作者的貼文按讚與留言，用實際行動在數位禾場上托住他們。"
  },
  "06-25": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週四・環境媒體</strong><br><br>祝福所有在網路上傳遞真理、安慰的福音貼文與信仰小卡，宣告這些內容要像微光照亮深夜的黑暗。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週四・餐桌安息</strong><br><br>享受每一餐沒有手機干擾的美味。寫下你這一個月因為「餐桌安息」多聽到了家人/朋友的哪些真心話？",
    "action3": "<strong style=\"color:var(--primary-dark)\">週四・溫暖留言</strong><br><br>主動關心 1 位在社群上發出沮喪、空虛文字的朋友，用私訊送出溫暖的代求與問候，不說教，只傾聽。"
  },
  "06-26": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週五・數位宣教士</strong><br><br>為即將完成裝備、發布互動網頁的宣教士團隊祝福，宣告他們的網頁要成為成百上千人的祝福。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週五・夜間斷電</strong><br><br>享受長達一個月睡前斷電的恩典，感受睡眠品質的大幅改善與清晨起床時的清爽。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週五・感恩發送</strong><br><br>分享你過去一個月實踐「數位安息」的感恩得著，見證神如何在你安靜下來時重新更新了你。"
  },
  "06-27": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週六・指尖悔改</strong><br><br>檢視這一個月在社群上的發言，感謝神保守我們的舌頭與指尖，宣告我們已退出了那場鍵盤降火的遊戲。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週六・無網散步</strong><br><br>挑戰週六下午 3 小時的完全斷網（手機關機或開飛航模式），去爬山或騎單車，體驗大自然的懷抱。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週六・真實生活</strong><br><br>分享這個月你在實體生活中，最讓你感到幸福、留有餘韻的 3 個無網日常瞬間，影響身邊人回歸實體。"
  },
  "06-28": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週日・主日安息</strong><br><br>讀以賽亞書五十二7，為全台灣正透過網路尋求心靈平安的隱形慕道友代禱，宣告佳美的福音腳蹤要在數位禾場展開。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週日・實體聖經</strong><br><br>「拿起實體聖經，用 30 分鐘安靜默想詩篇。」 感謝神在過去一個月，藉著實體聖經重置了你浮躁的心靈。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週日・小卡轉發</strong><br><br>讀以賽亞書五十二7，將差傳年會的宣教小卡轉發到你的群組中，向朋友見證神的信實，踩下佳美的福音腳蹤。"
  },
  "06-29": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週一・事工守望</strong><br><br>為懷恩堂數位事工的永續經營與新一輪同工招募求神開路。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週一・通知斷食最後檢視</strong><br><br>統計 6 月份的每日平均螢幕使用時間，看著減少的數字，感謝神奪回了時間主權。",
    "action3": "<strong style=\"color:var(--primary-dark)\">週一・指尖防守最後檢視</strong><br><br>看著自己過去一個月在網路上充滿平安、造就人的發言，感謝神保守了你的舌頭與指尖。"
  },
  "06-30": {
    "action1": "<strong style=\"color:var(--primary-dark)\">週二・萬國台灣最後守望</strong><br><br>掃碼抽取一個萬國/台灣地區，為其做最後的三十天總結禱告，並寫下神在這段時間調整你屬靈眼光的感恩。",
    "action2": "<strong style=\"color:var(--primary-dark)\">週二・滑後五分習慣續航</strong><br><br>在 30 天的最後，走向一棵大樹，深呼吸，對神宣告：「演算法不再決定我的心情，因為我的靈魂在基督裡享有真正的安息！」",
    "action3": "<strong style=\"color:var(--primary-dark)\">週二・垃圾清理習慣續航</strong><br><br>寫下這 30 天數位之光行動的收穫，並對神大聲宣告：「我的指尖就是福音的管道，我已靠著主在指尖世界裡做光做鹽，踩下最美的腳蹤！」"
  }
};
