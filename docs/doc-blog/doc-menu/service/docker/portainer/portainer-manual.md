# Portainer 使用手册

本文详细介绍 Portainer CE 的各功能模块使用方法，帮助你通过 Web 界面高效管理 Docker 环境。

::: info 官方文档
- [Portainer 用户文档总览](https://docs.portainer.io/user/home)
- [容器管理文档](https://docs.portainer.io/user/docker/containers)
- [Stack（Compose）文档](https://docs.portainer.io/user/docker/stacks)
- [数据卷管理文档](https://docs.portainer.io/user/docker/volumes)
:::

## 一、界面总览

登录后进入主界面，左侧导航栏包含以下模块：

| 菜单 | 功能 |
|------|------|
| **Home** | 环境列表，管理多个 Docker 环境 |
| **Containers** | 容器管理 |
| **Images** | 镜像管理 |
| **Networks** | 网络管理 |
| **Volumes** | 数据卷管理 |
| **Stacks** | Compose 应用部署 |
| **Registries** | 镜像仓库配置 |
| **Settings** | 系统设置 |

---

## 二、容器管理

### 2.1 查看容器列表

进入 **Containers** 页面，可以看到所有容器的：
- 名称和 ID
- 运行状态（绿色运行中 / 灰色已停止）
- 镜像名称
- 创建时间
- 端口映射
- 快捷操作按钮

### 2.2 启动 / 停止 / 重启容器

在容器列表中，每行右侧有快捷操作按钮：
- ▶️ **Start** — 启动停止的容器
- ⏹ **Stop** — 优雅停止运行中的容器
- 🔄 **Restart** — 重启容器
- ☠️ **Kill** — 强制终止
- 🗑️ **Remove** — 删除容器

也可以勾选多个容器进行批量操作。

### 2.3 查看容器详情

点击容器名称进入详情页，包含：

**Overview（概览）**
- 容器 ID、状态、创建时间
- 镜像信息
- 端口映射列表
- 环境变量
- 挂载（Volumes / Bind Mounts）
- 网络连接

**Logs（日志）**
- 实时查看容器输出日志
- 支持搜索过滤
- 可下载日志文件

**Console（控制台）**
- 直接在浏览器中进入容器 shell
- 支持选择 bash / sh / 自定义命令

**Stats（统计）**
- CPU 使用率实时图表
- 内存使用量
- 网络 I/O
- 磁盘 I/O

### 2.4 创建新容器

点击 **Add container** 按钮，填写以下信息：

1. **Name** — 容器名称
2. **Image** — 镜像名称（如 `nginx:latest`）
3. **Port mapping** — 添加端口映射规则
4. **Volumes** — 配置挂载点
5. **Env** — 设置环境变量
6. **Restart policy** — 重启策略（推荐 `Always`）
7. **Network** — 选择网络

填写完成后点击 **Deploy the container**。

---

## 三、镜像管理

### 3.1 查看本地镜像

进入 **Images** 页面，显示所有本地镜像的名称、标签、大小和创建时间。

### 3.2 拉取镜像

1. 点击 **Pull image**
2. 在 **Image** 输入框输入镜像名（如 `nginx:latest`）
3. 选择镜像仓库（默认 DockerHub）
4. 点击 **Pull the image**

::: tip 国内服务器拉取慢
可以先在服务器配置镜像加速，Portainer 拉取时会走加速地址。
:::

### 3.3 删除镜像

勾选要删除的镜像，点击 **Remove**。

::: warning 注意
有容器正在使用的镜像无法直接删除，需要先删除相关容器。
:::

### 3.4 镜像详情

点击镜像名称可查看：
- 镜像 ID 和摘要（Digest）
- 层级信息（每一层的大小）
- 创建命令历史

---

## 四、Stack（Compose 部署）

> 官方文档：[Portainer Stacks 文档](https://docs.portainer.io/user/docker/stacks) | [Docker Compose 文件格式规范](https://docs.docker.com/compose/compose-file/)

Stack 是 Portainer 中最强大的功能之一，支持通过 Docker Compose 格式一键部署多容器应用。

### 4.1 创建 Stack

1. 进入 **Stacks** → 点击 **Add stack**
2. 填写 **Name**（Stack 名称）
3. 在 **Web editor** 中粘贴 `docker-compose.yml` 内容

**示例：部署 Nginx**

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    restart: always
```

4. 点击 **Deploy the stack**

### 4.2 更新 Stack

修改 Compose 配置后，点击 **Update the stack** 即可重新部署（会重建变化的容器）。

### 4.3 停止 / 删除 Stack

- **Stop this stack** — 停止所有服务但保留配置
- **Delete this stack** — 删除所有容器和配置

---

## 五、网络管理

### 5.1 查看网络列表

进入 **Networks** 页面，显示所有 Docker 网络：
- `bridge` — 默认桥接网络
- `host` — 主机网络
- `none` — 无网络
- 自定义网络

### 5.2 创建自定义网络

1. 点击 **Add network**
2. 填写网络名称
3. 选择驱动（通常选 `bridge`）
4. 配置子网 / IP 范围（可选）
5. 点击 **Create the network**

### 5.3 连接容器到网络

在容器详情页 → **Connected networks** → **Join a network**，选择目标网络即可。

---

## 六、数据卷管理

### 6.1 查看数据卷

进入 **Volumes** 页面，显示所有数据卷的名称、挂载点和创建时间。

### 6.2 创建数据卷

1. 点击 **Add volume**
2. 填写卷名称
3. 点击 **Create the volume**

### 6.3 浏览卷内容

点击数据卷名称 → **Browse** 可以直接浏览卷内的文件和目录。

### 6.4 清理未使用的卷

**Unused volumes** 标签下列出所有未被容器使用的数据卷，可以批量删除释放空间。

---

## 七、镜像仓库配置

如果需要从私有仓库拉取镜像，需要先在 **Registries** 中添加仓库配置：

1. 进入 **Registries** → **Add registry**
2. 选择类型：Custom registry / DockerHub / AWS ECR / Azure ACR 等
3. 填写仓库地址、用户名、密码
4. 点击 **Add registry**

之后在拉取镜像时选择对应的仓库即可。

---

## 八、系统设置

### 8.1 修改管理员密码

**Settings** → **Users** → 点击用户名 → **Update password**

### 8.2 设置 SSL 证书

**Settings** → **SSL certificate** → 上传自己的证书替换默认自签名证书。

### 8.3 备份数据

Portainer 的配置数据存储在 `portainer_data` 数据卷中，备份该卷即可：

```bash
# 备份数据卷到 tar 文件
docker run --rm \
  -v portainer_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/portainer_backup.tar.gz /data
```

### 8.4 恢复数据

```bash
# 从备份恢复数据卷
docker run --rm \
  -v portainer_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/portainer_backup.tar.gz -C /
```

---

## 九、常见问题

### Q: 首次访问提示"timeout"，无法初始化？

Portainer 首次启动后 **5 分钟内** 未完成初始化会锁定，重启容器解决：

```bash
docker restart portainer
```

### Q: 登录后看不到容器？

检查 `/var/run/docker.sock` 是否正确挂载：

```bash
docker inspect portainer | grep docker.sock
```

### Q: 浏览器提示证书不安全？

Portainer 默认使用自签名证书，点击浏览器的"高级" → "继续访问"即可忽略，或在 Settings 中上传正规 SSL 证书。

### Q: 忘记管理员密码？

```bash
# 停止 Portainer
docker stop portainer

# 重置密码（使用 portainer helper 工具）
docker run --rm \
  -v portainer_data:/data \
  portainer/helper-reset-password

# 重新启动
docker start portainer
```

执行后会输出新的临时密码，登录后立即修改。

---

## 十、参考文档

| 文档 | 链接 |
|------|------|
| Portainer 用户手册总览 | [docs.portainer.io/user/home](https://docs.portainer.io/user/home) |
| 容器管理 | [docs.portainer.io/user/docker/containers](https://docs.portainer.io/user/docker/containers) |
| 镜像管理 | [docs.portainer.io/user/docker/images](https://docs.portainer.io/user/docker/images) |
| Stack 部署 | [docs.portainer.io/user/docker/stacks](https://docs.portainer.io/user/docker/stacks) |
| 网络管理 | [docs.portainer.io/user/docker/networks](https://docs.portainer.io/user/docker/networks) |
| 数据卷管理 | [docs.portainer.io/user/docker/volumes](https://docs.portainer.io/user/docker/volumes) |
| 密码重置 | [docs.portainer.io/admin/troubleshooting](https://docs.portainer.io/admin/troubleshooting) |
