const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../../10-Daily-Notes');
const outputFile = path.join(__dirname, '../../90-Assets/vault.json');

try {
    const files = fs.readdirSync(notesDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const filePath = path.join(notesDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            
            // Extract [[WikiLinks]]
            const links = [];
            const wikiLinkRegex = /\[\[(.*?)\]\]/g;
            let match;
            while ((match = wikiLinkRegex.exec(content)) !== null) {
                links.push(match[1]);
            }

            return {
                name: file,
                title: file.replace('.md', ''),
                date: stats.mtime.toISOString().replace('T', ' ').substring(0, 16),
                links: links,
                size: stats.size
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    // Build a simple "backlink" map
    const vaultData = {
        last_update: new Date().toISOString(),
        total_logs: files.length,
        logs: files
    };

    fs.writeFileSync(outputFile, JSON.stringify(vaultData, null, 2));
    console.log('✅ The Loom has spun: ' + files.length + ' nodes mapped.');
} catch (err) {
    console.error('❌ The Loom broke:', err);
    process.exit(1);
}
