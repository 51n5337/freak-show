const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../../10-Daily-Notes');
const outputFile = path.join(__dirname, '../../90-Assets/vault.json');

try {
    const files = fs.readdirSync(notesDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const stats = fs.statSync(path.join(notesDir, file));
            return {
                name: file,
                date: stats.mtime.toISOString().replace('T', ' ').substring(0, 16)
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    fs.writeFileSync(outputFile, JSON.stringify(files, null, 2));
    console.log('✅ Vault index refreshed: ' + files.length + ' logs detected.');
} catch (err) {
    console.error('❌ Failed to refresh vault index:', err);
    process.exit(1);
}