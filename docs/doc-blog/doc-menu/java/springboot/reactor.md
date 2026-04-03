# Reactor 核心

> 代码地址：https://gitee.com/leifengyang/reactor-programming

## 前置知识

### 1、Lambda

Java8 语法糖：函数式接口（接口中有且只有一个未实现的方法）可以用 Lambda 表达式简化。

```java
@FunctionalInterface //检查注解，帮我们快速检查我们写的接口是否函数式接口
interface MyHehe {
    int hehe(int i);
}
```

**Lambda 表达式简化过程：**

```java
// 1、自己创建实现类对象
MyInterface myInterface = new MyInterfaceImpl();

// 2、创建匿名实现类
MyInterface myInterface1 = new MyInterface() {
    @Override
    public int sum(int i, int j) {
        return i * i + j * j;
    }
};

// 3、lambda表达式：语法糖 参数列表 + 箭头 + 方法体
MyInterface myInterface2 = (x, y) -> {
    return x * x + y * y;
};

// 简化写法：
// 1）参数类型可以不写，只写(参数名)，参数变量名随意定义
//    参数表最少可以只有一个 ()，或者只有一个参数名
// 2）方法体如果只有一句话，{} 可以省略
MyHehe hehe3 = y -> y + 1;
```

::: tip 总结
1. Lambda 表达式：`(参数表) -> {方法体}`
2. 分辨出你的接口是否函数式接口，函数式接口就可以 lambda 简化
:::

### 2、Function

函数式接口的出入参定义：

**1、有入参，无出参【消费者】：`function.accept`**

```java
BiConsumer<String,String> function = (a,b)->{
    System.out.println("哈哈："+a+"；呵呵："+b);
};
function.accept("1","2");
```

**2、有入参，有出参【多功能函数】：`function.apply`**

```java
Function<String,Integer> function = (String x) -> Integer.parseInt(x);
System.out.println(function.apply("2"));
```

**3、无入参，无出参【普通函数】：**

```java
Runnable runnable = () -> System.out.println("aaa");
new Thread(runnable).start();
```

**4、无入参，有出参【提供者】：`supplier.get()`**

```java
Supplier<String> supplier = ()-> UUID.randomUUID().toString();
String s = supplier.get();
System.out.println(s);
```

`java.util.function` 包下的所有 function 定义：
- **Consumer**：消费者
- **Supplier**：提供者
- **Predicate**：断言

调用的函数方法：`get` / `test` / `apply` / `accept`

### 3、Stream API

::: tip 最佳实战
以后凡是你写 for 循环处理数据的统一全部用 Stream API 进行替换
:::

Stream 所有数据和操作被组合成流管道，流管道组成：
- 一个**数据源**（可以是一个数组、集合、生成器函数、I/O管道）
- 零或多个**中间操作**（将一个流变形成另一个流）
- 一个**终止操作**（产生最终结果）

**中间操作（Intermediate Operations）：**
- `filter`：过滤，挑出我们用的元素
- `map`：映射，一一映射，a 变成 b（`mapToInt`、`mapToLong`、`mapToDouble`）
- `flatMap`：打散、散列、展开、扩维，一对多映射
- `distinct`、`sorted`、`peek`、`limit`、`skip`、`takeWhile`、`dropWhile`

**终止操作（Terminal Operation）：**
- `forEach`、`forEachOrdered`、`toArray`、`reduce`、`collect`、`toList`、`min`、`max`、`count`、`anyMatch`、`allMatch`、`noneMatch`、`findFirst`、`findAny`、`iterator`

### 4、Reactive-Stream

响应式流规范。

## Reactor

### 1、快速上手

**介绍**

Reactor 是一个用于 JVM 的完全非阻塞的响应式编程框架，具备高效的需求管理（即对"背压（backpressure）"的控制）能力。它与 Java 8 函数式 API 直接集成，比如 `CompletableFuture`、`Stream` 以及 `Duration`。它提供了异步序列 API `Flux`（用于 [N] 个元素）和 `Mono`（用于 [0|1] 个元素），并完全遵循和实现了"响应式扩展规范"（Reactive Extensions Specification）。

**依赖**

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.projectreactor</groupId>
            <artifactId>reactor-bom</artifactId>
            <version>2023.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>io.projectreactor</groupId>
        <artifactId>reactor-core</artifactId>
    </dependency>
    <dependency>
        <groupId>io.projectreactor</groupId>
        <artifactId>reactor-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 2、响应式编程

响应式编程是一种关注于**数据流（data streams）**和**变化传递（propagation of change）**的异步编程方式。

**了解历史：**

- 微软在 .NET 生态中创建了响应式扩展库（Rx），接着 RxJava 在 JVM 上实现了响应式编程，后来整合到 Java 9 中（使用 `Flow` 类）
- 响应式编程通常作为"观察者模式"的一种扩展。主要的区别在于，Iterator 是基于"拉取"（pull）方式的，而响应式流是基于"推送"（push）方式的
- 一个 Publisher 可以推送新的值到它的 Subscriber（调用 `onNext` 方法），同样也可以推送错误（调用 `onError` 方法）和完成（调用 `onComplete` 方法）信号

