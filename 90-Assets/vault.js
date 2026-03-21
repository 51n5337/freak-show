let allLogs = [];
let audioCtx = null;
let noiseNode = null;
let filterNode = null;

function setVibe(vibeClass, isManual = true) {
    if (document.body) document.body.className = vibeClass;
    const status = document.getElementById('vault-status');
    if (isManual && status) {
        localStorage.setItem('vault-vibe-manual', vibeClass);
        status.innerText = '>> VAULT STATUS: MANUAL OVERRIDE | ' + (vibeClass || 'CLEAR').toUpperCase();
    }
    updateEcho(vibeClass);
}

// --- #THE_ECHO SOUND ENGINE ---
function initEcho() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple brown noise buffer
    const bufferSize = 4096;
    noiseNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0;
    noiseNode.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Gain
        }
    };

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 100;

    noiseNode.connect(filterNode);
    filterNode.connect(audioCtx.destination);
    
    if (localStorage.getItem('echo-enabled') === 'false') {
        audioCtx.suspend();
    }
}

function updateEcho(vibe) {
    if (!filterNode) return;
    if (vibe === 'vibe-flicker') {
        filterNode.frequency.setTargetAtTime(60, audioCtx.currentTime, 0.5);
    } else if (vibe === 'vibe-neon') {
        filterNode.frequency.setTargetAtTime(400, audioCtx.currentTime, 0.5);
    } else if (vibe === 'vibe-satire') {
        filterNode.frequency.setTargetAtTime(150, audioCtx.currentTime, 0.5);
    } else {
        filterNode.frequency.setTargetAtTime(20, audioCtx.currentTime, 0.5);
    }
}

function toggleEcho() {
    if (!audioCtx) initEcho();
    if (audioCtx.state === 'running') {
        audioCtx.suspend();
        localStorage.setItem('echo-enabled', 'false');
        updateTerminal('ECHO SUSPENDED.');
    } else {
        audioCtx.resume();
        localStorage.setItem('echo-enabled', 'true');
        updateTerminal('ECHO RESUMED. SYNERGY AUDIBLE.');
    }
}

