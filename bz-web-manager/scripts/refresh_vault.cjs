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
                type: type,
                content: content // Adding raw content for specific parsing
            };
        });
}

try {
    const logs = processDir(notesDir, '10-Daily-Notes');
    const research = processDir(researchDir, '12-Active-Memory');
    
    // Parse Reading List entries
    const readingListNode = research.find(r => r.name === '06-READING-LIST.md');
    const readingEntries = [];
    if (readingListNode) {
        const sections = readingListNode.content.split('### ').slice(1);
        sections.forEach(s => {
            const lines = s.split('\n');
            const title = lines[0].trim();
            const linkMatch = s.match(/\[(.*?)\]\((.*?)\)/);
            const summaryMatch = s.match(/- \*\*Summary\*\*: (.*)/);
            const tagsMatch = s.match(/- \*\*Tags\*\*: (.*)/);
            
            readingEntries.push({
                title: title,
                link: linkMatch ? linkMatch[2] : '#',
                summary: summaryMatch ? summaryMatch[1] : '',
                tags: tagsMatch ? tagsMatch[1].split(', ') : []
            });
        });
    }

    const vaultData = {
        last_update: new Date().toISOString(),
        total_logs: logs.length,
        total_research: research.length,
        logs: logs,
        research: research,
        library: readingEntries
    };

    fs.writeFileSync(outputFile, JSON.stringify(vaultData, null, 2));
    console.log('✅ Library Nexus updated: ' + readingEntries.length + ' sources mapped.');
} catch (err) {
    console.error('❌ Integration failed:', err);
    process.exit(1);
}
