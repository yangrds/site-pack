import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { UserMiddleware } from './middleware/user.middleware'

@Module({
  imports: [ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware)
      .exclude({ path: '/project/login', method: RequestMethod.ALL })
      .forRoutes('project')
  }

}
