import * as fs from 'fs-extra';
import * as path from 'path';
import ServeAdmin from './WebServeAdmin';
import { ServeParameter } from '../interface';
import { uuid } from '../utils/index';
import PackConfig from '../config'

export const process_container = [];


export function get_process_container() {
  return JSON.parse(JSON.stringify(process_container))
}

export function start(config: ServeParameter) {
  const sub_process = new ServeAdmin(config);
  process_container.push(sub_process)
}

export function init() {
  process_container.splice(0, process_container.length)


  const static_resources = path.join(PackConfig.site_pack, 'static_resources')

  // 读取静态资源目录
  const dirs = fs.readdirSync(path.join(PackConfig.site_pack, 'static_resources'));

  /*
  dirs环境目录，DEV/TEST/UAT/PROD
  遍历部署项目静态资源
   */
  dirs.forEach((id: string) => {


    // 工作目录
    const key_path = path.join(static_resources, id);

    // 静态资源目录
    const dist_path = path.join(key_path, 'dist');

    // 资源目录不存在则创建
    if (!fs.existsSync(dist_path)) fs.ensureDirSync(dist_path)

    // 配置文件地址
    const config_path = path.join(key_path, 'config.json');

    // 检测配置文件是否存在
    if (!fs.existsSync(config_path)) {
      return;
    }
    // 从配置文件读取配置信息
    const config_json = JSON.parse(fs.readFileSync(config_path).toString());

    // 启动服务
    start({
      id: uuid(16, 32),
      project_id: config_json.key,
      port: config_json.port,
      dist: dist_path,
      name: config_json.name,
      project: config_json.name,
    });
  });
}
