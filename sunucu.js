// Sihirbaz formu gönderildiğinde çalışan fonksiyon
function handleWizardSubmit(e) {
    e.preventDefault();
    currentServer.name = document.getElementById('server-name-input').value;
    currentServer.type = document.getElementById('server-type-select').value;
    
    // HTML'deki <select> elementinden seçilen sürümü alıyoruz
    currentServer.version = document.getElementById('server-version-select').value; 
    
    const subDomain = document.getElementById('domain-sub-input').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if(currentServer.domainType === 'free') {
        currentServer.domainName = `${subDomain}.free.minehost.me`;
        initPanelLayout();
    } else {
        const ext = document.getElementById('domain-premium-select').value;
        currentServer.domainName = `${subDomain}${ext}`;
        document.getElementById('checkout-domain-display').innerText = currentServer.domainName;
        document.getElementById('step-wizard').classList.add('hidden');
        document.getElementById('step-checkout').classList.remove('hidden');
    }
}

// Sunucuyu gerçekten başlatan (WebSocket sinyalini gönderen) fonksiyon
function triggerActualBoot() {
    updateStatusBadge('loading');
    if(ws && ws.readyState === WebSocket.OPEN) {
        // Seçilen sürüm ve türü WebSocket üzerinden arka plandaki server.js'e gönderiyoruz
        ws.send(JSON.stringify({ 
            action: 'start', 
            type: currentServer.type, 
            version: currentServer.version, // Örn: "1.20.4" veya "1.12.2"
            domain: currentServer.domainName 
        }));
    } else {
        logToConsole(`[Hata] Yerel kontrol servisine sinyal gönderilemedi. Bağlantı yok.`, 'warn');
        updateStatusBadge('offline');
        document.getElementById('btn-start').className = "bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
    }
}
