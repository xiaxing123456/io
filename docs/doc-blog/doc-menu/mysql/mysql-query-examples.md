# MySQL 查询示例

查询是 MySQL 日常开发中最常用的能力，重点掌握条件、排序、分页、聚合和多表关联。

## 条件查询

```sql
-- 查询年龄大于等于 18 的用户
SELECT * FROM user WHERE age >= 18;

-- 查询用户名以“张”开头的用户
-- LIKE 用于模糊匹配，'张%' 表示前面是张，后面可以是任意内容
SELECT * FROM user WHERE username LIKE '张%';

-- 查询状态为 1 且年龄大于等于 18 的用户
-- AND 表示两个条件必须同时满足
SELECT * FROM user WHERE status = 1 AND age >= 18;
```

## 排序和分页

```sql
-- 按创建时间倒序查询商品，最新创建的商品排在前面
SELECT * FROM product ORDER BY created_at DESC;

-- 先按价格升序排序；如果价格相同，再按 id 倒序排序
SELECT * FROM product ORDER BY price ASC, id DESC;

-- 查询前 10 条商品数据
-- LIMIT 控制返回条数，OFFSET 控制跳过条数
SELECT * FROM product LIMIT 10 OFFSET 0;
```

分页常见写法：

```sql
-- 查询第 3 页数据：每页 10 条，前两页共 20 条，所以 OFFSET 为 20
SELECT * FROM product ORDER BY id DESC LIMIT 10 OFFSET 20;
```

## 聚合查询

```sql
-- 统计商品总数
SELECT COUNT(*) FROM product;

-- 查询商品最高价、最低价和平均价
SELECT MAX(price), MIN(price), AVG(price) FROM product;

-- 按分类统计商品数量，每个 category_id 返回一行统计结果
SELECT category_id, COUNT(*) FROM product GROUP BY category_id;

-- 先按分类分组，再筛选商品数量大于 10 的分类
-- WHERE 用于分组前筛选，HAVING 用于分组后筛选
SELECT category_id, COUNT(*) FROM product GROUP BY category_id HAVING COUNT(*) > 10;
```

## 多表关联

```sql
-- 查询订单信息，并关联查询下单用户的用户名
SELECT
  -- o 是 orders 表的别名，下面字段来自订单表
  o.id,
  o.order_no,

  -- u 是 user 表的别名，username 来自用户表
  u.username
FROM orders o
-- LEFT JOIN 表示保留左表 orders 的所有数据
-- 如果某个订单找不到对应用户，用户字段会显示为 NULL
LEFT JOIN user u ON o.user_id = u.id;
```

常见关联方式：

| 语法 | 说明 |
| --- | --- |
| INNER JOIN | 两边都匹配才返回 |
| LEFT JOIN | 左表全部返回，右表无匹配时为 NULL |
| RIGHT JOIN | 右表全部返回，左表无匹配时为 NULL |

## 子查询

```sql
-- 查询某个父级分类下面所有子分类的商品
-- 子查询先查出 parent_id = 1 的分类 id
-- 外层查询再查询这些分类下的商品
SELECT * FROM product
WHERE category_id IN (
  SELECT id FROM category WHERE parent_id = 1
);
```

## 模糊查询

```sql
-- 查询名称中包含“手机”的商品
SELECT * FROM product WHERE name LIKE '%手机%';

-- 查询名称以“小米”开头的商品
SELECT * FROM product WHERE name LIKE '小米%';

-- 查询名称以“Pro”结尾的商品
SELECT * FROM product WHERE name LIKE '%Pro';
```

## 去重查询

```sql
-- 查询商品表中出现过的分类 id，重复的 category_id 只返回一次
SELECT DISTINCT category_id FROM product;
```
