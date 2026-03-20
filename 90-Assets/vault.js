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

function renderLogs(logs, seed = Math.floor(Date.now() / 1000)) {
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
    const manualVibe = localStorage.getItem('vault-vibe-manual');
    const seed = Math.floor(Date.now() / 1000);
    const scheduled = getScheduledVibe();

    if (manualVibe && manualVibe !== 'null') {
        setVibe(manualVibe, true);
    } else {
        if (document.body) document.body.className = scheduled.class;
        const status = document.getElementById('vault-status');
        if (status) status.innerText = `>> VAULT STATUS: SCHEDULED | #${scheduled.name}`;
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
                    case 'ls':
                        updateTerminal(`LISTING ${allLogs.length} LOGS...`);
                        renderLogs(allLogs);
                        break;
                    case 'find':
                    case 'grep':
                        const query = args.join(' ');
                        const filtered = allLogs.filter(l => l.name.toLowerCase().includes(query));
                        updateTerminal(`FOUND ${filtered.length} MATCHES FOR: "${query}"`);
                        renderLogs(filtered);
                        break;
                    case 'vibe':
                        if (args[0] === '--manifesto') {
                            const laws = [
                                'CLARITY OVER SPECIFICITY: Define the what and the why.',
                                'INTENTION OVER INSTRUCTION: Lead with purpose, not commands.',
                                'AMPLIFICATION OVER REPLICATION: Let the AI elevate your idea.',
                                'FLOW OVER FRICTION: If it feels like work, you are doing it wrong.'
                            ];
                            const law = laws[Math.floor(Math.random() * laws.length)];
                            updateTerminal('<span style="color:#f0f">>> LAW OF CREATION: ' + law + '</span>');
                        } else {
                            const v = args[0] ? 'vibe-' + args[0] : '';
                            setVibe(v, true);
                            updateTerminal('VIBE SWITCHED TO: ' + (args[0] || 'DEFAULT'));
                        }
                        break;
                    case 'research':
                        updateTerminal('ACCESSING RESEARCH VAULT...');
                        window.location.href = 'research.html';
                        break;
                    case 'time':
                        const now = new Date();
                        updateTerminal(`CURRENT TIME: ${now.toLocaleTimeString()} | SCHEDULED: #${scheduled.name}`);
                        break;
                    case 'clear':
                        document.getElementById('terminal-output').innerHTML = '>> TERMINAL CLEARED.';
                        renderLogs(allLogs);
                        break;
                    case 'help':
                        updateTerminal(`
                            COMMANDS:<br>
                            - <b>ls</b>: list logs<br>
                            - <b>find &lt;query&gt;</b>: filter logs<br>
                            - <b>vibe --manifesto</b>: show a law of creation<br>
                            - <b>vibe &lt;name&gt;</b>: switch theme<br>
                            - <b>research</b>: enter research nexus<br>
                            - <b>time</b>: check schedule<br>
                            - <b>clear</b>: reset<br>
                            - <b>help</b>: show this menu
                        `);
                        break;
                    default:
                        updateTerminal(`ERROR: UNKNOWN COMMAND "${cmd}".`);
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
