function handleWizardSubmit(e) {
    // Formun sayfayı yenilemesini kesin olarak engelliyoruz
    e.preventDefault(); 
    
    try {
        // Elementleri güvenli bir şekilde alalım
        const nameInput = document.getElementById('server-name-input');
        const typeSelect = document.getElementById('server-type-select');
        const versionSelect = document.getElementById('server-version-select');
        const domainInput = document.getElementById('domain-sub-input');

        // Değerleri objemize aktarıyoruz
        currentServer.name = nameInput ? nameInput.value : "Minecraft Sunucusu";
        currentServer.type = typeSelect ? typeSelect.value : "vanilla";
        currentServer.version = versionSelect ? versionSelect.value : "1.20.4";
        
        // RegEx ile domain adındaki geçersiz karakterleri temizliyoruz
        const subDomain = domainInput ? domainInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : "myserver";
        
        if(currentServer.domainType === 'free') {
            currentServer.domainName = `${subDomain}.free.minehost.me`;
            initPanelLayout(); // Ücretsiz ise direkt panele geç
        } else {
            const extSelect = document.getElementById('domain-premium-select');
            const ext = extSelect ? extSelect.value : ".com";
            currentServer.domainName = `${subDomain}${ext}`;
            
            // Ödeme ekranındaki domain göstergesini güncelle
            const checkoutDisplay = document.getElementById('checkout-domain-display');
            if(checkoutDisplay) checkoutDisplay.innerText = currentServer.domainName;
            
            // Sihirbazı gizle, ödeme adımını aç
            document.getElementById('step-wizard').classList.add('hidden');
            document.getElementById('step-checkout').classList.remove('hidden');
        }
    } catch (error) {
        console.error("Sihirbaz adımı işlenirken bir hata oluştu:", error);
    }
}
