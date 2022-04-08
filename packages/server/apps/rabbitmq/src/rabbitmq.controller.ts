import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Controller, Get, Inject, Injectable } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import toTrace from 'helper/collections/toTrace';
// import toJSON from 'helper/collections/toJSON';
// import { TcpPatternType } from 'apps/entry/src/entry.service';
import { RabbitmqService } from './rabbitmq.service';

@Controller()
export class RabbitmqController {
  @Inject(RabbitmqService)
  rabbitmqService: RabbitmqService;

  @MessagePattern('playgroundInfo')
  handlePlaygroundInfoEvt(data) {
    // console.log(data, '...........handlePlaygroundInfoEvt');
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('active')
  handleActivePlaygroundEvt(data) {
    // console.log(data, 'aaaaaaaaaaaaaaaaaa');
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('run')
  handleRunDockerEvt(data) {
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('stop')
  handleStopDockerEvt(data) {
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('fetchFile')
  getFile(data) {
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('uploadFile')
  uploadFile(data) {
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('fileTreeOp')
  fileTreeOp(data) {
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('terminal')
  handleTerminalEvt(data) {
    this.rabbitmqService.publish(data);
  }

  @MessagePattern('console')
  handleConsoleEvt(data) {
    this.rabbitmqService.publish(data);
  }
  // @MessagePattern('playgroundInfo')
  // async handlePlaygroundInfoMsg(data: TcpPatternType) {
  //   console.log(data);
  //   return await this.rabbitmqService.publish(data);
  // }
}
