import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import PackConfig from './config'
import { init } from './plugin/start'
import * as path from 'path';

async function bootstrap() {
  PackConfig.init()
  PackConfig.keyInit()
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, '../', 'public'));
  app.enableCors();
  await app.listen(9871);
  init()
}
bootstrap();
