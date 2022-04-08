import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import * as Redis from 'ioredis';

import * as dotenv from 'dotenv';
import * as path from 'path';
import toTrace from 'helper/collections/toTrace';

dotenv.config({ path: path.resolve(process.cwd(), '../../', '.env') });

const RedisConfig = {
  host: process.env.SOCKET_INSTANCE_REDIS_HOST,
  port: process.env.SOCKET_INSTANCE_REDIS_PORT,
  password: process.env.SOCKET_INSTANCE_REDIS_PASSWORD,
  database: process.env.SOCKET_INSTANCE_REDIS_DATABASE,
};

@Injectable()
export class RedisSourceService {
  redisClient;

  @Inject('ENTRY_SERVICE')
  entry: ClientProxy;
  constructor() {
    const options = {
      host: RedisConfig.host,
      port: RedisConfig.port as unknown as number,
      password: RedisConfig.password,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      db: Number(RedisConfig.database),
    };
    // console.log(options)
    this.redisClient = new Redis(options);
  }
  async onApplicationBootstrap() {
    // console.log(this.redisClient, 'redis instance');
    // setTimeout(() => {

    // this.getFile('playground:active:330455592856453120');

    this.redisClient.on('connect', () => {
      console.log('redis连接');
    });
    // }, 1000);
  }

  async setData(name, data) {
    if (!name) throw '请传入keyName';
    await this.redisClient.set(`nodeStack:${name}`, data);
    console.log('done!');
  }

  async getFile(arg) {
    // toTrace(arg);
    const file = await this.redisClient.get(arg.redisKey);
    arg.value = file;
    this.entry.emit('getRedisFile', arg);
  }
}
