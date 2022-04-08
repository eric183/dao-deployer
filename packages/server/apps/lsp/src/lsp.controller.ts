import { Controller, Get } from '@nestjs/common';
import { SubscribeMessage } from '@nestjs/websockets';
import { LspService } from './lsp.service';

@Controller()
export class LspController {
  constructor(private readonly lspService: LspService) {}

  // @Get()
  // getHello(): string {
  //   return this.lspService.getHello();
  // }
  @SubscribeMessage('events')
  handleEvent() {
    console.log('hihihihi', '~~~~~~~~~');
    // await this.appService.authClient.emit('user/clean', {});
    // // const { playgroundId } = this.playgroundInfo;
    // this.users = [];
    // this.user = {};
    // this.operations = [];
    // this.revision = 0;
    // this.limit = 10;
    // this.clientIO;
    // this.docs = new Map();
    // this.redisClient = null;
    // this.userPayload = null;
    // this.testOperations = [];
    // this.testDoc = '';
    // this.crdts = new Map([]);
    // this.socketId = null;
    // this.callstack = [];
    // this.dockerInfo = null;
    // this.playgroundInfo = {};
    // this.fileTreeData = null;
    // this.server.emit('clearCache');
    // this.initPlayground(playgroundId);
  }
}
