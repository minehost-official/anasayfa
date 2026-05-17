// Kullanıcı adını sağ üstte göster
document.getElementById('user-display').innerText = "@" + localStorage.getItem('minehost_user');

let serverData = { name: '', version: '', domain: '', isRunning: false };

function handleWizardSubmit(e) {
    e.preventDefault();
    
    serverData.name = document.getElementById('server-name-input').value;
    serverData.version = document.getElementById('server-version-select').value;
    const sub = document.getElementById('domain-sub-input').value.trim().toLowerCase();
    serverData.domain = sub + ".free.minehost.me";

    document.getElementById('step-wizard').classList.add('hidden');
    document.getElementById('step-panel').classList.remove('hidden');

    document.getElementById('display-name').innerText = serverData.name;
    document.getElementById('display-domain').innerText = serverData.domain;
    
    addLog(`Sunucu ${serverData.version} sürümüne ayarlandı.`);
}

function startServer() {
    if(serverData.isRunning) return;
    
    const badge = document.getElementById('status-badge');
    badge.innerText = "Yükleniyor...";
    badge.className = "px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-500";
    
    addLog("Java sanal makinesi başlatılıyor...");
    addLog(`${serverData.version} çekirdek dosyaları okunuyor...`);

    setTimeout(() => {
        serverData.isRunning = true;
        badge.innerText = "Çevrimiçi";
        badge.className = "px-4 py-1.5 rounded-full text-xs font-black bg-green-500/20 text-green-500";
        
        document.getElementById('btn-start').className = "flex-1 bg-slate-800 text-slate-600 font-bold py-3 rounded-xl cursor-not-allowed";
        document.getElementById('btn-stop').className = "flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500";
        
        addLog(`BAŞARILI! Arkadaşların ${serverData.domain} adresiyle bağlanabilir.`);
        addLog(`Oyun Sürümü: ${serverData.version}`);
    }, 2500);
}

function stopServer() {
    if(!serverData.isRunning) return;
    addLog("Sunucu durduruluyor...");
    setTimeout(() => location.reload(), 1000);
}

function addLog(msg) {
    const con = document.getElementById('console');
    const div = document.createElement('div');
    div.innerHTML = `<span class="text-slate-500">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    con.appendChild(div);
    con.scrollTop = con.scrollHeight;
}
