import { Controller, Post, Body, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectService } from './project.service'
import { Response, Request } from 'express';

export interface _File {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer
    size: number
}


@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }
    @Post('create')
    create(@Body() body: { name: string; port: string; remark: string }) {
        return this.projectService.create(body)
    }
    @Post('process-kill')
    ProcessKill(@Body() body: { id: string }) {
        return this.projectService.process_kill(body)
    }

    @Post('process-kill-all')
    ProcessKillAll() {
        return this.projectService.process_killAll()
    }

    @Post('process-init')
    ProcessInit() {
        return this.projectService.process_init()
    }

    @Post('process_start')
    ProcessStart(@Body() body: { id: string }) {
        return this.projectService.process_start(body)
    }
    @Post('list')
    list() {
        return this.projectService.list()
    }

    @Post('history-list')
    historyList(@Body() body: { id: string }) {
        return this.projectService.history_list(body)
    }
    @Post('history-remove')
    historyFile(@Body() body: { id: string; file_key: string }) {
        return this.projectService.history_remove(body)
    }

    @Post('injection')
    injection(@Body() body: { id: string; file_key: string }) {
        return this.projectService.injection(body)
    }

    @Post('login')
    login(@Body() body: { account: string; password: string; }) {
        return this.projectService.Login(body)
    }


    @Post('user-update')
    async UserUpdate(@Req() req: Request, @Body() body: { account: string; password: string; name: string; token: string }) {
        body.token = req.headers.token as any
        return this.projectService.UserUpdate(body)
    }

    @Post('user-info')
    async UserInfo(@Req() req: Request) {
        return this.projectService.UserInfo(req.headers.token as string)
    }





    @Post('upload')
    @UseInterceptors(FileInterceptor("file"))
    upload(@UploadedFile() file: _File, @Body() body) {
        body.file = file
        return this.projectService.upload(body)
    }
}
