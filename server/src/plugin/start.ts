import * as fs from 'fs-extra';
import * as path from 'path';
import ServeAdmin from './WebServeAdmin';
import { ServeParameter } from '../interface';
import { uuid } from '../utils/index';
import PackConfig from '../config'
import { JudgePort } from 'src/utils/port';
import { Heartbeat } from './ServerHeartbeat';
import { Server, Socket } from 'socket.io';

export const process_container = [];


export function get_process_container() {
  return JSON.parse(JSON.stringify(process_container))
}

export async function start(config: ServeParameter) {
  const sub_process = new ServeAdmin();
  await sub_process.refresh(config)
  process_container.push(sub_process)
}

export async function init() {
  // 清空进程池[同步]
  process_container.splice(0, process_container.length)
  // 读取静态资源目录[同步]
  const dirs = fs.readdirSync(path.join(PackConfig.site_pack, 'static_resources'));
  //  遍历部署项目静态资源
  for (let i = 0; i < dirs.length; i++) {
    let id = dirs[i]
    // 工作目录[同步]
    const key_path = path.join(PackConfig.static_resources, id);
    // 静态资源目录[同步]
    const dist_path = path.join(key_path, 'dist');

    // 资源目录不存在则创建[同步]
    if (!fs.existsSync(dist_path)) fs.ensureDirSync(dist_path)

    // 配置文件地址[同步]
    const config_path = path.join(key_path, 'config.json');

    // 检测配置文件是否存在[同步]
    if (!fs.existsSync(config_path)) {
      continue;
    }
    // 从配置文件读取配置信息[同步]
    const config_json = JSON.parse(fs.readFileSync(config_path).toString());
    // 对指定端口进行心跳检测（只有本系统启用的端口，才有心跳接口。）[同步]
    const Site = await Heartbeat(config_json.port)
    // 初始端口检测
    let isPort: { port: string; status: boolean; }
    if (!Site.status) {
      /* 
      心跳检测不通过，表面没有进程占用端口
      JudgePort方法是对整个操作系统检测端口是否有被其他程序占用[同步]
      */
      isPort = await JudgePort(config_json.port)
      // 端口被系统里其他程序占用
      if (!isPort.status) {
        console.log('\x1B[31m%s\x1B[31m', `进程【${config_json.key}】启动失败，${config_json.port}端口被占用！`);
      }
    }


    /* 
      以下参数需要注入到NodeJs衍生进程内（process），官方规范凡是注入到进程内参数全都被重置为string类型。
      所以isPort不能直接传递Boolean类型
    */
    await start({
      id: uuid(16, 32),
      project_id: config_json.key,
      port: config_json.port,
      dist: dist_path,
      name: config_json.name,
      project: config_json.name,
      isPort: isPort.status ? '1' : '0'
    });
  }


}
