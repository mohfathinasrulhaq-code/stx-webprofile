// STX Community Admin Dashboard Controller
document.addEventListener('DOMContentLoaded', () => {
    const SESSION_KEY = 'stx_admin_password';
    const TOKEN_KEY = 'stx_admin_token';
    
    // In-memory application state
    let websiteData = null;
    let currentModalAction = null; // { type: 'division'|'article'|'product'|'partner', mode: 'add'|'edit', index: number|null }
    let confirmCallback = null;

    // DOM Elements
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginPasswordInput = document.getElementById('login-password-input');
    const loginErrorMsg = document.getElementById('login-error-msg');
    const loginErrorText = document.getElementById('login-error-text');
    const toggleLoginPassBtn = document.getElementById('toggle-login-pass');
    
    const sidebar = document.getElementById('admin-sidebar');
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    const saveAllBtn = document.getElementById('save-all-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const toastAlert = document.getElementById('toast-alert');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');

    // Utility for Google Drive links
    function convertImageUrl(url) {
        if (!url) return url;
        const gdriveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
        const match = url.match(gdriveRegex);
        if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        const gdriveOpenRegex = /drive\.google\.com\/open\?id=([^\&]+)/;
        const matchOpen = url.match(gdriveOpenRegex);
        if (matchOpen && matchOpen[1]) return `https://drive.google.com/uc?export=view&id=${matchOpen[1]}`;
        return url;
    }

    // 1. Password Visibility Toggle
    if (toggleLoginPassBtn && loginPasswordInput) {
        toggleLoginPassBtn.addEventListener('click', () => {
            const isPassword = loginPasswordInput.type === 'password';
            loginPasswordInput.type = isPassword ? 'text' : 'password';
            toggleLoginPassBtn.innerHTML = isPassword 
                ? '<i class="ph ph-eye-slash text-xl"></i>' 
                : '<i class="ph ph-eye text-xl"></i>';
        });
    }

    // 2. Authentication Check
    async function checkAuth() {
        const storedPass = sessionStorage.getItem(SESSION_KEY);
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        if (!storedPass && !storedToken) {
            showLoginModal();
            return;
        }

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (storedToken) {
                headers['Authorization'] = `Bearer ${storedToken}`;
            }

            const res = await fetch('/api/verify', {
                method: 'POST',
                headers,
                body: JSON.stringify({ password: storedPass })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.token) {
                    sessionStorage.setItem(TOKEN_KEY, data.token);
                }
                hideLoginModal();
                loadWebsiteData();
            } else {
                sessionStorage.removeItem(SESSION_KEY);
                sessionStorage.removeItem(TOKEN_KEY);
                showLoginModal("Sesi login berakhir. Harap masukkan password lagi.");
            }
        } catch (e) {
            console.error("Gagal verifikasi autentikasi:", e);
            showLoginModal("Koneksi ke server gagal. Pastikan server aktif.");
        }
    }

    function showLoginModal(customError = null) {
        if (loginModal) {
            loginModal.classList.remove('hidden', 'opacity-0');
            if (customError && loginErrorMsg && loginErrorText) {
                loginErrorText.innerText = customError;
                loginErrorMsg.classList.remove('hidden');
            }
            if (loginPasswordInput) {
                loginPasswordInput.value = '';
                loginPasswordInput.focus();
            }
        }
    }

    function hideLoginModal() {
        if (loginModal) {
            loginModal.classList.add('opacity-0');
            setTimeout(() => loginModal.classList.add('hidden'), 300);
        }
    }

    // 3. Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = loginPasswordInput.value.trim();
            if (!password) return;

            loginErrorMsg.classList.add('hidden');
            const submitBtn = document.getElementById('login-submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ph ph-circle-notch animate-spin text-lg"></i> MEMVERIFIKASI...';
            }

            try {
                const res = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                const result = await res.json();
                if (res.ok) {
                    sessionStorage.setItem(SESSION_KEY, password);
                    if (result.token) {
                        sessionStorage.setItem(TOKEN_KEY, result.token);
                    }
                    hideLoginModal();
                    showToast("Login berhasil! Memuat data...", "success");
                    loadWebsiteData();
                } else {
                    loginErrorText.innerText = result.error || "Password admin salah!";
                    loginErrorMsg.classList.remove('hidden');
                }
            } catch (err) {
                loginErrorText.innerText = "Gagal menghubungi server.";
                loginErrorMsg.classList.remove('hidden');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="ph-bold ph-sign-in text-lg"></i> MASUK KE DASHBOARD';
                }
            }
        });
    }

    // 4. Logout Handler
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            showToast("Anda telah keluar.", "info");
            showLoginModal();
        });
    }

    // 5. Sidebar Tab Switching
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => {
                b.classList.remove('active', 'bg-accent-blue/20', 'text-accent-glow', 'border-l-4', 'border-accent-blue');
                b.classList.add('text-text-muted');
            });

            btn.classList.add('active', 'bg-accent-blue/20', 'text-accent-glow', 'border-l-4', 'border-accent-blue');
            btn.classList.remove('text-text-muted');

            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            const activeContent = document.getElementById(targetTabId);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }

            // Close mobile sidebar on selection
            if (window.innerWidth < 768 && sidebar) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });

    // Mobile sidebar drawer
    if (mobileSidebarToggle && sidebar) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // 6. Fetch Website Data from Backend
    async function loadWebsiteData() {
        try {
            const res = await fetch('/api/data');
            websiteData = await res.json();
            populateForms(websiteData);
            updateSyncStatus(true);
        } catch (e) {
            console.error("Gagal memuat data website:", e);
            showToast("Gagal memuat data dari server.", "error");
            updateSyncStatus(false);
        }
    }

    function updateSyncStatus(isSynced) {
        const syncEl = document.getElementById('sync-status');
        if (!syncEl) return;
        if (isSynced) {
            syncEl.innerHTML = '<i class="ph ph-check text-green-400"></i> Sinkron dengan Server';
        } else {
            syncEl.innerHTML = '<i class="ph ph-warning text-yellow-400"></i> Belum Disimpan';
        }
    }

    // 7. Populate Form Fields
    function populateForms(data) {
        if (!data) return;

        // Hero
        const h = data.hero || {};
        setVal('hero-tagline', h.tagline || "The Next Evolution");
        setVal('hero-headline-prefix', h.headlinePrefix || "WE ARE THE");
        setVal('hero-headline-highlight', h.headlineHighlight || data.heroHeadline || "FUTURE");
        setVal('hero-headline-suffix', h.headlineSuffix || "OF COMMUNITY");
        setVal('hero-sub', h.sub || data.heroSub || "");
        setVal('hero-cta1-text', h.cta1Text || "BECOME A MEMBER");
        setVal('hero-cta1-link', h.cta1Link || "#join");
        setVal('hero-cta2-text', h.cta2Text || "EXPLORE ROSTER");
        setVal('hero-cta2-link', h.cta2Link || "#divisions");

        // Stats
        const s = data.stats || {};
        setVal('stat-members', data.statMembers || s.statMembers || "15K+");
        setVal('stat-divisions', data.statDivisions || s.statDivisions || "8");
        setVal('stat-tournaments', data.statTournaments || s.statTournaments || "120+");
        setVal('stat-champs', data.statChamps || s.statChamps || "45");

        // Divisions List
        renderDivisionsList(data.divisions || []);

        // News (Featured)
        const news = data.news || {};
        const feat = news.featured || {};
        setVal('news-feat-tag', feat.tag || "UPDATE");
        setVal('news-feat-category', feat.category || "COMMUNITY");
        setVal('news-feat-date', feat.date || "OCTOBER 5, 2026");
        setVal('news-feat-title', feat.title || "");
        setVal('news-feat-summary', feat.summary || "");
        setVal('news-feat-image', feat.image || "");
        setVal('news-feat-link', feat.link || "#");

        // News (Articles List)
        renderArticlesList(news.articles || []);

        // Events
        const ev = data.events || {};
        const match = ev.match || {};
        setVal('event-match-opponent', match.opponent || "STX vs CLOUD9");
        setVal('event-match-league', match.league || "VCT Pacific League - Week 4");
        setVal('event-match-target-date', match.targetDate ? match.targetDate.slice(0, 16) : "2026-10-25T20:00");
        setVal('event-match-btn-text', match.buttonText || "SET REMINDER");
        setVal('event-match-btn-link', match.buttonLink || "#");

        const comm = ev.community || {};
        setVal('event-comm-title', comm.title || "Community Gathering V.4");
        setVal('event-comm-sub', comm.subtitle || "Discord Online Event & Watch Party");
        setVal('event-comm-schedule', comm.scheduleText || "OCT 10, 2026 • 20:00 GMT+7");
        setVal('event-comm-btn-text', comm.buttonText || "RSVP NOW");
        setVal('event-comm-btn-link', comm.buttonLink || "https://discord.gg/stx");

        // Products List
        renderProductsList(data.products || []);

        // General & Socials
        const gen = data.general || {};
        setVal('gen-discord', gen.discordUrl || "https://discord.gg/stx");
        setVal('gen-instagram', gen.instagramUrl || "https://instagram.com/stxcommunity");
        setVal('gen-youtube', gen.youtubeUrl || "https://youtube.com/@stxcommunity");
        setVal('gen-tiktok', gen.tiktokUrl || "https://tiktok.com/@stxcommunity");
        setVal('gen-admin-email', gen.adminEmail || "admin@stxcommunity.com");
        setVal('gen-logo', gen.logoUrl || "");
        setVal('gen-bank-accounts', gen.bankAccounts || "");
        setVal('gen-email-template', gen.emailTemplate || "");
        setVal('gen-footer-desc', gen.footerDesc || "");

        // Render admin logo preview
        const adminLogoImg = document.getElementById('admin-logo-img');
        const adminLogoIcon = document.getElementById('admin-logo-icon');
        const adminLogoText = document.getElementById('admin-logo-text');
        if (adminLogoImg && gen.logoUrl) {
            adminLogoImg.src = convertImageUrl(gen.logoUrl);
            adminLogoImg.classList.remove('hidden');
            if (adminLogoIcon) adminLogoIcon.classList.add('hidden');
            if (adminLogoText) adminLogoText.classList.add('hidden');
        }

        // Partners List
        renderPartnersList(gen.partners || []);
    }

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    // 8. Render Lists (Divisions, Articles, Products, Partners)
    function renderDivisionsList(divisions) {
        const container = document.getElementById('divisions-list-container');
        if (!container) return;

        if (!divisions || divisions.length === 0) {
            container.innerHTML = `<div class="col-span-full p-6 text-center text-text-muted glass-panel">Belum ada squad divisi yang dibuat. Klik tombol "+ Tambah Divisi Baru" di atas.</div>`;
            return;
        }

        container.innerHTML = divisions.map((div, idx) => `
            <div class="glass-panel p-4 flex flex-col justify-between group relative overflow-hidden">
                <div class="h-32 -mx-4 -mt-4 mb-3 overflow-hidden relative bg-base-dark">
                    <img src="${convertImageUrl(div.image) || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-2 right-2 bg-base-dark/80 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-accent-glow uppercase">
                        ${div.category || 'ESPORTS'}
                    </div>
                </div>
                <div>
                    <h4 class="font-bold text-base text-white truncate">${div.title}</h4>
                    <p class="text-xs text-text-muted truncate mb-1">${div.subtitle || '-'}</p>
                    <span class="inline-block text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-mono">${div.badge || 'STX'}</span>
                </div>
                <div class="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border">
                    <button onclick="editDivision(${idx})" class="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                        <i class="ph ph-pencil-simple"></i> Edit
                    </button>
                    <button onclick="deleteDivision(${idx})" class="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Hapus Divisi">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function renderArticlesList(articles) {
        const container = document.getElementById('articles-list-container');
        if (!container) return;

        if (!articles || articles.length === 0) {
            container.innerHTML = `<div class="p-4 text-center text-text-muted glass-panel">Belum ada artikel berita tambahan.</div>`;
            return;
        }

        container.innerHTML = articles.map((art, idx) => `
            <div class="glass-panel p-3.5 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                    <img src="${convertImageUrl(art.image) || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'}" class="w-14 h-14 object-cover rounded flex-shrink-0 bg-base-dark">
                    <div class="min-w-0">
                        <p class="text-[10px] text-text-muted uppercase">${art.date || 'TANGGAL'}</p>
                        <h4 class="text-sm font-bold text-white truncate">${art.title}</h4>
                        <span class="text-xs text-accent-glow truncate block font-mono">${art.link || '#'}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button onclick="editArticle(${idx})" class="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1">
                        <i class="ph ph-pencil-simple"></i> Edit
                    </button>
                    <button onclick="deleteArticle(${idx})" class="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Hapus Artikel">
                        <i class="ph ph-trash text-base"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function renderProductsList(products) {
        const container = document.getElementById('products-list-container');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = `<div class="col-span-full p-6 text-center text-text-muted glass-panel">Belum ada produk merchandise. Klik "+ Tambah Produk Baru".</div>`;
            return;
        }

        container.innerHTML = products.map((prod, idx) => `
            <div class="glass-panel p-4 flex flex-col justify-between group relative overflow-hidden">
                <div class="h-36 -mx-4 -mt-4 mb-3 overflow-hidden relative bg-base-dark">
                    <img src="${convertImageUrl(prod.image) || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>
                <div>
                    <h4 class="font-bold text-base text-white truncate">${prod.name}</h4>
                    <p class="text-sm text-accent-glow font-bold mt-1">Rp ${(Number(prod.price) || 0).toLocaleString('id-ID')}</p>
                    <span class="text-[11px] text-text-muted block mt-0.5">${prod.shipping || 'Est. Ongkir standar'}</span>
                </div>
                <div class="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border">
                    <button onclick="editProduct(${idx})" class="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1">
                        <i class="ph ph-pencil-simple"></i> Edit
                    </button>
                    <button onclick="deleteProduct(${idx})" class="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 transition-colors" title="Hapus Produk">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function renderPartnersList(partners) {
        const container = document.getElementById('partners-list-container');
        if (!container) return;

        if (!partners || partners.length === 0) {
            container.innerHTML = `<div class="col-span-full p-4 text-center text-text-muted glass-panel">Belum ada mitra sponsor.</div>`;
            return;
        }

        container.innerHTML = partners.map((part, idx) => `
            <div class="glass-panel p-3 flex items-center justify-between">
                <div>
                    <h4 class="text-sm font-bold text-white uppercase">${part.name}</h4>
                    <span class="text-[11px] text-text-muted truncate block">${part.url || '#'}</span>
                </div>
                <div class="flex items-center gap-1">
                    <button onclick="editPartner(${idx})" class="text-text-muted hover:text-white p-1" title="Edit">
                        <i class="ph ph-pencil-simple text-base"></i>
                    </button>
                    <button onclick="deletePartner(${idx})" class="text-red-400 hover:text-red-300 p-1" title="Hapus">
                        <i class="ph ph-trash text-base"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 9. Item Editor Modal System (Add / Edit dynamic entities)
    const itemModal = document.getElementById('item-editor-modal');
    const itemModalTitle = document.getElementById('item-modal-title');
    const itemModalSubtitle = document.getElementById('item-modal-subtitle');
    const itemModalFields = document.getElementById('item-modal-fields');
    const itemEditorForm = document.getElementById('item-editor-form');

    window.closeItemModal = function() {
        if (!itemModal) return;
        itemModal.classList.add('opacity-0');
        if (itemModal.children[0]) itemModal.children[0].classList.add('scale-95');
        setTimeout(() => itemModal.classList.add('hidden'), 300);
        currentModalAction = null;
    };

    function openItemModal(title, subtitle, fieldsHtml, actionObj) {
        currentModalAction = actionObj;
        if (itemModalTitle) itemModalTitle.innerText = title;
        if (itemModalSubtitle) itemModalSubtitle.innerText = subtitle;
        if (itemModalFields) itemModalFields.innerHTML = fieldsHtml;

        if (itemModal) {
            itemModal.classList.remove('hidden');
            setTimeout(() => {
                itemModal.classList.remove('opacity-0');
                if (itemModal.children[0]) itemModal.children[0].classList.remove('scale-95');
            }, 10);
        }
    }

    // Modal submit handler
    if (itemEditorForm) {
        itemEditorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentModalAction || !websiteData) return;

            const { type, mode, index } = currentModalAction;

            if (type === 'division') {
                const item = {
                    id: mode === 'edit' && websiteData.divisions[index]?.id ? websiteData.divisions[index].id : `div-${Date.now()}`,
                    title: getVal('modal-div-title'),
                    category: getVal('modal-div-category') || 'ESPORTS',
                    subtitle: getVal('modal-div-sub'),
                    badge: getVal('modal-div-badge') || 'STX 2025',
                    image: getVal('modal-div-img') || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
                    link: getVal('modal-div-link') || '#divisions'
                };
                if (!websiteData.divisions) websiteData.divisions = [];
                if (mode === 'add') websiteData.divisions.push(item);
                else websiteData.divisions[index] = item;
                renderDivisionsList(websiteData.divisions);
            } 
            else if (type === 'article') {
                const item = {
                    id: mode === 'edit' && websiteData.news.articles[index]?.id ? websiteData.news.articles[index].id : `art-${Date.now()}`,
                    title: getVal('modal-art-title'),
                    date: getVal('modal-art-date'),
                    image: getVal('modal-art-img') || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
                    link: getVal('modal-art-link') || '#'
                };
                if (!websiteData.news) websiteData.news = {};
                if (!websiteData.news.articles) websiteData.news.articles = [];
                if (mode === 'add') websiteData.news.articles.push(item);
                else websiteData.news.articles[index] = item;
                renderArticlesList(websiteData.news.articles);
            } 
            else if (type === 'product') {
                const item = {
                    id: mode === 'edit' && websiteData.products[index]?.id ? websiteData.products[index].id : `prod-${Date.now()}`,
                    name: getVal('modal-prod-name'),
                    price: Number(getVal('modal-prod-price')) || 0,
                    shipping: getVal('modal-prod-shipping') || 'Rp 20k - 50k',
                    image: getVal('modal-prod-img') || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000'
                };
                if (!websiteData.products) websiteData.products = [];
                if (mode === 'add') websiteData.products.push(item);
                else websiteData.products[index] = item;
                renderProductsList(websiteData.products);
            } 
            else if (type === 'partner') {
                const item = {
                    id: mode === 'edit' && websiteData.general.partners[index]?.id ? websiteData.general.partners[index].id : `partner-${Date.now()}`,
                    name: getVal('modal-part-name'),
                    url: getVal('modal-part-url') || '#'
                };
                if (!websiteData.general) websiteData.general = {};
                if (!websiteData.general.partners) websiteData.general.partners = [];
                if (mode === 'add') websiteData.general.partners.push(item);
                else websiteData.general.partners[index] = item;
                renderPartnersList(websiteData.general.partners);
            }

            closeItemModal();
            showToast("Item berhasil diperbarui pada tampilan dashboard. Jangan lupa klik 'SIMPAN PERUBAHAN' untuk menyimpan ke server.", "info");
            updateSyncStatus(false);
        });
    }

    // 10. Item Handlers (Division, Article, Product, Partner)
    // Division Add/Edit/Delete
    const addDivBtn = document.getElementById('add-division-btn');
    if (addDivBtn) {
        addDivBtn.addEventListener('click', () => {
            openItemModal("Tambah Divisi Baru", "Masukkan informasi skuad divisi game baru STX", `
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nama Game / Divisi</label>
                    <input type="text" id="modal-div-title" class="input-field" placeholder="Contoh: Delta Force Mobile" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase mb-1">Kategori</label>
                        <select id="modal-div-category" class="input-field">
                            <option value="ESPORTS">ESPORTS</option>
                            <option value="CREATORS">CREATORS</option>
                            <option value="REGIONAL">REGIONAL</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase mb-1">Badge Tag</label>
                        <input type="text" id="modal-div-badge" class="input-field" placeholder="Contoh: STX 2026">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Deskripsi Pemain / Status</label>
                    <input type="text" id="modal-div-sub" class="input-field" placeholder="Contoh: Pro Roster • 35 Players Active">
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Gambar Banner</label>
                    <input type="text" id="modal-div-img" class="input-field text-sm font-mono" placeholder="https://images.unsplash.com/...">
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Link Squad (Opsional)</label>
                    <input type="text" id="modal-div-link" class="input-field text-sm font-mono" placeholder="# atau link discord/roster">
                </div>
            `, { type: 'division', mode: 'add', index: null });
        });
    }

    window.editDivision = function(idx) {
        const item = websiteData.divisions[idx];
        if (!item) return;

        openItemModal("Edit Divisi", `Mengubah data divisi: ${item.title}`, `
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nama Game / Divisi</label>
                <input type="text" id="modal-div-title" class="input-field" value="${item.title || ''}" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Kategori</label>
                    <select id="modal-div-category" class="input-field">
                        <option value="ESPORTS" ${item.category === 'ESPORTS' ? 'selected' : ''}>ESPORTS</option>
                        <option value="CREATORS" ${item.category === 'CREATORS' ? 'selected' : ''}>CREATORS</option>
                        <option value="REGIONAL" ${item.category === 'REGIONAL' ? 'selected' : ''}>REGIONAL</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Badge Tag</label>
                    <input type="text" id="modal-div-badge" class="input-field" value="${item.badge || ''}">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Deskripsi Pemain / Status</label>
                <input type="text" id="modal-div-sub" class="input-field" value="${item.subtitle || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Gambar Banner</label>
                <input type="text" id="modal-div-img" class="input-field text-sm font-mono" value="${item.image || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Link Squad (Opsional)</label>
                <input type="text" id="modal-div-link" class="input-field text-sm font-mono" value="${item.link || ''}">
            </div>
        `, { type: 'division', mode: 'edit', index: idx });
    };

    window.deleteDivision = function(idx) {
        openConfirmModal("Hapus Divisi", "Yakin ingin menghapus squad divisi ini dari website?", () => {
            websiteData.divisions.splice(idx, 1);
            renderDivisionsList(websiteData.divisions);
            updateSyncStatus(false);
            showToast("Divisi dihapus dari daftar lokal. Klik 'SIMPAN PERUBAHAN' untuk memperbarui server.", "info");
        });
    };

    // Article Add/Edit/Delete
    const addArtBtn = document.getElementById('add-article-btn');
    if (addArtBtn) {
        addArtBtn.addEventListener('click', () => {
            openItemModal("Tambah Berita Baru", "Masukkan judul dan link berita pengumuman", `
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Judul Berita</label>
                    <input type="text" id="modal-art-title" class="input-field" placeholder="Contoh: Open Recruitment Delta Force" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Tanggal Rilis</label>
                    <input type="text" id="modal-art-date" class="input-field" placeholder="Contoh: OCTOBER 10, 2026" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Thumbnail Gambar</label>
                    <input type="text" id="modal-art-img" class="input-field text-sm font-mono" placeholder="https://images.unsplash.com/...">
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Link Artikel</label>
                    <input type="text" id="modal-art-link" class="input-field text-sm font-mono" placeholder="# atau link eksternal">
                </div>
            `, { type: 'article', mode: 'add', index: null });
        });
    }

    window.editArticle = function(idx) {
        const item = websiteData.news.articles[idx];
        if (!item) return;

        openItemModal("Edit Berita", `Mengubah berita: ${item.title}`, `
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Judul Berita</label>
                <input type="text" id="modal-art-title" class="input-field" value="${item.title || ''}" required>
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Tanggal Rilis</label>
                <input type="text" id="modal-art-date" class="input-field" value="${item.date || ''}" required>
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Thumbnail Gambar</label>
                <input type="text" id="modal-art-img" class="input-field text-sm font-mono" value="${item.image || ''}">
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Link Artikel</label>
                <input type="text" id="modal-art-link" class="input-field text-sm font-mono" value="${item.link || ''}">
            </div>
        `, { type: 'article', mode: 'edit', index: idx });
    };

    window.deleteArticle = function(idx) {
        openConfirmModal("Hapus Berita", "Yakin ingin menghapus berita ini dari daftar?", () => {
            websiteData.news.articles.splice(idx, 1);
            renderArticlesList(websiteData.news.articles);
            updateSyncStatus(false);
            showToast("Berita dihapus dari daftar lokal.", "info");
        });
    };

    // Product Add/Edit/Delete
    const addProdBtn = document.getElementById('add-product-btn');
    if (addProdBtn) {
        addProdBtn.addEventListener('click', () => {
            openItemModal("Tambah Produk Merchandise", "Tambahkan produk merchandise ke katalog toko STX", `
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nama Produk</label>
                    <input type="text" id="modal-prod-name" class="input-field" placeholder="Contoh: STX Snapback Cap 2026" required>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase mb-1">Harga (Rupiah Angka)</label>
                        <input type="number" id="modal-prod-price" class="input-field" placeholder="Contoh: 180000" required>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-text-muted uppercase mb-1">Estimasi Ongkir</label>
                        <input type="text" id="modal-prod-shipping" class="input-field" placeholder="Contoh: Rp 15k - 30k">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Gambar Produk</label>
                    <input type="text" id="modal-prod-img" class="input-field text-sm font-mono" placeholder="https://images.unsplash.com/...">
                </div>
            `, { type: 'product', mode: 'add', index: null });
        });
    }

    window.editProduct = function(idx) {
        const item = websiteData.products[idx];
        if (!item) return;

        openItemModal("Edit Produk Merchandise", `Mengubah produk: ${item.name}`, `
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nama Produk</label>
                <input type="text" id="modal-prod-name" class="input-field" value="${item.name || ''}" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Harga (Rupiah Angka)</label>
                    <input type="number" id="modal-prod-price" class="input-field" value="${item.price || 0}" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Estimasi Ongkir</label>
                    <input type="text" id="modal-prod-shipping" class="input-field" value="${item.shipping || ''}">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Gambar Produk</label>
                <input type="text" id="modal-prod-img" class="input-field text-sm font-mono" value="${item.image || ''}">
            </div>
        `, { type: 'product', mode: 'edit', index: idx });
    };

    window.deleteProduct = function(idx) {
        openConfirmModal("Hapus Produk", "Yakin ingin menghapus produk merchandise ini dari katalog shop?", () => {
            websiteData.products.splice(idx, 1);
            renderProductsList(websiteData.products);
            updateSyncStatus(false);
            showToast("Produk dihapus dari katalog lokal.", "info");
        });
    };

    // Partner Add/Edit/Delete
    const addPartBtn = document.getElementById('add-partner-btn');
    if (addPartBtn) {
        addPartBtn.addEventListener('click', () => {
            openItemModal("Tambah Mitra Sponsor", "Tambahkan sponsor / partner di footer website", `
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nama Partner / Brand</label>
                    <input type="text" id="modal-part-name" class="input-field" placeholder="Contoh: RAZER ID" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Website / Sosmed</label>
                    <input type="text" id="modal-part-url" class="input-field text-sm font-mono" placeholder="# atau https://...">
                </div>
            `, { type: 'partner', mode: 'add', index: null });
        });
    }

    window.editPartner = function(idx) {
        const item = websiteData.general.partners[idx];
        if (!item) return;

        openItemModal("Edit Mitra Sponsor", `Mengubah data mitra: ${item.name}`, `
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">Nama Partner / Brand</label>
                <input type="text" id="modal-part-name" class="input-field" value="${item.name || ''}" required>
            </div>
            <div>
                <label class="block text-xs font-bold text-text-muted uppercase mb-1">URL Website / Sosmed</label>
                <input type="text" id="modal-part-url" class="input-field text-sm font-mono" value="${item.url || ''}">
            </div>
        `, { type: 'partner', mode: 'edit', index: idx });
    };

    window.deletePartner = function(idx) {
        openConfirmModal("Hapus Mitra", "Yakin ingin menghapus mitra ini?", () => {
            websiteData.general.partners.splice(idx, 1);
            renderPartnersList(websiteData.general.partners);
            updateSyncStatus(false);
            showToast("Mitra dihapus.", "info");
        });
    };

    // 11. Confirmation Modal Helper
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalMsg = document.getElementById('confirm-modal-msg');
    const confirmModalCancel = document.getElementById('confirm-modal-cancel');
    const confirmModalYes = document.getElementById('confirm-modal-yes');

    function openConfirmModal(title, msg, onConfirm) {
        if (confirmModalTitle) confirmModalTitle.innerText = title;
        if (confirmModalMsg) confirmModalMsg.innerText = msg;
        confirmCallback = onConfirm;

        if (confirmModal) {
            confirmModal.classList.remove('hidden');
            setTimeout(() => {
                confirmModal.classList.remove('opacity-0');
                if (confirmModal.children[0]) confirmModal.children[0].classList.remove('scale-95');
            }, 10);
        }
    }

    function closeConfirmModal() {
        if (!confirmModal) return;
        confirmModal.classList.add('opacity-0');
        if (confirmModal.children[0]) confirmModal.children[0].classList.add('scale-95');
        setTimeout(() => confirmModal.classList.add('hidden'), 300);
        confirmCallback = null;
    }

    if (confirmModalCancel) confirmModalCancel.addEventListener('click', closeConfirmModal);
    if (confirmModalYes) {
        confirmModalYes.addEventListener('click', () => {
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
            closeConfirmModal();
        });
    }

    // 12. Save All Changes to Server
    async function saveAllChanges() {
        const password = sessionStorage.getItem(SESSION_KEY);
        if (!password) {
            showLoginModal("Harap login kembali untuk menyimpan perubahan.");
            return;
        }

        // Collect all form input values into websiteData
        if (!websiteData) websiteData = {};

        // Hero
        if (!websiteData.hero) websiteData.hero = {};
        websiteData.hero.tagline = getVal('hero-tagline');
        websiteData.hero.headlinePrefix = getVal('hero-headline-prefix');
        websiteData.hero.headlineHighlight = getVal('hero-headline-highlight');
        websiteData.hero.headlineSuffix = getVal('hero-headline-suffix');
        websiteData.hero.sub = getVal('hero-sub');
        websiteData.hero.cta1Text = getVal('hero-cta1-text');
        websiteData.hero.cta1Link = getVal('hero-cta1-link');
        websiteData.hero.cta2Text = getVal('hero-cta2-text');
        websiteData.hero.cta2Link = getVal('hero-cta2-link');

        // Backward compatibility
        websiteData.heroHeadline = websiteData.hero.headlineHighlight;
        websiteData.heroSub = websiteData.hero.sub;

        // Stats
        if (!websiteData.stats) websiteData.stats = {};
        websiteData.statMembers = getVal('stat-members');
        websiteData.statDivisions = getVal('stat-divisions');
        websiteData.statTournaments = getVal('stat-tournaments');
        websiteData.statChamps = getVal('stat-champs');
        websiteData.stats.statMembers = websiteData.statMembers;
        websiteData.stats.statDivisions = websiteData.statDivisions;
        websiteData.stats.statTournaments = websiteData.statTournaments;
        websiteData.stats.statChamps = websiteData.statChamps;

        // News (Featured)
        if (!websiteData.news) websiteData.news = {};
        if (!websiteData.news.featured) websiteData.news.featured = {};
        websiteData.news.featured.tag = getVal('news-feat-tag');
        websiteData.news.featured.category = getVal('news-feat-category');
        websiteData.news.featured.date = getVal('news-feat-date');
        websiteData.news.featured.title = getVal('news-feat-title');
        websiteData.news.featured.summary = getVal('news-feat-summary');
        websiteData.news.featured.image = getVal('news-feat-image');
        websiteData.news.featured.link = getVal('news-feat-link');

        // Events
        if (!websiteData.events) websiteData.events = {};
        if (!websiteData.events.match) websiteData.events.match = {};
        websiteData.events.match.opponent = getVal('event-match-opponent');
        websiteData.events.match.league = getVal('event-match-league');
        websiteData.events.match.targetDate = getVal('event-match-target-date') || "2026-10-25T20:00:00";
        websiteData.events.match.buttonText = getVal('event-match-btn-text');
        websiteData.events.match.buttonLink = getVal('event-match-btn-link');

        if (!websiteData.events.community) websiteData.events.community = {};
        websiteData.events.community.title = getVal('event-comm-title');
        websiteData.events.community.subtitle = getVal('event-comm-sub');
        websiteData.events.community.scheduleText = getVal('event-comm-schedule');
        websiteData.events.community.buttonText = getVal('event-comm-btn-text');
        websiteData.events.community.buttonLink = getVal('event-comm-btn-link');

        // General
        if (!websiteData.general) websiteData.general = {};
        websiteData.general.discordUrl = getVal('gen-discord');
        websiteData.general.instagramUrl = getVal('gen-instagram');
        websiteData.general.youtubeUrl = getVal('gen-youtube');
        websiteData.general.tiktokUrl = getVal('gen-tiktok');
        websiteData.general.adminEmail = getVal('gen-admin-email');
        websiteData.general.logoUrl = getVal('gen-logo');
        websiteData.general.bankAccounts = getVal('gen-bank-accounts');
        websiteData.general.emailTemplate = getVal('gen-email-template');
        websiteData.general.footerDesc = getVal('gen-footer-desc');

        // Button state
        if (saveAllBtn) {
            saveAllBtn.disabled = true;
            saveAllBtn.innerHTML = '<i class="ph ph-circle-notch animate-spin text-base"></i> MENYIMPAN...';
        }

        try {
            const token = sessionStorage.getItem(TOKEN_KEY);
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/save', {
                method: 'POST',
                headers,
                body: JSON.stringify({ password, data: websiteData })
            });

            const result = await res.json();
            if (res.ok) {
                showToast(result.message || "Semua perubahan website berhasil disimpan!", "success");
                updateSyncStatus(true);
            } else {
                showToast(result.error || "Gagal menyimpan perubahan.", "error");
            }
        } catch (e) {
            console.error("Gagal menghubungi server:", e);
            showToast("Terjadi kesalahan jaringan saat menyimpan.", "error");
        } finally {
            if (saveAllBtn) {
                saveAllBtn.disabled = false;
                saveAllBtn.innerHTML = '<i class="ph-bold ph-floppy-disk text-base"></i> SIMPAN PERUBAHAN';
            }
        }
    }

    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', saveAllChanges);
    }

    // Keyboard shortcut (Ctrl+S / Cmd+S)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveAllChanges();
        }
    });

    // 13. Change Password Handler
    const changePassForm = document.getElementById('change-pass-form');
    if (changePassForm) {
        changePassForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPassword = getVal('old-pass-input');
            const newPassword = getVal('new-pass-input');
            const confirmPassword = getVal('confirm-pass-input');

            if (newPassword !== confirmPassword) {
                showToast("Password baru dan konfirmasi tidak cocok!", "error");
                return;
            }

            if (newPassword.length < 4) {
                showToast("Password baru minimal 4 karakter!", "error");
                return;
            }

            try {
                const token = sessionStorage.getItem(TOKEN_KEY);
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch('/api/change-password', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ oldPassword, newPassword })
                });

                const result = await res.json();
                if (res.ok) {
                    sessionStorage.setItem(SESSION_KEY, newPassword);
                    if (result.token) sessionStorage.setItem(TOKEN_KEY, result.token);
                    showToast(result.message || "Password berhasil diganti!", "success");
                    changePassForm.reset();
                } else {
                    showToast(result.error || "Gagal mengganti password.", "error");
                }
            } catch (err) {
                showToast("Kesalahan sistem saat menghubungi server.", "error");
            }
        });
    }

    // 14. Reset to Default Handler
    const resetDefaultBtn = document.getElementById('reset-default-btn');
    if (resetDefaultBtn) {
        resetDefaultBtn.addEventListener('click', () => {
            openConfirmModal("Reset Seluruh Website", "PERINGATAN: Seluruh teks, statistik, skuad divisi, berita, jadwal, dan katalog produk akan dikembalikan ke data default STX. Lanjutkan?", async () => {
                const password = sessionStorage.getItem(SESSION_KEY);
                const token = sessionStorage.getItem(TOKEN_KEY);
                try {
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const res = await fetch('/api/reset', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ password })
                    });
                    const result = await res.json();
                    if (res.ok) {
                        showToast(result.message || "Data berhasil direset!", "success");
                        loadWebsiteData();
                    } else {
                        showToast(result.error || "Gagal reset data.", "error");
                    }
                } catch (e) {
                    showToast("Kesalahan saat reset data.", "error");
                }
            });
        });
    }

    // 15. Toast Alert Helper
    let toastTimeout = null;
    function showToast(message, type = "success") {
        if (!toastAlert || !toastText) return;

        toastText.innerText = message;
        toastAlert.className = "p-4 glass-panel flex items-center justify-between border-l-4 transition-all duration-300";

        if (type === "success") {
            toastAlert.classList.add('border-green-500', 'text-green-400');
            if (toastIcon) toastIcon.className = "ph-fill ph-check-circle text-2xl text-green-400";
        } else if (type === "error") {
            toastAlert.classList.add('border-red-500', 'text-red-400');
            if (toastIcon) toastIcon.className = "ph-fill ph-x-circle text-2xl text-red-400";
        } else {
            toastAlert.classList.add('border-accent-blue', 'text-accent-glow');
            if (toastIcon) toastIcon.className = "ph-fill ph-info text-2xl text-accent-glow";
        }

        toastAlert.classList.remove('hidden');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            hideToast();
        }, 5000);
    }

    window.hideToast = function() {
        if (toastAlert) toastAlert.classList.add('hidden');
    };

    // Initial check on load
    checkAuth();
});
