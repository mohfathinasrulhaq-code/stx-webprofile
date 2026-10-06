const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

const DEFAULT_DATA = {
    hero: {
        tagline: "The Next Evolution",
        headlinePrefix: "WE ARE THE",
        headlineHighlight: "FUTURE",
        headlineSuffix: "OF COMMUNITY",
        sub: "Join the most dynamic esports and gaming community. Elevate your skills, connect with pros, and dominate the digital arena together.",
        cta1Text: "BECOME A MEMBER",
        cta1Link: "#join",
        cta2Text: "EXPLORE ROSTER",
        cta2Link: "#divisions"
    },
    // Backward compatibility
    heroHeadline: "FUTURE",
    heroSub: "Join the most dynamic esports and gaming community. Elevate your skills, connect with pros, and dominate the digital arena together.",
    statMembers: "15K+",
    statDivisions: "8",
    statTournaments: "120+",
    statChamps: "45",

    divisions: [
        {
            id: "div-1",
            title: "Delta Force Mobile",
            category: "ESPORTS",
            subtitle: "Pro Roster • 35 Players Active",
            badge: "STX 2025",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
            link: "#"
        },
        {
            id: "div-2",
            title: "MOBILE LEGENDS",
            category: "ESPORTS",
            subtitle: "Squad • 12 Active",
            badge: "STX 2025",
            image: "https://images.unsplash.com/photo-1614680376573-dfb367046420?q=80&w=1974&auto=format&fit=crop",
            link: "#"
        },
        {
            id: "div-3",
            title: "CONTENT PUBG Mobile",
            category: "CREATORS",
            subtitle: "Players • 40+ Active",
            badge: "STX BROTHERS",
            image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop",
            link: "#"
        }
    ],

    roster: [
        {
            id: "roster-1",
            divisionName: "DELTA FORCE MOBILE • PRO ROSTER",
            category: "ESPORTS DIVISION",
            categoryColor: "accent-glow",
            description: "Tier 1 Squad • Active Major Competitors",
            starterCount: "5 STARTERS",
            recruitLink: "https://discord.gg/stx",
            players: [
                { id: "p1", alias: "STX • PHANTOM", realName: "Fathir \"Phantom\" R.", role: "IGL / CAPTAIN", roleColor: "accent-glow", photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=400&auto=format&fit=crop" },
                { id: "p2", alias: "STX • VIPER", realName: "Raka \"Viper\" P.", role: "ENTRY FRAGGER", roleColor: "red-400", photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop" },
                { id: "p3", alias: "STX • SHADOW", realName: "Bima \"Shadow\" A.", role: "SNIPER / RECON", roleColor: "yellow-400", photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400&auto=format&fit=crop" },
                { id: "p4", alias: "STX • AEGIS", realName: "Dimas \"Aegis\" K.", role: "SUPPORT / MED", roleColor: "green-400", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop" },
                { id: "p5", alias: "STX • CYCLONE", realName: "Nico \"Cyclone\" S.", role: "FLANKER", roleColor: "purple-400", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" }
            ]
        },
        {
            id: "roster-2",
            divisionName: "MOBILE LEGENDS: BANG BANG",
            category: "ESPORTS DIVISION",
            categoryColor: "accent-glow",
            description: "Competitive Squad • Regional Tournament Roster",
            starterCount: "5 STARTERS",
            recruitLink: "https://discord.gg/stx",
            players: [
                { id: "p6", alias: "STX • KRONOS", realName: "Fajri \"Kronos\"", role: "JUNGLER", roleColor: "yellow-400", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" },
                { id: "p7", alias: "STX • MYSTIC", realName: "Aldi \"Mystic\"", role: "MID LANER", roleColor: "accent-glow", photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop" },
                { id: "p8", alias: "STX • SNIPEX", realName: "Kevin \"Snipex\"", role: "GOLD LANER", roleColor: "red-400", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=400&auto=format&fit=crop" },
                { id: "p9", alias: "STX • TITAN", realName: "Rizky \"Titan\"", role: "EXP LANER", roleColor: "purple-400", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" },
                { id: "p10", alias: "STX • WARDEN", realName: "Yoga \"Warden\"", role: "ROAMER / IGL", roleColor: "green-400", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop" }
            ]
        },
        {
            id: "roster-3",
            divisionName: "STX BROTHERS • CONTENT CREATOR SQUAD",
            category: "CONTENT CREATORS",
            categoryColor: "purple-300",
            description: "Streamers, Video Creators, and PUBG Mobile Influencers",
            starterCount: "40+ TALENTS",
            recruitLink: "https://tiktok.com/@official.spectranyx",
            players: [
                { id: "p11", alias: "STX • FOXGAMING", realName: "TikTok & YouTube Live", role: "PUBGM STREAMER", roleColor: "accent-glow", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
                { id: "p12", alias: "STX • VALKYRIE", realName: "Highlight Clips & Shorts", role: "TIKTOK CREATOR", roleColor: "purple-300", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
                { id: "p13", alias: "STX • ECHO", realName: "Tournament Caster & Host", role: "SHOUTCASTER", roleColor: "accent-blue", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop" }
            ]
        }
    ],

    news: {
        featured: {
            tag: "UPDATE",
            category: "COMMUNITY",
            date: "OCTOBER 5, 2026",
            title: "STX SECURES CHAMPIONSHIP TITLE AT REGIONAL MAJORS",
            summary: "The STX Valorant roster put on an absolute clinic in the grand finals, sweeping the opposition to claim the trophy.",
            image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop",
            link: "#"
        },
        articles: [
            {
                id: "art-1",
                date: "OCTOBER 2, 2026",
                title: "New Merchandise Drop: The Cyber Collection",
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
                link: "#"
            },
            {
                id: "art-2",
                date: "SEPTEMBER 28, 2026",
                title: "Delta Force Division Open Recruitment Season 4",
                image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
                link: "#"
            }
        ]
    },

    events: {
        match: {
            opponent: "STX vs CLOUD9",
            league: "VCT Pacific League - Week 4",
            targetDate: "2026-10-25T20:00:00",
            buttonText: "SET REMINDER",
            buttonLink: "#"
        },
        community: {
            title: "Community Gathering V.4",
            subtitle: "Discord Online Event & Watch Party",
            scheduleText: "OCT 10, 2026 • 20:00 GMT+7",
            buttonText: "RSVP NOW",
            buttonLink: "https://discord.gg/stx"
        }
    },

    products: [
        {
            id: "prod-1",
            name: "STX Pro Jersey 2026",
            price: 350000,
            shipping: "Rp 20k - 50k",
            image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "prod-2",
            name: "STX Classic Hoodie",
            price: 450000,
            shipping: "Rp 20k - 50k",
            image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=2000&auto=format&fit=crop"
        },
        {
            id: "prod-3",
            name: "STX Gaming Mousepad",
            price: 200000,
            shipping: "Rp 15k - 35k",
            image: "https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?q=80&w=2000&auto=format&fit=crop"
        }
    ],

    general: {
        siteName: "STX OFFICIAL",
        footerDesc: "The premier destination for competitive gaming, content creation, and community building in Southeast Asia.",
        discordUrl: "https://discord.gg/stx",
        instagramUrl: "https://instagram.com/stxcommunity",
        youtubeUrl: "https://youtube.com/@stxcommunity",
        tiktokUrl: "https://tiktok.com/@stxcommunity",
        adminEmail: "admin@stxcommunity.com",
        partners: [
            { id: "partner-1", name: "LUNATOPUP", url: "#" },
            { id: "partner-2", name: "GLITCH", url: "#" },
            { id: "partner-3", name: "NYX FAMILY", url: "#" }
        ]
    }
};

const crypto = require('crypto');

// Security Utilities
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(inputPassword, storedHash) {
    if (!storedHash || !inputPassword) return false;
    // Backward compatibility for legacy plaintext
    if (!storedHash.includes(':')) {
        return inputPassword === storedHash;
    }
    try {
        const [salt, hash] = storedHash.split(':');
        const testHash = crypto.scryptSync(inputPassword, salt, 64).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
    } catch (e) {
        return false;
    }
}

// In-memory Auth Tokens and Rate Limiting
const authTokens = new Map(); // token -> { createdAt, expiresAt }
const loginAttempts = new Map(); // ip -> { count, resetAt }

function cleanExpiredSessions() {
    const now = Date.now();
    for (const [token, data] of authTokens.entries()) {
        if (now > data.expiresAt) {
            authTokens.delete(token);
        }
    }
    for (const [ip, data] of loginAttempts.entries()) {
        if (now > data.resetAt) {
            loginAttempts.delete(ip);
        }
    }
}
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

// Rate Limiter Middleware for Auth Endpoints
function rateLimitLogin(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (attempt && now < attempt.resetAt) {
        if (attempt.count >= 5) {
            const waitSeconds = Math.ceil((attempt.resetAt - now) / 1000);
            return res.status(429).json({ 
                error: `Terlalu banyak percobaan login gagal. Demi keamanan, silakan coba lagi dalam ${waitSeconds} detik.` 
            });
        }
    }
    next();
}

function recordFailedLogin(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(ip) || { count: 0, resetAt: now + (15 * 60 * 1000) };
    if (now > attempt.resetAt) {
        attempt.count = 0;
        attempt.resetAt = now + (15 * 60 * 1000);
    }
    attempt.count += 1;
    loginAttempts.set(ip, attempt);
}

function clearFailedLogin(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    loginAttempts.delete(ip);
}

// Token Verification Helper
function verifyAuthToken(req) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return false;

    const session = authTokens.get(token);
    if (!session) return false;

    if (Date.now() > session.expiresAt) {
        authTokens.delete(token);
        return false;
    }
    return true;
}

// Function to read DB with automatic password hash migration
function readDb() {
    if (fs.existsSync(DB_FILE)) {
        try {
            const raw = fs.readFileSync(DB_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (!parsed.data) {
                parsed.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
                writeDb(parsed);
            } else {
                let changed = false;
                for (const key of Object.keys(DEFAULT_DATA)) {
                    if (parsed.data[key] === undefined) {
                        parsed.data[key] = JSON.parse(JSON.stringify(DEFAULT_DATA[key]));
                        changed = true;
                    }
                }
                if (changed) writeDb(parsed);
            }
            if (!parsed._adminPassword) {
                parsed._adminPassword = hashPassword("admin");
                writeDb(parsed);
            } else if (!parsed._adminPassword.includes(':')) {
                // Auto-upgrade plain password to secure scrypt hash
                parsed._adminPassword = hashPassword(parsed._adminPassword);
                writeDb(parsed);
            }
            return parsed;
        } catch (e) {
            console.error("Error reading db.json, using defaults:", e);
        }
    }
    const initDb = {
        _adminPassword: hashPassword("admin"),
        data: DEFAULT_DATA
    };
    writeDb(initDb);
    return initDb;
}

function writeDb(fullObj) {
    fs.writeFileSync(DB_FILE, JSON.stringify(fullObj, null, 2), 'utf-8');
}

// Security Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Explicitly protect db.json, package.json, server.js from direct static requests
app.use((req, res, next) => {
    const blockedPaths = ['/db.json', '/server.js', '/package.json', '/package-lock.json'];
    if (blockedPaths.includes(req.path.toLowerCase())) {
        return res.status(403).send('Akses Ditolak: File Konfigurasi Terproteksi.');
    }
    next();
});

app.use(express.json({ limit: '10mb' }));

// Melayani file statis CSS dan JS
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Melayani halaman HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/divisions', (req, res) => res.sendFile(path.join(__dirname, 'divisions.html')));
app.get('/divisions.html', (req, res) => res.sendFile(path.join(__dirname, 'divisions.html')));
app.get('/roster', (req, res) => res.sendFile(path.join(__dirname, 'roster.html')));
app.get('/roster.html', (req, res) => res.sendFile(path.join(__dirname, 'roster.html')));
app.get('/events', (req, res) => res.sendFile(path.join(__dirname, 'events.html')));
app.get('/events.html', (req, res) => res.sendFile(path.join(__dirname, 'events.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));
app.get('/shop.html', (req, res) => res.sendFile(path.join(__dirname, 'shop.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// API Endpoint untuk mengambil data ke pengunjung (Global)
app.get('/api/data', (req, res) => {
    const db = readDb();
    res.json(db.data || DEFAULT_DATA);
});

// Verifikasi password admin dengan Rate Limiting & Auth Token
app.post('/api/verify', rateLimitLogin, (req, res) => {
    const { password } = req.body;
    const db = readDb();

    if (!password || !verifyPassword(password, db._adminPassword)) {
        recordFailedLogin(req);
        return res.status(401).json({ error: "Password admin salah!" });
    }

    clearFailedLogin(req);
    // Generate secure cryptographically random session token (valid for 24 hours)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    authTokens.set(token, { createdAt: Date.now(), expiresAt });

    return res.json({ 
        success: true, 
        message: "Autentikasi berhasil!", 
        token 
    });
});

// API Endpoint untuk menyimpan data (Admin - Protected)
app.post('/api/save', (req, res) => {
    const { password, data } = req.body;
    const db = readDb();

    const isTokenValid = verifyAuthToken(req);
    const isPasswordValid = password && verifyPassword(password, db._adminPassword);

    if (!isTokenValid && !isPasswordValid) {
        return res.status(401).json({ error: "Sesi tidak valid atau password admin salah!" });
    }

    if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: "Data website tidak valid!" });
    }

    // Pastikan data backward compatibility terisi jika hero / stats diubah
    if (data.hero && data.hero.headlineHighlight) {
        data.heroHeadline = data.hero.headlineHighlight;
    }
    if (data.hero && data.hero.sub) {
        data.heroSub = data.hero.sub;
    }

    db.data = data;
    writeDb(db);
    res.json({ success: true, message: "Semua perubahan website berhasil disimpan secara Global!" });
});

// API Endpoint untuk ganti password admin (Protected)
app.post('/api/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const db = readDb();

    if (!oldPassword || !verifyPassword(oldPassword, db._adminPassword)) {
        return res.status(401).json({ error: "Password lama tidak sesuai!" });
    }

    if (!newPassword || newPassword.trim().length < 4) {
        return res.status(400).json({ error: "Password baru minimal 4 karakter!" });
    }

    db._adminPassword = hashPassword(newPassword.trim());
    writeDb(db);

    // Invalidate all existing tokens on password change
    authTokens.clear();
    const newToken = crypto.randomBytes(32).toString('hex');
    authTokens.set(newToken, { createdAt: Date.now(), expiresAt: Date.now() + (24 * 60 * 60 * 1000) });

    res.json({ 
        success: true, 
        message: "Password admin berhasil diperbarui dan dienkripsi!",
        token: newToken
    });
});

// API Endpoint untuk reset data ke default (Protected)
app.post('/api/reset', (req, res) => {
    const { password } = req.body;
    const db = readDb();

    const isTokenValid = verifyAuthToken(req);
    const isPasswordValid = password && verifyPassword(password, db._adminPassword);

    if (!isTokenValid && !isPasswordValid) {
        return res.status(401).json({ error: "Autentikasi gagal!" });
    }

    db.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    writeDb(db);
    res.json({ success: true, message: "Data website berhasil direset ke default!" });
});

// Jalankan Server jika dipanggil langsung
if (require.main === module) {
    app.listen(PORT, () => {
        readDb(); // Initialize and migrate DB if needed
        console.log(`\n=== STX COMMUNITY SERVER SECURE V2 ===`);
        console.log(`Website Utama : http://localhost:${PORT}`);
        console.log(`Halaman Shop  : http://localhost:${PORT}/shop.html`);
        console.log(`Halaman Admin : http://localhost:${PORT}/admin`);
        console.log(`Keamanan      : Password Hash Enkripsi + Anti Brute-Force + Token Auth Aktif`);
        console.log(`=======================================\n`);
    });
}

module.exports = app;
