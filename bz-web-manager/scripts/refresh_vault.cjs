const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../../10-Daily-Notes');
const researchDir = path.join(__dirname, '../../12-Active-Memory');
const outputFile = path.join(__dirname, '../../90-Assets/vault.json');

function processDir(dir, type) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const stats = fs.statSync(filePath);
            const links = [];
            const wikiLinkRegex = /\[\[(.*?)\]\]/g;
            let match;
            while ((match = wikiLinkRegex.exec(content)) !== null) {
                links.push(match[1]);
            }
            return {
                name: file,
                path: type + '/' + file,
                title: file.replace('.md', ''),
                date: stats.mtime.toISOString().replace('T', ' ').substring(0, 16),
                links: links,
                type: type
            };
        });
}

try {
    const logs = processDir(notesDir, '10-Daily-Notes');
    const research = processDir(researchDir, '12-Active-Memory');
    const allNodes = [...logs, ...research].sort((a, b) => b.date.localeCompare(a.date));

    const vaultData = {
        last_update: new Date().toISOString(),
        total_logs: logs.length,
        total_research: research.length,
        logs: logs,
        research: research
    };

    fs.writeFileSync(outputFile, JSON.stringify(vaultData, null, 2));
    console.log('? Research nodes integrated: ' + research.length + ' memory nodes detected.');
} catch (err) {
    console.error('? Integration failed:', err);
    process.exit(1);
}
