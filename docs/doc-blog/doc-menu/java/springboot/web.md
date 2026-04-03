# SpringBoot3 Web开发

## 1. Web场景

### 1.1 自动配置

1、整合web场景

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

2、引入了 `autoconfigure` 功能

3、`@EnableAutoConfiguration` 注解使用 `@Import(AutoConfigurationImportSelector.class)` 批量导入组件

4、加载 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件中配置的所有组件

5、所有自动配置类如下：

```
org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration
org.springframework.boot.autoconfigure.web.embedded.EmbeddedWebServerFactoryCustomizerAutoConfiguration

====以下是响应式web场景和现在的没关系======
org.springframework.boot.autoconfigure.web.reactive.HttpHandlerAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.ReactiveMultipartAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.WebFluxAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.WebSessionIdResolverAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.error.ErrorWebFluxAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.function.client.ClientHttpConnectorAutoConfiguration
org.springframework.boot.autoconfigure.web.reactive.function.client.WebClientAutoConfiguration
================以上没关系=================

org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration
org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration
org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration
org.springframework.boot.autoconfigure.web.servlet.HttpEncodingAutoConfiguration
org.springframework.boot.autoconfigure.web.servlet.MultipartAutoConfiguration
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
```

6、绑定了配置文件的一堆配置项：

- 1、SpringMVC的所有配置 `spring.mvc`
- 2、Web场景通用配置 `spring.web`
- 3、文件上传配置 `spring.servlet.multipart`
- 4、服务器的配置 `server`：比如编码方式

### 1.2 默认效果

默认配置：

1. 包含了 `ContentNegotiatingViewResolver` 和 `BeanNameViewResolver` 组件，方便视图解析
2. 默认的静态资源处理机制：静态资源放在 `static` 文件夹下即可直接访问
3. 自动注册了 `Converter`、`GenericConverter`、`Formatter` 组件，适配常见数据类型转换和格式化需求
4. 支持 `HttpMessageConverters`，可以方便返回json等数据类型
5. 注册 `MessageCodesResolver`，方便国际化及错误消息处理
6. 支持静态 `index.html`
7. 自动使用 `ConfigurableWebBindingInitializer`，实现消息处理、数据绑定、类型转化、数据校验等功能

**重要：**

- 如果想保持boot mvc 的默认配置，并且自定义更多的 mvc 配置，如：`interceptors`、`formatters`、`view controllers` 等。可以使用 `@Configuration` 注解添加一个 `WebMvcConfigurer` 类型的配置类，并**不要**标注 `@EnableWebMvc`
- 如果想保持 boot mvc 的默认配置，但要自定义核心组件实例，比如：`RequestMappingHandlerMapping`、`RequestMappingHandlerAdapter` 或 `ExceptionHandlerExceptionResolver`，给容器中放一个 `WebMvcRegistrations` 组件即可
- 如果想全面接管 Spring MVC，`@Configuration` 标注一个配置类，并加上 `@EnableWebMvc` 注解，实现 `WebMvcConfigurer` 接口

## 2. 静态资源

### 2.1 默认规则

#### 2.1.1 静态资源映射

静态资源映射规则在 `WebMvcAutoConfiguration` 中进行了定义：

1. `/webjars/**` 的所有路径资源都在 `classpath:/META-INF/resources/webjars/`
2. `/**` 的所有路径资源都在 `classpath:/META-INF/resources/`、`classpath:/resources/`、`classpath:/static/`、`classpath:/public/`
3. 所有静态资源都定义了缓存规则。【浏览器访问过一次，就会缓存一段时间】，但此功能参数无默认值
   - `period`：缓存间隔。默认 0S
   - `cacheControl`：缓存控制。默认无
   - `useLastModified`：是否使用lastModified头。默认 false

