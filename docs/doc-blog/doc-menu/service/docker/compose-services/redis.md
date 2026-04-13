# Docker Compose 集成 Redis

::: info 镜像地址

- [Docker Hub - Redis](https://hub.docker.com/_/redis)
  :::

---

## 一、单机版

```yaml
services:
    redis:
        image: redis:7.2.4
        container_name: my_redis
        restart: always
        ports:
            - '5379:6379'
        volumes:
            - ~/docker/redis7/data:/data
            - ~/docker/redis7/conf/redis.conf:/etc/redis/redis.conf
        command: redis-server /etc/redis/redis.conf
        networks:
            - app_net

networks:
    app_net:
        driver: bridge
```

::: tip 说明

- 宿主机端口映射为 `5379`，避免与本机 Redis 冲突
- 通过挂载 `redis.conf` 指定配置文件启动，方便自定义参数
- `data` 目录挂载持久化 RDB / AOF 数据，容器删除后数据不丢失
  :::

---

## 二、配置详解

| 配置项           | 说明                                     |
| ---------------- | ---------------------------------------- |
| `image`          | 指定 Redis 镜像版本，建议锁定具体版本号  |
| `container_name` | 自定义容器名，方便管理                   |
| `restart: always` | 容器异常退出或 Docker 重启后自动恢复    |
| `ports`          | 宿主机端口:容器端口                      |
| `volumes`        | 数据卷和配置文件挂载                     |
| `command`        | 指定配置文件启动 redis-server            |

---

## 三、挂载目录说明

启动前需要预先创建目录和配置文件：

```bash
mkdir -p ~/docker/redis7/data
mkdir -p ~/docker/redis7/conf
touch ~/docker/redis7/conf/redis.conf
```

```bash
~/docker/redis7/
├── data/            # RDB / AOF 持久化数据
└── conf/
    └── redis.conf   # Redis 配置文件
```

### 常用 redis.conf 配置

```conf
# 密码认证
requirepass your_password

# 开启 AOF 持久化
appendonly yes
appendfsync everysec

# 最大内存限制（根据服务器配置调整）
maxmemory 256mb
maxmemory-policy allkeys-lru

# 允许外部连接（容器场景需要）
bind 0.0.0.0

# 关闭保护模式（已设密码可关闭）
protected-mode no
```

修改配置后重启容器生效：

```bash
docker restart my_redis
```

---

## 四、常用操作

### 进入 Redis 命令行

```bash
# 无密码
docker exec -it my_redis redis-cli

# 有密码
docker exec -it my_redis redis-cli -a your_password
```

### 查看 Redis 信息

```bash
docker exec -it my_redis redis-cli INFO server
```

### 数据备份（手动触发 RDB 快照）

```bash
docker exec -it my_redis redis-cli BGSAVE
```

备份文件在宿主机 `~/docker/redis7/data/dump.rdb`。

### 查看容器内文件

```bash
# 查看容器内目录
docker exec my_redis ls /etc/redis/

# 查看容器内文件内容
docker exec my_redis cat /etc/redis/redis.conf
```

### 查看日志

```bash
docker logs -f my_redis
```
