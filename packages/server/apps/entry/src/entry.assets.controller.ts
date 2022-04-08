import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { query, Response } from 'express';

import {
  ClientProxy,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import toTrace from 'helper/collections/toTrace';
import { Observable } from 'rxjs';
import { AppGateway } from './entry.gateway';
import { AppService } from './entry.service';
// import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker';
// import editorWorker from 'monaco-editor/min/vs/editor/editor.main';
// import fetch from 'node-fetch';
import * as path from 'path';
import * as fs from 'fs';

@Controller('/api/replaylist')
export class AssetsController {
  // constructor() {}
  private readonly logger = new Logger(AssetsController.name);

  @Inject(AppGateway)
  appGate: AppGateway;

  @Inject(AppService)
  appService: AppService;

  // @Get()
  async onApplicationBootstrap() {
    // console.log(editorWorker);
    // console.log(process.cwd(), '..........................');
    // path.join(
    //   process.cwd(),
    //   '../..',
    //   process.env.ENV_NODE === 'production' ? '.env.production' : '.env',
    // ),
    // fetch().then((d) => {
    //   console.log(d);
    // });
  }
  // Init() {
  //   console.log('init');
  // }
  // @Get()
  // findAl1l() {
  //   console.log(
  //     'get all replay sources ..........................1111111111111111',
  //   );
  //   return this.appService.emitMongoCMD({ cmd: 'replaysources/findAll' });
  // }

  // async findAll(@Param() params) {
  @Get()
  async findAll(@Query() params) {
    // console.log(
    //   'get all replay sources ..........................22222222222',
    //   params,
    // );
    const data = await this.appService.sendMongoCMD(
      {
        cmd: 'replaysources/findAll',
      },
      { query: params },
    );
    console.log(data);
    return data;
  }
}
