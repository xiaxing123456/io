# 用 Portainer 安装 MySQL 并使用命令管理

本文介绍如何通过 Portainer 可视化界面部署 MySQL 容器，并结合常用命令对数据库进行日常管理。

::: info 参考资料
- [Docker 可视化工具——Portainer 全解](https://cloud.tencent.com/developer/article/1866869)
- [MySQL Docker Hub 官方镜像](https://hub.docker.com/_/mysql)
- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
:::

## 一、前置条件

- 已安装 Docker 并正常运行
- 已部署 Portainer，可通过 `https://服务器IP:9443` 访问
- 服务器安全组已开放 **3306 端口**（MySQL 默认端口）

验证 Docker 状态：

```bash
docker ps
# 看到 portainer 容器在运行即可
```

---

## 二、通过 Portainer 部署 MySQL

### 2.1 进入容器创建页面

登录 Portainer 后，点击左侧导航 **Containers** → 右上角 **+ Add container**。

![Portainer 容器列表页](https://docs.portainer.io/assets/images/containers.png)

::: tip 导航路径
**Home** → 点击本地环境 **local** → 左侧菜单 **Containers** → **Add container**
:::

---

### 2.2 填写基础配置

进入创建页面后，填写以下关键信息：

**① 容器名称（Name）**

```
mysql8
```

**② 镜像名称（Image）**

```
mysql:8.0
```

Portainer 会自动从 [Docker Hub](https://hub.docker.com/_/mysql) 拉取镜像，可在 Tags 标签页查看所有可用版本：

| 镜像标签 | 说明 |
|---------|------|
| `mysql:8.0` | MySQL 8.0 稳定版（推荐） |
| `mysql:5.7` | MySQL 5.7 长期支持版 |
| `mysql:latest` | 最新版本（不推荐生产） |

::: tip 国内服务器拉取慢
若拉取超时，在镜像名前加国内镜像源前缀：
```
docker.m.daocloud.io/mysql:8.0
```
:::

---

### 2.3 配置端口映射

在 **Network ports configuration** 区域，点击 **publish a new network port** 添加映射：

| 宿主机端口 | 容器端口 | 协议 |
|-----------|---------|------|
| `3306` | `3306` | TCP |

::: warning 安全建议
生产环境建议将宿主机端口改为非默认值（如 `13306`），降低被扫描风险：

```
13306 → 3306
```

同时在安全组只开放特定 IP 段的访问。
:::

---

### 2.4 设置环境变量（重要）

点击 **Env** 选项卡 → **Add environment variable**，添加以下变量：

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `MYSQL_ROOT_PASSWORD` | `MyPassword123!` | **必填** root 密码 |
| `MYSQL_DATABASE` | `mydb` | 可选，自动创建数据库 |
| `MYSQL_USER` | `appuser` | 可选，创建普通用户 |
| `MYSQL_USER_PASSWORD` | `UserPass456!` | 可选，普通用户密码 |

::: danger 密码要求
- 长度至少 8 位
- 包含大小写字母、数字
- 避免使用 `@` `#` `$` 等特殊字符（连接字符串中需转义）
:::

更多可选环境变量参考：[MySQL 镜像官方说明](https://hub.docker.com/_/mysql#environment-variables)

---

### 2.5 挂载数据卷（持久化数据）

点击 **Volumes** → **Map additional volume**，配置数据持久化：

| 容器路径 | 宿主机路径 / 卷名 | 类型 |
|---------|-----------------|------|
| `/var/lib/mysql` | `mysql_data` | Volume |
| `/etc/mysql/conf.d` | `/data/mysql/conf` | Bind（可选，自定义配置） |

::: tip 为什么要挂载数据卷？
不挂载数据卷，容器删除后数据库数据会**永久丢失**。挂载后数据存储在宿主机，容器重建后数据依然保留。
:::

---

### 2.6 设置重启策略

在 **Restart policy** 下拉框选择：

```
Always
```

这样服务器重启后 MySQL 容器会自动启动。

---

### 2.7 部署容器

确认以上配置无误后，点击页面底部的 **Deploy the container** 按钮。

Portainer 会自动：
1. 从 Docker Hub（或镜像源）拉取 `mysql:8.0` 镜像
2. 创建并启动容器
3. 跳转回容器列表

容器状态变为绿色 **running** 表示启动成功。

::: info 首次启动较慢
MySQL 首次启动需要初始化数据目录，约需 10-30 秒，期间状态可能短暂显示 `starting`，属正常现象。
:::

---

## 三、验证 MySQL 是否正常运行

### 3.1 查看容器状态

在容器列表找到 `mysql8` 容器，查看：
- 状态：`running`（绿点）
- 端口：`0.0.0.0:3306->3306/tcp`

### 3.2 查看启动日志

点击容器行末的 **日志图标**（📋）或进入容器详情 → **Logs** 选项卡：

正常启动日志末尾会出现：

```
[System] [MY-010931] [Server] /usr/sbin/mysqld: ready for connections.
```

看到 `ready for connections` 即表示 MySQL 已就绪。

---

## 四、通过 Portainer Web 控制台管理 MySQL

Portainer 提供浏览器内终端，无需 SSH 即可直接操作容器内的 MySQL。

### 4.1 打开容器控制台

在容器列表，点击 `mysql8` 行末的 **>_ 控制台图标**，或进入容器详情 → **Console** 选项卡 → 点击 **Connect**。

::: tip
Shell 选择 `bash`，点击 **Connect** 进入容器终端。
:::

### 4.2 登录 MySQL

在控制台输入：

```bash
mysql -uroot -p
```

输入密码后进入 MySQL 命令行，提示符变为 `mysql>`。

或者一行命令直接登录（密码跟在 `-p` 后面，注意无空格）：

```bash
mysql -uroot -pMyPassword123!
```

---

## 五、常用 MySQL 管理命令

进入 `mysql>` 命令行后，以下是最常用的管理命令：

### 5.1 数据库管理

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 创建数据库
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 选择数据库
USE mydb;

-- 查看当前使用的数据库
SELECT DATABASE();

-- 删除数据库（谨慎！）
DROP DATABASE mydb;
```

### 5.2 数据表管理

```sql
-- 查看当前库的所有表
SHOW TABLES;

-- 查看表结构
DESC user;

-- 创建表示例
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 删除表
DROP TABLE user;
```

### 5.3 用户管理

```sql
-- 查看所有用户
SELECT user, host FROM mysql.user;

-- 创建新用户（允许所有 IP 连接）
CREATE USER 'appuser'@'%' IDENTIFIED BY 'UserPass456!';

-- 授予指定数据库所有权限
GRANT ALL PRIVILEGES ON mydb.* TO 'appuser'@'%';

-- 授予只读权限
GRANT SELECT ON mydb.* TO 'appuser'@'%';

-- 刷新权限（修改后必须执行）
FLUSH PRIVILEGES;

-- 撤销权限
REVOKE ALL PRIVILEGES ON mydb.* FROM 'appuser'@'%';

-- 删除用户
DROP USER 'appuser'@'%';

-- 修改密码
ALTER USER 'appuser'@'%' IDENTIFIED BY 'NewPassword789!';
```

### 5.4 数据查询与操作

```sql
-- 查询
SELECT * FROM user WHERE id = 1;
SELECT * FROM user ORDER BY created_at DESC LIMIT 10;

-- 插入
INSERT INTO user (name, email) VALUES ('张三', 'zhangsan@example.com');

-- 更新
UPDATE user SET name = '李四' WHERE id = 1;

-- 删除
DELETE FROM user WHERE id = 1;
```

### 5.5 查看 MySQL 运行状态

```sql
-- 查看 MySQL 版本
SELECT VERSION();

-- 查看当前连接数
SHOW STATUS LIKE 'Threads_connected';

-- 查看最大连接数配置
SHOW VARIABLES LIKE 'max_connections';

-- 查看慢查询状态
SHOW VARIABLES LIKE 'slow_query%';

-- 查看正在执行的查询
SHOW PROCESSLIST;

-- 退出 MySQL 命令行
EXIT;
```

---

## 六、通过 Docker 命令管理 MySQL 容器

除了 Portainer 界面，还可以直接用 Docker 命令管理：

### 6.1 容器操作

```bash
# 查看 MySQL 容器状态
docker ps | grep mysql8

# 停止 MySQL
docker stop mysql8

# 启动 MySQL
docker start mysql8

# 重启 MySQL
docker restart mysql8

# 查看实时日志
docker logs -f mysql8

# 查看最近 50 行日志
docker logs --tail 50 mysql8
```

### 6.2 从宿主机直接进入 MySQL

```bash
# 进入容器 bash
docker exec -it mysql8 bash

# 或直接执行 MySQL 登录（一步到位）
docker exec -it mysql8 mysql -uroot -pMyPassword123!
```

### 6.3 数据库备份与恢复

```bash
# 备份单个数据库
docker exec mysql8 mysqldump -uroot -pMyPassword123! mydb > mydb_backup.sql

# 备份所有数据库
docker exec mysql8 mysqldump -uroot -pMyPassword123! --all-databases > all_backup.sql

# 恢复数据库
docker exec -i mysql8 mysql -uroot -pMyPassword123! mydb < mydb_backup.sql

# 备份并压缩
docker exec mysql8 mysqldump -uroot -pMyPassword123! mydb | gzip > mydb_$(date +%Y%m%d).sql.gz

# 解压并恢复
gunzip < mydb_20260314.sql.gz | docker exec -i mysql8 mysql -uroot -pMyPassword123! mydb
```

::: tip 定期自动备份
可以用 crontab 设置每天凌晨自动备份：

```bash
# 编辑定时任务
crontab -e

# 每天凌晨 2 点备份
0 2 * * * docker exec mysql8 mysqldump -uroot -pMyPassword123! --all-databases | gzip > /data/backup/mysql_$(date +\%Y\%m\%d).sql.gz
```
:::

---

## 七、允许外部工具远程连接 MySQL

### 7.1 确认端口已开放

1. 服务器安全组已开放 `3306` 端口
2. 防火墙已放行：

```bash
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

### 7.2 确认用户允许远程连接

MySQL 8.0 默认的 `root` 用户不允许远程连接，需要单独创建允许远程访问的用户：

```sql
-- 登录 MySQL 后执行
CREATE USER 'remoteuser'@'%' IDENTIFIED BY 'RemotePass123!';
GRANT ALL PRIVILEGES ON *.* TO 'remoteuser'@'%';
FLUSH PRIVILEGES;
```

### 7.3 使用 Navicat / DBeaver 连接

| 配置项 | 值 |
|--------|-----|
| 主机 | 服务器公网 IP |
| 端口 | `3306` |
| 用户名 | `remoteuser` |
| 密码 | `RemotePass123!` |

::: warning MySQL 8.0 认证插件问题
若连接时报错 `Authentication plugin 'caching_sha2_password' cannot be loaded`，执行以下命令切换认证方式：

```sql
ALTER USER 'remoteuser'@'%' IDENTIFIED WITH mysql_native_password BY 'RemotePass123!';
FLUSH PRIVILEGES;
```

或在创建容器时添加环境变量：`MYSQL_AUTHENTICATION_PLUGIN=mysql_native_password`
:::

---

## 八、常见问题

### Q: 容器启动后状态变为 stopped？

查看日志排查原因：

```bash
docker logs mysql8
```

最常见原因：**未设置 `MYSQL_ROOT_PASSWORD` 环境变量**。MySQL 必须要设置 root 密码才能启动。

### Q: 数据卷挂载后数据库初始化失败？

如果 `/var/lib/mysql` 挂载的目录已有旧数据（版本不同），会导致启动失败。清空后重试：

```bash
docker stop mysql8
docker rm mysql8
docker volume rm mysql_data
# 重新创建容器
```

### Q: 忘记 root 密码？

在 Portainer 容器详情页修改环境变量，添加 `MYSQL_ROOT_PASSWORD=新密码` 后重启容器即可重置。

或通过命令行：

```bash
docker stop mysql8

# 以跳过权限验证方式启动
docker run --rm -it \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0 \
  mysqld --skip-grant-tables &

# 登录并重置密码
docker exec -it <容器ID> mysql -uroot
```

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
EXIT;
```

---

## 九、参考文档

| 文档 | 链接 |
|------|------|
| MySQL Docker Hub 官方镜像 | [hub.docker.com/_/mysql](https://hub.docker.com/_/mysql) |
| MySQL 8.0 官方文档 | [dev.mysql.com/doc/refman/8.0/en](https://dev.mysql.com/doc/refman/8.0/en/) |
| MySQL 用户管理 | [dev.mysql.com/.../user-account-management](https://dev.mysql.com/doc/refman/8.0/en/user-account-management.html) |
| mysqldump 备份文档 | [dev.mysql.com/.../mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) |
| Portainer 容器管理文档 | [docs.portainer.io/user/docker/containers](https://docs.portainer.io/user/docker/containers) |
| Docker 可视化工具——Portainer 全解 | [cloud.tencent.com/developer/article/1866869](https://cloud.tencent.com/developer/article/1866869) |
