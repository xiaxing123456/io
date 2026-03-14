# Docker 常用命令

Docker 命令分为镜像管理、容器管理、网络管理、数据卷管理等几大类。本文汇总日常开发运维中最常用的命令。

::: info 官方文档
- [Docker CLI 完整参考](https://docs.docker.com/reference/cli/docker/)
- [Docker Hub 镜像搜索](https://hub.docker.com)
- [Docker Compose 文档](https://docs.docker.com/compose/)
:::

## 一、镜像（Image）命令

> 官方文档：[docker image 命令参考](https://docs.docker.com/reference/cli/docker/image/)

### 1.1 拉取镜像

```bash
# 拉取最新版本
docker pull nginx

# 拉取指定版本
docker pull nginx:1.25

# 从国内镜像源拉取
docker pull docker.m.daocloud.io/nginx:latest
```

### 1.2 查看镜像

```bash
# 列出本地所有镜像
docker images

# 查看详细信息
docker inspect nginx

# 查看镜像历史层
docker history nginx
```

### 1.3 搜索镜像

```bash
docker search nginx
```

### 1.4 删除镜像

```bash
# 删除指定镜像
docker rmi nginx

# 强制删除（有容器引用时）
docker rmi -f nginx

# 删除所有未使用的镜像
docker image prune -a
```

### 1.5 导入导出镜像

```bash
# 导出镜像为 tar 文件
docker save -o nginx.tar nginx:latest

# 导入镜像
docker load -i nginx.tar

# 推送镜像到仓库
docker push myrepo/myimage:tag
```

### 1.6 构建镜像

```bash
# 在 Dockerfile 所在目录构建
docker build -t myapp:1.0 .

# 指定 Dockerfile 路径
docker build -f ./docker/Dockerfile -t myapp:1.0 .
```

---

## 二、容器（Container）命令

> 官方文档：[docker container 命令参考](https://docs.docker.com/reference/cli/docker/container/) | [docker run 参数详解](https://docs.docker.com/reference/cli/docker/container/run/)

### 2.1 运行容器

```bash
# 基础运行
docker run nginx

# 后台运行（detached 模式）
docker run -d nginx

# 指定容器名称
docker run -d --name my-nginx nginx

# 端口映射 (宿主机端口:容器端口)
docker run -d -p 8080:80 nginx

# 挂载目录 (宿主机路径:容器路径)
docker run -d -v /data/html:/usr/share/nginx/html nginx

# 设置环境变量
docker run -d -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0

# 设置重启策略
docker run -d --restart=always nginx

# 综合示例
docker run -d \
  --name my-nginx \
  -p 8080:80 \
  -v /data/html:/usr/share/nginx/html \
  --restart=always \
  nginx:latest
```

### 2.2 查看容器

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器详细信息
docker inspect my-nginx

# 查看容器资源占用
docker stats

# 查看容器占用（不持续刷新）
docker stats --no-stream
```

### 2.3 容器启停

```bash
# 启动已停止的容器
docker start my-nginx

# 停止运行中的容器（优雅停止）
docker stop my-nginx

# 强制停止
docker kill my-nginx

# 重启容器
docker restart my-nginx

# 暂停 / 恢复容器
docker pause my-nginx
docker unpause my-nginx
```

### 2.4 删除容器

```bash
# 删除已停止的容器
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx

# 删除所有已停止的容器
docker container prune
```

### 2.5 进入容器

```bash
# 进入容器（推荐，可 Ctrl+D 退出不影响容器）
docker exec -it my-nginx bash

# 进入容器（使用 sh，适合无 bash 的镜像）
docker exec -it my-nginx sh

# 在容器中执行单条命令
docker exec my-nginx nginx -s reload
```

### 2.6 查看日志

```bash
# 查看全部日志
docker logs my-nginx

# 实时追踪日志（类似 tail -f）
docker logs -f my-nginx

# 查看最近 100 行
docker logs --tail 100 my-nginx

# 查看带时间戳的日志
docker logs -t my-nginx

# 组合使用
docker logs -f --tail 50 my-nginx
```

### 2.7 文件复制

```bash
# 从容器复制到宿主机
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf

# 从宿主机复制到容器
docker cp ./nginx.conf my-nginx:/etc/nginx/nginx.conf
```

---

## 三、数据卷（Volume）命令

> 官方文档：[docker volume 命令参考](https://docs.docker.com/reference/cli/docker/volume/) | [数据卷使用指南](https://docs.docker.com/engine/storage/volumes/)

```bash
# 创建数据卷
docker volume create mydata

# 查看所有数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect mydata

# 删除数据卷
docker volume rm mydata

# 删除所有未使用的数据卷
docker volume prune

# 挂载数据卷运行容器
docker run -d -v mydata:/var/lib/mysql mysql:8.0
```

---

## 四、网络（Network）命令

> 官方文档：[docker network 命令参考](https://docs.docker.com/reference/cli/docker/network/) | [Docker 网络概述](https://docs.docker.com/engine/network/)

```bash
# 查看所有网络
docker network ls

# 创建自定义网络
docker network create mynet

# 查看网络详情
docker network inspect mynet

# 将容器加入网络
docker network connect mynet my-nginx

# 断开容器与网络的连接
docker network disconnect mynet my-nginx

# 删除网络
docker network rm mynet
```

---

## 五、Docker Compose 命令

> 官方文档：[Docker Compose 命令参考](https://docs.docker.com/reference/cli/docker/compose/) | [Compose 文件格式规范](https://docs.docker.com/compose/compose-file/)

```bash
# 启动所有服务（后台）
docker compose up -d

# 停止所有服务
docker compose down

# 停止并删除数据卷
docker compose down -v

# 查看服务状态
docker compose ps

# 查看服务日志
docker compose logs -f

# 重建并启动
docker compose up -d --build

# 指定 compose 文件
docker compose -f docker-compose.prod.yml up -d
```

---

## 六、系统清理命令

> 官方文档：[docker system 命令参考](https://docs.docker.com/reference/cli/docker/system/)

```bash
# 查看 Docker 磁盘占用
docker system df

# 一键清理（停止的容器 + 未使用的网络 + 悬空镜像）
docker system prune

# 清理所有未使用资源（包括未使用的镜像和数据卷）
docker system prune -a --volumes
```

---

## 七、常用命令速查表

| 操作 | 命令 |
|------|------|
| 拉取镜像 | `docker pull <image>` |
| 运行容器 | `docker run -d --name <name> -p <host>:<container> <image>` |
| 查看容器 | `docker ps` |
| 进入容器 | `docker exec -it <name> bash` |
| 查看日志 | `docker logs -f <name>` |
| 停止容器 | `docker stop <name>` |
| 删除容器 | `docker rm <name>` |
| 查看镜像 | `docker images` |
| 删除镜像 | `docker rmi <image>` |
| 清理资源 | `docker system prune` |

---

## 八、参考文档

| 命令类别 | 官方文档链接 |
|---------|------------|
| Docker CLI 总览 | [docs.docker.com/reference/cli/docker](https://docs.docker.com/reference/cli/docker/) |
| docker run | [docs.docker.com/.../container/run](https://docs.docker.com/reference/cli/docker/container/run/) |
| docker build | [docs.docker.com/.../image/build](https://docs.docker.com/reference/cli/docker/image/build/) |
| docker compose | [docs.docker.com/.../compose](https://docs.docker.com/reference/cli/docker/compose/) |
| Compose 文件规范 | [docs.docker.com/compose/compose-file](https://docs.docker.com/compose/compose-file/) |
| Docker Hub | [hub.docker.com](https://hub.docker.com) |
| Dockerfile 参考 | [docs.docker.com/reference/dockerfile](https://docs.docker.com/reference/dockerfile/) |
