const fs = require('fs');
const path = require('path');

const notesDir = path.join(__dirname, '../../10-Daily-Notes');
const researchDir = path.join(__dirname, '../../12-Active-Memory');
const mosaicsDir = path.join(__dirname, '../../12-Active-Memory/Mosaics');
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
                content: content
            };
        });
}

function processMosaics(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const mosaicName = dirent.name;
            const mosaicPath = path.join(dir, mosaicName);
            const fragments = fs.readdirSync(mosaicPath)
                .filter(file => file.endsWith('.md'))
                .map(file => {
                    const filePath = path.join(mosaicPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        path: '12-Active-Memory/Mosaics/' + mosaicName + '/' + file,
                        title: file.replace('.md', ''),
                        date: stats.mtime.toISOString().replace('T', ' ').substring(0, 16),
                        type: 'mosaic-fragment',
                        content: content
                    };
                });
            return {
                name: mosaicName,
                fragments: fragments
            };
        });
}

try {
    const logs = processDir(notesDir, '10-Daily-Notes');
    const research = processDir(researchDir, '12-Active-Memory');
    const mosaics = processMosaics(mosaicsDir);
    
    // Flatten fragments for graph and total counts
    const allMosaicFragments = mosaics.flatMap(m => m.fragments);
    const allNodes = [...logs, ...research, ...allMosaicFragments];

    // Parse Reading List
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

    // Build Graph Data
    const graphNodes = allNodes.map(n => ({ id: n.title, type: n.type }));
    const graphLinks = [];
    // Currently, mosaic fragments don't have wiki-link parsing enabled in the simple map above.
    // If they did, we'd process them here. For now, we just link standard nodes.
    // Actually, processDir does link parsing, processMosaics does not. 
    // Let's leave graph linking for Mosaics as a future enhancement or add it if needed.
    
    // Only standard nodes have 'links' property populated in processDir.
    [...logs, ...research].forEach(source => {
        source.links.forEach(target => {
            if (allNodes.some(n => n.title === target)) {
                graphLinks.push({ source: source.title, target: target });
            }
        });
    });

    const vaultData = {
        last_update: new Date().toISOString(),
        total_logs: logs.length,
        total_research: research.length,
        total_mosaics: mosaics.length,
        logs: logs,
        research: research,
        mosaics: mosaics,
        library: readingEntries,
        graph: {
            nodes: graphNodes,
            links: graphLinks
        }
    };

    fs.writeFileSync(outputFile, JSON.stringify(vaultData, null, 2));
    console.log('✅ The Canopy is mapped: ' + allNodes.length + ' neural nodes indexed (' + mosaics.length + ' mosaics).');
} catch (err) {
    console.error('❌ Mapping failed:', err);
    process.exit(1);
}
