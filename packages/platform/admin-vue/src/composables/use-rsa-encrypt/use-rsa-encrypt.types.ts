/**
 * RSA 加密配置选项
 */
export interface RSAEncryptOptions {
    /** RSA 公钥（Base64 格式），未提供时使用默认配置的公钥 */
    publicKey?: string;
    /** 是否启用混淆模式（添加32位随机后缀） */
    obfuscate?: boolean;
    /** 混淆模式的随机字符长度（默认32） */
    obfuscateLength?: number;
}

/**
 * RSA 加密结果
 */
export interface RSAEncryptResult {
    /** 加密后的密文（Base64 格式） */
    encrypted: string;
    /** 原始数据长度（字节） */
    dataLength: number;
    /** 密文长度（字符） */
    cipherLength: number;
    /** 是否为混淆模式 */
    obfuscated: boolean;
    /** 混淆模式的随机后缀（仅混淆模式） */
    randomSuffix?: string;
}

/**
 * useRSAEncrypt 返回值类型
 */
export interface UseRSAEncryptReturn {
    /** 加密数据 */
    encrypt: (plainText: string, obfuscate?: boolean) => Promise<RSAEncryptResult>;
    /** 设置公钥 */
    setPublicKey: (publicKey: string) => void;
    /** 获取当前公钥 */
    getPublicKey: () => string;
    /** 将 Base64 公钥转换为 PEM 格式 */
    base64ToPem: (base64Key: string) => string;
    /** 生成随机字符串 */
    generateRandomString: (length?: number) => string;
    /** 计算字符串字节长度 */
    getByteLength: (str: string) => number;
}
