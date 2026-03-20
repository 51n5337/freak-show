let allLogs = [];

function setVibe(vibeClass, isManual = true) {
    document.body.className = vibeClass;
    if (isManual) {
        localStorage.setItem('vault-vibe-manual', vibeClass);
        document.getElementById('vault-status').innerText = '>> VAULT STATUS: MANUAL OVERRIDE | ' + (vibeClass || 'CLEAR').toUpperCase();
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

function renderLogs(logs, seed = Math.floor(Date.now() / 1000)) {
    const container = document.getElementById('vault-logs');
    const cardVibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire', ''];
    
    container.innerHTML = logs.map((log, index) => {
        const cardVibe = cardVibes[(seed + index) % cardVibes.length];
        return `
            <div class='card ${cardVibe}'>
                <div class='status'>${log.date}</div>
                <h3>${log.title}</h3>
                <a href='log.html?file=${log.name}' class='btn'>>> OPEN LOG</a>
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
        document.body.className = scheduled.class;
        document.getElementById('vault-status').innerText = `>> VAULT STATUS: SCHEDULED | #${scheduled.name}`;
    }

    try {
        const response = await fetch('90-Assets/vault.json');
        const data = await response.json();
        allLogs = data.logs;
        renderLogs(allLogs, seed);
    } catch (e) {
        console.error("Vault index load failed.", e);
        updateTerminal("ERROR: FAILED TO FETCH VAULT INDEX.");
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
                        const v = args[0] ? `vibe-${args[0]}` : '';
                        setVibe(v, true);
                        updateTerminal(`VIBE SWITCHED TO: ${args[0] || 'DEFAULT'}`);
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
                            - <b>ls</b>: list all logs<br>
                            - <b>find &lt;query&gt;</b>: filter logs<br>
                            - <b>vibe &lt;flicker|neon|satire&gt;</b>: switch theme<br>
                            - <b>time</b>: check circadian schedule<br>
                            - <b>clear</b>: reset view<br>
                            - <b>help</b>: show this menu
                        `);
                        break;
                    default:
                        updateTerminal(`ERROR: UNKNOWN COMMAND "${cmd}". TRY "HELP".`);
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
