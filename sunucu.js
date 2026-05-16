let currentServer = { 
    name: '', 
    type: 'vanilla', 
    version: '1.20.4', 
    domainType: 'free', 
    domainName: '', 
    isOnline: false, 
    inQueue: false, 
    queuePos: 0 
};

let statsInterval = null;
const socketUrl = "ws://localhost:8080"; 
let ws = null;

function handleTypeChange() {
    const type = document.getElementById('server-type-select').value;
    currentServer.type = type;
}

function setDomainType(type) {
    currentServer.domainType = type;
    const freeCard = document.getElementById('domain-type-free'), premiumCard = document.getElementById('domain-type-premium');
    const addon = document.getElementById('domain-addon'), premSelect = document.getElementById('domain-premium-select'), wizardCard = document.getElementById('wizard-card');
    if(type === 'free') {
        freeCard.className = "border-2 border-green-500 bg-green-500/5 p-4 rounded-xl cursor-pointer space-y-1";
        premiumCard.className = "border-2 border-slate-800 bg-slate-900 p-4 rounded-xl cursor-pointer space-y-1 hover:border-slate-700";
        addon.classList.remove('hidden'); premSelect.classList.add('hidden');
        wizardCard.className = "glass p-8 rounded-2xl border border-slate-800/80 space-y-6 glow-green";
    } else {
        premiumCard.className = "border-2 border-amber-500 bg-amber-500/5 p-4 rounded-xl cursor-pointer space-y-1";
        freeCard.className = "border-2 border-slate-800 bg-slate-900 p-4 rounded-xl cursor-pointer space-y-1 hover:border-slate-700";
        addon.classList.add('hidden'); premSelect.classList.remove('hidden');
        wizardCard.className = "glass p-8 rounded-2xl border border-slate-800/80 space-y-6 glow-amber";
    }
}

function handleWizardSubmit(e) {
    e.preventDefault();
    currentServer.name = document.getElementById('server-name-input').value;
    currentServer.type = document.getElementById('server-type-select').value;
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

function handlePaymentSubmit(e) { 
    e.preventDefault(); 
    initPanelLayout(); 
}

function initPanelLayout() {
    document.getElementById('step-wizard').classList.add('hidden');
    document.getElementById('step-checkout').classList.add('hidden');
    document.getElementById('step-panel').classList.remove('hidden');
    
    document.getElementById('panel-server-title').innerText = currentServer.name;
    document.getElementById('panel-server-domain').innerText = currentServer.domainName;
    document.getElementById('panel-server-meta').innerText = `${currentServer.type.toUpperCase()} - ${currentServer.version}`;
    
    const modCard = document.getElementById('mod-manager-card');
    const modTitle = document.getElementById('mod-manager-title');
    if(currentServer.type === 'forge' || currentServer.type === 'fabric') {
        modCard.classList.remove('hidden');
        modTitle.innerHTML = `<i class="fas fa-box-open text-slate-400 mr-2"></i>Mod Yönetim Paneli`;
    } else if(currentServer.type === 'paper') {
        modCard.classList.remove('hidden');
        modTitle.innerHTML = `<i class="fas fa-plug text-slate-400 mr-2"></i>Plugin Yönetim Paneli`;
    } else {
        modCard.classList.add('hidden');
    }

    currentServer.isOnline = false; 
    updateStatusBadge('offline');
    document.getElementById('btn-start').className = "bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
    document.getElementById('btn-stop').className = "bg-slate-800 text-slate-500 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-not-allowed";
    
    connectWebSocket();
}

function connectWebSocket() {
    logToConsole(`[Sistem] Arka plan yerel kontrol servislerine bağlanılıyor...`);
    ws = new WebSocket(socketUrl);

    ws.onopen = () => {
        logToConsole(`[Sistem] Yerel Core API bağlantısı başarılı! Gerçek zamanlı tetikleyiciler aktif.`, 'success');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if(data.type === 'log') {
            logToConsole(data.message, data.style || 'info');
        } else if(data.type === 'status') {
            if(data.value === 'online') {
                currentServer.isOnline = true;
                updateStatusBadge('online');
                document.getElementById('btn-stop').className = "bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
                startLiveMetrics();
            } else if(data.value === 'offline') {
                currentServer.isOnline = false;
                updateStatusBadge('offline');
                document.getElementById('btn-start').className = "bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
                clearInterval(statsInterval);
                resetMetrics();
            }
        } else if(data.type === 'mod-list') {
            renderMods(data.files);
        }
    };

    ws.onerror = () => {
        logToConsole(`[Hata] Yerel sunucu kontrol yazılımı (server.js) arka planda çalışmıyor olabilir.`, 'warn');
    };

    ws.onclose = () => {
        logToConsole(`[Sistem] Yerel servis hattı kapatıldı.`);
    };
}

function startServer() {
    if(currentServer.isOnline || currentServer.inQueue) return;
    document.getElementById('btn-start').className = "bg-slate-800 text-slate-500 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-not-allowed";
    
    if(currentServer.domainType === 'free') {
        currentServer.inQueue = true; 
        currentServer.queuePos = Math.floor(Math.random() * 3) + 3;
        document.getElementById('queue-number').innerText = currentServer.queuePos;
        document.getElementById('queue-card').classList.remove('hidden');
        logToConsole(`[Kuyruk] Tünel limitleri kontrol ediliyor. Sıranız: ${currentServer.queuePos}`, 'warn');
        
        const queueInterval = setInterval(() => {
            if(!currentServer.inQueue) { clearInterval(queueInterval); return; }
            currentServer.queuePos--;
            if(currentServer.queuePos <= 0) {
                clearInterval(queueInterval); 
                document.getElementById('queue-card').classList.add('hidden');
                currentServer.inQueue = false; 
                triggerActualBoot();
            } else {
                document.getElementById('queue-number').innerText = currentServer.queuePos;
                logToConsole(`[Kuyruk] Tünel tahsisi işleniyor. Kalan sıra: ${currentServer.queuePos}`);
            }
        }, 2000);
    } else { 
        triggerActualBoot(); 
    }
}

function skipQueue() {
    if(!currentServer.inQueue) return;
    logToConsole(`[Sponsor] Reklam doğrulandı. Sıra önceliği kazanıldı.`, 'success');
    currentServer.queuePos -= 3;
    if(currentServer.queuePos <= 0) {
        currentServer.queuePos = 0; 
        document.getElementById('queue-card').classList.add('hidden');
        currentServer.inQueue = false; 
        triggerActualBoot();
    } else { 
        document.getElementById('queue-number').innerText = currentServer.queuePos; 
    }
}

function triggerActualBoot() {
    updateStatusBadge('loading');
    if(ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
            action: 'start', 
            type: currentServer.type, 
            version: currentServer.version,
            domain: currentServer.domainName 
        }));
    } else {
        logToConsole(`[Hata] Yerel kontrol servisine sinyal gönderilemedi. Bağlantı yok.`, 'warn');
        updateStatusBadge('offline');
        document.getElementById('btn-start').className = "bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
    }
}