```
onNext x 0..N [onError | onComplete]
```

#### 2.1 阻塞是对资源的浪费

两种思路来提升程序性能：
1. **并行化（parallelize）**：使用更多的线程和硬件资源【异步】
2. 基于现有的资源来**提高执行效率**

#### 2.2 异步可以解决问题吗？

Java 提供了两种异步编程方式：
- **回调（Callbacks）**：异步方法没有返回值，而是采用一个 callback 作为参数
- **Futures**：异步方法立即返回一个 `Future<T>`

回调很难组合起来，会导致"回调地狱（callback hell）"：

```java
userService.getFavorites(userId, new Callback<List<String>>() {
    public void onSuccess(List<String> list) {
        if (list.isEmpty()) {
            suggestionService.getSuggestions(new Callback<List<Favorite>>() {
                public void onSuccess(List<Favorite> list) {
                    UiUtils.submitOnUiThread(() -> {
                        list.stream().limit(5).forEach(uiList::show);
                    });
                }
                public void onError(Throwable error) {
                    UiUtils.errorPopup(error);
                }
            });
        } else {
            list.stream().limit(5).forEach(favId -> favoriteService.getDetails(favId,
                new Callback<Favorite>() {
                    public void onSuccess(Favorite details) {
                        UiUtils.submitOnUiThread(() -> uiList.show(details));
                    }
                    public void onError(Throwable error) {
                        UiUtils.errorPopup(error);
                    }
                }
            ));
        }
    }
    public void onError(Throwable error) {
        UiUtils.errorPopup(error);
    }
});
```

**Reactor 改造后为：**

```java
userService.getFavorites(userId)
    .flatMap(favoriteService::getDetails)
    .switchIfEmpty(suggestionService.getSuggestions())
    .take(5)
    .publishOn(UiUtils.uiThreadScheduler())
    .subscribe(uiList::show, UiUtils::errorPopup);
```

增加超时处理也非常简单：

```java
userService.getFavorites(userId)
    .timeout(Duration.ofMillis(800))
    .onErrorResume(cacheService.cachedFavoritesFor(userId))
    .flatMap(favoriteService::getDetails)
    .switchIfEmpty(suggestionService.getSuggestions())
    .take(5)
    .publishOn(UiUtils.uiThreadScheduler())
    .subscribe(uiList::show, UiUtils::errorPopup);
```

#### 2.3 从命令式编程到响应式编程

Reactor 关注的几个方面：
- **可编排性（Composability）** 以及 **可读性（Readability）**
- 使用丰富的**操作符**来处理形如**流**的数据
- 在**订阅（subscribe）**之前什么都不会发生
- **背压（backpressure）**：消费者能够反向告知生产者生产内容的速度的能力
- **高层次**的抽象，从而达到**并发无关**的效果

**热（Hot） vs 冷（Cold）：**
- **冷**的序列：对于每一个 Subscriber，都会收到从头开始所有的数据
- **热**的序列：对于一个 Subscriber，只能获取从它开始订阅之后发出的数据

### 3、核心特性

#### 1、Mono 和 Flux

- **Mono**：0|1 数据流
- **Flux**：N 数据流
- 响应式流：元素（内容） + 信号（完成/异常）

#### 2、subscribe()

自定义流的信号感知回调：

```java
flux.subscribe(
    v -> System.out.println("v = " + v),           //流元素消费
    throwable -> System.out.println("throwable = " + throwable), //感知异常结束
    () -> System.out.println("流结束了...")           //感知正常结束
);
```

自定义消费者：

```java
flux.subscribe(new BaseSubscriber<String>() {

    @Override
    protected void hookOnSubscribe(Subscription subscription) {
        System.out.println("绑定了..." + subscription);
        request(1); //要1个数据
    }

    @Override
    protected void hookOnNext(String value) {
        System.out.println("数据到达，正在处理：" + value);
        request(1); //要1个数据
    }

    @Override
    protected void hookOnComplete() {
        System.out.println("流正常结束...");
    }

    @Override
    protected void hookOnError(Throwable throwable) {
        System.out.println("流异常..." + throwable);
    }

    @Override
    protected void hookOnCancel() {
        System.out.println("流被取消...");
    }

    @Override
    protected void hookFinally(SignalType type) {
        System.out.println("最终回调...一定会被执行");
    }
});
```

#### 3、流的取消

消费者调用 `cancel()` 取消流的订阅（`Disposable`）

#### 4、BaseSubscriber

自定义消费者，推荐直接编写 `BaseSubscriber` 的逻辑。

#### 5、背压（Backpressure）和请求重塑（Reshape Requests）

**1、buffer：缓冲**

```java
Flux<List<Integer>> flux = Flux.range(1, 10)
    .buffer(3)
    .log();
// 缓冲区：缓冲3个元素，消费一次最多可以拿到三个元素；凑满数批量发给消费者
```