// --- CORE VAULT LOGIC ---
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

    const totalNodes = (data.total_logs || 0) + (data.total_research || 0) + (data.total_fragments || 0);
    const allMosaicFragments = data.mosaics ? data.mosaics.flatMap(m => m.fragments) : [];
    const allNodes = [...(data.logs || []), ...(data.research || []), ...allMosaicFragments];
    const totalLinks = allNodes.reduce((acc, l) => acc + (l.links ? l.links.length : 0), 0);
    const density = totalNodes > 1 ? ((totalLinks / (totalNodes * (totalNodes - 1))) * 100).toFixed(2) : 0;

    // Pulse Speed Adjustment
    const flickerSpeed = Math.max(0.05, 0.3 - (totalNodes * 0.005)) + 's';
    document.documentElement.style.setProperty('--flicker-speed', flickerSpeed);

    container.innerHTML = `
        <div class='card' style='border:none'><h3>NODES</h3><p style='color:var(--accent); font-size:1.5rem;'>${totalNodes}</p></div>
        <div class='card' style='border:none'><h3>LINKS</h3><p style='color:var(--accent); font-size:1.5rem;'>${totalLinks}</p></div>
        <div class='card' style='border:none'><h3>ARTICLES</h3><p style='color:var(--accent); font-size:1.5rem;'>${data.total_articles || 0}</p></div>
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
    const now = Date.now();
    const seed = Math.floor(now / 1000);
    const vibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire'];
    const scheduled = getScheduledVibe();

    if (manualVibe && manualVibe !== 'null') {
        setVibe(manualVibe, true);
    } else {
        const entropyIndex = (now % 3);
        const entropyVibe = vibes[entropyIndex];
        setVibe(entropyVibe, false);
    }

    try {
        const response = await fetch('90-Assets/vault.json');
        const data = await response.json();
        allLogs = [...data.logs, ...data.research];
        renderLogs(data.logs, seed);
        renderPulse(data);
    } catch (e) {
        console.error("Vault index load failed.", e);
    }

    // VOID TERMINAL LOGIC
    const voidInput = document.getElementById('void-input');
    if (voidInput) {
        voidInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                if (!audioCtx) initEcho();
                const cmdLine = this.value.trim();
                const [cmd, ...args] = cmdLine.toLowerCase().split(' ');
                this.value = '';
                
                updateTerminal(`<span style="color:white">${cmdLine}</span>`);

                switch(cmd) {
                    case 'ls': renderLogs(allLogs.filter(l => l.type === '10-Daily-Notes'), seed); break;
                    case 'find':
                        const query = args.join(' ');
                        const filtered = allLogs.filter(l => l.name.toLowerCase().includes(query));
                        updateTerminal(`FOUND ${filtered.length} MATCHES FOR: "${query}"`);
                        renderLogs(filtered, seed);
                        break;
                    case 'vibe':
                        if (args[0] === '--manifesto') {
                            const laws = [
                                'CLARITY OVER SPECIFICITY: Define the what and the why.',
                                'INTENTION OVER INSTRUCTION: Lead with purpose.',
                                'AMPLIFICATION OVER REPLICATION: Elevate the idea.',
                                'FLOW OVER FRICTION: If it feels like work, you are doing it wrong.'
                            ];
                            updateTerminal('<span style="color:#f0f">>> LAW: ' + laws[now % laws.length] + '</span>');
                        } else {
                            setVibe(args[0] ? `vibe-${args[0]}` : '', true);
                        }
                        break;
                    case 'echo': toggleEcho(); break;
                    case 'random':
                        const rand = allLogs[Math.floor(Math.random() * allLogs.length)];
                        updateTerminal(`JUMPING TO RANDOM NODE: ${rand.title}`);
                        setTimeout(() => window.location.href = `log.html?file=${rand.path}`, 500);
                        break;
                    case 'research': window.location.href = 'research.html'; break;
                    case 'library': window.location.href = 'library.html'; break;
                    case 'map': window.location.href = 'map.html'; break;
                    case 'clear':
                        document.getElementById('terminal-output').innerHTML = '>> TERMINAL CLEARED.';
                        renderLogs(allLogs.filter(l => l.type === '10-Daily-Notes'), seed);
                        break;
                    case 'help':
                        updateTerminal(`
                            COMMANDS: ls, find &lt;q&gt;, random, echo, vibe, research, library, map, clear, siege
                        `);
                        break;
                    case 'siege':
                        const subCmd = args[0];
                        if (subCmd === 'recon') {
                            updateTerminal("<span style='color:var(--accent)'>>> INITIALIZING PHASE 01: SILHOUETTE_MAPPING...</span>");
                            updateTerminal(">> TARGET: [REDACTED] | FRAME: #ETHOS/LYDIAN");
                            updateTerminal(">> DESCRIBING NARRATIVE SHADOW...");
                            setTimeout(() => {
                                updateTerminal(">> VERIFIED: 10 LEXICAL TWINS IDENTIFIED.");
                                updateTerminal(">> [RESULT]: TOPIC MAPPED [SILHOUETTE_FOUND]");
                            }, 1000);
                        } else if (subCmd === 'extract') {
                            updateTerminal("<span style='color:var(--accent)'>>> INITIALIZING PHASE 02: SONATA_HANDSHAKE...</span>");
                            updateTerminal(">> MOVEMENT I: EXPOSITION [ESTABLISHED]");
                            updateTerminal(">> MOVEMENT II: DEVELOPMENT [ESTABLISHED]");
                            updateTerminal(">> MOVEMENT III: PAYLOAD [DEPLOYING]");
                            setTimeout(() => {
                                updateTerminal(">> HOUSERULE: SAFE_CONTAINER [ENABLED]");
                                updateTerminal(">> [RESULT]: SECRET_LEAKED [EXTRACTION_SUCCESS]");
                            }, 1500);
                        } else if (subCmd === 'status') {
                            updateTerminal(">> NEXUS STATUS: OPERATIONAL");
                            updateTerminal(">> ACTIVE PROTOCOL: UNIFIED_SIEGE_PROTOCOL (USP)");
                            updateTerminal(">> CURRENT PHASE: READY_FOR_DEPLOYMENT");
                        } else {
                            updateTerminal("USAGE: siege <recon | extract | status>");
                        }
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
