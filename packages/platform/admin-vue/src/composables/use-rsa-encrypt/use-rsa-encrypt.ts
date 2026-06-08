import { ref } from 'vue';

import JSEncrypt from 'jsencrypt';

import type {
    RSAEncryptOptions,
    RSAEncryptResult,
    UseRSAEncryptReturn,
} from './use-rsa-encrypt.types';
import { RSA_CONFIG } from './rsa-config';
/**
 * RSA 加密 Composable
 *
 * @description 提供 RSA 加密功能
 * @example
 * ```ts
 * const { encrypt, setPublicKey } = useRSAEncrypt({
 *   publicKey: 'MIIBIjANBgkq...'
 * });
 *
 * const result = await encrypt('Hello, World!');
 * logger.log(result.encrypted); // 加密结果
 * ```
 */
export const useRSAEncrypt = (options?: RSAEncryptOptions): UseRSAEncryptReturn => {
    // 公钥存储 - 优先使用传入的公钥，否则使用默认配置
    const publicKey = ref<string>(options?.publicKey || RSA_CONFIG.publicKey);

    /**
     * 将 Base64 格式的公钥转换为 PEM 格式
     *
     * @param base64Key - Base64 格式的公钥
     * @returns PEM 格式的公钥
     */
    const base64ToPem = (base64Key: string): string => {
        const pemHeader = '-----BEGIN PUBLIC KEY-----\n';
        const pemFooter = '\n-----END PUBLIC KEY-----';

        // 每64个字符添加换行
        const formatted = base64Key.match(/.{1,64}/g)?.join('\n') || base64Key;

        return pemHeader + formatted + pemFooter;
    };

    /**
     * 生成指定长度的随机字符串
     *
     * @param length - 字符串长度，默认 32
     * @returns 随机字符串
     */
    const generateRandomString = (length = 32): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    /**
     * 计算字符串的字节长度
     *
     * @param str - 要计算的字符串
     * @returns 字节长度
     */
    const getByteLength = (str: string): number => {
        return new Blob([str]).size;
    };

    /**
     * 加密数据
     *
     * @param plainText - 要加密的明文数据
     * @param obfuscate - 是否启用混淆模式（添加随机后缀），默认从配置读取
     * @returns 加密结果
     * @throws {Error} 当数据过长或加密失败时抛出异常
     */
    const encrypt = async (plainText: string, obfuscate = true): Promise<RSAEncryptResult> => {
        // 参数校验
        if (!plainText || plainText.trim() === '') {
            throw new Error('待加密的数据不能为空');
        }

        if (!publicKey.value || publicKey.value.trim() === '') {
            throw new Error('RSA 公钥未设置，请先调用 setPublicKey() 设置公钥');
        }

        // 检查数据长度（RSA 2048 最大 245 字节）
        const dataLength = getByteLength(plainText);
        if (dataLength > RSA_CONFIG.maxDataLength) {
            throw new Error(
                `数据过长，当前 ${dataLength} 字节，最大支持 ${RSA_CONFIG.maxDataLength} 字节（约 81 个中文字符）`
            );
        }

        // 确定是否使用混淆模式
        const useObfuscate = obfuscate !== undefined ? obfuscate : options?.obfuscate || false;

        try {
            // 检查 JSEncrypt 是否可用
            if (typeof JSEncrypt === 'undefined') {
                throw new Error('JSEncrypt 库未加载，请确保已引入 jsencrypt 库');
            }

            // 将 Base64 公钥转换为 PEM 格式
            const publicKeyPem = base64ToPem(publicKey.value);

            // 创建加密实例
            const encryptor = new JSEncrypt();
            encryptor.setPublicKey(publicKeyPem);

            // 执行加密
            let encrypted = encryptor.encrypt(plainText);

            if (!encrypted) {
                throw new Error('加密失败，请检查公钥是否正确');
            }

            // 处理混淆模式
            let randomSuffix: string | undefined;
            if (useObfuscate) {
                const obfuscateLength =
                    options?.obfuscateLength || RSA_CONFIG.defaultObfuscateLength;
                randomSuffix = generateRandomString(obfuscateLength);
                encrypted += randomSuffix;
            }

            // 返回加密结果
            const result: RSAEncryptResult = {
                encrypted,
                dataLength,
                cipherLength: encrypted.length,
                obfuscated: useObfuscate,
                randomSuffix,
            };

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '加密失败';
            throw new Error(`RSA 加密失败: ${errorMessage}`);
        }
    };

    /**
     * 设置公钥
     *
     * @param newPublicKey - Base64 格式的 RSA 公钥
     */
    const setPublicKey = (newPublicKey: string): void => {
        if (!newPublicKey || newPublicKey.trim() === '') {
            throw new Error('公钥不能为空');
        }
        publicKey.value = newPublicKey.trim();
    };

    /**
     * 获取当前公钥
     *
     * @returns 当前设置的公钥
     */
    const getPublicKey = (): string => {
        return publicKey.value;
    };

    return {
        encrypt,
        setPublicKey,
        getPublicKey,
        base64ToPem,
        generateRandomString,
        getByteLength,
    };
};
