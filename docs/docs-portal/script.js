// 导入版本配置
import versionConfig from "./version.js";

// 渲染文档卡片
function renderDocCards() {
  const docsGrid = document.getElementById("docsGrid");

  // 将 versionConfig 转换为文档卡片数组
  const docCards = [];

  // 遍历 versionConfig 中的每个文档
  Object.keys(versionConfig).forEach((docsName) => {
    const versions = versionConfig[docsName];

    // 为每个版本创建一个卡片
    versions.forEach((versionInfo) => {
      docCards.push({
        id: `${docsName}-${versionInfo.version}`,
        name: docsName,
        icon: "📝",
        link: versionInfo.link,
        target: versionInfo.target || "_self",
        version: versionInfo.version,
      });
    });
  });

  // 生成路径：./{docsName}-{version}/
  docsGrid.innerHTML = docCards
    .map((doc) => {
      const path = `./${doc.name}/${doc.version}/`;
      return `
        <a href="${path}" class="doc-card" data-doc-id="${doc.id}" target="${doc.target}">
            <div class="doc-card-icon">${doc.icon}</div>
            <h2>${doc.name}</h2>
            <div class="doc-card-meta">
                <span>版本: ${doc.version}</span>
                <span>→</span>
            </div>
            <button class="doc-card-button">查看文档</button>
        </a>
      `;
    })
    .join("");
}

// 页面加载时渲染
document.addEventListener("DOMContentLoaded", renderDocCards);
