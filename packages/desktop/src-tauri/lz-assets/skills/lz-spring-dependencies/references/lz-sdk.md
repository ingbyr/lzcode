# LZ Base SDK 使用文档

## 概述

`lz-base` 是一个基于 Spring Cloud 的微服务基础库，提供缓存、消息、文件存储、链路追踪等企业级功能组件。

**技术栈：**
- Java：21
- Spring Boot：3.3.13
- Spring Cloud：2023.0.3
- 当前版本：4.4.1.0-SNAPSHOT

---

## 目录

- [模块一览](#模块一览)
- [快速开始](#快速开始)
- [核心工具](#一核心工具-lz-base-core)
- [Web层组件](#二web层组件-lz-base-web)
- [缓存组件](#三缓存组件-lz-base-cache)
- [消息队列](#四消息队列-lz-base-bus)
- [短信服务](#五短信服务-lz-base-msg)
- [文件存储](#六文件存储-lz-base-file)
- [搜索引擎](#七搜索引擎-lz-base-elastic-search)
- [服务发现](#八服务发现-lz-base-discovery)
- [链路追踪](#九链路追踪-lz-base-open-telemetry)
- [操作日志](#十操作日志-lz-base-opt-log)
- [API设计规范](#api设计规范)
- [项目开发规范](#项目开发规范)

---

## 模块一览

| 模块 | 描述 |
|------|------|
| `lz-base-core` | 核心工具类：JSON、加密、线程池、校验 |
| `lz-base-common` | 基础通用组件 |
| `lz-base-web` | Web层：验证器、QueryPanel |
| `lz-base-cache` | 缓存组件（Redis） |
| `lz-base-bus` | 消息队列（RocketMQ） |
| `lz-base-msg` | 短信发送（支持多渠道） |
| `lz-base-file` | 文件存储（MinIO、阿里云、华为OBS、天翼云ZOS） |
| `lz-base-persistence` | 持久化增强 |
| `lz-base-elastic-search` | Elasticsearch/OpenSearch 客户端 |
| `lz-base-discovery` | 服务发现（Nacos负载均衡） |
| `lz-base-config` | 配置中心 |
| `lz-base-open-telemetry` | 链路追踪 |
| `lz-base-opt-log` | 操作日志 |

---

## 快速开始

### 引入依赖

在 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>com.ccccltd.lz</groupId>
    <artifactId>lz-base-web</artifactId>
    <version>${lz-base.version}</version>
</dependency>
```

---

## 一、核心工具 (lz-base-core)

### 1.1 JSON处理

```java
import com.ccccltd.lz.util.LzJsonUtil;

String json = LzJsonUtil.toJSONString(object);
Object obj = LzJsonUtil.parseObject(json, clazz);
```

### 1.2 加密工具

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

### 1.3 ID生成

```java
import com.ccccltd.lz.util.IdWorkerUtil;

long id = IdWorkerUtil.getId();
```

### 1.4 断言工具

```java
import com.ccccltd.lz.util.LzAssertUtil;

LzAssertUtil.notNull(obj, "对象不能为空");
LzAssertUtil.isTrue(condition, "条件不满足");
```

### 1.5 异常类

```java
import com.ccccltd.lz.exception.LzBizException;
import com.ccccltd.lz.exception.LzAppException;

// 业务异常
throw new LzBizException("错误码", "错误信息");

// 应用级异常
throw new LzAppException("错误信息");
```

### 1.6 线程池

使用LzExecutorServiceFactory创建线程池.

```java
import com.ccccltd.lz.base.core.concurrent.LzExecutorServiceFactory; 
import java.util.concurrent.ExecutorService;

public class Example1 { 
    // 创建线程池 
    private static final ExecutorService executor = LzExecutorServiceFactory.newVirtualThreadPerTaskExecutor("order-service");
    public void processOrder(String orderId) {
        // 提交异步任务
        executor.submit(() -> {
            System.out.println("处理订单: " + orderId);
            // 业务逻辑...
        });
    }
}
```

---

## 二、Web层组件 (lz-base-web)

### 2.1 验证注解

基于 `jakarta.validation` 的验证框架，提供分组校验和自定义验证注解。

```java
import com.ccccltd.lz.validation.AddValidationGroup;
import com.ccccltd.lz.validation.EditValidationGroup;
import com.ccccltd.lz.validation.EnumValue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class DemoBo {
    @NotNull(message = "ID不能为空", groups = EditValidationGroup.class)
    private Long id;

    @NotBlank(message = "名称不能为空", groups = AddValidationGroup.class)
    private String name;

    @EnumValue(values = {"A", "B", "C"}, message = "状态值不合法")
    private String status;
}
```

### 2.2 持久层操作

**技术栈：** MyBatis-Plus + MyBatis-Plus-Join

**⚠️ 重要规则：禁止使用 MyBatis XML 方式**

本项目**严格禁止**使用 MyBatis XML 映射文件，必须使用 **MyBatis-Plus 编程式 API**。

- ✅ **允许**：使用 `LambdaQueryWrapper`、`LambdaUpdateWrapper` 等编程式 API
- ❌ **禁止**：创建 `.xml` 映射文件
- ❌ **禁止**：在 Mapper 接口中定义需要 XML 实现的方法

详细规范请参考：[MyBatis-Plus 编程式规范](#mybatis-plus-编程式规范)

---

## 三、缓存组件 (lz-base-cache)

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
```

```java
import com.ccccltd.lz.client.impl.RedisCacheClient;

    @Autowired
    private RedisCacheClient redisCacheClient;
    //DB_NAME为字符串，用户逻辑隔离redis
    redisCacheClient.set(DB_NAME, key, value);
```

---

## 四、消息队列 (lz-base-bus)

### 4.1 配置

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

### 4.2 发送消息

```java
import cn.ccccltd.lz.bus.mq.LzMQTemplate;

@Autowired
private LzMQTemplate lzMQTemplate;

lzMQTemplate.sendMessage("TOPIC", "TAG", "message body");
```

---

## 五、短信服务 (lz-base-msg)

### 5.1 配置

```yaml
common-msg:
  backend:
    sys: emay              # emay / c4 / aliyun
    endpoint: http://www.btom.cn:8080
    user: username
    password: password
    app-id: EUCP-EMY-SMS0-05MBV
    accesskey: 9578218627328256
    secret: 9578218627328256
```

### 5.2 发送短信

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

## 六、文件存储 (lz-base-file)

### 6.1 模块结构

| 子模块 | 存储类型 |
|--------|----------|
| `lz-base-file-minio` | MinIO |
| `lz-base-file-aliyun` | 阿里云OSS |
| `lz-base-file-obs` | 华为云OBS |
| `lz-base-file-zos` | 天翼云ZOS |

### 6.2 通用接口

所有方法都委托给 `FileClient` 接口实现，支持多种存储后端（阿里云 OSS、MinIO、华为云 OBS 等）。

```java
import cn.ccccltd.lz.plugin.file.FileClient;
import cn.ccccltd.lz.plugin.file.args.UploadFileArgs;

@Resource
private FileClient fileClient;
```

---

### 6.3 API 方法列表

#### 文件上传

**1. uploadFileByInputStream (Args 版本)**

```java
UploadFileArgs args = UploadFileArgs.builder()
    .uploadFilePath("/uploads/2024")
    .fileName("document.pdf")
    .fileSize(102400L)
    .fileCheckValue("md5hash123")
    .inputStream(inputStream)
    .build();

String filePath = fileClient.uploadFileByInputStream(args);
```

**2. uploadFileByInputStream (简化版本)**

```java
String filePath = fileClient.uploadFileByInputStream(
    "/uploads/2024",
    "document.pdf",
    102400L,
    "md5hash123",
    inputStream
);
```

---

#### 文件下载

**1. downloadToFile (带 isPublic 参数)**

```java
File file = fileClient.downloadToFile("/uploads/document.pdf", false);
```

**2. downloadToFile (默认私有)**

```java
File file = fileClient.downloadToFile("/uploads/document.pdf");
```

**3. downloadToInputstream (带 isPublic 参数)**

```java
InputStream stream = fileClient.downloadToInputstream("/uploads/document.pdf", false);
// 处理流...
stream.close();
```

**4. downloadToInputstream (默认私有)**

```java
InputStream stream = fileClient.downloadToInputstream("/uploads/document.pdf");
```

---

#### 文件列表查询

**1. listObjects (带 isPublic 参数)**

```java
List<String> files = fileClient.listObjects("/uploads/2024", false);
// 输出: ["/uploads/2024/doc1.pdf", "/uploads/2024/doc2.pdf", ...]
```

**2. listObjects (默认私有)**

```java
List<String> files = fileClient.listObjects("/uploads/2024");
```

**3. listFiles (带 isPublic 参数)**

```java
List<String> pdfFiles = fileClient.listFiles("/uploads", ".pdf", false);
```

**4. listFiles (默认私有)**

```java
List<String> pdfFiles = fileClient.listFiles("/uploads", ".pdf");
```

---

#### 预签名 URL

**1. generatePresignedUrl (Args 版本)**

```java
GeneratePresignedUrlArgs args = GeneratePresignedUrlArgs.builder()
    .filePath("/uploads/document.pdf")
    .fileCheckValue("md5hash")
    .isUpload(false)
    .isTemp(true)
    .build();

String url = fileClient.generatePresignedUrl(args);
```

**2. generatePresignedUrl (简化版本)**

```java
// 生成下载链接
String downloadUrl = fileClient.generatePresignedUrl(
    "/uploads/document.pdf",
    "md5hash",
    false,  // 下载
    true    // 临时链接
);

// 生成上传链接
String uploadUrl = fileClient.generatePresignedUrl(
    "/uploads/newfile.pdf",
    null,
    true,   // 上传
    true    // 临时链接
);
```

---

#### 文件删除

**1. deleteFile (带 isPublic 参数)**

```java
Boolean success = fileClient.deleteFile("/uploads/document.pdf", false);
```

**2. deleteFile (默认私有)**

```java
Boolean success = fileClient.deleteFile("/uploads/document.pdf");
```

---

#### 桶管理

**1. createBucket**

```java
Boolean success = fileClient.createBucket("my-bucket", false);
```

**2. deleteBucket**

```java
Boolean success = fileClient.deleteBucket("my-bucket");
```

---

#### 分片上传

**1. initiateMultipartUpload (初始化分片上传)**

```java
String uploadId = fileClient.initiateMultipartUpload("largefile.zip", false);
```

**2. preSignPartPut (获取预签名分片上传地址)**

```java
String uploadUrl = fileClient.preSignPartPut("largefile.zip", "upload123", 1);
// 使用此 URL 上传第 1 个分片
```

**3. uploadPart (上传分片)**

```java
UploadPartArgs args = UploadPartArgs.builder()
    .objectKey("largefile.zip")
    .uploadId("upload123")
    .partNumber(1)
    .inputStream(partInputStream)
    .partSize(5242880L)  // 5MB
    .build();

Boolean success = fileClient.uploadPart(args, false);
```

**4. completeMultipartUpload (合并分片)**

```java
List<FileBasicData> parts = Arrays.asList(
    new FileBasicData(1, "etag1"),
    new FileBasicData(2, "etag2"),
    new FileBasicData(3, "etag3")
);

fileClient.completeMultipartUpload("largefile.zip", "upload123", parts);
```

**5. abortMultipartUpload (清理分片碎片)**

```java
Boolean success = fileClient.abortMultipartUpload("largefile.zip", "upload123", false);
```

**6. preSignGet (获取预签名分片下载地址)**

```java
String downloadUrl = fileClient.preSignGet(
    "largefile.zip",
    "attachment; filename=largefile.zip"
);
```

**7. composeFile (分片上传文件合并)**

```java
ComposeFileArgs args = ComposeFileArgs.builder()
    .objectName("largefile.zip")
    .fileBasicdataList(parts)
    .build();

Boolean success = fileClient.composeFile(args);
```

---

### 6.4 MinIO 配置

```yaml
lanzhou:
  file:
    minio:
      url: http://localhost:9000
      access-key: minioadmin
      secret-key: minioadmin
      bucket-name: my-bucket
```

### 6.5 阿里云OSS 配置

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

## 七、搜索引擎 (lz-base-elastic-search)

### 7.1 配置

```yaml
lanzhou:
  elasticsearch:
    host: 10.209.232.185:9200
    userName: elastic
    password: xxx
```

### 7.2 使用

```java
import cn.ccccltd.lz.base.elatic.search.config.LZElasticSearchConfig;

@Autowired
private LZElasticSearchConfig esConfig;

// 获取客户端
var client = esConfig.restClient();
```

---

## 八、服务发现 (lz-base-discovery)

### 8.1 本地优先负载均衡

```java
import com.ccccltd.lz.loadbalance.NacosLocalFirstLoadBalancer;

// 自动注入，使用Nacos本地优先策略
```

---

## 九、链路追踪 (lz-base-open-telemetry)

### 9.1 配置

```yaml
management:
  tracing:
    sampling:
      probability: '1.0'
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
```

---

## 十、操作日志 (lz-base-opt-log)

### 10.1 配置

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

### 10.2 使用

```java
import cn.ccccltd.lz.opt.log.annotation.LzLogRecord;
import cn.ccccltd.lz.opt.log.annotation.LzLogTargetId;

@PostMapping("/add")
@LzLogRecord(action = "新增了", targetTypeName = "演示模块", targetType = "demo")
public ApiResult<Long> addDemo(@RequestBody @LzLogTargetId(expression = "id") DemoBo bo) {
    return ApiResult.ok();
}
```

### 10.3 日志格式配置

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

## API设计规范

### RESTful风格

| HTTP 方法 | 操作类型 |
|----------|----------|
| `GET`    | 查询操作 |
| `POST`   | 新增操作 |
| `PUT`    | 更新操作 |
| `DELETE` | 删除操作 |

### 路径规范

- **Web 接口**：`/{模块}`，如 `/address`
- **API 接口**：`/api/{模块}`，如 `/api/address`

### 返回结果规范

- **内部接口**：直接返回数据对象
- **Feign 接口**：使用 `ApiResult<T>` 包装
- **自动包装**：使用 `@LzRestApiResult` 注解自动包装返回值

```java
import com.ccccltd.lz.base.web.annotation.LzRestApiResult;

@RestController
@RequestMapping("/address")
public class AddressController {
    
    @GetMapping("/{id}")
    @LzRestApiResult
    public AddressVo getAddress(@PathVariable Long id) {
        // 返回值会被自动包装为 ApiResult<AddressVo>
        return addressService.getById(id);
    }
    
    @PostMapping
    @LzRestApiResult
    public Long createAddress(@RequestBody AddressBo bo) {
        // 返回值会被自动包装为 ApiResult<Long>
        return addressService.save(bo);
    }
}
```

### 5.2 返回值规范（重要）

#### 5.2.1 强制要求

**所有 Controller 方法必须使用 `com.ccccltd.lz.api.ApiResult` 封装返回值。**

这是项目的强制性规范，适用于：
- ✅ 所有 REST API 接口
- ✅ 所有 Web 控制器方法
- ✅ 所有对外暴露的服务接口

**例外情况：**
- 仅在内部 Service 层方法之间调用时，可以不使用 ApiResult
- Feign 客户端接口定义时必须使用 ApiResult

```java
import com.ccccltd.lz.api.ApiResult;

@RestController
@RequestMapping("/student")
public class StudentController {
    
    // ✅ 正确：使用 ApiResult 封装
    @GetMapping("/{id}")
    public ApiResult<StudentVo> queryById(@PathVariable Long id) {
        StudentVo vo = studentService.queryById(id);
        return ApiResult.ok(vo);
    }
    
    // ❌ 错误：直接返回业务对象
    @GetMapping("/{id}")
    public StudentVo queryById(@PathVariable Long id) {
        return studentService.queryById(id);  // 禁止！
    }
}
```

#### 5.2.2 ApiResult 使用方法

**导入语句：**
```java
import com.ccccltd.lz.api.ApiResult;
```

**1. 成功响应**

```java
// 无数据返回
@ApiResult<Void>
public ApiResult<Void> deleteStudent(@RequestParam Long id) {
    studentService.removeById(id);
    return ApiResult.ok();
}

// 返回单个对象
public ApiResult<StudentVo> queryById(@PathVariable Long id) {
    StudentVo vo = studentService.queryById(id);
    return ApiResult.ok(vo);
}

// 返回列表
public ApiResult<List<StudentVo>> queryAll() {
    List<StudentVo> list = studentService.queryAllList();
    return ApiResult.ok(list);
}

// 返回分页结果
public ApiResult<PageResult<StudentVo>> queryPageList(@RequestBody ListRequest request) {
    PageResult<StudentVo> page = studentService.queryPageList(request);
    return ApiResult.ok(page);
}

// 返回基本类型
public ApiResult<Long> saveStudent(@RequestBody StudentBo bo) {
    Long id = studentService.saveStudent(bo);
    return ApiResult.ok(id);
}

public ApiResult<Boolean> updateStatus(@RequestParam Long id, @RequestParam String status) {
    boolean success = studentService.updateStatus(id, status);
    return ApiResult.ok(success);
}
```

**2. 失败响应**

```java
// 默认失败响应
public ApiResult<Void> someMethod() {
    if (condition) {
        return ApiResult.fail();
    }
    return ApiResult.ok();
}

// 带错误信息的失败响应
public ApiResult<StudentVo> queryById(@PathVariable Long id) {
    StudentVo vo = studentService.queryById(id);
    if (vo == null) {
        return ApiResult.fail("学生不存在");
    }
    return ApiResult.ok(vo);
}

// 带错误码和错误信息的失败响应
public ApiResult<Void> validateStudent(@RequestBody StudentBo bo) {
    if (!isValid(bo)) {
        return ApiResult.fail("VALIDATION_ERROR", "学生信息验证失败");
    }
    return ApiResult.ok();
}
```

**3. 警告响应**

```java
// 查询无数据时的警告
public ApiResult<StudentVo> queryById(@PathVariable Long id) {
    StudentVo vo = studentService.queryById(id);
    return Optional.ofNullable(vo)
            .map(ApiResult::ok)
            .orElse(ApiResult.warn("未查询到数据"));
}

public ApiResult<List<StudentVo>> queryByName(@RequestParam String name) {
    List<StudentVo> list = studentService.queryByName(name);
    if (list == null || list.isEmpty()) {
        return ApiResult.warn("未找到匹配的学生记录");
    }
    return ApiResult.ok(list);
}
```

#### 5.2.3 常见返回类型示例

| 场景 | 返回类型 | 示例代码 |
|------|---------|----------|
| 新增操作 | `ApiResult<Long>` | `return ApiResult.ok(id);` |
| 更新操作 | `ApiResult<Boolean>` | `return ApiResult.ok(success);` |
| 删除操作 | `ApiResult<Void>` | `return ApiResult.ok();` |
| 查询单个对象 | `ApiResult<T>` | `return ApiResult.ok(vo);` |
| 查询列表 | `ApiResult<List<T>>` | `return ApiResult.ok(list);` |
| 分页查询 | `ApiResult<PageResult<T>>` | `return ApiResult.ok(pageResult);` |
| 文件下载 | `ApiResult<String>` | `return ApiResult.ok(fileUrl);` |
| 批量操作 | `ApiResult<List<Long>>` | `return ApiResult.ok(idList);` |
| 统计查询 | `ApiResult<Integer>` | `return ApiResult.ok(count);` |
| 状态检查 | `ApiResult<Boolean>` | `return ApiResult.ok(exists);` |

**完整示例：**

```java
@RestController
@RequestMapping("/student")
public class StudentController {

    @Resource
    private StudentService studentService;

    /**
     * 新增学生 - 返回主键ID
     */
    @PostMapping("/save")
    public ApiResult<Long> saveStudent(@RequestBody @Valid SaveOrUpdateStudentBo bo) {
        Long id = studentService.saveOrUpdateDirectRelations(bo);
        return ApiResult.ok(id);
    }

    /**
     * 更新学生 - 返回是否成功
     */
    @PutMapping("/update")
    public ApiResult<Boolean> updateStudent(@RequestBody @Valid StudentBo bo) {
        boolean success = studentService.updateStudent(bo);
        return ApiResult.ok(success);
    }

    /**
     * 删除学生 - 无返回值
     */
    @DeleteMapping("/delete/{id}")
    public ApiResult<Void> deleteStudent(@PathVariable Long id) {
        studentService.removeById(id);
        return ApiResult.ok();
    }

    /**
     * 查询单个学生 - 返回VO对象
     */
    @GetMapping("/{id}")
    public ApiResult<StudentVo> queryById(@PathVariable Long id) {
        StudentVo vo = studentService.queryById(id);
        return Optional.ofNullable(vo)
                .map(ApiResult::ok)
                .orElse(ApiResult.warn("未查询到学生信息"));
    }

    /**
     * 查询学生列表 - 返回List
     */
    @GetMapping("/list")
    public ApiResult<List<StudentVo>> queryAll() {
        List<StudentVo> list = studentService.queryAllList(new ListRequest());
        return ApiResult.ok(list);
    }

    /**
     * 分页查询学生 - 返回PageResult
     */
    @PostMapping("/page")
    public ApiResult<PageResult<StudentVo>> queryPageList(@RequestBody ListRequest request) {
        PageResult<StudentVo> page = studentService.queryPageList(request);
        return ApiResult.ok(page);
    }

    /**
     * 批量删除 - 返回ID列表
     */
    @DeleteMapping("/batch")
    public ApiResult<List<Long>> batchDelete(@RequestBody List<Long> ids) {
        studentService.batchDelete(ids);
        return ApiResult.ok(ids);
    }

    /**
     * 统计学生数量 - 返回Integer
     */
    @GetMapping("/count")
    public ApiResult<Integer> countStudents() {
        int count = studentService.count();
        return ApiResult.ok(count);
    }

    /**
     * 检查学号是否存在 - 返回Boolean
     */
    @GetMapping("/exists/{studentNo}")
    public ApiResult<Boolean> existsByStudentNo(@PathVariable String studentNo) {
        boolean exists = studentService.existsByStudentNo(studentNo);
        return ApiResult.ok(exists);
    }
}
```

#### 5.2.4 禁止的返回方式

**❌ 禁止的做法 vs ✅ 正确的做法**

| 场景 | ❌ 禁止的做法 | ✅ 正确的做法 |
|------|-------------|--------------|
| 直接返回对象 | `public StudentVo queryById(Long id)` | `public ApiResult<StudentVo> queryById(Long id)` |
| 直接返回List | `public List<StudentVo> queryAll()` | `public ApiResult<List<StudentVo>> queryAll()` |
| 直接返回boolean | `public boolean delete(Long id)` | `public ApiResult<Boolean> delete(Long id)` |
| 直接返回void | `public void delete(Long id)` | `public ApiResult<Void> delete(Long id)` |
| 直接返回Long | `public Long save(StudentBo bo)` | `public ApiResult<Long> save(StudentBo bo)` |
| 抛出异常代替返回 | `throw new RuntimeException("错误")` | `return ApiResult.fail("错误信息")` |
| 返回null | `return null;` | `return ApiResult.warn("未查询到数据");` |
| 使用Map包装 | `public Map<String, Object> query()` | `public ApiResult<StudentVo> query()` |
| 自定义Result类 | `public Result<T> query()` | `public ApiResult<T> query()` |

**详细对比示例：**

```java
// ❌ 错误示例1：直接返回业务对象
@GetMapping("/{id}")
public StudentVo queryById(@PathVariable Long id) {
    return studentService.queryById(id);
}

// ✅ 正确示例1：使用ApiResult包装
@GetMapping("/{id}")
public ApiResult<StudentVo> queryById(@PathVariable Long id) {
    StudentVo vo = studentService.queryById(id);
    return Optional.ofNullable(vo)
            .map(ApiResult::ok)
            .orElse(ApiResult.warn("未查询到数据"));
}

// ❌ 错误示例2：返回void
@DeleteMapping("/{id}")
public void deleteStudent(@PathVariable Long id) {
    studentService.removeById(id);
}

// ✅ 正确示例2：返回ApiResult<Void>
@DeleteMapping("/{id}")
public ApiResult<Void> deleteStudent(@PathVariable Long id) {
    studentService.removeById(id);
    return ApiResult.ok();
}

// ❌ 错误示例3：直接抛出异常
@PostMapping("/save")
public Long saveStudent(@RequestBody StudentBo bo) {
    if (bo.getName() == null) {
        throw new IllegalArgumentException("姓名不能为空");
    }
    return studentService.saveStudent(bo);
}

// ✅ 正确示例3：使用ApiResult.fail返回错误
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody StudentBo bo) {
    if (bo.getName() == null) {
        return ApiResult.fail("姓名不能为空");
    }
    Long id = studentService.saveStudent(bo);
    return ApiResult.ok(id);
}

// ❌ 错误示例4：返回null
@GetMapping("/{id}")
public ApiResult<StudentVo> queryById(@PathVariable Long id) {
    StudentVo vo = studentService.queryById(id);
    if (vo == null) {
        return null;  // 禁止返回null！
    }
    return ApiResult.ok(vo);
}

// ✅ 正确示例4：使用ApiResult.warn
@GetMapping("/{id}")
public ApiResult<StudentVo> queryById(@PathVariable Long id) {
    StudentVo vo = studentService.queryById(id);
    return Optional.ofNullable(vo)
            .map(ApiResult::ok)
            .orElse(ApiResult.warn("未查询到数据"));
}

// ❌ 错误示例5：使用Map自定义返回格式
@GetMapping("/list")
public Map<String, Object> queryAll() {
    Map<String, Object> result = new HashMap<>();
    result.put("code", 200);
    result.put("data", studentService.queryAllList());
    result.put("message", "success");
    return result;
}

// ✅ 正确示例5：使用ApiResult
@GetMapping("/list")
public ApiResult<List<StudentVo>> queryAll() {
    List<StudentVo> list = studentService.queryAllList();
    return ApiResult.ok(list);
}
```

**为什么禁止这些做法？**

1. **统一响应格式**：所有接口返回统一的 JSON 结构，便于前端处理
2. **标准化错误处理**：通过 ApiResult 统一管理成功、失败、警告状态
3. **避免空指针异常**：不返回 null，而是返回明确的警告信息
4. **提高可维护性**：统一的返回格式降低前后端联调成本
5. **支持国际化**：ApiResult 支持多语言错误消息
6. **便于监控统计**：统一的返回格式便于日志分析和监控

#### 5.2.5 异常处理中的返回值

在 try-catch 块中正确使用 ApiResult 进行异常处理：

**标准异常处理模式：**

```java
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody @Valid SaveOrUpdateStudentBo bo) {
    try {
        Long id = studentService.saveOrUpdateDirectRelations(bo);
        return ApiResult.ok(id);
    } catch (Exception e) {
        log.error("保存学生信息失败: {}", e.getMessage(), e);
        return ApiResult.fail("保存失败：" + e.getMessage());
    }
}
```

**针对不同异常类型的处理：**

```java
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody @Valid SaveOrUpdateStudentBo bo) {
    try {
        // 业务逻辑
        Long id = studentService.saveOrUpdateDirectRelations(bo);
        return ApiResult.ok(id);
        
    } catch (LzBizException e) {
        // 业务异常 - 返回具体错误信息
        log.warn("业务验证失败: {}", e.getMessage());
        return ApiResult.fail(e.getCode(), e.getMessage());
        
    } catch (IllegalArgumentException e) {
        // 参数异常
        log.warn("参数错误: {}", e.getMessage());
        return ApiResult.fail("参数错误：" + e.getMessage());
        
    } catch (DataAccessException e) {
        // 数据库访问异常
        log.error("数据库操作失败: {}", e.getMessage(), e);
        return ApiResult.fail("数据保存失败，请稍后重试");
        
    } catch (Exception e) {
        // 其他未知异常
        log.error("系统异常: {}", e.getMessage(), e);
        return ApiResult.fail("系统异常，请联系管理员");
    }
}
```

**批量操作的异常处理：**

```java
@DeleteMapping("/batch")
public ApiResult<List<Long>> batchDelete(@RequestBody List<Long> ids) {
    if (ids == null || ids.isEmpty()) {
        return ApiResult.fail("删除ID列表不能为空");
    }
    
    try {
        List<Long> deletedIds = new ArrayList<>();
        List<Long> failedIds = new ArrayList<>();
        
        for (Long id : ids) {
            try {
                studentService.removeById(id);
                deletedIds.add(id);
            } catch (Exception e) {
                log.error("删除学生[{}]失败: {}", id, e.getMessage());
                failedIds.add(id);
            }
        }
        
        if (!failedIds.isEmpty()) {
            return ApiResult.fail(
                "BATCH_DELETE_PARTIAL_FAIL",
                String.format("批量删除完成，成功%d个，失败%d个：失败ID=%s", 
                    deletedIds.size(), failedIds.size(), failedIds)
            );
        }
        
        return ApiResult.ok(deletedIds);
        
    } catch (Exception e) {
        log.error("批量删除异常: {}", e.getMessage(), e);
        return ApiResult.fail("批量删除失败：" + e.getMessage());
    }
}
```

**事务回滚的异常处理：**

```java
@PostMapping("/saveWithAddress")
public ApiResult<Long> saveStudentWithAddress(@RequestBody @Valid SaveOrUpdateStudentBo bo) {
    try {
        // 注意：Service层方法需要添加 @Transactional 注解
        Long id = studentService.saveOrUpdateDirectRelations(bo);
        return ApiResult.ok(id);
        
    } catch (LzBizException e) {
        // 业务异常会触发事务回滚
        log.warn("业务验证失败，事务已回滚: {}", e.getMessage());
        return ApiResult.fail(e.getCode(), e.getMessage());
        
    } catch (Exception e) {
        // 其他异常也会触发事务回滚
        log.error("保存失败，事务已回滚: {}", e.getMessage(), e);
        return ApiResult.fail("保存失败：" + e.getMessage());
    }
}
```

**异步操作的异常处理：**

```java
@PostMapping("/import")
public ApiResult<String> importStudents(@RequestParam MultipartFile file) {
    try {
        // 参数校验
        if (file.isEmpty()) {
            return ApiResult.fail("上传文件不能为空");
        }
        
        // 文件格式校验
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.endsWith(".xlsx")) {
            return ApiResult.fail("只支持Excel文件格式(.xlsx)");
        }
        
        // 执行导入
        String taskId = studentService.importDataAsync(file);
        return ApiResult.ok(taskId);
        
    } catch (LzBizException e) {
        log.warn("导入验证失败: {}", e.getMessage());
        return ApiResult.fail(e.getCode(), e.getMessage());
        
    } catch (Exception e) {
        log.error("导入异常: {}", e.getMessage(), e);
        return ApiResult.fail("导入失败：" + e.getMessage());
    }
}
```

**注意事项：**

1. **必须记录日志**：在 catch 块中使用 `log.error()` 或 `log.warn()` 记录异常信息
2. **不要吞掉异常**：禁止空的 catch 块，至少要记录日志
3. **用户友好的错误信息**：返回给前端的错误信息应该清晰易懂
4. **区分异常类型**：根据不同异常类型返回不同的错误码和消息
5. **事务一致性**：确保异常能正确触发事务回滚（Service层需加 `@Transactional`）
6. **避免泄露敏感信息**：不要将完整的堆栈信息返回给前端

**❌ 错误的异常处理方式：**

```java
// ❌ 错误1：吞掉异常
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody StudentBo bo) {
    try {
        Long id = studentService.saveStudent(bo);
        return ApiResult.ok(id);
    } catch (Exception e) {
        // 什么都没做 - 严重错误！
        return ApiResult.fail();
    }
}

// ❌ 错误2：返回原始异常信息
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody StudentBo bo) {
    try {
        Long id = studentService.saveStudent(bo);
        return ApiResult.ok(id);
    } catch (Exception e) {
        // 暴露了内部实现细节 - 安全风险！
        return ApiResult.fail(e.toString());
    }
}

// ❌ 错误3：不记录日志
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody StudentBo bo) {
    try {
        Long id = studentService.saveStudent(bo);
        return ApiResult.ok(id);
    } catch (Exception e) {
        // 没有记录日志 - 无法排查问题！
        return ApiResult.fail("保存失败");
    }
}
```

**✅ 正确的异常处理方式：**

```java
// ✅ 正确：记录日志 + 用户友好提示
@PostMapping("/save")
public ApiResult<Long> saveStudent(@RequestBody StudentBo bo) {
    try {
        Long id = studentService.saveStudent(bo);
        return ApiResult.ok(id);
    } catch (LzBizException e) {
        log.warn("业务验证失败: {}", e.getMessage());
        return ApiResult.fail(e.getCode(), e.getMessage());
    } catch (Exception e) {
        log.error("保存学生信息异常: {}", e.getMessage(), e);
        return ApiResult.fail("保存失败，请稍后重试");
    }
}
```

---

---

## 验证注解说明

基于 `jakarta.validation` 标准，使用标准的验证注解如 `@NotNull`、`@NotBlank`、`@Size` 等。

---

## 数据类型转换

JSON反序列化支持以下类型自动转换：

- `LocalDateTime`
- `Date`
- `Time`

---

## 注意事项

1. 所有模块依赖 `lz-base-core`，核心功能已包含其中
2. 使用 `lz-base-web` 时需确保项目为 Spring Boot Web 应用
3. 文件存储需要根据实际云服务商选择对应子模块
4. 操作日志依赖 OpenSearch

---

## 项目开发规范

### 一、项目模块结构

```
parent (父项目)
├── xxx-bo          # 业务对象模块
├── xxx-client      # 客户端模块
├── xxx-common      # 公共模块
└── xxx-webapp      # Web 应用模块
```

#### 模块职责说明

**1. xxx-bo (业务对象模块)**
- 存放面向服务外部的业务实体对象 (BO - Business Object)
- 增强模块间的解耦性
- 包含：
  - `xxxBo.java`: 业务层 BO 对象（用于数据传输）
  - `xxxVo.java`: 视图层 VO 对象（用于数据展示）
  - `SaveOrUpdateXxxBo.java`: 保存或更新的请求对象

**2. xxx-client (客户端模块)**
- 提供统一的微服务调用接口
- 简化服务间的交互
- 包含 Feign 客户端定义

**3. xxx-common (公共模块)**
- 封装通用功能和基础类
- 包含：
  - `base/`: 基础类（BasePo, BaseEntity, ListRequest, TreeNode 等）
  - `config/`: 配置类（线程池配置等）
  - `enums/`: 枚举类（错误码等）
  - `mybatis/ext/`: MyBatis 扩展（转换器、处理器等）
  - `util/`: 工具类

**4. xxx-webapp (Web 应用模块)**
- 负责实现业务逻辑
- 包含完整的 MVC 分层结构：
  - `controller/`: 控制层
  - `service/`: 服务层
  - `mapper/`: 数据访问层
  - `po/`: 持久化对象
  - `converter/`: 对象转换器
  - `code2name/`: 编码转名称处理
  - `workflow/`: 工作流相关

### 二、代码分层规范

#### 分层架构

```
Controller 层 (控制层)
    ↓
Service 层 (业务逻辑层)
    ↓
Mapper 层 (数据访问层)
    ↓
Database (数据库)
```

#### 各层职责

**Controller 层**
- 接收 HTTP 请求
- 参数校验
- 权限控制
- 日志记录
- 调用 Service 层处理业务
- 返回统一格式的响应结果

**Service 层**
- 实现核心业务逻辑
- 事务控制
- 调用 Mapper 层进行数据操作
- 协调多个 BO/PO 对象的处理

**Mapper 层**
- 继承 MyBatis-Plus 的 BaseMapper
- **禁止使用 XML 方式**：必须使用 MyBatis-Plus 编程式 API（LambdaQueryWrapper、LambdaUpdateWrapper 等）
- 复杂查询通过 Wrapper 构建条件

**Converter 层**
- 使用 MapStruct 实现 BO、PO、VO 之间的转换
- 提高代码可维护性和性能

### 三、命名规范

#### 包命名规范

```
cn.ccccltd.lz.{module}.{business}.{layer}
```

**示例:**
- `cn.ccccltd.lz.ysyymoduletest01.studentman.controller`
- `cn.ccccltd.lz.ysyymoduletest01.studentman.service`
- `cn.ccccltd.lz.ysyymoduletest01.studentman.mapper`

#### 类命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Controller | `{Business}Controller` | `StudentController` |
| Service 接口 | `{Business}Service` | `StudentService` |
| Service 实现 | `{Business}ServiceImpl` | `StudentServiceImpl` |
| Mapper | `{Business}Mapper` | `StudentMapper` |
| PO (持久化对象) | `{Business}Po` | `StudentPo` |
| BO (业务对象) | `{Business}Bo` | `StudentBo` |
| VO (视图对象) | `{Business}Vo` | `StudentVo` |
| SaveOrUpdate BO | `SaveOrUpdate{Business}Bo` | `SaveOrUpdateStudentBo` |
| Converter | `{Business}Bo2PoConverter` | `StudentBo2PoConverter` |

#### 方法命名规范

| 操作类型 | 命名规则 | 示例 |
|---------|---------|------|
| 查询单个 | `queryById`, `getById` | `queryById(Long id)` |
| 查询列表 | `queryPageList`, `queryAllList` | `queryPageList(ListRequest request)` |
| 保存 | `save`, `saveOrUpdate` | `saveOrUpdateBatch(List<StudentPo> poList)` |
| 删除 | `delete`, `batchDelete` | `batchDelete(List<Long> ids)` |
| 更新 | `update`, `updateField` | `updateField(Long id, ...)` |
| 导入 | `importData` | `importData(MultipartFile file)` |
| 导出 | `exportData`, `exportTemplate` | `exportData(HttpServletResponse response, ExportBo exportBo)` |

#### 数据库字段命名规范

- 使用**蛇形命名法**（snake_case）
- 全部小写，单词间用下划线分隔

**示例:**
```sql
student_no          -- 学号
birth_date          -- 出生日期
insert_user_no      -- 创建人
update_dt           -- 修改日期
```

### 四、对象设计规范

#### PO (Persistent Object) - 持久化对象

**特点:**
- 与数据库表一一对应
- 继承 `BasePo` 基类
- 使用 MyBatis-Plus 注解
- 包含数据库字段的映射

**规范:**
```java
@EqualsAndHashCode(callSuper = true)
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
@TableName("student")
public class StudentPo extends BasePo {

    private static final long serialVersionUID = 9114209761841923061L;

    /**
     * 实体所属业务代码
     */
    @Getter
    private static final String BIZ_CODE = "studentMan";
    
    /**
     * 实体表名
     */
    @Getter
    private static final String TABLE_NAME = "student";

    /**
     * 家庭住址1
     */
    @TableField(value = "address")
    private String address;

    /**
     * 出生日期
     */
    @TableField(value = "birth_date")
    private LocalDateTime birthDate;

    // 非数据库字段需要标注
    @TableField(exist = false)
    private StudentAdressBo studentAddressObj;
}
```

**注意事项:**
1. 必须添加 `@TableName` 注解指定表名
2. 每个字段必须添加 `@TableField` 注解并指定数据库字段名
3. 非数据库字段必须添加 `@TableField(exist = false)`
4. 继承 `BasePo` 获得通用字段（id, insert_user_no, update_dt 等）

#### BO (Business Object) - 业务对象

**特点:**
- 用于业务层数据传输
- 继承 `BaseBo` 基类
- 包含验证注解

**规范:**
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
@SuperBuilder(toBuilder = true)
@Schema(description = "学生基本信息表保存修改请求对象")
public class StudentBo extends BaseBo {

    @Getter
    @JsonIgnore
    public static final String TABLE_NAME = "student";

    @Getter
    @JsonIgnore
    public static final String TABLE_NAME_CHN = "学生基本信息表";

    @Schema(description = "姓名")
    @Length(max = 50, message = "姓名超过长度限制")
    private String name;

    @Schema(description = "出生日期")
    private LocalDateTime birthDate;
}
```

**注意事项:**
1. 必须使用 Lombok 注解简化代码
2. 添加 `@Schema` 注解用于 Swagger 文档
3. 字符串字段必须添加 `@Length` 验证

#### VO (View Object) - 视图对象

**特点:**
- 用于前端数据展示
- 可以包含额外的展示字段
- 通常由 BO 或 PO 转换而来

### 五、Controller 层开发规范

#### 基本结构

```java
@Slf4j
@Validated
@RestController
@RequestMapping("/{module}/{business}")
@Tag(name = "{业务名称}控制层")
public class {Business}Controller {

    @Resource
    {Business}Service service;

    @Resource
    {Business}Bo2PoConverter converter;

    // 方法定义...
}
```

#### 标准 CRUD 接口


**根据 ID 查询**
```java
@Operation(summary = "{业务名称}详细信息查询")
@RequestMapping(value = "/queryById", method = RequestMethod.GET)
public ApiResult<{Business}Vo> queryById(
    @Parameter(description = "数据唯一标识") 
    @RequestParam(value = "id") 
    @LzLogTargetId Long id
) {
    {Business}Vo vo = service.queryById(id);
    return Optional.ofNullable(vo)
            .map(ApiResult::ok)
            .orElse(ApiResult.warn("未查询到数据"));
}
```

**分页查询**
```java
@Operation(summary = "{业务名称}信息分页查询")
@RequestMapping(value = "/queryPageList", method = RequestMethod.POST)
public ApiResult<PageResult<{Business}Vo>> queryPageList(
    @RequestBody @Valid @LzLogTargetId(expression="id") ListRequest request
) {
    Boolean isPage = request.getIsPage();
    PageResult<{Business}Vo> voPageResult = isPage 
        ? service.queryPageList(request) 
        : new PageResult<>(service.queryAllList(request));
    return Optional.ofNullable(voPageResult)
        .map(ApiResult::ok)
        .orElse(ApiResult.warn("未查询到数据"));
}
```


### 六、Service 层开发规范

#### Service 接口

```java
public interface {Business}Service extends LzIService<{Business}Po> {

    /**
     * 保存或更新关联数据
     * @param saveOrUpdateBo 保存或更新对象
     * @return 主键ID
     */
    Long saveOrUpdateDirectRelations(SaveOrUpdate{Business}Bo saveOrUpdateBo);

    /**
     * 批量保存或更新
     * @param poList PO对象列表
     * @return 主键ID列表
     */
    List<Long> saveOrUpdateBatch(List<{Business}Po> poList);

    /**
     * 批量删除
     * @param ids ID列表
     * @return 是否成功
     */
    boolean batchDelete(List<Long> ids);

    /**
     * 根据ID查询
     * @param id 主键ID
     * @return VO对象
     */
    {Business}Vo queryById(Long id);

    /**
     * 分页查询
     * @param request 查询请求
     * @return 分页结果
     */
    PageResult<{Business}Vo> queryPageList(ListRequest request);

    /**
     * 查询所有列表
     * @param request 查询请求
     * @return VO对象列表
     */
    List<{Business}Vo> queryAllList(ListRequest request);
}
```

#### Service 实现类

```java
@Slf4j
@Service
public class {Business}ServiceImpl 
    extends ServiceImpl<{Business}Mapper, {Business}Po> 
    implements {Business}Service {

    @Resource
    private {Business}Mapper mapper;

    @Resource
    private {Business}Po2VoConverter po2VoConverter;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveOrUpdateDirectRelations(SaveOrUpdate{Business}Bo saveOrUpdateBo) {
        // 实现业务逻辑
        // 1. 保存主表数据
        // 2. 保存关联子表数据
        // 3. 返回主键ID
    }

    @Override
    public List<Long> saveOrUpdateBatch(List<{Business}Po> poList) {
        this.saveOrUpdateBatch(poList);
        return poList.stream()
            .map({Business}Po::getId)
            .collect(Collectors.toList());
    }

    @Override
    public boolean batchDelete(List<Long> ids) {
        return this.removeByIds(ids);
    }

    @Override
    public {Business}Vo queryById(Long id) {
        {Business}Po po = this.getById(id);
        return po2VoConverter.po2Vo(po);
    }

    @Override
    public PageResult<{Business}Vo> queryPageList(ListRequest request) {
        Page<{Business}Po> page = new Page<>(
            request.getCurrent(), 
            request.getSize()
        );
        
        LambdaQueryWrapper<{Business}Po> wrapper = new LambdaQueryWrapper<>();
        // 添加查询条件...
        
        Page<{Business}Po> poPage = this.page(page, wrapper);
        List<{Business}Vo> voList = po2VoConverter.poList2VoList(poPage.getRecords());
        
        PageResult<{Business}Vo> result = new PageResult<>();
        result.setRecords(voList);
        result.setTotal(poPage.getTotal());
        result.setCurrent(poPage.getCurrent());
        result.setSize(poPage.getSize());
        
        return result;
    }

    @Override
    public List<{Business}Vo> queryAllList(ListRequest request) {
        LambdaQueryWrapper<{Business}Po> wrapper = new LambdaQueryWrapper<>();
        // 添加查询条件...
        
        List<{Business}Po> poList = this.list(wrapper);
        return po2VoConverter.poList2VoList(poList);
    }
}
```

### 七、数据转换规范

#### MapStruct Converter

**接口定义:**
```java
/**
 * BO 转 PO 数据转换器
 */
@Mapper(componentModel = "spring")
public interface {Business}Bo2PoConverter 
    extends Bo2PoConverter<{Business}Bo, {Business}Po> {
    // MapStruct 自动生成实现
}

/**
 * PO 转 VO 数据转换器
 */
@Mapper(componentModel = "spring")
public interface {Business}Po2VoConverter 
    extends Po2VoConverter<{Business}Po, {Business}Vo> {
    // MapStruct 自动生成实现
}
```

**使用方法:**
```java
@Resource
private {Business}Bo2PoConverter bo2PoConverter;

@Resource
private {Business}Po2VoConverter po2VoConverter;

// 单个对象转换
{Business}Po po = bo2PoConverter.bo2Po(bo);
{Business}Vo vo = po2VoConverter.po2Vo(po);

// 列表转换
List<{Business}Po> poList = bo2PoConverter.boList2PoList(boList);
List<{Business}Vo> voList = po2VoConverter.poList2VoList(poList);
```

**转换原则:**
1. **禁止手动转换**: 必须使用 MapStruct 进行对象转换
2. **字段映射**: 相同名称和类型的字段自动映射
3. **自定义映射**: 特殊字段在 Converter 接口中定义默认方法
4. **空值处理**: 注意处理 null 值，避免 NullPointerException

### 八、数据库规范

#### 表设计规范

**必需字段** (由 `BasePo` 自动填充):

| 字段 | 类型 | 说明 | 填充规则 |
|------|------|------|----------|
| `id` | bigint(20) | 主键唯一索引 | 新增时自动生成 |
| `insert_user_no` | varchar(100) | 创建人 | 新增时自动填充 |
| `update_user_no` | varchar(100) | 修改人 | 修改时自动填充 |
| `insert_dt` | datetime | 创建日期 | 新增时自动填充 |
| `update_dt` | datetime | 修改日期 | 修改时自动填充 |
| `insert_org_no` | varchar(100) | 所属组织编码 | 新增时自动填充 |
| `source_app_no` | varchar(100) | 所属应用编码 | 新增时自动填充 |
| `record_ver` | int | 乐观锁 | 新增时为0，每次修改+1 |
| `deleted` | smallint(1) | 逻辑删除字段 | 0:未删除, 1:已删除 |

**建表示例:**
```sql
CREATE TABLE `student` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键唯一索引',
  `student_no` varchar(32) DEFAULT NULL COMMENT '学号',
  `name` varchar(50) DEFAULT NULL COMMENT '姓名',
  `gender` varchar(50) DEFAULT NULL COMMENT '性别',
  `birth_date` datetime DEFAULT NULL COMMENT '出生日期',
  `phone` varchar(20) DEFAULT NULL COMMENT '本人联系电话',
  `email` varchar(100) DEFAULT NULL COMMENT '电子邮箱',
  `address` varchar(255) DEFAULT NULL COMMENT '家庭住址1',
  `insert_user_no` varchar(100) DEFAULT NULL COMMENT '创建人',
  `update_user_no` varchar(100) DEFAULT NULL COMMENT '修改人',
  `insert_dt` datetime DEFAULT NULL COMMENT '创建日期',
  `update_dt` datetime DEFAULT NULL COMMENT '修改日期',
  `insert_org_no` varchar(100) DEFAULT NULL COMMENT '所属组织编码',
  `source_app_no` varchar(100) DEFAULT NULL COMMENT '所属应用编码',
  `record_ver` int DEFAULT '0' COMMENT '乐观锁',
  `deleted` smallint(1) DEFAULT '0' COMMENT '逻辑删除字段(0:未删除,1:已删除)',
  PRIMARY KEY (`id`),
  KEY `idx_student_no` (`student_no`),
  KEY `idx_insert_dt` (`insert_dt`)
) DEFAULT CHARSET=utf8mb4 COMMENT='学生基本信息表';
```

**注意事项:**
1. 表名使用蛇形命名法，全部小写
2. 字段名使用蛇形命名法，全部小写
3. 必须添加字段注释
4. 为常用查询字段添加索引

#### MyBatis-Plus 编程式规范

**重要规则：禁止使用 MyBatis XML 方式**

项目强制要求使用 MyBatis-Plus 编程式 API，禁止创建和使用 XML 映射文件。

**1. 查询条件构建（LambdaQueryWrapper）**

```java
// 单条件查询
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StudentPo::getName, "张三");
List<StudentPo> list = this.list(wrapper);

// 多条件组合查询
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StudentPo::getGender, "男")
       .like(StudentPo::getName, "张")
       .ge(StudentPo::getBirthDate, LocalDate.of(2000, 1, 1))
       .orderByDesc(StudentPo::getInsertDt);
List<StudentPo> list = this.list(wrapper);

// 分页查询
Page<StudentPo> page = new Page<>(1, 10);
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StudentPo::getDeleted, 0);
Page<StudentPo> result = this.page(page, wrapper);
```

**2. 更新操作（LambdaUpdateWrapper）**

```java
// 条件更新
LambdaUpdateWrapper<StudentPo> updateWrapper = new LambdaUpdateWrapper<>();
updateWrapper.eq(StudentPo::getId, 1L)
             .set(StudentPo::getName, "李四")
             .set(StudentPo::getUpdateDt, LocalDateTime.now());
this.update(updateWrapper);

// 批量更新
LambdaUpdateWrapper<StudentPo> updateWrapper = new LambdaUpdateWrapper<>();
updateWrapper.in(StudentPo::getId, Arrays.asList(1L, 2L, 3L))
             .set(StudentPo::getStatus, "active");
this.update(updateWrapper);
```

**3. 删除操作**

```java
// 逻辑删除（推荐）
this.removeById(1L);                    // 单个删除
this.removeByIds(Arrays.asList(1L, 2L)); // 批量删除

// 条件删除
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StudentPo::getStatus, "inactive");
this.remove(wrapper);
```

**4. 复杂查询示例**

```java
// OR 条件
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.and(w -> w.eq(StudentPo::getName, "张三")
                  .or()
                  .eq(StudentPo::getName, "李四"));

// BETWEEN 条件
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.between(StudentPo::getBirthDate, 
                LocalDate.of(2000, 1, 1), 
                LocalDate.of(2010, 12, 31));

// IN 条件
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.in(StudentPo::getId, Arrays.asList(1L, 2L, 3L, 4L, 5L));

// NOT NULL 条件
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.isNotNull(StudentPo::getEmail);

// 动态条件（条件为真时才添加）
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StringUtils.isNotBlank(name), StudentPo::getName, name)
       .eq(gender != null, StudentPo::getGender, gender)
       .ge(startDate != null, StudentPo::getBirthDate, startDate);
```

**5. 关联查询（使用 MyBatis-Plus-Join）**

```java
// 使用 MPJLambdaWrapper 进行联表查询
MPJLambdaWrapper<StudentPo> wrapper = new MPJLambdaWrapper<>();
wrapper.selectAll(StudentPo.class)
       .selectAs(AddressPo::getDetail, StudentVo::getAddress)
       .leftJoin(AddressPo.class, AddressPo::getStudentId, StudentPo::getId)
       .eq(StudentPo::getName, "张三");

List<StudentVo> list = studentMapper.selectJoinList(StudentVo.class, wrapper);
```

**禁止的做法：**

❌ **不要创建 XML 映射文件**
```xml
<!-- 禁止：不要创建这样的 XML 文件 -->
<mapper namespace="com.example.StudentMapper">
    <select id="queryByName" resultType="StudentPo">
        SELECT * FROM student WHERE name = #{name}
    </select>
</mapper>
```

❌ **不要在 Mapper 接口中定义需要 XML 实现的方法**
```java
// 禁止：不要定义这样的方法
public interface StudentMapper extends BaseMapper<StudentPo> {
    List<StudentPo> queryByName(@Param("name") String name); // 需要 XML 实现
}
```

**推荐的做法：**

✅ **使用 Wrapper 构建查询**
```java
LambdaQueryWrapper<StudentPo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(StudentPo::getName, name);
List<StudentPo> list = this.list(wrapper);
```

✅ **使用 BaseMapper 提供的方法**
```java
// 直接使用 BaseMapper 提供的方法
this.getById(id);
this.list(wrapper);
this.page(page, wrapper);
this.save(entity);
this.updateById(entity);
this.removeById(id);
```

**优势：**
1. **类型安全**：使用方法引用，编译期检查字段名
2. **代码集中**：所有逻辑在 Java 代码中，无需维护 XML 文件
3. **易于重构**：字段重命名时 IDE 自动更新
4. **动态条件**：轻松实现动态查询条件
5. **统一风格**：团队代码风格一致，便于维护

**自动填充配置:**
项目已配置 MyBatis-Plus 的自动填充功能，无需手动设置以下字段：
- `id`
- `insert_user_no`
- `update_user_no`
- `insert_dt`
- `update_dt`
- `insert_org_no`
- `source_app_no`
- `record_ver`
- `deleted`

**填充规则:**
1. 新增时：为空则默认填充
2. 修改时：自动填充更新人和更新时间

**逻辑删除:**
```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

**使用方式:**
```java
// 删除操作会自动转换为更新 deleted 字段
this.removeById(id);          // 逻辑删除
this.removeByIds(ids);        // 批量逻辑删除

// 查询操作会自动过滤已删除的数据
this.getById(id);             // 只查询未删除的数据
this.list(wrapper);           // 只查询未删除的数据
```

### 九、权限控制规范

#### 权限类型

项目支持三种权限控制：


**1. 行权限（数据权限）**

通过 `SharePolicyResolveClient` 实现：

```java
@Resource
private SharePolicyResolveClient resolveClient;

// 获取平台中配置的SQL片段
String sqlStr = resolveClient.getSharePolicyWhere(
    bizCode, tableName, orgNo
);
```

### 十、日志规范

#### 操作日志

通过 `@LzLogRecord` 注解自动记录操作日志：

```java
@LzLogRecord(
    action = LogRecordConstant.Action.SAVE_OR_UPDATE,  // 操作类型
    targetType = LogRecordConstant.TargetType.BUSINESS, // 目标类型
    targetTypeName = "学生基本信息表-保存",              // 目标名称
    format = LogRecordConstant.BIZ_LOG_EXPRESSION       // 日志格式
)
```

**操作类型:**
- `Action.SAVE_OR_UPDATE`: 保存或更新
- `Action.DELETE`: 删除
- `Action.QUERY`: 查询
- `Action.IMPORT`: 导入
- `Action.EXPORT`: 导出

#### 业务日志

使用 SLF4J 记录业务日志：

```java
@Slf4j
public class {Business}Controller {
    
    public ApiResult<Void> someMethod() {
        try {
            // 业务逻辑
            log.info("操作成功: {}", param);
            return ApiResult.ok();
        } catch (Exception e) {
            log.error("操作失败: {}", e.getMessage(), e);
            return ApiResult.fail("操作失败：" + e.getMessage());
        }
    }
}
```

**日志级别:**
- `DEBUG`: 调试信息
- `INFO`: 一般信息
- `WARN`: 警告信息
- `ERROR`: 错误信息

### 十一、异常处理规范

#### 统一响应格式

所有接口返回统一的 `ApiResult` 格式：

```java
// 成功响应
ApiResult.ok();                    // 无数据
ApiResult.ok(data);                // 有数据

// 失败响应
ApiResult.fail();                  // 默认失败
ApiResult.fail(message);           // 带错误信息
ApiResult.fail(code, message);     // 带错误码和信息

// 警告响应
ApiResult.warn(message);           // 警告信息
```

#### 异常处理策略

**Controller 层异常处理:**
```java
@Operation(summary = "保存或修改关联数据")
@RequestMapping(value = "/saveOrUpdateJoinData", method = RequestMethod.POST)
public ApiResult<Long> saveOrUpdateJoinData(
    @RequestBody @Valid SaveOrUpdateStudentBo saveOrUpdateBo
) {
    try {
        return ApiResult.ok(service.saveOrUpdateDirectRelations(saveOrUpdateBo));
    } catch (Exception e) {
        log.error("保存或修改失败:{}", e.getMessage(), e);
        return ApiResult.fail("保存或修改失败：" + e.getMessage());
    }
}
```



### 十二、代码质量规范

#### 代码注释

**类注释:**
```java
/**
 * 学生基本信息表服务实现类
 * 
 * @author 作者名
 * @since 2024-01-01
 */
@Service
public class StudentServiceImpl implements StudentService {
}
```

**方法注释:**
```java
/**
 * 根据ID查询学生信息
 * 
 * @param id 学生ID
 * @return 学生视图对象
 */
@Override
public StudentVo queryById(Long id) {
    // 实现代码
}
```

**字段注释:**
```java
/**
 * 学号
 */
@TableField(value = "student_no")
private String studentNo;
```

#### 代码风格

1. **缩进**: 使用 4 个空格
2. **行宽**: 单行不超过 120 字符
3. **空行**: 方法之间留一个空行
4. **大括号**: K&R 风格（左括号不换行）

#### 最佳实践

1. **避免魔法数字**: 使用常量代替
2. **单一职责**: 每个方法只做一件事
3. **DRY 原则**: 不要重复自己
4. **KISS 原则**: 保持简单
5. **空值检查**: 使用 `Optional` 或 `ObjectUtils`
6. **资源关闭**: 使用 try-with-resources