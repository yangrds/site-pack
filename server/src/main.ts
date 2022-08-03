import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import PackConfig from './config'
import {init} from './plugin/start'

async function bootstrap() {
  PackConfig.init()
  PackConfig.keyInit()
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(7001);
  init()
}
bootstrap();
