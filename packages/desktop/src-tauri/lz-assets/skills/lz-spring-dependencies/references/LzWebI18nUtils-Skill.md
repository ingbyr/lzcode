# LzWebI18nUtils 国际化工具使用规范

## 📋 概述

本文档定义了如何在业务代码中正确使用 `LzWebI18nUtils` 工具类实现国际化（i18n）。遵循本规范可以确保多语言支持的正确性和一致性。

---

## 🎯 核心原则

### 1. 始终使用工具类获取国际化消息
❌ **错误做法**：直接在代码中使用硬编码的中文或英文字符串
```java
// 不要这样做！
throw new BusinessException("用户不存在");
return "操作成功";
```

✅ **正确做法**：使用 `LzWebI18nUtils` 获取国际化消息
```java
// 应该这样做
throw new BusinessException(LzWebI18nUtils.getMessage("error.user.not.found"));
return LzWebI18nUtils.getMessage("operation.success");
```

### 2. 资源文件统一管理
- 所有国际化文本必须定义在 `.properties` 资源文件中
- 按照语言分别维护不同的资源文件
- 使用有意义的 key 命名，体现业务含义

### 3. 支持参数化消息
对于需要动态替换的内容，使用占位符 `{0}`, `{1}`, `{2}` 等

---

## 📁 资源文件规范

### 文件位置
```
src/main/resources/
├── messages.properties          # 默认资源文件（英文）
├── messages_zh_CN.properties    # 简体中文
├── messages_zh_TW.properties    # 繁体中文
├── messages_en.properties       # 英文
├── messages_fr.properties       # 法文
├── messages_es.properties       # 西班牙文
├── messages_pt.properties       # 葡萄牙文
└── messages_ar.properties       # 阿拉伯文
```

### 文件命名规则
格式：`{baseName}_{language}_{country}.properties`

- `baseName`: 资源文件前缀，默认为 `messages`
- `language`: 语言代码（小写），如 `zh`, `en`, `fr`
- `country`: 国家/地区代码（大写），如 `CN`, `US`, `TW`

### 编码要求
⚠️ **重要**：所有 `.properties` 文件必须使用 **UTF-8** 编码，以支持多语言字符。

### Key 命名规范
采用**点分命名法**，体现层级和业务模块：

```properties
# 通用消息
operation.success=操作成功
operation.fail=操作失败

# 用户模块
user.not.found=用户不存在
user.create.success=用户创建成功
user.delete.confirm=确定要删除用户 {0} 吗？

# 订单模块
order.create.success=订单创建成功
order.invalid.status=订单状态无效：{0}
order.payment.timeout=订单 {0} 支付超时

# 错误消息
error.system=系统错误，请稍后重试
error.permission.denied=权限不足
error.parameter.invalid=参数无效：{0}
```

---

## 💻 代码使用指南

### 基础用法

#### 1. 简单消息（无参数）

```java
import com.ccccltd.lz.base.web.util.LzWebI18nUtils;

public class UserService {
    
    public User getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            // 获取简单消息
            throw new BusinessException(LzWebI18nUtils.getMessage("user.not.found"));
        }
        return user;
    }
}
```

**资源文件配置：**
```properties
# messages_zh_CN.properties
user.not.found=用户不存在

# messages_en.properties
user.not.found=User not found
```

#### 2. 带参数的消息

```java
public class OrderService {
    
    public void cancelOrder(Long orderId, String reason) {
        // 单个参数
        String message = LzWebI18nUtils.getMessage("order.cancelled", orderId);
        log.info(message);
        
        // 多个参数
        String fullMessage = LzWebI18nUtils.getMessage(
            "order.cancel.with.reason", 
            orderId, 
            reason
        );
        notificationService.send(fullMessage);
    }
}
```

**资源文件配置：**
```properties
# messages_zh_CN.properties
order.cancelled=订单 {0} 已取消
order.cancel.with.reason=订单 {0} 已取消，原因：{1}

# messages_en.properties
order.cancelled=Order {0} has been cancelled
order.cancel.with.reason=Order {0} has been cancelled, reason: {1}
```

#### 3. 使用自定义资源文件

当需要将不同模块的消息分离时，使用 `getMessageWithBaseName`：

```java
public class PaymentService {
    
    public PaymentResult processPayment(PaymentRequest request) {
        try {
            // 从 errors.properties 获取错误消息
            String errorMsg = LzWebI18nUtils.getMessageWithBaseName(
                "errors", 
                "payment.failed"
            );
            return PaymentResult.fail(errorMsg);
        } catch (Exception e) {
            // 带参数的错误消息
            String errorMsg = LzWebI18nUtils.getMessageWithBaseName(
                "errors",
                "payment.error.detail",
                e.getMessage()
            );
            return PaymentResult.fail(errorMsg);
        }
    }
}
```

**资源文件配置：**
```properties
# errors_zh_CN.properties
payment.failed=支付失败
payment.error.detail=支付处理错误：{0}

# errors_en.properties
payment.failed=Payment failed
payment.error.detail=Payment processing error: {0}
```

---

## 🔧 常见场景示例

### 场景 1：Controller 层返回国际化消息

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (BusinessException e) {
            // 返回国际化的错误消息
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequest request) {
        // 参数验证
        if (StringUtils.isBlank(request.getUsername())) {
            String errorMsg = LzWebI18nUtils.getMessage(
                "validation.username.required"
            );
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(errorMsg));
        }
        
        User user = userService.createUser(request);
        String successMsg = LzWebI18nUtils.getMessage(
            "user.create.success", 
            user.getUsername()
        );
        return ResponseEntity.ok(ApiResponse.success(successMsg, user));
    }
}
```

### 场景 2：Service 层业务逻辑

```java
@Service
public class ProductService {
    
