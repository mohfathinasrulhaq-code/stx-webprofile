// Mobile Menu Toggle and Global Logic
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');

    function toggleMenu() {
        if (mobileMenu) {
            mobileMenu.classList.toggle('translate-x-full');
        }
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);

    // Close menu when clicking a link
    if (mobileMenu) {
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('bg-surface/90', 'backdrop-blur-lg');
                navbar.classList.remove('glass-panel');
            } else {
                navbar.classList.add('glass-panel');
                navbar.classList.remove('bg-surface/90', 'backdrop-blur-lg');
            }
        });
    }

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

    let globalAdminEmail = "admin@stxcommunity.com";
    let globalEmailTemplate = "";

    // Dynamic Data Injection from Backend API
    fetch('/api/data?t=' + new Date().getTime())
        .then(res => res.json())
        .then(savedData => {
            if (!savedData) return;

            // 1. Update Hero
            if (savedData.hero) {
                const taglineEl = document.getElementById('ui-hero-tagline');
                if (taglineEl && savedData.hero.tagline) taglineEl.innerText = savedData.hero.tagline;

                const prefixEl = document.getElementById('ui-hero-headline-prefix');
                if (prefixEl && savedData.hero.headlinePrefix) prefixEl.innerText = savedData.hero.headlinePrefix;

                const highlightEl = document.getElementById('ui-hero-headline');
                if (highlightEl && savedData.hero.headlineHighlight) highlightEl.innerText = savedData.hero.headlineHighlight;

                const suffixEl = document.getElementById('ui-hero-headline-suffix');
                if (suffixEl && savedData.hero.headlineSuffix) suffixEl.innerText = savedData.hero.headlineSuffix;

                const subEl = document.getElementById('ui-hero-sub');
                if (subEl && savedData.hero.sub) subEl.innerText = savedData.hero.sub;

                const cta1El = document.getElementById('ui-hero-cta1');
                if (cta1El) {
                    if (savedData.hero.cta1Text) cta1El.innerText = savedData.hero.cta1Text;
                    if (savedData.hero.cta1Link) cta1El.href = savedData.hero.cta1Link;
                }

                const cta2El = document.getElementById('ui-hero-cta2');
                if (cta2El) {
                    if (savedData.hero.cta2Text) cta2El.innerText = savedData.hero.cta2Text;
                    if (savedData.hero.cta2Link) cta2El.href = savedData.hero.cta2Link;
                }
            } else {
                // Backward compatibility
                const headlineEl = document.getElementById('ui-hero-headline');
                if (headlineEl && savedData.heroHeadline) headlineEl.innerText = savedData.heroHeadline;
                const subEl = document.getElementById('ui-hero-sub');
                if (subEl && savedData.heroSub) subEl.innerText = savedData.heroSub;
            }

            // 2. Update Stats
            const statMembers = document.getElementById('ui-stat-members');
            if (statMembers && (savedData.statMembers || savedData.stats?.statMembers)) {
                statMembers.innerText = savedData.statMembers || savedData.stats.statMembers;
            }

            const statDivisions = document.getElementById('ui-stat-divisions');
            if (statDivisions && (savedData.statDivisions || savedData.stats?.statDivisions)) {
                statDivisions.innerText = savedData.statDivisions || savedData.stats.statDivisions;
            }

            const statTournaments = document.getElementById('ui-stat-tournaments');
            if (statTournaments && (savedData.statTournaments || savedData.stats?.statTournaments)) {
                statTournaments.innerText = savedData.statTournaments || savedData.stats.statTournaments;
            }

            const statChamps = document.getElementById('ui-stat-champs');
            if (statChamps && (savedData.statChamps || savedData.stats?.statChamps)) {
                statChamps.innerText = savedData.statChamps || savedData.stats.statChamps;
            }

            // 3. Update Divisions
            if (savedData.divisions && Array.isArray(savedData.divisions) && savedData.divisions.length > 0) {
                renderDivisions(savedData.divisions);
            }

            // 4. Update News
            if (savedData.news) {
                renderNews(savedData.news);
            }

            // 5. Update Events
            if (savedData.events) {
                renderEvents(savedData.events);
            }

            // 6. Update Shop Products (if on shop.html)
            if (savedData.products && Array.isArray(savedData.products) && savedData.products.length > 0) {
                renderShopProducts(savedData.products);
            }

            // 7. Update Footer, Socials & General
            if (savedData.general) {
                if (savedData.general.adminEmail) {
                    globalAdminEmail = savedData.general.adminEmail;
                }

                const footerDesc = document.getElementById('ui-footer-desc');
                if (footerDesc && savedData.general.footerDesc) {
                    footerDesc.innerText = savedData.general.footerDesc;
                }

                const discordLink = document.getElementById('ui-social-discord');
                if (discordLink && savedData.general.discordUrl) discordLink.href = savedData.general.discordUrl;

                const instaLink = document.getElementById('ui-social-instagram');
                if (instaLink && savedData.general.instagramUrl) instaLink.href = savedData.general.instagramUrl;

                const ytLink = document.getElementById('ui-social-youtube');
                if (ytLink && savedData.general.youtubeUrl) ytLink.href = savedData.general.youtubeUrl;

                const tiktokLink = document.getElementById('ui-social-tiktok');
                if (tiktokLink && savedData.general.tiktokUrl) tiktokLink.href = savedData.general.tiktokUrl;

                if (savedData.general.partners && Array.isArray(savedData.general.partners)) {
                    renderPartners(savedData.general.partners);
                }

                // Render Logo
                if (savedData.general.logoUrl) {
                    const logoUrl = convertImageUrl(savedData.general.logoUrl);
                    ['ui-logo-img', 'ui-footer-logo-img'].forEach(id => {
                        const img = document.getElementById(id);
                        if (img) {
                            img.src = logoUrl;
                            img.classList.remove('hidden');
                        }
                    });
                    ['ui-logo-text', 'ui-footer-logo-text'].forEach(id => {
                        const text = document.getElementById(id);
                        if (text) text.classList.add('hidden');
                    });
                }
                
                // Populate Bank Accounts Select in Shop
                if (savedData.general.bankAccounts) {
                    const paymentSelect = document.getElementById('payment-method');
                    if (paymentSelect) {
                        // Clear existing except placeholder
                        paymentSelect.innerHTML = '<option value="">Pilih Metode Pembayaran (Tujuan)</option>';
                        const accounts = savedData.general.bankAccounts.split(',').map(a => a.trim()).filter(a => a);
                        accounts.forEach(acc => {
                            const opt = document.createElement('option');
                            opt.value = acc;
                            opt.innerText = acc;
                            paymentSelect.appendChild(opt);
                        });
                    }
                }
                
                // Custom Email Template
                if (savedData.general.emailTemplate) {
                    globalEmailTemplate = savedData.general.emailTemplate;
                }
            }
        })
        .catch(err => console.log("Gagal memuat data dari server, menggunakan data bawaan HTML.", err));

    // Render Divisions
    function renderDivisions(divisionsList) {
        const container = document.getElementById('ui-divisions-container');
        if (!container) return;

        function buildCards(filter = 'ALL') {
            const filtered = filter === 'ALL' 
                ? divisionsList 
                : divisionsList.filter(d => (d.category || '').toUpperCase() === filter);

            if (filtered.length === 0) {
                container.innerHTML = `<div class="col-span-full py-12 text-center text-text-muted glass-panel">Belum ada squad di kategori ${filter}.</div>`;
                return;
            }

            container.innerHTML = filtered.map(item => `
                <div class="group relative overflow-hidden glass-panel clip-edges h-96 cursor-pointer">
                    <div class="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                        style="background-image: url('${convertImageUrl(item.image) || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'}')">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-base-dark via-base-dark/50 to-transparent"></div>

                    <div class="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-300">
                        <div class="flex justify-between items-end">
                            <div>
                                <h3 class="text-2xl font-bold text-white mb-1 group-hover:text-accent-glow transition-colors">
                                    ${item.title}
                                </h3>
                                <p class="text-sm text-text-muted">${item.subtitle || ''}</p>
                            </div>
                            <div class="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded text-xs font-bold text-white">
                                ${item.badge || 'STX'}
                            </div>
                        </div>
                        <div class="mt-4 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-6 transition-all duration-300">
                            <a href="${item.link || '#divisions'}" class="block text-center w-full bg-accent-blue/20 border border-accent-blue text-accent-glow py-2 font-bold text-sm hover:bg-accent-blue hover:text-white transition-colors">
                                VIEW SQUAD
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        buildCards('ALL');

        // Setup filter button listeners
        const filterContainer = document.getElementById('ui-division-filters');
        if (filterContainer) {
            const buttons = filterContainer.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => {
                        b.classList.remove('border-accent-blue', 'text-white');
                        b.classList.add('text-text-muted');
                    });
                    btn.classList.add('border-accent-blue', 'text-white');
                    btn.classList.remove('text-text-muted');
                    const category = (btn.dataset.filter || btn.innerText).trim().toUpperCase();
                    buildCards(category);
                });
            });
        }
    }

    // Render News
    function renderNews(newsData) {
        const featuredContainer = document.getElementById('ui-featured-news');
        if (featuredContainer && newsData.featured) {
            const f = newsData.featured;
            featuredContainer.innerHTML = `
                <div class="h-64 overflow-hidden relative">
                    <img src="${convertImageUrl(f.image) || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165'}"
                        alt="${f.title}"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                    <div class="absolute top-4 left-4 bg-accent-blue text-white text-xs font-bold px-3 py-1 uppercase">
                        ${f.tag || 'UPDATE'}
                    </div>
                </div>
                <div class="p-6">
                    <p class="text-text-muted text-xs mb-2 uppercase">${f.date || 'RECENT'} • ${f.category || 'COMMUNITY'}</p>
                    <h3 class="text-2xl font-bold text-white group-hover:text-accent-glow transition-colors mb-3">
                        ${f.title}
                    </h3>
                    <p class="text-text-muted text-sm line-clamp-2">${f.summary || ''}</p>
                </div>
            `;
            if (f.link && f.link !== '#') {
                featuredContainer.onclick = () => window.open(f.link, '_blank');
            }
        }

        const newsListContainer = document.getElementById('ui-news-list');
        if (newsListContainer && Array.isArray(newsData.articles)) {
            newsListContainer.innerHTML = newsData.articles.map(art => `
                <div class="flex gap-4 glass-panel p-4 group cursor-pointer hover:border-accent-blue/30 transition-colors"
                     onclick="${art.link && art.link !== '#' ? `window.open('${art.link}', '_blank')` : ''}">
                    <img src="${convertImageUrl(art.image) || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070'}"
                        class="w-24 h-24 object-cover flex-shrink-0" alt="${art.title}">
                    <div>
                        <p class="text-text-muted text-xs mb-1 uppercase">${art.date || 'RECENT'}</p>
                        <h4 class="font-bold text-white group-hover:text-accent-blue transition-colors">
                            ${art.title}
                        </h4>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Events & Working Countdown
    function renderEvents(eventsData) {
        const matchContainer = document.getElementById('ui-event-match');
        if (matchContainer && eventsData.match) {
            const m = eventsData.match;
            matchContainer.innerHTML = `
                <div class="absolute top-0 right-0 bg-accent-blue/10 p-4 rounded-bl-3xl">
                    <i class="ph-fill ph-sword text-2xl text-accent-blue"></i>
                </div>
                <h4 class="text-xl font-bold text-white mb-2">${m.opponent || 'UPCOMING MATCH'}</h4>
                <p class="text-sm text-text-muted mb-4">${m.league || 'Tournament League'}</p>

                <!-- Countdown -->
                <div class="flex space-x-4 mb-6" id="match-countdown-timer">
                    <div class="text-center">
                        <div id="cd-days" class="bg-base-dark text-white font-display font-bold text-xl px-3 py-2 rounded">00</div>
                        <div class="text-[10px] text-text-muted mt-1 uppercase">Days</div>
                    </div>
                    <div class="text-center">
                        <div id="cd-hours" class="bg-base-dark text-white font-display font-bold text-xl px-3 py-2 rounded">00</div>
                        <div class="text-[10px] text-text-muted mt-1 uppercase">Hours</div>
                    </div>
                    <div class="text-center">
                        <div id="cd-mins" class="bg-base-dark text-accent-glow font-display font-bold text-xl px-3 py-2 rounded">00</div>
                        <div class="text-[10px] text-text-muted mt-1 uppercase">Mins</div>
                    </div>
                </div>

                <a href="${m.buttonLink || '#'}" class="block text-center w-full btn-ghost text-sm py-2">
                    ${m.buttonText || 'SET REMINDER'}
                </a>
            `;

            // Live Countdown Calculation
            const targetTime = new Date(m.targetDate || '2026-10-25T20:00:00').getTime();
            function updateCountdown() {
                const now = new Date().getTime();
                const diff = targetTime - now;

                if (diff <= 0) {
                    const daysEl = document.getElementById('cd-days');
                    const hoursEl = document.getElementById('cd-hours');
                    const minsEl = document.getElementById('cd-mins');
                    if (daysEl) daysEl.innerText = "00";
                    if (hoursEl) hoursEl.innerText = "00";
                    if (minsEl) minsEl.innerText = "LIVE";
                    return;
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                const daysEl = document.getElementById('cd-days');
                const hoursEl = document.getElementById('cd-hours');
                const minsEl = document.getElementById('cd-mins');
                if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
                if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
                if (minsEl) minsEl.innerText = String(mins).padStart(2, '0');
            }

            updateCountdown();
            setInterval(updateCountdown, 60000);
        }

        const commContainer = document.getElementById('ui-event-community');
        if (commContainer && eventsData.community) {
            const c = eventsData.community;
            commContainer.innerHTML = `
                <h4 class="text-xl font-bold text-white mb-2">${c.title || 'Community Gathering'}</h4>
                <p class="text-sm text-text-muted mb-4">${c.subtitle || ''}</p>
                <p class="text-xs text-accent-glow font-bold mb-4 uppercase">${c.scheduleText || ''}</p>
                <a href="${c.buttonLink || '#'}" class="block text-center w-full btn-primary text-sm py-2">
                    ${c.buttonText || 'RSVP NOW'}
                </a>
            `;
        }
    }

    // Render Shop Products (for shop.html)
    function renderShopProducts(products) {
        const container = document.getElementById('ui-shop-products');
        if (!container) return;

        container.innerHTML = products.map(p => `
            <div class="glass-panel clip-edges flex flex-col relative overflow-hidden group">
                <div class="h-64 overflow-hidden relative">
                    <img src="${convertImageUrl(p.image) || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000'}" 
                         alt="${p.name}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                </div>
                <div class="p-6 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="text-2xl font-bold text-white mb-2">${p.name}</h3>
                        <p class="text-sm text-text-muted mb-4 line-clamp-2">${p.description || 'Barang merchandise eksklusif berkualitas premium dari STX Community.'}</p>
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xl text-accent-glow font-bold">Rp ${(Number(p.price) || 0).toLocaleString('id-ID')}</span>
                            <span class="text-xs text-text-muted">Est. Ongkir: ${p.shipping || 'Rp 20k - 50k'}</span>
                        </div>
                    </div>
                    <button onclick="openPurchaseModal('${p.name.replace(/'/g, "\\'")}', ${p.price || 0})" 
                            class="w-full btn-primary text-sm py-3 mt-4">
                        BELI SEKARANG
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Render Partners
    function renderPartners(partners) {
        const container = document.getElementById('ui-partners-container');
        if (!container) return;

        container.innerHTML = partners.map(partner => `
            <a href="${partner.url || '#'}" target="_blank" 
               class="h-12 bg-white/5 rounded flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer border border-white/5 hover:border-accent-blue/30">
                <span class="text-text-muted hover:text-white text-xs font-bold uppercase">${partner.name}</span>
            </a>
        `).join('');
    }

    // Handle Purchase Form Submit
    const purchaseForm = document.getElementById('purchase-form');
    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('checkout-submit-btn');
            const resultDiv = document.getElementById('checkout-result');
            const orderIdSpan = document.getElementById('checkout-order-id');
            const proofInput = document.getElementById('buyer-proof');
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'MEMPROSES...';
            }
            
            try {
                // Convert file to base64
                let paymentProof = '';
                if (proofInput && proofInput.files[0]) {
                    const file = proofInput.files[0];
                    if (file.size > 5 * 1024 * 1024) {
                        alert("Ukuran file terlalu besar! Maksimal 5MB.");
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'KONFIRMASI PEMBAYARAN'; }
                        return;
                    }
                    paymentProof = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                    });
                } else {
                    alert("Harap unggah bukti transfer!");
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'KONFIRMASI PEMBAYARAN'; }
                    return;
                }

                const payload = {
                    productName: document.getElementById('product-name-input').value,
                    buyerName: document.getElementById('buyer-name').value,
                    buyerPhone: document.getElementById('buyer-phone').value,
                    buyerAddress: document.getElementById('buyer-address').value,
                    buyerAccount: document.getElementById('buyer-account').value,
                    paymentMethod: document.getElementById('payment-method').value,
                    paymentProof: paymentProof
                };
                
                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await res.json();
                
                if (res.ok) {
                    if (resultDiv && orderIdSpan) {
                        orderIdSpan.innerText = result.orderId;
                        resultDiv.classList.remove('hidden');
                        
                        // Hide other form fields visually to focus on result
                        Array.from(purchaseForm.children).forEach(child => {
                            if (child.id !== 'checkout-result' && child.tagName !== 'BUTTON' && child.tagName !== 'INPUT' && child.type !== 'hidden') {
                                child.classList.add('hidden');
                            }
                        });
                        
                        if (submitBtn) {
                            submitBtn.innerHTML = 'TUTUP';
                            submitBtn.onclick = (ev) => {
                                ev.preventDefault();
                                closePurchaseModal();
                                setTimeout(() => window.location.reload(), 500);
                            };
                            submitBtn.disabled = false;
                        }
                    }
                } else {
                    alert(result.error || "Gagal memproses pesanan.");
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'KONFIRMASI PEMBAYARAN'; }
                }
            } catch (err) {
                console.error(err);
                alert("Kesalahan jaringan saat memproses pesanan.");
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'KONFIRMASI PEMBAYARAN'; }
            }
        });
    }
});

// Shop Modal Functions
function openPurchaseModal(productName, price) {
    const modal = document.getElementById('purchase-modal');
    const productNameDisplay = document.getElementById('modal-product-name');
    const productNameInput = document.getElementById('product-name-input');
    
    if (productNameDisplay) productNameDisplay.innerText = `${productName} (Rp ${Number(price).toLocaleString('id-ID')})`;
    if (productNameInput) productNameInput.value = productName;
    
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            if (modal.children[0]) modal.children[0].classList.remove('scale-95');
        }, 10);
    }
}

function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        if (modal.children[0]) modal.children[0].classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}
