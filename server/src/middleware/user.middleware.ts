import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { decrypt } from 'src/utils/verify';
import PackConfig from '../config'
import * as fs from 'fs-extra';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let headers: any = req.headers
    try {
      // 令牌（token）私钥解密
      let token: {
        account: string;
        password: string;
        valid: number;
        date: number
      } = JSON.parse(decrypt(headers.token))

      // 登录时间超过登录时指定的有效时长（默认一天），令牌失效
      if ((Math.round(new Date() as any) - token.date) > token.valid) {
        res.status(200).send({ code: 304, msg: '无效的令牌' })
        return
      }

      // 用户数据数据查询
      const users = fs.readJsonSync(PackConfig.user_path)
      const user = users.find((item) => item.account === token.account)
      // 数据查询失败
      if (!user || user.password != token.password) {
        res.status(200).send({ code: 304, msg: '无效的令牌' })
        return
      }
      next()
    } catch (error) {
      // 解密过程中出现未知错误
      res.status(200).send({ code: 304, msg: '无效的令牌' })
    }
  }
}
