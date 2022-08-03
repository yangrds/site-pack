import * as NodeRSA from 'node-rsa'
import * as path from 'path'
import * as fs from 'fs-extra'
import PackConfig from '../config'

// 公钥加密
export function encrypt(text: string) {
    // 读取公钥
    const publicKey = fs.readFileSync(PackConfig.pubkey_path, 'utf-8');
    // 公钥加密
    const nodersa = new NodeRSA(publicKey);
    const encrypted = nodersa.encrypt(text, 'base64');
    // 返回加密内容
    return encrypted;
}


// 私钥解密
export function decrypt(text: string) {
    const privateKey = fs.readFileSync(PackConfig.prikey_path);
    const nodersa = new NodeRSA(privateKey);
    const decrypted = nodersa.decrypt(text, 'utf8');
    return decrypted;
}


