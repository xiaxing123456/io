import versionConfig from "./version.js";

// ── Card Rendering ────────────────────────────────
function renderDocCards() {
    const grid = document.getElementById("docsGrid");
    const cards = [];

    Object.keys(versionConfig).forEach((docName) => {
        versionConfig[docName].forEach((info) => {
            cards.push({
                id: `${docName}-${info.version}`,
                name: docName,
                icon: getIcon(docName),
                link: info.link,
                target: info.target || "_self",
                version: info.version,
                description:
                    info.description ||
                    "探索核心 API 接口定义、开发指南以及最佳实践案例。",
            });
        });
    });

    grid.innerHTML = cards
        .map((doc, i) => {
            const href = `./${doc.name}/${doc.version}/`;
            const title = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);
            const delay = (0.6 + i * 0.1).toFixed(2);

            return `
                <a href="${href}" class="doc-card" target="${doc.target}" style="animation-delay:${delay}s">
                    <div class="card-inner">
                        <div class="card-banner">
                            ${getBannerSVG(doc.name)}
                        </div>
                        <div class="card-body">
                            <div class="card-icon">${doc.icon}</div>
                            <h2>${title}</h2>
                            <p>${doc.description}</p>
                            <div class="card-meta">
                                <span class="version-tag">${doc.version}</span>
                                <span class="card-action">
                                    立即阅读
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
            `;
        })
        .join("");

    initSpotlight();
}

function getIcon(name) {
    const icons = {
        blog: "📝",
        api: "⚡️",
        guide: "🧭",
        components: "🧩",
        default: "📄",
    };
    return icons[name.toLowerCase()] || icons["default"];
}

