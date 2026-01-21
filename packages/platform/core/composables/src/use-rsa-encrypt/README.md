# useRSAEncrypt

RSA 加密 Composable，与 Java 后端 RSAUtils 完全兼容。

## 概述

提供前端 RSA 加密功能，使用 PKCS1 填充模式，加密结果可直接被 Java 后端的 `RSAUtils.decryptByPrivateKey()` 或 `RSAUtils.decrypt()` 解密。

**特性：**
- ✅ 支持默认公钥配置（`rsa-config.ts`）
- ✅ 支持自定义公钥覆盖
- ✅ 与 Java RSAUtils 完全兼容
- ✅ 支持混淆加密模式

## 依赖

本 composable 依赖 `jsencrypt` 库，需要在项目中引入：

### 方式1：通过 CDN 引入（推荐用于演示）

```html
<script src="https://cdn.jsdelivr.net/npm/jsencrypt@3.3.2/bin/jsencrypt.min.js"></script>
```

### 方式2：通过 npm 安装

```bash
npm install jsencrypt
# 或
pnpm add jsencrypt
```

然后在入口文件引入：

```typescript
import JSEncrypt from 'jsencrypt';
window.JSEncrypt = JSEncrypt;
```

## 配置说明

### 默认公钥配置

公钥已在 `rsa-config.ts` 中配置，无需每次传入：

```typescript
// rsa-config.ts
export const DEFAULT_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...';

export const RSA_CONFIG = {
    publicKey: DEFAULT_PUBLIC_KEY,
    defaultObfuscate: false,
    defaultObfuscateLength: 32,
    maxDataLength: 245,
};
```

### 更新公钥

如需更换公钥，只需修改 `rsa-config.ts` 文件中的 `DEFAULT_PUBLIC_KEY` 常量。

## 基础用法

### 示例1：使用默认公钥加密

```typescript
import { useRSAEncrypt } from '@engine/composables/use-rsa-encrypt';

export default defineComponent({
    setup() {
        // ✅ 无需传入公钥，自动使用默认配置
        const { encrypt } = useRSAEncrypt();

        const handleEncrypt = async () => {
            try {
                const result = await encrypt('Hello, PIMCenter!');
                logger.log('加密结果:', result.encrypted);
            } catch (error) {
                logger.error('加密失败:', error);
            }
        };

        return { handleEncrypt };
    }
});
```

### 示例2：自定义公钥加密（覆盖默认配置）

```typescript
import { useRSAEncrypt } from '@engine/composables/use-rsa-encrypt';

export default defineComponent({
    setup() {
        // ✅ 传入自定义公钥，覆盖默认配置
        const { encrypt } = useRSAEncrypt({
            publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu0bNnvTZ...'
        });

        const handleEncrypt = async () => {
            try {
                const result = await encrypt('Hello, PIMCenter!');
                logger.log('加密结果:', result.encrypted);
                logger.log('数据长度:', result.dataLength, '字节');
                logger.log('密文长度:', result.cipherLength, '字符');
            } catch (error) {
                logger.error('加密失败:', error);
            }
        };

        return { handleEncrypt };
    }
});
```

### 示例3：混淆加密（对应 Java 的 RSAUtils.decrypt()）

```typescript
// ✅ 使用默认公钥 + 启用混淆模式
const { encrypt } = useRSAEncrypt({
    obfuscate: true  // 启用混淆模式
});

const result = await encrypt('敏感数据');
// 结果会自动添加32位随机后缀
logger.log('混淆加密结果:', result.encrypted);
logger.log('随机后缀:', result.randomSuffix);
```

### 示例4：动态设置公钥

```typescript
const { encrypt, setPublicKey } = useRSAEncrypt();

// 后续设置公钥
setPublicKey('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8...');

const result = await encrypt('用户密码');
```

### 示例5：加密 JSON 数据

```typescript
// ✅ 使用默认公钥
const { encrypt } = useRSAEncrypt();

const userData = {
    username: 'admin',
    password: '123456'
};

const result = await encrypt(JSON.stringify(userData));
```

## API 文档

### 配置选项（RSAEncryptOptions）

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| publicKey | `string` | `RSA_CONFIG.publicKey` | 否 | RSA 公钥（Base64 格式），未提供时使用默认配置 |
| obfuscate | `boolean` | `false` | 否 | 是否启用混淆模式（添加随机后缀） |
| obfuscateLength | `number` | `32` | 否 | 混淆模式的随机字符长度 |

### 返回值

| 方法/属性 | 类型 | 说明 |
|----------|------|------|
| encrypt | `(plainText: string, obfuscate?: boolean) => Promise<RSAEncryptResult>` | 加密数据 |
| setPublicKey | `(publicKey: string) => void` | 设置公钥 |
| getPublicKey | `() => string` | 获取当前公钥 |
| base64ToPem | `(base64Key: string) => string` | 将 Base64 公钥转换为 PEM 格式 |
| generateRandomString | `(length?: number) => string` | 生成随机字符串 |
| getByteLength | `(str: string) => number` | 计算字符串字节长度 |

