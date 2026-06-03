# MySQL 数据类型

设计表结构时，需要根据数据含义选择合适的数据类型。类型越准确，存储和查询越稳定。

## 数值类型

| 类型 | 说明 |
| --- | --- |
| TINYINT | 小整数，常用于状态值 |
| INT | 普通整数 |
| BIGINT | 大整数，常用于主键 ID |
| DECIMAL | 精确小数，适合金额 |
| FLOAT / DOUBLE | 浮点数，适合非精确计算 |

金额建议使用 `DECIMAL`，不要使用 `FLOAT` 或 `DOUBLE`。

```sql
-- price 表示商品价格
-- DECIMAL(10, 2) 表示总共最多 10 位数字，其中小数部分 2 位
-- 例如最大可以保存 99999999.99
price DECIMAL(10, 2)
```

## 字符串类型

| 类型 | 说明 |
| --- | --- |
| CHAR | 定长字符串 |
| VARCHAR | 变长字符串，最常用 |
| TEXT | 长文本 |
| JSON | JSON 数据 |

```sql
-- username 使用 VARCHAR，因为用户名长度不固定
-- VARCHAR(50) 表示最多 50 个字符；NOT NULL 表示不能为空
username VARCHAR(50) NOT NULL

-- content 使用 TEXT，适合保存文章正文、备注等较长文本
content TEXT

-- extra 使用 JSON，适合保存扩展配置、非固定结构数据
extra JSON
```

## 日期时间类型

| 类型 | 说明 |
| --- | --- |
| DATE | 日期，格式为 `YYYY-MM-DD` |
| TIME | 时间，格式为 `HH:mm:ss` |
| DATETIME | 日期时间 |
| TIMESTAMP | 时间戳，受时区影响 |

```sql
-- created_at 表示创建时间，插入数据时默认使用当前时间
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

-- updated_at 表示更新时间，插入时默认当前时间，更新数据时自动刷新为当前时间
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## 常用字段设计

```sql
-- 商品表结构示例
CREATE TABLE product (
  -- 商品 ID，使用 BIGINT 自增主键
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- 商品名称，最多 100 个字符，不能为空
  name VARCHAR(100) NOT NULL,

  -- 商品价格，最多 10 位数字，小数保留 2 位，不能为空
  price DECIMAL(10, 2) NOT NULL,

  -- 商品状态，1 可以表示上架，0 可以表示下架
  status TINYINT NOT NULL DEFAULT 1,

  -- 创建时间，新增数据时自动生成
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- 更新时间，新增和修改数据时自动维护
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 选择建议

- 主键 ID：`BIGINT`
- 状态值：`TINYINT`
- 名称标题：`VARCHAR`
- 正文内容：`TEXT`
- 金额：`DECIMAL`
- 创建时间：`DATETIME`