// ── Card Banner SVG Illustrations ─────────────────
function getBannerSVG(name) {
    const n = name.toLowerCase();

    if (n === "blog") {
        return `<svg class="card-banner-svg" viewBox="0 0 400 140" fill="none">
            <!-- Document page -->
            <rect x="130" y="12" width="140" height="116" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <!-- Title line -->
            <rect x="146" y="28" width="88" height="7" rx="3.5" fill="rgba(34,211,238,0.18)"/>
            <!-- Meta line -->
            <rect x="146" y="42" width="52" height="5" rx="2.5" fill="rgba(255,255,255,0.08)"/>
            <!-- Image placeholder -->
            <rect x="146" y="56" width="108" height="36" rx="4" fill="rgba(129,140,248,0.06)" stroke="rgba(129,140,248,0.1)" stroke-width="0.5"/>
            <path d="M170 80 L185 68 L200 78 L210 65 L230 82" stroke="rgba(129,140,248,0.2)" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="176" cy="68" r="4" fill="rgba(34,211,238,0.12)"/>
            <!-- Text lines -->
            <rect x="146" y="100" width="100" height="4" rx="2" fill="rgba(255,255,255,0.05)"/>
            <rect x="146" y="110" width="74" height="4" rx="2" fill="rgba(255,255,255,0.04)"/>
            <!-- Decorative circles -->
            <circle cx="54" cy="36" r="22" stroke="rgba(34,211,238,0.08)" stroke-width="1" fill="none"/>
            <circle cx="54" cy="36" r="9" fill="rgba(34,211,238,0.04)"/>
            <circle cx="354" cy="110" r="18" stroke="rgba(129,140,248,0.06)" stroke-width="1" fill="none"/>
            <circle cx="354" cy="110" r="6" fill="rgba(129,140,248,0.03)"/>
            <!-- Floating dots -->
            <circle cx="90" cy="100" r="2" fill="rgba(34,211,238,0.1)"/>
            <circle cx="320" cy="30" r="2.5" fill="rgba(167,139,250,0.1)"/>
            <circle cx="30" cy="80" r="1.5" fill="rgba(129,140,248,0.08)"/>
        </svg>`;
    }

    if (n === "api") {
        return `<svg class="card-banner-svg" viewBox="0 0 400 140" fill="none">
            <!-- Terminal window -->
            <rect x="90" y="16" width="220" height="108" rx="7" stroke="rgba(34,211,238,0.12)" stroke-width="1" fill="rgba(0,0,0,0.2)"/>
            <!-- Title bar -->
            <rect x="90" y="16" width="220" height="26" rx="7" fill="rgba(255,255,255,0.02)"/>
            <rect x="90" y="35" width="220" height="1" fill="rgba(255,255,255,0.04)"/>
            <circle cx="108" cy="29" r="3.5" fill="rgba(255,95,87,0.35)"/>
            <circle cx="120" cy="29" r="3.5" fill="rgba(254,188,46,0.35)"/>
            <circle cx="132" cy="29" r="3.5" fill="rgba(40,200,64,0.35)"/>
            <!-- Code lines -->
            <rect x="108" y="48" width="56" height="5" rx="2.5" fill="rgba(34,211,238,0.22)"/>
            <rect x="170" y="48" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.07)"/>
            <rect x="108" y="62" width="36" height="5" rx="2.5" fill="rgba(129,140,248,0.18)"/>
            <rect x="150" y="62" width="70" height="5" rx="2.5" fill="rgba(255,255,255,0.05)"/>
            <rect x="108" y="76" width="110" height="5" rx="2.5" fill="rgba(255,255,255,0.05)"/>
            <rect x="108" y="90" width="44" height="5" rx="2.5" fill="rgba(52,211,153,0.18)"/>
            <rect x="158" y="90" width="66" height="5" rx="2.5" fill="rgba(255,255,255,0.04)"/>
            <rect x="108" y="104" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.06)"/>
            <!-- Decorative -->
            <circle cx="46" cy="50" r="16" stroke="rgba(34,211,238,0.06)" stroke-width="1" fill="none"/>
            <circle cx="366" cy="100" r="12" stroke="rgba(129,140,248,0.06)" stroke-width="1" fill="none"/>
            <circle cx="60" cy="120" r="2" fill="rgba(167,139,250,0.1)"/>
            <circle cx="350" cy="30" r="2" fill="rgba(34,211,238,0.1)"/>
        </svg>`;
    }

    if (n === "guide") {
        return `<svg class="card-banner-svg" viewBox="0 0 400 140" fill="none">
            <!-- Compass rings -->
            <circle cx="200" cy="70" r="44" stroke="rgba(34,211,238,0.1)" stroke-width="1"/>
            <circle cx="200" cy="70" r="28" stroke="rgba(129,140,248,0.08)" stroke-width="1" stroke-dasharray="4 4"/>
            <circle cx="200" cy="70" r="12" stroke="rgba(167,139,250,0.1)" stroke-width="1"/>
            <!-- Cross hairs -->
            <line x1="200" y1="20" x2="200" y2="120" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
            <line x1="150" y1="70" x2="250" y2="70" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
            <!-- Compass needle -->
            <path d="M200 38 L205 65 L200 70 L195 65 Z" fill="rgba(34,211,238,0.2)"/>
            <path d="M200 102 L205 75 L200 70 L195 75 Z" fill="rgba(129,140,248,0.12)"/>
            <!-- Center dot -->
            <circle cx="200" cy="70" r="3" fill="rgba(34,211,238,0.4)"/>
            <!-- Cardinal dots -->
            <circle cx="200" cy="26" r="2" fill="rgba(34,211,238,0.2)"/>
            <circle cx="200" cy="114" r="2" fill="rgba(129,140,248,0.15)"/>
            <circle cx="156" cy="70" r="2" fill="rgba(255,255,255,0.08)"/>
            <circle cx="244" cy="70" r="2" fill="rgba(255,255,255,0.08)"/>
            <!-- Decorative -->
            <circle cx="60" cy="30" r="14" stroke="rgba(34,211,238,0.06)" stroke-width="1" fill="none"/>
            <circle cx="350" cy="110" r="10" stroke="rgba(167,139,250,0.06)" stroke-width="1" fill="none"/>
        </svg>`;
    }

    if (n === "components") {
        return `<svg class="card-banner-svg" viewBox="0 0 400 140" fill="none">
            <!-- Puzzle pieces / connected blocks -->
            <rect x="130" y="22" width="48" height="48" rx="8" stroke="rgba(34,211,238,0.15)" fill="rgba(34,211,238,0.03)"/>
            <rect x="222" y="22" width="48" height="48" rx="8" stroke="rgba(129,140,248,0.15)" fill="rgba(129,140,248,0.03)"/>
            <rect x="176" y="70" width="48" height="48" rx="8" stroke="rgba(167,139,250,0.15)" fill="rgba(167,139,250,0.03)"/>
            <!-- Connectors -->
            <line x1="178" y1="46" x2="222" y2="46" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3 3"/>
            <line x1="166" y1="70" x2="188" y2="70" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3 3"/>
            <line x1="236" y1="70" x2="212" y2="70" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3 3"/>
            <!-- Center nodes -->
            <circle cx="200" cy="46" r="3" fill="rgba(255,255,255,0.1)"/>
            <circle cx="177" cy="70" r="3" fill="rgba(255,255,255,0.1)"/>
            <circle cx="224" cy="70" r="3" fill="rgba(255,255,255,0.1)"/>
            <!-- Decorative -->
            <circle cx="56" cy="40" r="16" stroke="rgba(34,211,238,0.06)" stroke-width="1" fill="none"/>
            <circle cx="350" cy="100" r="14" stroke="rgba(129,140,248,0.06)" stroke-width="1" fill="none"/>
        </svg>`;
    }

    // Default pattern
    return `<svg class="card-banner-svg" viewBox="0 0 400 140" fill="none">
        <circle cx="200" cy="70" r="36" stroke="rgba(34,211,238,0.08)" stroke-width="1" fill="none"/>
        <circle cx="200" cy="70" r="18" stroke="rgba(129,140,248,0.06)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
        <circle cx="200" cy="70" r="4" fill="rgba(34,211,238,0.15)"/>
        <rect x="80" y="40" width="60" height="60" rx="8" stroke="rgba(255,255,255,0.04)" fill="rgba(255,255,255,0.01)"/>
        <rect x="260" y="40" width="60" height="60" rx="8" stroke="rgba(255,255,255,0.04)" fill="rgba(255,255,255,0.01)"/>
        <line x1="140" y1="70" x2="164" y2="70" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <line x1="236" y1="70" x2="260" y2="70" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <circle cx="50" cy="30" r="2" fill="rgba(34,211,238,0.08)"/>
        <circle cx="360" cy="110" r="2" fill="rgba(167,139,250,0.08)"/>
    </svg>`;
}

// ── Spotlight Effect (mouse-follow border glow) ───
function initSpotlight() {
    const grid = document.getElementById("docsGrid");
    const cards = grid.getElementsByClassName("doc-card");

    grid.addEventListener("mousemove", (e) => {
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            card.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }
    });
}

// ── Typewriter Effect ─────────────────────────────
function initTypewriter() {
    const el = document.getElementById("typewriter-text");
    if (!el) return;

    const words = ["Docs", "API", "Guide", "Best Practices"];
    let wi = 0,
        ci = 0,
        del = false;

    function tick() {
        const word = words[wi];
        ci += del ? -1 : 1;
        el.textContent = word.substring(0, ci);

        let wait;
        if (!del && ci === word.length) {
            del = true;
            wait = 2200;
        } else if (del && ci === 0) {
            del = false;
            wi = (wi + 1) % words.length;
            wait = 380;
        } else {
            const base = del ? 55 : 105;
            wait = base + (Math.random() * 50 - 25);
        }

        setTimeout(tick, wait);
    }

    tick();
}

// ── Filter Chips ──────────────────────────────────
function initFilters() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document
                .querySelectorAll(".filter-btn")
                .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

// ── Init ──────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    renderDocCards();
    initTypewriter();
    initFilters();
});
