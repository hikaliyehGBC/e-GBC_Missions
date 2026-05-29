const fs = require('fs');

const files = [
    { key: 'action1', path: 'data/Action_Plan01_Prayer.md' },
    { key: 'action2', path: 'data/Action_Plan02_Sabbath.md' },
    { key: 'action3', path: 'data/Action_Plan03_Light.md' }
];

const calendarData = {};
for (let i = 1; i <= 30; i++) {
    const dayStr = String(i).padStart(2, '0');
    calendarData[`06-${dayStr}`] = { 
        action1: { weekday: '', topic: '', content: '' }, 
        action2: { weekday: '', topic: '', content: '' }, 
        action3: { weekday: '', topic: '', content: '' } 
    };
}

files.forEach(fileObj => {
    try {
        const content = fs.readFileSync(fileObj.path, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
            // Regex to match: [ ] 6/X (週Y・主題)： 內容
            const match = line.match(/\[\s*\]\s*6\/(\d+)\s*\((.*?)\)[：:]\s*(.*)/);
            if (match) {
                const day = parseInt(match[1]);
                if (day >= 1 && day <= 30) {
                    const dayStr = String(day).padStart(2, '0');
                    const rawTopic = match[2].trim();
                    const text = match[3].trim();
                    
                    let weekday = '';
                    let topic = rawTopic;
                    
                    if (rawTopic.includes('・')) {
                        const parts = rawTopic.split('・');
                        weekday = parts[0];
                        topic = parts.slice(1).join('・');
                    }
                    
                    calendarData[`06-${dayStr}`][fileObj.key] = {
                        weekday: weekday,
                        topic: topic,
                        content: text
                    };
                }
            }
        });
    } catch (e) {
        console.error('Error reading ' + fileObj.path, e);
    }
});

let output = '// 宣教行動月曆 6月1日 - 6月30日資料\n';
output += 'const calendarData = ' + JSON.stringify(calendarData, null, 2) + ';\n';

fs.writeFileSync('data.js', output, 'utf8');
console.log('data.js successfully generated with new object structure!');
