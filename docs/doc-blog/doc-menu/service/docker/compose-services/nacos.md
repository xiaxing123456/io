# Docker Compose 集成 Nacos

::: info 镜像地址

- [Docker Hub - Nacos](https://hub.docker.com/r/nacos/nacos-server)
  :::

---

## 一、原始命令写法

你当前使用的是下面两句命令：

```bash
docker pull nacos/nacos-server:v2.3.1
```

```bash
docker run --name my_nacos \
-e MODE=standalone \
-p 8848:8848 \
-p 9848:9848 \
-p 9849:9849 \
-p 7848:7848 \
-d nacos/nacos-server:v2.3.1
```

---

## 二、Compose 写法

把上面的 `docker run` 改成 `docker compose` 后，可以写成下面这样：

```yaml
services:
    nacos:
        image: nacos/nacos-server:v2.3.1
        container_name: my_nacos
        restart: always
        environment:
            MODE: standalone
        ports:
            - '8848:8848'
            - '9848:9848'
            - '9849:9849'
            - '7848:7848'
        networks:
            - app_net

networks:
    app_net:
        driver: bridge
```

::: tip 说明

- `MODE=standalone` 表示单机模式，适合本地开发和测试
- `8848` 是 Nacos 控制台默认端口
- `9848`、`9849`、`7848` 是 Nacos 2.x 通信相关端口，建议一并映射
- `restart: always` 表示容器异常退出后自动拉起
  :::

---

## 三、配置详解

| 配置项 | 说明 |
| ------ | ---- |
| `image` | 指定 Nacos 镜像和版本号 |
| `container_name` | 自定义容器名称 |
| `restart: always` | Docker 重启后自动恢复容器 |
| `environment` | 设置环境变量，这里指定单机模式 |
| `ports` | 宿主机端口映射到容器端口 |
| `networks` | 指定容器加入的网络 |

---

## 四、启动方式

在 `docker-compose.yml` 所在目录执行：

```bash
docker compose up -d
```

如果只想启动 Nacos：

```bash
docker compose up -d nacos
```

重启容器：

```bash
docker restart my_nacos
```

停止并删除容器：

```bash
docker compose down
```

---

## 五、常用操作

### 查看日志

```bash
docker logs -f my_nacos
```

### 查看容器状态

```bash
docker ps
```

### 进入容器

```bash
docker exec -it my_nacos /bin/bash
```

如果镜像里没有 `bash`，可以改用：

```bash
docker exec -it my_nacos /bin/sh
```

### 查看容器内目录

```bash
docker exec my_nacos ls /home/nacos
```

### 查看当前所处目录

```bash
docker exec my_nacos pwd
```

---

## 六、访问地址

启动成功后，可通过下面地址访问：

- 控制台地址：`http://服务器IP:8848/nacos`
- 默认账号密码：`nacos / nacos`

::: warning 注意

- 首次启动可能需要等待几十秒，建议先查看日志确认是否启动完成
- 如果服务器开启了防火墙，需要放行 `8848`、`9848`、`9849`、`7848` 端口
  :::
