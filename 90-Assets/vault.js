function setVibe(vibeClass, isManual = true) {
    document.body.className = vibeClass;
    if (isManual) {
        localStorage.setItem('vault-vibe-manual', vibeClass);
        document.getElementById('vault-status').innerText = '>> VAULT STATUS: MANUAL OVERRIDE | ' + (vibeClass || 'CLEAR').toUpperCase();
    }
}

async function loadVault() {
    const vibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire'];
    const manualVibe = localStorage.getItem('vault-vibe-manual');
    
    // THE ENTROPY ENGINE: Seeded by current second
    const seed = Math.floor(Date.now() / 1000);
    const entropyVibe = vibes[seed % vibes.length];

    if (manualVibe && manualVibe !== 'null') {
        setVibe(manualVibe, true);
    } else {
        setVibe(entropyVibe, false);
        document.getElementById('vault-status').innerText = '>> VAULT STATUS: ENTROPY SEED [' + seed + '] | ' + entropyVibe.replace('vibe-', '').toUpperCase();
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
                    <a href='https://github.com/51n5337/freak-show/blob/main/10-Daily-Notes/${log.name}' target='_blank' class='btn'>>> VIEW RAW</a>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error("Vault index load failed.", e);
    }
}

function clearManual() {
    localStorage.removeItem('vault-vibe-manual');
    location.reload();
}

window.onload = loadVault;
