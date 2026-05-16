// baslat.html dosyasının en altındaki <script> etiketlerini tamamen kaldırıp, 
// yerine bu satırı ekleyin: <script src="sunucu.js"></script>

let currentServer = { name: '', domainType: 'free', domainName: '', isOnline: false, inQueue: false, queuePos: 0 };
let consoleInterval = null, statsInterval = null;

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

function handlePaymentSubmit(e) { e.preventDefault(); initPanelLayout(); }

function initPanelLayout() {
    document.getElementById('step-wizard').classList.add('hidden');
    document.getElementById('step-checkout').classList.add('hidden');
    document.getElementById('step-panel').classList.remove('hidden');
    document.getElementById('panel-server-title').innerText = currentServer.name;
    document.getElementById('panel-server-domain').innerText = currentServer.domainName;
    currentServer.isOnline = false; updateStatusBadge('offline');
    document.getElementById('btn-start').className = "bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
    document.getElementById('btn-stop').className = "bg-slate-800 text-slate-500 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-not-allowed";
    logToConsole(`[MineHost] Sunucu dizini '${currentServer.name}' ayarlandı.`);
}

function startServer() {
    if(currentServer.isOnline || currentServer.inQueue) return;
    document.getElementById('btn-start').className = "bg-slate-800 text-slate-500 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-not-allowed";
    if(currentServer.domainType === 'free') {
        currentServer.inQueue = true; currentServer.queuePos = Math.floor(Math.random() * 4) + 4;
        document.getElementById('queue-number').innerText = currentServer.queuePos;
        document.getElementById('queue-card').classList.remove('hidden');
        logToConsole(`[Kuyruk] Havuz yoğun. Sıraya eklendiniz. Sıranız: ${currentServer.queuePos}`, 'warn');
        const queueInterval = setInterval(() => {
            if(!currentServer.inQueue) { clearInterval(queueInterval); return; }
            currentServer.queuePos--;
            if(currentServer.queuePos <= 0) {
                clearInterval(queueInterval); document.getElementById('queue-card').classList.add('hidden');
                currentServer.inQueue = false; triggerActualBoot();
            } else {
                document.getElementById('queue-number').innerText = currentServer.queuePos;
                logToConsole(`[Kuyruk] Sıradaki kullanıcılar işleniyor. Kalan: ${currentServer.queuePos}`);
            }
        }, 2500);
    } else { triggerActualBoot(); }
}

function skipQueue() {
    if(!currentServer.inQueue) return;
    logToConsole(`[Sponsor] Etkileşim algılandı. Öncelik sıranız öne çekiliyor.`, 'success');
    currentServer.queuePos -= 3;
    if(currentServer.queuePos <= 0) {
        currentServer.queuePos = 0; document.getElementById('queue-card').classList.add('hidden');
        currentServer.inQueue = false; triggerActualBoot();
    } else { document.getElementById('queue-number').innerText = currentServer.queuePos; }
}

function triggerActualBoot() {
    updateStatusBadge('loading'); logToConsole(`[Sistem] Sunucu JVM sanal makinesi tetikleniyor...`);
    setTimeout(() => { logToConsole(`[Sistem] Dosya bütünlüğü onaylandı. EULA doğrulandı.`); }, 1000);
    setTimeout(() => {
        currentServer.isOnline = true; updateStatusBadge('online');
        document.getElementById('btn-stop').className = "bg-red-500 hover:bg-red-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
        logToConsole(`[Sistem] Sunucu aktif konuma geçti! Done (2.5s)!`, 'success'); startLiveMetrics();
    }, 2500);
}

function stopServer() {
    if(!currentServer.isOnline) return;
    updateStatusBadge('loading'); logToConsole(`[Sistem] Kapatma sinyali gönderildi...`, 'warn');
    clearInterval(statsInterval); clearInterval(consoleInterval); resetMetrics();
    setTimeout(() => {
        currentServer.isOnline = false; updateStatusBadge('offline');
        document.getElementById('btn-start').className = "bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1";
        document.getElementById('btn-stop').className = "bg-slate-800 text-slate-500 font-bold py-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-not-allowed";
        logToConsole(`[Sistem] JVM prosesi kapatıldı. Sunucu Çevrimdışı.`);
    }, 1500);
}

function startLiveMetrics() {
    statsInterval = setInterval(() => {
        const ramMax = currentServer.domainType === 'free' ? 4 : 8;
        const ramCurrent = (2.0 + (Math.random() * 0.5)).toFixed(2);
        document.getElementById('ram-bar').style.width = `${(ramCurrent / ramMax) * 100}%`;
        document.getElementById('ram-text').innerText = `${ramCurrent} GB / ${ramMax} GB`;
        const cpuCurrent = Math.floor(20 + (Math.random() * 30));
        document.getElementById('cpu-bar').style.width = `${cpuCurrent}%`;
        document.getElementById('cpu-text').innerText = `${cpuCurrent}%`;
    }, 1000);
}

function resetMetrics() {
    document.getElementById('ram-bar').style.width = '0%'; document.getElementById('ram-text').innerText = '0 GB / 4 GB';
    document.getElementById('cpu-bar').style.width = '0%'; document.getElementById('cpu-text').innerText = '0%';
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
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-spin border-t-transparent"></span><span>Bağlanıyor...</span>`;
    }
}

function logToConsole(text, type = 'info') {
    const container = document.getElementById('console-logs'), el = document.createElement('div');
    el.className = type === 'warn' ? 'text-amber-400' : type === 'success' ? 'text-green-400' : 'text-slate-300';
    el.innerText = text; container.appendChild(el); container.scrollTop = container.scrollHeight;
}

function clearConsole() { document.getElementById('console-logs').innerHTML = ''; }
