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
            const delay = (0.5 + i * 0.1).toFixed(2);

            return `
                <a href="${href}" class="doc-card" target="${doc.target}" style="animation-delay:${delay}s">
                    <div class="card-inner">
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
