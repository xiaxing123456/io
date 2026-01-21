/**
 * RSA 加密配置
 *
 * @description 集中管理 RSA 公钥等配置项
 */

/**
 * 默认 RSA 公钥（Base64 格式）
 *
 * @description 2048位公钥，用于前端数据加密，后端使用对应私钥解密
 */
export const DEFAULT_PUBLIC_KEY =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu0bNnvTZ7mEjuSpHEL9FYisDLpm+oKjkt3F/JRH721y4PxN4QSqjxP0BylTIH1fGxdiXYoEwlVL6B+G7LFONzmewPTU2aqamLfge6MLOC0oCNfzPKYETaZScQu8N0pS1daZtHRulF8J1pMXSq3GFTemU6lavvPYSuwjngdbkyrDkVYN5v0qgG5jQKva73w2rNm4a4qjlH4QvJNC6OmpJe9TZZipNx1eF+RbTi3M8+K/W8Ej/6doVPyWZHCjIY/mZe6WZ2cMopCXzZSuGJKrVI0//XZFeZv/OGpWx4mO+AmqxYROP03pjd+xVW2hEU4Pq16a9RWvp2qefPoaXxPKlwwIDAQAB';

/**
 * RSA 加密配置项
 */
export const RSA_CONFIG = {
    /** 默认公钥 */
    publicKey: DEFAULT_PUBLIC_KEY,
    /** 默认混淆模式（是否添加随机后缀） */
    defaultObfuscate: false,
    /** 默认混淆字符长度 */
    defaultObfuscateLength: 32,
    /** 最大加密数据长度（字节） - RSA 2048 位限制 */
    maxDataLength: 245,
} as const;
