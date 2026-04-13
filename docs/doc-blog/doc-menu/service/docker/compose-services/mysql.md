# Docker Compose 集成 MySQL

::: info 镜像地址

- [Docker Hub - MySQL](https://hub.docker.com/_/mysql)
  :::

---

## 一、单机版

```yaml
services:
    db:
        image: mysql:8.3.0
        container_name: my_mysql
        restart: always
        environment:
            MYSQL_ROOT_PASSWORD: your_password
            MYSQL_DATABASE: mydb
        ports:
            - '4406:3306'
        volumes:
            - ~/docker/mysql8.3.0/log:/var/log/mysql
            - ~/docker/mysql8.3.0/data:/var/lib/mysql
            - ~/docker/mysql8.3.0/conf:/etc/mysql/conf.d
            - ~/docker/mysql8.3.0/mysql-files:/var/lib/mysql-files
        command:
            - --character-set-server=utf8mb4
            - --collation-server=utf8mb4_unicode_ci
        networks:
            - app_net

networks:
    app_net:
        driver: bridge
```

::: tip 说明

- 宿主机端口映射为 `4406`，避免与本机 MySQL 冲突
- `command` 设置默认字符集为 `utf8mb4`，支持 emoji 等特殊字符
- 数据目录挂载到宿主机，容器删除后数据不丢失
  :::

---

## 二、配置详解

| 配置项                | 说明                                    |
| --------------------- | --------------------------------------- |
| `image`               | 指定 MySQL 镜像版本，建议锁定具体版本号 |
| `container_name`      | 自定义容器名，方便管理                  |
| `restart: always`     | 容器异常退出或 Docker 重启后自动恢复    |
| `MYSQL_ROOT_PASSWORD` | root 用户密码（**必填**）               |
| `MYSQL_DATABASE`      | 容器启动时自动创建的数据库（可选）      |
| `ports`               | 宿主机端口:容器端口                     |
| `volumes`             | 数据卷挂载，持久化数据、日志和配置      |

### 常用环境变量

| 变量                         | 说明                 |
| ---------------------------- | -------------------- |
| `MYSQL_ROOT_PASSWORD`        | root 密码（必填）    |
| `MYSQL_DATABASE`             | 初始化数据库名       |
| `MYSQL_USER`                 | 创建普通用户         |
| `MYSQL_PASSWORD`             | 普通用户密码         |
| `MYSQL_ALLOW_EMPTY_PASSWORD` | 允许空密码（不推荐） |

---

## 三、挂载目录说明

```bash
~/docker/mysql8.3.0/
├── log/          # MySQL 日志
├── data/         # 数据库文件（核心数据）
├── conf/         # 自定义配置文件（*.cnf）
└── mysql-files/  # MySQL 安全文件导入导出目录
```

### 自定义配置示例

在 `~/docker/mysql8.3.0/conf/` 下创建 `my.cnf`：

```ini
[mysqld]
max_connections=200
innodb_buffer_pool_size=256M
slow_query_log=1
slow_query_log_file=/var/log/mysql/slow.log
long_query_time=2
```

修改配置后重启容器生效：

```bash
docker restart my_mysql
```

## 四、常用操作

### 进入 MySQL 命令行

```bash
docker exec -it my_mysql mysql -uroot -p
```

### 导入 SQL 文件

```bash
docker exec -i my_mysql mysql -uroot -pyour_password mydb < backup.sql
```

### 导出数据库备份

```bash
docker exec my_mysql mysqldump -uroot -pyour_password mydb > backup.sql
```

### 查看 MySQL 日志

```bash
docker logs -f my_mysql
```
