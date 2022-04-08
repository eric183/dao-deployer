import { Controller, Get, Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import toTrace from 'helper/collections/toTrace';
import { RedisSourceService } from './redis-source.service';

// @Injectable()
@Controller()
export class RedisSourceController {
  constructor(private readonly redisSourceService: RedisSourceService) {}
  // @Get()
  // getHello(): string {
  //   return this.redisSourceService.getHello();
  // }

  @EventPattern('getFile')
  async getFile(arg) {
    // toTrace('waitToGetRedisFile', arg);
    this.redisSourceService.getFile(arg);
  }
  @EventPattern('setData')
  async setData(name, data) {
    // console.log('setttttttttttt', name);
    // toTrace('waitToGetRedisFile', data);
    this.redisSourceService.setData(name, data);
  }
}
