let currentServer = { 
    name: '', type: 'vanilla', version: '26.1.2', 
    domainName: '', isOnline: false, inQueue: false, queuePos: 0 
};

function handleWizardSubmit(e) {
    e.preventDefault();
    
    const nameEl = document.getElementById('server-name-input');
    const typeEl = document.getElementById('server-type-select');
    const versionEl = document.getElementById('server-version-select');
    const domainEl = document.getElementById('domain-sub-input');

    if(!nameEl || !typeEl || !versionEl || !domainEl) {
        alert("Eksik alanlar var!");
        return;
    }

    currentServer.name = nameEl.value;
    currentServer.type = typeEl.value;
    currentServer.version = versionEl.value;
    currentServer.domainName = domainEl.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '') + ".free.minehost.me";

    document.getElementById('step-wizard').classList.add('hidden');
    document.getElementById('step-panel').classList.remove('hidden');
    
    document.getElementById('panel-server-title').innerText = currentServer.name;
    document.getElementById('panel-server-domain').innerText = currentServer.domainName;
    document.getElementById('panel-server-version').innerText = `Sürüm: ${currentServer.version} (${currentServer.type})`;
    
    logToConsole(`[Sistem] Sunucu ${currentServer.version} sürümü ile yapılandırıldı.`);
}

function startServer() {
    if(currentServer.isOnline || currentServer.inQueue) return;

    currentServer.inQueue = true;
    currentServer.queuePos = Math.floor(Math.random() * 5) + 3;
    
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
            logToConsole(`[Kuyruk] Sıra bekleniyor... Kalan: ${currentServer.queuePos}`);
        }
    }, 1500);
}

function bootServer() {
    currentServer.isOnline = true;
    const badge = document.getElementById('status-badge');
    badge.innerText = "Çevrimiçi";
    badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400";
    
    document.getElementById('btn-start').className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed";
    document.getElementById('btn-stop').className = "w-full bg-red-500 text-white font-bold py-3 rounded-xl";
    
    logToConsole(`[Sistem] Sunucu ${currentServer.version} sürümü üzerinde başlatılıyor...`);
    setTimeout(() => logToConsole("[Sistem] Done! Port 25565 aktif."), 1000);
}

function stopServer() {
    if(!currentServer.isOnline) return;
    logToConsole("[Sistem] Kapatılıyor...");
    setTimeout(() => location.reload(), 1000);
}

function logToConsole(msg) {
    const box = document.getElementById('console-logs');
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
