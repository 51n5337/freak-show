function setVibe(vibeClass) {
    document.body.className = vibeClass;
    localStorage.setItem('vault-vibe', vibeClass);
}

async function loadVault() {
    const savedVibe = localStorage.getItem('vault-vibe');
    if (savedVibe) setVibe(savedVibe);

    const response = await fetch('90-Assets/vault.json');
    const logs = await response.json();
    const container = document.getElementById('vault-logs');
    
    const vibes = ['vibe-flicker', 'vibe-neon', 'vibe-satire', ''];
    
    container.innerHTML = logs.map(log => {
        const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
        return 
            <div class='card '>
                <div class='status'></div>
                <h3></h3>
                <a href='https://github.com/51n5337/freak-show/blob/main/10-Daily-Notes/' target='_blank' class='btn'>>> VIEW RAW</a>
            </div>
        ;
    }).join('');
}
window.onload = loadVault;