源码：

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    if (!this.resourceProperties.isAddMappings()) {
        logger.debug("Default resource handling disabled");
        return;
    }
    addResourceHandler(registry, this.mvcProperties.getWebjarsPathPattern(),
            "classpath:/META-INF/resources/webjars/");
    addResourceHandler(registry, this.mvcProperties.getStaticPathPattern(), (registration) -> {
        registration.addResourceLocations(this.resourceProperties.getStaticLocations());
        if (this.servletContext != null) {
            ServletContextResource resource = new ServletContextResource(this.servletContext, SERVLET_LOCATION);
            registration.addResourceLocations(resource);
        }
    });
}
```

缓存设置源码：

```java
registration.setCachePeriod(getSeconds(this.resourceProperties.getCache().getPeriod()));
registration.setCacheControl(this.resourceProperties.getCache().getCachecontrol().toHttpCacheControl());
registration.setUseLastModified(this.resourceProperties.getCache().isUseLastModified());
```

#### 2.1.2 静态资源缓存

所有静态资源都定义了缓存规则。【浏览器访问过一次，就会缓存一段时间】，但此功能参数无默认值：

- `period`：缓存间隔。默认 0S
- `cacheControl`：缓存控制。默认无
- `useLastModified`：是否使用lastModified头。默认 false

#### 2.1.3 欢迎页

欢迎页规则在 `WebMvcAutoConfiguration` 中进行了定义：

1. 在静态资源目录下找 `index.html`
2. 没有就在 `templates` 下找 `index` 模板页

#### 2.1.4 Favicon

在静态资源目录下找 `favicon.ico`

#### 2.1.5 缓存实验

```properties
server.port=9000

#1、spring.web：
# 1.配置国际化的区域信息
# 2.静态资源策略(开启、处理链、缓存)

#开启静态资源映射规则
spring.web.resources.add-mappings=true

#设置缓存
#spring.web.resources.cache.period=3600

##缓存详细合并项控制，覆盖period配置：
## 浏览器第一次请求服务器，服务器告诉浏览器此资源缓存7200秒，7200秒以内的所有此资源访问不用发给服务器请求，7200秒以后发请求给服务器
spring.web.resources.cache.cachecontrol.max-age=7200

#使用资源 last-modified 时间，来对比服务器和浏览器的资源是否相同没有变化。相同返回 304
spring.web.resources.cache.use-last-modified=true
```

### 2.2 自定义静态资源规则

自定义静态资源路径、自定义缓存规则

#### 2.2.1 配置方式

`spring.mvc`：静态资源访问前缀路径

`spring.web`：
- 静态资源目录
- 静态资源缓存策略

```properties
#1、spring.web：
# 1.配置国际化的区域信息
# 2.静态资源策略(开启、处理链、缓存)

#开启静态资源映射规则
spring.web.resources.add-mappings=true

#设置缓存
spring.web.resources.cache.period=3600

##缓存详细合并项控制，覆盖period配置：
## 浏览器第一次请求服务器，服务器告诉浏览器此资源缓存7200秒，7200秒以内的所有此资源访问不用发给服务器请求，7200秒以后发请求给服务器
spring.web.resources.cache.cachecontrol.max-age=7200

## 共享缓存
spring.web.resources.cache.cachecontrol.cache-public=true

#使用资源 last-modified 时间，来对比服务器和浏览器的资源是否相同没有变化。相同返回 304
spring.web.resources.cache.use-last-modified=true

#自定义静态资源文件夹位置
spring.web.resources.static-locations=classpath:/a/,classpath:/b/,classpath:/static/

#2、 spring.mvc
## 2.1. 自定义webjars路径前缀
spring.mvc.webjars-path-pattern=/wj/**
## 2.2. 静态资源访问路径前缀
spring.mvc.static-path-pattern=/static/**
```

#### 2.2.2 代码方式

容器中只要有一个 `WebMvcConfigurer` 组件，配置的底层行为都会生效。

`@EnableWebMvc` 会禁用boot的默认配置。

```java
@Configuration //这是一个配置类
public class MyConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //保留以前规则
        //自己写新的规则。
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/a/","classpath:/b/")
                .setCacheControl(CacheControl.maxAge(1180, TimeUnit.SECONDS));
    }
}
```

```java
@Configuration //这是一个配置类,给容器中放一个 WebMvcConfigurer 组件，就能自定义底层
public class MyConfig /*implements WebMvcConfigurer*/ {

    @Bean
    public WebMvcConfigurer webMvcConfigurer(){
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/static/**")
                        .addResourceLocations("classpath:/a/", "classpath:/b/")
                        .setCacheControl(CacheControl.maxAge(1180, TimeUnit.SECONDS));
            }
        };
    }
}
```
