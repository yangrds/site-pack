
import { post, get } from './http'
const address = 'http://127.0.0.1:7001'
/* 站点创建 */
export const project_create = (body?: any): any => post({ url: `${address}/project/create`, body })
export const project_list = (body?: any): any => post({ url: `${address}/project/list`, body })

export const process_start = (body?: any): any => post({ url: `${address}/project/process_start`, body })
export const process_kill = (body?: any): any => post({ url: `${address}/project/process-kill`, body })
export const process_init = (body?: any): any => post({ url: `${address}/project/process-init`, body })
export const process_kill_all = (body?: any): any => post({ url: `${address}/project/process-kill-all`, body })

export const history_list = (body?: any): any => post({ url: `${address}/project/history-list`, body })
export const history_remove = (body?: any): any => post({ url: `${address}/project/history-remove`, body })
export const injection = (body?: any): any => post({ url: `${address}/project/injection`, body })
export const login = (body?: any): any => post({ url: `${address}/project/login`, body })
export const UserInfo = (body?: any): any => post({ url: `${address}/project/user-info`, body })
export const UserUpdate = (body?: any): any => post({ url: `${address}/project/user-update`, body })



export const FileUpload = (body?: any, onUploadProgress?: any): any => post({ url: `${address}/project/upload`, body, onUploadProgress })