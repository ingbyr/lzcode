# LZ Base SDK 使用文档

## 概述

`lz-base` 是一个基于 Spring Cloud 的微服务基础库，提供会话管理、缓存、消息、文件存储、分布式事务、链路追踪等企业级功能组件。项目版本 `4.4.1.0-SNAPSHOT`，基于 Java 21、Spring Boot 3.3.13、Spring Cloud 2023.0.3。

---

## 模块一览

| 模块                              | 描述                                           |
| --------------------------------- | ---------------------------------------------- |
| `lz-base-core`                    | 核心工具类：JSON、加密、安全过滤、线程池、校验 |
| `lz-base-common`                  | 基础通用组件                                   |
| `lz-base-web`                     | Web层：会话管理、Token、验证器、QueryPanel     |
| `lz-base-cache`                   | 缓存组件（Redis）                              |
| `lz-base-bus`                     | 消息队列（RocketMQ）                           |
| `lz-base-msg`                     | 短信发送（支持多渠道）                         |
| `lz-base-file`                    | 文件存储（MinIO、阿里云、华为OBS、天翼云ZOS）  |
| `lz-base-persistence`             | 持久化增强                                     |
| `lz-base-elastic-search`          | Elasticsearch/OpenSearch 客户端                |
| `lz-base-discovery`               | 服务发现（Nacos负载均衡）                      |
| `lz-base-config`                  | 配置中心                                       |
| `lz-base-distributed-transaction` | 分布式事务（Seata）                            |
| `lz-base-language`                | 国际化                                         |
| `lz-base-open-telemetry`          | 链路追踪                                       |
| `lz-base-opt-log`                 | 操作日志                                       |

---

## 快速开始

### 1. 引入依赖

在 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>com.ccccltd.lz</groupId>
    <artifactId>lz-base-web</artifactId>
    <version>${lz-base.version}</version>
</dependency>
```

---

## 模块使用指南

### 1. lz-base-core（核心工具）

#### 1.1 JSON处理

```java
import com.ccccltd.lz.util.LzJsonUtil;

String json = LzJsonUtil.toJSONString(object);
Object obj = LzJsonUtil.parseObject(json, clazz);
```

#### 1.2 加密工具

```java
import com.ccccltd.lz.util.SM2Util;
import com.ccccltd.lz.util.SM3Util;
import com.ccccltd.lz.util.SM4Util;

// SM4加密
String encrypted = SM4Util.encrypt(plainText, key);

// SM3哈希
String hash = SM3Util.hash(data);

// SM2签名/验签
String signature = SM2Util.sign(data, privateKey);
boolean valid = SM2Util.verify(data, signature, publicKey);
```

#### 1.3 ID生成

```java
import com.ccccltd.lz.util.IdWorkerUtil;

long id = IdWorkerUtil.getId();
```

#### 1.4 断言工具

```java
import com.ccccltd.lz.util.LzAssertUtil;

LzAssertUtil.notNull(obj, "对象不能为空");
LzAssertUtil.isTrue(condition, "条件不满足");
```

#### 1.5 国际化

```java
import com.ccccltd.lz.base.core.util.LzI18nUtils;

String msg = LzI18nUtils.getMessage("error.code");
```

#### 1.6 异常类

```java
import com.ccccltd.lz.exception.LzBizException;
import com.ccccltd.lz.exception.LzAppException;

// 业务异常
throw new LzBizException("错误码", "错误信息");

// 应用级异常
throw new LzAppException("错误信息");
```

#### 1.7 XSS过滤

```java
import com.ccccltd.lz.security.filter.XssFilter;

// 配置启用XSS过滤（在application.yml中）
```

#### 1.8 线程池

```java
import com.ccccltd.lz.base.core.concurrent.LzExecutorService;

LzExecutorService.execute(() -> {
    // 异步任务
});
```

---

### 2. lz-base-web（Web层）

#### 2.1 会话管理

##### 配置

```yaml
lz:
  session:
    open: true
    token-key: lz_token
    expire-seconds: 7200
```

##### 核心类

```java
import com.ccccltd.lz.session.ISessionInfo;
import com.ccccltd.lz.session.utils.LzSessionUtil;

// 获取当前登录用户
ISessionInfo sessionInfo = LzSessionUtil.getSessionInfo();

// 获取用户ID
String userId = LzSessionUtil.getUserId();

// 获取租户ID
String tenantId = LzSessionUtil.getTenantId();
```

##### Token管理

```java
import com.ccccltd.lz.token.TokenUtil;

// 创建Token
TokenInfo tokenInfo = TokenUtil.createToken(payload);

