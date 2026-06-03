# MySQL 基础语法

SQL 可以分为数据定义、数据操作、数据查询和数据控制几类。日常开发最常用的是建表、增删改查和条件查询。

## 数据库操作

```sql
-- 创建 demo 数据库，并设置默认字符集为 utf8mb4
CREATE DATABASE demo DEFAULT CHARACTER SET utf8mb4;

-- 删除 demo 数据库；这个操作会删除库里的所有表和数据，需要谨慎执行
DROP DATABASE demo;

-- 切换当前使用的数据库为 demo
USE demo;

-- 查看当前 MySQL 实例下的所有数据库
SHOW DATABASES;
```

## 表操作

```sql
-- 创建 user 表
CREATE TABLE user (
  -- BIGINT 适合做业务主键；PRIMARY KEY 表示主键；AUTO_INCREMENT 表示自增
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- VARCHAR(50) 表示最长 50 个字符；NOT NULL 表示必须填写
  username VARCHAR(50) NOT NULL,

  -- password 用来存储密码；实际项目中应存加密后的密码，不要存明文
  password VARCHAR(100) NOT NULL,

  -- INT 表示整数；这里用于保存年龄
  age INT,

  -- 创建时间默认使用当前时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 给 user 表新增 email 字段
ALTER TABLE user ADD COLUMN email VARCHAR(100);

-- 修改 username 字段长度为 80，并继续保持不能为空
ALTER TABLE user MODIFY COLUMN username VARCHAR(80) NOT NULL;

-- 删除 email 字段，字段中的数据也会一起丢失
ALTER TABLE user DROP COLUMN email;

-- 删除 user 表；表结构和表数据都会被删除
DROP TABLE user;
```

## 新增数据

```sql
-- 插入一条用户数据
-- 字段列表和值列表要一一对应：username 对应 '张三'，password 对应 '123456'，age 对应 18
INSERT INTO user (username, password, age)
VALUES ('张三', '123456', 18);

-- 一次插入多条用户数据，可以减少 SQL 执行次数
INSERT INTO user (username, password, age)
VALUES
  ('李四', '123456', 20),
  ('王五', '123456', 22);
```

## 查询数据

```sql
-- 查询 user 表所有字段；开发调试可以用，生产查询更推荐写明确字段
SELECT * FROM user;

-- 只查询 id、username、age 三个字段
SELECT id, username, age FROM user;

-- 查询年龄大于等于 18 的用户
SELECT * FROM user WHERE age >= 18;

-- 查询用户名中包含“张”的用户；% 表示任意长度的任意字符
SELECT * FROM user WHERE username LIKE '%张%';

-- 按创建时间倒序查询，最新创建的数据排在前面
SELECT * FROM user ORDER BY created_at DESC;

-- 分页查询：LIMIT 10 表示取 10 条，OFFSET 0 表示从第 0 条之后开始取
SELECT * FROM user LIMIT 10 OFFSET 0;
```

## 修改数据

```sql
-- 修改 id 为 1 的用户年龄
UPDATE user SET age = 19 WHERE id = 1;

-- 同时修改多个字段，字段之间使用逗号分隔
UPDATE user SET username = '张三丰', age = 20 WHERE id = 1;
```

更新数据时一定要带上合适的 `WHERE` 条件，否则会更新整张表。

## 删除数据

```sql
-- 删除 id 为 1 的用户数据
DELETE FROM user WHERE id = 1;

-- 清空 user 表中的所有数据，并重置自增值
TRUNCATE TABLE user;
```

`DELETE` 可以按条件删除，`TRUNCATE` 会清空整张表。

## 条件语法

```sql
-- BETWEEN 表示范围查询，包含 18 和 30
SELECT * FROM user WHERE age BETWEEN 18 AND 30;

-- IN 表示匹配多个固定值中的任意一个
SELECT * FROM user WHERE age IN (18, 20, 22);

-- 判断字段是否为空，不能使用 age = NULL
SELECT * FROM user WHERE age IS NULL;

-- 判断字段不为空
SELECT * FROM user WHERE age IS NOT NULL;

-- AND 表示多个条件必须同时满足
SELECT * FROM user WHERE username = '张三' AND age = 18;

-- OR 表示满足任意一个条件即可
SELECT * FROM user WHERE username = '张三' OR age = 18;
```
