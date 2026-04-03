# SpringBoot3 数据访问

## 整合SSM场景

SpringBoot 整合 Spring、SpringMVC、MyBatis 进行数据访问场景开发。

### 1. 创建SSM整合项目

```xml
<!-- https://mvnrepository.com/artifact/org.mybatis.spring.boot/mybatis-spring-boot-starter -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.1</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 2. 配置数据源

```properties
spring.datasource.url=jdbc:mysql://192.168.200.100:3306/demo
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.type=com.zaxxer.hikari.HikariDataSource
```

::: tip
安装 **MyBatisX** 插件，帮我们生成 Mapper 接口的 xml 文件即可。
:::

### 3. 配置MyBatis

```properties
# 指定mapper映射文件位置
mybatis.mapper-locations=classpath:/mapper/*.xml
# 参数项调整
mybatis.configuration.map-underscore-to-camel-case=true
```

### 4. CRUD编写

- 编写 Bean
- 编写 Mapper
- 使用 **mybatisx** 插件，快速生成 MapperXML
- 测试 CRUD

### 5. 自动配置原理

**SSM整合总结：**

1. 导入 `mybatis-spring-boot-starter`
2. 配置数据源信息
3. 配置 mybatis 的 mapper 接口扫描与 xml 映射文件扫描
4. 编写 bean，mapper，生成 xml，编写 sql 进行 CRUD。事务等操作依然和 Spring 中用法一样
5. 效果：
   - 所有 sql 写在 xml 中
   - 所有 mybatis 配置写在 `application.properties` 下面

#### jdbc 场景的自动配置

- `mybatis-spring-boot-starter` 导入 `spring-boot-starter-jdbc`，jdbc 是操作数据库的场景
- Jdbc 场景的几个自动配置：
  - `org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration`
    - 数据源的自动配置
    - 所有和数据源有关的配置都绑定在 `DataSourceProperties`
    - 默认使用 `HikariDataSource`
  - `org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration`
    - 给容器中放了 `JdbcTemplate` 操作数据库
  - `org.springframework.boot.autoconfigure.jdbc.JndiDataSourceAutoConfiguration`
  - `org.springframework.boot.autoconfigure.jdbc.XADataSourceAutoConfiguration`
    - 基于 XA 二阶提交协议的分布式事务数据源
  - `org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration`
    - 支持事务
- 具有的底层能力：**数据源**、**JdbcTemplate**、**事务**

#### MyBatisAutoConfiguration

配置了 MyBatis 的整合流程：

- `mybatis-spring-boot-starter` 导入 `mybatis-spring-boot-autoconfigure`（mybatis 的自动配置包）
- 默认加载两个自动配置类：
  - `org.mybatis.spring.boot.autoconfigure.MybatisLanguageDriverAutoConfiguration`
  - `org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration`
    - 必须在数据源配置好之后才配置
    - 给容器中 `SqlSessionFactory` 组件。创建和数据库的一次会话
    - 给容器中 `SqlSessionTemplate` 组件。操作数据库
- MyBatis 的所有配置绑定在 `MybatisProperties`
- 每个 Mapper 接口的代理对象是怎么创建放到容器中，详见 `@MapperScan` 原理：
  - 利用 `@Import(MapperScannerRegistrar.class)` 批量给容器中注册组件。解析指定的包路径里面的每一个类，为每一个 Mapper 接口类，创建 Bean 定义信息，注册到容器中。

::: tip 如何分析自动配置类
找 `classpath:/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件中配置的所有值，就是要开启的自动配置类，但是每个类可能有条件注解，基于条件注解判断哪个自动配置类生效了。
:::

### 6. 快速定位生效的配置

```properties
# 开启调试模式，详细打印开启了哪些自动配置
debug=true
# Positive（生效的自动配置）  Negative（不生效的自动配置）
```

### 7. 扩展：整合其他数据源

#### Druid 数据源

::: warning
Druid 暂不支持 SpringBoot3
:::

整合步骤：

- 导入 `druid-starter`
- 写配置
- 分析自动配置了哪些东西，怎么用

Druid 官网：[https://github.com/alibaba/druid](https://github.com/alibaba/druid)

**Druid 配置示例：**

```properties
# 数据源基本配置
spring.datasource.url=jdbc:mysql://192.168.200.100:3306/demo
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource

# 配置StatFilter监控
spring.datasource.druid.filter.stat.enabled=true
spring.datasource.druid.filter.stat.db-type=mysql
spring.datasource.druid.filter.stat.log-slow-sql=true
spring.datasource.druid.filter.stat.slow-sql-millis=2000

# 配置WallFilter防火墙
spring.datasource.druid.filter.wall.enabled=true
spring.datasource.druid.filter.wall.db-type=mysql
spring.datasource.druid.filter.wall.config.delete-allow=false
spring.datasource.druid.filter.wall.config.drop-table-allow=false

# 配置监控页，内置监控页面的首页是 /druid/index.html
spring.datasource.druid.stat-view-servlet.enabled=true
spring.datasource.druid.stat-view-servlet.login-username=admin
spring.datasource.druid.stat-view-servlet.login-password=admin
spring.datasource.druid.stat-view-servlet.allow=*

# 其他 Filter 配置不再演示
# 目前为以下 Filter 提供了配置支持，
# 请参考文档或者根据IDE提示（spring.datasource.druid.filter.*）进行配置。
# StatFilter
# WallFilter
# ConfigFilter
# EncodingConvertFilter
# Slf4jLogFilter
# Log4jFilter
# Log4j2Filter
# CommonsLogFilter
```

### 附录：示例数据库

```sql
CREATE TABLE `t_user`
(
    `id`         BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '编号',
    `login_name` VARCHAR(200) NULL DEFAULT NULL COMMENT '用户名称' COLLATE 'utf8_general_ci',
    `nick_name`  VARCHAR(200) NULL DEFAULT NULL COMMENT '用户昵称' COLLATE 'utf8_general_ci',
    `passwd`     VARCHAR(200) NULL DEFAULT NULL COMMENT '用户密码' COLLATE 'utf8_general_ci',
    PRIMARY KEY (`id`)
);

INSERT INTO t_user(login_name, nick_name, passwd) VALUES ('zhangsan', '张三', '123456');
```