// 验证Token
TokenPayLoad payload = TokenUtil.verifyToken(token);
```

#### 2.2 验证注解

```java
import com.ccccltd.lz.validation.AddValidationGroup;
import com.ccccltd.lz.validation.EditValidationGroup;
import com.ccccltd.lz.validation.SpecialChar;
import com.ccccltd.lz.validation.EnumValue;

public class DemoBo {
    @NotNull(message = "ID不能为空", groups = EditValidationGroup.class)
    private Long id;

    @NotBlank(message = "名称不能为空", groups = AddValidationGroup.class)
    @SpecialChar(message = "名称包含非法字符")
    private String name;

    @EnumValue(values = {"A", "B", "C"}, message = "状态值不合法")
    private String status;
}
```

#### 2.3 QueryPanel 查询面板

```java
import com.ccccltd.lz.util.QueryPanelUtil;
import com.ccccltd.lz.util.QueryPanelResult;

// 将前端JSON转换为QueryWrapper
QueryPanelResult result = QueryPanelUtil.parseJson(jsonQuery);
QueryWrapper<?> wrapper = result.getWrapper();
```

支持的运算符：

| 运算符      | 说明       |
| ----------- | ---------- |
| `eq`        | 等于       |
| `ne`        | 不等于     |
| `gt`        | 大于       |
| `ge`        | 大于等于   |
| `lt`        | 小于       |
| `le`        | 小于等于   |
| `like`      | 模糊匹配   |
| `leftLike`  | 左匹配     |
| `rightLike` | 右匹配     |
| `in`        | IN查询     |
| `notIn`     | NOT IN查询 |
| `between`   | 范围查询   |

---

### 3. lz-base-cache（缓存）

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
```

```java
import org.springframework.data.redis.core.RedisTemplate;

@Autowired
private RedisTemplate<String, Object> redisTemplate;

redisTemplate.opsForValue().set("key", "value");
Object value = redisTemplate.opsForValue().get("key");
```

---

### 4. lz-base-bus（消息队列 - RocketMQ）

#### 4.1 配置

```yaml
rocketmq:
  consumer:
    group: springboot_consumer_group
    pull-batch-size: 10
  name-server: 10.5.103.6:9876
  producer:
    group: springboot_producer_group
    sendMessageTimeout: 10000
```

#### 4.2 发送消息

```java
import cn.ccccltd.lz.bus.mq.LzMQTemplate;

@Autowired
private LzMQTemplate lzMQTemplate;

lzMQTemplate.sendMessage("TOPIC", "TAG", "message body");
```

---

### 5. lz-base-msg（短信服务）

#### 5.1 配置

```yaml
common-msg:
  backend:
    sys: emay # emay / c4 / aliyun
    endpoint: http://www.btom.cn:8080
    user: username
    password: password
    app-id: EUCP-EMY-SMS0-05MBV
    accesskey: 9578218627328256
    secret: 9578218627328256
```

#### 5.2 发送短信

```java
import cn.ccccltd.lz.msg.sender.CommonSender;
import cn.ccccltd.lz.msg.param.ComReqParam;
import cn.ccccltd.lz.msg.param.Response;

@Autowired
private CommonSender commonSender;

// 单发/群发
ComReqParam param = ComReqParam.builder()
        .mobilePhones("13112345678")
        .body("短信内容")
        .build();
Response resp = commonSender.send(param);

// 个性化短信
Map<String, Object> map = new HashMap<>();
map.put("13112345678", "个性化内容1");
map.put("13212345678", "个性化内容2");
Response resp = commonSender.sendEx(map);

// 查询余额
Response resp = commonSender.getAccountBalance(ComReqParam.builder().build());
```

---

### 6. lz-base-file（文件存储）

#### 6.1 模块结构

| 子模块                | 存储类型  |
| --------------------- | --------- |
| `lz-base-file-minio`  | MinIO     |
| `lz-base-file-aliyun` | 阿里云OSS |
| `lz-base-file-obs`    | 华为云OBS |
| `lz-base-file-zos`    | 天翼云ZOS |

#### 6.2 通用接口

```java
import cn.ccccltd.lz.plugin.file.FileClient;
import cn.ccccltd.lz.plugin.file.args.UploadFileArgs;

// 上传文件
UploadFileArgs args = UploadFileArgs.builder()
        .bucketName("bucket")
        .filePath("dir/file.jpg")
        .inputStream(inputStream)
        .build();
String url = fileClient.uploadFileByInputStream(args);

// 下载文件
File file = fileClient.downloadToFile("dir/file.jpg", false);

// 生成预签名URL
String url = fileClient.generatePresignedUrl(GeneratePresignedUrlArgs.builder()
        .bucketName("bucket")
        .filePath("dir/file.jpg")
        .expireSeconds(3600)
        .build());

// 删除文件
boolean success = fileClient.deleteFile("dir/file.jpg", false);
```

