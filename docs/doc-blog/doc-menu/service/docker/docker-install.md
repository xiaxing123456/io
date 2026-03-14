# Docker 安装指南

Docker 是目前最流行的容器化平台，支持 Linux、macOS 和 Windows 多种操作系统。本文介绍在不同系统上安装 Docker 的方法。

::: info 官方文档
- [Docker 官网](https://www.docker.com/)
- [Docker Engine 安装文档](https://docs.docker.com/engine/install/)
- [Docker Desktop 下载](https://www.docker.com/products/docker-desktop/)
:::

## 一、Linux 安装（推荐服务器环境）

### 1.1 支持的发行版

Docker 官方支持以下 Linux 发行版：

- Ubuntu 20.04 / 22.04 / 24.04
- Debian 11 / 12
- CentOS 7 / 8
- RHEL 8 / 9
- Fedora

::: tip 国产发行版
OpenCloudOS、Anolis OS、龙蜥等国产发行版与 RHEL/CentOS 兼容，使用 CentOS 仓库安装即可。
:::

### 1.2 使用官方脚本安装（适合 Ubuntu/Debian）

> 官方脚本文档：[https://get.docker.com](https://get.docker.com) | [Ubuntu 安装指南](https://docs.docker.com/engine/install/ubuntu/) | [Debian 安装指南](https://docs.docker.com/engine/install/debian/)

```bash
# 下载并执行官方安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 1.3 手动安装（适合 CentOS / RHEL / OpenCloudOS）

> 官方文档：[CentOS 安装指南](https://docs.docker.com/engine/install/centos/) | [RHEL 安装指南](https://docs.docker.com/engine/install/rhel/) | [阿里云镜像站](https://mirrors.aliyun.com/docker-ce/linux/centos/)

```bash
# 1. 安装依赖工具
sudo yum install -y yum-utils

# 2. 添加 Docker 仓库（国内用阿里云镜像）
sudo yum-config-manager --add-repo \
  https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 3. 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# 4. 启动 Docker 并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 5. 验证安装
docker --version
```

### 1.4 配置镜像加速（国内服务器必做）

Docker Hub 在国内访问不稳定，需配置国内镜像源：

```bash
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.m.daocloud.io"
  ]
}
EOF

# 重载配置并重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

::: tip 腾讯云服务器
如果你使用腾讯云 CVM，`mirror.ccs.tencentyun.com` 走内网流量，速度最快，推荐优先使用。
:::

### 1.5 非 root 用户免 sudo 运行 Docker

```bash
# 将当前用户加入 docker 组
sudo usermod -aG docker $USER

# 重新登录后生效，验证
docker ps
```

---

## 二、Windows 安装（Docker Desktop）

### 2.1 系统要求

- Windows 10 64位 21H2 或更高版本
- Windows 11 64位
- 开启 WSL 2 或 Hyper-V

### 2.2 安装步骤

> 官方文档：[Docker Desktop for Windows 安装指南](https://docs.docker.com/desktop/setup/install/windows-install/) | [WSL 2 文档](https://learn.microsoft.com/zh-cn/windows/wsl/install)

1. 前往 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载 Docker Desktop
2. 双击安装包，按提示完成安装
3. 重启电脑
4. 打开 Docker Desktop，等待引擎启动

### 2.3 开启 WSL 2（推荐）

```powershell
# 以管理员身份运行 PowerShell
wsl --install
wsl --set-default-version 2
```

### 2.4 验证安装

```bash
docker --version
docker run hello-world
```

---

## 三、macOS 安装（Docker Desktop）

> 官方文档：[Docker Desktop for Mac 安装指南](https://docs.docker.com/desktop/setup/install/mac-install/)

### 3.1 Intel 芯片

前往 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载 **Docker Desktop for Mac (Intel)**。

### 3.2 Apple Silicon（M1/M2/M3）

前往官网下载 **Docker Desktop for Mac (Apple Silicon)**，原生支持 ARM64 架构。

::: warning 注意
运行 x86 镜像时需要加 `--platform linux/amd64` 参数。
:::

---

## 四、验证安装

无论哪个系统，安装完成后执行以下命令验证：

```bash
# 查看版本
docker --version

# 运行测试容器
docker run hello-world

# 查看运行中的容器
docker ps
```

输出类似以下内容即表示安装成功：

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

---

## 五、卸载 Docker

### Linux 卸载

```bash
sudo yum remove docker-ce docker-ce-cli containerd.io
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
```

### Windows / macOS

打开 Docker Desktop → Settings → 点击 **Uninstall** 按钮即可。

---

## 六、参考文档

| 文档 | 链接 |
|------|------|
| Docker 官网 | [https://www.docker.com](https://www.docker.com) |
| Docker Engine 安装总览 | [https://docs.docker.com/engine/install](https://docs.docker.com/engine/install/) |
| Ubuntu 安装 | [docs.docker.com/engine/install/ubuntu](https://docs.docker.com/engine/install/ubuntu/) |
| CentOS 安装 | [docs.docker.com/engine/install/centos](https://docs.docker.com/engine/install/centos/) |
| Docker Desktop | [docs.docker.com/desktop](https://docs.docker.com/desktop/) |
| 配置 daemon.json | [docs.docker.com/config/daemon](https://docs.docker.com/config/daemon/) |
| Docker Hub 镜像搜索 | [https://hub.docker.com](https://hub.docker.com) |
