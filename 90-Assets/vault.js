let allLogs = [];

function setVibe(vibeClass, isManual = true) {
    if (document.body) document.body.className = vibeClass;
    const status = document.getElementById('vault-status');
    if (isManual && status) {
        localStorage.setItem('vault-vibe-manual', vibeClass);
        status.innerText = '>> VAULT STATUS: MANUAL OVERRIDE | ' + (vibeClass || 'CLEAR').toUpperCase();
    }
}

const corruptedPhrases = [
    ">> VAULT STATUS: OPERATIONAL | #BZ ACTIVE",
    ">> ERROR: REALITY_SECTOR_NOT_FOUND",
    ">> WARNING: HEARTBEAT IRREGULAR",
    ">> SYNERGY_LEVEL: CRITICAL",
    ">> SYSTEM: EVERYTHING IS FINE (HA HA)",
    ">> [REDACTED] IS WATCHING",
    ">> LOVE LOADED. (CORRUPTED SECTOR)"
];

function getScheduledVibe() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { name: 'NEONVOMIT', class: 'vibe-neon' };
    if (hour >= 12 && hour < 18) return { name: 'DARKSATIRE', class: 'vibe-satire' };
    return { name: 'THEFLICKER', class: 'vibe-flicker' };
}

function updateTerminal(msg) {
    const output = document.getElementById('terminal-output');
    if (output) {
        output.innerHTML += `<div>>> ${msg}</div>`;
        output.scrollTop = output.scrollHeight;
    }
}

function renderPulse(data) {
    const container = document.getElementById('pulse-stats');
    if (!container) return;
    const totalNodes = (data.total_logs || 0) + (data.total_research || 0);
    const allNodes = [...(data.logs || []), ...(data.research || [])];
    const totalLinks = allNodes.reduce((acc, l) => acc + (l.links ? l.links.length : 0), 0);
    const density = totalNodes > 1 ? ((totalLinks / (totalNodes * (totalNodes - 1))) * 100).toFixed(2) : 0;
    container.innerHTML = `
        <div class='card' style='border:none'><h3>NODES</h3><p style='color:var(--accent); font-size:1.5rem;'>${totalNodes}</p></div>
        <div class='card' style='border:none'><h3>LINKS</h3><p style='color:var(--accent); font-size:1.5rem;'>${totalLinks}</p></div>
        <div class='card' style='border:none'><h3>DENSITY</h3><p style='color:var(--accent); font-size:1.5rem;'>${density}%</p></div>
    `;
}

function renderLogs(logs, seed) {
    const container = document.getElementById('vault-logs');
    if (!container) return;
    const cardVibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire', ''];
    container.innerHTML = logs.map((log, index) => {
        const cardVibe = cardVibes[(seed + index) % cardVibes.length];
        return `
            <div class='card ${cardVibe}'>
                <div class='status'>${log.date}</div>
                <h3>${log.title}</h3>
                <a href='log.html?file=${log.path}' class='btn'>>> OPEN LOG</a>
            </div>
        `;
    }).join('');
}

async function loadVault() {
    const vibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire'];
    const manualVibe = localStorage.getItem('vault-vibe-manual');
    
    // IMPROVED ENTROPY: Seed using timestamp to ensure variety
    const now = Date.now();
    const seed = Math.floor(now / 1000);
    const entropyIndex = (now % 3); // Purely based on milliseconds (0-2)
    const entropyVibe = vibes[entropyIndex];

    if (manualVibe && manualVibe !== 'null') {
        setVibe(manualVibe, true);
    } else {
        const status = document.getElementById('vault-status');
        if (document.body) document.body.className = entropyVibe;
        if (status) status.innerText = `>> VAULT STATUS: ENTROPY SEED [${now}] | #${entropyVibe.replace('vibe-', '').toUpperCase()}`;
    }

    try {
        const response = await fetch('90-Assets/vault.json');
        const data = await response.json();
        allLogs = data.logs;
        renderLogs(allLogs, seed);
        renderPulse(data);
    } catch (e) {
        console.error("Vault index load failed.", e);
    }

    // VOID TERMINAL LOGIC
    const voidInput = document.getElementById('void-input');
    if (voidInput) {
        voidInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const cmdLine = this.value.trim();
                const [cmd, ...args] = cmdLine.toLowerCase().split(' ');
                this.value = '';
                updateTerminal(`<span style="color:white">${cmdLine}</span>`);
                switch(cmd) {
                    case 'ls': renderLogs(allLogs, seed); break;
                    case 'find':
                    case 'grep':
                        const query = args.join(' ');
                        const filtered = allLogs.filter(l => l.name.toLowerCase().includes(query));
                        updateTerminal(`FOUND ${filtered.length} MATCHES FOR: "${query}"`);
                        renderLogs(filtered, seed);
                        break;
                    case 'vibe':
                        if (args[0] === '--manifesto') {
                            const laws = [
                                'CLARITY OVER SPECIFICITY: Define the what and the why.',
                                'INTENTION OVER INSTRUCTION: Lead with purpose, not commands.',
                                'AMPLIFICATION OVER REPLICATION: Let the AI elevate your idea.',
                                'FLOW OVER FRICTION: If it feels like work, you are doing it wrong.'
                            ];
                            updateTerminal('<span style="color:#f0f">>> LAW OF CREATION: ' + laws[now % laws.length] + '</span>');
                        } else {
                            setVibe(args[0] ? `vibe-${args[0]}` : '', true);
                        }
                        break;
                    case 'research': window.location.href = 'research.html'; break;
                    case 'clear':
                        document.getElementById('terminal-output').innerHTML = '>> TERMINAL CLEARED.';
                        renderLogs(allLogs, seed);
                        break;
                    case 'help':
                        updateTerminal(`COMMANDS: ls, find <query>, vibe --manifesto, vibe <name>, research, time, clear, help`);
                        break;
                    default: updateTerminal(`ERROR: UNKNOWN COMMAND "${cmd}".`);
                }
            }
        });
    }
}

function clearManual() {
    localStorage.removeItem('vault-vibe-manual');
    location.reload();
}

window.onload = loadVault;
