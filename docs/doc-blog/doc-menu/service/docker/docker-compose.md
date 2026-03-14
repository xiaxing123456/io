# Docker Compose 集成管理命令

Docker Compose 是 Docker 官方的多容器编排工具，通过一个 `docker-compose.yml` 文件定义和管理多个容器服务，一条命令即可启动整套应用环境。

::: info 官方文档
- [Docker Compose 概述](https://docs.docker.com/compose/)
- [Compose 文件规范](https://docs.docker.com/compose/compose-file/)
- [Docker Compose CLI 参考](https://docs.docker.com/reference/cli/docker/compose/)
:::

---

## 一、Compose 与单独运行容器的区别

| 对比项 | `docker run` | `docker compose` |
|--------|-------------|-----------------|
| 管理容器数量 | 一次一个 | 多个服务统一管理 |
| 配置方式 | 命令行参数 | YAML 文件 |
| 启动方式 | 手动逐个启动 | 一条命令启动全部 |
| 网络 | 需手动创建 | 自动创建共享网络 |
| 适合场景 | 临时测试 | 开发 / 生产环境 |

---

## 二、docker-compose.yml 文件结构

```yaml
# 服务定义
services:

  # 服务名（自定义）
  db:
    image: mysql:8.0                    # 镜像
    container_name: my_mysql            # 容器名（可选）
    restart: always                     # 重启策略
    environment:                        # 环境变量
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: mydb
    ports:                              # 端口映射 宿主机:容器
      - "3306:3306"
    volumes:                            # 数据卷挂载
      - mysql_data:/var/lib/mysql
    networks:                           # 加入网络
      - app_net

  web:
    image: nginx:latest
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    depends_on:                         # 依赖 db 先启动
      - db
    networks:
      - app_net

# 数据卷定义
volumes:
  mysql_data:

# 网络定义
networks:
  app_net:
    driver: bridge
```

---

## 三、常用命令速查

### 3.1 启动与停止

```bash
# 启动所有服务（后台运行）
docker compose up -d

# 启动并强制重新构建镜像
docker compose up -d --build

# 启动指定服务
docker compose up -d db

# 停止所有服务（保留容器和数据卷）
docker compose stop

# 停止并删除容器、网络（数据卷保留）
docker compose down

# 停止并删除容器、网络、数据卷（危险！）
docker compose down -v

# 停止并删除容器、网络、镜像
docker compose down --rmi all
```

::: warning
`docker compose down -v` 会删除数据卷，数据库数据将**永久丢失**，生产环境慎用。
:::

### 3.2 查看状态

```bash
# 查看所有服务状态
docker compose ps

# 查看所有服务（包括停止的）
docker compose ps -a

# 查看服务资源占用（CPU / 内存）
docker compose top
```

### 3.3 日志

```bash
# 查看所有服务日志
docker compose logs

# 实时追踪日志
docker compose logs -f

# 查看指定服务日志
docker compose logs -f db

# 查看最近 100 行
docker compose logs --tail 100

# 显示时间戳
docker compose logs -t
```

### 3.4 进入容器

```bash
# 进入指定服务容器
docker compose exec db bash

# 进入并执行单条命令
docker compose exec db mysql -uroot -pexample

# 使用 sh（适合无 bash 的镜像）
docker compose exec web sh
```

### 3.5 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启指定服务
docker compose restart db
```

### 3.6 镜像管理

```bash
# 拉取所有服务的最新镜像
docker compose pull

# 拉取指定服务镜像
docker compose pull db

# 构建自定义镜像（需要 build 配置）
docker compose build

# 构建指定服务镜像
docker compose build web
```

### 3.7 扩缩容

```bash
# 将 web 服务扩展到 3 个实例
docker compose up -d --scale web=3

# 缩减回 1 个
docker compose up -d --scale web=1
```

---

## 四、常用实战配置示例

### 4.1 MySQL + phpMyAdmin

```yaml
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: mydb
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

  phpmyadmin:
    image: phpmyadmin:latest
    restart: always
    ports:
      - "8080:80"
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
    depends_on:
      - db

volumes:
  mysql_data:
```

访问 `http://服务器IP:8080`，用 `root / example` 登录。

---

### 4.2 Nginx + Node.js 应用

```yaml
services:
  app:
    build: .                          # 从当前目录 Dockerfile 构建
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: db
    depends_on:
      - db

  nginx:
    image: nginx:latest
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: appdb
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

---

### 4.3 MySQL + Redis 缓存组合

```yaml
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass redispass
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

---

## 五、环境变量管理

### 5.1 使用 .env 文件

在 `docker-compose.yml` 同级目录创建 `.env` 文件：

```bash
# .env
MYSQL_ROOT_PASSWORD=MySecretPass123
MYSQL_DATABASE=mydb
MYSQL_PORT=3306
```

在 `docker-compose.yml` 中引用：

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    ports:
      - "${MYSQL_PORT}:3306"
```

::: tip
`.env` 文件应加入 `.gitignore`，避免密码泄露到代码仓库。
:::

### 5.2 指定 env 文件

```bash
# 使用指定的环境变量文件
docker compose --env-file .env.production up -d
```

---

## 六、多环境配置

通过多个 compose 文件区分开发和生产环境：

```bash
# 基础配置
docker-compose.yml

# 开发环境追加配置
docker-compose.dev.yml

# 生产环境追加配置
docker-compose.prod.yml
```

**开发环境启动：**

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**生产环境启动：**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 七、健康检查配置

确保依赖服务真正就绪后再启动：

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: example
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-pexample"]
      interval: 10s      # 每 10 秒检查一次
      timeout: 5s        # 超时时间
      retries: 5         # 失败重试 5 次
      start_period: 30s  # 容器启动后 30 秒开始检查

  app:
    image: myapp:latest
    depends_on:
      db:
        condition: service_healthy   # 等待 db healthy 才启动
```

---

## 八、指定 compose 文件

默认查找当前目录的 `docker-compose.yml` 或 `compose.yml`，也可手动指定：

```bash
# 指定文件
docker compose -f /path/to/docker-compose.yml up -d

# 指定项目名（影响容器、网络名称前缀）
docker compose -p myproject up -d
```

---

## 九、完整命令速查表

| 命令 | 说明 |
|------|------|
| `docker compose up -d` | 后台启动所有服务 |
| `docker compose up -d --build` | 重新构建后启动 |
| `docker compose down` | 停止并删除容器 |
| `docker compose down -v` | 同上，并删除数据卷 |
| `docker compose stop` | 停止服务（不删除容器） |
| `docker compose start` | 启动已停止的服务 |
| `docker compose restart` | 重启所有服务 |
| `docker compose restart <服务名>` | 重启指定服务 |
| `docker compose ps` | 查看服务状态 |
| `docker compose logs -f` | 实时查看日志 |
| `docker compose logs -f <服务名>` | 查看指定服务日志 |
| `docker compose exec <服务名> bash` | 进入指定容器 |
| `docker compose pull` | 拉取最新镜像 |
| `docker compose build` | 构建镜像 |
| `docker compose top` | 查看资源占用 |
| `docker compose config` | 验证并查看最终配置 |

---

## 十、参考文档

| 文档 | 链接 |
|------|------|
| Docker Compose 概述 | [docs.docker.com/compose](https://docs.docker.com/compose/) |
| Compose 文件规范 | [docs.docker.com/compose/compose-file](https://docs.docker.com/compose/compose-file/) |
| Compose CLI 完整参考 | [docs.docker.com/reference/cli/docker/compose](https://docs.docker.com/reference/cli/docker/compose/) |
| Compose 健康检查 | [docs.docker.com/compose/compose-file/05-services/#healthcheck](https://docs.docker.com/compose/compose-file/05-services/#healthcheck) |
| Docker Hub MySQL 镜像 | [hub.docker.com/_/mysql](https://hub.docker.com/_/mysql) |
