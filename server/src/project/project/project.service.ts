import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { CloudFileMove, dateFormat, decompress, FileRemove, uuid } from '../../utils/index'
import { CloudFileInfo } from '../../utils'
import PackConfig from '../../config'
import { get_process_container, init, process_container } from '../../plugin/start'
import * as fs from 'fs-extra';
import got from 'got';
import { decrypt, encrypt } from 'src/utils/verify';
import { JudgePort } from 'src/utils/port';

// 心跳检查
function ServerStatus(port: string): Promise<{ status: boolean, msg: string }> {
    return new Promise(async (resolove) => {
        try {
            await got.post(`http://0.0.0.0:${port}/status`, {
                json: {},
                timeout: {
                    lookup: 100,
                    connect: 3000
                }
            }).json();
            resolove({ status: true, msg: '' })
        } catch (error) {
            resolove({ status: false, msg: error.message })
        }
    })

}



@Injectable()
export class ProjectService {

    async Login(body: { account: string; password: string; }): Promise<any> {
        const users = fs.readJsonSync(PackConfig.user_path)
        const user = users.find((item) => item.account === body.account)

        if (!user || user.password != body.password) {
            return { code: 500, msg: '用户名或密码错误' }
        }

        let token = {
            account: body.account,
            password: body.password,
            valid: (1 * 86400000),
            date: Math.round(new Date() as any)
        }

        return { code: 200, data: encrypt(JSON.stringify(token)) }
    }

    async UserInfo(token: string) {
        try {
            // 令牌（token）私钥解密
            let info: {
                account: string;
                password: string;
                valid: number;
                date: number
            } = JSON.parse(decrypt(token))
            const users = fs.readJsonSync(PackConfig.user_path)
            const user = users.find((item) => item.account === info.account)
            delete user.password
            return { code: 200, data: user }
        } catch (error) {
            return { code: 500, msg: '未知错误' }
        }
    }


    async UserUpdate(body: { account: string; password: string; name: string; token: string }) {
        try {
            // 令牌（token）私钥解密
            let info: {
                account: string;
                password: string;
                valid: number;
                date: number
            } = JSON.parse(decrypt(body.token))
            const users = fs.readJsonSync(PackConfig.user_path)
            users.forEach((item) => {
                if (item.account === info.account) {
                    item.name = body.name;
                    body.password && (item.password = body.password)
                }
            });
            fs.outputJsonSync(PackConfig.user_path, users)
            return { code: 200, data: '更新成功' }
        } catch (error) {
            return { code: 500, msg: '未知错误' }
        }
    }





    // 创建项目（站点）
    async create(body: { name: string; port: string; remark: string }) {

        // 检测端口是否被系统占用
        const isPort = await JudgePort(body.port)
        if (!isPort.status) {
            return { code: 500, msg: `端口${isPort.port}，已被占用！` }
        }
        // 检测端口是否被其他站点注册
        const listRes: any = await this.list()
        if (listRes.code != 200) return listRes
        const isProjectPort = listRes.data.find((item: any) => item.port === body.port)
        if (isProjectPort) {
            return { code: 500, msg: `端口${isProjectPort.port}，已经被【${isProjectPort.name}】注册` }
        }
        // 站点主键
        const id = uuid(16, 32)
        // 初始数据
        const config = { ...body, date: Math.round(new Date() as any), key: id }
        // 工作目录【指定项目key】
        const key_path = path.join(PackConfig.static_resources, id)
        // 历史文件目录【指定项目key】
        const history_path = path.join(PackConfig.history_file, id)
        // 工作目录【指定项目key】内的配置文件
        const config_path = path.join(key_path, 'config.json')
        try {
            // 创建工作目录
            fs.emptyDirSync(key_path)
            // 创建静态资源目录
            fs.emptyDirSync(path.join(key_path, 'dist'))
            // 创建历史文件目录
            fs.emptyDirSync(history_path)
            // 配置数据注入至配置文件
            fs.outputJsonSync(config_path, config)
            return { code: 200, msg: '创建成功' }
        } catch (error) {
            return { code: 500, msg: error.message }
        }
    }

    async remove(body: { id: string }) {
        try {
            const key_path = path.join(PackConfig.static_resources, body.id)
            fs.emptyDirSync(key_path)
            fs.rmdirSync(key_path)
            return { code: 200, msg: '删除成功' }
        } catch (error) {
            return { code: 500, msg: error.message }
        }
    }

    async process_killAll() {
        try {
            for (let i = 0; i < process_container.length; i++) {
                const process = process_container[i]
                // 关闭进程之前先检测心跳状态
                const before = await ServerStatus(process.env.port)
                if (before.status) {
                    // 关闭进程
                    process.kill()
                }
            }
            return { code: 200, msg: `进程池冻结完毕` }
        } catch (error) {
            return { code: 500, msg: error.message }
        }
    }