    @Transactional
    public Product updateProduct(Long productId, ProductUpdateRequest request) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new BusinessException(
                LzWebI18nUtils.getMessage("product.not.found", productId)
            );
        }
        
        // 检查库存
        if (request.getStock() < 0) {
            throw new BusinessException(
                LzWebI18nUtils.getMessage("product.stock.invalid", request.getStock())
            );
        }
        
        // 更新产品
        productMapper.updateById(product);
        
        // 记录日志（使用国际化消息）
        log.info(LzWebI18nUtils.getMessage(
            "product.update.success", 
            product.getName()
        ));
        
        return product;
    }
}
```

### 场景 3：异常处理中的国际化

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException e) {
        // 异常消息已经是国际化的
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("系统错误", e);
        
        // 获取通用的系统错误消息
        String errorMsg = LzWebI18nUtils.getMessage("error.system");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(errorMsg));
    }
}
```

### 场景 4：批量操作中的国际化

```java
@Service
public class BatchService {
    
    public BatchResult batchDelete(List<Long> ids) {
        List<Long> successIds = new ArrayList<>();
        List<String> failedMessages = new ArrayList<>();
        
        for (Long id : ids) {
            try {
                deleteById(id);
                successIds.add(id);
            } catch (Exception e) {
                // 为每个失败项生成国际化错误消息
                String errorMsg = LzWebI18nUtils.getMessage(
                    "batch.delete.failed.item", 
                    id, 
                    e.getMessage()
                );
                failedMessages.add(errorMsg);
            }
        }
        
        // 生成汇总消息
        String summary = LzWebI18nUtils.getMessage(
            "batch.delete.summary",
            successIds.size(),
            failedMessages.size()
        );
        
        return BatchResult.builder()
            .summary(summary)
            .successIds(successIds)
            .failedMessages(failedMessages)
            .build();
    }
}
```

---

## ⚠️ 注意事项

### 1. 避免在循环中重复调用
❌ **不推荐**：
```java
for (User user : users) {
    // 每次循环都调用，性能较差
    String msg = LzWebI18nUtils.getMessage("user.info", user.getName());
}
```

✅ **推荐**：
```java
String template = LzWebI18nUtils.getMessage("user.info.template");
for (User user : users) {
    // 使用 MessageFormat 手动替换
    String msg = MessageFormat.format(template, user.getName());
}
```

### 2. Key 不存在时的处理
如果资源文件中找不到对应的 key，会抛出 `MissingResourceException`。

**防御性编程：**
```java
try {
    String message = LzWebI18nUtils.getMessage("some.key");
} catch (MissingResourceException e) {
    log.warn("国际化消息 key 不存在: some.key", e);
    // 使用默认消息
    message = "默认消息";
}
```

### 3. 线程安全
`LzWebI18nUtils` 是线程安全的，可以在多线程环境中放心使用。

### 4. 语言环境来源
当前用户的语言环境来自 `LzSessionUtil.getLocale()`，该方法从用户会话中获取。确保在 Web 请求上下文中使用。

---

## 🧪 测试建议

### 单元测试示例

```java
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testGetUserNotFound() {
        // 模拟一个不存在的用户ID
        assertThrows(BusinessException.class, () -> {
            userService.getUserById(999999L);
        });
    }
    
    @Test
    void testInternationalization() {
        // 测试不同语言环境下的消息
        Locale chinese = Locale.SIMPLIFIED_CHINESE;
        Locale english = Locale.ENGLISH;
        
        // 需要在测试中设置不同的语言环境
        // 验证返回的消息是否符合预期语言
    }
}
```

---

## 📊 最佳实践总结

| 实践项 | 说明 |
|--------|------|
| ✅ 统一使用工具类 | 所有国际化消息通过 `LzWebI18nUtils` 获取 |
| ✅ 合理命名 Key | 使用点分命名法，体现模块和含义 |
| ✅ 支持参数化 | 动态内容使用 `{0}`, `{1}` 占位符 |
| ✅ UTF-8 编码 | 确保资源文件使用 UTF-8 编码 |
| ✅ 完整翻译 | 为所有支持的语言提供完整的翻译 |
| ❌ 避免硬编码 | 不要在代码中直接写中文或英文字符串 |
| ❌ 避免频繁调用 | 在循环中缓存模板，避免重复获取 |
| ❌ 不要忽略异常 | 处理 `MissingResourceException` 异常 |

---

## 🔗 相关资源

- **工具类位置**：`com.ccccltd.lz.base.web.util.LzWebI18nUtils`
- **核心实现**：`com.ccccltd.lz.base.core.util.LzI18nUtils`
- **语言工具**：`com.ccccltd.lz.base.core.language.LzLanguage`
- **会话工具**：`com.ccccltd.lz.session.utils.LzSessionUtil`

---

## 📝 快速参考

### 常用 API

```java
// 1. 获取简单消息（使用默认资源文件）
String msg = LzWebI18nUtils.getMessage("key");

// 2. 获取带参数的消息
String msg = LzWebI18nUtils.getMessage("key", param1, param2);

// 3. 使用自定义资源文件
String msg = LzWebI18nUtils.getMessageWithBaseName("errors", "key");

// 4. 自定义资源文件 + 参数
String msg = LzWebI18nUtils.getMessageWithBaseName("errors", "key", param1);
```

### 资源文件模板

```properties
# 模块.功能.具体描述
module.feature.description=消息内容 {0} {1}
```

---

**版本**: 1.0.0  
**最后更新**: 2026-05-11  
**维护者**: LiJia
