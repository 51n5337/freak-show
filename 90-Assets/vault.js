async function loadVault() {
    const response = await fetch('90-Assets/vault.json');
    const logs = await response.json();
    const container = document.getElementById('vault-logs');
    
    container.innerHTML = logs.map(log => 
        <div class='card log-entry'>
            <div class='status'></div>
            <h3></h3>
            <a href='https://github.com/51n5337/freak-show/blob/main/10-Daily-Notes/' target='_blank' class='btn'>>> VIEW RAW</a>
        </div>
    ).join('');
}
window.onload = loadVault;