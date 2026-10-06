const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/mohfa/OneDrive/Desktop/WebProfile-STX/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf-8');
    const newContent = content.replace(/STX<span class="text-accent-blue">\.GG<\/span>/g, 'STX <span class="text-accent-blue">OFFICIAL</span>');
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log('Updated', f);
    }
});

const serverPath = path.join(dir, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf-8');
const newServerContent = serverContent.replace(/siteName: "STX\.GG",/g, 'siteName: "STX OFFICIAL",');
if (newServerContent !== serverContent) {
    fs.writeFileSync(serverPath, newServerContent, 'utf-8');
    console.log('Updated server.js');
}
