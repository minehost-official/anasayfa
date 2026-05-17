let currentServer = { 
    name: '', type: 'vanilla', version: '1.20.6', 
    domainType: 'free', domainName: '', 
    isOnline: false, inQueue: false, queuePos: 0 
};

function handleWizardSubmit(e) {
    e.preventDefault();
    
    // Elementleri güvenli çek
    const nameEl = document.getElementById('server-name-input');
    const typeEl = document.getElementById('server-type-select');
    const versionEl = document.getElementById('server-version-select');
    const domainEl = document.getElementById('domain-sub-input');

    if(!nameEl || !typeEl || !versionEl || !domainEl) return;

    currentServer.name = nameEl.value;
    currentServer.type = typeEl.value;
    currentServer.version = versionEl.value;
    currentServer.domainName = domainEl.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + ".free.minehost.me";

    // Panele Geçiş
    document.getElementById('step-wizard').classList.add('hidden');
    document.getElementById('step-panel').classList.remove('hidden');
    
    document.getElementById('panel-server-title').innerText = currentServer.name;
    document.getElementById('panel-server-domain').innerText = currentServer.domainName;
    
    logToConsole(`[Sistem] Sunucu yapılandırıldı: ${currentServer.type} ${currentServer.version}`);
}

function startServer() {
    if(currentServer.isOnline || currentServer.inQueue) return;

    currentServer.inQueue = true;
    currentServer.queuePos = Math.floor(Math.random() * 5) + 5;
    
    document.getElementById('queue-card').classList.remove('hidden');
    document.getElementById('queue-number').innerText = currentServer.queuePos;
    
    const qInterval = setInterval(() => {
        currentServer.queuePos--;
        if(currentServer.queuePos <= 0) {
            clearInterval(qInterval);
            document.getElementById('queue-card').classList.add('hidden');
            currentServer.inQueue = false;
            bootServer();
        } else {
            document.getElementById('queue-number').innerText = currentServer.queuePos;
        }
    }, 2000);
}

function skipQueue() {
    currentServer.queuePos -= 3;
    if(currentServer.queuePos < 0) currentServer.queuePos = 0;
    document.getElementById('queue-number').innerText = currentServer.queuePos;
    logToConsole("[Sponsor] Reklam izlendi, sıra öne çekildi.");
}

function bootServer() {
    currentServer.isOnline = true;
    document.getElementById('status-badge').innerText = "Çevrimiçi";
    document.getElementById('status-badge').className = "px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400";
    document.getElementById('btn-start').className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed";
    document.getElementById('btn-stop').className = "w-full bg-red-500 text-white font-bold py-3 rounded-xl";
    
    logToConsole("[Sistem] Sunucu açılıyor...");
    setTimeout(() => logToConsole("[Sistem] Done! Sunucu aktif."), 1500);
    
    // Metrikleri Başlat
    setInterval(() => {
        if(!currentServer.isOnline) return;
        const ram = (Math.random() * 2 + 1).toFixed(1);
        document.getElementById('ram-bar').style.width = (ram / 4 * 100) + "%";
        document.getElementById('ram-text').innerText = `${ram}/4 GB`;
    }, 2000);
}

function stopServer() {
    if(!currentServer.isOnline) return;
    currentServer.isOnline = false;
    location.reload(); // En temiz durdurma sayfayı yenilemek
}

function logToConsole(msg) {
    const box = document.getElementById('console-logs');
    const div = document.createElement('div');
    div.innerText = msg;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
