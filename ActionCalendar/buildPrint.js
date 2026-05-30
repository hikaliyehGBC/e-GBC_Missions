const fs = require('fs');

function buildHtml(sourcePath, destPath, title, lang = 'zh-TW') {
    try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        const lines = content.split('\n');
        
        const subtitle = lang === 'en' 
            ? 'Please print this page or save it as a PDF. Connect with God and leave beautiful footsteps in the digital world.'
            : '請將本頁列印或存為 PDF，與神連結，在指尖世界踩下最美腳蹤';

        let htmlStr = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 6mm 8mm; }
  body { font-family: 'Noto Sans TC', sans-serif; font-size: 9pt; line-height: 1.4; color: #2c3e50; margin: 0; padding: 0; background: #fff; }
  .page { width: 100%; max-width: 210mm; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 4px; border-bottom: 2px solid #2980B9; padding-bottom: 4px; }
  .header h1 { margin: 0 0 2px 0; color: #2980B9; font-size: 14pt; letter-spacing: 1px; }
  .header p { margin: 0; color: #7f8c8d; font-size: 8.5pt; }
  .columns { column-count: 2; column-gap: 6mm; }
  .week-group { margin-bottom: 6px; break-inside: avoid; }
  .week-title { font-weight: 900; font-size: 10pt; color: #d35400; margin-bottom: 2px; border-bottom: 1px dashed #ecf0f1; padding-bottom: 2px; }
  .day-item { display: flex; align-items: flex-start; margin-bottom: 3px; break-inside: avoid; }
  .checkbox { width: 10px; height: 10px; border: 1.5px solid #bdc3c7; border-radius: 2px; margin-right: 4px; margin-top: 2px; flex-shrink: 0; }
  .day-text { flex: 1; }
  .day-tag { font-weight: 700; color: #2980B9; font-size: 9pt; }
  .day-desc { margin-top: 0; color: #34495e; font-size: 9pt; }
  .week-group-footer { column-span: all; margin-top: 6px; border-top: 2px dashed #ecf0f1; padding-top: 4px; }
  .footer-days { display: grid; grid-template-columns: 1fr 1fr; column-gap: 6mm; }
</style>
</head>
<body>
<div class="page">
<div class="header">
  <h1>${title}</h1>
  <p>${subtitle}</p>
</div>
<div class="columns">
`;

        let currentWeek = '';
        let weekContent = '';
        
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('---') || line.startsWith('=')) return;
            
            const weekMatch = line.match(/^[\uD800-\uDBFF\uDC00-\uDFFF\u2000-\u3300\uFE0F]*\s*(第[一二三四]週.*|Week [1234].*|🏁.*|行動結尾.*|Conclusion.*)/i);
            if (weekMatch) {
                // 移除日期與分鐘數等贅字
                let cleanTitle = line.replace(/\s*\(\s*6\/.*?\).*$/, '').replace(/──.*$/, '').trim();
                
                if (weekContent) {
                    if (currentWeek.includes('🏁') || currentWeek.includes('結尾') || currentWeek.includes('Conclusion')) {
                        htmlStr += `<div class="week-group week-group-footer"><div class="week-title">${currentWeek}</div><div class="footer-days">${weekContent}</div></div>`;
                    } else {
                        htmlStr += `<div class="week-group"><div class="week-title">${currentWeek}</div>${weekContent}</div>`;
                    }
                }
                currentWeek = cleanTitle;
                weekContent = '';
                return;
            }
            
            // 匹配每日項目
            const dayMatch = line.match(/^\[\s*\]\s*6\/(\d+)\s*\((.*?)\)[：:]\s*(.*)/);
            if (dayMatch) {
                const day = dayMatch[1];
                const tag = `6/${day} (${dayMatch[2]})`;
                const desc = dayMatch[3];
                weekContent += `
                    <div class="day-item">
                        <div class="checkbox"></div>
                        <div class="day-text">
                            <span class="day-tag">${tag}</span><br>
                            <span class="day-desc">${desc}</span>
                        </div>
                    </div>`;
            }
        });
        
        if (weekContent) {
            if (currentWeek.includes('🏁') || currentWeek.includes('結尾') || currentWeek.includes('Conclusion')) {
                htmlStr += `<div class="week-group week-group-footer"><div class="week-title">${currentWeek}</div><div class="footer-days">${weekContent}</div></div>`;
            } else {
                htmlStr += `<div class="week-group"><div class="week-title">${currentWeek}</div>${weekContent}</div>`;
            }
        }

        htmlStr += `</div></div></body></html>`;
        fs.writeFileSync(destPath, htmlStr, 'utf8');
        console.log(`Generated ${destPath}`);
    } catch (e) {
        console.error(e);
    }
}

// 中文版
buildHtml('data/Action_Plan01_Prayer.md', 'print_prayer.html', '🙏 禱告大軍：30天數位守望行動');
buildHtml('data/Action_Plan02_Sabbath.md', 'print_sabbath.html', '🌿 數位安息：30天行動指南');
buildHtml('data/Action_Plan03_Light.md', 'print_light.html', '✨ 做光做鹽：30天行動指南');
buildHtml('data/Action_Plan04_Missionary.md', 'print_missionary.html', '💻 數位宣教士：30天行動指南');

// 英文版
buildHtml('data/en/Action_Plan01_Prayer_en.md', 'print_prayer_en.html', '🙏 Prayer Warriors: 30-Day Watch', 'en');
buildHtml('data/en/Action_Plan02_Sabbath_en.md', 'print_sabbath_en.html', '🌿 Digital Sabbath: 30-Day Guide', 'en');
buildHtml('data/en/Action_Plan03_Light_en.md', 'print_light_en.html', '✨ Salt and Light: 30-Day Guide', 'en');
buildHtml('data/en/Action_Plan04_Missionary_en.md', 'print_missionary_en.html', '💻 Digital Missionary: 30-Day Guide', 'en');
