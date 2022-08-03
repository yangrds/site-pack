import * as os from 'os'
import * as fs from 'fs-extra';
import * as path from 'path';
import * as NodeRSA from 'node-rsa'
const key = new NodeRSA({ b: 1024 });
const site_pack = path.join(os.userInfo().homedir, 'site-pack')
const static_resources = path.join(site_pack, 'static_resources')
const history_file = path.join(site_pack, 'history_file')
const pubkey_path = path.join(site_pack, 'rsa_public_key_1024.txt')
const prikey_path = path.join(site_pack, 'rsa_private_key_1024.txt')
const package_server = path.join(site_pack, 'server.js')
const user_path = path.join(site_pack, 'user.json')


const token = 'package-ci'


function sign() {
    // 读取公钥
    const publicKey = fs.readFileSync(pubkey_path, 'utf-8');
    // 公钥加密
    const nodersa = new NodeRSA(publicKey);
    return nodersa.encrypt(token, 'base64');
}

function keyInit() {
    // 判断配置目录是否存在，不存在则创建
    fs.ensureDirSync(site_pack)

    /* 公钥文件是否存在 */
    const isPubkey = fs.existsSync(pubkey_path)

    /* 公钥文件是否存在 */
    const isPrikey = fs.existsSync(prikey_path)

    // 秘钥缺失，重新创建秘钥
    if (!isPubkey || !isPrikey) {
        // 创建公钥
        var pubkey = key.exportKey('pkcs8-public');
        // 创建私钥
        var prikey = key.exportKey('pkcs8-private');
        // 写入公钥
        fs.outputFileSync(pubkey_path, pubkey)
        // 写入私钥
        fs.outputFileSync(prikey_path, prikey)
    }
}

function init() {
    // 检测工作目录是否存在，不存在则创建
    fs.ensureDirSync(site_pack)
    // 检测资源目录是否存在，不存在则创建
    fs.ensureDirSync(static_resources)
    // 检测备份目录是否存在，不存在则创建
    fs.ensureDirSync(history_file)
    /* 
    读取服务文件
    该文件源码为koa实现由ncc编译，主要功能为托管web静态资源。
    */
    let server = fs.readFileSync(path.join(__dirname, '../process/index.js'), 'utf-8')
    // 将服务文件内容写入资源目录
    fs.writeFileSync(package_server, server)

    if (!fs.existsSync(path.join(site_pack, 'user.json'))) {
        // 写入初始用户数据
        fs.outputJsonSync(path.join(site_pack, 'user.json'), [{ account: 'admin', password: '123456', name: '系统管理员' }])
    }

}

export default {
    site_pack,
    package_server,
    static_resources,
    history_file,
    pubkey_path,
    prikey_path,
    user_path,
    init,
    sign,
    keyInit
}

