import versionConfig from "./version.js";

// 渲染卡片
function renderDocCards() {
  const docsGrid = document.getElementById("docsGrid");
  const docCards = [];

  Object.keys(versionConfig).forEach((docsName) => {
    const versions = versionConfig[docsName];
    versions.forEach((versionInfo) => {
      docCards.push({
        id: `${docsName}-${versionInfo.version}`,
        name: docsName,
        icon: getIconForDoc(docsName),
        link: versionInfo.link,
        target: versionInfo.target || "_self",
        version: versionInfo.version,
        description:
          versionInfo.description ||
          "探索核心 API 接口定义、开发指南以及最佳实践案例。",
      });
    });
  });

  // 渲染 HTML，注意增加了 card-content 包装层以配合 z-index
  docsGrid.innerHTML = docCards
    .map((doc) => {
      const href = `./${doc.name}/${doc.version}/`;
      const title = doc.name.charAt(0).toUpperCase() + doc.name.slice(1);

      return `
        <a href="${href}" class="doc-card" target="${doc.target}">
            <div class="card-content">
                <div class="icon-box">${doc.icon}</div>
                <h2>${title}</h2>
                <p>${doc.description}</p>
                <div class="status-row">
                    <span class="version-pill">v${doc.version}</span>
                    <span class="action-link">立即阅读 <span style="font-family: sans-serif;">→</span></span>
                </div>
            </div>
        </a>
      `;
    })
    .join("");

  // 渲染完成后，初始化聚光灯效果
  initSpotlightEffect();
}

function getIconForDoc(name) {
  const icons = {
    blog: "📝",
    api: "⚡️",
    guide: "🧭",
    components: "🧩",
    default: "📄",
  };
  return icons[name.toLowerCase()] || icons["default"];
}

// === 核心：聚光灯效果逻辑 ===
function initSpotlightEffect() {
  const grid = document.getElementById("docsGrid");
  const cards = document.getElementsByClassName("doc-card");

  // 监听整个 Grid 的鼠标移动
  grid.addEventListener("mousemove", (e) => {
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 设置 CSS 变量，让 CSS 中的 radial-gradient 能够读取坐标
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  });
}

// === 打字机效果配置 ===
const typeConfig = {
  // 你想要轮播显示的文字数组
  words: ["Docs", "API", "Guide", "Best Practices"],
  waitBeforeDelete: 2000, // 打完字后停留多久 (毫秒)
  typeSpeed: 150, // 打字速度 (越小越快)
  deleteSpeed: 80, // 删除速度
};

function initTypewriter() {
  const textElement = document.getElementById("typewriter-text");
  // 如果页面上没有这个元素，防止报错
  if (!textElement) return;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = typeConfig.words[wordIndex];

    // 根据是删除还是输入，截取字符串
    if (isDeleting) {
      textElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      textElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    // 动态调整速度
    let typeSpeed = typeConfig.typeSpeed;
    if (isDeleting) typeSpeed = typeConfig.deleteSpeed;

    // 逻辑判断
    if (!isDeleting && charIndex === currentWord.length) {
      // 打字完成，暂停一会儿
      isDeleting = true;
      typeSpeed = typeConfig.waitBeforeDelete;
    } else if (isDeleting && charIndex === 0) {
      // 删除完成，切换到下一个词
      isDeleting = false;
      wordIndex = (wordIndex + 1) % typeConfig.words.length; // 循环数组
      typeSpeed = 500; // 开始新词前的小停顿
    }

    setTimeout(type, typeSpeed);
  }

  // 启动打字机
  type();
}

// 确保在 DOM 加载后运行
document.addEventListener("DOMContentLoaded", () => {
  renderDocCards(); // 原有的渲染卡片
  initTypewriter(); // 新增的打字机
});