#### 6.3 MinIO 配置

```yaml
lanzhou:
  file:
    minio:
      url: http://localhost:9000
      access-key: minioadmin
      secret-key: minioadmin
      bucket-name: my-bucket
```

#### 6.4 阿里云OSS 配置

```yaml
lanzhou:
  file:
    aliyun:
      endpoint: oss-cn-hangzhou.aliyuncs.com
      access-key: xxx
      secret-key: xxx
      bucket-name: my-bucket
```

---

### 7. lz-base-elastic-search（搜索引擎）

#### 7.1 配置

```yaml
lanzhou:
  elasticsearch:
    host: 10.209.232.185:9200
    userName: elastic
    password: xxx
```

#### 7.2 使用

```java
import cn.ccccltd.lz.base.elatic.search.config.LZElasticSearchConfig;

@Autowired
private LZElasticSearchConfig esConfig;

// 获取客户端
var client = esConfig.restClient();
```

---

### 8. lz-base-discovery（服务发现）

#### 8.1 本地优先负载均衡

```java
import com.ccccltd.lz.loadbalance.NacosLocalFirstLoadBalancer;

// 自动注入，使用Nacos本地优先策略
```

---

### 9. lz-base-distributed-transaction（分布式事务）

#### 9.1 配置

```yaml
seata:
  enabled: true
  application-id: my-app
  tx-service-group: my_tx_group
```

#### 9.2 使用

```java
import io.seata.spring.annotation.GlobalTransactional;

@GlobalTransactional(rollbackFor = Exception.class)
public void doTransaction() {
    // 业务逻辑
}
```

---

### 10. lz-base-open-telemetry（链路追踪）

#### 10.1 配置

```yaml
management:
  tracing:
    sampling:
      probability: "1.0"
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
```

#### 10.2 使用

```java
import com.ccccltd.lz.base.web.tracing.LzTracingUtil;

// 获取TraceId
String traceId = LzTracingUtil.getTraceId();

// 记录日志
LzTracingUtil.recordTraceIdMDC();
```

---

### 11. lz-base-opt-log（操作日志）

#### 11.1 配置

```yaml
lanzhou:
  elasticsearch:
    host: 10.209.232.185:9200
    userName: elastic
    password: xxx
  optlog:
    es:
      index:
        name: opt-log-index
```

#### 11.2 使用

```java
import cn.ccccltd.lz.opt.log.annotation.LzLogRecord;
import cn.ccccltd.lz.opt.log.annotation.LzLogTargetId;

@PostMapping("/add")
@LzLogRecord(action = "新增了", targetTypeName = "演示模块", targetType = "demo")
public ApiResult<Long> addDemo(@RequestBody @LzLogTargetId(expression = "id") DemoBo bo) {
    return ApiResult.ok();
}
```

#### 11.3 日志格式配置

全局配置：

```yaml
lanzhou:
  optlog:
    format: "userName + '在 ' + createTime + action + '[' + targetTypeName + ']' + '[' + targetId + ']'"
```

注解配置：

```java
@LzLogRecord(action = "新增", targetTypeName = "订单", targetType = "order",
    format = "userName + '在 ' + createTime + action + '[' + targetTypeName + ']'")
```

---

### 12. lz-base-language（国际化）

```yaml
spring:
  messages:
    basename: i18n/messages
```

```java
import com.ccccltd.lz.base.web.util.LzWebI18nUtils;

String msg = LzWebI18nUtils.getMessage("key");
```

---

## 验证注解一览

| 注解                   | 说明         | 示例               |
| ---------------------- | ------------ | ------------------ |
| `@AddValidationGroup`  | 新增分组     | 用于 `groups` 属性 |
| `@EditValidationGroup` | 编辑分组     | 用于 `groups` 属性 |
| `@SpecialChar`         | 特殊字符校验 | 防止XSS注入        |
| `@EnumValue`           | 枚举值校验   | 限制允许的值       |

---

## 数据类型转换

JSON反序列化支持以下类型自动转换：

- `LocalDate` / `LocalTime` / `LocalDateTime`
- `Instant`
- `Date`
- 枚举类型（实现 `IBaseEnum`）

---

## 注意事项

1. 所有模块依赖 `lz-base-core`，核心功能已包含其中
2. 使用 `lz-base-web` 时需确保项目为 Spring Boot Web 应用
3. 文件存储需要根据实际云服务商选择对应子模块
4. 操作日志依赖 Elasticsearch/OpenSearch
5. 分布式事务需要 Seata Server 支持

---

## 版本信息

- 当前版本：4.4.1.0-SNAPSHOT
- Java：21
- Spring Boot：3.3.13
- Spring Cloud：2023.0.3
