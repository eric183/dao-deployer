import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import fetch from 'node-fetch';
import { AppGateway } from './entry.gateway';
import { AppService } from './entry.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Inject(AppGateway)
  appGate: AppGateway;

  @Inject(AppService)
  appService: AppService;

  @Get('/login')
  public async loginHome(@Req() req: Request, @Res() res: Response) {
    await this.appService.handler(req, res);
  }

  @Get('/dashboard/*')
  public async showHome(@Req() req: Request, @Res() res: Response) {
    await this.appService.handler(req, res);
  }

  @Get('/workship/*')
  public async workship(@Req() req: Request, @Res() res: Response) {
    await this.appService.handler(req, res);
  }

  @Get('/_next*')
  public async assets(@Req() req: Request, @Res() res: Response) {
    await this.appService.handler(req, res);
  }

  @Get('/favicon.ico')
  public async favicon(@Req() req: Request, @Res() res: Response) {
    await this.appService.handler(req, res);
  }

  @Get('/auth/github')
  async findAll(@Query() params) {
    const clientID = 'a1b78d72310581f840a5';
    const client_secret = '94940f420ddc15494cc088608590125a35ca89b7';
    const codeResponse = await (
      await fetch(
        `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${client_secret}&code=${params.code}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
    ).json();
    // console.log(
    //   `https://github.com/login/oauth/access_token?client_id=${clientID}&client_secret=${client_secret}&code=${params.code}`,
    // );
    console.log(codeResponse, 'gggggggggggggg');
    const response = await (
      await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${codeResponse.access_token}`,
          Accept: 'application/json',
        },
      })
    ).json();

    // async findAll(@Query() params) {
    // console.log(
    //   'get all replay sources ..........................22222222222',
    //   params,
    // );
    // const data = await this.appService.sendMongoCMD(
    //   {
    //     cmd: 'replaysources/findAll',
    //   },
    //   { query: params },
    // );
    // console.log(data);
    this.appGate.github0authLogin(response);
    return response;
  }

  @EventPattern('fromPlayground')
  async onApplicationBootstrap() {
    // console.log('初始化');
  }

  @EventPattern('getPlaygroundInfo')
  async getPlaygroundInfo(data): Promise<void> {
    this.appGate.setPlaygroundInfo({ ...data, isUserComing: false });
  }

  @MessagePattern('errorHandler')
  async errorHandler(data): Promise<void> {
    this.appGate.errorHandler({ ...data });
  }

  @MessagePattern('getEnvInfo')
  async getEnvInfo(data) {
    // this.appGate.switchDockerInfo({ ...data, isUserComing: false });
    this.appGate.getEnvInfo({ ...data, isUserComing: false });
  }
  @EventPattern('getDockerStatus')
  async getDockerStatus(data) {
    this.appGate.switchDockerStatus(data);
  }

  @MessagePattern('updateFileTree')
  async treeNode(data) {
    this.appGate.switchFileTreeData(data);
  }

  @MessagePattern('fileContentFromRedis')
  async fileContentFromRedis(data) {
    this.appService.getFile(data);
  }

  @MessagePattern('getRedisFile')
  async getFile(data) {
    //TO FIXED LOGIC
    this.appGate.sendFileContent(data);
  }

  @MessagePattern('getNixStatus')
  async getNixStatus(data) {
    this.appGate.getNixStatus(data);
  }

  @MessagePattern('getComponentsConfig')
  async getComponentsConfig(data) {
    this.appGate.getComponentsConfig(data);
  }

  @MessagePattern('getTerminalContent')
  async getTerminalContent(data) {
    this.appGate.getTerminalContent(data);
  }

  @MessagePattern('getConsoleContent')
  async getConsoleContent(data) {
    this.appGate.getConsoleContent(data);
  }
}