function stopServer() {
    if(!currentServer.isOnline) return;
    updateStatusBadge('loading');
    if(ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'stop' }));
    }
}

function installModFromUrl() {
    const urlInput = document.getElementById('mod-url-input');
    const url = urlInput.value.trim();
    if(!url) return;
    
    logToConsole(`[Dosya] Uzak adresten mod/plugin indirme isteği gönderildi...`);
    if(ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'install-mod', url: url }));
        urlInput.value = '';
    }
}

function renderMods(files) {
    const container = document.getElementById('installed-mods-list');
    if(!files || files.length === 0) {
        container.innerHTML = `<div class="text-slate-500 italic">Henüz hiçbir ek dosya yüklenmedi.</div>`;
        return;
    }
    container.innerHTML = '';
    files.forEach(file => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[11px]";
        div.innerHTML = `<span class="truncate max-w-[180px] text-slate-300"><i class="fas fa-file-archive text-green-500 mr-1"></i>${file}</span><span class="text-green-400 font-bold text-[9px] uppercase">Yüklü</span>`;
        container.appendChild(div);
    });
}

function startLiveMetrics() {
    statsInterval = setInterval(() => {
        const ramMax = currentServer.domainType === 'free' ? 4 : 8;
        const ramCurrent = (1.8 + (Math.random() * 0.4)).toFixed(2);
        document.getElementById('ram-bar').style.width = `${(ramCurrent / ramMax) * 100}%`;
        document.getElementById('ram-text').innerText = `${ramCurrent} GB / ${ramMax} GB`;
        const cpuCurrent = Math.floor(15 + (Math.random() * 25));
        document.getElementById('cpu-bar').style.width = `${cpuCurrent}%`;
        document.getElementById('cpu-text').innerText = `${cpuCurrent}%`;
    }, 1000);
}

function resetMetrics() {
    document.getElementById('ram-bar').style.width = '0%'; 
    document.getElementById('ram-text').innerText = '0 GB / 4 GB';
    document.getElementById('cpu-bar').style.width = '0%'; 
    document.getElementById('cpu-text').innerText = '0%';
}

function updateStatusBadge(state) {
    const badge = document.getElementById('status-badge');
    if(state === 'online') {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 flex items-center space-x-1.5 border border-green-500/20";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span>Çevrimiçi</span>`;
    } else if(state === 'offline') {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 flex items-center space-x-1.5";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-500"></span><span>Çevrimdışı</span>`;
    } else if(state === 'loading') {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 flex items-center space-x-1.5 border border-amber-500/20";
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-spin border-t-transparent"></span><span>İşlem Yapılıyor...</span>`;
    }
}

function logToConsole(text, type = 'info') {
    const container = document.getElementById('console-logs'), el = document.createElement('div');
    el.className = type === 'warn' ? 'text-amber-400' : type === 'success' ? 'text-green-400' : 'text-slate-300';
    el.innerText = text; 
    container.appendChild(el); 
    container.scrollTop = container.scrollHeight;
}

function clearConsole() { 
    document.getElementById('console-logs').innerHTML = ''; 
}