**2、limit：限流**

```java
Flux.range(1, 1000)
    .log()
    .limitRate(100) //一次预取100个元素；第一次 request(100)，以后 request(75)
    .subscribe();
```

#### 6、以编程方式创建序列 - Sink

- `Sink.next`
- `Sink.complete`
- **同步环境** - `generate`
- **多线程** - `create`

#### 7、handle()

自定义流中元素处理规则：

```java
Flux.range(1, 10)
    .handle((value, sink) -> {
        System.out.println("拿到的值：" + value);
        sink.next("张三：" + value); //可以向下发送数据的通道
    })
    .log()
    .subscribe();
```

#### 8、自定义线程调度

响应式编程：全异步、消息、事件回调。默认还是用当前线程，生成整个流、发布流、流操作。

```java
public void thread1() {
    Scheduler s = Schedulers.newParallel("parallel-scheduler", 4);

    final Flux<String> flux = Flux
        .range(1, 2)
        .map(i -> 10 + i)
        .log()
        .publishOn(s)
        .map(i -> "value " + i);

    // 只要不指定线程池，默认发布者用的线程就是订阅者的线程
    new Thread(() -> flux.subscribe(System.out::println)).start();
}
```

#### 9、错误处理

**1. onErrorReturn：捕获异常返回一个静态默认值**

```java
Flux.just(1, 2, 0, 4)
    .map(i -> "100 / " + i + " = " + (100 / i))
    .onErrorReturn(NullPointerException.class, "哈哈-6666")
    .subscribe(v -> System.out.println("v = " + v),
        err -> System.out.println("err = " + err),
        () -> System.out.println("流结束"));
```

- 吃掉异常，消费者无异常感知
- 返回一个兜底默认值
- 流正常完成

**2. onErrorResume：吃掉异常，执行一个兜底方法**

```java
Flux.just(1, 2, 0, 4)
    .map(i -> "100 / " + i + " = " + (100 / i))
    .onErrorResume(err -> Mono.just("哈哈-777"))
    .subscribe(v -> System.out.println("v = " + v),
        err -> System.out.println("err = " + err),
        () -> System.out.println("流结束"));
```

**3. onErrorMap：捕获并包装成业务异常，重新抛出**

```java
Flux.just(1, 2, 0, 4)
    .map(i -> "100 / " + i + " = " + (100 / i))
    .onErrorMap(err -> new BusinessException(err.getMessage() + ": 又炸了..."))
    .subscribe(v -> System.out.println("v = " + v),
        err -> System.out.println("err = " + err),
        () -> System.out.println("流结束"));
```

**4. doOnError：捕获异常，记录错误日志，重新抛出**

```java
Flux.just(1, 2, 0, 4)
    .map(i -> "100 / " + i + " = " + (100 / i))
    .doOnError(err -> {
        System.out.println("err已被记录 = " + err);
    })
    .subscribe(v -> System.out.println("v = " + v),
        err -> System.out.println("err = " + err),
        () -> System.out.println("流结束"));
```

**5. doFinally：finally 块清理资源**

```java
Flux.just(1, 2, 3, 4)
    .map(i -> "100 / " + i + " = " + (100 / i))
    .doOnError(err -> {
        System.out.println("err已被记录 = " + err);
    })
    .doFinally(signalType -> {
        System.out.println("流信号：" + signalType);
    })
```

**6. onErrorContinue：忽略当前异常，继续推进**

```java
Flux.just(1, 2, 3, 0, 5)
    .map(i -> 10 / i)
    .onErrorContinue((err, val) -> {
        System.out.println("err = " + err);
        System.out.println("val = " + val);
        System.out.println("发现" + val + "有问题了，继续执行其他的，我会记录这个问题");
    })
    .subscribe(v -> System.out.println("v = " + v),
        err -> System.out.println("err = " + err));
```

#### 10、常用操作

`filter`、`flatMap`、`concatMap`、`flatMapMany`、`transform`、`defaultIfEmpty`、`switchIfEmpty`、`concat`、`concatWith`、`merge`、`mergeWith`、`mergeSequential`、`zip`、`zipWith` ...

#### 11、Context API

响应式中的 ThreadLocal — `Context`：

```java
Flux.just(1, 2, 3)
    .transformDeferredContextual((flux, context) -> {
        System.out.println("flux = " + flux);
        System.out.println("context = " + context);
        return flux.map(i -> i + "==>" + context.get("prefix"));
    })
    // 上游能拿到下游的最近一次数据
    .contextWrite(Context.of("prefix", "哈哈"))
    // Context 由下游传播给上游
    .subscribe(v -> System.out.println("v = " + v));
```

#### 12、ParallelFlux 并发流

```java
Flux.range(1, 1000000)
    .buffer(100)
    .parallel(8)
    .runOn(Schedulers.newParallel("yy"))
    .log()
    .subscribe();
```
