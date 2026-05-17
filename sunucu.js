let currentServer = { 
    name: '', type: 'vanilla', version: '', 
    domainName: '', isOnline: false 
};

function handleWizardSubmit(e) {
    e.preventDefault();
    
    // Elementleri tek tek yakala
    const nameInput = document.getElementById('server-name-input');
    const typeSelect = document.getElementById('server-type-select');
    const versionSelect = document.getElementById('server-version-select');
    const domainInput = document.getElementById('domain-sub-input');

    if(!nameInput || !typeSelect || !versionSelect || !domainInput) return;

    // Veri atamaları
    currentServer.name = nameInput.value;
    currentServer.type = typeSelect.value;
    currentServer.version = versionSelect.value;
    currentServer.domainName = domainInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + ".free.minehost.me";

    // Adım değiştirme
    document.getElementById('step-wizard').classList.add('hidden');
    document.getElementById('step-panel').classList.remove('hidden');
    
    // Paneli güncelle
    document.getElementById('panel-server-title').innerText = currentServer.name;
    document.getElementById('panel-server-domain').innerText = currentServer.domainName;
    document.getElementById('panel-server-ver').innerText = `Sürüm: ${currentServer.version} (${currentServer.type})`;
    document.getElementById('info-ver').innerText = `Minecraft ${currentServer.version}`;
    
    logToConsole(`[Sistem] Sunucu ${currentServer.version} sürümüne ayarlandı.`);
    logToConsole(`[Sistem] Multiplayer portları (25565) hazırlandı.`);
}

function startServer() {
    if(currentServer.isOnline) return;

    const badge = document.getElementById('status-badge');
    badge.innerText = "Yükleniyor...";
    badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400";
    
    logToConsole("[Sistem] Çekirdek dosyaları kontrol ediliyor...");
    
    setTimeout(() => {
        currentServer.isOnline = true;
        badge.innerText = "Çevrimiçi";
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400";
        
        document.getElementById('btn-start').className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed";
        document.getElementById('btn-stop').className = "w-full bg-red-500 text-white font-bold py-3 rounded-xl";
        
        logToConsole(`[Sistem] Multiplayer sunucu ${currentServer.version} sürümünde AKTİF.`);
        logToConsole(`[Tünel] Adresiniz: ${currentServer.domainName}`);
    }, 2000);
}

function stopServer() {
    if(!currentServer.isOnline) return;
    logToConsole("[Sistem] Kapatılıyor...");
    setTimeout(() => location.reload(), 800);
}

function logToConsole(msg) {
    const box = document.getElementById('console-logs');
    if(!box) return;
    const div = document.createElement('div');
    div.className = "mb-1 text-slate-400 border-l border-slate-700 pl-2";
    div.innerHTML = `<span class="text-green-500 font-bold">></span> ${msg}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
