# 使用 Docker 安装 Portainer

本文介绍如何在已安装 Docker 的服务器上部署 Portainer CE（社区版）。

::: info 官方文档
- [Portainer CE 安装指南（Linux）](https://docs.portainer.io/start/install-ce/server/docker/linux)
- [Portainer CE 安装指南（Windows）](https://docs.portainer.io/start/install-ce/server/docker/wsl)
- [Portainer 升级文档](https://docs.portainer.io/start/upgrade)
:::

## 一、前置条件

- 已安装 Docker（版本 >= 20.10）
- 服务器防火墙 / 安全组已开放端口

验证 Docker 是否正常运行：

```bash
docker --version
docker ps
```

---

## 二、快速安装

### 2.1 创建数据卷

Portainer 需要一个持久化数据卷来保存配置信息：

```bash
docker volume create portainer_data
```

### 2.2 运行 Portainer 容器

**国内服务器（使用 DaoCloud 镜像，解决 Docker Hub 访问问题）：**

```bash
docker run -d \
  -p 8000:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  docker.m.daocloud.io/portainer/portainer-ce:latest
```

**海外服务器或网络正常：**

```bash
docker run -d \
  -p 8000:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### 2.3 参数说明

| 参数 | 说明 |
|------|------|
| `-d` | 后台运行 |
| `-p 8000:8000` | Edge Agent 通信端口（管理远程环境使用） |
| `-p 9443:9443` | Portainer Web 界面 HTTPS 端口 |
| `--name portainer` | 容器名称 |
| `--restart=always` | 宕机 / 重启后自动启动 |
| `-v /var/run/docker.sock:/var/run/docker.sock` | 挂载 Docker Socket，允许 Portainer 管理 Docker |
| `-v portainer_data:/data` | 持久化 Portainer 配置数据 |

::: tip 只用 HTTP？
如果不需要 HTTPS，可以映射 `9000` 端口使用 HTTP 访问：

```bash
docker run -d \
  -p 9000:9000 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  docker.m.daocloud.io/portainer/portainer-ce:latest
```

然后访问 `http://服务器IP:9000`
:::

---

## 三、验证安装

```bash
# 查看容器是否正常运行
docker ps

# 查看 Portainer 日志
docker logs portainer
```

正常运行时 `docker ps` 输出类似：

```
CONTAINER ID   IMAGE                    COMMAND        CREATED        STATUS        PORTS
abc123456789   portainer/portainer-ce   "/portainer"   1 minute ago   Up 1 minute   0.0.0.0:9443->9443/tcp
```

---

## 四、开放服务器端口

### 腾讯云安全组

1. 进入 [腾讯云控制台](https://console.cloud.tencent.com/) → 云服务器
2. 点击实例 → **安全组** → **修改规则**
3. 入站规则 → 添加规则：
   - 协议：TCP
   - 端口：`9443`（HTTPS）或 `9000`（HTTP）
   - 来源：`0.0.0.0/0`（所有 IP）或指定 IP

### 阿里云安全组

> [阿里云 ECS 控制台](https://ecs.console.aliyun.com/)

1. ECS 控制台 → 实例 → **安全组配置**
2. 手动添加入方向规则，端口 `9443`

### 服务器防火墙（firewalld）

```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=9443/tcp
sudo firewall-cmd --reload

# 验证
sudo firewall-cmd --list-ports
```

---

## 五、初始化配置

### 5.1 访问 Web 界面

打开浏览器访问：

```
https://你的服务器IP:9443
```

::: warning 证书警告
Portainer 使用自签名证书，浏览器会提示"不安全"，点击"高级" → "继续访问"即可。
:::

### 5.2 创建管理员账号

首次访问会显示初始化页面：

1. 输入用户名（默认 `admin`）
2. 输入密码（**至少 12 位**）
3. 点击 **Create user**

::: danger 重要
必须在 **5 分钟内** 完成初始化！超时后 Portainer 会拒绝访问，需要重启容器：

```bash
docker restart portainer
```
:::

### 5.3 选择环境类型

初始化完成后，选择 **Get Started** 使用本地 Docker 环境，Portainer 会自动检测当前服务器上的 Docker。

---

## 六、升级 Portainer

```bash
# 停止并删除旧容器（数据卷保留）
docker stop portainer
docker rm portainer

# 拉取最新镜像
docker pull docker.m.daocloud.io/portainer/portainer-ce:latest

# 重新运行（命令与安装时相同）
docker run -d \
  -p 8000:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  docker.m.daocloud.io/portainer/portainer-ce:latest
```

::: tip
数据卷 `portainer_data` 没有删除，升级后账号和配置都会保留。
:::

---

## 七、卸载 Portainer

```bash
# 停止并删除容器
docker stop portainer
docker rm portainer

# 删除数据卷（会清除所有配置）
docker volume rm portainer_data
```

---

## 八、参考文档

| 文档 | 链接 |
|------|------|
| Portainer CE 安装（Linux） | [docs.portainer.io/start/install-ce/server/docker/linux](https://docs.portainer.io/start/install-ce/server/docker/linux) |
| Portainer CE 安装（Windows） | [docs.portainer.io/start/install-ce/server/docker/wsl](https://docs.portainer.io/start/install-ce/server/docker/wsl) |
| Portainer 升级 | [docs.portainer.io/start/upgrade](https://docs.portainer.io/start/upgrade) |
| 腾讯云安全组文档 | [cloud.tencent.com/document/product/213/39740](https://cloud.tencent.com/document/product/213/39740) |
| 阿里云安全组文档 | [help.aliyun.com/document_detail/25475.html](https://help.aliyun.com/document_detail/25475.html) |
