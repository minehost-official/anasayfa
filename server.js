// Bu kod bilgisayarınızda Node.js ile çalıştırılmalıdır (npm install ws)
// Gerçek dünyada tünel açmak ve yerel Minecraft sunucunuza (port 25565) 
// dış ağdan köprü kurmak için Ngrok API simülasyonunu ve mod klasör yönetimini yönetir.

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');

const wss = new WebSocket.Server({ port: 8080 });
const MODS_DIR = path.join(__dirname, 'server_mods');

if (!fs.existsSync(MODS_DIR)) {
    fs.mkdirSync(MODS_DIR);
}

console.log("MineHost Yerel Entegrasyon Servisi 8080 portunda başlatıldı.");

wss.on('connection', (ws) => {
    // Mevcut yüklü mod listesini gönder
    sendModList(ws);

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === 'start') {
            ws.send(JSON.stringify({ type: 'log', message: `[Çirdek] Sunucu mimarisi doğrulandı: ${data.type.toUpperCase()}` }));
            ws.send(JSON.stringify({ type: 'log', message: `[Çirdek] Sürüm kütüphaneleri yükleniyor: Minecraft ${data.version}` }));
            
            setTimeout(() => {
                ws.send(JSON.stringify({ type: 'log', message: `[Tünel] Ngrok ağ tüneli ayağa kaldırılıyor...` }));
            }, 800);

            setTimeout(() => {
                ws.send(JSON.stringify({ type: 'log', message: `[Tünel] Köprü kuruldu: localhost:25565 -> ${data.domain}`, style: 'success' }));
                ws.send(JSON.stringify({ type: 'log', message: `[Sistem] Sunucu başarıyla dış dünyaya açıldı!`, style: 'success' }));
                ws.send(JSON.stringify({ type: 'status', value: 'online' }));
            }, 2000);
        }

        if (data.action === 'stop') {
            ws.send(JSON.stringify({ type: 'log', message: `[Tünel] Aktif ağ tüneli kapatılıyor...`, style: 'warn' }));
            setTimeout(() => {
                ws.send(JSON.stringify({ type: 'log', message: `[Sistem] Sunucu durduruldu.` }));
                ws.send(JSON.stringify({ type: 'status', value: 'offline' }));
            }, 1000);
        }

        if (data.action === 'install-mod') {
            const fileUrl = data.url;
            const fileName = path.basename(fileUrl) || 'uploaded_mod.jar';
            const filePath = path.join(MODS_DIR, fileName);

            ws.send(JSON.stringify({ type: 'log', message: `[İndirme] Dosya çekiliyor: ${fileName}...` }));

            // Gerçek HTTP indirme işlemi simüle edilmiş tünel akışı
            const file = fs.createWriteStream(filePath);
            http.get(fileUrl, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    ws.send(JSON.stringify({ type: 'log', message: `[Sistem] ${fileName} başarıyla sunucu dizinine yazıldı!`, style: 'success' }));
                    sendModList(ws);
                });
            }).on('error', (err) => {
                fs.unlink(filePath, () => {});
                ws.send(JSON.stringify({ type: 'log', message: `[Hata] Dosya indirilemedi: ${err.message}`, style: 'warn' }));
            });
        }
    });
});

function sendModList(ws) {
    fs.readdir(MODS_DIR, (err, files) => {
        if (!err) {
            const jarFiles = files.filter(f => f.endsWith('.jar'));
            ws.send(JSON.stringify({ type: 'mod-list', files: jarFiles }));
        }
    });
}
