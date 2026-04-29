---
name: lz-spring-dependencies
description: '组织内部强制使用的Spring项目依赖指南。当用户创建Spring Boot项目、配置pom.xml/build.gradle、询问项目依赖、提到"蓝舟"或"lz"框架时，必须使用此skill。确保所有Spring项目都引入正确的lz-base二方依赖。'
---

# 蓝舟平台 Spring 项目依赖指南

创建 Spring Boot 项目时，必须引入组织内部的 `lz-base` SDK。这是一套基于 Spring Cloud 的微服务基础库，提供会话管理、缓存、消息、文件存储、分布式事务等企业级功能。

## 版本信息

- 当前版本：`4.4.1.0-SNAPSHOT`
- Java：21
- Spring Boot：3.3.13
- Spring Cloud：2023.0.3

## 强制依赖（所有项目必须引入）

### 1. 父 POM 继承

```xml
<parent>
    <groupId>com.ccccltd.lz</groupId>
    <artifactId>lz-base-dependencies</artifactId>
    <version>${lz-base.version}</version>
</parent>

<properties>
    <lz-base.version>4.4.1.0-SNAPSHOT</lz-base.version>
</properties>
```

### 2. 核心依赖（必选）

```xml
<!-- 核心工具类：JSON、加密、安全过滤、线程池、校验 -->
<dependency>
    <groupId>com.ccccltd.lz</groupId>
    <artifactId>lz-base-core</artifactId>
</dependency>
```

### 3. Web 项目依赖（Web应用必选）

```xml
<!-- Web层：会话管理、Token、验证器、QueryPanel -->
<dependency>
    <groupId>com.ccccltd.lz</groupId>
    <artifactId>lz-base-web</artifactId>
</dependency>
```

## 按需引入模块

根据项目需求，选择性引入以下模块：

| 模块                              | 场景                          |
| --------------------------------- | ----------------------------- |
| `lz-base-cache`                   | 需要 Redis 缓存               |
| `lz-base-bus`                     | 需要 RocketMQ 消息队列        |
| `lz-base-msg`                     | 需要短信发送（亿美/阿里云等） |
| `lz-base-file-minio`              | MinIO 文件存储                |
| `lz-base-file-aliyun`             | 阿里云 OSS 文件存储           |
| `lz-base-file-obs`                | 华为云 OBS 文件存储           |
| `lz-base-file-zos`                | 天翼云 ZOS 文件存储           |
| `lz-base-persistence`             | 持久化增强                    |
| `lz-base-elastic-search`          | Elasticsearch/OpenSearch      |
| `lz-base-discovery`               | Nacos 服务发现                |
| `lz-base-config`                  | 配置中心                      |
| `lz-base-distributed-transaction` | Seata 分布式事务              |
| `lz-base-language`                | 国际化                        |
| `lz-base-open-telemetry`          | OpenTelemetry 链路追踪        |
| `lz-base-opt-log`                 | 操作日志（依赖 ES）           |

## 核心工具类速查

| 工具类                        | 用途                           |
| ----------------------------- | ------------------------------ |
| `LzJsonUtil`                  | JSON 序列化/反序列化           |
| `SM2Util`/`SM3Util`/`SM4Util` | 国密加密                       |
| `IdWorkerUtil`                | 分布式 ID 生成                 |
| `LzAssertUtil`                | 断言工具                       |
| `LzI18nUtils`                 | 国际化消息                     |
| `LzSessionUtil`               | 会话管理（获取用户ID、租户ID） |
| `TokenUtil`                   | Token 创建与验证               |
| `QueryPanelUtil`              | 前端查询条件转换               |
| `LzTracingUtil`               | 链路追踪                       |

## 异常类

| 异常类           | 用途                 |
| ---------------- | -------------------- |
| `LzBizException` | 业务异常（带错误码） |
| `LzAppException` | 应用级异常           |

## 验证注解

| 注解                   | 用途                   |
| ---------------------- | ---------------------- |
| `@AddValidationGroup`  | 新增操作分组           |
| `@EditValidationGroup` | 编辑操作分组           |
| `@SpecialChar`         | 特殊字符校验（防 XSS） |
| `@EnumValue`           | 枚举值校验             |

## 配置示例

### 会话管理

```yaml
lz:
  session:
    open: true
    token-key: lz_token
    expire-seconds: 7200
```

### Redis 缓存

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
```

### RocketMQ

```yaml
rocketmq:
  name-server: host:9876
  producer:
    group: producer_group
  consumer:
    group: consumer_group
```

### 链路追踪

```yaml
management:
  tracing:
    sampling:
      probability: "1.0"
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
```

## 操作日志

```java
@PostMapping("/add")
@LzLogRecord(action = "新增了", targetTypeName = "演示模块", targetType = "demo")
public ApiResult<Long> add(@RequestBody @LzLogTargetId(expression = "id") DemoBo bo) {
    return ApiResult.ok();
}
```

## 参考文档

详细使用说明请查阅：`references/lz-sdk.md`
