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

async function loadVault() {
    const vibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire'];
    const manualVibe = localStorage.getItem('vault-vibe-manual');
    const seed = Math.floor(Date.now() / 1000);
    const entropyVibe = vibes[seed % vibes.length];

    if (manualVibe && manualVibe !== 'null') {
        setVibe(manualVibe, true);
    } else {
        setVibe(entropyVibe, false);
        const phrase = corruptedPhrases[seed % corruptedPhrases.length];
        document.getElementById('vault-status').innerText = phrase;
    }

    try {
        const response = await fetch('90-Assets/vault.json');
        const logs = await response.json();
        const container = document.getElementById('vault-logs');
        
        const cardVibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire', ''];
        
        container.innerHTML = logs.map((log, index) => {
            const cardVibe = cardVibes[(seed + index) % cardVibes.length];
            return `
                <div class='card ${cardVibe}'>
                    <div class='status'>${log.date}</div>
                    <h3>${log.name.replace('.md', '')}</h3>
                    <a href='log.html?file=${log.name}' class='btn'>>> OPEN LOG</a>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error("Vault index load failed.", e);
    }

    // VOID TERMINAL LOGIC
    const voidInput = document.getElementById('void-input');
    if (voidInput) {
        voidInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const val = this.value;
                console.log("VOID DIGESTED:", val);
                this.value = '';
                const prompt = document.querySelector('.void-prompt');
                prompt.innerText = '>> DIGESTING...';
                setTimeout(() => {
                    prompt.innerText = '>> FEED THE VOID:';
                }, 1000);
            }
        });
    }
}

function clearManual() {
    localStorage.removeItem('vault-vibe-manual');
    location.reload();
}

window.onload = loadVault;