### 加密结果（RSAEncryptResult）

| 属性 | 类型 | 说明 |
|------|------|------|
| encrypted | `string` | 加密后的密文（Base64 格式） |
| dataLength | `number` | 原始数据长度（字节） |
| cipherLength | `number` | 密文长度（字符） |
| obfuscated | `boolean` | 是否为混淆模式 |
| randomSuffix | `string \| undefined` | 混淆模式的随机后缀（仅混淆模式） |

## Java 后端解密

### 普通加密解密

```java
// 前端加密
const result = await encrypt('Hello, World!');

// Java 后端解密
String encrypted = "前端加密结果";
String decrypted = RSAUtils.decryptByPrivateKey(encrypted);
System.out.println(decrypted); // 输出: Hello, World!
```

### 混淆加密解密

```java
// 前端加密（混淆模式）
const result = await encrypt('敏感数据', true);

// Java 后端解密（自动移除末尾32位）
String encrypted = "前端加密结果";
String decrypted = RSAUtils.decrypt(encrypted);
System.out.println(decrypted); // 输出: 敏感数据
```

## 错误处理

```typescript
const { encrypt } = useRSAEncrypt({
    publicKey: 'MIIBIjANBgkqhkiG9w0...'
});

try {
    const result = await encrypt('待加密数据');
    logger.log('加密成功:', result.encrypted);
} catch (error) {
    if (error instanceof Error) {
        logger.error('加密失败:', error.message);
        // 可能的错误：
        // - 待加密的数据不能为空
        // - RSA 公钥未设置
        // - 数据过长（最大 245 字节）
        // - JSEncrypt 库未加载
        // - 加密失败，请检查公钥是否正确
    }
}
```

## 注意事项

### 1. 配置文件管理

公钥配置位于 `rsa-config.ts` 文件中：

```typescript
// packages/platform-config-engine/src/composables/use-rsa-encrypt/rsa-config.ts
export const DEFAULT_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu...';
```

**修改公钥步骤：**
1. 打开 `rsa-config.ts` 文件
2. 替换 `DEFAULT_PUBLIC_KEY` 常量的值
3. 保存文件，所有使用默认配置的地方会自动使用新公钥

**优势：**
- ✅ 集中管理：公钥统一配置，避免硬编码
- ✅ 易于维护：修改一处，全局生效
- ✅ 灵活性高：支持默认配置和自定义覆盖

### 2. 数据长度限制

RSA 2048 位加密最大支持 245 字节数据：
- 英文字符：约 245 个
- 中文字符：约 81 个（1个中文占3字节）

如果数据过长，建议：
- 使用 AES 加密数据，再用 RSA 加密 AES 密钥
- 或将数据分段加密

### 3. 公钥格式

本 composable 接受 Base64 格式的公钥（Java 标准格式），会自动转换为 PEM 格式。

```typescript
// ✅ 正确：Base64 格式
const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...';

// ❌ 错误：PEM 格式（带 BEGIN/END 标记）
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;
```

### 4. 安全建议

- ✅ 公钥统一在 `rsa-config.ts` 中管理
- ✅ 不要在代码中硬编码私钥
- ✅ 敏感数据传输使用 HTTPS
- ✅ 定期更换密钥对
- ✅ 生产环境使用 2048 位或更高的密钥长度

### 5. 兼容性

- 填充模式：PKCS1（与 Java `Cipher.getInstance("RSA")` 默认一致）
- 加密算法：RSA-2048
- 编码格式：Base64

## 完整示例

```vue
<template>
    <div>
        <el-input v-model="plainText" placeholder="输入要加密的数据" />
        <el-button @click="handleEncrypt">普通加密</el-button>
        <el-button @click="handleEncryptObfuscate">混淆加密</el-button>
        <el-input v-model="encrypted" placeholder="加密结果" readonly />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRSAEncrypt } from '@engine/composables/use-rsa-encrypt';
import { ElMessage } from 'element-plus';

const plainText = ref('');
const encrypted = ref('');

// ✅ 使用默认公钥（已在 rsa-config.ts 中配置）
const { encrypt } = useRSAEncrypt();

const handleEncrypt = async () => {
    if (!plainText.value) {
        ElMessage.warning('请输入要加密的数据');
        return;
    }

    try {
        const result = await encrypt(plainText.value);
        encrypted.value = result.encrypted;
        ElMessage.success('加密成功');
        logger.log('加密结果:', result);
    } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : '加密失败');
    }
};

const handleEncryptObfuscate = async () => {
    if (!plainText.value) {
        ElMessage.warning('请输入要加密的数据');
        return;
    }

    try {
        const result = await encrypt(plainText.value, true);
        encrypted.value = result.encrypted;
        ElMessage.success(`加密成功（混淆模式，添加了${result.randomSuffix?.length}位随机后缀）`);
        logger.log('加密结果:', result);
    } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : '加密失败');
    }
};
</script>
```
