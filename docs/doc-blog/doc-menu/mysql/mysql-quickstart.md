# MySQL 快速入门

MySQL 是常用的关系型数据库，适合存储结构化数据。数据以库、表、行、列的形式组织，通过 SQL 进行增删改查。

## 安装与连接

安装完成后，可以通过命令行连接 MySQL：

```bash
# 使用 root 用户连接本机 MySQL，执行后会提示输入密码
mysql -u root -p
```

常用连接参数：

```bash
# -h 指定数据库服务器地址
# -P 指定数据库端口，MySQL 默认端口是 3306
# -u 指定登录用户名
# -p 表示使用密码登录，密码一般不要直接写在命令里
mysql -h 127.0.0.1 -P 3306 -u root -p
```

- `-h`：数据库地址
- `-P`：端口，MySQL 默认端口是 `3306`
- `-u`：用户名
- `-p`：输入密码

## 基础操作流程

```sql
-- 创建名为 demo 的数据库，并指定默认字符集为 utf8mb4
-- utf8mb4 比 utf8 支持范围更完整，推荐新项目默认使用
CREATE DATABASE demo DEFAULT CHARACTER SET utf8mb4;

-- 切换到 demo 数据库，后续建表和查询都会在这个数据库中执行
USE demo;

-- 创建 user 表，用来保存用户信息
CREATE TABLE user (
  -- id 是主键，每条数据都有唯一 id；AUTO_INCREMENT 表示自动递增
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- username 是用户名，最长 50 个字符；NOT NULL 表示不能为空
  username VARCHAR(50) NOT NULL,

  -- age 是年龄，INT 表示整数类型；没有写 NOT NULL，说明可以为空
  age INT,

  -- created_at 是创建时间；默认值为当前时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 向 user 表插入一条数据，只给 username 和 age 赋值
-- id 会自动递增，created_at 会自动使用当前时间
INSERT INTO user (username, age) VALUES ('张三', 18);

-- 查询 user 表中的所有字段和所有数据
SELECT * FROM user;
```

## 常用命令

```sql
-- 查看当前 MySQL 中有哪些数据库
SHOW DATABASES;

-- 查看当前数据库中有哪些表，执行前通常需要先 USE 某个数据库
SHOW TABLES;

-- 查看 user 表结构，包括字段名、类型、是否允许为空、主键等信息
DESC user;

-- 查看当前正在使用哪个数据库
SELECT DATABASE();
```

## 字符集建议

新项目建议使用 `utf8mb4`，它支持完整 Unicode 字符，包括 emoji 和更多中文扩展字符。

```sql
-- 创建数据库时同时指定字符集和排序规则
-- CHARACTER SET 决定可以存哪些字符
-- COLLATE 决定字符串比较和排序规则
CREATE DATABASE demo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

## 常见对象

| 对象 | 说明 |
| --- | --- |
| Database | 数据库，用来组织表 |
| Table | 表，用来存储同一类数据 |
| Row | 行，一条具体记录 |
| Column | 列，一个字段 |
| Index | 索引，用来提升查询效率 |
| Primary Key | 主键，唯一标识一行数据 |