    async process_init() {
        const res = await this.process_killAll()
        if (res.code === 200) {
            init()
            return { code: 200, msg: '进程池刷新完毕' }
        } else {
            return res
        }
    }


    async process_kill(body: { id: string }) {
        // 根据进程ID从进程池找出当前操作的进程
        const child = process_container.find((item) => item.project_id === body.id)
        if (!child) return { code: 500, msg: '未知错误，请重试或者联系管理员。' }
        // 关闭进程之前先检测心跳状态
        const before = await ServerStatus(child.env.port)
        // 心跳正常关闭进程，心跳异常将错误抛给前端
        if (before.status) {
            // 关闭进程
            child.kill()
            // 关闭进程之后在次检测心跳状态
            const after = await ServerStatus(child.env.port)
            if (after.status) {
                return { code: 500, msg: `端口【${child.env.port}】关闭失败，请检查服务器配置` }
            } else {
                return { code: 200, msg: `端口【${child.env.port}】关闭成功` }
            }
        } else {
            return { code: 500, msg: before.msg }
        }
    }

    async process_start(body: { id: string }) {
        const process = process_container.find((item) => item.project_id === body.id)
        if (!process) return { code: 500, msg: '进程池匹配失败，请刷新进程池后操作。' }
        // 启动进程之前先检测心跳状态
        const before = await ServerStatus(process.env.port)
        /* 
          心跳正常不需要启动进程，向前端抛错误警告。
          心跳异常说明进程没启动，将启动进程。
         */
        if (before.status) {
            return { code: 500, msg: `端口【${process.env.port}】运行正常，请勿重复启动！` }
        } else {
            await process.init()
            // 启动进程之后在次检测心跳状态
            const after = await ServerStatus(process.env.port)
            if (after.status) {
                return { code: 200, msg: `端口【${process.env.port}】启动成功` }
            } else {
                return { code: 500, msg: after.msg }
            }

        }
    }



    async upload(body: any) {
        try {
            fs.outputFileSync(path.join(PackConfig.history_file, body.id, `${uuid(8, 32)}.zip`), body.file.buffer)
            return { code: 200 }
        } catch (error) {
            return { code: 500, msg: error.message }
        }
    }


    async history_list(body: { id: string }) {
        const files = fs.readdirSync(path.join(PackConfig.history_file, body.id))
        let file_list = []
        for (let i = 0; i < files.length; i++) {
            const fileInfo: any = await CloudFileInfo(path.join(PackConfig.history_file, body.id, files[i]))
            file_list.push({
                key: files[i],
                size: fileInfo.size,
                fileName: files[i],
                date: fileInfo.birthtimeMs,
                dateText: dateFormat('YY-mm-dd HH:MM:SS', fileInfo.birthtimeMs)
            })
        }
        return { code: 200, data: file_list }
    }

    async history_remove(body: { id: string; file_key: string }) {
        const result = await FileRemove(path.join(PackConfig.history_file, body.id, body.file_key))
        return result
    }

    async injection(body: { id: string; file_key: string }) {
        try {
            const dist = path.join(PackConfig.static_resources, body.id, 'dist')
            fs.emptyDirSync(dist)
            const buffer = fs.readFileSync(path.join(PackConfig.history_file, body.id, body.file_key))
            return await decompress(buffer, dist)
        } catch (error) {
            return { code: 500, msg: error.message }
        }
    }





    async list() {
        // 静态资源目录
        const key_dirs = fs.readdirSync(path.join(PackConfig.site_pack, 'static_resources'))
        // 站点容器
        const projects = []
        // 进程池
        const process_container = get_process_container()
        try {
            // 遍历静态资源
            for (let i = 0; i < key_dirs.length; i++) {
                const config_path = path.join(PackConfig.site_pack, 'static_resources', key_dirs[i], 'config.json')
                if (!fs.existsSync(config_path)) continue;
                // 读取静态资源基础配置
                const config = fs.readJsonSync(config_path)
                // 根据静态资源key值，在进程池内寻找对应的进程。
                const process = process_container.find((item) => item.project_id === config.key)
                if (process) {
                    const before = await ServerStatus(process.env.port)
                    config.status = before.status ? '1' : '0'
                    config.process = process
                    config.dateText = dateFormat('YY-mm-dd HH:MM:SS', config.date as any)
                } else {
                    config.status = '0'
                }
                projects.push(config)
            }
            return { code: 200, data: projects }
        } catch (error) {
            return { code: 500, msg: error.message }
        }
    }
}
