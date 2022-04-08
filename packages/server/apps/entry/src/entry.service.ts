import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as amqplib from 'amqplib';
import * as Redis from 'ioredis';

import * as dotenv from 'dotenv';
import * as path from 'path';
import { timeout } from 'rxjs/operators';
import createServer from 'next';
import { NextServer } from 'next/dist/server/next';

export type TcpPatternType = {
  exchange: string;
  routingKey: string;
  message: any;
  options?: amqplib.Options.Publish;
};

dotenv.config({ path: path.resolve(process.cwd(), '../../', '.env') });

const RedisConfig = {
  host: process.env.SOCKET_INSTANCE_REDIS_HOST,
  port: process.env.SOCKET_INSTANCE_REDIS_PORT,
  password: process.env.SOCKET_INSTANCE_REDIS_PASSWORD,
  database: process.env.SOCKET_INSTANCE_REDIS_DATABASE,
};

@Injectable()
export class AppService {
  // private client: ClientProxy;
  redisInstance;

  // @Inject('ENTRY_SERVICE')
  // entry: ClientProxy;
  private nextServer: NextServer;

  constructor(
    @Inject('MQ_SERVICE') private mqClient: ClientProxy, // MQ 服务
    @Inject('REDIS_SERVICE') private redisClient: ClientProxy, // redis 服务
    @Inject('AUTH_SERVICE') public authClient: ClientProxy, // auth 服务
    @Inject('MONGODB_SERVICE') public mongodbClient: ClientProxy, // mongodb 服务
  ) {
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
    this.redisInstance = new Redis(options);
  }

  // public getHello(): Promise<string> {
  //   return this.client.send<string, string>('getHello', 'Michael').toPromise();
  // }
  async onApplicationBootstrap() {
    // console.log('初始化');
    // await this.client.emit<any>('helloworld', '你好吗');
    // await this.client.connect();
  }
  async onModuleInit(): Promise<void> {
    // console.log(
    //   path.resolve(
    //     process.cwd(),
    //     '..',
    //     'd42paas-official',
    //     '...................',
    //   ),
    // );
    try {
      this.nextServer = createServer({
        // dev: this.configService.get<string>('NODE_ENV') !== 'production',
        dev: false,
        dir: path.resolve(process.cwd(), '..', 'd42paas-official'),
      });
      await this.nextServer.prepare();
    } catch (error) {
      console.error(error);
    }
  }

  handler(req: any, res: any) {
    return this.nextServer.getRequestHandler()(req, res);
  }

  emitMongoCMD(query: { cmd: string }, data?: any) {
    return this.mongodbClient.emit(query, { ...data, createTime: Date.now() });
  }

  sendMongoCMD(query: { cmd: string }, data?: any) {
    return this.mongodbClient.send(query, { ...data, createTime: Date.now() });
  }

  sendMqEvent(
    pattern,
    { exchange, routingKey, message, options }: TcpPatternType,
  ) {
    this.mqClient.emit<TcpPatternType>(pattern, {
      exchange,
      routingKey,
      message,
      options,
    });
  }

  sendMqMessage(
    pattern,
    { exchange, routingKey, message, options }: TcpPatternType,
  ) {
    return this.mqClient
      .send<TcpPatternType>(pattern, {
        exchange,
        routingKey,
        message,
        options,
      })
      .pipe(timeout(5000))
      .toPromise();
  }

  async getFile(arg) {
    this.redisClient.emit('getFile', arg);
  }

  async setFile(redisKey, value) {
    await this.redisInstance.set(redisKey, value);
    return true;
  }

  async setData(name, data) {
    await this.redisInstance.set(name, data);
  }

  // async sendAuth(name, data) {
  //   await this.authClient.emit(name, data);
  // }
}
