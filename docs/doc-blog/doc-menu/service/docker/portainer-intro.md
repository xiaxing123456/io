# Portainer 介绍

Portainer 是目前最流行的 Docker 可视化管理工具，提供直观的 Web 界面来管理容器、镜像、网络和数据卷，无需记忆复杂的 Docker 命令。

::: info 官方资源
- 官网：[https://www.portainer.io](https://www.portainer.io)
- 文档：[https://docs.portainer.io](https://docs.portainer.io)
- GitHub：[github.com/portainer/portainer](https://github.com/portainer/portainer)
- CE vs BE 对比：[docs.portainer.io/start/intro](https://docs.portainer.io/start/intro)
:::

## 一、什么是 Portainer

Portainer 本身也是一个运行在 Docker 中的容器，通过挂载 Docker Socket 与 Docker 守护进程通信，实现对 Docker 环境的完整管理。

**核心特点：**

- 📦 **容器全生命周期管理** — 创建、启动、停止、删除、重启
- 🖼️ **镜像管理** — 拉取、删除、推送、构建
- 🌐 **网络 & 数据卷管理** — 可视化配置
- 📋 **日志实时查看** — 无需 SSH 进服务器
- 💻 **Web 终端** — 直接在浏览器中进入容器
- 🚀 **Stack（Compose）部署** — 支持 Docker Compose 格式

---

## 二、版本对比

Portainer 提供两个版本：

| 特性 | Community Edition (CE) | Business Edition (BE) |
|------|----------------------|----------------------|
| 价格 | **免费** | 付费 |
| 开源 | ✅ | ❌ |
| 单机 Docker 管理 | ✅ | ✅ |
| Docker Swarm 管理 | ✅ | ✅ |
| Kubernetes 管理 | 基础功能 | 完整功能 |
| 多用户 & 权限管理 | 基础 | 高级 RBAC |
| 审计日志 | ❌ | ✅ |
| 镜像安全扫描 | ❌ | ✅ |
| 适合场景 | 个人 / 小团队 | 企业 / 生产环境 |

::: tip
对于个人开发者和小团队，**CE 版本完全够用**。
:::

---

## 三、主要功能详解

### 3.1 仪表盘（Dashboard）

首页展示当前 Docker 环境的整体状态：
- 运行中 / 停止的容器数量
- 本地镜像数量
- 数据卷和网络数量
- 资源使用概览

### 3.2 容器管理

| 功能 | 说明 |
|------|------|
| 容器列表 | 查看所有容器状态、端口、创建时间 |
| 快速操作 | 一键启动 / 停止 / 重启 / 删除 |
| 容器详情 | 查看配置、环境变量、挂载信息 |
| 实时日志 | 浏览器内查看实时输出日志 |
| Web 控制台 | 直接在浏览器中执行 shell 命令 |
| 统计信息 | CPU、内存、网络 I/O 实时图表 |

### 3.3 镜像管理

- 从 Docker Hub 或私有仓库拉取镜像
- 查看镜像层级结构
- 删除不用的镜像释放磁盘空间
- 导出 / 导入镜像

### 3.4 Stack（Compose 部署）

支持直接在界面中粘贴 `docker-compose.yml` 内容一键部署多容器应用，等同于 `docker compose up -d`。

### 3.5 网络管理

- 查看所有 Docker 网络
- 创建自定义 bridge 网络
- 查看网络内的容器连接关系

### 3.6 数据卷管理

- 列出所有数据卷
- 查看数据卷详情和大小
- 删除未使用的数据卷释放空间
- 数据卷浏览器（查看卷内文件）

---

## 四、支持的平台

| 平台 | 支持情况 |
|------|--------|
| Docker 单机 | ✅ 完整支持 |
| Docker Swarm | ✅ 支持 |
| Kubernetes | ✅ 支持（CE 基础功能） |
| Azure ACI | ✅ BE 版支持 |
| 远程 Docker 环境 | ✅ 支持多环境管理 |

---

## 五、技术架构

```
浏览器
  │
  │  HTTPS (9443)
  ▼
Portainer 容器
  │
  │  挂载 /var/run/docker.sock
  ▼
Docker 守护进程（dockerd）
  │
  ├── 容器 A
  ├── 容器 B
  └── 容器 C
```

Portainer 通过 Unix Socket (`/var/run/docker.sock`) 与 Docker 守护进程通信，等同于在命令行执行 `docker` 命令，但提供了图形化界面。

---

## 六、与同类工具对比

| 工具 | 优点 | 缺点 | 官网 |
|------|------|------|------|
| **Portainer** | 功能全面、界面友好、开箱即用 | 占用一个容器 | [portainer.io](https://www.portainer.io) |
| Lazydocker | 终端 TUI，轻量 | 需要 SSH 访问 | [github.com/jesseduffield/lazydocker](https://github.com/jesseduffield/lazydocker) |
| Yacht | 界面简洁 | 功能相对少 | [yacht.sh](https://yacht.sh) |
| Docker Desktop | 官方工具，适合本地开发 | 不适合服务器 | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |

---

## 七、官方资源

- 官网：[https://www.portainer.io](https://www.portainer.io)
- GitHub：[https://github.com/portainer/portainer](https://github.com/portainer/portainer)
- 文档：[https://docs.portainer.io](https://docs.portainer.io)
