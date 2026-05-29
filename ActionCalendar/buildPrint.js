const fs = require('fs');

function buildHtml(sourcePath, destPath, title) {
    try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        const lines = content.split('\n');
        
        let htmlStr = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 12mm; }
  body { font-family: 'Noto Sans TC', sans-serif; font-size: 9.5pt; line-height: 1.45; color: #2c3e50; margin: 0; padding: 0; background: #fff; }
  .page { width: 100%; max-width: 210mm; margin: 0 auto; }
  .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #2980B9; padding-bottom: 8px; }
  .header h1 { margin: 0 0 4px 0; color: #2980B9; font-size: 18pt; letter-spacing: 1px; }
  .header p { margin: 0; color: #7f8c8d; font-size: 10pt; }
  .columns { column-count: 2; column-gap: 8mm; }
  .week-group { margin-bottom: 12px; break-inside: avoid; }
  .week-title { font-weight: 900; font-size: 11pt; color: #d35400; margin-bottom: 6px; border-bottom: 1px dashed #ecf0f1; padding-bottom: 4px; }
  .day-item { display: flex; align-items: flex-start; margin-bottom: 8px; break-inside: avoid; }
  .checkbox { width: 12px; height: 12px; border: 1.5px solid #bdc3c7; border-radius: 2px; margin-right: 6px; margin-top: 3px; flex-shrink: 0; }
  .day-text { flex: 1; }
  .day-tag { font-weight: 700; color: #2980B9; }
  .day-desc { margin-top: 2px; color: #34495e; }
</style>
</head>
<body>
<div class="page">
<div class="header">
  <h1>${title}</h1>
  <p>請將本頁列印或存為 PDF，與神連結，在指尖世界踩下最美腳蹤</p>
</div>
<div class="columns">
`;

        let currentWeek = '';
        let weekContent = '';
        
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('---') || line.startsWith('=')) return;
            
            // 匹配週次標題，例如 🟢 第一週：微步啟航
            const weekMatch = line.match(/^[\uD800-\uDBFF\uDC00-\uDFFF\u2000-\u3300\uFE0F]*\s*(第[一二三四]週.*|🏁.*)/);
            if (weekMatch) {
                if (weekContent) {
                    htmlStr += `<div class="week-group"><div class="week-title">${currentWeek}</div>${weekContent}</div>`;
                }
                currentWeek = line;
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
            htmlStr += `<div class="week-group"><div class="week-title">${currentWeek}</div>${weekContent}</div>`;
        }

        htmlStr += `</div></div></body></html>`;
        fs.writeFileSync(destPath, htmlStr, 'utf8');
        console.log(`Generated ${destPath}`);
    } catch (e) {
        console.error(e);
    }
}

buildHtml('data/Action_Plan01_Prayer.md', 'print_prayer.html', '🙏 禱告大軍：30天數位守望行動');
buildHtml('data/Action_Plan02_Sabbath.md', 'print_sabbath.html', '🌿 數位安息：30天行動指南');
